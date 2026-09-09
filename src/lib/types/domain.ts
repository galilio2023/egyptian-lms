/**
 * Canonical Domain Entity Types for Egyptian LMS (Tablawy OS).
 * Decoupled from mock-data fixtures to provide clean architectural types.
 */

export interface Grade {
  id: string;
  gradeNumber: number;
  titleArabic: string;
  titleEnglish: string;
  slug: string;
  badgeColor: string;
  unitsCount: number;
  studentsCount: number;
}

export interface CourseUnit {
  id: string;
  gradeId: string;
  gradeSlug: string;
  gradeTitle: string;
  title: string;
  slug: string;
  description: string;
  priceEgp: number;
  thumbnailUrl: string;
  lessonsCount: number;
  quizzesCount: number;
  isPublished: boolean;
}

export interface VideoCheckpointOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface VideoCheckpoint {
  id: string;
  timestampSeconds: number;
  questionText: string;
  options: VideoCheckpointOption[];
  explanation?: string;
  rewardXp?: number;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  slug: string;
  videoUrl: string;
  videoDuration: string;
  pdfAttachmentUrl?: string;
  pdfTitle?: string;
  isFreePreview: boolean;
  orderIndex: number;
  prerequisiteType?: 'none' | 'previous_quiz_passed' | 'previous_homework_submitted';
  prerequisiteLessonId?: string;
  isPrerequisiteBlocked?: boolean;
  prerequisiteMessage?: string;
  checkpoints?: VideoCheckpoint[];
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  audioUrl?: string;
  options: QuestionOption[];
  explanation: string;
  remedialLessonSlug?: string;
  remedialTimestampSeconds?: number;
}

export interface Quiz {
  id: string;
  unitId: string;
  lessonId?: string;
  title: string;
  timeLimitMinutes: number;
  passPercentage: number;
  questions: Question[];
}

export interface AdventureQuiz {
  id: string;
  slug: string;
  title: string;
  theme: 'zoo' | 'spiderman' | 'fruits' | 'numbers';
  subtitle: string;
  gradeBadge: string;
  questionsCount: number;
  durationMinutes: number;
  xpReward: number;
  accentBg: string;
  accentBorder: string;
  buttonColor: string;
  tag: string;
}

export interface GradeChampion {
  rank: 1 | 2 | 3;
  name: string;
  initials: string;
  gradeBadge: string;
  schoolName: string;
  city: string;
  xpPoints: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  studentPhone: string;
  parentPhone: string;
  parentName: string;
  governorate: string;
  gradeLevel: number;
  gradeTitle: string;
  schoolName: string;
  xpPoints: number;
  enrolledUnits: string[];
  lastActive: string;
  deviceLocked: boolean;
  isBanned?: boolean;
}

export interface OrderOcrData {
  extractedReference?: string;
  extractedAmount?: number;
  extractedDate?: string;
  matchedSender?: string;
  confidenceScore?: number;
  isSuspectedDuplicate?: boolean;
  duplicateOrderId?: string;
}

export interface Order {
  id: string;
  studentName: string;
  studentPhone: string;
  parentPhone: string;
  unitTitle: string;
  unitId: string;
  gradeTitle: string;
  amountEgp: number;
  paymentMethod: 'paymob_wallet' | 'paymob_card' | 'instapay_manual' | 'wallet_manual';
  status: 'pending' | 'completed' | 'failed' | 'manual_review';
  referenceNumber: string;
  receiptImageUrl?: string;
  receiptHash?: string;
  ocrData?: OrderOcrData;
  createdAt: string;
}

export interface HomeworkAssignment {
  id: string;
  unitId: string;
  unitTitle: string;
  lessonTitle?: string;
  gradeSlug: string;
  title: string;
  instructions: string;
  pageNumber: string;
  maxScore: number;
  dueDate: string;
}

export interface HomeworkSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  parentPhone: string;
  gradeTitle: string;
  studentImages: Array<{ pageNumber: number; imageUrl: string }>;
  audioVoiceNoteUrl?: string;
  status: 'submitted' | 'in_review' | 'graded' | 'rejected';
  score?: number;
  maxScore: number;
  feedbackNotes?: string;
  annotatedImages?: Array<{ pageIndex: number; dataUrl: string }>;
  submittedAt: string;
  gradedAt?: string;
}

export interface LiveSession {
  id: string;
  gradeId: string;
  gradeTitle: string;
  gradeSlug: string;
  title: string;
  description: string;
  scheduledAt: string; // ISO string
  durationMinutes: number;
  provider: 'zoom' | 'livekit' | 'youtube_live';
  meetingUrl: string;
  meetingPassword?: string;
  isLiveNow: boolean;
  recordingUrl?: string;
  instructorName: string;
}
