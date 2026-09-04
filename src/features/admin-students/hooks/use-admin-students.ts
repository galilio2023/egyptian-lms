"use client";

import { useAdminQuery, executeAdminAction } from "@/lib/api/admin-client";
import { useTableFilter } from "@/lib/hooks/use-table-filter";
import { INITIAL_STUDENTS, type MockStudent } from "@/lib/db/mock-data";

export function useAdminStudents() {
  const { data: students, setData: setStudents, isLoading, refetch } = useAdminQuery<MockStudent[]>(
    "students",
    INITIAL_STUDENTS,
    (res) => (res.students && Array.isArray(res.students) ? (res.students as MockStudent[]) : undefined)
  );

  const filterState = useTableFilter<MockStudent>({
    items: students,
    searchFields: (std) => [std.name, std.studentPhone, std.parentPhone],
    filterPredicates: {
      governorate: (std, val) => std.governorate.includes(val),
    },
    initialFilters: {
      governorate: "all",
    },
  });

  const resetDeviceLock = async (studentId: string, studentName: string, studentPhone: string) => {
    const result = await executeAdminAction(
      "reset_device",
      { studentId, studentPhone },
      {
        successMessage: `تم فك حظر وربط الجهاز للطالب (${studentName}) بنجاح!`,
        errorMessage: "حدث خطأ أثناء فك الجهاز.",
      }
    );

    if (result.success) {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, deviceLocked: false } : s))
      );
    }
    return result.success;
  };

  const toggleStudentBan = async (studentId: string, studentName: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return false;
    const isBanned = !!student.isBanned;

    const result = await executeAdminAction(
      "toggle_ban",
      { studentId, isBanned: !isBanned },
      {
        successMessage: isBanned
          ? `تم إلغاء حظر حساب الطالب (${studentName}).`
          : `تم حظر حساب الطالب (${studentName}) مؤقتاً.`,
        errorMessage: "حدث خطأ أثناء تعديل حالة الحساب.",
      }
    );

    if (result.success) {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, isBanned: !isBanned } : s))
      );
    }
    return result.success;
  };

  return {
    students,
    filteredStudents: filterState.filteredItems,
    searchTerm: filterState.searchTerm,
    setSearchTerm: filterState.setSearchTerm,
    selectedGov: filterState.filters.governorate || "all",
    setSelectedGov: (gov: string) => filterState.setFilter("governorate", gov),
    totalCount: filterState.totalCount,
    isLoading,
    refetch,
    resetDeviceLock,
    toggleStudentBan,
  };
}
