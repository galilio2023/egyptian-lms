"use client";

import { useEffect, useState } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Ban, 
  Search, 
  Smartphone, 
  Ticket, 
  Clock, 
  Globe, 
  UserCheck, 
  CheckCircle2,
  Lock,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { SecurityAuditRecord, AuditEventType, AuditSeverity } from "@/lib/security/audit-logger";
import { BatchVoucherGeneratorModal } from "@/components/admin/batch-voucher-generator";

export default function AdminSecurityPage() {
  const [logs, setLogs] = useState<SecurityAuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchSecurityLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/actions?type=security_logs");
      if (res.ok) {
        const data = await res.json();
        if (data.securityLogs) {
          setLogs(data.securityLogs);
        }
      }
    } catch {
      toast.error("تعذر جلب سجلات الأمان، يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityLogs();
  }, []);

  const handleBanStudent = async (userId: string, studentPhone?: string | null) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حظر الطالب صاحب الرقم (${studentPhone || userId}) فوراً وإنهاء كافة جلساته؟`)) {
      return;
    }

    setActionInProgress(userId);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ban_student",
          payload: {
            userId,
            reason: "حظر أمني من لوحة مكافحة التهديدات",
          },
        }),
      });

      if (res.ok) {
        toast.success("🚫 تم حظر حساب الطالب فوراً وطرده من جميع الأجهزة.");
        fetchSecurityLogs();
      } else {
        toast.error("تعذر حظر الطالب، يرجى مراجعة الخادم.");
      }
    } catch {
      toast.error("حدث خطأ في الشبكة أثناء الحظر.");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUnbanStudent = async (userId: string) => {
    setActionInProgress(userId);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unban_student",
          payload: { userId },
        }),
      });

      if (res.ok) {
        toast.success("✅ تم رفع الحظر عن حساب الطالب بنجاح.");
        fetchSecurityLogs();
      }
    } catch {
      toast.error("حدث خطأ أثناء رفع الحظر.");
    } finally {
      setActionInProgress(null);
    }
  };

  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      toast.info("لا توجد سجلات أمنية للتصدير.");
      return;
    }

    const headers = ["Timestamp", "EventType", "Severity", "StudentPhone", "IPAddress", "Description", "Details"];
    const rows = filteredLogs.map((log) => [
      `"${new Date(log.createdAt).toISOString()}"`,
      `"${log.eventType}"`,
      `"${log.severity}"`,
      `"${log.studentPhone || ""}"`,
      `"${log.ipAddress || ""}"`,
      `"${log.description.replace(/"/g, '""')}"`,
      `"${log.details ? JSON.stringify(log.details).replace(/"/g, '""') : ""}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `security_audit_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تصدير تقرير الأمان بصيغة CSV بنجاح!");
  };

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === "all" || log.eventType === filterType;
    const matchesSeverity = filterSeverity === "all" || log.severity === filterSeverity;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (log.studentPhone && log.studentPhone.includes(query)) ||
      (log.ipAddress && log.ipAddress.includes(query)) ||
      log.description.toLowerCase().includes(query) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(query));

    return matchesType && matchesSeverity && matchesSearch;
  });

  // Metrics
  const rateLimitEvents = logs.filter((l) => l.eventType.includes("rate_limit")).length;
  const deviceEvents = logs.filter((l) => l.eventType.includes("device")).length;
  const voucherEvents = logs.filter((l) => l.eventType.includes("voucher")).length;
  const highSeverityEvents = logs.filter((l) => l.severity === "high" || l.severity === "critical").length;

  const getSeverityBadge = (sev: AuditSeverity) => {
    switch (sev) {
      case "critical":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">حرج (Critical)</span>;
      case "high":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">مرتفع (High)</span>;
      case "medium":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">متوسط (Medium)</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">عادي (Low)</span>;
    }
  };

  const getEventTypeBadge = (evt: AuditEventType) => {
    switch (evt) {
      case "voucher_rate_limited":
      case "rate_limit_triggered":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
            <Lock className="w-3 h-3" /> تجاوز المعدل (429)
          </span>
        );
      case "device_locked":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
            <Smartphone className="w-3 h-3" /> قفل جهاز إضافي
          </span>
        );
      case "device_transferred":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> نقل جهاز مصرح
          </span>
        );
      case "device_transfer_failed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
            <AlertTriangle className="w-3 h-3" /> فشل تحقق ولي الأمر
          </span>
        );
      case "voucher_redeem_failed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
            <Ticket className="w-3 h-3" /> كود شحن غير صحيح
          </span>
        );
      case "voucher_redeem_success":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200">
            <Ticket className="w-3 h-3" /> كود شحن ناجح
          </span>
        );
      case "quiz_max_attempts_blocked":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
            <ShieldCheck className="w-3 h-3" /> تجاوز محاولات الاختبار
          </span>
        );
      case "user_banned":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-rose-700 px-2.5 py-1 rounded-xl">
            <Ban className="w-3 h-3" /> حساب محظور
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg">
            {evt}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-purple-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-slate-900">سجل الأمان ومكافحة التهديدات (Security Audit)</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            مراقبة محاولات الاختراق، وقفل الأجهزة المتعددة، وتتبع كروت الشحن، وعزل المخالفين فورياً.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVoucherModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-vibrant hover:scale-105 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Ticket className="w-4 h-4" />
            <span>مولد كروت السنتر المشفرة</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="تصدير السجلات إلى ملف Excel / CSV"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span>تصدير CSV</span>
          </button>

          <button
            onClick={fetchSecurityLogs}
            disabled={isLoading}
            className="p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors cursor-pointer"
            title="تحديث السجلات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>إجمالي الأحداث المسجلة</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{logs.length}</div>
          <span className="text-[10px] text-purple-600 font-semibold mt-1 block">محفوظة في سجل الرقابة</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-rose-100 shadow-sm">
          <div className="flex items-center justify-between text-rose-600 text-xs font-bold mb-2">
            <span>تجاوز معدل الطلب (Rate Limit)</span>
            <Lock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-700">{rateLimitEvents}</div>
          <span className="text-[10px] text-rose-600 font-semibold mt-1 block">تم حجبهم برمز 429 تلقائياً</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-amber-100 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold mb-2">
            <span>محاولات قفل ونقل الأجهزة</span>
            <Smartphone className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-800">{deviceEvents}</div>
          <span className="text-[10px] text-amber-600 font-semibold mt-1 block">حماية لمنع مشاركة الحسابات</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-teal-100 shadow-sm">
          <div className="flex items-center justify-between text-teal-700 text-xs font-bold mb-2">
            <span>محاولات شحن الكروت</span>
            <Ticket className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-teal-800">{voucherEvents}</div>
          <span className="text-[10px] text-teal-600 font-semibold mt-1 block">ناجحة وفاشلة تحت الرصد</span>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم الهاتف، عنوان IP، أو الوصف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-2xl border border-purple-100 bg-purple-50/40 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-300"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Event Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-2 rounded-xl border border-purple-100 bg-white text-xs font-bold text-slate-700"
          >
            <option value="all">كل أنواع الأحداث</option>
            <option value="device_locked">قفل جهاز إضافي (Device Locked)</option>
            <option value="device_transferred">نقل جهاز ناجح (Device Transferred)</option>
            <option value="device_transfer_failed">فشل نقل جهاز (Transfer Failed)</option>
            <option value="voucher_rate_limited">حظر كروت الشحن (Voucher 429)</option>
            <option value="voucher_redeem_failed">كود شحن خاطئ (Voucher Failed)</option>
            <option value="voucher_redeem_success">كود شحن ناجح (Voucher Success)</option>
            <option value="quiz_max_attempts_blocked">تجاوز محاولات الاختبار (Quiz Blocked)</option>
            <option value="rate_limit_triggered">تجاوز معدل الطلب العام (Rate Limit)</option>
            <option value="user_banned">حساب محظور (Banned)</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="p-2 rounded-xl border border-purple-100 bg-white text-xs font-bold text-slate-700"
          >
            <option value="all">كل درجات الخطورة</option>
            <option value="critical">حرج (Critical)</option>
            <option value="high">مرتفع (High)</option>
            <option value="medium">متوسط (Medium)</option>
            <option value="low">عادي (Low)</option>
          </select>
        </div>
      </div>

      {/* Security Audit Feed Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-purple-50 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900">سجل العمليات الأمني المباشر</h2>
          <span className="text-xs text-slate-400 font-bold font-mono">
            {filteredLogs.length} من أصل {logs.length} سجل
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-purple-50/50 text-slate-600 font-bold border-b border-purple-100">
              <tr>
                <th className="p-3.5">الوقت</th>
                <th className="p-3.5">نوع الحدث</th>
                <th className="p-3.5">الخطورة</th>
                <th className="p-3.5">هاتف الطالب</th>
                <th className="p-3.5">عنوان IP</th>
                <th className="p-3.5">التفاصيل والوصف</th>
                <th className="p-3.5 text-center">إجراء فوري</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                    لا توجد سجلات أمنية مطابقة لخيارات البحث المحددة.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-purple-50/20 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="p-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(log.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{new Date(log.createdAt).toLocaleDateString("ar-EG")}</span>
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
                        <button
                          onClick={() => handleBanStudent(log.userId!, log.studentPhone)}
                          disabled={actionInProgress === log.userId}
                          className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                        >
                          <Ban className="w-3 h-3" />
                          <span>حظر الحساب</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">—</span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Voucher Modal */}
      <BatchVoucherGeneratorModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
      />

    </div>
  );
}
