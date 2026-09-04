import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { validateEgyptianPhone } from "@/lib/utils";
import { getClientIp, checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limiter";
import { logSecurityEvent } from "@/lib/security/audit-logger";

function maskPhone(phone?: string | null): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length >= 10) {
    return `${cleaned.slice(0, 3)}****${cleaned.slice(-4)}`;
  }
  return "****";
}

export async function POST(request: NextRequest) {
  try {
    const headerList = await headers();
    const clientIp = getClientIp(headerList);
    const userAgent = headerList.get("user-agent") || undefined;

    // Rate Limiting: max 6 device-transfer/verification attempts per 15 minutes per IP
    const rateCheck = checkRateLimit(`device-verify:${clientIp}`, "deviceVerify");
    if (!rateCheck.success) {
      logSecurityEvent({
        eventType: "rate_limit_triggered",
        severity: "high",
        ipAddress: clientIp,
        userAgent,
        description: "تجاوز الحد الأقصى لمحاولات التحقق من الجهاز ونقل الحساب (Rate Limit 6/15min)",
        details: { limit: rateCheck.limit, retryAfterSeconds: rateCheck.resetSeconds },
      });

      return createRateLimitResponse(
        rateCheck,
        "تم تجاوز الحد الأقصى لمحاولات التحقق من الجهاز ونقل الحساب. يرجى الانتظار والمحاولة لاحقاً."
      );
    }

    const session = await auth.api.getSession({ headers: headerList });
    const body = await request.json();
    const { 
      deviceId, 
      phoneNumber, 
      parentConfirmationPhone 
    } = body as { 
      deviceId: string; 
      phoneNumber?: string;
      parentConfirmationPhone?: string;
    };

    if (!deviceId) {
      return NextResponse.json({ error: "معرف الجهاز مطلوب" }, { status: 400 });
    }

    let targetUserId = session?.user?.id;

    if (!targetUserId && phoneNumber) {
      const cleanPhone = validateEgyptianPhone(phoneNumber);
      if (cleanPhone) {
        try {
          const [userRecord] = await db
            .select({ id: schema.user.id })
            .from(schema.user)
            .where(eq(schema.user.phoneNumber, cleanPhone))
            .limit(1);
          if (userRecord) targetUserId = userRecord.id;
        } catch {
          // Fallback
        }
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ success: true, verified: true });
    }

    try {
      // 1. Check if student profile is banned
      const [profile] = await db
        .select()
        .from(schema.studentProfile)
        .where(eq(schema.studentProfile.userId, targetUserId))
        .limit(1);

      if (profile?.isBanned) {
        logSecurityEvent({
          eventType: "unauthorized_portal_access",
          severity: "high",
          userId: targetUserId,
          studentPhone: phoneNumber,
          ipAddress: clientIp,
          userAgent,
          description: "محاولة دخول من حساب طالب محظور وموقوف عن الخدمة.",
        });

        return NextResponse.json(
          { 
            error: "تم إيقاف هذا الحساب مؤقتاً لمخالفة شروط الاستخدام. يرجى التواصل مع الدعم الفني.",
            isBanned: true 
          },
          { status: 403 }
        );
      }

      // 2. Find any active sessions for this user on a different device
      const existingSessions = await db
        .select()
        .from(schema.session)
        .where(eq(schema.session.userId, targetUserId));

      const otherDeviceSession = existingSessions.find(
        (s) => s.deviceId && s.deviceId !== deviceId && new Date(s.expiresAt) > new Date()
      );

      if (otherDeviceSession) {
        // Check if parent confirmed device transfer
        if (parentConfirmationPhone && profile?.parentPhoneNumber) {
          const cleanParentAttempt = parentConfirmationPhone.replace(/\D/g, "");
          const cleanRegisteredParent = profile.parentPhoneNumber.replace(/\D/g, "");

          if (cleanParentAttempt === cleanRegisteredParent) {
            // Authorized device transfer: invalidate old device sessions
            await db
              .update(schema.session)
              .set({ expiresAt: new Date(), updatedAt: new Date() })
              .where(
                and(
                  eq(schema.session.userId, targetUserId),
                  ne(schema.session.deviceId, deviceId)
                )
              );

            // Bind current session to the new device
            if (session?.session?.id) {
              await db
                .update(schema.session)
                .set({ deviceId, updatedAt: new Date() })
                .where(eq(schema.session.id, session.session.id));
            } else {
              const [latestSession] = await db
                .select()
                .from(schema.session)
                .where(eq(schema.session.userId, targetUserId))
                .limit(1);

              if (latestSession) {
                await db
                  .update(schema.session)
                  .set({ deviceId, updatedAt: new Date() })
                  .where(eq(schema.session.id, latestSession.id));
              }
            }

            logSecurityEvent({
              eventType: "device_transferred",
              severity: "medium",
              userId: targetUserId,
              studentPhone: phoneNumber,
              ipAddress: clientIp,
              userAgent,
              description: "تم التحقق من ولي الأمر ونقل الحساب بنجاح إلى هذا الجهاز.",
              details: { newDeviceId: deviceId, previousDeviceId: otherDeviceSession.deviceId },
            });

            return NextResponse.json({
              success: true,
              verified: true,
              transferred: true,
              message: "تم التحقق من ولي الأمر ونقل الحساب إلى هذا الجهاز بنجاح، وإلغاء تسجيل الدخول من الجهاز السابق.",
            });
          } else {
            logSecurityEvent({
              eventType: "device_transfer_failed",
              severity: "high",
              userId: targetUserId,
              studentPhone: phoneNumber,
              ipAddress: clientIp,
              userAgent,
              description: "محاولة نقل جهاز فاشلة: رقم ولي الأمر المدخل غير مطابق للمسجل.",
              details: { attemptedParentPhone: parentConfirmationPhone },
            });

            return NextResponse.json(
              {
                error: "رقم هاتف ولي الأمر غير مطابق للرقم المسجل في ملف الطالب. يرجى التأكد من الرقم.",
                deviceLocked: true,
                requiresParentTransfer: true,
                parentPhoneMasked: maskPhone(profile.parentPhoneNumber),
              },
              { status: 403 }
            );
          }
        }

        logSecurityEvent({
          eventType: "device_locked",
          severity: "medium",
          userId: targetUserId,
          studentPhone: phoneNumber,
          ipAddress: clientIp,
          userAgent,
          description: "تم قفل الحساب: محاولة فتح الحساب من جهاز آخر غير مسجل.",
          details: { attemptedDeviceId: deviceId, activeDeviceId: otherDeviceSession.deviceId },
        });

        // Return device locked error with transfer prompt
        return NextResponse.json(
          {
            error: "حساب الطالب مسجل بالفعل على جهاز آخر. وفقاً لسياسة الأكاديمية لا يمكن فتح الحساب إلا من جهاز واحد فقط لمنع مشاركة الحساب.",
            deviceLocked: true,
            requiresParentTransfer: true,
            parentPhoneMasked: maskPhone(profile?.parentPhoneNumber),
          },
          { status: 403 }
        );
      }

      // 3. Bind current session to deviceId
      if (session?.session?.id) {
        await db
          .update(schema.session)
          .set({ deviceId, updatedAt: new Date() })
          .where(eq(schema.session.id, session.session.id));
      } else {
        // Update the most recently created session for this user
        const [latestSession] = await db
          .select()
          .from(schema.session)
          .where(eq(schema.session.userId, targetUserId))
          .limit(1);

        if (latestSession) {
          await db
            .update(schema.session)
            .set({ deviceId, updatedAt: new Date() })
            .where(eq(schema.session.id, latestSession.id));
        }
      }
    } catch (dbErr) {
      console.warn("Device verification DB note:", dbErr);
    }

    return NextResponse.json({ success: true, verified: true });
  } catch (error: unknown) {
    console.error("Device verification error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحقق من الجهاز", details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
