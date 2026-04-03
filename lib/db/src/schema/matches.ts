import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const matchesTable = pgTable("matches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category"),
  status: text("status").notNull().default("active"),
  currentQuestionIndex: integer("current_question_index").notNull().default(0),
  score: integer("score").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(0),
  questionIds: integer("question_ids").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

export const insertMatchSchema = createInsertSchema(matchesTable).omit({ id: true, createdAt: true, finishedAt: true });
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matchesTable.$inferSelect;
