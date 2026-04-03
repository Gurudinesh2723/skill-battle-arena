import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, questionsTable } from "@workspace/db";
import { ListQuestionsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/questions", async (req, res): Promise<void> => {
  const params = ListQuestionsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const limit = params.data.limit ?? 10;
  let query = db.select({
    id: questionsTable.id,
    text: questionsTable.text,
    options: questionsTable.options,
    category: questionsTable.category,
    difficulty: questionsTable.difficulty,
    timeLimit: questionsTable.timeLimit,
  }).from(questionsTable);

  if (params.data.category) {
    query = query.where(eq(questionsTable.category, params.data.category)) as typeof query;
  }

  const questions = await query.orderBy(sql`RANDOM()`).limit(limit);
  res.json(questions);
});

router.get("/questions/categories", async (_req, res): Promise<void> => {
  const categories = await db
    .selectDistinct({ category: questionsTable.category })
    .from(questionsTable);

  const categoryIcons: Record<string, string> = {
    "Science": "🔬",
    "History": "📜",
    "Geography": "🌍",
    "Sports": "⚽",
    "Entertainment": "🎬",
    "Technology": "💻",
    "Math": "🔢",
    "Literature": "📚",
    "General Knowledge": "🧠",
  };

  const counts = await db
    .select({ category: questionsTable.category, count: sql<number>`count(*)::int` })
    .from(questionsTable)
    .groupBy(questionsTable.category);

  const countMap = Object.fromEntries(counts.map(c => [c.category, c.count]));

  res.json(categories.map(c => ({
    name: c.category,
    questionCount: countMap[c.category] ?? 0,
    icon: categoryIcons[c.category] ?? "❓",
  })));
});

export default router;
