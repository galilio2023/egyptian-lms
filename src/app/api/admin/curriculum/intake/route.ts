import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import { auth } from "@/lib/auth/auth";
import { extractTextFromPdfBuffer } from "@/lib/ai/pdf-parser";
import { parseCurriculumWithAi, CurriculumTrack } from "@/lib/ai/curriculum-intake-parser";

export async function POST(request: NextRequest) {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({ headers: headerList });

    const userRole = (session?.user as Record<string, unknown> | undefined)?.role as string | undefined;
    const isAuthorized = userRole === "admin" || userRole === "teacher" || userRole === "assistant";

    if (!session || !isAuthorized) {
      return NextResponse.json(
        { error: "غير مصرح لك بالوصول. يتطلب حساب المشرف أو المعلم." },
        { status: 403 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    // Case 1: JSON payload (e.g. Triggering official Ministry preset unit)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const gradeSlug = body.gradeSlug || "grade-3";
      const track: CurriculumTrack = body.track === "connect_plus" ? "connect_plus" : "connect";
      const term = body.term === 2 ? 2 : 1;

      const mockExtractedDoc = {
        pageCount: 12,
        rawText: `Connect ${gradeSlug} Primary English Ministry of Education Egypt Term ${term} Unit Vocabulary Phonics Grammar Exercises`,
        headings: ["Unit 1", "Lesson 1: Phonics & Vocabulary", "Lesson 2: Reading & Listening", "Exercises"],
        vocabularyHints: ["happy", "feel", "excited", "thirsty", "eat", "healthy", "exercise"],
        hasExercises: true,
      };

      const draft = await parseCurriculumWithAi(
        mockExtractedDoc,
        gradeSlug,
        track,
        term,
        `Ministry_Connect_${gradeSlug}_Term${term}.pdf`
      );

      return NextResponse.json({ success: true, draft });
    }

    // Case 2: Multi-part form data with uploaded PDF
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const gradeSlug = (formData.get("gradeSlug") as string) || "grade-3";
    const track: CurriculumTrack = (formData.get("track") as string) === "connect_plus" ? "connect_plus" : "connect";
    const term = Number(formData.get("term")) === 2 ? 2 : 1;

    let extractedDoc = {
      pageCount: 1,
      rawText: "",
      headings: [] as string[],
      vocabularyHints: [] as string[],
      hasExercises: false,
    };
    let savedFileName = `Ministry_${track}_${gradeSlug}.pdf`;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      extractedDoc = extractTextFromPdfBuffer(buffer);

      // Save PDF to public/curriculum-pdfs directory for student lesson download
      try {
        const uploadDir = path.join(process.cwd(), "public", "curriculum-pdfs");
        await fs.mkdir(uploadDir, { recursive: true });
        const sanitizedName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        await fs.writeFile(path.join(uploadDir, sanitizedName), buffer);
        savedFileName = sanitizedName;
      } catch (err) {
        console.warn("Could not save uploaded PDF file locally:", err);
      }
    } else {
      extractedDoc = {
        pageCount: 10,
        rawText: `Egyptian Ministry of Education Connect Curriculum ${gradeSlug}`,
        headings: ["Unit Overview", "Lesson 1", "Lesson 2", "Review Quiz"],
        vocabularyHints: ["learn", "practice", "words", "sounds"],
        hasExercises: true,
      };
    }

    const draft = await parseCurriculumWithAi(
      extractedDoc,
      gradeSlug,
      track,
      term,
      savedFileName
    );

    return NextResponse.json({
      success: true,
      draft,
      extractedMeta: {
        pageCount: extractedDoc.pageCount,
        detectedHeadings: extractedDoc.headings,
      },
    });
  } catch (error) {
    console.error("Curriculum intake failed:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة واستخراج بيانات المنهج من الملف." },
      { status: 500 }
    );
  }
}
