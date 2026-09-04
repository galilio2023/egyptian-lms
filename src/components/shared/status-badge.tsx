import React from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type OrderStatusType = "manual_review" | "completed" | "failed";
export type DeviceStatusType = "locked" | "banned" | "available";

interface StatusBadgeProps {
  type: "order" | "device" | "custom";
  status?: string;
  label?: string;
  variant?: "purple" | "emerald" | "amber" | "rose" | "slate" | "sky";
  icon?: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  status,
  label,
  variant = "slate",
  icon,
  className,
}) => {
  if (type === "order") {
    switch (status) {
      case "manual_review":
        return (
          <Badge variant="amber" className={className}>
            <Clock className="w-3 h-3 text-amber-600" />
            <span>بانتظار المراجعة</span>
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="emerald" className={className}>
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>مكتمل ومفعّل</span>
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="rose" className={className}>
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>مرفوض</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="slate" className={className}>
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{status}</span>
          </Badge>
        );
    }
  }

  if (type === "device") {
    switch (status) {
      case "banned":
        return (
          <Badge variant="rose" className={className}>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>حساب محظور</span>
          </Badge>
        );
      case "locked":
        return (
          <Badge variant="emerald" className={className}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>مربوط بالجهاز الحالي ✓</span>
          </Badge>
        );
      case "available":
      default:
        return (
          <Badge variant="slate" className={className}>
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>متاح لربط جهاز جديد</span>
          </Badge>
        );
    }
  }

  return (
    <Badge variant={variant} className={className}>
      {icon}
      <span>{label || status}</span>
    </Badge>
  );
};
