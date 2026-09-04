import type { MockQuiz } from "@/lib/db/mock-data";

export interface InteractiveQuizEngineProps {
  quiz: MockQuiz;
  studentName?: string;
  parentPhone?: string;
  studentPhone?: string;
  onComplete?: (score: number, passed: boolean) => void;
}

export interface ServerGradeResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  earnedXp: number;
  alreadyPassed?: boolean;
  remainingAttempts?: number;
  maxAttempts?: number;
  results: Record<string, { correct: boolean; correctAnswerId: string; explanation: string }>;
  parentNotification?: {
    parentPhone: string;
    whatsappUrl: string;
    messageText: string;
  };
}
