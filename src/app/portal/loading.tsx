export default function PortalLoading() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white mx-auto animate-pulse">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-600">جاري تحميل بوابة الطالب...</p>
      </div>
    </div>
  );
}
