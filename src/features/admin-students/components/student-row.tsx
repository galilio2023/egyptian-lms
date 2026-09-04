"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { StatusBadge, WhatsAppContactLink } from "@/components/shared";
import { Button } from "@/components/ui";
import { XpGemSvg } from "@/components/ui/illustrated-icons";
import type { MockStudent } from "../types";

export interface StudentRowProps {
  student: MockStudent;
  onResetDevice: (student: MockStudent) => void;
  onToggleBan: (student: MockStudent) => void;
}

export const StudentRow: React.FC<StudentRowProps> = ({
  student,
  onResetDevice,
  onToggleBan,
}) => {
  return (
    <tr className="hover:bg-purple-50/30 transition-colors">
      <td className="p-4 font-black text-slate-900 flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-vibrant text-white flex items-center justify-center font-black text-xs shadow-sm">
          {student.name[0]}
        </div>
        <span>{student.name}</span>
      </td>

      <td className="p-4 font-mono text-right font-bold text-slate-800">
        <bdi dir="ltr">{student.studentPhone}</bdi>
      </td>

      <td className="p-4">
        <WhatsAppContactLink phone={student.parentPhone} />
      </td>

      <td className="p-4">
        <div className="font-bold text-slate-900">{student.gradeTitle}</div>
        <div className="text-[10px] text-purple-600 font-bold">{student.governorate}</div>
      </td>

      <td className="p-4 font-black text-purple-700">
        <div className="flex items-center gap-1">
          <XpGemSvg className="w-4 h-4" />
          <span>{student.xpPoints} XP</span>
        </div>
      </td>

      <td className="p-4">
        <StatusBadge
          type="device"
          status={student.isBanned ? "banned" : student.deviceLocked ? "locked" : "available"}
        />
      </td>

      <td className="p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onResetDevice(student)}
            title="فك ربط الجهاز القديم ليتمكن الطالب من تسجيل الدخول من جهاز جديد"
            className="text-indigo-700 hover:text-indigo-800 text-[11px]"
          >
            <RotateCcw className="w-3 h-3 me-1" />
            <span>فك ربط الجهاز</span>
          </Button>

          <Button
            size="sm"
            variant={student.isBanned ? "secondary" : "danger"}
            onClick={() => onToggleBan(student)}
            className="text-[11px]"
          >
            {student.isBanned ? "إلغاء الحظر" : "حظر الحساب"}
          </Button>
        </div>
      </td>
    </tr>
  );
};
