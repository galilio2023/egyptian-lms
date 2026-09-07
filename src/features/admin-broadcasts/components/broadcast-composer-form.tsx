"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
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
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-md p-6 sm:p-8 max-w-3xl space-y-5 border-2 border-purple-100 shadow-xl">
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
