import { pgTable, text, timestamp, boolean, integer, jsonb, pgEnum, uuid, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('user_role', ['student', 'parent', 'assistant', 'teacher', 'admin']);

export const governorateEnum = pgEnum('governorate', [
  'cairo', 'giza', 'alexandria', 'dakahlia', 'red_sea', 'beheira', 'fayoum',
  'gharbiya', 'ismailia', 'menofia', 'minya', 'qaliubiya', 'new_valley',
  'suez', 'aswan', 'assiut', 'beni_suef', 'port_said', 'damietta', 'sharkia',
  'south_sinai', 'kafr_el_sheikh', 'matrouh', 'luxor', 'qena', 'north_sinai', 'sohag'
]);

export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded', 'manual_review']);
export const paymentMethodEnum = pgEnum('payment_method', ['paymob_card', 'paymob_wallet', 'fawry', 'instapay_manual', 'wallet_manual']);
export const homeworkStatusEnum = pgEnum('homework_status', ['submitted', 'in_review', 'graded', 'rejected']);

// Better Auth Core Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phoneNumber: text('phone_number').unique().notNull(), // Primary Egyptian Phone (010, 011, 012, 015)
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  role: roleEnum('role').default('student').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  deviceId: text('device_id'), // Used for single-device restriction
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('session_user_id_idx').on(table.userId),
]);

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  issuer: text('issuer'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Student Profile Extension
export const studentProfile = pgTable('student_profile', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).unique().notNull(),
  parentPhoneNumber: text('parent_phone_number').notNull(),
  parentName: text('parent_name'),
  governorate: governorateEnum('governorate').notNull().default('cairo'),
  gradeLevel: integer('grade_level').notNull().default(1), // 1 to 6
  schoolName: text('school_name'),
  xpPoints: integer('xp_points').default(0).notNull(),
  isBanned: boolean('is_banned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Academic Curriculum
export const grade = pgTable('grade', {
  id: uuid('id').defaultRandom().primaryKey(),
  titleArabic: text('title_arabic').notNull(), // e.g. "الصف الأول الابتدائي"
  titleEnglish: text('title_english').notNull(), // e.g. "Grade 1"
  slug: text('slug').unique().notNull(), // "grade-1"
  gradeNumber: integer('grade_number').notNull(),
  badgeColor: text('badge_color').default('#4f46e5'),
  orderIndex: integer('order_index').default(0).notNull(),
});

export const courseUnit = pgTable('course_unit', {
  id: uuid('id').defaultRandom().primaryKey(),
  gradeId: uuid('grade_id').references(() => grade.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(), // "Unit 1: Back to School"
  slug: text('slug').notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  price: integer('price_egp').notNull().default(250), // Price in EGP
  orderIndex: integer('order_index').default(0).notNull(),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('course_unit_grade_id_idx').on(table.gradeId),
]);

export const lesson = pgTable('lesson', {
  id: uuid('id').defaultRandom().primaryKey(),
  unitId: uuid('unit_id').references(() => courseUnit.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(), // "Lesson 1: Phonics & Greetings"
  slug: text('slug').notNull(),
  videoProvider: text('video_provider').default('bunny').notNull(),
  videoId: text('video_id').notNull(), // Bunny / Cloudflare Stream Video ID or direct URL
  videoDurationSeconds: integer('video_duration_seconds').default(1200),
  pdfAttachmentUrl: text('pdf_attachment_url'),
  isFreePreview: boolean('is_free_preview').default(false).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('lesson_unit_id_idx').on(table.unitId),
]);

// Interactive Quizzes & Exams
export const quiz = pgTable('quiz', {
  id: uuid('id').defaultRandom().primaryKey(),
  lessonId: uuid('lesson_id').references(() => lesson.id, { onDelete: 'cascade' }),
  unitId: uuid('unit_id').references(() => courseUnit.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  timeLimitMinutes: integer('time_limit_minutes').default(15).notNull(),
  passPercentage: integer('pass_percentage').default(60).notNull(),
  maxAttempts: integer('max_attempts').default(3).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export const quizQuestion = pgTable('quiz_question', {
  id: uuid('id').defaultRandom().primaryKey(),
  quizId: uuid('quiz_id').references(() => quiz.id, { onDelete: 'cascade' }).notNull(),
  questionText: text('question_text').notNull(),
  questionAudioUrl: text('question_audio_url'), // For pronunciation audio listening
  questionImageUrl: text('question_image_url'),
  questionType: text('question_type').default('multiple_choice').notNull(), // multiple_choice, true_false, reorder
  options: jsonb('options').$type<QuizOption[]>().notNull(),
  explanation: text('explanation'),
  points: integer('points').default(1).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
});

export const quizAttempt = pgTable('quiz_attempt', {
  id: uuid('id').defaultRandom().primaryKey(),
  quizId: uuid('quiz_id').references(() => quiz.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  score: integer('score').notNull(),
  totalPossibleScore: integer('total_possible_score').notNull(),
  passed: boolean('passed').notNull(),
  timeSpentSeconds: integer('time_spent_seconds').notNull(),
  userAnswers: jsonb('user_answers').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('quiz_attempt_user_id_idx').on(table.userId),
  index('quiz_attempt_quiz_id_idx').on(table.quizId),
]);

// Enrollments & Orders
export const enrollment = pgTable('enrollment', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  unitId: uuid('unit_id').references(() => courseUnit.id, { onDelete: 'cascade' }).notNull(),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true).notNull(),
}, (table) => [
  index('enrollment_user_id_idx').on(table.userId),
  index('enrollment_unit_id_idx').on(table.unitId),
  uniqueIndex('enrollment_user_unit_unique_idx').on(table.userId, table.unitId),
]);

export const order = pgTable('order', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  unitId: uuid('unit_id').references(() => courseUnit.id).notNull(),
  amountEgp: integer('amount_egp').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('pending').notNull(),
  gatewayOrderId: text('gateway_order_id').unique(),
  gatewayTransactionId: text('gateway_transaction_id').unique(),
  idempotencyKey: text('idempotency_key').unique(), // Financial idempotency key to prevent double charging
  receiptImageUrl: text('receipt_image_url'), // For InstaPay/Vodafone Cash screenshot
  referenceNumber: text('reference_number'), // Sender's wallet or InstaPay ref
  reviewerNotes: text('reviewer_notes'),
  receiptHash: text('receipt_hash'), // MD5/SHA256 fingerprint for duplicate receipt detection
  ocrData: jsonb('ocr_data').$type<{
    extractedReference?: string;
    extractedAmount?: number;
    extractedDate?: string;
    matchedSender?: string;
    confidenceScore?: number;
    isSuspectedDuplicate?: boolean;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('order_user_id_idx').on(table.userId),
  index('order_idempotency_key_idx').on(table.idempotencyKey),
]);

// Center Scratch Card / Voucher Codes (كروت شحن السناتر والمكتبات)
export const voucherCode = pgTable('voucher_code', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').unique().notNull(), // e.g. "ELITE-GR1-998271"
  unitId: uuid('unit_id').references(() => courseUnit.id, { onDelete: 'cascade' }).notNull(),
  isRedeemed: boolean('is_redeemed').default(false).notNull(),
  redeemedByUserId: text('redeemed_by_user_id').references(() => user.id, { onDelete: 'set null' }),
  redeemedAt: timestamp('redeemed_at'),
  batchName: text('batch_name').default('دفعة سناتر أكتوبر 2026'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('voucher_code_idx').on(table.code),
  index('voucher_unit_id_idx').on(table.unitId),
]);

// Relations
export const userRelations = relations(user, ({ one, many }) => ({
  studentProfile: one(studentProfile, {
    fields: [user.id],
    references: [studentProfile.userId],
  }),
  enrollments: many(enrollment),
  orders: many(order),
  quizAttempts: many(quizAttempt),
  redeemedVouchers: many(voucherCode),
}));

export const studentProfileRelations = relations(studentProfile, ({ one }) => ({
  user: one(user, {
    fields: [studentProfile.userId],
    references: [user.id],
  }),
}));

export const gradeRelations = relations(grade, ({ many }) => ({
  units: many(courseUnit),
}));

export const courseUnitRelations = relations(courseUnit, ({ one, many }) => ({
  grade: one(grade, {
    fields: [courseUnit.gradeId],
    references: [grade.id],
  }),
  lessons: many(lesson),
  quizzes: many(quiz),
  enrollments: many(enrollment),
  orders: many(order),
  vouchers: many(voucherCode),
}));

export const voucherCodeRelations = relations(voucherCode, ({ one }) => ({
  unit: one(courseUnit, {
    fields: [voucherCode.unitId],
    references: [courseUnit.id],
  }),
  redeemedByUser: one(user, {
    fields: [voucherCode.redeemedByUserId],
    references: [user.id],
  }),
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  unit: one(courseUnit, {
    fields: [lesson.unitId],
    references: [courseUnit.id],
  }),
  quizzes: many(quiz),
}));

export const quizRelations = relations(quiz, ({ one, many }) => ({
  lesson: one(lesson, {
    fields: [quiz.lessonId],
    references: [lesson.id],
  }),
  unit: one(courseUnit, {
    fields: [quiz.unitId],
    references: [courseUnit.id],
  }),
  questions: many(quizQuestion),
  attempts: many(quizAttempt),
}));

export const quizQuestionRelations = relations(quizQuestion, ({ one }) => ({
  quiz: one(quiz, {
    fields: [quizQuestion.quizId],
    references: [quiz.id],
  }),
}));

export const enrollmentRelations = relations(enrollment, ({ one }) => ({
  user: one(user, {
    fields: [enrollment.userId],
    references: [user.id],
  }),
  unit: one(courseUnit, {
    fields: [enrollment.unitId],
    references: [courseUnit.id],
  }),
}));

export const orderRelations = relations(order, ({ one }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  unit: one(courseUnit, {
    fields: [order.unitId],
    references: [courseUnit.id],
  }),
}));

// Homework Assignment (كراسة الواجب والمهام المنزلية)
export const homeworkAssignment = pgTable('homework_assignment', {
  id: uuid('id').defaultRandom().primaryKey(),
  unitId: uuid('unit_id').references(() => courseUnit.id, { onDelete: 'cascade' }).notNull(),
  lessonId: uuid('lesson_id').references(() => lesson.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // e.g. "واجب الحروف وتدريبات كتاب النشاط صـ 14"
  instructions: text('instructions'),
  pageNumber: text('page_number'), // e.g. "صـ 14 - 15"
  maxScore: integer('max_score').default(10).notNull(),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('homework_assignment_unit_id_idx').on(table.unitId),
]);

export interface StudentUploadedPage {
  pageNumber: number;
  imageUrl: string;
}

export interface CanvasAnnotationStroke {
  tool: 'pen' | 'highlighter' | 'check' | 'cross' | 'star' | 'text';
  color: string;
  size: number;
  points?: Array<{ x: number; y: number }>;
  text?: string;
  x?: number;
  y?: number;
}

export const homeworkSubmission = pgTable('homework_submission', {
  id: uuid('id').defaultRandom().primaryKey(),
  assignmentId: uuid('assignment_id').references(() => homeworkAssignment.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  studentImages: jsonb('student_images').$type<StudentUploadedPage[]>().notNull(),
  status: homeworkStatusEnum('status').default('submitted').notNull(),
  score: integer('score'),
  feedbackNotes: text('feedback_notes'),
  annotatedImages: jsonb('annotated_images').$type<Array<{ pageIndex: number; dataUrl: string }>>(),
  gradedByUserId: text('graded_by_user_id').references(() => user.id, { onDelete: 'set null' }),
  gradedAt: timestamp('graded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('hw_sub_user_id_idx').on(table.userId),
  index('hw_sub_assignment_id_idx').on(table.assignmentId),
]);

// Live Revision & Interactive Sessions (حصص المراجعة والزووم المباشرة)
export const liveSession = pgTable('live_session', {
  id: uuid('id').defaultRandom().primaryKey(),
  gradeId: uuid('grade_id').references(() => grade.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(), // "بث المراجعة النهائية لليلة امتحان شهر أكتوبر"
  description: text('description'),
  scheduledAt: timestamp('scheduled_at').notNull(),
  durationMinutes: integer('duration_minutes').default(60).notNull(),
  provider: text('provider').default('zoom').notNull(), // 'zoom', 'livekit', 'youtube_live'
  meetingUrl: text('meeting_url').notNull(),
  meetingPassword: text('meeting_password'),
  isLiveNow: boolean('is_live_now').default(false).notNull(),
  recordingUrl: text('recording_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('live_session_grade_id_idx').on(table.gradeId),
]);

export const homeworkAssignmentRelations = relations(homeworkAssignment, ({ one, many }) => ({
  unit: one(courseUnit, {
    fields: [homeworkAssignment.unitId],
    references: [courseUnit.id],
  }),
  lesson: one(lesson, {
    fields: [homeworkAssignment.lessonId],
    references: [lesson.id],
  }),
  submissions: many(homeworkSubmission),
}));

export const homeworkSubmissionRelations = relations(homeworkSubmission, ({ one }) => ({
  assignment: one(homeworkAssignment, {
    fields: [homeworkSubmission.assignmentId],
    references: [homeworkAssignment.id],
  }),
  student: one(user, {
    fields: [homeworkSubmission.userId],
    references: [user.id],
  }),
  gradedBy: one(user, {
    fields: [homeworkSubmission.gradedByUserId],
    references: [user.id],
  }),
}));

export const liveSessionRelations = relations(liveSession, ({ one }) => ({
  grade: one(grade, {
    fields: [liveSession.gradeId],
    references: [grade.id],
  }),
}));

// Platform & Branding Settings (إعدادات المنصة، الهواتف، ومحاضرات الكاروسيل التجريبية)
export interface FreeSampleLecture {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  badgeText: string;
  orderIndex: number;
}

export const platformSettings = pgTable('platform_settings', {
  id: text('id').primaryKey().default('default'),
  academyNameArabic: text('academy_name_arabic').default('أكاديمية إيليت').notNull(),
  academyNameEnglish: text('academy_name_english').default('Elite Academy').notNull(),
  teacherNameArabic: text('teacher_name_arabic').default('مستر أحمد عبد الرحمن').notNull(),
  teacherNameEnglish: text('teacher_name_english').default('Mr. Ahmed Abdelrahman').notNull(),
  whatsappNumber: text('whatsapp_number').default('201020003000').notNull(),
  hotlineNumber: text('hotline_number').default('0225006000').notNull(),
  inquiriesNumber: text('inquiries_number').default('01120004000').notNull(),
  heroVideoUrl: text('hero_video_url').default('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8').notNull(),
  sampleLectures: jsonb('sample_lectures').$type<FreeSampleLecture[]>().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Security Audit Logs & Threat Detection (سجل الأمان ومكافحة التهديدات)
export const auditSeverityEnum = pgEnum('audit_severity', ['low', 'medium', 'high', 'critical']);
export const auditEventTypeEnum = pgEnum('audit_event_type', [
  'voucher_redeem_success',
  'voucher_redeem_failed',
  'voucher_rate_limited',
  'device_locked',
  'device_transferred',
  'device_transfer_failed',
  'quiz_max_attempts_blocked',
  'rate_limit_triggered',
  'unauthorized_portal_access',
  'user_banned',
]);

export const securityAuditLog = pgTable('security_audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: auditEventTypeEnum('event_type').notNull(),
  severity: auditSeverityEnum('severity').default('low').notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  studentPhone: text('student_phone'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  description: text('description').notNull(),
  details: jsonb('details').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('audit_event_type_idx').on(table.eventType),
  index('audit_user_id_idx').on(table.userId),
  index('audit_created_at_idx').on(table.createdAt),
]);

export const securityAuditLogRelations = relations(securityAuditLog, ({ one }) => ({
  user: one(user, {
    fields: [securityAuditLog.userId],
    references: [user.id],
  }),
}));



