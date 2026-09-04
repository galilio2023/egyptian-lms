"use client";

import { useState } from "react";
import { useAdminQuery, executeAdminAction } from "@/lib/api/admin-client";
import { INITIAL_GRADES, INITIAL_UNITS, type MockUnit } from "@/lib/db/mock-data";

export function useCurriculumManagement() {
  const [selectedGrade, setSelectedGrade] = useState<string>("grade-1");

  const { data: units, setData: setUnits, isLoading, refetch } = useAdminQuery<MockUnit[]>(
    "curriculum",
    INITIAL_UNITS,
    (res) => (res.curriculum && Array.isArray(res.curriculum) ? (res.curriculum as MockUnit[]) : undefined)
  );

  const filteredUnits = units.filter((u) => u.gradeSlug === selectedGrade);

  const createUnit = async (data: { title: string; price: number; description: string }) => {
    const gradeObj = INITIAL_GRADES.find((g) => g.slug === selectedGrade);

    const result = await executeAdminAction<{ unit?: { id?: string; slug?: string } }>(
      "create_unit",
      {
        gradeSlug: selectedGrade,
        title: data.title,
        priceEgp: data.price,
        description: data.description,
      },
      {
        successMessage: "🎉 تم حفظ ونشر الوحدة الدراسية بنجاح في قاعدة البيانات!",
        errorMessage: "حدث خطأ أثناء حفظ الوحدة في قاعدة البيانات.",
      }
    );

    if (result.success) {
      const newUnit: MockUnit = {
        id: result.data?.unit?.id || `u-${Date.now()}`,
        gradeId: gradeObj?.id || "g-1",
        gradeSlug: selectedGrade,
        gradeTitle: gradeObj?.titleEnglish || "Grade 1",
        title: data.title,
        slug: result.data?.unit?.slug || `${selectedGrade}-${data.title.toLowerCase().replace(/\s+/g, "-")}`,
        description: data.description || "وحدة دراسية جديدة تم إنشاؤها.",
        priceEgp: data.price,
        thumbnailUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60",
        lessonsCount: 0,
        quizzesCount: 0,
        isPublished: true,
      };

      setUnits((prev) => [newUnit, ...prev]);
      return true;
    }
    return false;
  };

  const deleteUnit = async (unit: MockUnit) => {
    const result = await executeAdminAction(
      "delete_unit",
      { unitId: unit.id },
      {
        successMessage: `تم حذف وحدة (${unit.title}) بنجاح من قاعدة البيانات.`,
        errorMessage: "حدث خطأ أثناء حذف الوحدة.",
      }
    );

    if (result.success) {
      setUnits((prev) => prev.filter((u) => u.id !== unit.id));
      return true;
    }
    return false;
  };

  const incrementLessonsCount = (unitId: string) => {
    setUnits((prev) =>
      prev.map((u) =>
        u.id === unitId ? { ...u, lessonsCount: (u.lessonsCount || 0) + 1 } : u
      )
    );
  };

  return {
    units,
    filteredUnits,
    selectedGrade,
    setSelectedGrade,
    isLoading,
    refetch,
    createUnit,
    deleteUnit,
    incrementLessonsCount,
  };
}
