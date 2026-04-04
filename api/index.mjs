var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express from "express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": 'model User {\n  id            String    @id\n  name          String\n  email         String\n  emailVerified Boolean   @default(true)\n  image         String?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n\n  role   String? @default("USER")\n  phone  String?\n  status String? @default("ACTIVE")\n\n  // Relations\n  subscriptions Subscription[]\n\n  @@unique([email])\n  @@index([role])\n  @@index([status])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Payment {\n  id                 String        @id @default(uuid(7))\n  amount             Float\n  transactionId      String        @unique @db.Uuid()\n  stripeEventId      String?       @unique\n  status             PaymentStatus @default(UNPAID)\n  invoiceUrl         String?\n  paymentGatewayData Json?\n  createdAt          DateTime      @default(now())\n  updatedAt          DateTime      @updatedAt\n\n  subscriptionId String       @unique\n  subscription   Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)\n\n  @@index([subscriptionId])\n  @@index([transactionId])\n  @@map("payments")\n}\n\nmodel Plan {\n  id          String          @id @default(cuid())\n  name        String\n  slug        String          @unique\n  description String?\n  price       Float\n  currency    String          @default("USD")\n  interval    BillingInterval\n  isActive    Boolean         @default(true)\n  createdAt   DateTime        @default(now())\n  updatedAt   DateTime        @updatedAt\n\n  subscriptions Subscription[]\n\n  @@map("plan")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum Role {\n  STUDENT\n  ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  BANNED\n}\n\nenum PaymentStatus {\n  PAID\n  UNPAID\n}\n\nenum SubscriptionStatus {\n  PENDING\n  ACTIVE\n  CANCELLED\n  EXPIRED\n  PAST_DUE\n  TRIAL\n}\n\nenum BillingInterval {\n  DAILY\n  MONTHLY\n  YEARLY\n  LIFETIME\n}\n\nmodel Subscription {\n  id              String             @id @default(cuid())\n  studentId       String\n  planId          String\n  paymentStatus   PaymentStatus      @default(UNPAID)\n  status          SubscriptionStatus @default(PENDING)\n  startDate       DateTime?\n  endDate         DateTime?\n  paymentProvider String?\n  externalRef     String?\n  createdAt       DateTime           @default(now())\n  updatedAt       DateTime           @updatedAt\n\n  student User     @relation(fields: [studentId], references: [id])\n  plan    Plan     @relation(fields: [planId], references: [id])\n  payment Payment?\n\n  @@index([studentId])\n  @@index([planId])\n  @@index([status])\n  @@map("subscription")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"role","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"subscriptions","kind":"object","type":"Subscription","relationName":"SubscriptionToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"stripeEventId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"invoiceUrl","kind":"scalar","type":"String"},{"name":"paymentGatewayData","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"subscriptionId","kind":"scalar","type":"String"},{"name":"subscription","kind":"object","type":"Subscription","relationName":"PaymentToSubscription"}],"dbName":"payments"},"Plan":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"currency","kind":"scalar","type":"String"},{"name":"interval","kind":"enum","type":"BillingInterval"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"subscriptions","kind":"object","type":"Subscription","relationName":"PlanToSubscription"}],"dbName":"plan"},"Subscription":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"planId","kind":"scalar","type":"String"},{"name":"paymentStatus","kind":"enum","type":"PaymentStatus"},{"name":"status","kind":"enum","type":"SubscriptionStatus"},{"name":"startDate","kind":"scalar","type":"DateTime"},{"name":"endDate","kind":"scalar","type":"DateTime"},{"name":"paymentProvider","kind":"scalar","type":"String"},{"name":"externalRef","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"student","kind":"object","type":"User","relationName":"SubscriptionToUser"},{"name":"plan","kind":"object","type":"Plan","relationName":"PlanToSubscription"},{"name":"payment","kind":"object","type":"Payment","relationName":"PaymentToSubscription"}],"dbName":"subscription"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PlanScalarFieldEnum: () => PlanScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  SubscriptionScalarFieldEnum: () => SubscriptionScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.3.0",
  engine: "9d6ad21cbbceab97458517b147a6a09ff43aa735"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Payment: "Payment",
  Plan: "Plan",
  Subscription: "Subscription"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  role: "role",
  phone: "phone",
  status: "status"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  amount: "amount",
  transactionId: "transactionId",
  stripeEventId: "stripeEventId",
  status: "status",
  invoiceUrl: "invoiceUrl",
  paymentGatewayData: "paymentGatewayData",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  subscriptionId: "subscriptionId"
};
var PlanScalarFieldEnum = {
  id: "id",
  name: "name",
  slug: "slug",
  description: "description",
  price: "price",
  currency: "currency",
  interval: "interval",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SubscriptionScalarFieldEnum = {
  id: "id",
  studentId: "studentId",
  planId: "planId",
  paymentStatus: "paymentStatus",
  status: "status",
  startDate: "startDate",
  endDate: "endDate",
  paymentProvider: "paymentProvider",
  externalRef: "externalRef",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
var auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: [process.env.APP_URL],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: false
      },
      phone: {
        type: "string",
        required: false
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    // important so newSession exists
    requireEmailVerification: false
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      prompt: "select_account"
    }
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;
      const newSession = ctx.context.newSession;
      const userId = newSession?.user?.id;
      if (!userId) return;
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true }
      });
    })
  }
});

