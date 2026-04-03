import { Router, type IRouter } from "express";
import { eq, sql, inArray } from "drizzle-orm";
import { db, matchesTable, questionsTable, usersTable, answersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  CreateMatchBody,
  GetMatchParams,
  SubmitAnswerParams,
  SubmitAnswerBody,
  FinishMatchParams,
  FinishMatchBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/matches", requireAuth, async (req, res): Promise<void> => {
  const matches = await db
    .select()
    .from(matchesTable)
    .where(eq(matchesTable.userId, req.userId!))
    .orderBy(sql`${matchesTable.createdAt} DESC`)
    .limit(20);

  res.json(matches.map(m => ({
    id: m.id,
    category: m.category,
    status: m.status,
    score: m.score,
    totalQuestions: m.totalQuestions,
    correctAnswers: m.correctAnswers,
    createdAt: m.createdAt.toISOString(),
  })));
});

router.post("/matches", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateMatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, questionCount } = parsed.data;

  let questionsQuery = db
    .select()
    .from(questionsTable)
    .orderBy(sql`RANDOM()`)
    .limit(questionCount);

  if (category) {
    questionsQuery = questionsQuery.where(eq(questionsTable.category, category)) as typeof questionsQuery;
  }

  const questions = await questionsQuery;

  if (questions.length === 0) {
    res.status(400).json({ error: "No questions available for this category" });
    return;
  }

  const [match] = await db.insert(matchesTable).values({
    userId: req.userId!,
    category: category ?? null,
    status: "active",
    currentQuestionIndex: 0,
    score: 0,
    correctAnswers: 0,
    totalQuestions: questions.length,
    questionIds: questions.map(q => q.id),
  }).returning();

  res.status(201).json({
    id: match.id,
    userId: match.userId,
    category: match.category,
    status: match.status,
    currentQuestionIndex: match.currentQuestionIndex,
    score: match.score,
    questions: questions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty,
      timeLimit: q.timeLimit,
    })),
    createdAt: match.createdAt.toISOString(),
  });
});

router.get("/matches/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetMatchParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [match] = await db.select().from(matchesTable).where(eq(matchesTable.id, params.data.id));
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  const questions = match.questionIds.length > 0
    ? await db.select().from(questionsTable).where(inArray(questionsTable.id, match.questionIds))
    : [];

  const orderedQuestions = match.questionIds.map(id => questions.find(q => q.id === id)).filter(Boolean);

  res.json({
    id: match.id,
    userId: match.userId,
    category: match.category,
    status: match.status,
    currentQuestionIndex: match.currentQuestionIndex,
    score: match.score,
    questions: orderedQuestions.map(q => ({
      id: q!.id,
      text: q!.text,
      options: q!.options,
      category: q!.category,
      difficulty: q!.difficulty,
      timeLimit: q!.timeLimit,
    })),
    createdAt: match.createdAt.toISOString(),
  });
});

router.post("/matches/:id/submit", requireAuth, async (req, res): Promise<void> => {
  const params = SubmitAnswerParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = SubmitAnswerBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [match] = await db.select().from(matchesTable).where(eq(matchesTable.id, params.data.id));
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  const [question] = await db.select().from(questionsTable).where(eq(questionsTable.id, body.data.questionId));
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  const correct = question.correctOption === body.data.selectedOption;

  const timeBonus = Math.max(0, question.timeLimit - body.data.timeSpent);
  const basePoints = correct ? 100 : 0;
  const speedBonus = correct ? Math.floor(timeBonus * 3) : 0;
  const difficultyMultiplier = question.difficulty === "hard" ? 1.5 : question.difficulty === "easy" ? 0.8 : 1.0;
  const pointsEarned = Math.round((basePoints + speedBonus) * difficultyMultiplier);

  await db.insert(answersTable).values({
    matchId: params.data.id,
    userId: req.userId!,
    questionId: body.data.questionId,
    selectedOption: body.data.selectedOption,
    correct,
    pointsEarned,
    timeSpent: body.data.timeSpent,
  });

  await db
    .update(matchesTable)
    .set({
      score: match.score + pointsEarned,
      correctAnswers: match.correctAnswers + (correct ? 1 : 0),
      currentQuestionIndex: match.currentQuestionIndex + 1,
    })
    .where(eq(matchesTable.id, params.data.id));

  res.json({
    correct,
    correctOption: question.correctOption,
    pointsEarned,
    explanation: question.explanation ?? null,
  });
});

router.post("/matches/:id/finish", requireAuth, async (req, res): Promise<void> => {
  const params = FinishMatchParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = FinishMatchBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [match] = await db.select().from(matchesTable).where(eq(matchesTable.id, params.data.id));
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  await db
    .update(matchesTable)
    .set({
      status: "finished",
      score: body.data.score,
      correctAnswers: body.data.correctAnswers,
      finishedAt: new Date(),
    })
    .where(eq(matchesTable.id, params.data.id));

  const accuracy = body.data.totalQuestions > 0
    ? body.data.correctAnswers / body.data.totalQuestions
    : 0;

  const coinsEarned = Math.floor(body.data.score / 10) + Math.floor(accuracy * 20);
  const ratingChange = accuracy >= 0.8 ? 25 : accuracy >= 0.5 ? 10 : -5;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const newTotalScore = user.totalScore + body.data.score;
  const newSkillRating = Math.max(0, user.skillRating + ratingChange);
  const newCoins = user.coins + coinsEarned;

  await db
    .update(usersTable)
    .set({
      totalScore: newTotalScore,
      skillRating: newSkillRating,
      coins: newCoins,
    })
    .where(eq(usersTable.id, req.userId!));

  res.json({
    matchId: params.data.id,
    finalScore: body.data.score,
    correctAnswers: body.data.correctAnswers,
    totalQuestions: body.data.totalQuestions,
    coinsEarned,
    ratingChange,
    newTotalScore,
    newSkillRating,
  });
});

export default router;
