import React from "react";
import { Camera } from "lucide-react";

export interface SubmissionFilePickerProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting?: boolean;
}

export const SubmissionFilePicker: React.FC<SubmissionFilePickerProps> = ({
  onFileChange,
  isSubmitting = false,
}) => {
  return (
    <div className="space-y-2 text-right">
      <label className="text-xs font-black text-slate-700 block">
        التقط أو ارفع صور صفحات الكراسة أو كتاب النشاط:
      </label>

      <div className="relative border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-3xl p-6 text-center bg-purple-50/40 transition-colors">
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={isSubmitting}
          onChange={onFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center gap-2 text-purple-700 pointer-events-none">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
            <Camera className="w-6 h-6" />
          </div>
          <span className="font-black text-xs text-slate-800">
            اضغط هنا لفتح الكاميرا والتقاط صورة الكراسة
          </span>
          <span className="text-[11px] text-purple-600 font-bold">
            أو اختر صور الواجب المحفوظة من هاتفك مباشرة (يمكن اختيار عدة صور)
          </span>
        </div>
      </div>
    </div>
  );
};
