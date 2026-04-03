import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import questionsRouter from "./questions";
import matchesRouter from "./matches";
import leaderboardRouter from "./leaderboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(questionsRouter);
router.use(matchesRouter);
router.use(leaderboardRouter);

export default router;