// src/middlewares/notFound.ts
function notFound(req, res) {
  res.status(404).json({
    message: "Route not found!",
    path: req.originalUrl,
    date: Date()
  });
}

// src/middlewares/globalErrorHandler.ts
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetails = err;
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields!";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errorMessage = "An operation failed because it depends on one or more records that were required but not found.";
    } else if (err.code === "P2002") {
      statusCode = 400;
      errorMessage = "Duplicate key error";
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Error occurred during query execution";
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      errorMessage = "Authentication failed. Please check your creditials!";
    } else if (err.errorCode === "P1001") {
      statusCode = 400;
      errorMessage = "Can't reach database server";
    }
  }
  res.status(statusCode);
  res.json({
    message: errorMessage,
    error: errorDetails
  });
}
var globalErrorHandler_default = errorHandler;

// src/modules/users/users.route.ts
import { Router } from "express";

// src/middlewares/auth.ts
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!"
        });
      }
      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email verification required. Please verfiy your email!"
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified
      };
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You don't have permission to access this resources!"
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
var auth_default = auth2;

// src/modules/users/users.service.ts
var UsersService = {
  getMe: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        emailVerified: true,
        createdAt: true
      }
    });
    if (!user) throw new Error("User not found");
    return user;
  },
  updateMe: async (userId, dto) => {
    const data = {};
    if (dto.name !== void 0) data.name = dto.name;
    if (dto.phone !== void 0) data.phone = dto.phone;
    if (dto.image !== void 0) data.image = dto.image;
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        emailVerified: true
      }
    });
  }
};

// src/modules/users/users.controller.ts
var UsersController = {
  me: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
      const user = await UsersService.getMe(req.user.id);
      return res.json({ success: true, data: user });
    } catch (e) {
      return res.status(400).json({ success: false, message: e?.message ?? "Failed" });
    }
  },
  updateMe: async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
      const updated = await UsersService.updateMe(req.user.id, req.body);
      return res.json({ success: true, message: "Profile updated", data: updated });
    } catch (e) {
      return res.status(400).json({ success: false, message: e?.message ?? "Failed" });
    }
  }
};

// src/modules/users/users.route.ts
var router = Router();
router.get("/me", auth_default("STUDENT" /* STUDENT */, "ADMIN" /* ADMIN */), UsersController.me);
router.patch("/me", auth_default("STUDENT" /* STUDENT */, "ADMIN" /* ADMIN */), UsersController.updateMe);
var userRouter = router;

// src/modules/payment/payment.controller.ts
import Stripe from "stripe";

