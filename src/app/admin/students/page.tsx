"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Search, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert
} from "lucide-react";
import { INITIAL_STUDENTS, type MockStudent } from "@/lib/db/mock-data";
import { 
  UsersGraduationSvg, 
  WhatsAppBubbleSvg, 
  XpGemSvg 
} from "@/components/ui/illustrated-icons";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<MockStudent[]>(INITIAL_STUDENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGov, setSelectedGov] = useState("all");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/actions?type=students")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.students && data.students.length > 0) {
          setStudents(data.students);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const filteredStudents = students.filter((std) => {
    const matchesSearch = 
      std.name.includes(searchTerm) ||
      std.studentPhone.includes(searchTerm) ||
      std.parentPhone.includes(searchTerm);
    const matchesGov = selectedGov === "all" || std.governorate.includes(selectedGov);
    return matchesSearch && matchesGov;
  });

  const handleResetDevice = async (studentId: string, studentName: string, studentPhone: string) => {
    try {
      await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_device",
          payload: { studentId, studentPhone },
        }),
      });

      setStudents(
        students.map((s) => (s.id === studentId ? { ...s, deviceLocked: false } : s))
      );
      toast.success(`تم فك حظر وربط الجهاز للطالب (${studentName}) بنجاح!`);
    } catch {
      toast.error("حدث خطأ أثناء فك الجهاز.");
    }
  };

  const handleToggleBan = async (studentId: string, studentName: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    const isBanned = !!student.isBanned;

    try {
      await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_ban",
          payload: { studentId, isBanned: !isBanned },
        }),
      });

      setStudents(
        students.map((s) => (s.id === studentId ? { ...s, isBanned: !isBanned } : s))
      );
      if (isBanned) {
        toast.success(`تم إلغاء حظر حساب الطالب (${studentName}).`);
      } else {
        toast.warning(`تم حظر حساب الطالب (${studentName}) مؤقتاً.`);
      }
    } catch {
      toast.error("حدث خطأ أثناء تعديل حالة الحساب.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <UsersGraduationSvg className="w-8 h-8" />
            <span>إدارة الطلاب وأمان الأجهزة <span className="text-gradient-purple">(Students & Devices)</span></span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            البحث في بيانات الطلاب، فك حظر الأجهزة عند تغيير الجهاز، ومتابعة أرقام أولياء الأمور.
          </p>
        </div>

        <div className="text-xs font-black text-purple-800 px-4 py-2 rounded-2xl bg-purple-50 border-2 border-purple-200">
          إجمالي المسجلين: {students.length} طالب
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="modern-card p-4 bg-white/95 backdrop-blur-md border-2 border-purple-100 flex flex-col sm:flex-row items-center gap-3 rounded-2xl shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-purple-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث بالاسم، رقم موبايل الطالب أو رقم ولي الأمر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-purple-600 font-medium"
          />
        </div>

        <select
          value={selectedGov}
          onChange={(e) => setSelectedGov(e.target.value)}
          className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-800 text-xs focus:outline-none focus:border-purple-600 font-bold"
        >
          <option value="all">جميع المحافظات</option>
          <option value="كفر الشيخ">كفر الشيخ</option>
          <option value="الإسكندرية">الإسكندرية</option>
          <option value="القاهرة">القاهرة</option>
          <option value="الدقهلية">الدقهلية (المنصورة)</option>
        </select>
      </div>

      {/* Students Data Table */}
      <div className="modern-card rounded-3xl bg-white/95 backdrop-blur-md border-2 border-purple-100 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-purple-50/70 border-b border-purple-100 text-purple-950 font-black">
              <tr>
                <th className="p-4">اسم الطالب</th>
                <th className="p-4">موبايل الطالب</th>
                <th className="p-4">موبايل ولي الأمر (واتساب)</th>
                <th className="p-4">المحافظة والصف</th>
                <th className="p-4">نقاط XP</th>
                <th className="p-4">حالة الجهاز</th>
                <th className="p-4 text-center">إجراءات السكرتارية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-slate-700 font-medium">
              {filteredStudents.map((std) => (
                <tr key={std.id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="p-4 font-black text-slate-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-vibrant text-white flex items-center justify-center font-black text-xs shadow-sm">
                      {std.name[0]}
                    </div>
                    <span>{std.name}</span>
                  </td>

                  <td className="p-4 font-mono text-right font-bold text-slate-800">
                    <bdi dir="ltr">{std.studentPhone}</bdi>
                  </td>
                  
                  <td className="p-4">
                    <a
                      href={`https://wa.me/2${std.parentPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline font-mono inline-flex items-center gap-1.5 font-bold"
                    >
                      <WhatsAppBubbleSvg className="w-4 h-4 shrink-0" />
                      <bdi dir="ltr">{std.parentPhone}</bdi>
                    </a>
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-slate-900">{std.gradeTitle}</div>
                    <div className="text-[10px] text-purple-600 font-bold">{std.governorate}</div>
                  </td>

                  <td className="p-4 font-black text-purple-700">
                    <div className="flex items-center gap-1">
                      <XpGemSvg className="w-4 h-4" />
                      <span>{std.xpPoints} XP</span>
                    </div>
                  </td>

                  <td className="p-4">
                    {std.isBanned ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black inline-flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        حساب محظور
                      </span>
                    ) : std.deviceLocked ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        مربوط بالجهاز الحالي ✓
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium inline-flex items-center gap-1">
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        متاح لربط جهاز جديد
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleResetDevice(std.id, std.name, std.studentPhone)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-200 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                        title="فك ربط الجهاز القديم ليتمكن الطالب من تسجيل الدخول من جهاز جديد"
                      >
                        <RotateCcw className="w-3 h-3" />
                        فك ربط الجهاز
                      </button>

                      <button
                        onClick={() => handleToggleBan(std.id, std.name)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] border transition-all cursor-pointer shadow-2xs ${
                          std.isBanned
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                        }`}
                      >
                        {std.isBanned ? "إلغاء الحظر" : "حظر الحساب"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
