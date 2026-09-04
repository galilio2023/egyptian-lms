"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { MockQuestion } from "../types";

export interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (data: {
    text: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    explanation: string;
  }) => Promise<boolean> | boolean;
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  isOpen,
  onClose,
  onAddQuestion,
}) => {
  const [qText, setQText] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");
  const [opt4, setOpt4] = useState("");
  const [correctIdx, setCorrectIdx] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const options = [
      { id: "o-1", text: opt1, isCorrect: correctIdx === 0 },
      { id: "o-2", text: opt2, isCorrect: correctIdx === 1 },
      { id: "o-3", text: opt3, isCorrect: correctIdx === 2 },
      { id: "o-4", text: opt4, isCorrect: correctIdx === 3 },
    ].filter((o) => o.text.trim() !== "");

    if (options.length < 2) return;

    setIsSubmitting(true);
    try {
      const success = await onAddQuestion({
        text: qText.trim(),
        options,
        explanation: explanation.trim() || "إجابة صحيحة وفقاً للمنهج.",
      });

      if (success) {
        setQText("");
        setOpt1("");
        setOpt2("");
        setOpt3("");
        setOpt4("");
        setExplanation("");
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
      title="إضافة سؤال جديد لبنك الأسئلة"
      description="أدخل نص السؤال والاختيارات الأربعة وحدد الإجابة الصحيحة والشرح."
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button
            variant="vibrant"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !qText.trim()}
          >
            {isSubmitting ? "جاري الحفظ..." : "حفظ السؤال في البنك"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            نص السؤال (بالإنجليزية)
          </label>
          <Input
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            placeholder="e.g. Which of the following words starts with the /b/ sound?"
            required
            dir="ltr"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">الاختيار (A)</label>
            <Input
              value={opt1}
              onChange={(e) => setOpt1(e.target.value)}
              placeholder="Option A (e.g. Ball)"
              required
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">الاختيار (B)</label>
            <Input
              value={opt2}
              onChange={(e) => setOpt2(e.target.value)}
              placeholder="Option B (e.g. Cat)"
              required
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">الاختيار (C)</label>
            <Input
              value={opt3}
              onChange={(e) => setOpt3(e.target.value)}
              placeholder="Option C (e.g. Apple)"
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">الاختيار (D)</label>
            <Input
              value={opt4}
              onChange={(e) => setOpt4(e.target.value)}
              placeholder="Option D (e.g. Dog)"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            الإجابة الصحيحة المعتمدة
          </label>
          <Select
            value={correctIdx.toString()}
            onChange={(e) => setCorrectIdx(Number(e.target.value))}
            options={[
              { value: "0", label: "الاختيار (A)" },
              { value: "1", label: "الاختيار (B)" },
              { value: "2", label: "الاختيار (C)" },
              { value: "3", label: "الاختيار (D)" },
            ]}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            شرح وتوضيح الإجابة (يظهر للطالب بعد الحل)
          </label>
          <Input
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="مثال: كلمة Ball تبدأ بحرف الـ B وينطق /b/ كصوت انفجاري شفهي."
          />
        </div>
      </form>
    </Modal>
  );
};