// src/modules/payment/payment.service.ts
var handlerStripeWebhookEvent = async (event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
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
          status: true
        }
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
      if (payment.status === "PAID") {
        console.log(`Payment ${paymentId} already marked as PAID. Skipping duplicate webhook processing.`);
        return { message: `Payment ${paymentId} already processed` };
      }
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: isPaid ? "PAID" : "UNPAID",
            paymentGatewayData: session
          }
        });
        await tx.subscription.update({
          where: { id: subscriptionId },
          data: {
            paymentStatus: isPaid ? "PAID" : "UNPAID",
            status: isPaid ? "ACTIVE" : "PAST_DUE"
          }
        });
      });
      console.log(`Payment ${session.payment_status} for booking ${subscriptionId}`);
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      console.log(`Checkout session ${session.id} expired.`);
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      console.log(`Payment intent ${paymentIntent.id} succeeded.`);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      console.log(`Payment intent ${paymentIntent.id} failed.`);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  return { message: `Webhook Event ${event.id} processed successfully` };
};
var PaymentService = {
  handlerStripeWebhookEvent
};

// src/modules/payment/payment.controller.ts
var stripeClient = null;
var getStripeClient = () => {
  if (stripeClient) return stripeClient;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables.");
  }
  stripeClient = new Stripe(secret);
  return stripeClient;
};
var getErrorMessage = (error, fallback) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};
var handleStripeWebhookEvent = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    console.error("Missing Stripe signature or webhook secret");
    return res.status(400).json({ success: false, message: "Missing Stripe signature or webhook secret" });
  }
  let event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error, "Error processing Stripe webhook")
    });
  }
  try {
    const result = await PaymentService.handlerStripeWebhookEvent(event);
    return res.status(200).json({
      success: true,
      message: "Stripe webhook event processed successfully",
      data: result
    });
  } catch (error) {
    console.error("Error handling Stripe webhook event:", error);
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error, "Error handling Stripe webhook event")
    });
  }
};
var PaymentController = {
  handleStripeWebhookEvent
};

// src/modules/plans/plan.route.ts
import { Router as Router2 } from "express";

// src/modules/plans/plan.service.ts
var PlanService = {
  async createPlan(payload) {
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

// src/shared/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    data
  });
};

// src/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/modules/plans/plan.controller.ts
import status from "http-status";
var createPlan = catchAsync(async (req, res) => {
  const result = await PlanService.createPlan(req.body);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Plan created successfully",
    data: result
  });
});
var getPlans = catchAsync(async (_req, res) => {
  const result = await PlanService.getPlans();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Plans retrieved successfully",
    data: result
  });
});
var PlanController = {
  createPlan,
  getPlans
};

// src/modules/plans/plan.validation.ts
import { z } from "zod";
var createPlanSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  currency: z.string().default("USD"),
  interval: z.enum(["DAILY", "MONTHLY", "YEARLY", "LIFETIME"])
});

// src/middlewares/validateRequest.ts
var validateRequest = (zodSchema) => {
  return (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    const parsedResult = zodSchema.safeParse(req.body);
    if (!parsedResult.success) {
      next(parsedResult.error);
    }
    req.body = parsedResult.data;
    next();
  };
};

// src/modules/plans/plan.route.ts
var router2 = Router2();
router2.get("/", PlanController.getPlans);
router2.post(
  "/",
  auth_default("ADMIN" /* ADMIN */),
  validateRequest(createPlanSchema),
  PlanController.createPlan
);
var planRoutes = router2;

// src/modules/subscriptions/subscription.route.ts
import { Router as Router3 } from "express";

