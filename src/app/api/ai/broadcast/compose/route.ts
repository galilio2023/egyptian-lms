import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdminAuth } from "@/server/auth/guards";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rate-limiter";

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    const rateKey = `ai-broadcast:${context.userId || clientIp}`;
    const rateCheck = checkRateLimit(rateKey, { maxRequests: 20, windowMs: 5 * 60 * 1000 });
    if (!rateCheck.success) {
      return createRateLimitResponse(rateCheck, "تم تجاوز الحد المسموح به لمحاولات الصياغة الذكية.");
    }

    const body = await request.json();
    const {
      topic = "exam_reminder",
      targetGradeTitle = "جميع الصفوف الابتدائية",
      customNotes = "",
      teacherName = "معلم المادة",
      academyName = "المنصة التعليمية",
    } = body;

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey && geminiApiKey.trim().length > 10) {
      try {
        const prompt = `You are an expert educational communications director for an Egyptian EdTech Academy teaching primary students (Connect / Connect Plus curriculum).
Draft a concise, warm, professional WhatsApp broadcast notification in Egyptian Arabic addressed to parents (أولياء الأمور).

Topic: "${topic}"
Target Grade: "${targetGradeTitle}"
Teacher Name: "${teacherName}"
Academy Name: "${academyName}"
Additional Notes/Context: "${customNotes}"

Guidelines:
1. Tone: Respectful, reassuring, motivating, warm Egyptian phrasing (e.g., أولياء أمور أبطالنا الكرام 🌸).
2. Length: 3 to 5 clear sentences.
3. Include relevant emoji bullet points.
4. Conclude with teacher & academy sign-off.
5. Return JSON:
{
  "messageText": "<Full ready-to-send WhatsApp message>",
  "subjectTitle": "<Short title for the broadcast>"
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            try {
              const parsed = JSON.parse(rawText);
              if (
                typeof parsed === "object" &&
                parsed !== null &&
                typeof parsed.messageText === "string" &&
                parsed.messageText.trim().length > 0
              ) {
                return NextResponse.json({
                  success: true,
                  messageText: parsed.messageText.trim(),
                  subjectTitle:
                    typeof parsed.subjectTitle === "string" && parsed.subjectTitle.trim()
                      ? parsed.subjectTitle.trim()
                      : "إشعار عام",
                });
              }
            } catch {
              // Parse error, fall through to deterministic template
            }
          }
        }
      } catch (err) {
        console.warn("AI Broadcast Gemini error:", err);
      }
    }

    // High quality presets fallback
    let fallbackText = "";
    if (topic.includes("exam")) {
      fallbackText = `أولياء أمور أبطالنا الكرام في ${targetGradeTitle} 🌸\n\nنحيطكم علماً بأن اختبار الوحدة ومراجعة امتحان الشهر متاح الآن عبر المنصة 📝.\nنرجو من جميع الأبطال دخول الاختبار لمتابعة مستواهم وحصد نقاط التميز 🌟.\n\nمع أطيب تمنياتنا بدوام التفوق والنجاح،\n${teacherName} — ${academyName}`;
    } else if (topic.includes("homework")) {
      fallbackText = `تحية طيبة لأولياء أمورنا الأعزاء 🌸\n\nتم الانتهاء من تصحيح كراسات الواجب لجميع الأبطال في ${targetGradeTitle}، ويمكنكم الآن الاطلاع على درجات أبنائكم وملاحظات المعلم عبر المنصة 🎨.\nشكراً لتعاونكم ودعمكم المستمر لرحلة تفوقهم.\n\n${teacherName} — ${academyName}`;
    } else if (topic.includes("live")) {
      fallbackText = `تذكير هام لأولياء أمور ${targetGradeTitle} 🔔\n\nموعدنا اليوم مع حصة البث المباشر التفاعلية للمراجعة ليلة الامتحان في تمام الساعة 7:00 مساءً ⏰.\nيرجى تجهيز كراسة الدرس والانضمام مبكراً للمشاركة في المسابقات الفورية 🏆.\n\nدمتم في رعاية الله،\n${teacherName} — ${academyName}`;
    } else {
      fallbackText = `أولياء أمور أبطالنا الأعزاء 🌸\n\nنود توجيه خالص الشكر لكم على متابعتكم واهتمامكم بتطور مستوى الأبطال في مادة اللغة الإنجليزية 🌟.\nمستمرون معكم يداً بيد نحو القمة.\n\nخالص التقدير والاحترام،\n${teacherName} — ${academyName}`;
    }

    return NextResponse.json({
      success: true,
      messageText: fallbackText,
      subjectTitle: "إشعار عام لأولياء الأمور",
    });
  } catch (error) {
    console.error("AI Broadcast route error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء صياغة الرسالة بالذكاء الاصطناعي." },
      { status: 500 }
    );
  }
}
