import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AiLearnService } from "./ailearn.service";

const generateQuestions = catchAsync(async (req: Request, res: Response) => {
  const result = await AiLearnService.generateQuestions(req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Questions generated successfully",
    data: result,
  });
});

const generateStudyPath = catchAsync(async (req: Request, res: Response) => {
  const result = await AiLearnService.generateStudyPath(req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Study path generated successfully",
    data: result,
  });
});

export const AiLearnController = {
  generateQuestions,
  generateStudyPath,
};