// src/modules/subscriptions/subscription.service.ts
import { randomUUID } from "crypto";
import Stripe2 from "stripe";
var stripeClient2 = null;
var getStripeClient2 = () => {
  if (stripeClient2) return stripeClient2;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables.");
  }
  stripeClient2 = new Stripe2(secret);
  return stripeClient2;
};
var SubscriptionService = {
  create: async (studentId, planId) => {
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
        isActive: true
      }
    });
    if (!plan) throw new Error("Plan not found");
    if (!plan.isActive) throw new Error("Plan is not active");
    const existingActive = await prisma.subscription.findFirst({
      where: {
        studentId,
        status: "ACTIVE"
      }
    });
    if (existingActive) {
      throw new Error("Student already has an active subscription");
    }
    const existingPending = await prisma.subscription.findFirst({
      where: {
        studentId,
        planId,
        status: "PENDING"
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
            isActive: true
          }
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
            updatedAt: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    if (existingPending) {
      return existingPending;
    }
    return prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          studentId,
          planId,
          status: "PENDING",
          paymentStatus: "UNPAID",
          startDate: null,
          endDate: null
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
          createdAt: true
        }
      });
      const payment = await tx.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: plan.price,
          transactionId: randomUUID(),
          status: "UNPAID"
        },
        select: {
          id: true,
          amount: true,
          transactionId: true,
          status: true,
          invoiceUrl: true,
          createdAt: true
        }
      });
      return {
        ...subscription,
        payment
      };
    });
  },
  initiatePayment: async (studentId, subscriptionId) => {
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
            isActive: true
          }
        },
        payment: {
          select: {
            id: true,
            status: true
          }
        }
      }
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
    const stripe = getStripeClient2();
    const frontendUrl = process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "BDT".toLowerCase(),
            product_data: {
              name: `Session with ${subscription.plan?.name}`
            },
            unit_amount: subscription.plan?.price * 100
          },
          quantity: 1
        }
      ],
      metadata: {
        subscriptionId: subscription.id,
        paymentId: subscription.payment.id
      },
      success_url: `${frontendUrl}/dashboard/payment/payment-success?subscription_id=${subscription.id}&payment_id=${subscription.payment.id}`,
      cancel_url: `${frontendUrl}/dashboard/bookings?error=payment_cancelled`
    });
    return {
      paymentUrl: session.url,
      sessionId: session.id
    };
  },
  list: async (studentId, role) => {
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
            email: true
          }
        },
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            currency: true,
            interval: true
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            transactionId: true,
            status: true,
            invoiceUrl: true,
            paymentGatewayData: true
          }
        }
      }
    });
  },
  getMyActive: async (studentId) => {
    const subscription = await prisma.subscription.findFirst({
      where: {
        studentId,
        status: "ACTIVE"
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
            interval: true
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            transactionId: true,
            status: true,
            invoiceUrl: true,
            paymentGatewayData: true
          }
        }
      }
    });
    if (!subscription) throw new Error("No active subscription found");
    return subscription;
  },
  cancel: async (studentId, subscriptionId) => {
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
            status: true
          }
        }
      }
    });
    if (!subscription) throw new Error("Subscription not found");
    if (subscription.studentId !== studentId) throw new Error("Forbidden");
    if (subscription.status !== "ACTIVE" && subscription.status !== "PENDING") {
      throw new Error("Only active or pending subscriptions can be cancelled");
    }
    return prisma.$transaction(async (tx) => {
      if (subscription.payment && subscription.payment.status === "UNPAID") {
        await tx.payment.update({
          where: { id: subscription.payment.id },
          data: {
            status: "UNPAID"
          }
        });
      }
      return tx.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: "CANCELLED",
          paymentStatus: subscription.paymentStatus === "PAID" ? "PAID" : "UNPAID"
        },
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          startDate: true,
          endDate: true
        }
      });
    });
  }
};

// src/modules/subscriptions/subscription.controller.ts
var SubscriptionController = {
  create: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const { planId } = req.body;
      if (!planId) {
        return res.status(400).json({
          success: false,
          message: "planId is required"
        });
      }
      const subscription = await SubscriptionService.create(req.user.id, planId);
      return res.status(201).json({
        success: true,
        message: "Subscription created successfully",
        data: subscription
      });
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: e.message ?? "Failed to create subscription"
      });
    }
  },
  initiatePayment: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const subscriptionId = req.params.id;
      if (!subscriptionId) {
        return res.status(400).json({
          success: false,
          message: "subscriptionId is required"
        });
      }
      const data = await SubscriptionService.initiatePayment(req.user.id, subscriptionId);
      return res.json({
        success: true,
        message: "Payment initiated",
        data
      });
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: e.message ?? "Payment initiation failed"
      });
    }
  },
  listMineOrAll: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const items = await SubscriptionService.list(req.user.id, req.user.role);
      return res.json({
        success: true,
        data: { items }
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message ?? "Failed to load subscriptions"
      });
    }
  },
  getMyActive: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const subscription = await SubscriptionService.getMyActive(req.user.id);
      return res.json({
        success: true,
        data: subscription
      });
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: e.message ?? "Failed to load active subscription"
      });
    }
  },
  cancel: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const subscriptionId = req.params.id;
      if (!subscriptionId) {
        return res.status(400).json({
          success: false,
          message: "subscriptionId is required"
        });
      }
      const updated = await SubscriptionService.cancel(req.user.id, subscriptionId);
      return res.json({
        success: true,
        message: "Subscription cancelled successfully",
        data: updated
      });
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: e.message ?? "Cancel failed"
      });
    }
  }
};

