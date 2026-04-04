import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: [process.env.APP_URL!],

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,               // important so newSession exists
    requireEmailVerification: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // only after email signup
      if (ctx.path !== "/sign-up/email") return;

      const newSession = ctx.context.newSession; // exists in after hook :contentReference[oaicite:2]{index=2}
      const userId = newSession?.user?.id;

      if (!userId) return;

      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      });
    }),
  },
});
