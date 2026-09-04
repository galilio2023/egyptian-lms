"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Plus, 
  Trash2, 
  Clock 
} from "lucide-react";
import { INITIAL_QUIZ, type MockQuestion } from "@/lib/db/mock-data";
import { 
  ExamQuizSheetSvg, 
  ChampionCupSvg 
} from "@/components/ui/illustrated-icons";

export default function AdminQuizzesPage() {
  const [questions, setQuestions] = useState<MockQuestion[]>(INITIAL_QUIZ.questions);
  const [showAddModal, setShowAddModal] = useState(false);
  const [qText, setQText] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");
  const [opt4, setOpt4] = useState("");
  const [correctIdx, setCorrectIdx] = useState(0);
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/actions?type=quizzes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.quizzes && data.quizzes.length > 0) {
          setQuestions(data.quizzes);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const options = [
      { id: 'o-1', text: opt1, isCorrect: correctIdx === 0 },
      { id: 'o-2', text: opt2, isCorrect: correctIdx === 1 },
      { id: 'o-3', text: opt3, isCorrect: correctIdx === 2 },
      { id: 'o-4', text: opt4, isCorrect: correctIdx === 3 },
    ].filter((o) => o.text.trim() !== "");

    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_question",
          payload: {
            text: qText.trim(),
            options,
            explanation: explanation.trim() || "إجابة صحيحة وفقاً للمنهج.",
            points: 1,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "حدث خطأ أثناء حفظ السؤال.");
        return;
      }

      const newQ: MockQuestion = {
        id: data.question?.id || `q-${Date.now()}`,
        text: qText,
        options,
        explanation: explanation || "إجابة صحيحة وفقاً للمنهج.",
      };

      setQuestions([...questions, newQ]);
      setShowAddModal(false);
      setQText("");
      setOpt1("");
      setOpt2("");
      setOpt3("");
      setOpt4("");
      setExplanation("");
      toast.success("🎉 تمت إضافة السؤال بنجاح إلى بنك الأسئلة المركزي في قاعدة البيانات!");
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <ExamQuizSheetSvg className="w-8 h-8" />
            <span>بنك الأسئلة والامتحانات <span className="text-gradient-purple">(Quiz Studio)</span></span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            إعداد الاختبارات التفاعلية، إضافة الأسئلة، وتحديد وقت الامتحان ونسبة النجاح.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-black text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سؤال جديد للبنك</span>
        </button>
      </div>

      {/* Quiz Config Card */}
      <div className="modern-card bg-white/95 backdrop-blur-md p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 border-2 border-purple-100 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs text-slate-500 font-bold">اسم الاختبار الحالي</span>
          <div className="font-black text-base text-slate-900">{INITIAL_QUIZ.title}</div>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-slate-500 font-bold">مدة الاختبار بالدقائق</span>
          <div className="font-black text-base text-amber-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{INITIAL_QUIZ.timeLimitMinutes} دقائق (مؤقت تنازلي)</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-slate-500 font-bold">نسبة الاجتياز المطلوبة</span>
          <div className="font-black text-base text-emerald-600 flex items-center gap-2">
            <ChampionCupSvg className="w-4 h-4" />
            <span>%{INITIAL_QUIZ.passPercentage} لاجتياز الاختبار</span>
          </div>
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <ExamQuizSheetSvg className="w-6 h-6" />
          <span>قائمة الأسئلة ({questions.length} سؤال متاح)</span>
        </h2>

        <div className="space-y-3.5">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="modern-card bg-white/95 backdrop-blur-md p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-2 border-purple-100 hover:border-purple-300 transition-all shadow-sm"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-gradient-vibrant text-white font-black text-xs flex items-center justify-center shadow-sm">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 text-left" dir="ltr">
                    {q.text}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      dir="ltr"
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center ${
                        opt.isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {opt.text} {opt.isCorrect && '✓'}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-400 font-medium">💡 {q.explanation}</p>
                )}
              </div>

              <button
                onClick={async () => {
                  try {
                    await fetch("/api/admin/actions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "delete_question",
                        payload: { questionId: q.id },
                      }),
                    });
                    setQuestions(questions.filter((item) => item.id !== q.id));
                    toast.success("تم حذف السؤال بنجاح من بنك الأسئلة.");
                  } catch {
                    toast.error("حدث خطأ أثناء حذف السؤال.");
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="حذف السؤال"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in-50">
          <div className="modern-card w-full max-w-lg p-6 sm:p-8 space-y-4 border-2 border-purple-200 shadow-2xl bg-white rounded-3xl">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ExamQuizSheetSvg className="w-6 h-6" />
              <span>إضافة سؤال جديد</span>
            </h3>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="space-y-1 text-right">
                <label className="text-xs font-bold text-slate-700">نص السؤال (بالإنجليزية)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The letter 'A' makes the sound ..."
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 text-left font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-right">
                  <label className="text-xs font-bold text-slate-700">الاختيار 1 (الصحيح افتراضياً)</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    placeholder="Option A"
                    value={opt1}
                    onChange={(e) => setOpt1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-600 text-center font-bold"
                  />
                </div>
                <div className="space-y-1 text-right">
                  <label className="text-xs font-bold text-slate-700">الاختيار 2</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    placeholder="Option B"
                    value={opt2}
                    onChange={(e) => setOpt2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 text-center font-bold"
                  />
                </div>
                <div className="space-y-1 text-right">
                  <label className="text-xs font-bold text-slate-700">الاختيار 3</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="Option C"
                    value={opt3}
                    onChange={(e) => setOpt3(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 text-center font-bold"
                  />
                </div>
                <div className="space-y-1 text-right">
                  <label className="text-xs font-bold text-slate-700">الاختيار 4</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="Option D"
                    value={opt4}
                    onChange={(e) => setOpt4(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 text-center font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1 text-right">
                <label className="text-xs font-bold text-slate-700">تحديد الإجابة الصحيحة</label>
                <select
                  value={correctIdx}
                  onChange={(e) => setCorrectIdx(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs font-bold"
                >
                  <option value={0}>الاختيار 1 (Option A)</option>
                  <option value={1}>الاختيار 2 (Option B)</option>
                  <option value={2}>الاختيار 3 (Option C)</option>
                  <option value={3}>الاختيار 4 (Option D)</option>
                </select>
              </div>

              <div className="space-y-1 text-right">
                <label className="text-xs font-bold text-slate-700">توضيح الإجابة (Explanation)</label>
                <input
                  type="text"
                  placeholder="e.g. 'A' is for Apple /æ/"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white text-xs font-black shadow-md shadow-purple-500/20"
                >
                  إضافة السؤال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
