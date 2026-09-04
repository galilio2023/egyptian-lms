import React from "react";
import { Sparkles, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ManualVideoIdFormProps {
  manualVideoId: string;
  onManualVideoIdChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving?: boolean;
}

export const ManualVideoIdForm: React.FC<ManualVideoIdFormProps> = ({
  manualVideoId,
  onManualVideoIdChange,
  onSubmit,
  isSaving = false,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 text-right">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <HardDrive className="w-4 h-4 text-purple-600" />
          <span>معرف الفيديو (Bunny Stream Video ID أو رابط التضمين)</span>
        </label>
        <input
          type="text"
          required
          dir="ltr"
          placeholder="مثال: 9c0e567a-1234-4567-89ab-cdef01234567"
          value={manualVideoId}
          onChange={(e) => onManualVideoIdChange(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 bg-purple-50/30 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
        />
        <p className="text-[10px] text-slate-500 font-medium">
          يمكنك نسخ الـ Video GUID مباشرة من لوحة تحكم Bunny.net Dashboard إذا تم رفع الفيديو مسبقاً.
        </p>
      </div>

      <Button
        type="submit"
        variant="vibrant"
        size="md"
        isLoading={isSaving}
        className="w-full"
      >
        <Sparkles className="w-4 h-4" />
        <span>ربط وحفظ المحاضرة السحابية</span>
      </Button>
    </form>
  );
};
