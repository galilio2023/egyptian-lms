import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc, and, count } from "drizzle-orm";
import type { TimelineEvent } from "@/lib/types/timeline";

export type { TimelineEvent };

export async function GET() {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all progress sources in parallel
    const [
      lessonProgressRows,
      quizAttemptRows,
      homeworkSubmissionRows,
      enrollmentRows,
      [lessonProgressCount],
      [passedQuizCount],
    ] = await Promise.all([
        // Completed lessons with lesson title
        db
          .select({
            id: schema.lessonProgress.id,
            lessonId: schema.lessonProgress.lessonId,
            lessonTitle: schema.lesson.title,
            unitTitle: schema.courseUnit.title,
            xpAwarded: schema.lessonProgress.xpAwarded,
            completedAt: schema.lessonProgress.completedAt,
          })
          .from(schema.lessonProgress)
          .leftJoin(schema.lesson, eq(schema.lessonProgress.lessonId, schema.lesson.id))
          .leftJoin(schema.courseUnit, eq(schema.lesson.unitId, schema.courseUnit.id))
          .where(eq(schema.lessonProgress.userId, userId))
          .orderBy(desc(schema.lessonProgress.completedAt)),

        // Quiz attempts
        db
          .select({
            id: schema.quizAttempt.id,
            quizId: schema.quizAttempt.quizId,
            quizTitle: schema.quiz.title,
            score: schema.quizAttempt.score,
            totalPossibleScore: schema.quizAttempt.totalPossibleScore,
            passed: schema.quizAttempt.passed,
            createdAt: schema.quizAttempt.createdAt,
          })
          .from(schema.quizAttempt)
          .leftJoin(schema.quiz, eq(schema.quizAttempt.quizId, schema.quiz.id))
          .where(eq(schema.quizAttempt.userId, userId))
          .orderBy(desc(schema.quizAttempt.createdAt)),

        // Graded homework submissions
        db
          .select({
            id: schema.homeworkSubmission.id,
            assignmentId: schema.homeworkSubmission.assignmentId,
            assignmentTitle: schema.homeworkAssignment.title,
            unitTitle: schema.courseUnit.title,
            score: schema.homeworkSubmission.score,
            maxScore: schema.homeworkAssignment.maxScore,
            status: schema.homeworkSubmission.status,
            gradedAt: schema.homeworkSubmission.gradedAt,
            createdAt: schema.homeworkSubmission.createdAt,
          })
          .from(schema.homeworkSubmission)
          .leftJoin(
            schema.homeworkAssignment,
            eq(schema.homeworkSubmission.assignmentId, schema.homeworkAssignment.id)
          )
          .leftJoin(
            schema.courseUnit,
            eq(schema.homeworkAssignment.unitId, schema.courseUnit.id)
          )
          .where(
            and(
              eq(schema.homeworkSubmission.userId, userId),
              eq(schema.homeworkSubmission.status, "graded")
            )
          )
          .orderBy(desc(schema.homeworkSubmission.gradedAt)),

        // Enrollments
        db
          .select({
            id: schema.enrollment.id,
            unitTitle: schema.courseUnit.title,
            enrolledAt: schema.enrollment.enrolledAt,
          })
          .from(schema.enrollment)
          .leftJoin(schema.courseUnit, eq(schema.enrollment.unitId, schema.courseUnit.id))
          .where(eq(schema.enrollment.userId, userId))
          .orderBy(desc(schema.enrollment.enrolledAt)),

        db
          .select({ value: count() })
          .from(schema.lessonProgress)
          .where(eq(schema.lessonProgress.userId, userId)),

        db
          .select({ value: count() })
          .from(schema.quizAttempt)
          .where(
            and(
              eq(schema.quizAttempt.userId, userId),
              eq(schema.quizAttempt.passed, true)
            )
          ),
      ]);

    // Merge all into a unified timeline
    const events: TimelineEvent[] = [
      ...lessonProgressRows.map((r) => ({
        id: `lesson-${r.id}`,
        type: "lesson_completed" as const,
        title: r.lessonTitle ?? "محاضرة تعليمية",
        subtitle: r.unitTitle ?? undefined,
        xpEarned: r.xpAwarded,
        timestamp: r.completedAt.toISOString(),
        icon: "🎬",
      })),

      ...quizAttemptRows.map((r) => ({
        id: `quiz-${r.id}`,
        type: (r.passed ? "quiz_passed" : "quiz_failed") as TimelineEvent["type"],
        title: r.quizTitle ?? "اختبار تحدي",
        subtitle: r.passed ? "اجتزت الاختبار بنجاح! 🏆" : "لم تجتز الاختبار هذه المرة",
        score: r.score,
        maxScore: r.totalPossibleScore,
        passed: r.passed,
        xpEarned: r.passed ? 50 : 0,
        timestamp: r.createdAt.toISOString(),
        icon: r.passed ? "🏅" : "📝",
      })),

      ...homeworkSubmissionRows.map((r) => ({
        id: `hw-${r.id}`,
        type: "homework_graded" as const,
        title: r.assignmentTitle ?? "واجب منزلي",
        subtitle: r.unitTitle ?? undefined,
        score: r.score ?? undefined,
        maxScore: r.maxScore ?? undefined,
        timestamp: (r.gradedAt ?? r.createdAt).toISOString(),
        icon: "📋",
      })),

      ...enrollmentRows.map((r) => ({
        id: `enroll-${r.id}`,
        type: "enrollment" as const,
        title: `انضممت إلى: ${r.unitTitle ?? "وحدة جديدة"}`,
        subtitle: "مبروك! تم تفعيل الوحدة في حسابك 🎉",
        timestamp: r.enrolledAt.toISOString(),
        icon: "🎓",
      })),
    ];

    // Sort by timestamp descending (most recent first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      events: events.slice(0, 30), // Cap at 30 most recent
      totalCompleted: lessonProgressCount.value,
      totalQuizzesPassed: passedQuizCount.value,
    });
  } catch (error) {
    console.error("[progress-timeline] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load progress timeline" },
      { status: 500 }
    );
  }
}
