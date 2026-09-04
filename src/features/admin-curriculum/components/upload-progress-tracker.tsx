import React from "react";
import { Pause, Play, CheckCircle2, RefreshCw } from "lucide-react";
import type { VideoUploadProgressState } from "../hooks/use-tus-video-upload";

export interface UploadProgressTrackerProps {
  uploadState: VideoUploadProgressState;
  formatBytes: (bytes: number) => string;
  onTogglePause: () => void;
}

export const UploadProgressTracker: React.FC<UploadProgressTrackerProps> = ({
  uploadState,
  formatBytes,
  onTogglePause,
}) => {
  const {
    isUploading,
    isPaused,
    progress,
    uploadedBytes,
    totalBytes,
    uploadSpeed,
    statusText,
    isComplete,
  } = uploadState;

  if (!isUploading && !isComplete && progress === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200 space-y-3 text-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <RefreshCw className={`w-4 h-4 text-purple-600 ${isUploading && !isPaused ? "animate-spin" : ""}`} />
          )}
          <span className="text-xs font-black text-slate-800">{statusText}</span>
        </div>

        <div className="flex items-center gap-2">
          {isUploading && (
            <button
              type="button"
              onClick={onTogglePause}
              className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-800 text-xs font-bold hover:bg-purple-100 flex items-center gap-1 transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              <span>{isPaused ? "استئناف الرفع" : "إيقاف مؤقت"}</span>
            </button>
          )}

          <span className="text-sm font-black text-purple-900 font-mono">
            {progress}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-purple-200/60 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isComplete
              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
              : isPaused
              ? "bg-amber-500"
              : "bg-gradient-vibrant"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium font-mono">
        <span>السرعة: <strong className="text-purple-700 font-black">{uploadSpeed}</strong></span>
        <span>
          {formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}
        </span>
      </div>
    </div>
  );
};
