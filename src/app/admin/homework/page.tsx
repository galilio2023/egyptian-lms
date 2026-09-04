"use client";

import { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { StudentRegisterPencilSvg } from "@/components/ui/illustrated-icons";
import { AdminPageHeader, SearchFilterBar } from "@/components/shared";
import { Badge } from "@/components/ui";
import { CanvasPenGrader } from "@/features/canvas-grader";
import {
  HomeworkSubmissionsGrid,
  useAdminHomework,
  type MockHomeworkSubmission,
} from "@/features/admin-homework";

export default function AdminHomeworkPage() {
  const {
    filteredSubmissions,
    submissions,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    pendingCount,
    gradedCount,
    saveGrade,
  } = useAdminHomework();

  const [selectedSubmission, setSelectedSubmission] = useState<MockHomeworkSubmission | null>(null);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        icon={<StudentRegisterPencilSvg className="w-8 h-8" />}
        title={
          <>
            كنترول كراسات الواجب التفاعلي{" "}
            <span className="text-gradient-purple">(Canvas Pen Grader)</span>
          </>
        }
        subtitle="تصحيح كراسات الطلاب إلكترونياً بالقلم الأحمر مع إضافة العلامات والملاحظات وإرسال إشعار فوري لولي الأمر."
        actions={
          <div className="flex items-center gap-3">
            <Badge variant="amber" size="md">
              <Clock className="w-3.5 h-3.5 me-1" />
              <span>{pendingCount} بانتظار التصحيح</span>
            </Badge>
            <Badge variant="emerald" size="md">
              <CheckCircle2 className="w-3.5 h-3.5 me-1" />
              <span>{gradedCount} مصححة</span>
            </Badge>
          </div>
        }
      />

      {/* 2. Search & Status Filter Bar */}
      <SearchFilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="ابحث باسم الطالب، رقم الموبايل، أو عنوان الواجب..."
        filters={
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === "all"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              الكل ({submissions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("submitted")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === "submitted"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              معلق ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("graded")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterStatus === "graded"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              تم التصحيح ({gradedCount})
            </button>
          </div>
        }
      />

      {/* 3. Submissions Grid */}
      <HomeworkSubmissionsGrid
        submissions={filteredSubmissions}
        onOpenGrader={setSelectedSubmission}
      />

      {/* 4. Canvas Pen Grader Modal */}
      {selectedSubmission && (
        <CanvasPenGrader
          submission={selectedSubmission}
          isOpen={Boolean(selectedSubmission)}
          onClose={() => setSelectedSubmission(null)}
          onSaveGrade={saveGrade}
        />
      )}
    </div>
  );
}