// src/modules/subscriptions/subscription.route.ts
var router3 = Router3();
router3.post("/", auth_default("STUDENT" /* STUDENT */), SubscriptionController.create);
router3.post("/:id/initiate-payment", auth_default("STUDENT" /* STUDENT */), SubscriptionController.initiatePayment);
router3.get("/", auth_default("STUDENT" /* STUDENT */), SubscriptionController.listMineOrAll);
router3.get("/active", auth_default("STUDENT" /* STUDENT */), SubscriptionController.getMyActive);
router3.patch("/:id/cancel", auth_default("STUDENT" /* STUDENT */), SubscriptionController.cancel);
var subsriptionRotes = router3;

// src/modules/ailearn/ailearn.route.ts
import { Router as Router4 } from "express";

// src/modules/ailearn/ailearn.controller.ts
import status2 from "http-status";

// src/modules/ailearn/ailearn.service.ts
import { v4 as uuidv4 } from "uuid";

// src/modules/ailearn/genkit.ts
import dotenv from "dotenv";
dotenv.config();
var ensureGenkitEnv = () => {
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error("GOOGLE_GENAI_API_KEY not found in environment variables");
  }
};
var getGenkit = async () => {
  const [{ googleAI }, { genkit, z: z3 }] = await Promise.all([
    import("@genkit-ai/googleai"),
    import("genkit")
  ]);
  ensureGenkitEnv();
  const ai = genkit({
    plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || "" })],
    model: googleAI.model("gemini-2.5-flash", { temperature: 0.8 })
  });
  return { ai, z: z3 };
};
var generateQuizQuestions = async (input) => {
  const { ai, z: z3 } = await getGenkit();
  const questionInputSchema = z3.object({
    topic: z3.string(),
    difficulty: z3.enum(["easy", "medium", "hard"]).default("medium"),
    gradeLevel: z3.string().default("High School"),
    numberOfQuestions: z3.number().min(1).max(10).default(5)
  });
  const questionSchema = z3.array(
    z3.object({
      type: z3.enum(["mcq", "truefalse"]),
      question: z3.string(),
      options: z3.array(z3.string()).optional(),
      answer: z3.string()
    })
  );
  const flow = ai.defineFlow(
    {
      name: "examQuestionFlow",
      inputSchema: questionInputSchema,
      outputSchema: questionSchema
    },
    async (flowInput) => {
      const prompt = `
Generate ${flowInput.numberOfQuestions ?? 5} practice quiz questions on the topic "${flowInput.topic}".
Include a mix of MCQ and true/false.
Difficulty: ${flowInput.difficulty}.
Grade Level: ${flowInput.gradeLevel ?? "High School"}.
Return JSON array with fields: type, question, options (if MCQ), answer.
`;
      const { output } = await ai.generate({
        prompt,
        output: { schema: questionSchema }
      });
      if (!output) {
        throw new Error("Failed to generate questions");
      }
      return output;
    }
  );
  return flow({
    topic: input.topic,
    difficulty: input.difficulty,
    gradeLevel: input.gradeLevel ?? "High School",
    numberOfQuestions: input.numberOfQuestions ?? 5
  });
};
var studyPathGenerator = async (input) => {
  const { ai, z: z3 } = await getGenkit();
  const studyPathGeneratorInputSchema = z3.object({
    objective: z3.string()
  });
  const studyPathGeneratorOutputSchema = z3.object({
    roadmap: z3.array(
      z3.object({
        day: z3.number(),
        title: z3.string(),
        tasks: z3.array(z3.string()),
        tip: z3.string()
      })
    )
  });
  const prompt = ai.definePrompt({
    name: "studyPathGeneratorPrompt",
    input: { schema: studyPathGeneratorInputSchema },
    output: { schema: studyPathGeneratorOutputSchema },
    prompt: `You are an expert academic advisor and study planning assistant. Your goal is to create a structured, actionable, and encouraging study roadmap for a student.

The user's objective is: "{{objective}}"

Analyze the user's objective to understand the subject, goal, and timeframe.

Generate a day-by-day study plan that breaks down the objective into manageable tasks. The plan should cover the entire duration mentioned in the objective.

For each day, provide:
1. A "day" number.
2. A short, motivational "title" for that day's session.
3. An array of specific, actionable "tasks".
4. A helpful "tip" for motivation or study strategy.

Ensure the final output is a valid JSON object matching the defined schema.
`
  });
  const flow = ai.defineFlow(
    {
      name: "studyPathGeneratorFlow",
      inputSchema: studyPathGeneratorInputSchema,
      outputSchema: studyPathGeneratorOutputSchema
    },
    async (flowInput) => {
      const { output } = await prompt(flowInput);
      if (!output) {
        throw new Error("Failed to generate study path");
      }
      return output;
    }
  );
  return flow(input);
};

