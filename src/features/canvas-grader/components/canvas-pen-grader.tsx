"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCanvasDrawing } from "../hooks/use-canvas-drawing";
import { GraderHeader } from "./grader-header";
import { GraderToolbar } from "./grader-toolbar";
import { GraderSidebar } from "./grader-sidebar";
import { GraderPagination } from "./grader-pagination";
import type { ToolType, CanvasPenGraderProps } from "../types";

export function CanvasPenGrader({
  submission,
  isOpen,
  hasNextSubmission = false,
  onClose,
  onSaveGrade,
}: CanvasPenGraderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentTool, setCurrentTool] = useState<ToolType>("pen");
  const [brushColor, setBrushColor] = useState("#dc2626");
  const [brushSize, setBrushSize] = useState(4);
  const [score, setScore] = useState<number>(submission.score ?? submission.maxScore);
  const [feedbackNotes, setFeedbackNotes] = useState(
    submission.feedbackNotes || "أحسنت يا بطل! خط جميل وإجابات نموذجية ممتازة 🌟👏"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedAnnotations, setSavedAnnotations] = useState<Record<number, string>>({});

  const totalPages = Math.max(1, submission.studentImages.length);
  const currentImage = submission.studentImages[currentPageIndex];

  const {
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleUndo,
    handleClearPage,
  } = useCanvasDrawing({
    currentPageIndex,
    imageUrl: currentImage?.imageUrl,
    isOpen,
    currentTool,
    brushColor,
    brushSize,
  });

  const handleSaveAndNotify = async (advanceNext = false) => {
    setIsSaving(true);
    try {
      const annotatedImages: Array<{ pageIndex: number; dataUrl: string }> = [];
      
      Object.entries(savedAnnotations)
        .sort(([leftIndex], [rightIndex]) => Number(leftIndex) - Number(rightIndex))
        .forEach(([indexStr, dataUrl]) => {
          const idx = parseInt(indexStr, 10);
          if (idx !== currentPageIndex) {
            annotatedImages.push({ pageIndex: idx, dataUrl });
          }
        });

      const canvas = canvasRef.current;
      if (canvas) {
        annotatedImages.push({
          pageIndex: currentPageIndex,
          dataUrl: canvas.toDataURL("image/jpeg", 0.85),
        });
      }

      annotatedImages.sort((left, right) => left.pageIndex - right.pageIndex);

      if (onSaveGrade) {
        const saved = await onSaveGrade(
          {
            submissionId: submission.id,
            score,
            feedbackNotes,
            annotatedImages,
          },
          advanceNext
        );

        if (!saved) {
          toast.error("فشل حفظ التصحيح ورصد الدرجة.");
          return;
        }
      }

      toast.success("✅ تم حفظ تصحيح كراسة الواجب ورصد الدرجة بنجاح!");
      if (!advanceNext) {
        onClose();
      }
    } catch {
      toast.error("حدث خطأ أثناء حفظ التصحيح.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in-50">
      <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        <GraderHeader
          submission={submission}
          score={score}
          feedbackNotes={feedbackNotes}
          isSaving={isSaving}
          onSave={handleSaveAndNotify}
          onClose={onClose}
        />

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Main Drawing & Canvas View */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col bg-slate-950/60 overflow-hidden border-e border-slate-800">
            <GraderToolbar
              currentTool={currentTool}
              brushColor={brushColor}
              onSelectPen={(color, size) => {
                setCurrentTool("pen");
                setBrushColor(color);
                setBrushSize(size);
              }}
              onSelectTool={setCurrentTool}
              onUndo={handleUndo}
              onClear={handleClearPage}
            />

            {/* Canvas Scrollable Viewport */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/80">
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

            <GraderPagination
              currentPageIndex={currentPageIndex}
              totalPages={totalPages}
              onPageChange={(newIndex) => {
                const canvas = canvasRef.current;
                if (canvas) {
                  setSavedAnnotations((prev) => ({
                    ...prev,
                    [currentPageIndex]: canvas.toDataURL("image/jpeg", 0.85),
                  }));
                }
                setCurrentPageIndex(newIndex);
              }}
            />
          </div>

          {/* Right Grading & Feedback Sidebar */}
          <GraderSidebar
            submission={submission}
            score={score}
            feedbackNotes={feedbackNotes}
            isSaving={isSaving}
            totalPages={totalPages}
            hasNextSubmission={hasNextSubmission}
            onChangeScore={setScore}
            onChangeNotes={setFeedbackNotes}
            onSave={() => handleSaveAndNotify(false)}
            onSaveNext={() => handleSaveAndNotify(true)}
          />
        </div>
      </div>
    </div>
  );
}
