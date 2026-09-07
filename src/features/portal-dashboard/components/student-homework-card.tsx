import React from "react";
import { BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { 
  type MockHomeworkAssignment, 
  type MockHomeworkSubmission 
} from "@/lib/db/mock-data";

export interface StudentHomeworkCardProps {
  assignment: MockHomeworkAssignment;
  submission?: MockHomeworkSubmission;
  onOpenSubmissionModal: () => void;
}

export const StudentHomeworkCard: React.FC<StudentHomeworkCardProps> = ({
  assignment,
  submission,
  onOpenSubmissionModal,
}) => {
  return (
    <div className="modern-card p-5 sm:p-6 bg-gradient-to-br from-white via-purple-50/40 to-pink-50/30 border-2 border-purple-200 rounded-3xl shadow-md h-full flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-900">
            <BookOpen className="w-5 h-5 text-purple-600 shrink-0" />
            <span className="font-black text-xs">كراسة الواجب المنزلية</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
            {assignment.pageNumber}
          </span>
        </div>

        <div>
          <h4 className="font-black text-sm text-slate-900 line-clamp-1">
            {assignment.title}
          </h4>
          <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
            {assignment.instructions}
          </p>
        </div>

        {/* Status Callout */}
        <div className="p-2.5 sm:p-3 rounded-2xl bg-purple-100/50 border border-purple-200 text-xs flex flex-wrap items-center justify-between gap-1.5">
          <span className="font-bold text-slate-700">حالة التصحيح:</span>
          {submission?.status === "graded" ? (
            <span className="font-black text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>تم التصحيح ({submission.score}/{submission.maxScore}) 📜</span>
            </span>
          ) : submission ? (
            <span className="font-black text-amber-700 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>تم التسليم (بانتظار المعلم)</span>
            </span>
          ) : (
            <span className="font-bold text-rose-600">
              لم يتم التسليم بعد
            </span>
          )}
        </div>

        {/* Parent & Student Submission Guide */}
        <div className="p-3 rounded-2xl bg-white/90 border border-purple-100 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-black text-purple-900 text-[11px]">
            <span>💡</span>
            <span>تعليمات تسليم الواجب:</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed font-medium">
            حل التمارين بالقلم في كراستك، التقط صورة واضحة وارفعها هنا ليقوم المعلم بتصحيحها بالقلم وإرسال الملاحظات.
          </p>
        </div>
      </div>

      <button
        onClick={onOpenSubmissionModal}
        className="w-full py-3 px-4 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-black text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <BookOpen className="w-4 h-4" />
        <span>
          {submission?.status === "graded"
            ? "عرض كراسة الواجب المصححة بالقلم ✍️"
            : "تسليم صور كراسة الواجب الآن 🚀"}
        </span>
      </button>
    </div>
  );
};
