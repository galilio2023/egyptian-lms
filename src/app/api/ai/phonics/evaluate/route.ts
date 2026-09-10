import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rate-limiter";
import { diagnoseEgyptianPhoneme } from "@/features/phonics/components/phonics-sound-board";
import { awardPracticeXp } from "@/server/services/student-progress.service";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10MB limit

interface PhonicsEvaluationResponse {
  success: boolean;
  accuracyScore: number;
  recognizedText: string;
  isPass: boolean;
  trapDetected: string | null;
  detectedPhonemes: Array<{
    phoneme: string;
    status: "perfect" | "needs_practice" | "missed";
  }>;
  pedagogicalAdviceArabic: string;
  praiseArabic: string;
  xpAwarded: number;
  error?: string;
}

function parseAudioDataUrl(dataUrl: string) {
  if (!dataUrl.toLowerCase().startsWith("data:audio/")) {
    return null;
  }
  const match = dataUrl.match(
    /^data:(audio\/(?:webm|wav|ogg|mp4|mpeg|aac|x-m4a));base64,([A-Za-z0-9+/=\s]+)$/i
  );
  if (!match) return null;

  const rawBytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (rawBytes.length === 0 || rawBytes.length > MAX_AUDIO_BYTES) {
    return null;
  }

  // Gemini accepts audio/webm, audio/wav, audio/mp3, audio/ogg
  let mimeType = match[1].toLowerCase();
  if (mimeType === "audio/x-m4a") mimeType = "audio/mp4";

  return {
    inlineData: {
      mimeType,
      data: rawBytes.toString("base64"),
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً لإجراء التقييم الصوتي." },
        { status: 401 }
      );
    }

    // Rate limiting: 20 speech checks per 5 minutes per user/IP
    const rateKey = `speech-eval:${session.user.id}`;
    const rateCheck = checkRateLimit(rateKey, { maxRequests: 20, windowMs: 5 * 60 * 1000 });
    if (!rateCheck.success) {
      return createRateLimitResponse(
        rateCheck,
        "تم تجاوز الحد الأقصى لتجربة النطق الصوتي خلال وقت قصير. انتظر دقيقة ثم جرب مجدداً."
      );
    }

    const body = await request.json();
    const { audioDataUrl, targetText, phonicsFocus, gradeLevel = 1 } = body;

    if (!targetText || typeof targetText !== "string") {
      return NextResponse.json(
        { error: "النص المطلوب نطقه غير محدد." },
        { status: 400 }
      );
    }

    if (!audioDataUrl || typeof audioDataUrl !== "string") {
      return NextResponse.json(
        { error: "التسجيل الصوتي غير متوفر أو بصيغة غير مدعومة." },
        { status: 400 }
      );
    }

    const audioPart = parseAudioDataUrl(audioDataUrl);
    if (!audioPart) {
      return NextResponse.json(
        { error: "ملف الصوت غير صالح أو تجاوز الحد الأقصى المسموح به (10 ميجابايت)." },
        { status: 422 }
      );
    }

    const cleanTarget = targetText.trim();
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // 1. Try Gemini 2.5 Flash Multimodal Audio Evaluation
    if (geminiApiKey && geminiApiKey.trim().length > 10) {
      try {
        const prompt = `You are an expert phonics coach and encouraging English teacher for Egyptian elementary school children (Grade ${gradeLevel}, Egyptian Ministry Connect & Connect Plus curriculum).
The child is practicing the pronunciation of: "${cleanTarget}".
Phonics pattern to test: "${phonicsFocus || cleanTarget}".

Listen carefully to the child's recorded speech.
Analyze specifically for typical Egyptian phonological challenges:
1. /p/ vs /b/ confusion (e.g. saying "Ben" instead of "Pen", "Bark" instead of "Park").
2. /th/ pronounced as /s/, /z/, or /f/ (e.g. "sink" or "zink" instead of "think").
3. /sh/ vs /ch/ (e.g. "ship" vs "chip").
4. Elongating or swallowing short vowels (/æ/ as in 'cat', /e/ as in 'bed', /ɪ/ as in 'sit').
5. Ending consonant deletions.

Return JSON in this EXACT schema:
{
  "accuracyScore": <number 0-100>,
  "recognizedText": "<what the child actually said>",
  "isPass": <boolean, true if accuracyScore >= 65>,
  "trapDetected": <"p_vs_b" | "th_sound" | "sh_vs_ch" | "vowel_short" | null>,
  "detectedPhonemes": [
    { "phoneme": "/p/", "status": "perfect" | "needs_practice" | "missed" }
  ],
  "pedagogicalAdviceArabic": "<2 concise sentences in warm, kid-friendly Egyptian teacher dialect giving actionable advice with cute emojis>",
  "praiseArabic": "<Short enthusiastic Egyptian praise, e.g., 'شاطر يا بطل! 🌟' or 'محاولة ممتازة يا عسل! 👏'>"
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }, audioPart] }],
              generationConfig: { responseMimeType: "application/json" },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            const rawScore = Number.isFinite(parsed.accuracyScore) ? Number(parsed.accuracyScore) : 70;
            const score = Math.max(0, Math.min(100, Math.round(rawScore)));
            const xp = score >= 80 ? 25 : score >= 60 ? 15 : 5;

            let actualXp = 0;
            try {
              const xpRes = await awardPracticeXp(session.user.id, "phonics_practice", xp);
              actualXp = xpRes.xpAwarded;
            } catch (xpErr) {
              console.error("Could not persist phonics XP to student profile:", xpErr);
              return NextResponse.json(
                {
                  success: false,
                  accuracyScore: score,
                  recognizedText: parsed.recognizedText || cleanTarget,
                  isPass: score >= 65,
                  trapDetected: parsed.trapDetected || null,
                  detectedPhonemes: Array.isArray(parsed.detectedPhonemes)
                    ? parsed.detectedPhonemes
                    : [],
                  pedagogicalAdviceArabic:
                    parsed.pedagogicalAdviceArabic ||
                    "تم تقييم النطق، لكن تعذر حفظ مكافأة النقاط. حاول مرة أخرى لاحقاً.",
                  praiseArabic: parsed.praiseArabic || "محاولة رائعة يا بطل! 👏",
                  xpAwarded: 0,
                  error: "تعذر حفظ نقاط تقييم النطق حالياً.",
                } satisfies PhonicsEvaluationResponse,
                { status: 503 }
              );
            }

            const responsePayload: PhonicsEvaluationResponse = {
              success: true,
              accuracyScore: score,
              recognizedText: parsed.recognizedText || cleanTarget,
              isPass: score >= 65,
              trapDetected: parsed.trapDetected || null,
              detectedPhonemes: Array.isArray(parsed.detectedPhonemes)
                ? parsed.detectedPhonemes
                : [{ phoneme: cleanTarget, status: score >= 70 ? "perfect" : "needs_practice" }],
              pedagogicalAdviceArabic:
                parsed.pedagogicalAdviceArabic ||
                "نطق رائع ومميز! استمر في تكرار الكلمة بصوت واضح ونبرة واثقة.",
              praiseArabic:
                parsed.praiseArabic ||
                (score >= 80 ? "أحسنت يا بطل! نطقك يضاهي متحدثي اللغة الأصليين 🌟" : "محاولة رائعة! قربت جداً من النطق المثالي 👏"),
              xpAwarded: actualXp,
            };

            return NextResponse.json(responsePayload);
          }
        }
      } catch (geminiError) {
        console.warn("Gemini phonics analysis error:", geminiError);
      }
    }

    // 2. Intelligent Fallback when Gemini Audio Evaluation is unavailable:
    // Do not award passing score or unearned XP without actual audio analysis
    const diagnostic = diagnoseEgyptianPhoneme(cleanTarget, cleanTarget);
    return NextResponse.json({
      success: false,
      accuracyScore: 0,
      recognizedText: "",
      isPass: false,
      trapDetected: diagnostic?.trapDetected || null,
      detectedPhonemes: [],
      pedagogicalAdviceArabic:
        diagnostic?.adviceArabic ||
        "تعذر تحليل التسجيل الصوتي بالذكاء الاصطناعي حالياً. يرجى التأكد من وضوح الصوت والمحاولة لاحقاً.",
      praiseArabic: "تم حفظ التسجيل الصوتي لمراجعته بواسطة معلم المادة 🎧",
      xpAwarded: 0,
      error: "خدمة تقييم النطق الصوتي بالذكاء الاصطناعي غير متوفرة حالياً.",
    } satisfies PhonicsEvaluationResponse);
  } catch (err: unknown) {
    console.error("Phonics evaluate route exception:", err);
    return NextResponse.json(
      { error: "حدث خطأ أثناء فحص النطق الصوتي بالذكاء الاصطناعي." },
      { status: 500 }
    );
  }
}
