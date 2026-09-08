import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logSecurityEvent } from "@/lib/security/audit-logger";

/**
 * Bunny.net Stream Webhook Listener
 * Status codes:
 * 0: Queued
 * 1: Processing
 * 2: Encoding
 * 3: Finished / Ready for HLS streaming
 * 4: Resolution Failed
 * 5: Failed
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json({ error: "Empty webhook payload" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody) as {
      VideoGuid?: string;
      videoGuid?: string;
      LibraryId?: number | string;
      Title?: string;
      Status?: number;
      status?: number;
      Duration?: number;
      duration?: number;
    };

    const videoId = payload.VideoGuid || payload.videoGuid;
    const status = payload.Status ?? payload.status;
    const durationSeconds = payload.Duration ?? payload.duration;

    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId / VideoGuid" }, { status: 400 });
    }

    console.log(`[Bunny.net Stream Webhook] Video: ${videoId}, Status: ${status}, Duration: ${durationSeconds}s`);

    // Status 3 = Finished (Ready)
    if (status === 3) {
      try {
        const updateData: { videoDurationSeconds?: number } = {};
        if (typeof durationSeconds === "number" && durationSeconds > 0) {
          updateData.videoDurationSeconds = Math.round(durationSeconds);
        }

        if (Object.keys(updateData).length > 0) {
          await db
            .update(schema.lesson)
            .set(updateData)
            .where(eq(schema.lesson.videoId, videoId));
        }

        logSecurityEvent({
          eventType: "live_session_attended",
          severity: "low",
          description: `تم اكتمال تشفير ومعالجة فيديو Bunny.net بنجاح: ${videoId}`,
          details: { videoId, durationSeconds },
        });
      } catch (dbErr) {
        console.warn("Bunny webhook DB update note:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      videoId,
      status,
      processedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Bunny webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing error", details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
