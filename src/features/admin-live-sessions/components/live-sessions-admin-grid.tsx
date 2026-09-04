"use client";

import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { LiveSessionAdminCard } from "./live-session-admin-card";
import type { MockLiveSession } from "../types";

export interface LiveSessionsAdminGridProps {
  sessions: MockLiveSession[];
  onToggleLive: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onSendWhatsAppBlast: (session: MockLiveSession) => void;
}

export const LiveSessionsAdminGrid: React.FC<LiveSessionsAdminGridProps> = ({
  sessions,
  onToggleLive,
  onDelete,
  onSendWhatsAppBlast,
}) => {
  if (sessions.length === 0) {
    return (
      <EmptyState
        title="لا توجد حصص بث مباشر مجدولة"
        description="اضغط على زر 'جدولة حصة مراجعة جديدة' لإنشاء أول غرفة بث للطلاب."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sessions.map((ses) => (
        <LiveSessionAdminCard
          key={ses.id}
          session={ses}
          onToggleLive={onToggleLive}
          onDelete={onDelete}
          onSendWhatsAppBlast={onSendWhatsAppBlast}
        />
      ))}
    </div>
  );
};
