import React from "react";
import { Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface LessonDetailsFormProps {
  lectureTitle: string;
  onLectureTitleChange: (v: string) => void;
  lectureDuration: string;
  onLectureDurationChange: (v: string) => void;
  isFreePreview: boolean;
  onIsFreePreviewChange: (v: boolean) => void;
  pdfAttachmentUrl: string;
  onPdfAttachmentUrlChange: (v: string) => void;
  prerequisiteType?: string;
  onPrerequisiteTypeChange?: (v: string) => void;
  disabled?: boolean;
}

export const LessonDetailsForm: React.FC<LessonDetailsFormProps> = ({
  lectureTitle,
  onLectureTitleChange,
  lectureDuration,
  onLectureDurationChange,
  isFreePreview,
  onIsFreePreviewChange,
  pdfAttachmentUrl,
  onPdfAttachmentUrlChange,
  prerequisiteType,
  onPrerequisiteTypeChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-4 text-right">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="عنوان المحاضرة أو الدرس"
            required
            disabled={disabled}
            placeholder="مثال: الدرس الأول - Phonics & Sound Rules"
            value={lectureTitle}
            onChange={(e) => onLectureTitleChange(e.target.value)}
          />
        </div>
        <div>
          <Input
            label="مدة الفيديو التقديرية (بالدقائق)"
            type="number"
            disabled={disabled}
            value={lectureDuration}
            onChange={(e) => onLectureDurationChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
        <label htmlFor="free-preview-toggle" className="cursor-pointer select-none">
          <span className="text-xs font-black text-slate-800 block">
            معاينة مجانية (Free Preview)
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            السماح للطلاب غير المشتركين بمشاهدة هذه المحاضرة كعينة تجريبية
          </span>
        </label>
        <input
          type="checkbox"
          id="free-preview-toggle"
          disabled={disabled}
          checked={isFreePreview}
          onChange={(e) => onIsFreePreviewChange(e.target.checked)}
          className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="prerequisite-type-select" className="text-xs font-bold text-slate-700 flex items-center justify-between cursor-pointer">
          <span>شرط فتح المحاضرة للطالب (Prerequisite Drip)</span>
          <span className="text-[10px] text-purple-600 font-bold">تسلسل المنهج</span>
        </label>
        <select
          id="prerequisite-type-select"
          disabled={disabled}
          value={prerequisiteType || "none"}
          onChange={(e) => onPrerequisiteTypeChange?.(e.target.value)}
          className="w-full min-h-[42px] px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all cursor-pointer"
        >
          <option value="none">بدون قيود - المحاضرة متاحة فور الاشتراك</option>
          <option value="previous_quiz_passed">إلزام الطالب باجتياز كويز المحاضرة السابقة أولاً 📝</option>
          <option value="previous_homework_submitted">إلزام الطالب برفع وتسليم واجب المحاضرة السابقة أولاً ✍️</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="pdf-attachment-url" className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
          <Link2 className="w-3.5 h-3.5 text-purple-600" />
          <span>رابط ملزمة الشرح أو الواجب PDF (اختياري)</span>
        </label>
        <input
          id="pdf-attachment-url"
          type="url"
          disabled={disabled}
          placeholder="https://drive.google.com/... أو رابط مباشر للملف"
          value={pdfAttachmentUrl}
          onChange={(e) => onPdfAttachmentUrlChange(e.target.value)}
          className="w-full min-h-[42px] px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 font-mono transition-all"
        />
      </div>
    </div>
  );
};
