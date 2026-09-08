import { NextRequest, NextResponse } from "next/server";
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
