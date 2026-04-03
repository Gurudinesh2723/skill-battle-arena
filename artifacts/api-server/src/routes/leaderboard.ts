import { Router, type IRouter } from "express";
import { eq, sql, desc, count } from "drizzle-orm";
import { db, usersTable, matchesTable } from "@workspace/db";
import { GetLeaderboardQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/leaderboard", async (req, res): Promise<void> => {
  const params = GetLeaderboardQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const limit = params.data.limit ?? 50;

  const users = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      avatarUrl: usersTable.avatarUrl,
      totalScore: usersTable.totalScore,
      skillRating: usersTable.skillRating,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.totalScore))
    .limit(limit);

  const matchCounts = await db
    .select({
      userId: matchesTable.userId,
      matchesPlayed: count(),
    })
    .from(matchesTable)
    .groupBy(matchesTable.userId);

  const matchMap = Object.fromEntries(matchCounts.map(m => [m.userId, m.matchesPlayed]));

  res.json(users.map((u, idx) => ({
    rank: idx + 1,
    userId: u.id,
    username: u.username,
    avatarUrl: u.avatarUrl ?? null,
    totalScore: u.totalScore,
    skillRating: u.skillRating,
    wins: 0,
    matchesPlayed: matchMap[u.id] ?? 0,
  })));
});

router.get("/leaderboard/summary", async (_req, res): Promise<void> => {
  const [stats] = await db
    .select({
      totalPlayers: count(),
      topScore: sql<number>`MAX(${usersTable.totalScore})::int`,
      avgScore: sql<number>`AVG(${usersTable.totalScore})::float`,
    })
    .from(usersTable);

  const [matchStats] = await db
    .select({ totalMatchesPlayed: count() })
    .from(matchesTable);

  res.json({
    totalPlayers: stats?.totalPlayers ?? 0,
    topScore: stats?.topScore ?? 0,
    avgScore: Math.round((stats?.avgScore ?? 0) * 10) / 10,
    totalMatchesPlayed: matchStats?.totalMatchesPlayed ?? 0,
  });
});

export default router;
