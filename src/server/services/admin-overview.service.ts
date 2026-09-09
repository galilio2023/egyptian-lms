import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, count, sql } from "drizzle-orm";

export async function getAdminOverviewData(isAssistant = false) {
  try {
    const [studentCountRes, unitCountRes, pendingOrdersRes, revenueRes, atRiskRes] = await Promise.all([
      db
        .select({ value: count() })
        .from(schema.user)
        .where(eq(schema.user.role, "student")),
      db
        .select({ value: count() })
        .from(schema.courseUnit),
      db
        .select({ value: count() })
        .from(schema.order)
        .where(eq(schema.order.paymentStatus, "manual_review")),
      db
        .select({ total: sql<number>`coalesce(sum(${schema.order.amountEgp}), 0)` })
        .from(schema.order)
        .where(eq(schema.order.paymentStatus, "completed")),
      db
        .select({ value: count() })
        .from(schema.studentProfile)
        .where(sql`${schema.studentProfile.xpPoints} <= 0 OR ${schema.studentProfile.isBanned} = true`),
    ]);

    return {
      totalStudents: studentCountRes[0]?.value || 0,
      totalUnits: unitCountRes[0]?.value || 0,
      pendingOrders: pendingOrdersRes[0]?.value || 0,
      // RBAC: Hide revenue figures from assistant accounts
      totalRevenueEgp: isAssistant ? 0 : Number(revenueRes[0]?.total || 0),
      atRiskStudents: atRiskRes[0]?.value || 0,
      activeLiveSessions: 0,
    };
  } catch (err) {
    console.warn("Overview fetch DB note:", err);
    return null;
  }
}

/**
 * Executes a lightweight database ping query to measure connection health and latency.
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    return {
      connected: true,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      connected: false,
      latencyMs: Date.now() - start,
      error: (error as Error)?.message || "فشل الاتصال بقاعدة البيانات",
    };
  }
}

