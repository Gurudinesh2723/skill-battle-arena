import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  options: text("options").array().notNull(),
  correctOption: integer("correct_option").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
  timeLimit: integer("time_limit").notNull().default(20),
  explanation: text("explanation"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({ id: true, createdAt: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsTable.$inferSelect;
