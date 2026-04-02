import { v4 as uuidv4 } from "uuid";
import {
  generateQuizQuestions,
  studyPathGenerator,
  type GenerateQuizQuestionsInput,
  type StudyPathGeneratorInput,
} from "./genkit";

export const AiLearnService = {
  async generateQuestions(payload: GenerateQuizQuestionsInput) {
    const examSessionId = uuidv4();
    const questions = await generateQuizQuestions(payload);

    return {
      examSessionId,
      topic: payload.topic,
      difficulty: payload.difficulty,
      gradeLevel: payload.gradeLevel ?? "High School",
      numberOfQuestions: payload.numberOfQuestions ?? 5,
      questions,
    };
  },

  async generateStudyPath(payload: StudyPathGeneratorInput) {
    return studyPathGenerator(payload);
  },
};
