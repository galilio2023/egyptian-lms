/**
 * Shared timeline event types used by both the API route and the client component.
 * Kept separate to avoid circular dependency between app/api and features/.
 */

export interface TimelineEvent {
  id: string;
  type:
    | "lesson_completed"
    | "quiz_passed"
    | "quiz_failed"
    | "homework_graded"
    | "enrollment";
  title: string;
  subtitle?: string;
  xpEarned?: number;
  score?: number;
  maxScore?: number;
  passed?: boolean;
  timestamp: string; // ISO string
  icon: string; // emoji
}
