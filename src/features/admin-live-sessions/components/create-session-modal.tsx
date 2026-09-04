"use client";

import React, { useState } from "react";
import { Video } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { INITIAL_GRADES } from "@/lib/db/mock-data";

export interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (data: {
    gradeId: string;
    title: string;
    scheduledAt: string;
    durationMinutes: number;
    meetingUrl: string;
    meetingPassword: string;
    description: string;
  }) => Promise<boolean> | boolean;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  onCreateSession,
}) => {
  const [newTitle, setNewTitle] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("g-1");
  const [scheduledAt, setScheduledAt] = useState("2026-09-06T19:00");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingUrl, setMeetingUrl] = useState("https://zoom.us/j/1234567890?pwd=ELITE");
  const [meetingPassword, setMeetingPassword] = useState("ELITE");
  const [description, setDescription] = useState("بث مباشر تفاعلي لحل تدريبات الوحدة والإجابة على أسئلة الطلاب.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !meetingUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await onCreateSession({
        gradeId: selectedGrade,
        title: newTitle.trim(),
        scheduledAt,
        durationMinutes,
        meetingUrl: meetingUrl.trim(),
        meetingPassword: meetingPassword.trim(),
        description: description.trim(),
      });

      if (success) {
        setNewTitle("");
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="جدولة حصة مراجعة تفاعلية جديدة"
      icon={<Video className="w-5 h-5 text-purple-600" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-right text-xs">
        <Select
          label="الصف الدراسي المستهدف:"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          options={INITIAL_GRADES.map((g) => ({
            value: g.id,
            label: `${g.titleEnglish} — ${g.titleArabic}`,
          }))}
        />

        <Input
          label="عنوان الحصة المباشرة:"
          placeholder="مثال: ليلة امتحان شهر أكتوبر وحل التوقعات المرئية"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="تاريخ ووقت البث:"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
          <Input
            label="مدة الحصة (بالدقائق):"
            type="number"
            min={15}
            value={String(durationMinutes)}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            required
          />
        </div>

        <Input
          label="رابط غرفة الزووم المباشر (Zoom / WebRTC URL):"
          dir="ltr"
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
          required
        />

        <Input
          label="كلمة المرور للغرفة (Passcode):"
          dir="ltr"
          value={meetingPassword}
          onChange={(e) => setMeetingPassword(e.target.value)}
          required
        />

        <div className="space-y-1 text-right">
          <label className="font-bold text-slate-700 block mb-1">وصف الحصة وأهم محاورها:</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-purple-50/50 border border-purple-200 text-slate-900 font-medium focus:outline-none focus:border-purple-600"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="vibrant"
            size="sm"
            disabled={isSubmitting || !newTitle.trim() || !meetingUrl.trim()}
          >
            {isSubmitting ? "جاري الحفظ..." : "تأكيد وجدولة الحصة"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
