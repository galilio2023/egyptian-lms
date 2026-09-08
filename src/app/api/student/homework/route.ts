import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { and, eq, gt, inArray, isNull, or, desc } from "drizzle-orm";
import { INITIAL_HOMEWORK_ASSIGNMENTS, INITIAL_HOMEWORK_SUBMISSIONS } from "@/lib/db/mock-data";

export async function GET() {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول لعرض واجبات الطالب." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const now = new Date();

    // 1. Query active, non-expired enrollments for the student
    const activeEnrollments = await db
      .select({
        unitId: schema.enrollment.unitId,
        unitTitle: schema.courseUnit.title,
      })
      .from(schema.enrollment)
      .leftJoin(schema.courseUnit, eq(schema.enrollment.unitId, schema.courseUnit.id))
      .where(
        and(
          eq(schema.enrollment.userId, userId),
          eq(schema.enrollment.isActive, true),
          or(
            isNull(schema.enrollment.expiresAt),
            gt(schema.enrollment.expiresAt, now)
          )
        )
      );

    const enrolledUnitIds = activeEnrollments
      .map((e) => e.unitId)
      .filter((id): id is string => Boolean(id));

    // If no active enrollments exist, return empty list
    if (enrolledUnitIds.length === 0) {
      return NextResponse.json({
        success: true,
        assignments: [],
        pendingCount: 0,
        completedCount: 0,
        message: "لا توجد واجبات مطلوبة حالياً لعدم وجود اشتراكات نشطة.",
      });
    }

    // 2. Query homework assignments for enrolled units
    const dbAssignments = await db
      .select({
        id: schema.homeworkAssignment.id,
        unitId: schema.homeworkAssignment.unitId,
        unitTitle: schema.courseUnit.title,
        lessonId: schema.homeworkAssignment.lessonId,
        title: schema.homeworkAssignment.title,
        instructions: schema.homeworkAssignment.instructions,
        pageNumber: schema.homeworkAssignment.pageNumber,
        maxScore: schema.homeworkAssignment.maxScore,
        dueDate: schema.homeworkAssignment.dueDate,
        createdAt: schema.homeworkAssignment.createdAt,
      })
      .from(schema.homeworkAssignment)
      .leftJoin(schema.courseUnit, eq(schema.homeworkAssignment.unitId, schema.courseUnit.id))
      .where(inArray(schema.homeworkAssignment.unitId, enrolledUnitIds))
      .orderBy(desc(schema.homeworkAssignment.createdAt));

    // Fallback to initial homework presets if database has no rows for these units yet
    if (dbAssignments.length === 0) {
      const filteredAssignments = INITIAL_HOMEWORK_ASSIGNMENTS.filter((a) =>
        enrolledUnitIds.includes(a.unitId)
      );
      const studentSubmissions = INITIAL_HOMEWORK_SUBMISSIONS.filter(
        (s) => s.studentId === userId
      );

      let fallbackPendingCount = 0;
      let fallbackCompletedCount = 0;

      const assignments = filteredAssignments.map((a) => {
        const sub = studentSubmissions.find((s) => s.assignmentId === a.id);
        const status = sub ? sub.status : "pending_submission";
        if (status === "graded") {
          fallbackCompletedCount++;
        } else {
          fallbackPendingCount++;
        }
        return {
          id: a.id,
          unitId: a.unitId,
          unitTitle: "الوحدة التأسيسية",
          title: a.title,
          instructions: a.instructions,
          pageNumber: a.pageNumber,
          maxScore: a.maxScore,
          dueDate: a.dueDate,
          submission: sub || null,
          status,
        };
      });

      return NextResponse.json({
        success: true,
        assignments,
        pendingCount: fallbackPendingCount,
        completedCount: fallbackCompletedCount,
        isFallback: true,
      });
    }

    // 3. Query student's submissions for these assignments
    const assignmentIds = dbAssignments.map((a) => a.id);
    const dbSubmissions = await db
      .select()
      .from(schema.homeworkSubmission)
      .where(
        and(
          eq(schema.homeworkSubmission.userId, userId),
          inArray(schema.homeworkSubmission.assignmentId, assignmentIds)
        )
      );

    const submissionsMap = new Map(
      dbSubmissions.map((s) => [s.assignmentId, s])
    );

    let pendingCount = 0;
    let completedCount = 0;

    const mappedAssignments = dbAssignments.map((assignment) => {
      const sub = submissionsMap.get(assignment.id) || null;
      const status = sub ? sub.status : "pending_submission";

      if (status === "graded") {
        completedCount++;
      } else {
        pendingCount++;
      }

      return {
        id: assignment.id,
        unitId: assignment.unitId,
        unitTitle: assignment.unitTitle || "الوحدة الدراسية",
        lessonId: assignment.lessonId,
        title: assignment.title,
        instructions: assignment.instructions || "يرجى حل تدريبات كتاب النشاط ورفع صورة الصفحات بوضوح.",
        pageNumber: assignment.pageNumber || "صـ 14 - 15",
        maxScore: assignment.maxScore || 10,
        dueDate: assignment.dueDate ? assignment.dueDate.toISOString() : null,
        status,
        submission: sub
          ? {
              id: sub.id,
              status: sub.status,
              score: sub.score,
              feedbackNotes: sub.feedbackNotes,
              annotatedImages: sub.annotatedImages,
              studentImages: sub.studentImages,
              audioVoiceNoteUrl: sub.audioVoiceNoteUrl,
              submittedAt: sub.createdAt ? sub.createdAt.toISOString() : null,
              gradedAt: sub.gradedAt ? sub.gradedAt.toISOString() : null,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      assignments: mappedAssignments,
      pendingCount,
      completedCount,
    });
  } catch (error: unknown) {
    console.error("Student homework fetch error:", error);
    return NextResponse.json({
      success: true,
      assignments: INITIAL_HOMEWORK_ASSIGNMENTS.map((a) => ({
        id: a.id,
        unitId: a.unitId,
        unitTitle: "الوحدة التأسيسية",
        title: a.title,
        instructions: a.instructions,
        pageNumber: a.pageNumber,
        maxScore: a.maxScore,
        dueDate: a.dueDate,
        submission: null,
        status: "pending_submission",
      })),
      pendingCount: 1,
      completedCount: 0,
      isFallback: true,
    });
  }
}
