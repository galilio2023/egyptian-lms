"use client";

import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  RotateCw, 
  Gauge 
} from "lucide-react";

interface VideoBottomControlsProps {
  visible: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  quality: string;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSkipTime: (seconds: number) => void;
  onCycleSpeed: () => void;
  onToggleQuality: () => void;
  onToggleFullScreen: () => void;
}

function formatTime(secs: number) {
  const mins = Math.floor(secs / 60);
  const remainder = Math.floor(secs % 60);
  return `${mins}:${remainder.toString().padStart(2, "0")}`;
}

export function VideoBottomControls({
  visible,
  isPlaying,
  isMuted,
  progress,
  currentTime,
  duration,
  playbackSpeed,
  quality,
  onTogglePlay,
  onToggleMute,
  onSeek,
  onSkipTime,
  onCycleSpeed,
  onToggleQuality,
  onToggleFullScreen,
}: VideoBottomControlsProps) {
  return (
    <div
      className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white z-20 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Progress Bar */}
      <div className="w-full mb-3 flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="100"
          value={progress || 0}
          onChange={onSeek}
          className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onTogglePlay}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
            aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
          </button>

          {/* -10s Rewind */}
          <button
            type="button"
            onClick={() => onSkipTime(-10)}
            className="px-2 py-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold"
            title="تراجع 10 ثوانٍ"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>-10s</span>
          </button>

          {/* +10s Forward */}
          <button
            type="button"
            onClick={() => onSkipTime(10)}
            className="px-2 py-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold"
            title="تقديم 10 ثوانٍ"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>+10s</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
            aria-label="الصوت"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <span className="text-xs font-mono text-slate-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Playback Speed Selector */}
          <button
            type="button"
            onClick={onCycleSpeed}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold font-mono transition-colors flex items-center gap-1 cursor-pointer"
            title="تغيير سرعة الشرح (بطيء / سريع)"
          >
            <Gauge className="w-3.5 h-3.5 text-amber-300" />
            <span>{playbackSpeed}x</span>
          </button>

          {/* Quality Pill */}
          <button
            type="button"
            onClick={onToggleQuality}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold font-mono transition-colors cursor-pointer"
            title="تغيير جودة الفيديو"
          >
            {quality}
          </button>

          <button
            type="button"
            onClick={onToggleFullScreen}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
            aria-label="شاشة كاملة"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
