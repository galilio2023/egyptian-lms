"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Video, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  MessageCircle, 
  Radio, 
  Sparkles,
  Users,
  Trash2,
  X
} from "lucide-react";
import { INITIAL_LIVE_SESSIONS, INITIAL_GRADES, type MockLiveSession } from "@/lib/db/mock-data";

export default function AdminLiveSessionsPage() {
  const [sessions, setSessions] = useState<MockLiveSession[]>(INITIAL_LIVE_SESSIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("g-1");
  const [scheduledAt, setScheduledAt] = useState("2026-09-06T19:00");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingUrl, setMeetingUrl] = useState("https://zoom.us/j/1234567890?pwd=ELITE");
  const [meetingPassword, setMeetingPassword] = useState("ELITE");
  const [description, setDescription] = useState("بث مباشر تفاعلي لحل تدريبات الوحدة والإجابة على أسئلة الطلاب.");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/actions?type=live_sessions")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.liveSessions && data.liveSessions.length > 0) {
          setSessions(data.liveSessions);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !meetingUrl.trim()) {
      toast.error("يرجى ملء جميع الحقول الإلزامية.");
      return;
    }

    const gradeObj = INITIAL_GRADES.find((g) => g.id === selectedGrade) || INITIAL_GRADES[0];

    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_live_session",
          payload: {
            gradeId: gradeObj.id,
            title: newTitle.trim(),
            description,
            scheduledAt,
            durationMinutes,
            meetingUrl: meetingUrl.trim(),
            meetingPassword: meetingPassword.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "حدث خطأ أثناء جدولة الحصة.");
        return;
      }

      const newSession: MockLiveSession = {
        id: data.liveSession?.id || `live-${Date.now()}`,
        gradeId: gradeObj.id,
        gradeTitle: `${gradeObj.titleEnglish} (${gradeObj.titleArabic})`,
        gradeSlug: gradeObj.slug,
        title: newTitle.trim(),
        description,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes,
        provider: "zoom",
        meetingUrl,
        meetingPassword,
        isLiveNow: false,
        instructorName: "مستر أحمد عبد الرحمن",
      };

      setSessions((prev) => [newSession, ...prev]);
      toast.success("🎉 تم جدولة حصة البث المباشر بنجاح وحفظها في قاعدة البيانات!");
      setIsModalOpen(false);
      setNewTitle("");
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم.");
    }
  };

  const handleToggleLive = async (id: string) => {
    const s = sessions.find((item) => item.id === id);
    if (!s) return;
    const nextState = !s.isLiveNow;

    try {
      await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_live_session",
          payload: { sessionId: id, isLiveNow: nextState },
        }),
      });

      setSessions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isLiveNow: nextState } : item))
      );

      if (nextState) {
        toast.success(`🔴 تم بدء البث المباشر لحصة (${s.title}) وإشعار الطلاب!`);
      } else {
        toast.info(`تم إنهاء البث المباشر.`);
      }
    } catch {
      toast.error("حدث خطأ أثناء تحديث حالة البث.");
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_live_session",
          payload: { sessionId: id },
        }),
      });

      setSessions((prev) => prev.filter((item) => item.id !== id));
      toast.success("تم حذف جلسة البث المباشر بنجاح.");
    } catch {
      toast.error("حدث خطأ أثناء حذف الحصة.");
    }
  };

  const handleSendWhatsAppBlast = (session: MockLiveSession) => {
    const msg = encodeURIComponent(
      `🔔 *تنبيه هام: موعد حصة البث المباشر - أكاديمية إيليت*\n` +
      `مع مستر أحمد عبد الرحمن 🌟\n` +
      `📌 *عنوان الحصة:* ${session.title}\n` +
      `📅 *الموعد:* ${new Date(session.scheduledAt).toLocaleString("ar-EG")}\n` +
      `🔗 *رابط الدخول على Zoom:* ${session.meetingUrl}\n` +
      `🔑 *كلمة السر:* ${session.meetingPassword || "ELITE"}\n` +
      `نرجو من جميع الأبطال الحضور في الموعد ومشاركة الأسئلة مباشرة!`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
    toast.success("تم فتح واتساب لبث الرابط لأولياء الأمور!");
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <Video className="w-8 h-8 text-purple-600" />
            <span>إدارة حصص البث المباشر والزووم <span className="text-gradient-purple">(Live Classes)</span></span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            جدولة مواعيد حصص المراجعة ليلة الامتحان، ضبط روابط زووم، وإرسال تنبيهات واتساب لأولياء الأمور.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-vibrant hover:scale-105 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>جدولة حصة لايف جديدة 🔴</span>
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sessions.map((ses) => (
          <div
            key={ses.id}
            className="modern-card p-6 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-purple-100 shadow-md space-y-4 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              
              {/* Top Tag & Live Badge */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-800 text-xs font-black">
                  {ses.gradeTitle}
                </span>

                {ses.isLiveNow ? (
                  <span className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-600/30 animate-pulse">
                    <Radio className="w-4 h-4" />
                    <span>مباشر الآن 🔴</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>مجدولة</span>
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {ses.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  {ses.description}
                </p>
              </div>

              {/* Date & Provider Info */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs space-y-1 text-purple-950 font-bold">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>الموعد: {new Date(ses.scheduledAt).toLocaleString("ar-EG")}</span>
                  </span>
                  <span>المدة: {ses.durationMinutes} دقيقة</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>منصة البث: Zoom Cloud Meetings</span>
                  {ses.meetingPassword && (
                    <span className="font-mono text-purple-700">Passcode: {ses.meetingPassword}</span>
                  )}
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleToggleLive(ses.id)}
                className={`flex-1 py-2.5 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  ses.isLiveNow
                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                    : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{ses.isLiveNow ? "إنهاء البث ⏹️" : "بدء البث المباشر الآن 🔴"}</span>
              </button>

              <button
                onClick={() => handleSendWhatsAppBlast(ses)}
                className="py-2.5 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                title="إرسال رابط الحصة على واتساب"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">بث الرابط لواتساب</span>
              </button>

              <a
                href={ses.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="فتح غرفة الزووم"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => handleDeleteSession(ses.id)}
                className="p-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                title="حذف جلسة البث"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in-50">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-purple-100 p-6 space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" />
                <span>جدولة حصة مراجعة تفاعلية جديدة</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3.5 text-right text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">الصف الدراسي المستهدف:</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-200 text-slate-900 font-bold focus:outline-none focus:border-purple-600"
                >
                  {INITIAL_GRADES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.titleEnglish} — {g.titleArabic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان الحصة المباشرة:</label>
                <input
                  type="text"
                  placeholder="مثال: ليلة امتحان شهر أكتوبر وحل التوقعات المرئية"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-200 text-slate-900 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاريخ ووقت البث:</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-200 text-slate-900 font-medium focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">مدة الحصة (بالدقائق):</label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                    className="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-200 text-slate-900 font-medium focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">رابط الغرفة (Zoom Meeting Link):</label>
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-200 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">كلمة مرور الحصة (Meeting Passcode):</label>
                <input
                  type="text"
                  value={meetingPassword}
                  onChange={(e) => setMeetingPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-200 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">وصف الحصة وتوجيهات الطلاب:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  حفظ وجدولة الحصة 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
