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
            const subscriptionId = session.metadata?.subscriptionId;
            const paymentId = session.metadata?.paymentId;

            if (!subscriptionId || !paymentId) {
                console.error("Missing bookingId/paymentId metadata in checkout.session.completed");
                return { message: "Missing bookingId/paymentId metadata" };
            }

            const payment = await prisma.payment.findUnique({
                where: { id: paymentId },
                select: {
                    id: true,
                    subscriptionId: true,
                },
            });

            if (!payment) {
                console.error(`Payment ${paymentId} not found`);
                return { message: "Payment not found" };
            }

            if (payment.subscriptionId !== subscriptionId) {
                console.error(`Payment ${paymentId} is not linked to booking ${subscriptionId}`);
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

                await tx.subscription.update({
                    where: { id: subscriptionId },
                    data: {
                        paymentStatus: isPaid ? "PAID" : "UNPAID",
                    },
                });
            });

            console.log(`Payment ${session.payment_status} for booking ${subscriptionId}`);
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