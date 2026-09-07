"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { DataTableCard, StatusBadge, WhatsAppContactLink } from "@/components/shared";
import { Button } from "@/components/ui";
import { XpGemSvg } from "@/components/ui/illustrated-icons";
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
    <>
      {/* 1. Mobile Cards View (< md) */}
      <div className="md:hidden space-y-3">
        {students.length === 0 ? (
          <div className="modern-card p-6 bg-white text-center rounded-2xl border border-purple-100 text-slate-500 text-xs">
            لم يتم العثور على طلاب.
          </div>
        ) : (
          students.map((std) => (
            <div
              key={std.id}
              className="modern-card p-4 rounded-2xl bg-white/95 border-2 border-purple-100 shadow-sm space-y-3 text-right"
            >
              {/* Header: Name, Initials, Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-vibrant text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                    {std.name[0]}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-sm">{std.name}</div>
                    <div className="text-[10px] text-purple-700 font-bold">
                      {std.gradeTitle} • {std.governorate}
                    </div>
                  </div>
                </div>

                <StatusBadge
                  type="device"
                  status={std.isBanned ? "banned" : std.deviceLocked ? "locked" : "available"}
                />
              </div>

              {/* Student & Parent Phone details */}
              <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">موبايل الطالب:</span>
                  <span className="font-mono font-bold text-slate-800">
                    <bdi dir="ltr">{std.studentPhone}</bdi>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">نقاط التفوق:</span>
                  <span className="font-black text-purple-700 flex items-center gap-1">
                    <XpGemSvg className="w-3.5 h-3.5" />
                    <span>{std.xpPoints} XP</span>
                  </span>
                </div>
              </div>

              {/* Parent WhatsApp Link */}
              <div className="pt-0.5">
                <WhatsAppContactLink phone={std.parentPhone} label="واتساب ولي الأمر" />
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-purple-100 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onResetDevice(std)}
                  className="flex-1 text-[11px] justify-center text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                  title="فك ربط الجهاز"
                >
                  <RotateCcw className="w-3.5 h-3.5 me-1" />
                  <span>فك ربط الجهاز</span>
                </Button>

                <Button
                  size="sm"
                  variant={std.isBanned ? "secondary" : "danger"}
                  onClick={() => onToggleBan(std)}
                  className="px-3 text-[11px] justify-center"
                >
                  {std.isBanned ? "إلغاء الحظر" : "حظر الحساب"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 2. Desktop Table View (>= md) */}
      <div className="hidden md:block">
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
      </div>
    </>
  );
};
