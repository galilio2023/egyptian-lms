import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rate-limiter";

interface TutorMessage {
  role: "user" | "model";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);
    const session = await auth.api.getSession({ headers: reqHeaders });

    // Rate Limiting: 25 questions per 5 minutes per user/IP
    const rateKey = `ai-tutor:${session?.user?.id || clientIp}`;
    const rateCheck = checkRateLimit(rateKey, { maxRequests: 25, windowMs: 5 * 60 * 1000 });
    if (!rateCheck.success) {
      return createRateLimitResponse(
        rateCheck,
        "سألت النحلة النشيطة أسئلة كثيرة في وقت قصير يا بطل! انتظر دقيقة ثم اسأل مجدداً 🐝"
      );
    }

    const body = await request.json();
    const {
      question,
      lessonTitle,
      unitTitle,
      chatHistory = [],
      studentName = "يا بطل",
    } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "السؤال مطلوب." }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey && geminiApiKey.trim().length > 10) {
      try {
        const systemInstruction = `You are "Busy Bee" (النحلة النشيطة 🐝), the beloved mascot and AI study buddy for Egyptian primary students (Grades 1 to 6) learning English (Connect and Connect Plus curriculum).
Student Name: "${studentName}".
Current Unit: "${unitTitle || "Connect English"}".
Current Lesson: "${lessonTitle || "Phonics and Vocabulary"}".

Pedagogical Rules:
1. Tone: Cheerful, friendly, encouraging, playful Egyptian Arabic mixed naturally with simple English examples (child-friendly).
2. Level: Explain concepts simply for an 8-year-old child. Avoid complicated linguistic jargon.
3. Socratic Method: Encourage the student to repeat after you, give 1 clear fun example, and end with an encouraging question or tip.
4. Scope Control & Safety: You ONLY answer questions related to learning English, phonics, spelling, and this lesson's topic. If the student asks about anything off-topic, playfully bring them back to the lesson.
5. Return JSON format:
{
  "reply": "<Your warm Egyptian explanation, max 3-4 short sentences, with emojis>",
  "suggestedFollowUps": [
    "<Short follow up question 1 in Arabic>",
    "<Short follow up question 2 in Arabic>",
    "<Short follow up question 3 in Arabic>"
  ]
}`;

        const prompt = `Student asked: "${question.trim()}"`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemInstruction}\n\n${prompt}` }],
                },
              ],
              generationConfig: { responseMimeType: "application/json" },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({
              success: true,
              reply: parsed.reply,
              suggestedFollowUps: parsed.suggestedFollowUps || [
                "ازاي أنطق الكلمة دي صح؟ 🎙️",
                "اديني مثال تاني بسيط 🐝",
                "اسألني سؤال سريع اختبرني! 🌟",
              ],
            });
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini Tutor call note:", geminiErr);
      }
    }

    // Intelligent Fallback Socratic Answers
    const qLower = question.toLowerCase();
    let fallbackReply = `أهلاً يا ${studentName}! 🐝 أنا النحلة النشيطة، في درس (${lessonTitle}) بنتعلم الكلمات والنطق الصح. كرر الكلمة بصوت عالي وواضح، وخلي بالك من صوت الحرف الأول! 🌟`;

    if (qLower.includes("نطق") || qLower.includes("pronounce") || qLower.includes("انطق")) {
      fallbackReply = `يا ${studentName} العسل! 🐝 عشان تنطق الكلمة صح، قسّمها لمقاطع صغيرة واسمع صوت الحروف كويس. جرب تسجل صوتك في الواجب عشان أسمعه وأقولك شاطر! 🎙️`;
    } else if (qLower.includes("معنى") || qLower.includes("meaning") || qLower.includes("يعني ايه")) {
      fallbackReply = `سؤال ذكي جداً يا بطل! 🌟 الكلمة دي بنستخدمها لما نحب نعبر عن حاجة بنعملها كل يوم في المدرسة أو البيت. افتح كراسة الدرس واقرأ المثال اللي مع الصورة! 🐝`;
    }

    return NextResponse.json({
      success: true,
      reply: fallbackReply,
      suggestedFollowUps: [
        "ازاي أنطق الكلمة دي صح؟ 🎙️",
        "اديني مثال تاني بسيط 🐝",
        "اسألني سؤال سريع اختبرني! 🌟",
      ],
    });
  } catch (error) {
    console.error("AI Tutor API Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحدث مع النحلة النشيطة." },
      { status: 500 }
    );
  }
}
