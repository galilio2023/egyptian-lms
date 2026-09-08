"use client";

import { useState } from "react";
import { UsersGraduationSvg } from "@/components/ui/illustrated-icons";
import { AdminPageHeader, SearchFilterBar } from "@/components/shared";
import { Badge, Select, Modal, Button } from "@/components/ui";
import { BookOpen, CheckCircle, Smartphone } from "lucide-react";
import {
  StudentsTable,
  useAdminStudents,
  type MockStudent,
} from "@/features/admin-students";
import { useAdminQuery } from "@/lib/api/admin-client";
import { INITIAL_UNITS, type MockUnit } from "@/lib/db/mock-data";

const GOVERNORATE_OPTIONS = [
  { value: "all", label: "جميع المحافظات" },
  { value: "القاهرة", label: "القاهرة" },
  { value: "الجيزة", label: "الجيزة" },
  { value: "الإسكندرية", label: "الإسكندرية" },
  { value: "الدقهلية", label: "الدقهلية (المنصورة)" },
  { value: "البحر الأحمر", label: "البحر الأحمر" },
  { value: "البحيرة", label: "البحيرة" },
  { value: "الفيوم", label: "الفيوم" },
  { value: "الغربية", label: "الغربية (طنطا)" },
  { value: "الإسماعيلية", label: "الإسماعيلية" },
  { value: "المنوفية", label: "المنوفية" },
  { value: "المنيا", label: "المنيا" },
  { value: "القليوبية", label: "القليوبية" },
  { value: "الوادي الجديد", label: "الوادي الجديد" },
  { value: "السويس", label: "السويس" },
  { value: "أسوان", label: "أسوان" },
  { value: "أسيوط", label: "أسيوط" },
  { value: "بني سويف", label: "بني سويف" },
  { value: "بورسعيد", label: "بورسعيد" },
  { value: "دمياط", label: "دمياط" },
  { value: "الشرقية", label: "الشرقية" },
  { value: "جنوب سيناء", label: "جنوب سيناء" },
  { value: "كفر الشيخ", label: "كفر الشيخ" },
  { value: "مطروح", label: "مطروح" },
  { value: "الأقصر", label: "الأقصر" },
  { value: "قنا", label: "قنا" },
  { value: "شمال سيناء", label: "شمال سيناء" },
  { value: "سوهاج", label: "سوهاج" },
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
    enrollStudentInUnit,
  } = useAdminStudents();

  // Units list for quick enrollment
  const { data: units } = useAdminQuery<MockUnit[]>(
    "curriculum",
    INITIAL_UNITS,
    (res) => (res.curriculum && Array.isArray(res.curriculum) ? (res.curriculum as MockUnit[]) : undefined)
  );

  // Quick Enrollment Modal state
  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState<MockStudent | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [notifyParentViaWhatsApp, setNotifyParentViaWhatsApp] = useState<boolean>(true);
  const [isSubmittingEnroll, setIsSubmittingEnroll] = useState<boolean>(false);

  const handleOpenEnrollModal = (student: MockStudent) => {
    setSelectedStudentForEnroll(student);
    if (units.length > 0) {
      setSelectedUnitId(units[0].id);
    }
  };

  const handleCloseEnrollModal = () => {
    setSelectedStudentForEnroll(null);
    setSelectedUnitId("");
    setIsSubmittingEnroll(false);
  };

  const handleConfirmEnroll = async () => {
    if (!selectedStudentForEnroll || !selectedUnitId) return;
    setIsSubmittingEnroll(true);
    try {
      const success = await enrollStudentInUnit(
        selectedStudentForEnroll.id,
        selectedUnitId,
        notifyParentViaWhatsApp
      );
      if (success) {
        handleCloseEnrollModal();
      }
    } finally {
      setIsSubmittingEnroll(false);
    }
  };

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
        subtitle="البحث في بيانات الطلاب، تفعيل اشتراكات السنتر والدفع الكاش فورياً، فك حظر الأجهزة، ومتابعة أولياء الأمور."
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
            className="sm:w-56"
          />
        }
      />

      {/* 3. Students Data Table */}
      <StudentsTable
        students={filteredStudents}
        onResetDevice={(std) => resetDeviceLock(std.id, std.name, std.studentPhone)}
        onToggleBan={(std) => toggleStudentBan(std.id, std.name)}
        onQuickEnroll={handleOpenEnrollModal}
      />

      {/* 4. Quick Enrollment Modal (In-Person / Center Cash Activation) */}
      <Modal
        isOpen={!!selectedStudentForEnroll}
        onClose={handleCloseEnrollModal}
        title="تفعيل اشتراك فوري في كورس / وحدة"
        description="تسجيل وتفعيل وحدة دراسية للطالب مباشرة (للطلاب المسددين نقداً بالسنتر أو الاستقبال)."
        icon={<BookOpen className="w-6 h-6 text-purple-600" />}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseEnrollModal}
              disabled={isSubmittingEnroll}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmEnroll}
              disabled={!selectedUnitId || isSubmittingEnroll}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              <CheckCircle className="w-4 h-4 me-1.5" />
              {isSubmittingEnroll ? "جاري التفعيل..." : "تأكيد التفعيل الفوري"}
            </Button>
          </div>
        }
      >
        {selectedStudentForEnroll && (
          <div className="space-y-4 text-right">
            {/* Student Info Card */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">اسم الطالب:</span>
                <span className="font-black text-slate-900 text-sm">
                  {selectedStudentForEnroll.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">المحافظة والصف:</span>
                <span className="font-bold text-purple-800">
                  {selectedStudentForEnroll.gradeTitle} • {selectedStudentForEnroll.governorate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">هاتف ولي الأمر:</span>
                <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <bdi dir="ltr">{selectedStudentForEnroll.parentPhone}</bdi>
                </span>
              </div>
            </div>

            {/* Select Unit */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 block">
                اختر الوحدة الدراسية المراد تفعيلها:
              </label>
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.title} ({unit.gradeTitle}) - {unit.priceEgp} ج.م
                  </option>
                ))}
              </select>
            </div>

            {/* WhatsApp Notify Checkbox */}
            <div className="pt-2 border-t border-purple-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={notifyParentViaWhatsApp}
                  onChange={(e) => setNotifyParentViaWhatsApp(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 border-purple-300 focus:ring-purple-500"
                />
                <span>إرسال إشعار تفعيل فوري لولي الأمر عبر واتساب تلقائياً 📲</span>
              </label>
              <p className="text-[10px] text-slate-400 mt-1 mr-6">
                سيتم إرسال رسالة ترحيبية وتأكيد سداد المصروفات وتفعيل الوحدة باسم الأكاديمية والمدرس.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
