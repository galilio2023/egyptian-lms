"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { SubmissionCard } from "./submission-card";
import type { MockHomeworkSubmission } from "../types";

export interface HomeworkSubmissionsGridProps {
  submissions: MockHomeworkSubmission[];
  onOpenGrader: (submission: MockHomeworkSubmission) => void;
}

export const HomeworkSubmissionsGrid: React.FC<HomeworkSubmissionsGridProps> = ({
  submissions,
  onOpenGrader,
}) => {
  if (submissions.length === 0) {
    return (
      <EmptyState
        title="لا توجد تسليمات واجبات مطابقة"
        description="جرّب تعديل البحث أو الفلتر لعرض كراسات الواجب."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {submissions.map((sub) => (
        <SubmissionCard
          key={sub.id}
          submission={sub}
          onOpenGrader={onOpenGrader}
        />
      ))}
    </div>
  );
};
