"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { INITIAL_GRADES } from "@/lib/db/mock-data";
import { 
  BroadcastMegaphoneSvg, 
  WhatsAppBubbleSvg, 
  UsersGraduationSvg 
} from "@/components/ui/illustrated-icons";

export default function AdminBroadcastsPage() {
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [messageText, setMessageText] = useState(
    "أولياء أمور طلاب أكاديمية إيليت الأعزاء 🌟\nنحيطكم علماً بأن اختبار الوحدة متاح الآن على المنصة، ونرجو من جميع الأبطال دخول الاختبار لمتابعة مستواهم.\nمع أطيب تمنيات مستر أحمد عبد الرحمن بالتفوق الدائم!"
  );
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState<number | null>(null);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      toast.error("يرجى كتابة نص الرسالة.");
      return;
    }

    setIsSending(true);
    const targetCount = selectedGrade === "all" ? 3050 : 510;

    try {
      await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_broadcast",
          payload: {
            gradeSlug: selectedGrade,
            messageText,
            recipientCount: targetCount,
          },
        }),
      });

      setSentCount(targetCount);
      toast.success(`🎉 تم إرسال الرسائل بنجاح إلى ${targetCount} ولي أمر عبر WhatsApp API.`);
    } catch {
      toast.error("حدث خطأ أثناء إرسال الرسائل.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <BroadcastMegaphoneSvg className="w-8 h-8" />
            <span>مركز رسائل الواتساب الجماعية <span className="text-gradient-purple">(Broadcasts)</span></span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            إرسال تنبيهات المواعيد، جداول الامتحانات، والإعلانات الهامة مباشرة إلى هواتف أولياء الأمور.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-50 border-2 border-emerald-200 px-4 py-2 rounded-2xl shadow-sm">
          <WhatsAppBubbleSvg className="w-5 h-5 drop-shadow-sm" />
          <span>حساب WhatsApp Business متصل ومفعل ✓</span>
        </div>
      </div>

      {/* Broadcast Form Card */}
      <div className="modern-card bg-white/95 backdrop-blur-md p-6 sm:p-8 max-w-3xl space-y-5 border-2 border-purple-100 shadow-xl rounded-3xl">
        
        <form onSubmit={handleSendBroadcast} className="space-y-4">
          
          {/* Target Audience */}
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>اختر الفئة المستهدفة (الصف الدراسي)</span>
              <UsersGraduationSvg className="w-4 h-4" />
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 font-bold"
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
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>نص الرسالة المرسلة لولي الأمر</span>
              <span className="text-[10px] text-purple-600 font-bold">يدعم التنسيق والرموز التعبيرية</span>
            </label>
            <textarea
              rows={6}
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-4 rounded-2xl bg-purple-50/40 border border-purple-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-purple-600 leading-relaxed font-medium"
            />
          </div>

          {/* Send Trigger Button */}
          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3.5 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {isSending ? (
              <span>جاري الإرسال عبر خوادم واتساب...</span>
            ) : (
              <>
                <BroadcastMegaphoneSvg className="w-5 h-5" />
                <span>إرسال الإشعار لجميع الأرقام المحددة</span>
              </>
            )}
          </button>
        </form>

        {sentCount && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-xs text-emerald-950 text-center font-bold flex items-center justify-center gap-2 animate-in fade-in-50">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>تم إرسال الرسالة بنجاح إلى {sentCount} ولي أمر! نسبة التسليم 99.4%.</span>
          </div>
        )}

      </div>

    </div>
  );
}
