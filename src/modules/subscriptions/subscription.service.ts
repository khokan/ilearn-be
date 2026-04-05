import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";

let stripeClient: Stripe | null = null;

// Returns a memoized Stripe client instance for payment session creation.
const getStripeClient = () => {
  if (stripeClient) return stripeClient;

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables.");
  }

  stripeClient = new Stripe(secret);
  return stripeClient;
};

// Calculates the end date from a start date and billing interval.
const calculateEndDateFromStart = (
  startDate: Date,
  interval: "DAILY" | "MONTHLY" | "YEARLY" | "LIFETIME"
) => {
  if (interval === "LIFETIME") return null;

  const endDate = new Date(startDate);

  if (interval === "DAILY") {
    endDate.setDate(endDate.getDate() + 1);
  } else if (interval === "MONTHLY") {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (interval === "YEARLY") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  return endDate;
};

// Resolves the effective end date for an active subscription.
const getEffectiveEndDate = (subscription: {
  startDate: Date | null;
  endDate: Date | null;
  plan: { interval: "DAILY" | "MONTHLY" | "YEARLY" | "LIFETIME" } | null;
}) => {
  if (subscription.endDate) return subscription.endDate;
  if (!subscription.startDate || !subscription.plan) return null;

  return calculateEndDateFromStart(subscription.startDate, subscription.plan.interval);
};

// Marks subscriptions as expired once their effective end date has passed.
const expireDueSubscriptions = async (studentId?: string) => {
  const activeSubscriptions = await prisma.subscription.findMany({
    where: {
      status: {
        in: ["ACTIVE", "PENDING", "TRIAL"],
      },
      ...(studentId ? { studentId } : {}),
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      plan: {
        select: {
          interval: true,
        },
      },
    },
  });

  const now = new Date();
  const expiredIds = activeSubscriptions
    .filter((subscription) => {
      const effectiveEndDate = getEffectiveEndDate(subscription);
      return effectiveEndDate ? now > effectiveEndDate : false;
    })
    .map((subscription) => subscription.id);

  if (!expiredIds.length) return;

  await prisma.subscription.updateMany({
    where: { id: { in: expiredIds } },
    data: { status: "EXPIRED" },
  });
};

export const SubscriptionService = {
  // Creates a pending subscription and its payment record for the selected plan.
  create: async (studentId: string, planId: string) => {
    if (!planId) throw new Error("planId is required");

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        currency: true,
        interval: true,
        isActive: true,
      },
    });

    if (!plan) throw new Error("Plan not found");
    if (!plan.isActive) throw new Error("Plan is not active");

    await expireDueSubscriptions(studentId);

    const existingActive = await prisma.subscription.findFirst({
      where: {
        studentId,
        status: "ACTIVE",
      },
    });

    if (existingActive) {
      throw new Error("Student already has an active subscription");
    }

    const existingPending = await prisma.subscription.findFirst({
      where: {
        studentId,
        planId,
        status: "PENDING",
      },
      select: {
        id: true,
        studentId: true,
        planId: true,
        status: true,
        paymentStatus: true,
        startDate: true,
        endDate: true,
        paymentProvider: true,
        externalRef: true,
        createdAt: true,
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            currency: true,
            interval: true,
            isActive: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            transactionId: true,
            status: true,
            invoiceUrl: true,
            paymentGatewayData: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingPending) {
      const effectiveEndDate = getEffectiveEndDate(existingPending);

      if (effectiveEndDate && new Date() > effectiveEndDate) {
        await prisma.subscription.update({
          where: { id: existingPending.id },
          data: { status: "EXPIRED" },
        });
      } else {
        return existingPending;
      }
    }

    const startDate = new Date();
    const endDate = calculateEndDateFromStart(startDate, plan.interval);

    return prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          studentId,
          planId,
          status: "PENDING",
          paymentStatus: "UNPAID",
          startDate,
          endDate,
        },
        select: {
          id: true,
          studentId: true,
          planId: true,
          status: true,
          paymentStatus: true,
          startDate: true,
          endDate: true,
          paymentProvider: true,
          externalRef: true,
          createdAt: true,
        },
      });

      const payment = await tx.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: plan.price,
          transactionId: randomUUID(),
          status: "UNPAID",
        },
        select: {
          id: true,
          amount: true,
          transactionId: true,
          status: true,
          invoiceUrl: true,
          createdAt: true,
        },
      });

      return {
        ...subscription,
        payment,
      };
    });
  },

  // Creates a Stripe checkout session for the subscription payment.
  initiatePayment: async (studentId: string, subscriptionId: string) => {
    await expireDueSubscriptions(studentId);

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: {
        id: true,
        studentId: true,
        status: true,
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            currency: true,
            interval: true,
            isActive: true,
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!subscription) throw new Error("Subscription not found");
    if (subscription.studentId !== studentId) throw new Error("Forbidden");
    if (!subscription.plan) throw new Error("Plan not found");
    if (!subscription.plan.isActive) throw new Error("Plan is not active");
    if (!subscription.payment) throw new Error("Payment record not found");
    if (subscription.payment.status === "PAID") {
      throw new Error("Payment already completed for this subscription");
    }
    if (subscription.status === "CANCELLED") {
      throw new Error("Subscription is cancelled");
    }
    if (subscription.status === "EXPIRED") {
      throw new Error("Subscription has expired");
    }

    const stripe = getStripeClient();
    const frontendUrl = process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Subscription with ${subscription.plan.name}`,
            },
            unit_amount: subscription.plan.price * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        subscriptionId: subscription.id,
        paymentId: subscription.payment.id,
      },
      success_url: `${frontendUrl}/dashboard/payment/payment-success?subscription_id=${subscription.id}&payment_id=${subscription.payment.id}`,
      cancel_url: `${frontendUrl}/dashboard/bookings?error=payment_cancelled`,
    });

    return {
      paymentUrl: session.url,
      sessionId: session.id,
    };
  },

  // Returns subscriptions for the current user, or all subscriptions for admins.
  list: async (studentId: string, role: string) => {
    await expireDueSubscriptions(role === "admin" ? undefined : studentId);

    const where = role === "admin" ? {} : { studentId };

    return prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        startDate: true,
        endDate: true,
        paymentProvider: true,
        externalRef: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            currency: true,
            interval: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            transactionId: true,
            status: true,
            invoiceUrl: true,
            paymentGatewayData: true,
          },
        },
      },
    });
  },

  // Returns the latest active subscription for the student.
  getMyActive: async (studentId: string) => {
    await expireDueSubscriptions(studentId);

    const subscription = await prisma.subscription.findFirst({
      where: {
        studentId,
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        startDate: true,
        endDate: true,
        paymentProvider: true,
        externalRef: true,
        createdAt: true,
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            currency: true,
            interval: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            transactionId: true,
            status: true,
            invoiceUrl: true,
            paymentGatewayData: true,
          },
        },
      },
    });

    if (!subscription) throw new Error("No active subscription found");

    return subscription;
  },

  // Cancels an active or pending subscription owned by the student.
  cancel: async (studentId: string, subscriptionId: string) => {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: {
        id: true,
        studentId: true,
        status: true,
        paymentStatus: true,
        payment: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!subscription) throw new Error("Subscription not found");
    if (subscription.studentId !== studentId) throw new Error("Forbidden");
    if (subscription.status !== "ACTIVE" && subscription.status !== "PENDING") {
      throw new Error("Only active or pending subscriptions can be cancelled");
    }

    return prisma.$transaction(async (tx) => {
      return tx.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: "CANCELLED",
          paymentStatus:
            subscription.paymentStatus === "PAID" ? "PAID" : "UNPAID",
        },
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          startDate: true,
          endDate: true,
        },
      });
    });
  },
};