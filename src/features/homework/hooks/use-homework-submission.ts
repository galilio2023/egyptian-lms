"use client";

import { useState } from "react";
import { toast } from "sonner";
import { compressImage, estimateDataUrlSizeKB } from "@/lib/utils/image-compression";
import { apiPost } from "@/lib/api/api-client";
import type { MockHomeworkAssignment, MockHomeworkSubmission } from "@/lib/db/mock-data";

export interface UseHomeworkSubmissionProps {
  assignment: MockHomeworkAssignment;
  existingSubmission?: MockHomeworkSubmission;
  onSubmitSuccess?: (submission: MockHomeworkSubmission) => void;
  onClose: () => void;
}

export function useHomeworkSubmission({
  assignment,
  existingSubmission,
  onSubmitSuccess,
  onClose,
}: UseHomeworkSubmissionProps) {
  const [images, setImages] = useState<Array<{ pageNumber: number; imageUrl: string }>>(
    existingSubmission?.studentImages || []
  );
  const [audioVoiceNoteUrl, setAudioVoiceNoteUrl] = useState<string | null>(
    existingSubmission?.audioVoiceNoteUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewAnnotatedModal, setViewAnnotatedModal] = useState(false);

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
        const dataUrl = await compressImage(file, 1600, 0.82);
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
      const totalSizeKB = compressedList.reduce(
        (sum, item) => sum + estimateDataUrlSizeKB(item.imageUrl),
        0
      );
      const sizeLabel = totalSizeKB > 1024
        ? `${(totalSizeKB / 1024).toFixed(1)} MB`
        : `${totalSizeKB} KB`;
      toast.success(`تم إرفاق ${compressedList.length} صفحة بنجاح ✓ (${sizeLabel} بعد الضغط)`);
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
    if (images.length === 0 && !audioVoiceNoteUrl) {
      toast.error("يرجى التقاط أو رفع صورة واحدة على الأقل أو تسجيل ملاحظة صوتية.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiPost<{ submission: MockHomeworkSubmission }>(
        "/api/homework/submit",
        {
          assignmentId: assignment.id,
          studentImages: images,
          audioVoiceNoteUrl: audioVoiceNoteUrl || undefined,
        },
        { showToast: false }
      );

      if (!res.success) {
        toast.error(res.error || "حدث خطأ أثناء رفع الواجب.");
        return;
      }

      const hasAudio = Boolean(res.data?.submission?.audioVoiceNoteUrl || audioVoiceNoteUrl);
      const hasImages = images.length > 0;
      const successMsg = hasAudio && hasImages
        ? "🎉 أحسنت يا بطل! تم تسليم كراسة الواجب والملاحظة الصوتية لمعلم المادة بنجاح."
        : hasAudio
        ? "🎉 أحسنت يا بطل! تم تسليم الملاحظة الصوتية لمعلم المادة بنجاح."
        : "🎉 أحسنت يا بطل! تم تسليم صفحات كراسة الواجب لمعلم المادة بنجاح.";

      toast.success(successMsg);
      if (onSubmitSuccess && res.data?.submission) {
        onSubmitSuccess(res.data.submission);
      }
      onClose();
    } catch {
      toast.error("فشل الاتصال أثناء تسليم الواجب، يرجى إعادة المحاولة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    images,
    audioVoiceNoteUrl,
    setAudioVoiceNoteUrl,
    isSubmitting,
    viewAnnotatedModal,
    setViewAnnotatedModal,
    handleFileChange,
    handleRemoveImage,
    handleSubmit,
  };
}
