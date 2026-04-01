import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";

let stripeClient: Stripe | null = null;

const getStripeClient = () => {
  if (stripeClient) return stripeClient;

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables.");
  }

  stripeClient = new Stripe(secret);
  return stripeClient;
};

export const BookingsService = {
  create: async (studentId: string, dto: { tutorProfileId: string; availabilityId: string }) => {
    if (!dto?.tutorProfileId) throw new Error("tutorProfileId is required");
    if (!dto?.availabilityId) throw new Error("availabilityId is required");

    // 1) slot must exist + belong to this tutorProfile
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: dto.availabilityId },
      select: {
        id: true,
        tutorProfileId: true,
        startTime: true,
        endTime: true,
        isBooked: true,
        tutorProfile: { select: { userId: true, hourlyRate: true, currency: true } },
      },
    });

    if (!slot) throw new Error("Slot not found");
    if (slot.tutorProfileId !== dto.tutorProfileId) throw new Error("Slot does not match tutor profile");
    if (slot.isBooked) throw new Error("Slot already booked");

    // 2) transaction: mark slot booked + create booking + create unpaid payment row
    return prisma.$transaction(async (tx) => {
      await tx.availabilitySlot.update({
        where: { id: slot.id },
        data: { isBooked: true },
      });

      const booking = await tx.booking.create({
        data: {
          studentId,
          tutorId: slot.tutorProfile.userId,
          tutorProfileId: slot.tutorProfileId,
          availabilityId: slot.id,
          status: "CONFIRMED",
          paymentStatus: "UNPAID",
          startTime: slot.startTime,
          endTime: slot.endTime,
          price: slot.tutorProfile.hourlyRate ?? 0,
          currency: slot.tutorProfile.currency ?? "BDT",
        },
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          startTime: true,
          endTime: true,
          price: true,
          currency: true,
        },
      });

      const payment = await tx.payment.create({
        data: {
          BookingId: booking.id,
          amount: booking.price,
          transactionId: randomUUID(),
          status: "UNPAID",
        },
        select: {
          id: true,
          amount: true,
          status: true,
          transactionId: true,
          createdAt: true,
        },
      });

      return { booking, payment };
    });
  },

  list: async (userId: string, role: string) => {
    const where =
      role === "admin" ? {} :
      role === "tutor" ? { tutorId: userId } :
      { studentId: userId };

    return prisma.booking.findMany({
      where,
      orderBy: { startTime: "desc" },
      select: {
        id: true,
        status: true,
        startTime: true,
        endTime: true,
        price: true,
        currency: true,
        paymentStatus: true,
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            transactionId: true,
          },
        },
        tutor: { select: { id: true, name: true } },
        student: { select: { id: true, name: true } },
      },
    });
  },

  initiatePayment: async (studentId: string, bookingId: string) => {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        tutor: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!booking) throw new Error("Booking not found");
    if (booking.studentId !== studentId) throw new Error("Forbidden");
    if (!booking.payment) throw new Error("Payment record not found for this booking");
    if (booking.payment.status === "PAID") throw new Error("Payment already completed for this booking");
    if (booking.status === "CANCELLED") throw new Error("Booking is cancelled");

    const stripe = getStripeClient();
    const frontendUrl = process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: (booking.currency || "BDT").toLowerCase(),
            product_data: {
              name: `Session with ${booking.tutor?.name || "Tutor"}`,
            },
            unit_amount: booking.price * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
        paymentId: booking.payment.id,
      },
      success_url: `${frontendUrl}/dashboard/payment/payment-success?booking_id=${booking.id}&payment_id=${booking.payment.id}`,
      cancel_url: `${frontendUrl}/dashboard/bookings?error=payment_cancelled`,
    });

    return {
      paymentUrl: session.url,
      sessionId: session.id,
    };
  },

  cancel: async (studentId: string, bookingId: string) => {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error("Booking not found");
    if (booking.studentId !== studentId) throw new Error("Forbidden");
    if (booking.status !== "CONFIRMED") throw new Error("Only confirmed bookings can be cancelled");

    return prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
  },

  complete: async (tutorId: string, bookingId: string) => {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error("Booking not found");
    if (booking.tutorId !== tutorId) throw new Error("Forbidden");
    if (booking.status !== "CONFIRMED") throw new Error("Only confirmed bookings can be completed");

    return prisma.booking.update({ where: { id: bookingId }, data: { status: "COMPLETED" } });
  },
};
