import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { z } from "zod";
import { db } from "../db";
import * as schema from "../db/schema";

if (!process.env.BETTER_AUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("FATAL: BETTER_AUTH_SECRET is not configured in production environment variables.");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: true,
        validator: {
          input: z.string().regex(/^01[0125]\d{8}$/, {
            message: "رقم الموبايل غير صحيح. يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقم.",
          }),
        },
      },
      role: {
        type: "string",
        defaultValue: "student",
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  rateLimit: {
    window: 60, // 1 minute window
    max: 10,    // Max 10 requests per window
  },
  secret: process.env.BETTER_AUTH_SECRET || "elite-academy-dev-secret-key-2026-local",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});
