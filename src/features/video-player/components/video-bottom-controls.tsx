"use client";

import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  RotateCw, 
  Gauge,
  Wifi
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
  isDataSaver?: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSkipTime: (seconds: number) => void;
  onCycleSpeed: () => void;
  onToggleQuality: () => void;
  onToggleDataSaver?: () => void;
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
  isDataSaver = false,
  onTogglePlay,
  onToggleMute,
  onSeek,
  onSkipTime,
  onCycleSpeed,
  onToggleQuality,
  onToggleDataSaver,
  onToggleFullScreen,
}: VideoBottomControlsProps) {
  return (
    <div
      className={`absolute bottom-0 inset-x-0 p-2.5 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white z-20 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Progress Bar */}
      <div className="w-full mb-2 sm:mb-3 flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="100"
          value={progress || 0}
          onChange={onSeek}
          className="w-full h-2 sm:h-1.5 bg-white/25 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {/* Left Controls: Play, Mute, Time */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onTogglePlay}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-white/15 active:scale-90 text-white transition-all cursor-pointer"
            aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
          </button>

          {/* -10s Rewind (hidden on mobile, double-tap is available) */}
          <button
            type="button"
            onClick={() => onSkipTime(-10)}
            className="hidden sm:flex px-2 py-1 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer items-center gap-1 text-[10px] font-mono font-bold"
            title="تراجع 10 ثوانٍ"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>-10s</span>
          </button>

          {/* +10s Forward (hidden on mobile, double-tap is available) */}
          <button
            type="button"
            onClick={() => onSkipTime(10)}
            className="hidden sm:flex px-2 py-1 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer items-center gap-1 text-[10px] font-mono font-bold"
            title="تقديم 10 ثوانٍ"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>+10s</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-white/15 active:scale-90 text-white transition-all cursor-pointer"
            aria-label="الصوت"
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <span className="text-[10px] sm:text-xs font-mono text-slate-300 whitespace-nowrap">
            {formatTime(currentTime)}
            <span className="opacity-75"> / {formatTime(duration)}</span>
          </span>
        </div>

        {/* Right Controls: Speed, Quality, Data Saver, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Playback Speed Selector */}
          <button
            type="button"
            onClick={onCycleSpeed}
            className="px-2 py-1 sm:px-2.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-[10px] sm:text-xs font-bold font-mono transition-all flex items-center gap-1 cursor-pointer"
            title="تغيير سرعة الشرح (بطيء / سريع)"
          >
            <Gauge className="w-3 h-3 text-amber-300 shrink-0" />
            <span>{playbackSpeed}x</span>
          </button>

          {/* Quality Pill */}
          <button
            type="button"
            onClick={onToggleQuality}
            className="px-2 py-1 sm:px-2.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-[10px] sm:text-xs font-bold font-mono transition-all cursor-pointer"
            title="تغيير جودة الفيديو"
          >
            {quality}
          </button>

          {/* Data Saver Mode (باقة التوفير) */}
          {onToggleDataSaver && (
            <button
              type="button"
              onClick={onToggleDataSaver}
              className={`px-2 py-1 sm:px-2.5 rounded-lg text-[10px] sm:text-xs font-bold font-mono transition-all flex items-center gap-1 cursor-pointer ${
                isDataSaver
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
                  : "bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
              }`}
              title={isDataSaver ? "وضع توفير باقة النت مفعل (اضغط للإلغاء)" : "تفعيل باقة التوفير لتقليل استهلاك النت"}
            >
              <Wifi className={`w-3 h-3 ${isDataSaver ? "text-emerald-200" : "text-slate-400"}`} />
              <span className="hidden md:inline">{isDataSaver ? "التوفير ✓" : "توفير الباقة"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleFullScreen}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-white/15 active:scale-90 text-white transition-all cursor-pointer"
            aria-label="شاشة كاملة"
          >
            <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
