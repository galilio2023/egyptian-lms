import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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
  provider?: "upstash" | "memory";
}

declare global {
  var __rateLimitStore: Map<string, RateLimitRecord> | undefined;
  var __rateLimitGcInterval: ReturnType<typeof setInterval> | undefined;
  var __upstashRatelimitMap: Map<string, Ratelimit> | undefined;
  var __upstashRedisClient: Redis | undefined;
}

// In-memory sliding window cache (persists across HMR reloads without memory leaks)
const rateLimitStore = globalThis.__rateLimitStore ?? new Map<string, RateLimitRecord>();
globalThis.__rateLimitStore = rateLimitStore;

// Upstash Redis Client initialization (lazy, singleton across reloads)
function getUpstashRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  if (!globalThis.__upstashRedisClient) {
    globalThis.__upstashRedisClient = new Redis({
      url,
      token,
    });
  }
  return globalThis.__upstashRedisClient;
}

const upstashRatelimitMap = globalThis.__upstashRatelimitMap ?? new Map<string, Ratelimit>();
globalThis.__upstashRatelimitMap = upstashRatelimitMap;

function getUpstashLimiter(config: RateLimitConfig): Ratelimit | null {
  const redis = getUpstashRedis();
  if (!redis) return null;

  const key = `${config.maxRequests}_${config.windowMs}`;
  const existing = upstashRatelimitMap.get(key);
  if (existing) return existing;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowMs} ms`),
    analytics: false,
    prefix: "elite_lms",
    timeout: 2000,
  });

  upstashRatelimitMap.set(key, limiter);
  return limiter;
}

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
 * Synchronous in-memory rate limiter fallback (sliding window)
 */
export function checkRateLimitInMemory(
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
      provider: "memory",
    };
  }

  if (existing.count >= config.maxRequests) {
    const remainingTimeSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetSeconds: remainingTimeSeconds,
      provider: "memory",
    };
  }

  existing.count += 1;
  const remainingTimeSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - existing.count,
    resetSeconds: remainingTimeSeconds,
    provider: "memory",
  };
}

/**
 * Checks and records rate limit for a given key.
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.
 * Automatically falls back to in-memory sliding window when Upstash is not configured or offline.
 */
export async function checkRateLimit(
  key: string,
  presetOrConfig: keyof typeof RATE_LIMIT_PRESETS | RateLimitConfig
): Promise<RateLimitResult> {
  const config: RateLimitConfig =
    typeof presetOrConfig === "string"
      ? RATE_LIMIT_PRESETS[presetOrConfig] || RATE_LIMIT_PRESETS.publicApi
      : presetOrConfig;

  try {
    const upstashLimiter = getUpstashLimiter(config);
    if (upstashLimiter) {
      const res = await upstashLimiter.limit(key);
      if (res.reason === "timeout") {
        console.warn("⚠️ Upstash rate limit timed out, falling back to in-memory limiter for key:", key);
        return checkRateLimitInMemory(key, config);
      }
      const resetSeconds = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        resetSeconds,
        provider: "upstash",
      };
    }
  } catch (error) {
    console.warn("⚠️ Upstash rate limiting failed, falling back to in-memory cache:", error);
  }

  return checkRateLimitInMemory(key, config);
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