// src/modules/ailearn/ailearn.service.ts
var AiLearnService = {
  async generateQuestions(payload) {
    const examSessionId = uuidv4();
    const questions = await generateQuizQuestions(payload);
    return {
      examSessionId,
      topic: payload.topic,
      difficulty: payload.difficulty,
      gradeLevel: payload.gradeLevel ?? "High School",
      numberOfQuestions: payload.numberOfQuestions ?? 5,
      questions
    };
  },
  async generateStudyPath(payload) {
    return studyPathGenerator(payload);
  }
};

// src/modules/ailearn/ailearn.controller.ts
var generateQuestions = catchAsync(async (req, res) => {
  const result = await AiLearnService.generateQuestions(req.body);
  sendResponse(res, {
    httpStatusCode: status2.OK,
    success: true,
    message: "Questions generated successfully",
    data: result
  });
});
var generateStudyPath = catchAsync(async (req, res) => {
  const result = await AiLearnService.generateStudyPath(req.body);
  sendResponse(res, {
    httpStatusCode: status2.OK,
    success: true,
    message: "Study path generated successfully",
    data: result
  });
});
var AiLearnController = {
  generateQuestions,
  generateStudyPath
};

// src/modules/ailearn/ailearn.validation.ts
import { z as z2 } from "zod";
var generateQuestionsSchema = z2.object({
  topic: z2.string().trim().min(3),
  difficulty: z2.enum(["easy", "medium", "hard"]).default("medium"),
  gradeLevel: z2.string().trim().min(2).default("High School"),
  numberOfQuestions: z2.number().int().min(1).max(10).default(5)
});
var generateStudyPathSchema = z2.object({
  objective: z2.string().trim().min(8)
});

// src/modules/ailearn/ailearn.route.ts
var router4 = Router4();
router4.post(
  "/questions/generate",
  validateRequest(generateQuestionsSchema),
  AiLearnController.generateQuestions
);
router4.post(
  "/study-path/generate",
  validateRequest(generateStudyPathSchema),
  AiLearnController.generateStudyPath
);
var aiLearnRoutes = router4;

// src/app.ts
var app = express();
app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent);
app.use(cors({
  origin: process.env.APP_URL || "http://localhost:3000",
  // client side url
  credentials: true
}));
var allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  process.env.PROD_APP_URL
  // Production frontend URL
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
  })
);
app.use(express.json());
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/ai", aiLearnRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscriptions", subsriptionRotes);
app.use("/api/users", userRouter);
app.get("/", (req, res) => {
  res.send("ilearn!");
});
app.use(notFound);
app.use(globalErrorHandler_default);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
