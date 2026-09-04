"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DrmVideoShieldSvg } from "@/components/ui/illustrated-icons";
import { AdminPageHeader } from "@/components/shared";
import { Button } from "@/components/ui";
import {
  LiveSessionsStats,
  LiveSessionsAdminGrid,
  CreateSessionModal,
  useAdminLiveSessions,
} from "@/features/admin-live-sessions";

export default function AdminLiveSessionsPage() {
  const {
    sessions,
    createSession,
    toggleLive,
    deleteSession,
    sendWhatsAppBlast,
  } = useAdminLiveSessions();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        icon={<DrmVideoShieldSvg className="w-8 h-8" />}
        title={
          <>
            البث المباشر وغرف الزووم{" "}
            <span className="text-gradient-purple">(Live Sessions)</span>
          </>
        }
        subtitle="جدولة حصص المراجعة الأسبوعية، بدء البث المباشر للطلاب، وإرسال روابط الغرف لولي الأمر عبر واتساب."
        actions={
          <Button
            variant="vibrant"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 me-1" />
            <span>جدولة حصة مراجعة جديدة</span>
          </Button>
        }
      />

      {/* 2. Overview Stats */}
      <LiveSessionsStats sessions={sessions} />

      {/* 3. Live Sessions Cards Grid */}
      <LiveSessionsAdminGrid
        sessions={sessions}
        onToggleLive={toggleLive}
        onDelete={deleteSession}
        onSendWhatsAppBlast={sendWhatsAppBlast}
      />

      {/* 4. Create / Schedule Modal */}
      <CreateSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateSession={createSession}
      />
    </div>
  );
}
