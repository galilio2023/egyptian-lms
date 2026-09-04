"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FreeSampleLecture } from "@/lib/db/schema";

interface AddSampleLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (lecture: FreeSampleLecture) => void;
  currentCount: number;
}

export function AddSampleLectureModal({
  isOpen,
  onClose,
  onAdd,
  currentCount,
}: AddSampleLectureModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    badgeText: "مجاني",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.videoUrl.trim()) {
      toast.error("يرجى ملء عنوان ورابط المحاضرة التجريبية.");
      return;
    }

    let finalThumbnail = formData.thumbnailUrl.trim();
    if (!finalThumbnail) {
      const ytMatch = formData.videoUrl.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
      );
      if (ytMatch && ytMatch[1]) {
        finalThumbnail = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
      } else {
        finalThumbnail =
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60";
      }
    }

    const createdItem: FreeSampleLecture = {
      id: `samp-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      videoUrl: formData.videoUrl.trim(),
      thumbnailUrl: finalThumbnail,
      badgeText: formData.badgeText.trim() || "مجاني",
      orderIndex: currentCount + 1,
    };

    onAdd(createdItem);
    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      badgeText: "مجاني",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة محاضرة جديدة لكاروسيل الصفحة الرئيسية"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5 text-right">
          <label htmlFor="newLectureTitle" className="text-xs font-bold text-slate-700">
            عنوان المحاضرة
          </label>
          <Input
            id="newLectureTitle"
            type="text"
            required
            placeholder="مثال: Grade 1 Unit 2 Phonics"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="text-xs font-bold"
          />
        </div>

        <div className="space-y-1.5 text-right">
          <label htmlFor="newLectureVideoUrl" className="text-xs font-bold text-slate-700">
            رابط الفيديو (YouTube أو مباشر)
          </label>
          <Input
            id="newLectureVideoUrl"
            type="url"
            dir="ltr"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            className="text-xs font-mono font-bold"
          />
        </div>

        <div className="space-y-1.5 text-right">
          <label htmlFor="newLectureDescription" className="text-xs font-bold text-slate-700">
            الوصف المختصر
          </label>
          <Input
            id="newLectureDescription"
            type="text"
            placeholder="شرح تفاعلي وممتع للصوتيات"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="text-xs"
          />
        </div>

        <div className="space-y-1.5 text-right">
          <label htmlFor="newLectureBadgeText" className="text-xs font-bold text-slate-700">
            نص الشارة
          </label>
          <Input
            id="newLectureBadgeText"
            type="text"
            placeholder="مجاني / تجريبي"
            value={formData.badgeText}
            onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
            className="text-xs font-bold"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-purple-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" size="sm">
            إضافة المحاضرة
          </Button>
        </div>
      </form>
    </Modal>
  );
}
