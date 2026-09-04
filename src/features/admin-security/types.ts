import type { SecurityAuditRecord, AuditEventType, AuditSeverity } from "@/lib/security/audit-logger";

export type { SecurityAuditRecord, AuditEventType, AuditSeverity };

export const EVENT_TYPE_OPTIONS = [
  { value: "all", label: "كل أنواع الأحداث" },
  { value: "device_locked", label: "قفل جهاز إضافي (Device Locked)" },
  { value: "device_transferred", label: "نقل جهاز ناجح (Device Transferred)" },
  { value: "device_transfer_failed", label: "فشل نقل جهاز (Transfer Failed)" },
  { value: "voucher_rate_limited", label: "حظر كروت الشحن (Voucher 429)" },
  { value: "voucher_redeem_failed", label: "كود شحن خاطئ (Voucher Failed)" },
  { value: "voucher_redeem_success", label: "كود شحن ناجح (Voucher Success)" },
  { value: "quiz_max_attempts_blocked", label: "تجاوز محاولات الاختبار (Quiz Blocked)" },
  { value: "rate_limit_triggered", label: "تجاوز معدل الطلب العام (Rate Limit)" },
  { value: "user_banned", label: "حساب محظور (Banned)" },
];

export const SEVERITY_OPTIONS = [
  { value: "all", label: "كل درجات الخطورة" },
  { value: "critical", label: "حرج (Critical)" },
  { value: "high", label: "مرتفع (High)" },
  { value: "medium", label: "متوسط (Medium)" },
  { value: "low", label: "عادي (Low)" },
];
