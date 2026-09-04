"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { QuestionCard } from "./question-card";
import type { MockQuestion } from "../types";

export interface QuestionsListProps {
  questions: MockQuestion[];
  onDeleteQuestion: (questionId: string) => void;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  onDeleteQuestion,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-900">
          قائمة أسئلة الاختبار ({questions.length})
        </h2>
        <Badge variant="purple" size="md">
          تصحيح آلي فوري ⚡
        </Badge>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx}
            onDelete={onDeleteQuestion}
          />
        ))}
      </div>
    </div>
  );
};
