"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Video, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Radio, 
  Send
} from "lucide-react";
import type { MockLiveSession } from "@/lib/db/mock-data";

export interface LiveSessionWidgetProps {
  session: MockLiveSession;
  studentName?: string;
}

export function LiveSessionWidget({
  session,
  studentName = "أحمد محمود الخولي",
}: LiveSessionWidgetProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  const [questionText, setQuestionText] = useState("");
  const [copiedPass, setCopiedPass] = useState(false);
  const [questionsSubmitted, setQuestionsSubmitted] = useState<string[]>([]);

  useEffect(() => {
    const targetTime = new Date(session.scheduledAt).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [session.scheduledAt]);

  const handleCopyPassword = () => {
    if (!session.meetingPassword) return;
    navigator.clipboard.writeText(session.meetingPassword);
    setCopiedPass(true);
    toast.success("تم نسخ كلمة سر الحصة بنجاح!");
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setQuestionsSubmitted((prev) => [...prev, questionText.trim()]);
    toast.success(`تم إرسال سؤالك للمحاضر ليجيب عنه في البث المباشر يا ${studentName}! 🌟`);
    setQuestionText("");
  };

  const isLive = session.isLiveNow || timeLeft.isPast;

  const [isJoining, setIsJoining] = useState(false);

  const handleJoinMeeting = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isJoining) return;
    setIsJoining(true);

    // Open placeholder tab synchronously to preserve user-gesture permissions
    const newWindow = typeof window !== "undefined" ? window.open("", "_blank") : null;

    try {
      const response = await fetch("/api/live-sessions/attend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (newWindow) newWindow.close();
        toast.error(data.error || "تعذر تسجيل الحضور والانضمام للبث.");
        return;
      }

      toast.success(data.message || "تم تسجيل حضورك في الحصة بنجاح 🔴");
      const targetUrl = data.meetingUrl || session.meetingUrl;

      if (newWindow) {
        newWindow.opener = null;
        newWindow.location.href = targetUrl;
      } else {
        window.location.href = targetUrl;
      }
    } catch {
      if (newWindow) newWindow.close();
      toast.error("فشل الاتصال بخادم البث المباشر.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="modern-card p-4 sm:p-6 bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 rounded-3xl text-white shadow-2xl border-2 border-purple-500/30 relative overflow-hidden space-y-4 sm:space-y-5">
      {/* Background Decorative Element */}
      <div className="absolute top-0 end-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-800/60 pb-3 sm:pb-4">
        <div className="space-y-1">
          <div className="flex items-center flex-wrap gap-2">
            {isLive ? (
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-rose-600/40 animate-pulse">
                <Radio className="w-4 h-4" />
                <span>مباشر الآن (LIVE)</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black border border-indigo-400/30 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>حصة مراجعة قادمة</span>
              </span>
            )}
            <span className="text-xs font-bold text-purple-300">
              {session.gradeTitle}
            </span>
          </div>

          <h3 className="text-base sm:text-xl font-black text-white leading-snug">
            {session.title}
          </h3>
        </div>

        <div className="text-right sm:text-left text-xs text-purple-200">
          <span className="font-bold block text-white">{session.instructorName}</span>
          <span>المدة: {session.durationMinutes} دقيقة</span>
        </div>
      </div>

      <p className="text-xs text-purple-200/90 leading-relaxed font-medium">
        {session.description}
      </p>

      {/* Countdown Timer Block (if not live yet) */}
      {!isLive && (
        <div className="p-3 sm:p-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 space-y-2">
          <span className="text-[11px] font-bold text-purple-300 block text-center">
            الوقت المتبقي حتى انطلاق البث المباشر:
          </span>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
            <div className="p-2 sm:p-2.5 rounded-xl bg-purple-900/50 border border-purple-700/50">
              <div className="text-lg sm:text-2xl font-black text-amber-300">{timeLeft.days}</div>
              <div className="text-[9px] sm:text-[10px] text-purple-300 font-bold">أيام</div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-purple-900/50 border border-purple-700/50">
              <div className="text-lg sm:text-2xl font-black text-white">{timeLeft.hours}</div>
              <div className="text-[9px] sm:text-[10px] text-purple-300 font-bold">ساعات</div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-purple-900/50 border border-purple-700/50">
              <div className="text-lg sm:text-2xl font-black text-white">{timeLeft.minutes}</div>
              <div className="text-[9px] sm:text-[10px] text-purple-300 font-bold">دقائق</div>
            </div>
            <div className="p-2 sm:p-2.5 rounded-xl bg-purple-900/50 border border-purple-700/50">
              <div className="text-lg sm:text-2xl font-black text-pink-400 animate-pulse">{timeLeft.seconds}</div>
              <div className="text-[9px] sm:text-[10px] text-purple-300 font-bold">ثواني</div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {session.meetingPassword && (
          <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-purple-200">
            <span>كلمة مرور الحصة:</span>
            <code className="px-2.5 py-1 rounded-lg bg-black/40 font-mono font-bold text-amber-300 border border-purple-700">
              {session.meetingPassword}
            </code>
            <button
              onClick={handleCopyPassword}
              className="p-1 rounded-lg bg-purple-800/60 hover:bg-purple-700 text-purple-200 hover:text-white transition-colors cursor-pointer"
              title="نسخ كلمة السر"
            >
              {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        <button
          onClick={handleJoinMeeting}
          className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
            isLive 
              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 hover:scale-102" 
              : "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-amber-400/25"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>{isLive ? "دخول غرفة البث المباشر وتسجيل الحضور 🔴" : "فتح رابط الغرفة على Zoom 🚀"}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Student Question Submission for Live Q&A */}
      <div className="pt-3 border-t border-purple-800/40">
        <form onSubmit={handleSendQuestion} className="flex gap-2">
          <input
            type="text"
            placeholder="اكتب سؤالك للمحاضر ليجيب عنه في البث..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-700/60 text-xs text-white placeholder:text-purple-300/50 focus:outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إرسال</span>
          </button>
        </form>

        {questionsSubmitted.length > 0 && (
          <div className="mt-2 text-[11px] text-emerald-300 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تم إرسال {questionsSubmitted.length} أسئلة للمحاضر ✓</span>
          </div>
        )}
      </div>
    </div>
  );
}
