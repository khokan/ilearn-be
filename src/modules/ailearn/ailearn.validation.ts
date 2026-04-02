import { z } from "zod";

export const generateQuestionsSchema = z.object({
  topic: z.string().trim().min(3),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  gradeLevel: z.string().trim().min(2).default("High School"),
  numberOfQuestions: z.number().int().min(1).max(10).default(5),
});

export const generateStudyPathSchema = z.object({
  objective: z.string().trim().min(8),
});
