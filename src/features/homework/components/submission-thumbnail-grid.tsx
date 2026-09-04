import React from "react";
import { Trash2 } from "lucide-react";

export interface SubmissionThumbnailGridProps {
  images: Array<{ pageNumber: number; imageUrl: string }>;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export const SubmissionThumbnailGrid: React.FC<SubmissionThumbnailGridProps> = ({
  images,
  onRemove,
  disabled = false,
}) => {
  if (images.length === 0) return null;

  return (
    <div className="space-y-2 text-right">
      <span className="text-xs font-black text-slate-700 block">
        الصفحات المرفقة ({images.length}):
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative group rounded-2xl border-2 border-purple-200 overflow-hidden bg-slate-100 aspect-[3/4] shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.imageUrl}
              alt={`صفحة ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onRemove(idx)}
                disabled={disabled}
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                aria-label={`حذف صفحة ${idx + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <span className="absolute bottom-2 start-2 px-2 py-0.5 rounded-lg bg-black/70 text-white text-[10px] font-black">
              صفحة {idx + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
