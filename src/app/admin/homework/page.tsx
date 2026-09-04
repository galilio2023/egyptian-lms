"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  PenTool, 
  Search, 
  Sparkles, 
  Eye, 
  MessageCircle,
  Users
} from "lucide-react";
import { INITIAL_HOMEWORK_SUBMISSIONS, type MockHomeworkSubmission } from "@/lib/db/mock-data";
import { CanvasPenGrader } from "@/components/admin/canvas-pen-grader";

export default function AdminHomeworkPage() {
  const [submissions, setSubmissions] = useState<MockHomeworkSubmission[]>(INITIAL_HOMEWORK_SUBMISSIONS);
  const [selectedSubmission, setSelectedSubmission] = useState<MockHomeworkSubmission | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "submitted" | "graded">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/actions?type=homework")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.homework && data.homework.length > 0) {
          setSubmissions(data.homework);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const filtered = submissions.filter((sub) => {
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus;
    const matchesSearch = 
      sub.studentName.includes(searchTerm) ||
      sub.studentPhone.includes(searchTerm) ||
      sub.assignmentTitle.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = submissions.filter((s) => s.status === "submitted").length;
  const gradedCount = submissions.filter((s) => s.status === "graded").length;

  const handleSaveGrade = async (data: {
    submissionId: string;
    score: number;
    feedbackNotes: string;
    annotatedImages: Array<{ pageIndex: number; dataUrl: string }>;
  }) => {
    try {
      const sub = submissions.find((s) => s.id === data.submissionId);
      await fetch("/api/homework/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          studentName: sub?.studentName,
          parentPhone: sub?.parentPhone,
          assignmentTitle: sub?.assignmentTitle,
        }),
      });

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === data.submissionId
            ? {
                ...s,
                status: "graded",
                score: data.score,
                feedbackNotes: data.feedbackNotes,
                annotatedImages: data.annotatedImages,
                gradedAt: "الآن",
              }
            : s
        )
      );

      toast.success("✅ تم اعتماد تصحيح الكراسة بنجاح ورصد الدرجة للطالب!");
    } catch {
      toast.error("حدث خطأ أثناء حفظ التصحيح.");
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <span>كنترول وتصحيح كراسات الواجب <span className="text-gradient-purple">(Homework Grader)</span></span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            مراجعة صور صفحات كراسة الواجب وكتاب النشاط المرفوعة من الطلاب، والتصحيح بالقلم الأحمر ووضع الملاحظات.
          </p>
        </div>

        {/* Status Counts */}
        <div className="flex items-center gap-2.5 text-xs font-bold">
          <span className="px-3.5 py-1.5 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 shadow-sm flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingCount} كراسة بانتظار التصحيح</span>
          </span>
          <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{gradedCount} تم تصحيحها</span>
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="modern-card p-4 bg-white/95 backdrop-blur-md border border-purple-100 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث باسم الطالب، رقم الهاتف، أو اسم الواجب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-10 pe-4 py-2 rounded-xl bg-purple-50/40 border border-purple-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-purple-600"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterStatus === "all"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            الكل ({submissions.length})
          </button>
          <button
            onClick={() => setFilterStatus("submitted")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterStatus === "submitted"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            معلق ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus("graded")}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterStatus === "graded"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            تم التصحيح ({gradedCount})
          </button>
        </div>
      </div>

      {/* Submissions List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((sub) => {
          const isGraded = sub.status === "graded";
          const firstImg = sub.studentImages[0]?.imageUrl;

          return (
            <div
              key={sub.id}
              className="modern-card p-5 bg-white/95 backdrop-blur-md border-2 border-purple-100/80 rounded-3xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                
                {/* Status Badge & Time */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 ${
                    isGraded 
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                      : "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                  }`}>
                    {isGraded ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{isGraded ? `تم التصحيح (${sub.score}/${sub.maxScore})` : "بانتظار التصحيح"}</span>
                  </span>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {sub.submittedAt}
                  </span>
                </div>

                {/* Notebook Thumbnail Preview */}
                {firstImg && (
                  <div 
                    onClick={() => setSelectedSubmission(sub)}
                    className="relative aspect-video rounded-2xl overflow-hidden border border-purple-200 group-hover:border-purple-500 cursor-pointer transition-all shadow-inner bg-slate-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={firstImg}
                      alt={sub.assignmentTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3 text-white">
                      <span className="text-xs font-black flex items-center gap-1.5">
                        <PenTool className="w-4 h-4 text-amber-400" />
                        <span>فتح أداة التصحيح بالقلم ({sub.studentImages.length} صفحات)</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Student Info */}
                <div>
                  <h3 className="font-black text-sm text-slate-900 line-clamp-1">
                    {sub.studentName}
                  </h3>
                  <p className="text-xs text-purple-700 font-bold mt-0.5 line-clamp-1">
                    {sub.assignmentTitle}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {sub.gradeTitle} • هاتف: <bdi dir="ltr">{sub.studentPhone}</bdi>
                  </p>
                </div>

                {/* Feedback snippet if graded */}
                {isGraded && sub.feedbackNotes && (
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-[11px] text-purple-950 line-clamp-2 font-medium">
                    <span className="font-bold">ملاحظة المعلم: </span>
                    {sub.feedbackNotes}
                  </div>
                )}

              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedSubmission(sub)}
                  className={`flex-1 py-2.5 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                    isGraded
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      : "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/25"
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{isGraded ? "مراجعة وتعديل التصحيح" : "ابدأ التصحيح بالقلم الأحمر"}</span>
                </button>

                <a
                  href={`https://wa.me/2${sub.parentPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                  title="مراسلة ولي الأمر على واتساب"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>

            </div>
          );
        })}
      </div>

      {/* Canvas Pen Grader Modal */}
      {selectedSubmission && (
        <CanvasPenGrader
          submission={selectedSubmission}
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onSaveGrade={handleSaveGrade}
        />
      )}

    </div>
  );
}
