"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { MockUnit } from "@/lib/db/mock-data";
import { CurriculumBookSvg } from "@/components/ui/illustrated-icons";
import { AdminPageHeader } from "@/components/shared";
import { Button, ConfirmModal } from "@/components/ui";
import {
  TusVideoUploaderModal,
  AddUnitModal,
  CurriculumUnitsGrid,
  GradeSelectorTabs,
  useCurriculumManagement,
} from "@/features/admin-curriculum";

export default function AdminCurriculumPage() {
  const {
    filteredUnits,
    selectedGrade,
    setSelectedGrade,
    createUnit,
    deleteUnit,
    incrementLessonsCount,
  } = useCurriculumManagement();

  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingUnit, setDeletingUnit] = useState<MockUnit | null>(null);
  const [uploadTargetUnit, setUploadTargetUnit] = useState<MockUnit | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deletingUnit) return;
    await deleteUnit(deletingUnit);
    setDeletingUnit(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        icon={<CurriculumBookSvg className="w-8 h-8" />}
        title={
          <>
            إدارة المنهج والمحاضرات{" "}
            <span className="text-gradient-purple">(Curriculum Studio)</span>
          </>
        }
        subtitle="إضافة وتعديل وحدات الكورس، رفع فيديوهات المحاضرات عبر Bunny Stream TUS، وإرفاق الملازم والواجبات."
        actions={
          <Button
            variant="vibrant"
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 me-1" />
            <span>إضافة وحدة دراسية جديدة</span>
          </Button>
        }
      />

      {/* 2. Grade Selector Tabs */}
      <GradeSelectorTabs
        selectedGrade={selectedGrade}
        onSelectGrade={setSelectedGrade}
      />

      {/* 3. Units Grid */}
      <CurriculumUnitsGrid
        units={filteredUnits}
        onOpenUpload={setUploadTargetUnit}
        onDeleteUnit={setDeletingUnit}
      />

      {/* 4. Resumable TUS Video Uploader Modal */}
      <TusVideoUploaderModal
        unit={uploadTargetUnit}
        onClose={() => setUploadTargetUnit(null)}
        onSuccess={incrementLessonsCount}
      />

      {/* 5. Add Unit Modal */}
      <AddUnitModal
        isOpen={showAddModal}
        selectedGrade={selectedGrade}
        onClose={() => setShowAddModal(false)}
        onSubmit={async (data) => {
          const success = await createUnit(data);
          if (success) setShowAddModal(false);
        }}
      />

      {/* 6. Centralized Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingUnit)}
        onClose={() => setDeletingUnit(null)}
        onConfirm={handleDeleteConfirm}
        title="تأكيد حذف الوحدة الدراسية"
        confirmText="تأكيد الحذف"
        variant="danger"
        message={
          <>
            هل أنت متأكد من رغبتك في حذف وحدة (<strong>{deletingUnit?.title}</strong>)؟ لن يتمكن الطلاب من الوصول إليها بعد الحذف.
          </>
        }
      />
    </div>
  );
}
