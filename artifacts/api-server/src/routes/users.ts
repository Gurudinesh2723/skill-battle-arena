import { Router, type IRouter } from "express";
import { eq, count, avg, max, sum } from "drizzle-orm";
import { db, usersTable, matchesTable, answersTable } from "@workspace/db";
import { GetUserByIdParams, GetUserStatsParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserByIdParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const matchStats = await db
    .select({ count: count(), wins: count() })
    .from(matchesTable)
    .where(eq(matchesTable.userId, params.data.id));

  const totalMatches = matchStats[0]?.count ?? 0;
  const wins = await db
    .select({ count: count() })
    .from(matchesTable)
    .where(eq(matchesTable.userId, params.data.id));

  res.json({
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    totalScore: user.totalScore,
    skillRating: user.skillRating,
    coins: user.coins,
    matchesPlayed: totalMatches,
    wins: 0,
    createdAt: user.createdAt.toISOString(),
  });
});

router.get("/users/:id/stats", async (req, res): Promise<void> => {
  const params = GetUserStatsParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = params.data.id;

  const [matchAgg] = await db
    .select({ totalMatches: count() })
    .from(matchesTable)
    .where(eq(matchesTable.userId, userId));

  const [answerAgg] = await db
    .select({
      total: count(),
      correct: sum(answersTable.correct.mapWith(Number)),
      totalPoints: sum(answersTable.pointsEarned),
    })
    .from(answersTable)
    .where(eq(answersTable.userId, userId));

  const totalMatches = matchAgg?.totalMatches ?? 0;
  const totalAnswered = Number(answerAgg?.total ?? 0);
  const correctAnswers = Number(answerAgg?.correct ?? 0);

  const matchScores = await db
    .select({ score: matchesTable.score })
    .from(matchesTable)
    .where(eq(matchesTable.userId, userId));

  const scores = matchScores.map(m => m.score);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  res.json({
    userId,
    totalMatches,
    wins: 0,
    losses: totalMatches,
    avgScore: Math.round(avgScore * 10) / 10,
    bestScore,
    totalQuestionsAnswered: totalAnswered,
    correctAnswers,
    accuracyPercent: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100 * 10) / 10 : 0,
    favoriteCategory: null,
  });
});

export default router;
