import React from "react";
import { CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MockHomeworkSubmission } from "@/lib/db/mock-data";

export interface GradedFeedbackCardProps {
  submission: MockHomeworkSubmission;
  onViewAnnotated: () => void;
}

export const GradedFeedbackCard: React.FC<GradedFeedbackCardProps> = ({
  submission,
  onViewAnnotated,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 space-y-3 text-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-950 font-black">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <span>تم تصحيح الواجب بنجاح! 📜</span>
        </div>
        <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-md">
          الدرجة: {submission.score} / {submission.maxScore}
        </div>
      </div>

      {submission.feedbackNotes && (
        <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 text-xs text-slate-800 font-medium leading-relaxed">
          <span className="font-bold text-emerald-900 block mb-0.5">ملاحظات المعلم:</span>
          {submission.feedbackNotes}
        </div>
      )}

      {submission.annotatedImages && submission.annotatedImages.length > 0 && (
        <Button
          type="button"
          variant="success"
          onClick={onViewAnnotated}
          className="w-full"
        >
          <Eye className="w-4 h-4" />
          <span>عرض كراسة الواجب المصححة بالقلم الأحمر ✍️</span>
        </Button>
      )}
    </div>
  );
};
