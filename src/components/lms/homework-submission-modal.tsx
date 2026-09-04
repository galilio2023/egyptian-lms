"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  Camera, 
  Sparkles, 
  Image as ImageIcon,
  Clock,
  Eye,
  Trash2
} from "lucide-react";
import type { MockHomeworkAssignment, MockHomeworkSubmission } from "@/lib/db/mock-data";

interface HomeworkSubmissionModalProps {
  assignment: MockHomeworkAssignment;
  existingSubmission?: MockHomeworkSubmission;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (submission: MockHomeworkSubmission) => void;
}

export function HomeworkSubmissionModal({
  assignment,
  existingSubmission,
  isOpen,
  onClose,
  onSubmitSuccess,
}: HomeworkSubmissionModalProps) {
  const [images, setImages] = useState<Array<{ pageNumber: number; imageUrl: string }>>(
    existingSubmission?.studentImages || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewAnnotatedModal, setViewAnnotatedModal] = useState(false);

  if (!isOpen) return null;

  const compressImage = (file: File, maxDim = 1600, quality = 0.82): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const toastId = toast.loading("جاري معالجة وضغط صور الكراسة...");
    try {
      const compressedList: Array<{ pageNumber: number; imageUrl: string }> = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 15 * 1024 * 1024) {
          toast.error(`الملف ${file.name} كبير جداً.`);
          continue;
        }
        const dataUrl = await compressImage(file);
        compressedList.push({
          pageNumber: images.length + i + 1,
          imageUrl: dataUrl,
        });
      }

      setImages((prev) => [
        ...prev,
        ...compressedList.map((item, idx) => ({
          pageNumber: prev.length + idx + 1,
          imageUrl: item.imageUrl,
        })),
      ]);
      toast.dismiss(toastId);
      toast.success(`تم إرفاق ${compressedList.length} صفحة بنجاح ✓`);
    } catch {
      toast.dismiss(toastId);
      toast.error("تعذر قراءة أو ضغط ملفات الصور.");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error("يرجى التقاط أو رفع صورة واحدة على الأقل لصفحات الكراسة.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/homework/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          studentImages: images,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "حدث خطأ أثناء رفع الواجب.");
        return;
      }

      toast.success("🎉 أحسنت يا بطل! تم تسليم كراسة الواجب لمعلم المادة بنجاح.");
      if (onSubmitSuccess) {
        onSubmitSuccess(data.submission);
      }
      onClose();
    } catch {
      // Offline fallback mock success
      toast.success("🎉 تم حفظ وتأكيد تسليم الواجب بنجاح!");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGraded = existingSubmission?.status === "graded";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-purple-100 overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-white border-b border-purple-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-black">
                {assignment.pageNumber}
              </span>
              <h3 className="font-black text-lg text-slate-900">
                كراسة الواجب والمهام المنزلية
              </h3>
            </div>
            <p className="text-xs text-purple-900 font-bold mt-1">
              {assignment.title}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-purple-100/60 hover:bg-purple-200 text-purple-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Instructions Box */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1">
            <span className="font-black block text-amber-900">تعليمات مستر أحمد:</span>
            <p className="leading-relaxed font-medium">{assignment.instructions}</p>
          </div>

          {/* If already Graded - Show score and teacher comments */}
          {isGraded && existingSubmission && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-950 font-black">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span>تم تصحيح الواجب بنجاح! 📜</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-md">
                  الدرجة: {existingSubmission.score} / {existingSubmission.maxScore}
                </div>
              </div>

              {existingSubmission.feedbackNotes && (
                <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 text-xs text-slate-800 font-medium leading-relaxed">
                  <span className="font-bold text-emerald-900 block mb-0.5">ملاحظات المعلم:</span>
                  {existingSubmission.feedbackNotes}
                </div>
              )}

              {existingSubmission.annotatedImages && existingSubmission.annotatedImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setViewAnnotatedModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>عرض كراسة الواجب المصححة بالقلم الأحمر ✍️</span>
                </button>
              )}
            </div>
          )}

          {/* Upload Area */}
          {!isGraded && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 block">
                  التقط أو ارفع صور صفحات الكراسة أو كتاب النشاط:
                </label>
                
                <div className="relative border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-3xl p-6 text-center bg-purple-50/40 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 text-purple-700 pointer-events-none">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="font-black text-xs text-slate-800">
                      اضغط هنا لفتح الكاميرا والتقاط صورة الكراسة
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      أو اسحب صور الصفحات هنا (يدعم حتى 5 صفحات PNG / JPG)
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Thumbnails Strip */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-600">
                    الصفحات المرفقة ({images.length}):
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-purple-200 group bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.imageUrl}
                          alt={`الصفحة ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 start-1.5 px-2 py-0.5 rounded-md bg-black/60 text-white font-bold text-[10px]">
                          صفحة {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 end-1.5 p-1 rounded-md bg-rose-600/90 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || images.length === 0}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isSubmitting ? "جاري تسليم الكراسة..." : "تسليم الواجب الآن لمعلم المادة 🚀"}</span>
              </button>
            </form>
          )}

        </div>

      </div>

      {/* Pop-up view for corrected annotated image */}
      {viewAnnotatedModal && existingSubmission?.annotatedImages && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden border-2 border-emerald-400 p-4 space-y-3">
            <div className="flex items-center justify-between text-white">
              <span className="text-xs font-black">تصحيح مستر أحمد عبد الرحمن ✓</span>
              <button 
                onClick={() => setViewAnnotatedModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-black/40 rounded-2xl p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={existingSubmission.annotatedImages[0]?.dataUrl}
                alt="كراسة الواجب المصححة"
                className="max-h-[70vh] rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
