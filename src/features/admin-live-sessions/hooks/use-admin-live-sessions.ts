"use client";

import { useAdminQuery, executeAdminAction } from "@/lib/api/admin-client";
import { INITIAL_LIVE_SESSIONS, INITIAL_GRADES, type MockLiveSession } from "@/lib/db/mock-data";

export function useAdminLiveSessions() {
  const { data: sessions, setData: setSessions, isLoading, refetch } = useAdminQuery<MockLiveSession[]>(
    "live_sessions",
    INITIAL_LIVE_SESSIONS,
    (res) => (res.liveSessions && Array.isArray(res.liveSessions) ? (res.liveSessions as MockLiveSession[]) : undefined)
  );

  const createSession = async (data: {
    gradeId: string;
    title: string;
    scheduledAt: string;
    durationMinutes: number;
    meetingUrl: string;
    meetingPassword: string;
    description: string;
  }) => {
    const gradeObj = INITIAL_GRADES.find((g) => g.id === data.gradeId);

    const result = await executeAdminAction<{ session?: { id?: string } }>(
      "create_live_session",
      {
        gradeId: data.gradeId,
        title: data.title,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes,
        meetingUrl: data.meetingUrl,
        meetingPassword: data.meetingPassword,
        description: data.description,
        provider: "zoom",
      },
      {
        successMessage: "🎉 تمت جدولة حصة البث المباشر وحفظها بنجاح في قاعدة البيانات!",
        errorMessage: "حدث خطأ أثناء جدولة الحصة.",
      }
    );

    if (result.success) {
      const newSession: MockLiveSession = {
        id: result.data?.session?.id || `ls-${Date.now()}`,
        gradeId: data.gradeId,
        gradeTitle: gradeObj?.titleEnglish || "Grade 1",
        gradeSlug: gradeObj?.slug || "grade-1",
        title: data.title,
        description: data.description,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes,
        provider: "zoom",
        meetingUrl: data.meetingUrl,
        meetingPassword: data.meetingPassword,
        isLiveNow: false,
        instructorName: "مستر أحمد عبد الرحمن",
      };

      setSessions((prev) => [newSession, ...prev]);
      return true;
    }
    return false;
  };

  const toggleLive = async (sessionId: string) => {
    const s = sessions.find((item) => item.id === sessionId);
    if (!s) return false;
    const nextState = !s.isLiveNow;

    const result = await executeAdminAction(
      "toggle_live_session",
      { sessionId, isLiveNow: nextState },
      {
        successMessage: nextState
          ? `🔴 الحصة المباشرة (${s.title}) أصبحت قيد البث الآن للطلاب!`
          : `⏹️ تم إنهاء جلسة البث المباشر.`,
        errorMessage: "حدث خطأ أثناء تغيير حالة البث.",
      }
    );

    if (result.success) {
      setSessions((prev) =>
        prev.map((item) =>
          item.id === sessionId ? { ...item, isLiveNow: nextState } : item
        )
      );
      return true;
    }
    return false;
  };

  const deleteSession = async (sessionId: string) => {
    const result = await executeAdminAction(
      "delete_live_session",
      { sessionId },
      {
        successMessage: "تم حذف جلسة البث المباشر بنجاح.",
        errorMessage: "حدث خطأ أثناء حذف الجلسة.",
      }
    );

    if (result.success) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      return true;
    }
    return false;
  };

  const sendWhatsAppBlast = (session: MockLiveSession) => {
    const text = encodeURIComponent(
      `تنبيه هام من أكاديمية إيليت (مستر أحمد عبد الرحمن) 🔴\nبدأت الآن حصة المراجعة التفاعلية المباشرة:\n*${session.title}*\nالصف: ${session.gradeTitle}\nرابط الدخول المباشر: ${session.meetingUrl}\nكلمة المرور: ${session.meetingPassword}\nبالتوفيق لجميع أبطالنا!`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return {
    sessions,
    isLoading,
    refetch,
    createSession,
    toggleLive,
    deleteSession,
    sendWhatsAppBlast,
  };
}
