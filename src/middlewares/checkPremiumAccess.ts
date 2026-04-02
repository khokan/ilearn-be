import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { PaymentStatus, Role, SubscriptionStatus } from "../../generated/prisma/enums";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";

export const checkPremiumAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
    }

    // Admins are not gated by student subscription checks.
    if (req.user.role === Role.ADMIN || req.user.role === Role.SUPER_ADMIN) {
      return next();
    }

    const student = await prisma.student.findUnique({
      where: {
        email: req.user.email,
      },
    });

    if (!student) {
      throw new AppError(status.NOT_FOUND, "Student not found");
    }

    const now = new Date();

    const activePaidSubscription = await prisma.subscription.findFirst({
      where: {
        studentId: student.id,
        AND: [
          {
            OR: [
              {
                status: SubscriptionStatus.ACTIVE,
                paymentStatus: PaymentStatus.PAID,
              },
              {
                status: SubscriptionStatus.TRIAL,
              },
            ],
          },
          {
            OR: [
              {
                startDate: null,
              },
              {
                startDate: {
                  lte: now,
                },
              },
            ],
          },
          {
            OR: [
              {
                endDate: null,
              },
              {
                endDate: {
                  gte: now,
                },
              },
            ],
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!activePaidSubscription) {
      throw new AppError(
        status.FORBIDDEN,
        "Premium access requires an active paid subscription"
      );
    }

    return next();
  } catch (error) {
    return next(error);
  }
};