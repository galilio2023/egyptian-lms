import { NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitStore: Map<string, RateLimitRecord> | undefined;
  // eslint-disable-next-line no-var
  var __rateLimitGcInterval: ReturnType<typeof setInterval> | undefined;
}

// In-memory sliding window cache (persists across HMR reloads without memory leaks)
const rateLimitStore = globalThis.__rateLimitStore ?? new Map<string, RateLimitRecord>();
globalThis.__rateLimitStore = rateLimitStore;

// Automatic garbage collection every 5 minutes, single active interval instance
if (typeof setInterval !== "undefined") {
  if (globalThis.__rateLimitGcInterval) {
    clearInterval(globalThis.__rateLimitGcInterval);
  }
  globalThis.__rateLimitGcInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 300_000);
}

export const RATE_LIMIT_PRESETS: Record<string, RateLimitConfig> = {
  // Scratch card voucher codes: max 5 attempts per 10 minutes (prevents bot brute forcing)
  voucherRedeem: {
    maxRequests: 5,
    windowMs: 10 * 60 * 1000,
  },
  // Single-device transfer & parent verification: max 6 attempts per 15 minutes
  deviceVerify: {
    maxRequests: 6,
    windowMs: 15 * 60 * 1000,
  },
  // Quiz submission & grading: max 12 requests per 5 minutes
  quizGrade: {
    maxRequests: 12,
    windowMs: 5 * 60 * 1000,
  },
  // Homework submission: max 8 submissions per 10 minutes
  homeworkSubmit: {
    maxRequests: 8,
    windowMs: 10 * 60 * 1000,
  },
  // Public general API: max 60 requests per minute
  publicApi: {
    maxRequests: 60,
    windowMs: 60 * 1000,
  },
  // Paymob webhook invalid HMAC audit writes: max 5 audit events per 2 minutes per IP (bounds DB writes against DoS CWE-400)
  paymobInvalidHmac: {
    maxRequests: 5,
    windowMs: 2 * 60 * 1000,
  },
};

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();
  return "127.0.0.1";
}

/**
 * Checks and records rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  presetOrConfig: keyof typeof RATE_LIMIT_PRESETS | RateLimitConfig
): RateLimitResult {
  const config: RateLimitConfig =
    typeof presetOrConfig === "string"
      ? RATE_LIMIT_PRESETS[presetOrConfig] || RATE_LIMIT_PRESETS.publicApi
      : presetOrConfig;

  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetSeconds: Math.ceil(config.windowMs / 1000),
    };
  }

  if (existing.count >= config.maxRequests) {
    const remainingTimeSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetSeconds: remainingTimeSeconds,
    };
  }

  existing.count += 1;
  const remainingTimeSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - existing.count,
    resetSeconds: remainingTimeSeconds,
  };
}

/**
 * Creates standard HTTP 429 Too Many Requests response with standard headers
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  customMessage?: string
): NextResponse {
  const minutes = Math.ceil(result.resetSeconds / 60);
  const defaultMsg = `عذراً، لقد تجاوزت الحد الأقصى للمحاولات المسموح بها لحماية أمان المنصة. يرجى الانتظار لمدة ${minutes} دقيقة قبل المحاولة مرة أخرى.`;

  return NextResponse.json(
    {
      error: customMessage || defaultMsg,
      rateLimited: true,
      retryAfterSeconds: result.resetSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.resetSeconds),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(result.resetSeconds),
      },
    }
  );
}
