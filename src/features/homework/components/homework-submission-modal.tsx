"use client";

import React from "react";
import { UploadCloud, BookOpen, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { MockHomeworkAssignment, MockHomeworkSubmission } from "@/lib/db/mock-data";
import { useHomeworkSubmission } from "../hooks/use-homework-submission";
import { SubmissionFilePicker } from "./submission-file-picker";
import { SubmissionThumbnailGrid } from "./submission-thumbnail-grid";
import { GradedFeedbackCard } from "./graded-feedback-card";
import { VoiceNoteRecorder } from "./voice-note-recorder";

export interface HomeworkSubmissionModalProps {
  assignment: MockHomeworkAssignment;
  existingSubmission?: MockHomeworkSubmission;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (submission: MockHomeworkSubmission) => void;
}

export function HomeworkSubmissionModal({
  assignment,
  existingSubmission,
  isOpen,
  onClose,
  onSubmitSuccess,
}: HomeworkSubmissionModalProps) {
  const {
    images,
    audioVoiceNoteUrl,
    setAudioVoiceNoteUrl,
    isSubmitting,
    viewAnnotatedModal,
    setViewAnnotatedModal,
    handleFileChange,
    handleRemoveImage,
    handleSubmit,
  } = useHomeworkSubmission({
    assignment,
    existingSubmission,
    onSubmitSuccess,
    onClose,
  });

  const isGraded = existingSubmission?.status === "graded";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="xl"
        icon={<BookOpen className="w-6 h-6 text-purple-600" />}
        title={
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-black">
              {assignment.pageNumber}
            </span>
            <span>كراسة الواجب والمهام المنزلية</span>
          </div>
        }
        description={assignment.title}
      >
        <div className="space-y-5">
          {/* Instructions Box */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1 text-right">
            <span className="font-black block text-amber-900">تعليمات مستر أحمد:</span>
            <p className="leading-relaxed font-medium">{assignment.instructions}</p>
          </div>

          {/* Graded Feedback Card */}
          {isGraded && existingSubmission && (
            <GradedFeedbackCard
              submission={existingSubmission}
              onViewAnnotated={() => setViewAnnotatedModal(true)}
            />
          )}

          {/* Upload and Submit Form */}
          {!isGraded && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <SubmissionFilePicker
                onFileChange={handleFileChange}
                isSubmitting={isSubmitting}
              />

              <SubmissionThumbnailGrid
                images={images}
                onRemove={handleRemoveImage}
                disabled={isSubmitting}
              />

              {/* Voice Note Oral Phonics / Reading Component */}
              <VoiceNoteRecorder
                audioUrl={audioVoiceNoteUrl}
                onAudioChange={setAudioVoiceNoteUrl}
                disabled={isSubmitting}
              />

              <Button
                type="submit"
                variant="vibrant"
                size="lg"
                disabled={isSubmitting || (images.length === 0 && !audioVoiceNoteUrl)}
                isLoading={isSubmitting}
                className="w-full shadow-lg shadow-purple-600/25"
              >
                <UploadCloud className="w-4 h-4" />
                <span>تسليم الواجب الآن لمعلم المادة 🚀</span>
              </Button>
            </form>
          )}
        </div>
      </Modal>

      {/* Pop-up view for corrected annotated image */}
      {viewAnnotatedModal && existingSubmission?.annotatedImages && (
        <Modal
          isOpen={viewAnnotatedModal}
          onClose={() => setViewAnnotatedModal(false)}
          maxWidth="3xl"
          title="تصحيح مستر أحمد عبد الرحمن ✓"
        >
          <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-950 rounded-2xl p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={existingSubmission.annotatedImages[0]?.dataUrl}
              alt="كراسة الواجب المصححة"
              className="max-h-[70vh] rounded-xl object-contain"
            />
          </div>
        </Modal>
      )}
    </>
  );
}
