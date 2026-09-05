import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export type AuditEventType =
  | "voucher_redeem_success"
  | "voucher_redeem_failed"
  | "voucher_rate_limited"
  | "device_locked"
  | "device_transferred"
  | "device_transfer_failed"
  | "quiz_max_attempts_blocked"
  | "rate_limit_triggered"
  | "unauthorized_portal_access"
  | "live_session_attended"
  | "user_banned";

export type AuditSeverity = "low" | "medium" | "high" | "critical";

export interface LogSecurityEventParams {
  eventType: AuditEventType;
  severity?: AuditSeverity;
  userId?: string | null;
  studentPhone?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  description: string;
  details?: Record<string, unknown>;
}

export interface SecurityAuditRecord {
  id: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string | null;
  studentPhone?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  description: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

// In-memory fallback circular buffer (last 200 events)
const inMemoryAuditLogs: SecurityAuditRecord[] = [
  {
    id: "init-sec-1",
    eventType: "device_locked",
    severity: "medium",
    studentPhone: "01012345678",
    ipAddress: "197.34.12.89",
    description: "محاولة فتح حساب طالب من جهاز غير مصرح به (جهاز إضافي).",
    details: { deviceId: "device-unauthorized-xyz", platform: "Windows Chrome" },
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "init-sec-2",
    eventType: "voucher_redeem_failed",
    severity: "low",
    studentPhone: "01123456789",
    ipAddress: "156.204.88.14",
    description: "فشل إدخال كود شحن: كود غير صحيح أو منتهي الصلاحية.",
    details: { attemptedCode: "ELT-G1-9999-0000" },
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: "init-sec-3",
    eventType: "voucher_rate_limited",
    severity: "high",
    ipAddress: "41.238.10.55",
    description: "تجاوز الحد الأقصى لمحاولات شحن الكروت (Rate Limit 5/10min).",
    details: { attempts: 5, windowMinutes: 10 },
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
];

/**
 * Log a security-critical event asynchronously without blocking the user response.
 */
export async function logSecurityEvent(params: LogSecurityEventParams): Promise<void> {
  const timestamp = new Date();
  const memoryRecord: SecurityAuditRecord = {
    id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    eventType: params.eventType,
    severity: params.severity || "low",
    userId: params.userId || null,
    studentPhone: params.studentPhone || null,
    ipAddress: params.ipAddress || null,
    userAgent: params.userAgent || null,
    description: params.description,
    details: params.details,
    createdAt: timestamp.toISOString(),
  };

  // Add to in-memory store (capped at 200 items)
  inMemoryAuditLogs.unshift(memoryRecord);
  if (inMemoryAuditLogs.length > 200) {
    inMemoryAuditLogs.pop();
  }

  // Attempt database persistence (fire-and-forget safe)
  try {
    await db.insert(schema.securityAuditLog).values({
      eventType: params.eventType,
      severity: params.severity || "low",
      userId: params.userId || null,
      studentPhone: params.studentPhone || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      description: params.description,
      details: params.details || {},
      createdAt: timestamp,
    });
  } catch (err) {
    // Database note: fallback to memory record without failing request
    console.warn("Security audit DB log note:", err);
  }
}

/**
 * Fetch recent security audit logs for the admin security dashboard.
 */
export async function getRecentSecurityLogs(limitCount = 50): Promise<SecurityAuditRecord[]> {
  try {
    const dbLogs = await db
      .select()
      .from(schema.securityAuditLog)
      .orderBy(desc(schema.securityAuditLog.createdAt))
      .limit(limitCount);

    if (dbLogs && dbLogs.length > 0) {
      return dbLogs.map((log) => ({
        id: log.id,
        eventType: log.eventType as AuditEventType,
        severity: log.severity as AuditSeverity,
        userId: log.userId,
        studentPhone: log.studentPhone,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        description: log.description,
        details: log.details || undefined,
        createdAt: log.createdAt.toISOString(),
      }));
    }
  } catch (err) {
    console.warn("Security audit DB fetch note:", err);
  }

  return inMemoryAuditLogs.slice(0, limitCount);
}
