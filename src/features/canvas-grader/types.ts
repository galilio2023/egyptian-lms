import type { MockHomeworkSubmission } from "@/lib/db/mock-data";

export interface CanvasPenGraderProps {
  submission: MockHomeworkSubmission;
  isOpen: boolean;
  onClose: () => void;
  onSaveGrade?: (data: {
    submissionId: string;
    score: number;
    feedbackNotes: string;
    annotatedImages: Array<{ pageIndex: number; dataUrl: string }>;
  }, andAdvanceNext?: boolean) => Promise<boolean>;
  hasNextSubmission?: boolean;
}

export type ToolType = "pen" | "highlighter" | "check" | "cross" | "star" | "eraser";

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  tool: ToolType;
  color: string;
  size: number;
  points: Point[];
  stampPosition?: Point;
}
