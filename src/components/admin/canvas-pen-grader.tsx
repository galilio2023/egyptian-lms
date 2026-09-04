"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  Check, 
  X, 
  Star, 
  RotateCcw, 
  Save, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Eraser,
  Highlighter,
  PenTool,
  MessageCircle
} from "lucide-react";
import type { MockHomeworkSubmission } from "@/lib/db/mock-data";

interface CanvasPenGraderProps {
  submission: MockHomeworkSubmission;
  isOpen: boolean;
  onClose: () => void;
  onSaveGrade?: (data: {
    submissionId: string;
    score: number;
    feedbackNotes: string;
    annotatedImages: Array<{ pageIndex: number; dataUrl: string }>;
  }) => void;
}

type ToolType = "pen" | "highlighter" | "check" | "cross" | "star" | "eraser";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  tool: ToolType;
  color: string;
  size: number;
  points: Point[];
  stampPosition?: Point;
}

export function CanvasPenGrader({
  submission,
  isOpen,
  onClose,
  onSaveGrade,
}: CanvasPenGraderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentTool, setCurrentTool] = useState<ToolType>("pen");
  const [brushColor, setBrushColor] = useState("#dc2626"); // Red default for teacher pen
  const [brushSize, setBrushSize] = useState(4);
  const [score, setScore] = useState<number>(submission.score ?? submission.maxScore);
  const [feedbackNotes, setFeedbackNotes] = useState(
    submission.feedbackNotes || "أحسنت يا بطل! خط جميل وإجابات نموذجية ممتازة 🌟👏"
  );
  const [isSaving, setIsSaving] = useState(false);

  // Per-page stroke history for undo/redo
  const [pageStrokes, setPageStrokes] = useState<Record<number, Stroke[]>>({});
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<Stroke | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);

  const totalPages = submission.studentImages.length;
  const currentImage = submission.studentImages[currentPageIndex];

  // Load current page background image into canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw base student uploaded notebook image
    if (backgroundImageRef.current && backgroundImageRef.current.complete) {
      ctx.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);
    }

    // 2. Draw existing strokes on this page
    const strokes = pageStrokes[currentPageIndex] || [];
    strokes.forEach((stroke) => {
      if (stroke.tool === "check" || stroke.tool === "cross" || stroke.tool === "star") {
        if (!stroke.stampPosition) return;
        ctx.save();
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (stroke.tool === "check") {
          ctx.fillStyle = "#16a34a"; // Green Check
          ctx.fillText("✓ ممتاز", stroke.stampPosition.x, stroke.stampPosition.y);
        } else if (stroke.tool === "cross") {
          ctx.fillStyle = "#dc2626"; // Red Cross
          ctx.fillText("✗ يحتاج إعادة", stroke.stampPosition.x, stroke.stampPosition.y);
        } else if (stroke.tool === "star") {
          ctx.fillStyle = "#f59e0b"; // Gold Star
          ctx.fillText("⭐ 10/10", stroke.stampPosition.x, stroke.stampPosition.y);
        }
        ctx.restore();
        return;
      }

      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.strokeStyle = stroke.tool === "highlighter" ? "rgba(250, 204, 21, 0.45)" : stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (stroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
      } else {
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.stroke();
      ctx.restore();
    });
  }, [currentPageIndex, pageStrokes]);

  // Load new background image when page changes
  useEffect(() => {
    if (!isOpen || !currentImage) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentImage.imageUrl;
    img.onload = () => {
      backgroundImageRef.current = img;
      if (canvasRef.current) {
        canvasRef.current.width = 800;
        canvasRef.current.height = Math.round((img.naturalHeight / img.naturalWidth) * 800) || 1000;
      }
      redrawCanvas();
    };
  }, [isOpen, currentImage, redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [pageStrokes, redrawCanvas]);

  if (!isOpen) return null;

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const getTouchCoords = (e: React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas || !e.touches[0]) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (currentTool === "check" || currentTool === "cross" || currentTool === "star") {
      const newStroke: Stroke = {
        tool: currentTool,
        color: brushColor,
        size: brushSize,
        points: [coords],
        stampPosition: coords,
      };
      setPageStrokes((prev) => ({
        ...prev,
        [currentPageIndex]: [...(prev[currentPageIndex] || []), newStroke],
      }));
      return;
    }

    setIsDrawing(true);
    currentStrokeRef.current = {
      tool: currentTool,
      color: brushColor,
      size: currentTool === "highlighter" ? 18 : brushSize,
      points: [coords],
    };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getTouchCoords(e);

    if (currentTool === "check" || currentTool === "cross" || currentTool === "star") {
      const newStroke: Stroke = {
        tool: currentTool,
        color: brushColor,
        size: brushSize,
        points: [coords],
        stampPosition: coords,
      };
      setPageStrokes((prev) => ({
        ...prev,
        [currentPageIndex]: [...(prev[currentPageIndex] || []), newStroke],
      }));
      return;
    }

    setIsDrawing(true);
    currentStrokeRef.current = {
      tool: currentTool,
      color: brushColor,
      size: currentTool === "highlighter" ? 18 : brushSize,
      points: [coords],
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    const coords = getCanvasCoords(e);
    currentStrokeRef.current.points.push(coords);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const pts = currentStrokeRef.current.points;
    if (pts.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.strokeStyle = currentStrokeRef.current.tool === "highlighter" ? "rgba(250, 204, 21, 0.45)" : currentStrokeRef.current.color;
      ctx.lineWidth = currentStrokeRef.current.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.restore();
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    const coords = getTouchCoords(e);
    currentStrokeRef.current.points.push(coords);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const pts = currentStrokeRef.current.points;
    if (pts.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.strokeStyle = currentStrokeRef.current.tool === "highlighter" ? "rgba(250, 204, 21, 0.45)" : currentStrokeRef.current.color;
      ctx.lineWidth = currentStrokeRef.current.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.restore();
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentStrokeRef.current) return;
    setIsDrawing(false);
    const completedStroke = currentStrokeRef.current;
    currentStrokeRef.current = null;

    setPageStrokes((prev) => ({
      ...prev,
      [currentPageIndex]: [...(prev[currentPageIndex] || []), completedStroke],
    }));
  };

  const handleUndo = () => {
    setPageStrokes((prev) => {
      const current = prev[currentPageIndex] || [];
      if (current.length === 0) return prev;
      return {
        ...prev,
        [currentPageIndex]: current.slice(0, current.length - 1),
      };
    });
  };

  const handleClearPage = () => {
    setPageStrokes((prev) => ({
      ...prev,
      [currentPageIndex]: [],
    }));
  };

  const handleSaveAndNotify = async () => {
    setIsSaving(true);
    try {
      const annotatedImages: Array<{ pageIndex: number; dataUrl: string }> = [];
      const canvas = canvasRef.current;
      if (canvas) {
        annotatedImages.push({
          pageIndex: currentPageIndex,
          dataUrl: canvas.toDataURL("image/jpeg", 0.85),
        });
      }

      if (onSaveGrade) {
        onSaveGrade({
          submissionId: submission.id,
          score,
          feedbackNotes,
          annotatedImages,
        });
      }

      toast.success("✅ تم حفظ تصحيح كراسة الواجب ورصد الدرجة بنجاح!");
      onClose();
    } catch {
      toast.error("حدث خطأ أثناء حفظ التصحيح.");
    } finally {
      setIsSaving(false);
    }
  };

  const cleanParentPhone = submission.parentPhone.replace(/\D/g, "");
  const whatsappMsg = encodeURIComponent(
    `🌟 *تقرير تصحيح كراسة الواجب - أكاديمية إيليت*\n` +
    `👤 *اسم البطل:* ${submission.studentName}\n` +
    `📝 *الواجب:* ${submission.assignmentTitle}\n` +
    `🎯 *الدرجة:* ${score} من ${submission.maxScore}\n` +
    `✍️ *ملاحظات مستر أحمد عبد الرحمن:* ${feedbackNotes}\n` +
    `يمكنكم الآن الدخول لحساب الطالب لرؤية كراسة الواجب مع علامات التصحيح بالقلم الأحمر 📜👏`
  );
  const whatsappUrl = `https://wa.me/2${cleanParentPhone}?text=${whatsappMsg}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in-50">
      <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                {submission.gradeTitle}
              </span>
              <h2 className="text-lg font-black text-white">
                تصحيح كراسة الواجب: {submission.studentName}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {submission.assignmentTitle} • ولي الأمر: {submission.parentPhone}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>إشعار ولي الأمر (واتساب)</span>
            </a>

            <button
              onClick={handleSaveAndNotify}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "جاري الحفظ..." : "اعتماد التصحيح والدرجة"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace: Tool Toolbar + Canvas Area + Right Grading Sidebar */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Main Drawing & Canvas View */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col bg-slate-950/60 overflow-hidden border-e border-slate-800">
            
            {/* Annotation Floating Toolbar */}
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
                
                {/* Red Pen */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTool("pen");
                    setBrushColor("#dc2626");
                    setBrushSize(4);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    currentTool === "pen" && brushColor === "#dc2626"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>القلم الأحمر</span>
                </button>

                {/* Highlighter */}
                <button
                  type="button"
                  onClick={() => setCurrentTool("highlighter")}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    currentTool === "highlighter"
                      ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/30"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>تحديد فسفوري</span>
                </button>

                {/* Check Stamp */}
                <button
                  type="button"
                  onClick={() => setCurrentTool("check")}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                    currentTool === "check"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "text-emerald-400 hover:bg-slate-700"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ختم ✓ ممتاز</span>
                </button>

                {/* Cross Stamp */}
                <button
                  type="button"
                  onClick={() => setCurrentTool("cross")}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                    currentTool === "cross"
                      ? "bg-rose-700 text-white shadow-md shadow-rose-700/30"
                      : "text-rose-400 hover:bg-slate-700"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>ختم ✗ خطأ</span>
                </button>

                {/* Star Stamp */}
                <button
                  type="button"
                  onClick={() => setCurrentTool("star")}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                    currentTool === "star"
                      ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30"
                      : "text-amber-400 hover:bg-slate-700"
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>⭐ 10/10</span>
                </button>

                {/* Eraser */}
                <button
                  type="button"
                  onClick={() => setCurrentTool("eraser")}
                  className={`p-1.5 rounded-xl transition-all ${
                    currentTool === "eraser"
                      ? "bg-slate-600 text-white"
                      : "text-slate-400 hover:bg-slate-700"
                  }`}
                  title="ممحاة"
                >
                  <Eraser className="w-4 h-4" />
                </button>
              </div>

              {/* Undo & Clear */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUndo}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تراجع خطوة</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearPage}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-rose-300 font-medium"
                >
                  مسح كل العلامات
                </button>
              </div>
            </div>

            {/* Canvas Scrollable Viewport */}
            <div 
              ref={containerRef}
              className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/80"
            >
              <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-700 cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                  onTouchCancel={handleMouseUp}
                  className="max-w-full max-h-[68vh] object-contain block bg-white touch-none"
                />
              </div>
            </div>

            {/* Page Pagination Bottom Bar */}
            {totalPages > 1 && (
              <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4 text-xs font-bold text-slate-300">
                <button
                  type="button"
                  onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                  disabled={currentPageIndex === 0}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span>صفحة {currentPageIndex + 1} من {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPageIndex === totalPages - 1}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right Grading & Feedback Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 p-5 bg-slate-850 flex flex-col justify-between space-y-6 overflow-y-auto">
            
            <div className="space-y-5">
              
              {/* Score Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 flex items-center justify-between">
                  <span>درجة الكراسة المكتسبة</span>
                  <span className="text-purple-400">الدرجة العظمى: {submission.maxScore}</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={submission.maxScore}
                    value={score}
                    onChange={(e) => setScore(Math.min(submission.maxScore, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-24 px-4 py-2.5 rounded-2xl bg-slate-900 border-2 border-purple-500/50 text-white font-black text-2xl text-center focus:outline-none focus:border-purple-400"
                  />
                  <span className="text-slate-400 font-black text-lg">من {submission.maxScore}</span>
                  
                  {score === submission.maxScore && (
                    <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 text-xs font-black flex items-center gap-1 border border-amber-500/30">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>درجة نهائية!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback Note */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300">
                  ملاحظات وتوجيهات المعلم للطفل
                </label>
                <textarea
                  rows={4}
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="اكتب تشجيعاً أو ملاحظة صوتية حول تنظيم الخط..."
                  className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 text-xs leading-relaxed focus:outline-none focus:border-purple-500 font-medium resize-none"
                />
              </div>

              {/* Quick Preset Feedback Pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-bold block">عبارات تشجيع سريعة:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "خط ممتاز ومنظم جداً يا بطل! 🌟",
                    "أحسنت مع التنبيه على المسافات بين الكلمات 👍",
                    "بطل الأكاديمية الأول! استمر في التألق 🔥",
                  ].map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFeedbackNotes(phrase)}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 transition-colors text-right cursor-pointer"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Metadata Card */}
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>تاريخ الرفع:</span>
                  <span className="font-bold text-slate-200">{submission.submittedAt}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>عدد الصفحات:</span>
                  <span className="font-bold text-slate-200">{totalPages} صفحات</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>رقم الطالب:</span>
                  <span className="font-mono font-bold text-indigo-400">{submission.studentPhone}</span>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={handleSaveAndNotify}
                disabled={isSaving}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات ورصد النقاط</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
