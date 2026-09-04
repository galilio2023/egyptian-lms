"use client";

import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { 
  BroadcastMegaphoneSvg, 
  WhatsAppBubbleSvg 
} from "@/components/ui/illustrated-icons";
import { BroadcastComposerForm } from "@/features/admin-broadcasts";

export default function AdminBroadcastsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="مركز رسائل الواتساب الجماعية (Broadcasts)"
        description="إرسال تنبيهات المواعيد، جداول الامتحانات، والإعلانات الهامة مباشرة إلى هواتف أولياء الأمور."
        icon={<BroadcastMegaphoneSvg className="w-8 h-8" />}
        actions={
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-50 border-2 border-emerald-200 px-4 py-2 rounded-2xl shadow-sm">
            <WhatsAppBubbleSvg className="w-5 h-5 drop-shadow-sm" />
            <span>حساب WhatsApp Business متصل ومفعل ✓</span>
          </div>
        }
      />

      {/* Broadcast Form Card */}
      <BroadcastComposerForm />
    </div>
  );
}
