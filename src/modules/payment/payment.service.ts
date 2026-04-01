import Stripe from "stripe";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
    const existingPayment = await prisma.payment.findFirst({
        where: { stripeEventId: event.id },
    });

    if (existingPayment) {
        console.log(`Event ${event.id} already processed. Skipping`);
        return { message: `Event ${event.id} already processed. Skipping` };
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as any;
            const bookingId = session.metadata?.bookingId;
            const paymentId = session.metadata?.paymentId;

            if (!bookingId || !paymentId) {
                console.error("Missing bookingId/paymentId metadata in checkout.session.completed");
                return { message: "Missing bookingId/paymentId metadata" };
            }

            const payment = await prisma.payment.findUnique({
                where: { id: paymentId },
                select: {
                    id: true,
                    BookingId: true,
                },
            });

            if (!payment) {
                console.error(`Payment ${paymentId} not found`);
                return { message: "Payment not found" };
            }

            if (payment.BookingId !== bookingId) {
                console.error(`Payment ${paymentId} is not linked to booking ${bookingId}`);
                return { message: "Payment/booking mismatch" };
            }

            const isPaid = session.payment_status === "paid";
            

            await prisma.$transaction(async (tx) => {
                await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: isPaid ? "PAID" : "UNPAID",
                        paymentGatewayData: session,
                        stripeEventId: event.id,
                    },
                });

                await tx.booking.update({
                    where: { id: bookingId },
                    data: {
                        paymentStatus: isPaid ? "PAID" : "UNPAID",
                    },
                });
            });

            console.log(`Payment ${session.payment_status} for booking ${bookingId}`);
            break;
        }

        case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log(`Checkout session ${session.id} expired.`);
            break;
        }

        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log(`Payment intent ${paymentIntent.id} succeeded.`);
            break;
        }

        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log(`Payment intent ${paymentIntent.id} failed.`);
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return { message: `Webhook Event ${event.id} processed successfully` };
};

export const PaymentService = {
    handlerStripeWebhookEvent,
};