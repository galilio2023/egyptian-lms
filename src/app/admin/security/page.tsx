"use client";

import { useState } from "react";
import { 
  ShieldAlert, 
  RefreshCw, 
  Ticket, 
  Download 
} from "lucide-react";
import { AdminPageHeader, SearchFilterBar } from "@/components/shared";
import { Button, Select, ConfirmModal } from "@/components/ui";
import { BatchVoucherGeneratorModal } from "@/features/admin-orders";
import {
  SecurityKpiCards,
  SecurityLogsTable,
  useAdminSecurity,
  EVENT_TYPE_OPTIONS,
  SEVERITY_OPTIONS,
} from "@/features/admin-security";

export default function AdminSecurityPage() {
  const {
    logs,
    filteredLogs,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterSeverity,
    setFilterSeverity,
    isLoading,
    actionInProgress,
    refetch,
    banStudent,
    exportToCSV,
  } = useAdminSecurity();

  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [banningTarget, setBanningTarget] = useState<{ userId: string; studentPhone?: string | null } | null>(null);

  const handleConfirmBan = async () => {
    if (!banningTarget) return;
    await banStudent(banningTarget.userId, banningTarget.studentPhone);
    setBanningTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        icon={<ShieldAlert className="w-8 h-8 text-rose-600" />}
        title={
          <>
            سجل الأمان ومكافحة التهديدات{" "}
            <span className="text-gradient-purple">(Security Audit)</span>
          </>
        }
        subtitle="مراقبة محاولات الاختراق، وقفل الأجهزة المتعددة، وتتبع كروت الشحن، وعزل المخالفين فورياً."
        actions={
          <>
            <Button
              variant="vibrant"
              size="sm"
              onClick={() => setIsVoucherModalOpen(true)}
            >
              <Ticket className="w-4 h-4 me-1" />
              <span>مولد كروت السنتر</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
            >
              <Download className="w-4 h-4 text-purple-600 me-1" />
              <span>تصدير CSV</span>
            </Button>

            <Button
              variant="secondary"
              size="icon"
              disabled={isLoading}
              onClick={refetch}
              title="تحديث السجلات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </>
        }
      />

      {/* 2. KPI Cards */}
      <SecurityKpiCards logs={logs} />

      {/* 3. Search & Filter Bar */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="بحث برقم الهاتف، عنوان IP، أو الوصف..."
        filters={
          <>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={EVENT_TYPE_OPTIONS}
              className="sm:w-56"
            />
            <Select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              options={SEVERITY_OPTIONS}
              className="sm:w-44"
            />
          </>
        }
      />

      {/* 4. Security Audit Feed Table */}
      <SecurityLogsTable
        logs={filteredLogs}
        actionInProgress={actionInProgress}
        onBanStudent={(userId, phone) => setBanningTarget({ userId, studentPhone: phone })}
      />

      {/* 5. Batch Voucher Modal */}
      <BatchVoucherGeneratorModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
      />

      {/* 6. Centralized Ban Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(banningTarget)}
        onClose={() => setBanningTarget(null)}
        onConfirm={handleConfirmBan}
        title="تأكيد حظر حساب الطالب"
        confirmText="تأكيد الحظر الفوري"
        variant="danger"
        message={
          <>
            هل أنت متأكد من رغبتك في حظر حساب الطالب صاحب الرقم (<strong>{banningTarget?.studentPhone || banningTarget?.userId}</strong>) فوراً وإلغاء كافة جلساته على جميع الأجهزة لمنع الوصول للمنصة؟
          </>
        }
      />
    </div>
  );
}
