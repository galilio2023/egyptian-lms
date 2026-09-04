"use client";

import { useAdminQuery, executeAdminAction } from "@/lib/api/admin-client";
import { INITIAL_QUIZ, type MockQuestion } from "@/lib/db/mock-data";

export function useAdminQuizzes() {
  const { data: questions, setData: setQuestions, isLoading, refetch } = useAdminQuery<MockQuestion[]>(
    "quizzes",
    INITIAL_QUIZ.questions,
    (res) => (res.quizzes && Array.isArray(res.quizzes) ? (res.quizzes as MockQuestion[]) : undefined)
  );

  const addQuestion = async (data: {
    text: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    explanation: string;
  }) => {
    const result = await executeAdminAction<{ question?: { id?: string } }>(
      "create_question",
      {
        text: data.text,
        options: data.options,
        explanation: data.explanation,
        points: 1,
      },
      {
        successMessage: "🎉 تمت إضافة السؤال بنجاح إلى بنك الأسئلة المركزي في قاعدة البيانات!",
        errorMessage: "حدث خطأ أثناء حفظ السؤال.",
      }
    );

    if (result.success) {
      const newQ: MockQuestion = {
        id: result.data?.question?.id || `q-${Date.now()}`,
        text: data.text,
        options: data.options,
        explanation: data.explanation,
      };

      setQuestions((prev) => [...prev, newQ]);
      return true;
    }
    return false;
  };

  const deleteQuestion = async (questionId: string) => {
    const result = await executeAdminAction(
      "delete_question",
      { questionId },
      {
        successMessage: "تم حذف السؤال بنجاح من قاعدة البيانات.",
        errorMessage: "حدث خطأ أثناء حذف السؤال.",
      }
    );

    if (result.success) {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      return true;
    }
    return false;
  };

  return {
    questions,
    isLoading,
    refetch,
    addQuestion,
    deleteQuestion,
  };
}
