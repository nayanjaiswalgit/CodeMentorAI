import { pgTable, text, serial, integer, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  skillLevel: text("skill_level").notNull().default("beginner"),
  preferences: jsonb("preferences"),
  streak: integer("streak").notNull().default(0),
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  streak: true,
  lastActivity: true,
  createdAt: true,
});

// Courses model
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  language: text("language").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  imageUrl: text("image_url"),
  estimatedHours: integer("estimated_hours"),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
});

// Lessons model
// Extended lesson schema to support MDX, code, examples, and tests
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // MDX content
  order: integer("order").notNull(),
  estimatedMinutes: integer("estimated_minutes"),
  // New fields for code, examples, and tests per lesson/module
  codeExamples: jsonb("code_examples"), // [{language, code, explanation}]
  tests: jsonb("tests"), // [{question, options, correctAnswer, code, explanation}]
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
});

// Challenges model
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  language: text("language").notNull(),
  difficulty: text("difficulty").notNull(),
  category: text("category").notNull(),
  initialCode: text("initial_code"),
  expectedOutput: text("expected_output"),
  testCases: jsonb("test_cases"),
  estimatedMinutes: integer("estimated_minutes"),
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
});

// MCQs model
export const mcqs = pgTable("mcqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation"),
  language: text("language"),
  category: text("category"),
  difficulty: text("difficulty").notNull(),
});

export const insertMcqSchema = createInsertSchema(mcqs).omit({
  id: true,
});

// Learning paths model
export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  courses: jsonb("courses").notNull(),
  challenges: jsonb("challenges"),
  estimatedHours: integer("estimated_hours"),
  imageIcon: text("image_icon"),
});

export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({
  id: true,
});

// User progress model
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id"),
  lessonId: integer("lesson_id"),
  challengeId: integer("challenge_id"),
  mcqId: integer("mcq_id"),
  completed: boolean("completed").notNull().default(false),
  score: integer("score"),
  codeSubmission: text("code_submission"),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
}, (table) => {
  return {
    userIdx: index("user_progress_user_id_idx").on(table.userId),
  };
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  attemptedAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type Mcq = typeof mcqs.$inferSelect;
export type InsertMcq = z.infer<typeof insertMcqSchema>;

export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
