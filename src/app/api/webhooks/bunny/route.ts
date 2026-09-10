import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logSecurityEvent } from "@/lib/security/audit-logger";

/**
 * Bunny.net Stream Encoding Webhook Listener
 *
 * Receives webhook events from Bunny.net Stream when video transcoding transitions:
 * Status: 0 = Queued, 1 = Processing, 2 = Encoding, 3 = Finished/Ready, 4 = Resolution Finished, 5 = Failed
 * Reference: https://docs.bunny.net/reference/stream-webhook
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || request.headers.get("x-bunny-signature");
    const configuredSecret = process.env.BUNNY_WEBHOOK_SECRET || process.env.BUNNY_STREAM_API_KEY;
    if (process.env.NODE_ENV === "production" && !configuredSecret) {
      await logSecurityEvent({
        eventType: "unauthorized_portal_access",
        severity: "critical",
        description: "Bunny.net Stream webhook rejected because no webhook credential is configured.",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      });

      return NextResponse.json(
        { error: "Webhook authentication is not configured." },
        { status: 503 }
      );
    }

    if (configuredSecret && process.env.NODE_ENV === "production") {
      const normalizedHeader = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

      let isAuthorized = false;
      if (normalizedHeader && normalizedHeader.length === configuredSecret.length) {
        try {
          isAuthorized = crypto.timingSafeEqual(
            Buffer.from(normalizedHeader),
            Buffer.from(configuredSecret)
          );
        } catch {
          isAuthorized = false;
        }
      }

      if (!isAuthorized) {
        logSecurityEvent({
          eventType: "rate_limit_triggered",
          severity: "high",
          description: "🚨 Bunny.net Stream webhook unauthorized invocation attempt rejected.",
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        });

        return NextResponse.json(
          { error: "Unauthorized webhook caller: invalid secret or signature." },
          { status: 401 }
        );
      }
    }

    const payload = await request.json();
    const videoGuid = payload.VideoGuid || payload.videoGuid || payload.guid;
    const status = typeof payload.Status === "number" ? payload.Status : Number(payload.status);
    const duration = typeof payload.Duration === "number" ? Math.round(payload.Duration) : undefined;

    if (!videoGuid) {
      return NextResponse.json(
        { error: "Missing required VideoGuid in webhook payload" },
        { status: 400 }
      );
    }

    // Status 3 or 4 = Video encoding is finished and ready for DRM streaming
    const isReady = status === 3 || status === 4;
    const isFailed = status === 5;

    console.log(`[Bunny Stream Webhook] Video ${videoGuid} status update: ${status} (Ready: ${isReady}, Duration: ${duration}s)`);

    if (isReady) {
      try {
        const updateData: { videoDurationSeconds?: number } = {};
        if (duration && duration > 0) {
          updateData.videoDurationSeconds = duration;
        }

        if (Object.keys(updateData).length > 0) {
          await db
            .update(schema.lesson)
            .set(updateData)
            .where(eq(schema.lesson.videoId, videoGuid));
        }

        await logSecurityEvent({
          eventType: "video_encoding_ready",
          severity: "low",
          description: `Bunny Stream video ${videoGuid} encoding ready for DRM playback`,
          ipAddress: request.headers.get("x-forwarded-for") || "bunny-webhook",
          details: {
            action: "bunny_video_ready",
            videoGuid,
            status,
            duration,
          },
        });
      } catch (dbError) {
        // Fallback gracefully if database record is mock/demo
        console.warn("[Bunny Webhook] Database update note:", dbError);
      }
    }

    if (isFailed) {
      console.error(`[Bunny Stream Webhook] Video encoding failed for GUID: ${videoGuid}`);
      await logSecurityEvent({
        eventType: "video_encoding_failed",
        severity: "medium",
        description: `Bunny Stream video ${videoGuid} encoding failed (Status: ${status})`,
        ipAddress: request.headers.get("x-forwarded-for") || "bunny-webhook",
        details: {
          action: "bunny_video_encoding_failed",
          videoGuid,
          status,
        },
      });
    }

    return NextResponse.json({
      success: true,
      videoGuid,
      status,
      ready: isReady,
    });
  } catch (error) {
    console.error("[Bunny Webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Invalid webhook payload or processing failed" },
      { status: 400 }
    );
  }
}
