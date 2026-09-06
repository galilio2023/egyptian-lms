import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { validateEgyptianPhone, normalizeGovernorate } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      phoneNumber, 
      parentPhoneNumber, 
      parentName, 
      governorate, 
      gradeLevel, 
      schoolName,
      deviceId 
    } = body;

    const cleanStdPhone = validateEgyptianPhone(phoneNumber || "");
    const cleanParentPhone = validateEgyptianPhone(parentPhoneNumber || "");

    if (!cleanStdPhone || !cleanParentPhone) {
      return NextResponse.json(
        { error: "يرجى إدخال أرقام هواتف مصرية صحيحة للطالب وولي الأمر." },
        { status: 400 }
      );
    }

    if (cleanStdPhone === cleanParentPhone) {
      return NextResponse.json(
        { error: "رقم موبايل الطالب ورقم ولي الأمر يجب أن يكونا مختلفين." },
        { status: 400 }
      );
    }

    // Enforce authenticated session (CWE-284 / CWE-639 IDOR protection)
    const session = await auth.api.getSession({ headers: await headers() });
    const targetUserId = session?.user?.id;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "غير مصرح. يجب تسجيل الدخول لإنشاء أو تحديث الملف الشخصي للطالب." },
        { status: 401 }
      );
    }

    // Insert or update student profile in database
    const [existingProfile] = await db
      .select()
      .from(schema.studentProfile)
      .where(eq(schema.studentProfile.userId, targetUserId))
      .limit(1);

    const safeGradeLevel = Math.max(1, Math.min(6, parseInt(gradeLevel || "1", 10)));
    const normalizedGov = normalizeGovernorate(governorate);
    const safeGov = (schema.governorateEnum.enumValues.includes(
      normalizedGov as (typeof schema.governorateEnum.enumValues)[number]
    )
      ? normalizedGov
      : "cairo") as (typeof schema.governorateEnum.enumValues)[number];

    if (existingProfile) {
      await db
        .update(schema.studentProfile)
        .set({
          parentPhoneNumber: cleanParentPhone,
          parentName: parentName?.trim() || existingProfile.parentName || null,
          governorate: safeGov,
          gradeLevel: safeGradeLevel,
          schoolName: schoolName?.trim() || existingProfile.schoolName || null,
        })
        .where(eq(schema.studentProfile.userId, targetUserId));
    } else {
      await db.insert(schema.studentProfile).values({
        userId: targetUserId,
        parentPhoneNumber: cleanParentPhone,
        parentName: parentName?.trim() || null,
        governorate: safeGov,
        gradeLevel: safeGradeLevel,
        schoolName: schoolName?.trim() || null,
        xpPoints: 50, // Welcome signup bonus XP
      });
    }

    // Bind registered device to active session
    if (deviceId && targetUserId) {
      try {
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
      } catch (devErr) {
        console.warn("Could not bind deviceId to session:", devErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم إنشاء وتحديث الملف الشخصي بنجاح.",
    });
  } catch (error: unknown) {
    console.error("Profile registration error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ الملف الشخصي", details: (error as Error)?.message },
      { status: 500 }
    );
  }
}
