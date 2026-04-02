import express, { Application } from "express";
import { toNodeHandler } from "better-auth/node";
import cors from 'cors';
import { auth } from "./lib/auth";
import { bookingRouter } from "./modules/bookings/bookings.route";
import { profileRouter } from "./modules/tutorProfile/profile.router";
import { tutorRoutes } from "./modules/tutor/tutor.route";
import { categoriesRoutes } from "./modules/categories/categories.route";
import { tutorsRoutes } from "./modules/tutors/tutors.route";
import { reviewRoutes } from "./modules/reviews/reviews.route";
import { adminRouter } from "./modules/admin/admin.route";
import { notFound } from "./middlewares/notFound";
import errorHandler from "./middlewares/globalErrorHandler";
import { userRouter } from "./modules/users/users.route";
import { PaymentController } from "./modules/payment/payment.controller";
import { planRoutes } from "./modules/plans/plan.route";
import { subsriptionRotes } from "./modules/subscriptions/subscription.route";



const app: Application = express();

app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent)

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000", // client side url
    credentials: true
}))

// Configure CORS to allow both production and Vercel preview deployments
const allowedOrigins = [
    process.env.APP_URL || "http://localhost:3000",
    process.env.PROD_APP_URL, // Production frontend URL
    ].filter(Boolean); // Remove undefined values


app.use(
    cors({
    origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    // Check if origin is in allowedOrigins or matches Vercel preview pattern
    const isAllowed =
    allowedOrigins.includes(origin) ||
    /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||
    /^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment
    if (isAllowed) {
    callback(null, true);
    } else {
    callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
    }),
);


app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/plans", planRoutes);

app.use("/api/subscriptions", subsriptionRotes);

app.use("/api/bookings", bookingRouter);

app.use("/api/tutor-profile", profileRouter);

app.use("/api/categories", categoriesRoutes);

app.use("/api/tutor", tutorRoutes);

app.use("/api/tutors", tutorsRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/admin", adminRouter);

app.use("/api/users", userRouter);

app.get("/", (req, res) => {
    res.send("Skill Bridge!");
});

app.use(notFound)
app.use(errorHandler)

export default app;