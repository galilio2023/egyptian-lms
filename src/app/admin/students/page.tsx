"use client";

import { UsersGraduationSvg } from "@/components/ui/illustrated-icons";
import { AdminPageHeader, SearchFilterBar } from "@/components/shared";
import { Badge, Select } from "@/components/ui";
import {
  StudentsTable,
  useAdminStudents,
} from "@/features/admin-students";

const GOVERNORATE_OPTIONS = [
  { value: "all", label: "جميع المحافظات" },
  { value: "كفر الشيخ", label: "كفر الشيخ" },
  { value: "الإسكندرية", label: "الإسكندرية" },
  { value: "القاهرة", label: "القاهرة" },
  { value: "الدقهلية", label: "الدقهلية (المنصورة)" },
];

export default function AdminStudentsPage() {
  const {
    filteredStudents,
    totalCount,
    searchTerm,
    setSearchTerm,
    selectedGov,
    setSelectedGov,
    resetDeviceLock,
    toggleStudentBan,
  } = useAdminStudents();

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        icon={<UsersGraduationSvg className="w-8 h-8" />}
        title={
          <>
            إدارة الطلاب وأمان الأجهزة{" "}
            <span className="text-gradient-purple">(Students & Devices)</span>
          </>
        }
        subtitle="البحث في بيانات الطلاب، فك حظر الأجهزة عند تغيير الجهاز، ومتابعة أرقام أولياء الأمور."
        actions={
          <Badge variant="purple" size="md">
            إجمالي المسجلين: {totalCount} طالب
          </Badge>
        }
      />

      {/* 2. Search & Filter Bar */}
      <SearchFilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="ابحث بالاسم، رقم موبايل الطالب أو رقم ولي الأمر..."
        filters={
          <Select
            value={selectedGov}
            onChange={(e) => setSelectedGov(e.target.value)}
            options={GOVERNORATE_OPTIONS}
            className="sm:w-48"
          />
        }
      />

      {/* 3. Students Data Table */}
      <StudentsTable
        students={filteredStudents}
        onResetDevice={(std) => resetDeviceLock(std.id, std.name, std.studentPhone)}
        onToggleBan={(std) => toggleStudentBan(std.id, std.name)}
      />
    </div>
  );
}
