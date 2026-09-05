"use client";

import { X, Save, MessageCircle } from "lucide-react";
import type { MockHomeworkSubmission } from "@/lib/db/mock-data";

import { getWhatsAppChatUrl } from "@/lib/utils/whatsapp";

interface GraderHeaderProps {
  submission: MockHomeworkSubmission;
  score: number;
  feedbackNotes: string;
  isSaving: boolean;
  teacherName?: string;
  onSave: () => void;
  onClose: () => void;
}

export function GraderHeader({
  submission,
  score,
  feedbackNotes,
  isSaving,
  teacherName = "المعلم المشرف",
  onSave,
  onClose,
}: GraderHeaderProps) {
  const whatsappMsg =
    `🌟 *تقرير تصحيح كراسة الواجب*\n` +
    `👤 *اسم البطل:* ${submission.studentName}\n` +
    `📝 *الواجب:* ${submission.assignmentTitle}\n` +
    `🎯 *الدرجة:* ${score} من ${submission.maxScore}\n` +
    `✍️ *ملاحظات ${teacherName}:* ${feedbackNotes}\n` +
    `يمكنكم الآن الدخول لحساب الطالب لرؤية كراسة الواجب مع علامات التصحيح بالقلم الأحمر 📜👏`;
  const whatsappUrl = getWhatsAppChatUrl(submission.parentPhone, whatsappMsg);

  return (
    <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
            {submission.gradeTitle}
          </span>
          <h2 className="text-lg font-black text-white">
            تصحيح كراسة الواجب: {submission.studentName}
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {submission.assignmentTitle} • ولي الأمر: {submission.parentPhone}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
        >
          <MessageCircle className="w-4 h-4" />
          <span>إشعار ولي الأمر (واتساب)</span>
        </a>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "جاري الحفظ..." : "اعتماد التصحيح والدرجة"}</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
