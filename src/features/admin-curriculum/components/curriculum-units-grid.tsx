import React from "react";
import { type MockUnit } from "@/lib/db/mock-data";
import { EmptyState } from "@/components/ui/empty-state";
import { UnitCard } from "@/entities/unit";

export interface CurriculumUnitsGridProps {
  units: MockUnit[];
  onOpenUpload: (unit: MockUnit) => void;
  onDeleteUnit: (unit: MockUnit) => void;
}

export const CurriculumUnitsGrid: React.FC<CurriculumUnitsGridProps> = ({
  units,
  onOpenUpload,
  onDeleteUnit,
}) => {
  if (units.length === 0) {
    return (
      <EmptyState
        title="لا توجد وحدات دراسية لهذا الصف"
        description="اضغط على زر 'إضافة وحدة دراسية جديدة' لإضافة أول وحدة في المنهج."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {units.map((unit) => (
        <UnitCard
          key={unit.id}
          unit={unit}
          variant="admin"
          onOpenUpload={onOpenUpload}
          onDeleteUnit={onDeleteUnit}
        />
      ))}
    </div>
  );
};
