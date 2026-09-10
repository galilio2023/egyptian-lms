import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdminAuth } from "@/server/auth/guards";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import type { StudentUploadedPage } from "@/lib/db/schema";
import type { Stroke } from "@/features/canvas-grader/types";

interface AiPregradeResponse {
  success: boolean;
  score: number;
  feedbackNotes: string;
  strokes: Stroke[];
  detectedAnswers: Array<{
    questionNumber: number;
    detectedText: string;
    isCorrect: boolean;
    correctionHint?: string;
  }>;
}

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TRUSTED_IMAGE_HOSTS = [
  "storage.bunnycdn.com",
  "b-cdn.net",
  "s3.amazonaws.com",
  "r2.cloudflarestorage.com",
];

async function loadAuthorizedImagePart(imageUrl: string) {
  const dataUrlMatch = imageUrl.match(
    /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i
  );
  if (dataUrlMatch) {
    const imageBytes = Buffer.from(dataUrlMatch[2].replace(/\s/g, ""), "base64");
    if (imageBytes.length === 0 || imageBytes.length > MAX_IMAGE_BYTES) {
      throw new Error("Stored workbook image is empty or too large");
    }
    return {
      inlineData: {
        mimeType: dataUrlMatch[1].toLowerCase(),
        data: imageBytes.toString("base64"),
      },
    };
  }

  const parsedUrl = new URL(imageUrl);
  const isTrustedHost =
    parsedUrl.protocol === "https:" &&
    TRUSTED_IMAGE_HOSTS.some(
      (host) => parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`)
    );
  if (!isTrustedHost) {
    throw new Error("Stored workbook image is not on an authorized host");
  }

  const imageResponse = await fetch(parsedUrl, {
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  const mimeType = imageResponse.headers.get("content-type")?.split(";")[0].toLowerCase();
  const contentLength = Number(imageResponse.headers.get("content-length"));
  if (!imageResponse.ok || !mimeType || !["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
    throw new Error("Stored workbook image could not be loaded as a supported image");
  }
  if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
    throw new Error("Stored workbook image is too large");
  }

  const imageBytes = Buffer.from(await imageResponse.arrayBuffer());
  if (imageBytes.length === 0 || imageBytes.length > MAX_IMAGE_BYTES) {
    throw new Error("Stored workbook image is empty or too large");
  }

  return { inlineData: { mimeType, data: imageBytes.toString("base64") } };
}

function parseGeminiResult(rawText: string): Omit<AiPregradeResponse, "success"> {
  const parsed = JSON.parse(rawText) as Record<string, unknown>;
  if (
    typeof parsed.score !== "number" ||
    !Number.isFinite(parsed.score) ||
    parsed.score < 0 ||
    parsed.score > 10 ||
    typeof parsed.feedbackNotes !== "string" ||
    !parsed.feedbackNotes.trim() ||
    !Array.isArray(parsed.detectedAnswers)
  ) {
    throw new Error("Gemini returned an invalid grading result");
  }

  const detectedAnswers = parsed.detectedAnswers.map((answer) => {
    if (
      !answer ||
      typeof answer !== "object" ||
      typeof answer.questionNumber !== "number" ||
      !Number.isInteger(answer.questionNumber) ||
      typeof answer.detectedText !== "string" ||
      typeof answer.isCorrect !== "boolean" ||
      (answer.correctionHint !== undefined && typeof answer.correctionHint !== "string")
    ) {
      throw new Error("Gemini returned malformed detected answers");
    }
    return {
      questionNumber: answer.questionNumber,
      detectedText: answer.detectedText,
      isCorrect: answer.isCorrect,
      ...(answer.correctionHint ? { correctionHint: answer.correctionHint } : {}),
    };
  });

  if (parsed.stampLocations !== undefined && !Array.isArray(parsed.stampLocations)) {
    throw new Error("Gemini returned malformed stamp locations");
  }

  const strokes: Stroke[] = (parsed.stampLocations || []).map((stamp) => {
    if (
      !stamp ||
      typeof stamp !== "object" ||
      !["check", "cross", "star"].includes(String(stamp.type)) ||
      typeof stamp.x !== "number" ||
      !Number.isFinite(stamp.x) ||
      typeof stamp.y !== "number" ||
      !Number.isFinite(stamp.y)
    ) {
      throw new Error("Gemini returned malformed stamp coordinates");
    }
    const tool = stamp.type === "star" ? "star" : stamp.type === "cross" ? "cross" : "check";
    return {
      tool,
      color: tool === "cross" ? "#dc2626" : tool === "star" ? "#f59e0b" : "#16a34a",
      size: 4,
      points: [],
      stampPosition: { x: stamp.x, y: stamp.y },
    };
  });

  return {
    score: parsed.score,
    feedbackNotes: parsed.feedbackNotes.trim(),
    strokes,
    detectedAnswers,
  };
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const body = (await request.json()) as { submissionId?: unknown; pageNumber?: unknown };
    if (typeof body.submissionId !== "string" || !UUID_PATTERN.test(body.submissionId)) {
      return NextResponse.json({ error: "معرف تسليم الواجب غير صالح." }, { status: 400 });
    }

    const [submission] = await db
      .select({
        studentImages: schema.homeworkSubmission.studentImages,
        assignmentTitle: schema.homeworkAssignment.title,
        instructions: schema.homeworkAssignment.instructions,
      })
      .from(schema.homeworkSubmission)
      .innerJoin(
        schema.homeworkAssignment,
        eq(schema.homeworkSubmission.assignmentId, schema.homeworkAssignment.id)
      )
      .where(eq(schema.homeworkSubmission.id, body.submissionId))
      .limit(1);

    if (!submission) {
      return NextResponse.json({ error: "لم يتم العثور على تسليم الواجب المطلوب." }, { status: 404 });
    }

    const requestedPageNumber =
      typeof body.pageNumber === "number" && Number.isInteger(body.pageNumber)
        ? body.pageNumber
        : undefined;
    const selectedImage = requestedPageNumber === undefined
      ? submission.studentImages[0]
      : submission.studentImages.find(
          (image: StudentUploadedPage) => image.pageNumber === requestedPageNumber
        );
    if (!selectedImage?.imageUrl) {
      return NextResponse.json({ error: "لم يتم العثور على صورة صفحة الواجب المطلوبة." }, { status: 404 });
    }

    let imagePart;
    try {
      imagePart = await loadAuthorizedImagePart(selectedImage.imageUrl);
    } catch (error) {
      console.warn("Stored workbook image could not be prepared for Gemini:", error);
      return NextResponse.json({ error: "صورة الواجب المحفوظة غير صالحة للتحليل." }, { status: 422 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey || geminiApiKey.trim().length <= 10) {
      return NextResponse.json(
        { error: "خدمة التصحيح بالذكاء الاصطناعي غير مهيأة حالياً." },
        { status: 503 }
      );
    }

    const prompt = `You are a strict yet encouraging Egyptian primary school English teacher (Connect / Connect Plus curriculum).
Assignment title: ${submission.assignmentTitle}
Assignment instructions: ${submission.instructions || "Complete the phonics and writing exercise"}

Analyze this student workbook submission image.
Identify handwritten English words, letters, and numbers.
Evaluate correctness against typical Egyptian Grade 1-6 standards.

Return JSON in this EXACT format:
{
  "score": <number between 5 and 10>,
  "feedbackNotes": "<2-sentence encouraging Egyptian Arabic praise highlighting strong points and gentle tips>",
  "detectedAnswers": [
    { "questionNumber": 1, "detectedText": "...", "isCorrect": true },
    { "questionNumber": 2, "detectedText": "...", "isCorrect": true }
  ],
  "stampLocations": [
    { "type": "check", "x": 700, "y": 260 },
    { "type": "star", "x": 160, "y": 140 }
  ]
}`;

    try {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, imagePart] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (!geminiResponse.ok) {
        console.warn("Gemini workbook analysis rejected:", geminiResponse.status);
        return NextResponse.json(
          { error: "تعذر على خدمة الذكاء الاصطناعي تحليل صورة الواجب." },
          { status: 503 }
        );
      }

      const geminiData = await geminiResponse.json();
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof rawText !== "string" || !rawText.trim()) {
        throw new Error("Gemini returned no grading content");
      }

      const result = parseGeminiResult(rawText);
      return NextResponse.json({ success: true, ...result } satisfies AiPregradeResponse);
    } catch (error) {
      console.warn("Gemini workbook analysis failed:", error);
      return NextResponse.json(
        { error: "أعادت خدمة الذكاء الاصطناعي نتيجة غير صالحة. لم يتم اقتراح درجة." },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("AI Pregrade route error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء معالجة صورة الواجب بالذكاء الاصطناعي." },
      { status: 500 }
    );
  }
}
