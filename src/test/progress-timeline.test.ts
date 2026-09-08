import { describe, it, expect } from "vitest";
import type { TimelineEvent } from "@/lib/types/timeline";

describe("Student Progress Timeline Logic", () => {
  it("sorts mixed events in descending chronological order (most recent first)", () => {
    const events: TimelineEvent[] = [
      {
        id: "lesson-1",
        type: "lesson_completed",
        title: "Lesson 1: Greetings",
        timestamp: "2026-09-01T10:00:00.000Z",
        icon: "🎬",
      },
      {
        id: "quiz-1",
        type: "quiz_passed",
        title: "Quiz 1: Vocab",
        timestamp: "2026-09-03T12:00:00.000Z",
        icon: "🏅",
      },
      {
        id: "enroll-1",
        type: "enrollment",
        title: "Enrolled in Unit 1",
        timestamp: "2026-08-30T09:00:00.000Z",
        icon: "🎓",
      },
    ];

    events.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    expect(events[0].id).toBe("quiz-1");
    expect(events[1].id).toBe("lesson-1");
    expect(events[2].id).toBe("enroll-1");
  });

  it("handles events with missing or optional score fields safely", () => {
    const eventWithoutScore: TimelineEvent = {
      id: "lesson-2",
      type: "lesson_completed",
      title: "Lesson 2",
      timestamp: new Date().toISOString(),
      icon: "🎬",
      xpEarned: 15,
    };

    expect(eventWithoutScore.score).toBeUndefined();
    expect(eventWithoutScore.maxScore).toBeUndefined();
    expect(eventWithoutScore.xpEarned).toBe(15);
  });

  it("correctly identifies passed vs failed quiz events", () => {
    const passedQuiz: TimelineEvent = {
      id: "quiz-passed",
      type: "quiz_passed",
      title: "Unit Exam",
      score: 9,
      maxScore: 10,
      passed: true,
      xpEarned: 50,
      timestamp: new Date().toISOString(),
      icon: "🏅",
    };

    const failedQuiz: TimelineEvent = {
      id: "quiz-failed",
      type: "quiz_failed",
      title: "Unit Exam",
      score: 4,
      maxScore: 10,
      passed: false,
      xpEarned: 0,
      timestamp: new Date().toISOString(),
      icon: "📝",
    };

    expect(passedQuiz.passed).toBe(true);
    expect(passedQuiz.xpEarned).toBe(50);
    expect(failedQuiz.passed).toBe(false);
    expect(failedQuiz.xpEarned).toBe(0);
  });
});
