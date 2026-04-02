import { Router } from "express";
import { AiLearnController } from "./ailearn.controller";
import {
  generateQuestionsSchema,
  generateStudyPathSchema,
} from "./ailearn.validation";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router();

router.post(
  "/questions/generate",
  validateRequest(generateQuestionsSchema),
  AiLearnController.generateQuestions
);

router.post(
  "/study-path/generate",
  validateRequest(generateStudyPathSchema),
  AiLearnController.generateStudyPath
);

export const aiLearnRoutes: Router = router;
