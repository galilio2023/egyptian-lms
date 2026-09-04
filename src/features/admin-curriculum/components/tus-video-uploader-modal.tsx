"use client";

import React from "react";
import { UploadCloud, Link2, Sparkles } from "lucide-react";
import { type MockUnit } from "@/lib/db/mock-data";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useTusVideoUpload } from "../hooks/use-tus-video-upload";
import { LessonDetailsForm } from "./lesson-details-form";
import { UploadDropzone } from "./upload-dropzone";
import { UploadProgressTracker } from "./upload-progress-tracker";
import { ManualVideoIdForm } from "./manual-video-id-form";

export interface TusVideoUploaderModalProps {
  unit: MockUnit | null;
  onClose: () => void;
  onSuccess: (unitId: string) => void;
}

export const TusVideoUploaderModal: React.FC<TusVideoUploaderModalProps> = ({
  unit,
  onClose,
  onSuccess,
}) => {
  const {
    uploadMode,
    setUploadMode,
    lectureTitle,
    setLectureTitle,
    lectureDuration,
    setLectureDuration,
    isFreePreview,
    setIsFreePreview,
    pdfAttachmentUrl,
    setPdfAttachmentUrl,
    manualVideoId,
    setManualVideoId,
    selectedFile,
    setSelectedFile,
    uploadState,
    formatBytes,
    handleStartTusUpload,
    togglePauseUpload,
    handleSaveManualVideo,
  } = useTusVideoUpload({ unit, onClose, onSuccess });

  if (!unit) return null;

  return (
    <Modal
      isOpen={Boolean(unit)}
      onClose={onClose}
      maxWidth="3xl"
      icon={<UploadCloud className="w-6 h-6 text-purple-600" />}
      title="رفع محاضرة جديدة عبر Bunny Stream TUS"
      description={`الوحدة الدراسية: ${unit.title} (${unit.gradeTitle})`}
    >
      <div className="space-y-6">
        {/* Mode Switcher */}
        <div className="flex rounded-2xl bg-purple-50/70 p-1.5 border border-purple-100">
          <button
            type="button"
            onClick={() => setUploadMode("direct_file")}
            className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              uploadMode === "direct_file"
                ? "bg-white text-purple-900 shadow-sm border border-purple-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>رفع ملف فيديو مباشر (TUS Resumable)</span>
          </button>

          <button
            type="button"
            onClick={() => setUploadMode("manual_id")}
            className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              uploadMode === "manual_id"
                ? "bg-white text-purple-900 shadow-sm border border-purple-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>ربط بمعرف فيديو موجود (Video ID)</span>
          </button>
        </div>

        {/* Lesson Details Form */}
        <LessonDetailsForm
          lectureTitle={lectureTitle}
          onLectureTitleChange={setLectureTitle}
          lectureDuration={lectureDuration}
          onLectureDurationChange={setLectureDuration}
          isFreePreview={isFreePreview}
          onIsFreePreviewChange={setIsFreePreview}
          pdfAttachmentUrl={pdfAttachmentUrl}
          onPdfAttachmentUrlChange={setPdfAttachmentUrl}
          disabled={uploadState.isUploading}
        />

        {/* Upload Mode 1: Direct File */}
        {uploadMode === "direct_file" ? (
          <div className="space-y-4">
            <UploadDropzone
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              formatBytes={formatBytes}
              disabled={uploadState.isUploading}
            />

            <UploadProgressTracker
              uploadState={uploadState}
              formatBytes={formatBytes}
              onTogglePause={togglePauseUpload}
            />

            {!uploadState.isUploading && !uploadState.isComplete && (
              <Button
                type="button"
                variant="vibrant"
                size="lg"
                disabled={!selectedFile || !lectureTitle.trim()}
                onClick={handleStartTusUpload}
                className="w-full shadow-lg shadow-purple-600/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>بدء الرفع السحابي المشفر الآن</span>
              </Button>
            )}
          </div>
        ) : (
          <ManualVideoIdForm
            manualVideoId={manualVideoId}
            onManualVideoIdChange={setManualVideoId}
            onSubmit={handleSaveManualVideo}
          />
        )}
      </div>
    </Modal>
  );
};
