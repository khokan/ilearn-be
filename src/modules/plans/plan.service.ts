import { prisma } from "../../lib/prisma";

export const PlanService = {
  async createPlan(payload: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    currency: string;
    interval: "DAILY" | "MONTHLY" | "YEARLY" | "LIFETIME";
  }) {
    return prisma.plan.create({
      data: payload
    });
  },

  async getPlans() {
    return prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
  }
};