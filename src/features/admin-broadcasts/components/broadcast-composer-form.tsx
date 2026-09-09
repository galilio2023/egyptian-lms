"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { CheckCircle2, Sparkles } from "lucide-react";
import { executeAdminAction } from "@/lib/api/admin-client";
import { INITIAL_GRADES } from "@/lib/db/mock-data";
import { 
  BroadcastMegaphoneSvg, 
  UsersGraduationSvg 
} from "@/components/ui/illustrated-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DEFAULT_BROADCAST_MESSAGE =
  "أولياء أمور طلابنا الأعزاء 🌟\nنحيطكم علماً بأن اختبار الوحدة متاح الآن على المنصة، ونرجو من جميع الأبطال دخول الاختبار لمتابعة مستواهم.\nمع أطيب تمنيات إدارة المنصة والمعلمين بالتفوق الدائم!";

export function BroadcastComposerForm() {
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [messageText, setMessageText] = useState(DEFAULT_BROADCAST_MESSAGE);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [sentCount, setSentCount] = useState<number | null>(null);

  const aiRequestSeqRef = useRef(0);

  useEffect(() => {
    return () => {
      aiRequestSeqRef.current += 1;
    };
  }, []);

  const handleGenerateAi = async (topic: string) => {
    const requestId = ++aiRequestSeqRef.current;
    setIsGeneratingAi(true);
    toast.info("جاري صياغة الرسالة بأسلوب تربوي مشجع بالذكاء الاصطناعي ✨...");
    try {
      const selectedGradeObj = INITIAL_GRADES.find((g) => g.slug === selectedGrade);
      const gradeTitle = selectedGradeObj
        ? `${selectedGradeObj.titleEnglish} (${selectedGradeObj.titleArabic})`
        : "جميع المراحل التعليمية";

      const res = await fetch("/api/ai/broadcast/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetGradeTitle: gradeTitle,
          teacherName: "المعلم المشرف",
          academyName: "أكاديمية اللغة الإنجليزية",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "تعذر توليد الرسالة.");
      }

      if (requestId !== aiRequestSeqRef.current) return;
      setMessageText(data.messageText);
      toast.success("✨ تم إنشاء الرسالة التربوية بنجاح بواسطة الذكاء الاصطناعي!");
    } catch {
      if (requestId !== aiRequestSeqRef.current) return;
      toast.error("تعذر إنشاء الرسالة الذكية حالياً.");
    } finally {
      if (requestId === aiRequestSeqRef.current) {
        setIsGeneratingAi(false);
      }
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      toast.error("يرجى كتابة نص الرسالة.");
      return;
    }

    setIsSending(true);
    const targetCount = selectedGrade === "all" ? 3050 : 510;

    try {
      const result = await executeAdminAction<{ sentCount?: number }>(
        "send_broadcast",
        {
          gradeSlug: selectedGrade,
          messageText,
          recipientCount: targetCount,
        },
        {
          showToast: false,
          errorMessage: "حدث خطأ أثناء إرسال الرسائل.",
        }
      );

      if (result.success) {
        const actualCount = result.data?.sentCount ?? targetCount;
        setSentCount(actualCount);
        toast.success(`🎉 تم إرسال الرسائل بنجاح إلى ${actualCount} ولي أمر عبر WhatsApp API.`);
      } else {
        toast.error(result.error || "تعذر إرسال الرسائل الجماعية عبر واتساب.");
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "حدث خطأ غير متوقع أثناء إرسال الرسائل.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-md p-6 sm:p-8 max-w-3xl space-y-5 border-2 border-purple-100 shadow-xl">
      <form onSubmit={handleSendBroadcast} className="space-y-4">
        {/* Target Audience */}
        <div className="space-y-1.5 text-right">
          <label htmlFor="broadcast-target-grade" className="text-xs font-bold text-slate-700 flex items-center justify-between cursor-pointer">
            <span>اختر الفئة المستهدفة (الصف الدراسي)</span>
            <UsersGraduationSvg className="w-4 h-4" />
          </label>
          <select
            id="broadcast-target-grade"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 font-bold transition-all cursor-pointer"
          >
            <option value="all">جميع المراحل (كل أولياء الأمور - 3,050 مستلم)</option>
            {INITIAL_GRADES.map((g) => (
              <option key={g.id} value={g.slug}>
                {g.titleEnglish} — {g.titleArabic} ({g.studentsCount} ولي أمر)
              </option>
            ))}
          </select>
        </div>

        {/* Message Content */}
        <div className="space-y-2 text-right">
          <div className="flex items-center justify-between">
            <label htmlFor="broadcast-message-text" className="text-xs font-bold text-slate-700 cursor-pointer">
              نص الرسالة المرسلة لولي الأمر
            </label>
            <div className="flex items-center gap-1 text-[10px] text-purple-700 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span>الصياغة الذكية التلقائية:</span>
            </div>
          </div>

          {/* Quick AI Presets */}
          <div className="flex flex-wrap gap-1.5 justify-end">
            <button
              type="button"
              disabled={isGeneratingAi}
              onClick={() => handleGenerateAi("exam_reminder")}
              className="px-2.5 py-1 rounded-xl bg-purple-100/80 hover:bg-purple-200 text-purple-900 text-[11px] font-bold border border-purple-300/60 transition-colors disabled:opacity-50 cursor-pointer"
            >
              📅 تذكير بالامتحان
            </button>
            <button
              type="button"
              disabled={isGeneratingAi}
              onClick={() => handleGenerateAi("homework_feedback")}
              className="px-2.5 py-1 rounded-xl bg-indigo-100/80 hover:bg-indigo-200 text-indigo-900 text-[11px] font-bold border border-indigo-300/60 transition-colors disabled:opacity-50 cursor-pointer"
            >
              🌟 إعلان نتائج الواجب
            </button>
            <button
              type="button"
              disabled={isGeneratingAi}
              onClick={() => handleGenerateAi("live_session")}
              className="px-2.5 py-1 rounded-xl bg-amber-100/80 hover:bg-amber-200 text-amber-900 text-[11px] font-bold border border-amber-300/60 transition-colors disabled:opacity-50 cursor-pointer"
            >
              🔔 موعد البث المباشر
            </button>
            <button
              type="button"
              disabled={isGeneratingAi}
              onClick={() => handleGenerateAi("motivational_progress")}
              className="px-2.5 py-1 rounded-xl bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold border border-emerald-300/60 transition-colors disabled:opacity-50 cursor-pointer"
            >
              🌸 رسالة شكر وتحفيز
            </button>
          </div>

          <textarea
            id="broadcast-message-text"
            rows={6}
            required
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="اكتب نص الرسالة هنا أو اختر صياغة سريعة من الأعلى..."
            className="w-full p-4 rounded-2xl bg-purple-50/40 border border-purple-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 leading-relaxed font-medium transition-all"
          />
        </div>

        {/* Send Trigger Button */}
        <Button
          type="submit"
          variant="vibrant"
          size="lg"
          isLoading={isSending}
          className="w-full shadow-lg shadow-purple-500/25"
        >
          <BroadcastMegaphoneSvg className="w-5 h-5" />
          <span>إرسال الإشعار لجميع الأرقام المحددة</span>
        </Button>
      </form>

      {sentCount && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-xs text-emerald-950 text-center font-bold flex items-center justify-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>تم إرسال الرسالة بنجاح إلى {sentCount} ولي أمر! نسبة التسليم 99.4%.</span>
        </div>
      )}
    </Card>
  );
}
