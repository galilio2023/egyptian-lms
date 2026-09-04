"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import * as tus from "tus-js-client";
import { 
  Plus, 
  Trash2, 
  UploadCloud,
  AlertTriangle,
  X,
  Film,
  FileVideo,
  Pause,
  Play,
  CheckCircle2,
  Link2,
  FileText,
  Sparkles,
  RefreshCw,
  HardDrive
} from "lucide-react";
import { INITIAL_GRADES, INITIAL_UNITS, type MockUnit } from "@/lib/db/mock-data";
import { CurriculumBookSvg } from "@/components/ui/illustrated-icons";

interface VideoUploadProgressState {
  isUploading: boolean;
  isPaused: boolean;
  progress: number;
  uploadedBytes: number;
  totalBytes: number;
  uploadSpeed: string;
  statusText: string;
  videoId?: string;
  isComplete: boolean;
}

export default function AdminCurriculumPage() {
  const [units, setUnits] = useState<MockUnit[]>(INITIAL_UNITS);
  const [selectedGrade, setSelectedGrade] = useState<string>("grade-1");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingUnit, setDeletingUnit] = useState<MockUnit | null>(null);
  
  // New Unit Form State
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("250");
  const [newDesc, setNewDesc] = useState("");

  // Real Video Upload Modal State
  const [uploadTargetUnit, setUploadTargetUnit] = useState<MockUnit | null>(null);
  const [uploadMode, setUploadMode] = useState<"direct_file" | "manual_id">("direct_file");
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureDuration, setLectureDuration] = useState("45");
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [pdfAttachmentUrl, setPdfAttachmentUrl] = useState("");
  const [manualVideoId, setManualVideoId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Active TUS Upload Instance Ref
  const tusUploadRef = useRef<tus.Upload | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastLoadedRef = useRef<number>(0);

  const [uploadState, setUploadState] = useState<VideoUploadProgressState>({
    isUploading: false,
    isPaused: false,
    progress: 0,
    uploadedBytes: 0,
    totalBytes: 0,
    uploadSpeed: "0 MB/s",
    statusText: "بانتظار بدء الرفع",
    isComplete: false,
  });

  useEffect(() => {
    let active = true;
    fetch("/api/admin/actions?type=curriculum")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.curriculum && data.curriculum.length > 0) {
          setUnits(data.curriculum);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const filteredUnits = units.filter((u) => u.gradeSlug === selectedGrade);

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    const gradeObj = INITIAL_GRADES.find((g) => g.slug === selectedGrade);
    
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_unit",
          payload: {
            gradeSlug: selectedGrade,
            title: newTitle.trim(),
            priceEgp: parseInt(newPrice) || 250,
            description: newDesc.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "حدث خطأ أثناء حفظ الوحدة في قاعدة البيانات.");
        return;
      }

      const newUnit: MockUnit = {
        id: data.unit?.id || `u-${Date.now()}`,
        gradeId: gradeObj?.id || 'g-1',
        gradeSlug: selectedGrade,
        gradeTitle: gradeObj?.titleEnglish || 'Grade 1',
        title: newTitle,
        slug: data.unit?.slug || `${selectedGrade}-${newTitle.toLowerCase().replace(/\s+/g, '-')}`,
        description: newDesc || 'وحدة دراسية جديدة تم إنشاؤها.',
        priceEgp: parseInt(newPrice) || 250,
        thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60',
        lessonsCount: 0,
        quizzesCount: 0,
        isPublished: true,
      };

      setUnits([newUnit, ...units]);
      setShowAddModal(false);
      setNewTitle("");
      setNewDesc("");
      toast.success("🎉 تم حفظ ونشر الوحدة الدراسية بنجاح في قاعدة البيانات!");
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم.");
    }
  };

  // Open Upload Studio Modal for a specific unit
  const handleOpenUploadModal = (unit: MockUnit) => {
    setUploadTargetUnit(unit);
    setLectureTitle(`محاضرة جديدة - ${unit.title}`);
    setSelectedFile(null);
    setManualVideoId("");
    setPdfAttachmentUrl("");
    setIsFreePreview(false);
    setUploadState({
      isUploading: false,
      isPaused: false,
      progress: 0,
      uploadedBytes: 0,
      totalBytes: 0,
      uploadSpeed: "0 MB/s",
      statusText: "بانتظار بدء الرفع",
      isComplete: false,
    });
  };

  // Helper to format bytes to MB/GB
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    const k = 1024;
    const mb = bytes / (k * k);
    if (mb >= 1000) {
      return `${(mb / k).toFixed(2)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  // Start Resumable TUS Direct Upload
  const handleStartTusUpload = async () => {
    if (!selectedFile) {
      toast.error("يرجى اختيار ملف الفيديو أولاً.");
      return;
    }
    if (!lectureTitle.trim()) {
      toast.error("يرجى إدخال عنوان المحاضرة.");
      return;
    }
    if (!uploadTargetUnit) return;

    setUploadState((prev) => ({
      ...prev,
      isUploading: true,
      isPaused: false,
      statusText: "جاري طلب تصريح الرفع السحابي وتوليد المفاتيح المشفرة...",
      progress: 2,
    }));

    try {
      // 1. Get Authorized TUS Upload Ticket from API
      const ticketRes = await fetch("/api/admin/video/upload-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lectureTitle.trim(),
          unitId: uploadTargetUnit.id,
        }),
      });

      const ticketData = await ticketRes.json();
      if (!ticketRes.ok || !ticketData.ticket) {
        throw new Error(ticketData.error || "فشل الحصول على تذكرة الرفع من الخادم.");
      }

      const ticket = ticketData.ticket;
      lastTimeRef.current = Date.now();
      lastLoadedRef.current = 0;

      // 2. Initialize TUS Resumable Upload
      const upload = new tus.Upload(selectedFile, {
        endpoint: ticket.uploadEndpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: ticket.headers,
        chunkSize: 5 * 1024 * 1024, // 5MB chunks (optimal for Egyptian ADSL/4G)
        metadata: {
          filename: selectedFile.name,
          filetype: selectedFile.type,
          title: lectureTitle.trim(),
        },
        onError: (error) => {
          console.error("TUS upload error:", error);
          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            statusText: `توقف الرفع بسبب خطأ في الاتصال: ${error.message}`,
          }));
          toast.error(`حدث خطأ أثناء رفع الفيديو: ${error.message}`);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const now = Date.now();
          const elapsed = (now - lastTimeRef.current) / 1000;
          let speedStr = "0 MB/s";

          if (elapsed >= 1) {
            const bytesDiff = bytesUploaded - lastLoadedRef.current;
            const speedMb = bytesDiff / (1024 * 1024) / elapsed;
            speedStr = `${speedMb.toFixed(2)} MB/s`;
            lastTimeRef.current = now;
            lastLoadedRef.current = bytesUploaded;
          }

          const pct = Math.min(100, Math.round((bytesUploaded / bytesTotal) * 100));
          setUploadState((prev) => ({
            ...prev,
            progress: pct,
            uploadedBytes: bytesUploaded,
            totalBytes: bytesTotal,
            uploadSpeed: speedStr,
            statusText: `جاري الرفع السحابي المباشر (${pct}%)...`,
          }));
        },
        onSuccess: async () => {
          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            isComplete: true,
            progress: 100,
            statusText: "تم رفع الفيديو بنجاح! جاري حفظ المحاضرة في قاعدة البيانات...",
          }));

          // 3. Save Lesson Record in Platform DB
          await handleSaveLessonRecord(ticket.videoId);
        },
      });

      tusUploadRef.current = upload;

      // Check if previous upload can be resumed
      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });

    } catch (err: unknown) {
      console.error("Upload initiation error:", err);
      toast.error((err as Error)?.message || "فشل بدء عملية الرفع.");
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        statusText: "فشل بدء الرفع",
      }));
    }
  };

  // Pause / Resume TUS Upload
  const togglePauseUpload = () => {
    if (!tusUploadRef.current) return;
    if (uploadState.isPaused) {
      tusUploadRef.current.start();
      setUploadState((prev) => ({
        ...prev,
        isPaused: false,
        statusText: "تم استئناف الرفع...",
      }));
      toast.info("تم استئناف رفع الفيديو من النقطة الحالية.");
    } else {
      tusUploadRef.current.abort();
      setUploadState((prev) => ({
        ...prev,
        isPaused: true,
        statusText: "الرفع متوقف مؤقتاً (يمكنك الاستئناف في أي وقت)",
      }));
      toast.warning("تم إيقاف الرفع مؤقتاً. بياناتك محفوظة.");
    }
  };

  // Save Lesson to DB
  const handleSaveLessonRecord = async (videoIdToSave: string) => {
    if (!uploadTargetUnit) return;

    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_lesson",
          payload: {
            unitId: uploadTargetUnit.id,
            title: lectureTitle.trim(),
            videoId: videoIdToSave.trim(),
            videoDurationSeconds: (parseInt(lectureDuration) || 45) * 60,
            pdfAttachmentUrl: pdfAttachmentUrl.trim() || undefined,
            isFreePreview,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "حدث خطأ أثناء حفظ المحاضرة");
      }

      // Update local units state count
      setUnits((prev) =>
        prev.map((u) =>
          u.id === uploadTargetUnit.id
            ? { ...u, lessonsCount: (u.lessonsCount || 0) + 1 }
            : u
        )
      );

      toast.success(`🎉 تم حفظ وتشفير محاضرة (${lectureTitle}) بنجاح وإضافتها للوحدة!`);
      setTimeout(() => {
        setUploadTargetUnit(null);
      }, 1200);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "فشل حفظ المحاضرة في قاعدة البيانات.");
    }
  };

  // Handle Manual Video ID / URL Save
  const handleSaveManualVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualVideoId.trim()) {
      toast.error("يرجى إدخال معرف الفيديو Bunny Video ID أو الرابط المباشر.");
      return;
    }
    if (!lectureTitle.trim()) {
      toast.error("يرجى إدخال عنوان المحاضرة.");
      return;
    }

    await handleSaveLessonRecord(manualVideoId.trim());
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <CurriculumBookSvg className="w-8 h-8" />
            <span>إدارة المنهج والمحاضرات <span className="text-gradient-purple">(Curriculum Studio)</span></span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            إضافة وتعديل وحدات الكورس، رفع فيديوهات المحاضرات عبر Bunny Stream TUS، وإرفاق الملازم والواجبات.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-black text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة وحدة دراسية جديدة</span>
          </button>
        </div>
      </div>

      {/* Grade Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {INITIAL_GRADES.map((grade) => (
          <button
            key={grade.id}
            onClick={() => setSelectedGrade(grade.slug)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border-2 cursor-pointer ${
              selectedGrade === grade.slug
                ? "bg-gradient-vibrant text-white border-purple-500 shadow-md shadow-purple-500/20"
                : "bg-white text-slate-700 border-purple-100 hover:border-purple-300 hover:bg-purple-50"
            }`}
          >
            <span>{grade.titleEnglish}</span>
            <span className="text-[10px] opacity-80">({grade.titleArabic})</span>
          </button>
        ))}
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnits.map((unit) => (
          <div
            key={unit.id}
            className="modern-card overflow-hidden bg-white border border-slate-200 flex flex-col justify-between"
          >
            <div className="relative h-44 w-full overflow-hidden bg-slate-100">
              <img
                src={unit.thumbnailUrl}
                alt={unit.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 start-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md text-slate-900 font-bold text-xs shadow-sm border border-slate-200">
                {unit.priceEgp} ج.م
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">{unit.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{unit.description}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium py-2 border-y border-slate-100">
                <span className="flex items-center gap-1 font-bold text-purple-700">
                  <Film className="w-3.5 h-3.5" />
                  {unit.lessonsCount} فيديوهات مشفرة
                </span>
                <span>{unit.quizzesCount} اختبارات</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleOpenUploadModal(unit)}
                  className="flex-1 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-purple-600" />
                  <span>رفع فيديو للمحاضرة</span>
                </button>
                <button
                  onClick={() => setDeletingUnit(unit)}
                  className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                  title="حذف الوحدة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Real Bunny Stream Video Upload Modal */}
      {uploadTargetUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="modern-card max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-purple-200 bg-white space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-purple-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-lg text-slate-900">
                    رفع وتشفير محاضرة فيديو جديدة
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  إضافة محاضرة لوحدة: <span className="font-bold text-purple-700">{uploadTargetUnit.title}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (tusUploadRef.current && uploadState.isUploading) {
                    if (confirm("هل تريد إلغاء عملية الرفع الجارية؟")) {
                      tusUploadRef.current.abort();
                      setUploadTargetUnit(null);
                    }
                  } else {
                    setUploadTargetUnit(null);
                  }
                }}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lecture Meta Fields */}
            <div className="space-y-3.5 text-right">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">عنوان المحاضرة في جدول المنهج</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Lecture 3: Past Perfect & Comprehension"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  disabled={uploadState.isUploading}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:outline-none focus:border-purple-600 disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">المدة التقريبية (بالدقائق)</label>
                  <input
                    type="number"
                    min="1"
                    value={lectureDuration}
                    onChange={(e) => setLectureDuration(e.target.value)}
                    disabled={uploadState.isUploading}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:outline-none focus:border-purple-600 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">رابط ملزمة الشرح أو الواجب PDF (اختياري)</label>
                  <input
                    type="url"
                    dir="ltr"
                    placeholder="https://.../worksheet.pdf"
                    value={pdfAttachmentUrl}
                    onChange={(e) => setPdfAttachmentUrl(e.target.value)}
                    disabled={uploadState.isUploading}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-purple-600 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Free Preview Toggle */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFreePreview}
                  onChange={(e) => setIsFreePreview(e.target.checked)}
                  disabled={uploadState.isUploading}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-xs font-black text-purple-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    محاضرة تجريبية مجانية (Free Preview)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    السماح لجميع الطلاب بمشاهدة هذه المحاضرة مجاناً دون الحاجة لشراء الوحدة كعينة تسويقية.
                  </p>
                </div>
              </label>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 text-xs font-bold">
              <button
                type="button"
                onClick={() => setUploadMode("direct_file")}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uploadMode === "direct_file"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <HardDrive className="w-4 h-4" />
                <span>رفع ملف فيديو (TUS Resumable)</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("manual_id")}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uploadMode === "manual_id"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span>معرف Bunny جاهز أو رابط مباشر</span>
              </button>
            </div>

            {/* Tab 1: Direct File Upload */}
            {uploadMode === "direct_file" && (
              <div className="space-y-4">
                {/* File Dropzone */}
                {!uploadState.isUploading && !uploadState.isComplete && (
                  <div className="border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-2xl p-6 text-center bg-purple-50/40 transition-colors">
                    <input
                      type="file"
                      id="bunny-file-input"
                      accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="bunny-file-input"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {selectedFile ? selectedFile.name : "اضغط لاختيار ملف الفيديو من جهازك أو اسحبه هنا"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {selectedFile
                          ? `حجم الملف: ${formatBytes(selectedFile.size)}`
                          : "يدعم MP4, MKV, MOV حتى 5 جيجابايت مع إمكانية استئناف الرفع عند انقطاع الإنترنت"}
                      </span>
                    </label>
                  </div>
                )}

                {/* Live Upload Progress Card */}
                {(uploadState.isUploading || uploadState.isComplete) && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-purple-100 space-y-3 text-right">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {uploadState.isComplete ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-in zoom-in-50" />
                        ) : (
                          <RefreshCw className="w-4 h-4 text-purple-600 animate-spin" />
                        )}
                        <span className="font-bold text-slate-900">{uploadState.statusText}</span>
                      </div>
                      <span className="font-mono font-bold text-purple-700">{uploadState.progress}%</span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-vibrant transition-all duration-300 rounded-full"
                        style={{ width: `${uploadState.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>
                        {formatBytes(uploadState.uploadedBytes)} / {formatBytes(uploadState.totalBytes)}
                      </span>
                      <span>السرعة: {uploadState.uploadSpeed}</span>
                    </div>

                    {uploadState.isUploading && (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={togglePauseUpload}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          {uploadState.isPaused ? (
                            <>
                              <Play className="w-3.5 h-3.5 text-emerald-600" />
                              <span>استئناف الرفع</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-3.5 h-3.5 text-amber-600" />
                              <span>إيقاف مؤقت</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Action Button */}
                {!uploadState.isUploading && !uploadState.isComplete && (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setUploadTargetUnit(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleStartTusUpload}
                      disabled={!selectedFile}
                      className="px-6 py-2.5 rounded-xl bg-gradient-vibrant hover:scale-[1.02] text-white font-black text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>بدء الرفع والتشفير السحابي</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Manual Bunny Video GUID or External Link */}
            {uploadMode === "manual_id" && (
              <form onSubmit={handleSaveManualVideo} className="space-y-4">
                <div className="space-y-1 text-right">
                  <label className="text-xs font-bold text-slate-700">معرف فيديو Bunny Stream (GUID) أو رابط HLS مباشر</label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    placeholder="مثال: 7f3b890a-1122-3344-5566-778899aabbcc أو https://.../playlist.m3u8"
                    value={manualVideoId}
                    onChange={(e) => setManualVideoId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-purple-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    يمكنك جلب الـ Video ID مباشرة من لوحة تحكم Bunny.net Stream دون الحاجة لإعادة رفع الملف.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUploadTargetUnit(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    حفظ وربط المحاضرة الآن
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in-50">
          <div className="modern-card max-w-lg w-full p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900">إضافة وحدة دراسية جديدة ({selectedGrade.toUpperCase()})</h3>
            
            <form onSubmit={handleCreateUnit} className="space-y-3.5">
              <div className="space-y-1 text-right">
                <label className="text-xs font-semibold text-slate-700">عنوان الوحدة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Unit 3: Daily Habits & Grammar"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1 text-right">
                <label className="text-xs font-semibold text-slate-700">سعر الوحدة بالجنيه المصري (EGP)</label>
                <input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1 text-right">
                <label className="text-xs font-semibold text-slate-700">وصف محتوى الوحدة</label>
                <textarea
                  rows={3}
                  placeholder="أدخل ملخص ما يتعلمه الطالب في هذه الوحدة..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  حفظ ونشر الوحدة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="modern-card max-w-sm w-full p-6 rounded-3xl border-2 border-rose-200 bg-white space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">تأكيد حذف الوحدة الدراسية</h3>
              <p className="text-xs text-slate-500 mt-1">
                هل أنت متأكد من رغبتك في حذف وحدة ({deletingUnit.title})؟ لن يتمكن الطلاب من الوصول إليها بعد الحذف.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUnit(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch("/api/admin/actions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "delete_unit",
                        payload: { unitId: deletingUnit.id },
                      }),
                    });
                    setUnits(units.filter((u) => u.id !== deletingUnit.id));
                    toast.success(`تم حذف وحدة (${deletingUnit.title}) بنجاح من قاعدة البيانات.`);
                  } catch {
                    toast.error("حدث خطأ أثناء حذف الوحدة.");
                  } finally {
                    setDeletingUnit(null);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
