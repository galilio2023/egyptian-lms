"use client";

import { useAdminQuery } from "@/lib/api/admin-client";
import { useTableFilter } from "@/lib/hooks/use-table-filter";
import { INITIAL_HOMEWORK_SUBMISSIONS, type MockHomeworkSubmission } from "@/lib/db/mock-data";
import { toast } from "sonner";

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

    try {
      const response = await fetch("/api/homework/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: data.submissionId,
          score: data.score,
          feedbackNotes: data.feedbackNotes,
          annotatedImages: data.annotatedImages,
          studentName: sub?.studentName,
          parentPhone: sub?.parentPhone,
          assignmentTitle: sub?.assignmentTitle,
        }),
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok || resData.error) {
        toast.error(resData.error || "حدث خطأ أثناء حفظ التصحيح.");
        return false;
      }

      toast.success(resData.message || "✅ تم حفظ تصحيح كراسة الواجب ورصد الدرجة بنجاح!");

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
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم أثناء حفظ درجات الواجب.");
      return false;
    }
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
