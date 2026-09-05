"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Volume2,
  ArrowRight,
  RefreshCw,
  Eye,
  Check,
  Award,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { INITIAL_GRADES } from "@/lib/db/mock-data";
import { ParsedCurriculumUnit, CurriculumTrack } from "@/lib/ai/curriculum-intake-parser";
import { validateParsedCurriculum } from "@/lib/ai/curriculum-validator";
import { ValidationAlert } from "./validation-alert";

interface MinistryIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type IntakeStep = "upload" | "parsing" | "review" | "saving";
type ReviewTab = "unit" | "lessons" | "vocabulary" | "quizzes";

export function MinistryIntakeModal({
  isOpen,
  onClose,
  onSuccess,
}: MinistryIntakeModalProps) {
  const [step, setStep] = useState<IntakeStep>("upload");
  const [selectedGrade, setSelectedGrade] = useState<string>("grade-3");
  const [track, setTrack] = useState<CurriculumTrack>("connect");
  const [term, setTerm] = useState<1 | 2>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Review state
  const [activeTab, setActiveTab] = useState<ReviewTab>("unit");
  const [parsedData, setParsedData] = useState<ParsedCurriculumUnit | null>(null);

  // Editable fields in review
  const [unitTitleEnglish, setUnitTitleEnglish] = useState("");
  const [unitTitleArabic, setUnitTitleArabic] = useState("");
  const [unitPrice, setUnitPrice] = useState<number>(250);
  const [unitDescription, setUnitDescription] = useState("");

  const validation = parsedData
    ? validateParsedCurriculum({
        ...parsedData,
        titleEnglish: unitTitleEnglish,
        titleArabic: unitTitleArabic,
        description: unitDescription,
        suggestedPriceEgp: unitPrice,
      })
    : null;

  const resetState = () => {
    setStep("upload");
    setSelectedFile(null);
    setParsedData(null);
    setActiveTab("unit");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFile(file);
      } else {
        toast.error("يرجى اختيار ملف PDF صالح لكتاب أو ملزمة الوزارة.");
      }
    }
  };

  const handleStartParsing = async (usePresetSample: boolean = false) => {
    setStep("parsing");
    try {
      let res: Response;

      if (usePresetSample || !selectedFile) {
        // Trigger sample preset
        res = await fetch("/api/admin/curriculum/intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gradeSlug: selectedGrade,
            track,
            term,
          }),
        });
      } else {
        // Multi-part PDF upload
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("gradeSlug", selectedGrade);
        formData.append("track", track);
        formData.append("term", term.toString());

        res = await fetch("/api/admin/curriculum/intake", {
          method: "POST",
          body: formData,
        });
      }

      const data = await res.json();
      if (!res.ok || data.error || !data.draft) {
        toast.error(data.error || "تعذر تحليل ملف المنهج.");
        setStep("upload");
        return;
      }

      const draft: ParsedCurriculumUnit = data.draft;
      setParsedData(draft);
      setUnitTitleEnglish(draft.titleEnglish);
      setUnitTitleArabic(draft.titleArabic);
      setUnitPrice(draft.suggestedPriceEgp || 250);
      setUnitDescription(draft.description);

      toast.success("✨ تم تحليل المنهج واستخراج الدروس والكلمات بنجاح!");
      setStep("review");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي.");
      setStep("upload");
    }
  };

  const handleCommit = async () => {
    if (!parsedData) return;
    setStep("saving");

    const finalizedUnit: ParsedCurriculumUnit = {
      ...parsedData,
      titleEnglish: unitTitleEnglish,
      titleArabic: unitTitleArabic,
      suggestedPriceEgp: Number(unitPrice) || 250,
      description: unitDescription,
    };

    try {
      const res = await fetch("/api/admin/curriculum/intake/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unit: finalizedUnit }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "تعذر اعتماد الوحدة في قاعدة البيانات.");
        setStep("review");
        return;
      }

      toast.success("🎉 " + (data.message || "تم اعتماد وحفظ المنهج بنجاح!"));
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error("فشل حفظ المنهج.");
      setStep("review");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="استيراد منهج الوزارة بالذكاء الاصطناعي (PDF Intake)"
      description="رفع كتب الوزارة وأدلة المعلم، استخراج المفردات والقواعد والصوتيات، وتوليد المحاضرات والاختبارات آلياً."
      size="xl"
    >
      <div className="space-y-6">
        {/* =========================================================================
            STEP 1: UPLOAD & SETUP
        ========================================================================= */}
        {step === "upload" && (
          <div className="space-y-6">
            {/* Grade Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                1. اختر المرحلة الدراسية المستهدفة:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INITIAL_GRADES.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGrade(g.slug)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all text-right cursor-pointer ${
                      selectedGrade === g.slug
                        ? "border-purple-600 bg-purple-50 text-purple-950 shadow-xs"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{g.titleArabic}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200">
                        {g.titleEnglish}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Track & Term Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  2. مسار المنهج الدراسي:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTrack("connect")}
                    className={`flex-1 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      track === "connect"
                        ? "border-purple-600 bg-purple-50 text-purple-950 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Connect (المدارس الحكومية والرسمية)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrack("connect_plus")}
                    className={`flex-1 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      track === "connect_plus"
                        ? "border-purple-600 bg-purple-50 text-purple-950 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Connect Plus (مدارس اللغات والتجريبي)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  3. الفصل الدراسي:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTerm(1)}
                    className={`flex-1 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      term === 1
                        ? "border-purple-600 bg-purple-50 text-purple-950 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    الفصل الدراسي الأول (Term 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTerm(2)}
                    className={`flex-1 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      term === 2
                        ? "border-purple-600 bg-purple-50 text-purple-950 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    الفصل الدراسي الثاني (Term 2)
                  </button>
                </div>
              </div>
            </div>

            {/* Dropzone for PDF */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                4. رفع ملف PDF الخاص بالوحدة أو دليل المعلم:
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                  isDragging
                    ? "border-purple-600 bg-purple-50/50 scale-[1.01]"
                    : "border-slate-300 hover:border-purple-400 bg-slate-50/50"
                }`}
              >
                <input
                  type="file"
                  id="curriculum-pdf-input"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />

                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        الحجم: {(selectedFile.size / (1024 * 1024)).toFixed(2)} ميجابايت (جاهز للتحليل)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                    >
                      إلغاء واختيار ملف آخر
                    </button>
                  </div>
                ) : (
                  <label htmlFor="curriculum-pdf-input" className="cursor-pointer block space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto border border-purple-200 shadow-xs">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">
                        اسحب ملف الـ PDF هنا أو اضغط للتصفح
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        يدعم كتب الطالب، أدلة المعلم، وملازم الوزارة الرسمية (PDF حتى 50MB)
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleStartParsing(true)}
                className="w-full sm:w-auto text-purple-800 border-purple-200 hover:bg-purple-50"
              >
                <Sparkles className="w-4 h-4 me-1.5 text-amber-500" />
                <span>تجربة وحدة نموذجية من منهج الوزارة (بدون رفع ملف)</span>
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
                  إلغاء
                </Button>
                <Button
                  type="button"
                  variant="vibrant"
                  size="sm"
                  onClick={() => handleStartParsing(false)}
                  disabled={!selectedFile}
                  className="w-full sm:w-auto shadow-md shadow-purple-500/20"
                >
                  <Sparkles className="w-4 h-4 me-1.5" />
                  <span>بدء التحليل واستخراج الدروس ⚡</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: PARSING ANIMATION
        ========================================================================= */}
        {step === "parsing" && (
          <div className="py-14 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-purple-500/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-vibrant text-white flex items-center justify-center shadow-xl shadow-purple-500/30 animate-pulse">
                <Sparkles className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-black text-slate-900">
                جاري استخراج وتحليل منهج الوزارة بالذكاء الاصطناعي...
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                نقوم بقراءة نصوص الوحدات، تفريغ قوائم الكلمات والصوتيات، واستنتاج خطط الدروس والأسئلة التفاعلية التابعة للمنهج المصري.
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-2 text-right text-xs font-bold text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>قراءة بنية ملف الـ PDF...</span>
              </div>
              <div className="flex items-center gap-2 text-purple-700 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>استخراج الكلمات والصوتيات ونواتج التعلم...</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <BookOpen className="w-4 h-4" />
                <span>توليد أسئلة الاختبار النموذجي...</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: INTERACTIVE REVIEW WORKSPACE
        ========================================================================= */}
        {step === "review" && parsedData && (
          <div className="space-y-5">
            {/* Header notification */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-black">تم استخراج بيانات المنهج بنجاح! </span>
                  <span className="font-medium text-emerald-800">
                    يمكنك مراجعة وتعديل محتوى الوحدة والدروس والأسئلة قبل الاعتماد النهائي.
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-300">
                {parsedData.lessons.length} دروس • {parsedData.vocabulary.length} كلمة • {parsedData.quizQuestions.length} أسئلة
              </span>
            </div>

            {/* Quality & Validation Alert */}
            {validation && <ValidationAlert validation={validation} />}

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("unit")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === "unit"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                بيانات الوحدة العامة
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("lessons")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === "lessons"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                الدروس والمحاضرات ({parsedData.lessons.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("vocabulary")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === "vocabulary"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                الكلمات والصوتيات ({parsedData.vocabulary.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("quizzes")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === "quizzes"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                الاختبار التفاعلي ({parsedData.quizQuestions.length})
              </button>
            </div>

            {/* TAB 1: UNIT INFO */}
            {activeTab === "unit" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      عنوان الوحدة بالإنجليزية:
                    </label>
                    <input
                      type="text"
                      value={unitTitleEnglish}
                      onChange={(e) => setUnitTitleEnglish(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      عنوان الوحدة بالعربية:
                    </label>
                    <input
                      type="text"
                      value={unitTitleArabic}
                      onChange={(e) => setUnitTitleArabic(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      سعر الاشتراك المقترح (ج.م):
                    </label>
                    <input
                      type="number"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ملف الـ PDF المرفق للطلاب:
                    </label>
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-mono font-bold flex items-center gap-2 border border-slate-200">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span className="truncate">{parsedData.pdfFileName}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الوصف ونواتج التعلم:
                  </label>
                  <textarea
                    rows={3}
                    value={unitDescription}
                    onChange={(e) => setUnitDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:border-purple-600 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: LESSONS */}
            {activeTab === "lessons" && (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {parsedData.lessons.map((lesson, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 transition-all space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs font-black flex items-center justify-center">
                          {lesson.orderIndex}
                        </span>
                        <h4 className="text-xs font-black text-slate-900">{lesson.title}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          lesson.isFreePreview
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {lesson.isFreePreview ? "معاينة مجانية ✨" : "محاضرة مدفوعة 🔒"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-xl bg-purple-50/60 text-purple-900">
                        <span className="font-bold block text-purple-700">الصوتيات (Phonics):</span>
                        <span>{lesson.phonicsRule}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-indigo-50/60 text-indigo-900">
                        <span className="font-bold block text-indigo-700">القاعدة (Grammar):</span>
                        <span>{lesson.grammarPoint}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700 block">مقترح سكريبت الشرح بالفيديو:</span>
                      <span className="line-clamp-2">{lesson.suggestedVideoScriptOutline}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: VOCABULARY */}
            {activeTab === "vocabulary" && (
              <div className="max-h-80 overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {parsedData.vocabulary.map((vocab, vIdx) => (
                    <div
                      key={vIdx}
                      className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-purple-950 font-mono">
                          {vocab.word}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {vocab.arabicMeaning}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                        <span>الصوتية: {vocab.phonicsFocus}</span>
                        <span className="text-slate-400">({vocab.category})</span>
                      </div>
                      <p className="text-[11px] text-slate-600 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        &quot;{vocab.exampleSentence}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: QUIZZES */}
            {activeTab === "quizzes" && (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {parsedData.quizQuestions.map((q, qIdx) => (
                  <div
                    key={q.id || qIdx}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black text-slate-900">
                        {qIdx + 1}. {q.questionText}
                      </h5>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        {q.points} درجة
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2 rounded-xl text-[11px] font-bold border flex items-center justify-between ${
                            opt.isCorrect
                              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                              : "bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          <span>{opt.text}</span>
                          {opt.isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-500 bg-purple-50/50 p-2 rounded-xl">
                      <span className="font-bold text-purple-700">التوضيح التعليمي للطفل: </span>
                      <span>{q.explanation}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Commit / Save Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep("upload")}
              >
                العودة لتعديل الخيارات
              </Button>

              <Button
                type="button"
                variant="vibrant"
                size="sm"
                onClick={handleCommit}
                disabled={Boolean(validation && !validation.valid)}
                className="shadow-lg shadow-purple-500/25"
              >
                <Award className="w-4 h-4 me-1.5" />
                <span>اعتماد ونشر في المنهج الدراسي ({unitTitleEnglish}) 🚀</span>
              </Button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 4: SAVING PROGRESS
        ========================================================================= */}
        {step === "saving" && (
          <div className="py-14 text-center space-y-4">
            <RefreshCw className="w-12 h-12 text-purple-600 animate-spin mx-auto" />
            <h3 className="text-base font-black text-slate-900">
              جاري حفظ الوحدة وإرفاق الدروس والأسئلة في قاعدة البيانات...
            </h3>
            <p className="text-xs text-slate-500">لحظات قليلة لتكون متاحة للطلاب في البوابة الذكية.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
