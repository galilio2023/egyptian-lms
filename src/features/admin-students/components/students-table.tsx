"use client";

import React from "react";
import { DataTableCard } from "@/components/shared";
import { StudentRow } from "./student-row";
import type { MockStudent } from "../types";

export interface StudentsTableProps {
  students: MockStudent[];
  onResetDevice: (student: MockStudent) => void;
  onToggleBan: (student: MockStudent) => void;
}

const TABLE_HEADERS = [
  "اسم الطالب",
  "موبايل الطالب",
  "موبايل ولي الأمر (واتساب)",
  "المحافظة والصف",
  "نقاط XP",
  "حالة الجهاز",
  <div key="action" className="text-center">إجراءات السكرتارية</div>,
];

export const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  onResetDevice,
  onToggleBan,
}) => {
  return (
    <DataTableCard
      headers={TABLE_HEADERS}
      isEmpty={students.length === 0}
      emptyTitle="لم يتم العثور على طلاب"
      emptyDescription="جرّب تعديل كلمة البحث أو تصفية المحافظة."
    >
      {students.map((std) => (
        <StudentRow
          key={std.id}
          student={std}
          onResetDevice={onResetDevice}
          onToggleBan={onToggleBan}
        />
      ))}
    </DataTableCard>
  );
};
