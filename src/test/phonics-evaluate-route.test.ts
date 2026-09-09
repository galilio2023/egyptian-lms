import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  awardPracticeXp: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: {
    api: {
      getSession: mocks.getSession,
    },
  },
}));

vi.mock("@/lib/security/rate-limiter", () => ({
  checkRateLimit: vi.fn(() => ({ success: true })),
  createRateLimitResponse: vi.fn(),
}));

vi.mock("@/features/phonics/components/phonics-sound-board", () => ({
  diagnoseEgyptianPhoneme: vi.fn(() => null),
}));

vi.mock("@/server/services/student-progress.service", () => ({
  awardPracticeXp: mocks.awardPracticeXp,
}));

import { POST } from "@/app/api/ai/phonics/evaluate/route";

function createRequest() {
  return new NextRequest("http://localhost/api/ai/phonics/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audioDataUrl: "data:audio/wav;base64,AA==",
      targetText: "Book",
      phonicsFocus: "Short /oo/ sound",
      gradeLevel: 1,
    }),
  });
}

describe("phonics evaluation XP persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GEMINI_API_KEY", "test-gemini-api-key-long-enough");
    mocks.getSession.mockResolvedValue({ user: { id: "student-1" } });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      accuracyScore: 90,
                      recognizedText: "Book",
                      trapDetected: null,
                      detectedPhonemes: [{ phoneme: "/b/", status: "perfect" }],
                      pedagogicalAdviceArabic: "استمر يا بطل.",
                      praiseArabic: "شاطر يا بطل! 🌟",
                    }),
                  },
                ],
              },
            },
          ],
        })
      )
    );
  });

  it("returns the persisted XP amount when awarding succeeds", async () => {
    mocks.awardPracticeXp.mockResolvedValue({ xpAwarded: 25 });

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ success: true, xpAwarded: 25 });
  });

  it.each([
    ["missing student profile", new Error("Student profile not found")],
    ["database update failure", new Error("Database unavailable")],
  ])("does not report XP as awarded after a %s", async (_scenario, error) => {
    mocks.awardPracticeXp.mockRejectedValue(error);

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({
      success: false,
      accuracyScore: 90,
      xpAwarded: 0,
      error: "تعذر حفظ نقاط تقييم النطق حالياً.",
    });
  });
});
