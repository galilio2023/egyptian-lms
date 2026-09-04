"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAdminQuery, executeAdminAction } from "@/lib/api/admin-client";
import { useTableFilter } from "@/lib/hooks/use-table-filter";
import type { SecurityAuditRecord } from "../types";

export function useAdminSecurity() {
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const { data: logs, setData: setLogs, isLoading, refetch } = useAdminQuery<SecurityAuditRecord[]>(
    "security_logs",
    [],
    (res) => (res.securityLogs && Array.isArray(res.securityLogs) ? (res.securityLogs as SecurityAuditRecord[]) : undefined)
  );

  const filterState = useTableFilter<SecurityAuditRecord>({
    items: logs,
    searchFields: (l) => [l.description, l.studentPhone, l.ipAddress],
    filterPredicates: {
      type: (l, val) => l.eventType === val,
      severity: (l, val) => l.severity === val,
    },
    initialFilters: {
      type: "all",
      severity: "all",
    },
  });

  const banStudent = async (userId: string, studentPhone?: string | null) => {
    setActionInProgress(userId);
    try {
      const result = await executeAdminAction(
        "ban_student",
        {
          userId,
          reason: "حظر أمني من لوحة مكافحة التهديدات",
        },
        {
          successMessage: "🚫 تم حظر حساب الطالب فوراً وطرده من جميع الأجهزة.",
          errorMessage: "تعذر حظر الطالب، يرجى مراجعة الخادم.",
        }
      );

      if (result.success) {
        refetch();
        return true;
      }
      return false;
    } finally {
      setActionInProgress(null);
    }
  };

  const exportToCSV = () => {
    if (logs.length === 0) {
      toast.error("لا توجد سجلات أمنية لتصديرها.");
      return;
    }

    const headers = ["ID", "Timestamp", "EventType", "Severity", "StudentPhone", "IP", "Description"];
    const rows = logs.map((l) => [
      l.id,
      new Date(l.createdAt).toISOString(),
      l.eventType,
      l.severity,
      l.studentPhone || l.userId || "N/A",
      l.ipAddress || "127.0.0.1",
      `"${(l.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `security-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تصدير سجلات الأمان كملف CSV بنجاح!");
  };

  return {
    logs,
    filteredLogs: filterState.filteredItems,
    searchQuery: filterState.searchTerm,
    setSearchQuery: filterState.setSearchTerm,
    filterType: filterState.filters.type || "all",
    setFilterType: (t: string) => filterState.setFilter("type", t),
    filterSeverity: filterState.filters.severity || "all",
    setFilterSeverity: (s: string) => filterState.setFilter("severity", s),
    isLoading,
    actionInProgress,
    refetch,
    banStudent,
    exportToCSV,
  };
}
