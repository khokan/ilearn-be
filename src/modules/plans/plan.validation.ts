import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  currency: z.string().default("USD"),
  interval: z.enum(["DAILY","MONTHLY", "YEARLY", "LIFETIME"])
});