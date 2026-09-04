"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ExamQuizSheetSvg } from "@/components/ui/illustrated-icons";
import { AdminPageHeader } from "@/components/shared";
import { Button } from "@/components/ui";
import {
  QuizOverviewCards,
  QuestionsList,
  AddQuestionModal,
  useAdminQuizzes,
} from "@/features/admin-quizzes";

export default function AdminQuizzesPage() {
  const { questions, addQuestion, deleteQuestion } = useAdminQuizzes();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        icon={<ExamQuizSheetSvg className="w-8 h-8" />}
        title={
          <>
            بنك الأسئلة والامتحانات{" "}
            <span className="text-gradient-purple">(Quiz Studio)</span>
          </>
        }
        subtitle="إعداد الاختبارات التفاعلية، إضافة الأسئلة، وتحديد وقت الامتحان ونسبة النجاح."
        actions={
          <Button
            variant="vibrant"
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 me-1" />
            <span>إضافة سؤال جديد للبنك</span>
          </Button>
        }
      />

      {/* 2. Overview Stats Cards */}
      <QuizOverviewCards questionsCount={questions.length} />

      {/* 3. Questions List */}
      <QuestionsList
        questions={questions}
        onDeleteQuestion={deleteQuestion}
      />

      {/* 4. Add Question Modal */}
      <AddQuestionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddQuestion={addQuestion}
      />
    </div>
  );
}
