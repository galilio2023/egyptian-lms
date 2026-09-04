import React from "react";
import { UploadCloud, FileVideo, X } from "lucide-react";

export interface UploadDropzoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  formatBytes: (bytes: number) => string;
  disabled?: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  selectedFile,
  onFileSelect,
  formatBytes,
  disabled = false,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3 text-right">
      <label className="text-xs font-bold text-slate-700 block">
        ملف المحاضرة (MP4, MOV, MKV):
      </label>

      {!selectedFile ? (
        <div className="relative border-2 border-dashed border-purple-200 hover:border-purple-500 rounded-3xl p-8 text-center bg-purple-50/20 hover:bg-purple-50/40 transition-all">
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/x-matroska"
            disabled={disabled}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>
            <span className="text-sm font-black text-slate-800">
              اسحب وأفلت ملف الفيديو هنا، أو اضغط للاختيار من جهازك
            </span>
            <span className="text-xs text-purple-600 font-medium">
              يدعم ملفات الفيديو عالية الجودة 1080p / 4K حتى 5 جيجابايت
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50 border-2 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center shrink-0">
              <FileVideo className="w-5 h-5" />
            </div>
            <div className="text-right overflow-hidden">
              <span className="text-xs font-black text-slate-900 block truncate max-w-xs sm:max-w-md">
                {selectedFile.name}
              </span>
              <span className="text-[11px] text-purple-700 font-bold font-mono">
                {formatBytes(selectedFile.size)}
              </span>
            </div>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              aria-label="إلغاء الملف"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
