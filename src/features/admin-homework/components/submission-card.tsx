"use client";

import React from "react";
import { CheckCircle2, Clock, PenTool, MessageCircle } from "lucide-react";
import type { MockHomeworkSubmission } from "../types";

export interface SubmissionCardProps {
  submission: MockHomeworkSubmission;
  onOpenGrader: (submission: MockHomeworkSubmission) => void;
}

export const SubmissionCard: React.FC<SubmissionCardProps> = ({
  submission,
  onOpenGrader,
}) => {
  const isGraded = submission.status === "graded";
  const firstImg = submission.studentImages[0]?.imageUrl;

  return (
    <div className="modern-card p-5 bg-white/95 backdrop-blur-md border-2 border-purple-100/80 rounded-3xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group">
      <div className="space-y-3">
        {/* Status Badge & Time */}
        <div className="flex items-center justify-between">
          <span
            className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 ${
              isGraded
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
            }`}
          >
            {isGraded ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>
              {isGraded
                ? `تم التصحيح (${submission.score}/${submission.maxScore})`
                : "بانتظار التصحيح"}
            </span>
          </span>

          <span className="text-[11px] text-slate-400 font-medium">
            {submission.submittedAt}
          </span>
        </div>

        {/* Notebook Thumbnail Preview */}
        {firstImg && (
          <div
            onClick={() => onOpenGrader(submission)}
            className="relative aspect-video rounded-2xl overflow-hidden border border-purple-200 group-hover:border-purple-500 cursor-pointer transition-all shadow-inner bg-slate-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={firstImg}
              alt={submission.assignmentTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3 text-white">
              <span className="text-xs font-black flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-amber-400" />
                <span>فتح أداة التصحيح بالقلم ({submission.studentImages.length} صفحات)</span>
              </span>
            </div>
          </div>
        )}

        {/* Student Info */}
        <div>
          <h3 className="font-black text-sm text-slate-900 line-clamp-1">
            {submission.studentName}
          </h3>
          <p className="text-xs text-purple-700 font-bold mt-0.5 line-clamp-1">
            {submission.assignmentTitle}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {submission.gradeTitle} • هاتف: <bdi dir="ltr">{submission.studentPhone}</bdi>
          </p>
        </div>

        {/* Feedback snippet if graded */}
        {isGraded && submission.feedbackNotes && (
          <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-[11px] text-purple-950 line-clamp-2 font-medium">
            <span className="font-bold">ملاحظة المعلم: </span>
            {submission.feedbackNotes}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onOpenGrader(submission)}
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
          href={`https://wa.me/2${submission.parentPhone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
          title="مراسلة ولي الأمر على واتساب"
        >
          <MessageCircle className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
