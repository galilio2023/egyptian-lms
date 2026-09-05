"use client";

import React from "react";
import { 
  Clock, 
  Globe, 
  Ban, 
  Smartphone, 
  Ticket, 
  Lock,
  Radio
} from "lucide-react";
import { DataTableCard } from "@/components/shared";
import { Badge, Button } from "@/components/ui";
import type { SecurityAuditRecord, AuditEventType, AuditSeverity } from "../types";

export interface SecurityLogsTableProps {
  logs: SecurityAuditRecord[];
  actionInProgress: string | null;
  onBanStudent: (userId: string, studentPhone?: string | null) => void;
}

const TABLE_HEADERS = [
  "الوقت",
  "نوع الحدث",
  "الخطورة",
  "هاتف الطالب",
  "عنوان IP",
  "التفاصيل والوصف",
  <div key="action" className="text-center">إجراء فوري</div>,
];

function getSeverityBadge(sev: AuditSeverity) {
  switch (sev) {
    case "critical":
      return <Badge variant="rose">حرج (Critical)</Badge>;
    case "high":
      return <Badge variant="amber">مرتفع (High)</Badge>;
    case "medium":
      return <Badge variant="purple">متوسط (Medium)</Badge>;
    case "low":
    default:
      return <Badge variant="slate">عادي (Low)</Badge>;
  }
}

function getEventTypeBadge(evt: AuditEventType | string) {
  switch (evt) {
    case "device_locked":
      return <Badge variant="rose"><Smartphone className="w-3 h-3 me-1" /> قفل جهاز</Badge>;
    case "device_transferred":
      return <Badge variant="emerald"><Smartphone className="w-3 h-3 me-1" /> نقل جهاز ناجح</Badge>;
    case "voucher_rate_limited":
    case "rate_limit_triggered":
      return <Badge variant="rose"><Lock className="w-3 h-3 me-1" /> حظر 429</Badge>;
    case "voucher_redeem_failed":
      return <Badge variant="slate"><Ticket className="w-3 h-3 me-1" /> كود شحن غير صحيح</Badge>;
    case "voucher_redeem_success":
      return <Badge variant="emerald"><Ticket className="w-3 h-3 me-1" /> كود شحن ناجح</Badge>;
    case "live_session_attended":
      return <Badge variant="purple"><Radio className="w-3 h-3 me-1" /> حضور بث مباشر</Badge>;
    case "user_banned":
      return <Badge variant="rose"><Ban className="w-3 h-3 me-1" /> حساب محظور</Badge>;
    default:
      return <Badge variant="slate">{evt}</Badge>;
  }
}

export const SecurityLogsTable: React.FC<SecurityLogsTableProps> = ({
  logs,
  actionInProgress,
  onBanStudent,
}) => {
  return (
    <DataTableCard
      headers={TABLE_HEADERS}
      isEmpty={logs.length === 0}
      emptyTitle="لا توجد سجلات أمنية"
      emptyDescription="لم يتم العثور على أحداث أمنية مطابقة لخيارات البحث المحددة."
    >
      {logs.map((log) => (
        <tr key={log.id} className="hover:bg-purple-50/20 transition-colors">
          {/* Timestamp */}
          <td className="p-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]" suppressHydrationWarning>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span suppressHydrationWarning>{new Date(log.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <span className="text-[10px] text-slate-400 block" suppressHydrationWarning>{new Date(log.createdAt).toLocaleDateString("ar-EG")}</span>
          </td>

          {/* Event Type Badge */}
          <td className="p-3.5 whitespace-nowrap">
            {getEventTypeBadge(log.eventType)}
          </td>

          {/* Severity */}
          <td className="p-3.5 whitespace-nowrap">
            {getSeverityBadge(log.severity)}
          </td>

          {/* Student Phone */}
          <td className="p-3.5 whitespace-nowrap font-mono font-bold text-slate-800">
            {log.studentPhone || (log.userId ? `ID: ${log.userId.slice(0, 8)}...` : "زائر غير مسجل")}
          </td>

          {/* IP Address */}
          <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-slate-600">
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{log.ipAddress || "127.0.0.1"}</span>
            </div>
          </td>

          {/* Description & Details */}
          <td className="p-3.5 max-w-xs text-slate-700">
            <p className="font-bold text-xs">{log.description}</p>
            {log.details && Object.keys(log.details).length > 0 && (
              <div className="text-[10px] font-mono text-purple-900 bg-purple-50/60 p-1 rounded mt-1 border border-purple-100/60 inline-block max-w-full truncate">
                {JSON.stringify(log.details)}
              </div>
            )}
          </td>

          {/* Actions: Ban / Unban */}
          <td className="p-3.5 whitespace-nowrap text-center">
            {log.userId ? (
              <Button
                size="sm"
                variant="danger"
                onClick={() => onBanStudent(log.userId!, log.studentPhone)}
                disabled={actionInProgress === log.userId}
                className="mx-auto text-[10px]"
              >
                <Ban className="w-3 h-3 me-1" />
                <span>حظر الحساب</span>
              </Button>
            ) : (
              <span className="text-[10px] text-slate-400 font-semibold">—</span>
            )}
          </td>
        </tr>
      ))}
    </DataTableCard>
  );
};
