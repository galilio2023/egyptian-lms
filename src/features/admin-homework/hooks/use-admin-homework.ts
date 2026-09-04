"use client";

import { useAdminQuery, executeAdminAction } from "@/lib/api/admin-client";
import { useTableFilter } from "@/lib/hooks/use-table-filter";
import { INITIAL_HOMEWORK_SUBMISSIONS, type MockHomeworkSubmission } from "@/lib/db/mock-data";

export function useAdminHomework() {
  const { data: submissions, setData: setSubmissions, isLoading, refetch } = useAdminQuery<MockHomeworkSubmission[]>(
    "homework",
    INITIAL_HOMEWORK_SUBMISSIONS,
    (res) => (res.homework && Array.isArray(res.homework) ? (res.homework as MockHomeworkSubmission[]) : undefined)
  );

  const filterState = useTableFilter<MockHomeworkSubmission>({
    items: submissions,
    searchFields: (sub) => [sub.studentName, sub.studentPhone, sub.assignmentTitle],
    filterPredicates: {
      status: (sub, val) => sub.status === val,
    },
    initialFilters: {
      status: "all",
    },
  });

  const pendingCount = submissions.filter((s) => s.status === "submitted").length;
  const gradedCount = submissions.filter((s) => s.status === "graded").length;

  const saveGrade = async (data: {
    submissionId: string;
    score: number;
    feedbackNotes: string;
    annotatedImages: Array<{ pageIndex: number; dataUrl: string }>;
  }) => {
    const sub = submissions.find((s) => s.id === data.submissionId);

    const result = await executeAdminAction(
      "grade_homework",
      {
        submissionId: data.submissionId,
        score: data.score,
        feedbackNotes: data.feedbackNotes,
        annotatedImages: data.annotatedImages,
        studentName: sub?.studentName,
        parentPhone: sub?.parentPhone,
        assignmentTitle: sub?.assignmentTitle,
      },
      {
        successMessage: "✅ تم حفظ تصحيح كراسة الواجب ورصد الدرجة بنجاح!",
        errorMessage: "حدث خطأ أثناء حفظ التصحيح.",
      }
    );

    if (result.success) {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === data.submissionId
            ? {
                ...s,
                status: "graded",
                score: data.score,
                feedbackNotes: data.feedbackNotes,
                annotatedImages: data.annotatedImages,
              }
            : s
        )
      );
      return true;
    }
    return false;
  };

  return {
    submissions,
    filteredSubmissions: filterState.filteredItems,
    searchTerm: filterState.searchTerm,
    setSearchTerm: filterState.setSearchTerm,
    filterStatus: (filterState.filters.status || "all") as "all" | "submitted" | "graded",
    setFilterStatus: (status: "all" | "submitted" | "graded") => filterState.setFilter("status", status),
    pendingCount,
    gradedCount,
    isLoading,
    refetch,
    saveGrade,
  };
}
