 
import { Request, Response } from "express";
import Stripe from "stripe";
import { PaymentService } from "./payment.service";

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

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

const handleStripeWebhookEvent = async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string | undefined;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if(!signature || !webhookSecret){
        console.error("Missing Stripe signature or webhook secret");
        return res.status(400).json({ success: false, message: "Missing Stripe signature or webhook secret" });
    }

    let event: Stripe.Event;

    try {
        const stripe = getStripeClient();
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error: unknown) {
        console.error("Error processing Stripe webhook:", error);
        return res.status(400).json({
          success: false,
          message: getErrorMessage(error, "Error processing Stripe webhook"),
        });
    }

    try {
        const result = await PaymentService.handlerStripeWebhookEvent(event);

        return res.status(200).json({
          success: true,
          message: "Stripe webhook event processed successfully",
          data: result,
        });
    } catch (error: unknown) {
        console.error("Error handling Stripe webhook event:", error);
        return res.status(500).json({
          success: false,
          message: getErrorMessage(error, "Error handling Stripe webhook event"),
        });
    }
};

export const PaymentController = {
    handleStripeWebhookEvent
};