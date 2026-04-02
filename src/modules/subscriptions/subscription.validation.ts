import { z } from "zod";
import { SubscriptionStatus } from "../../../generated/prisma/enums";

export const createSubscriptionSchema = z.object({
  planId: z.string().min(1),
  studentId: z.string().min(1)
});

export const createTrialSubscriptionSchema = z.object({
  planId: z.string().min(1),
  studentId: z.string().min(1),
});

export const changeSubscriptionStatusSchema = z.object({
  status: z.nativeEnum(SubscriptionStatus),
});