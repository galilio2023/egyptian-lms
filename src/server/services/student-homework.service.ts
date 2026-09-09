import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { and, eq, gt, inArray, isNull, or, desc } from "drizzle-orm";
import { INITIAL_HOMEWORK_ASSIGNMENTS, INITIAL_HOMEWORK_SUBMISSIONS, type MockHomeworkSubmission } from "@/lib/db/mock-data";
import { DomainError, NotFoundError, ForbiddenError } from "@/server/errors";

export interface StudentHomeworkAssignmentDto {
  id: string;
  unitId: string;
  unitTitle: string;
  lessonId?: string | null;
  title: string;
  instructions: string;
  pageNumber: string;
  maxScore: number;
  dueDate: string | null;
  status: string;
  submission: {
    id: string;
    status: string;
    score?: number | null;
    feedbackNotes?: string | null;
    annotatedImages?: unknown;
    studentImages?: unknown;
    audioVoiceNoteUrl?: string | null;
    submittedAt?: string | null;
    gradedAt?: string | null;
  } | null;
}

export interface StudentHomeworkResult {
  success: boolean;
  assignments: StudentHomeworkAssignmentDto[];
  pendingCount: number;
  completedCount: number;
  message?: string;
  isFallback?: boolean;
}

/**
 * Retrieves all homework assignments and submissions for units the student is actively enrolled in.
 */
export async function getStudentHomeworkData(userId: string): Promise<StudentHomeworkResult> {
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

  if (enrolledUnitIds.length === 0) {
    return {
      success: true,
      assignments: [],
      pendingCount: 0,
      completedCount: 0,
      message: "لا توجد واجبات مطلوبة حالياً لعدم وجود اشتراكات نشطة.",
    };
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

    return {
      success: true,
      assignments,
      pendingCount: fallbackPendingCount,
      completedCount: fallbackCompletedCount,
      isFallback: true,
    };
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

  const mappedAssignments: StudentHomeworkAssignmentDto[] = dbAssignments.map((assignment) => {
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

  return {
    success: true,
    assignments: mappedAssignments,
    pendingCount,
    completedCount,
  };
}

export interface SubmitHomeworkParams {
  userId: string;
  studentName: string;
  studentPhone: string;
  assignmentId: string;
  studentImages: Array<{ pageNumber: number; imageUrl: string }>;
  audioVoiceNoteUrl?: string;
}

/**
 * Submits student homework assignment images or voice note with enrollment verification and idempotency.
 */
export async function submitStudentHomework(params: SubmitHomeworkParams): Promise<{
  success: boolean;
  message: string;
  submission: MockHomeworkSubmission;
}> {
  const { userId, studentName, studentPhone, assignmentId, studentImages, audioVoiceNoteUrl } = params;
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignmentId);
  
  let submissionId = `sub-${Date.now()}`;
  let assignmentTitle = "كراسة الواجب المنزلي";
  let maxScore = 10;
  let unitTitle = "الوحدة التدريبية";

  if (isUUID) {
    const [dbAssignment] = await db
      .select()
      .from(schema.homeworkAssignment)
      .where(eq(schema.homeworkAssignment.id, assignmentId))
      .limit(1);

    if (!dbAssignment) {
      throw new NotFoundError("عذراً، لم يتم العثور على الواجب المطلوب.");
    }

    assignmentTitle = dbAssignment.title;
    maxScore = dbAssignment.maxScore;

    // Check active enrollment in assignment unit
    if (dbAssignment.unitId) {
      const now = new Date();
      const [activeEnrollment] = await db
        .select({ id: schema.enrollment.id })
        .from(schema.enrollment)
        .where(
          and(
            eq(schema.enrollment.userId, userId),
            eq(schema.enrollment.unitId, dbAssignment.unitId),
            eq(schema.enrollment.isActive, true),
            or(isNull(schema.enrollment.expiresAt), gt(schema.enrollment.expiresAt, now))
          )
        )
        .limit(1);

      if (!activeEnrollment) {
        throw new ForbiddenError("عذراً، يجب أن تكون مشتركاً ومفعّلاً في هذه الوحدة لتسليم الواجب.");
      }
    }

    // Check if student already has a pending submission
    const [existingPending] = await db
      .select()
      .from(schema.homeworkSubmission)
      .where(
        and(
          eq(schema.homeworkSubmission.assignmentId, assignmentId),
          eq(schema.homeworkSubmission.userId, userId),
          eq(schema.homeworkSubmission.status, "submitted")
        )
      )
      .limit(1);

    if (existingPending) {
      const hasNewImages = studentImages && studentImages.length > 0;
      await db
        .update(schema.homeworkSubmission)
        .set({
          ...(hasNewImages ? { studentImages } : {}),
          ...(audioVoiceNoteUrl ? { audioVoiceNoteUrl } : {}),
          updatedAt: new Date(),
        })
        .where(eq(schema.homeworkSubmission.id, existingPending.id));
      submissionId = existingPending.id;
    } else {
      const [inserted] = await db
        .insert(schema.homeworkSubmission)
        .values({
          assignmentId,
          userId,
          studentImages,
          audioVoiceNoteUrl: audioVoiceNoteUrl || null,
          status: "submitted",
        })
        .returning({ id: schema.homeworkSubmission.id });
      if (inserted?.id) submissionId = inserted.id;
    }
  } else {
    const mockAssignment = INITIAL_HOMEWORK_ASSIGNMENTS.find((a) => a.id === assignmentId);
    if (!mockAssignment) {
      throw new NotFoundError("عذراً، لم يتم العثور على الواجب المطلوب.");
    }
    assignmentTitle = mockAssignment.title;
    maxScore = mockAssignment.maxScore;
    unitTitle = mockAssignment.unitTitle;
  }

  const createdSubmission: MockHomeworkSubmission = {
    id: submissionId,
    assignmentId,
    assignmentTitle,
    studentId: userId,
    studentName,
    studentPhone,
    parentPhone: "01000000000",
    gradeTitle: unitTitle,
    studentImages,
    audioVoiceNoteUrl: audioVoiceNoteUrl || undefined,
    status: "submitted",
    maxScore,
    submittedAt: "الآن",
  };

  return {
    success: true,
    message: audioVoiceNoteUrl
      ? "تم تسليم كراسة الواجب والملاحظة الصوتية بنجاح وجاري المراجعة والتصحيح بواسطة فريق المعلم 🎙️📜"
      : "تم تسليم كراسة الواجب بنجاح وجاري المراجعة والتصحيح بواسطة فريق المعلم.",
    submission: createdSubmission,
  };
}
