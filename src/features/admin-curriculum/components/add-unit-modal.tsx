"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export interface AddUnitModalProps {
  isOpen: boolean;
  selectedGrade: string;
  onClose: () => void;
  onSubmit: (data: { title: string; price: number; description: string }) => Promise<void>;
}

export const AddUnitModal: React.FC<AddUnitModalProps> = ({
  isOpen,
  selectedGrade,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("250");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        price: parseInt(price) || 250,
        description: description.trim(),
      });
      setTitle("");
      setDescription("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`إضافة وحدة دراسية جديدة (${selectedGrade.toUpperCase()})`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">عنوان الوحدة</label>
          <input
            type="text"
            required
            placeholder="مثال: Unit 3: Daily Habits & Grammar"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-purple-600 font-medium"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">سعر الوحدة بالجنيه المصري (EGP)</label>
          <input
            type="number"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-purple-600 font-medium"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">وصف محتوى الوحدة</label>
          <textarea
            rows={3}
            placeholder="أدخل ملخص ما يتعلمه الطالب في هذه الوحدة..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-purple-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 pt-2">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            إلغاء
          </Button>
          <Button variant="vibrant" size="sm" type="submit" isLoading={isSubmitting}>
            حفظ ونشر الوحدة
          </Button>
        </div>
      </form>
    </Modal>
  );
};
