"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const [price, setPrice] = useState("120");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        price: Number(price) || 0,
        description: description.trim(),
      });
      setTitle("");
      setPrice("120");
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
        <Input
          label="عنوان الوحدة الدراسية"
          required
          placeholder="مثال: Unit 3: Daily Habits & Grammar"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          label="سعر الوحدة بالجنيه المصري (EGP)"
          type="number"
          min={0}
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <Textarea
          label="وصف محتوى الوحدة"
          rows={3}
          placeholder="أدخل ملخص ما يتعلمه الطالب في هذه الوحدة..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

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
