import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="text-center space-y-4 modern-card bg-white p-8 max-w-md">
        <div className="text-6xl font-bold text-slate-200">404</div>
        <h2 className="text-xl font-bold text-slate-900">الصفحة غير موجودة</h2>
        <p className="text-sm text-slate-600">الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
