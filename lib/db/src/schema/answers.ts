import { pgTable, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const answersTable = pgTable("answers", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  userId: integer("user_id").notNull(),
  questionId: integer("question_id").notNull(),
  selectedOption: integer("selected_option").notNull(),
  correct: boolean("correct").notNull(),
  pointsEarned: integer("points_earned").notNull().default(0),
  timeSpent: integer("time_spent").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnswerSchema = createInsertSchema(answersTable).omit({ id: true, createdAt: true });
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type Answer = typeof answersTable.$inferSelect;
