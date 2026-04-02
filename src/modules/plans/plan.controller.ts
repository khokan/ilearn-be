import { Request, Response } from "express";
// import { StatusCodes } from "http-status-codes";
// import { asyncHandler } from "../../lib/async-handler";
// import { sendResponse } from "../../lib/send-response";
import { PlanService } from "./plan.service";
import { sendResponse } from "../../shared/sendResponse";
import { catchAsync } from "../../shared/catchAsync";
import status from "http-status";

const createPlan = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanService.createPlan(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Plan created successfully",
    data: result
  });
});

const getPlans = catchAsync(async (_req: Request, res: Response) => {
  const result = await PlanService.getPlans();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Plans retrieved successfully",
    data: result
  });
});

export const PlanController = {
  createPlan,
  getPlans
};