"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Play, RotateCcw, RotateCw } from "lucide-react";
import { useHlsStream } from "../hooks/use-hls-stream";
import { useWatermarkCanvas } from "../hooks/use-watermark-canvas";
import { VideoTopBar } from "./video-top-bar";
import { VideoBottomControls } from "./video-bottom-controls";
import { ResumePlaybackToast } from "./resume-playback-toast";
import { WindowBlurShield } from "./window-blur-shield";

export interface ProtectedVideoPlayerProps {
  src: string;
  studentName?: string;
  studentPhone?: string;
  title?: string;
}

export function ProtectedVideoPlayer({
  src,
  studentName = "بطل أكاديمية إيليت",
  studentPhone = "01020003000",
  title = "المحاضرة التفاعلية",
}: ProtectedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const storageKey = `elite_video_pos_${encodeURIComponent(src)}`;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quality, setQuality] = useState("Auto");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showControls, setShowControls] = useState(true);
  const [seekFeedback, setSeekFeedback] = useState<{ text: string; side: "left" | "right" } | null>(null);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });

  const [savedTime, setSavedTime] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const time = parseFloat(stored);
          if (time > 5) return time;
        }
      } catch {
        // Ignore storage read error
      }
    }
    return null;
  });

  // HLS stream management
  const { hlsRef } = useHlsStream(videoRef, src);

  // Watermark canvas
  const { updateCanvasSize } = useWatermarkCanvas({
    containerRef,
    canvasRef,
    studentName,
    studentPhone,
  });

  // Anti-Screen Recording & Tab Switch Guard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
          setIsWindowBlurred(true);
        }
      }
    };

    const handleWindowBlur = () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
        setIsWindowBlurred(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Autoplay / playback blocked:", err);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);
    setProgress((cur / (videoRef.current.duration || 1)) * 100);

    if (typeof window !== "undefined" && Math.floor(cur) % 5 === 0 && cur > 5) {
      localStorage.setItem(storageKey, cur.toString());
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    updateCanvasSize();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setProgress(parseFloat(e.target.value));
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  // Double-tap seeking mechanism for mobile learning
  const handleContainerTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const isDoubleTap = now - lastTapRef.current.time < 320 && Math.abs(clickX - lastTapRef.current.x) < 80;

    if (isDoubleTap) {
      const isRightSide = clickX > rect.width / 2;
      if (isRightSide) {
        skipTime(10);
        setSeekFeedback({ text: "+10s تقديم", side: "right" });
      } else {
        skipTime(-10);
        setSeekFeedback({ text: "-10s تراجع", side: "left" });
      }
      setTimeout(() => setSeekFeedback(null), 700);
      lastTapRef.current = { time: 0, x: 0 };
    } else {
      lastTapRef.current = { time: now, x: clickX };
    }
  };

  const resumeSavedPlayback = () => {
    if (!videoRef.current || !savedTime) return;
    videoRef.current.currentTime = savedTime;
    setSavedTime(null);
    videoRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {});
    toast.success("تم استئناف المحاضرة من آخر موضع توقفت عنده");
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleQuality = () => {
    if (!hlsRef.current) {
      setQuality((q) => (q === "Auto" ? "1080p" : "Auto"));
      return;
    }
    const levels = hlsRef.current.levels;
    if (levels && levels.length > 0) {
      const nextLevel = (hlsRef.current.currentLevel + 1) % levels.length;
      hlsRef.current.currentLevel = nextLevel;
      const res = levels[nextLevel]?.height ? `${levels[nextLevel].height}p` : "Auto";
      setQuality(res);
      toast.info(`تم تغيير جودة البث إلى ${res}`);
    } else {
      toast.info("جودة البث الحالية: تلقائية ذكية (Auto Adaptive)");
    }
  };

  const cycleSpeed = () => {
    if (!videoRef.current) return;
    const speeds = [0.75, 1, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
    toast.info(`سرعة الشرح: ${nextSpeed}x`);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={handleContainerTap}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl group select-none"
    >
      {/* Anti-Screen Recording & Window Blur Shield */}
      <WindowBlurShield
        visible={isWindowBlurred}
        onResume={() => {
          setIsWindowBlurred(false);
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {});
          }
        }}
      />

      {/* Underlying Video */}
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Overlaid Canvas for Dynamic DRM Watermark */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Double-Tap Ripple Feedback Indicator */}
      {seekFeedback && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none ${
            seekFeedback.side === "right" ? "end-10" : "start-10"
          }`}
        >
          <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 text-white font-mono font-black text-sm flex items-center gap-2 animate-pulse">
            {seekFeedback.side === "right" ? (
              <RotateCw className="w-5 h-5" />
            ) : (
              <RotateCcw className="w-5 h-5" />
            )}
            <span>{seekFeedback.text}</span>
          </div>
        </div>
      )}

      {/* Top Security & Title Banner */}
      <VideoTopBar title={title} visible={showControls || !isPlaying} />

      {/* Resume Playback Toast Card Overlay */}
      <ResumePlaybackToast
        savedTime={savedTime}
        isPlaying={isPlaying}
        onResume={resumeSavedPlayback}
        onDismiss={() => setSavedTime(null)}
      />

      {/* Center Big Play Button Overlay */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 cursor-pointer"
        >
          <div className="w-20 h-20 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 hover:scale-110 transition-transform duration-300">
            <Play className="w-8 h-8 fill-white" />
          </div>
        </div>
      )}

      {/* Bottom Custom Player Controls Bar */}
      <VideoBottomControls
        visible={showControls || !isPlaying}
        isPlaying={isPlaying}
        isMuted={isMuted}
        progress={progress}
        currentTime={currentTime}
        duration={duration}
        playbackSpeed={playbackSpeed}
        quality={quality}
        onTogglePlay={togglePlay}
        onToggleMute={() => {
          if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
          }
        }}
        onSeek={handleSeek}
        onSkipTime={skipTime}
        onCycleSpeed={cycleSpeed}
        onToggleQuality={toggleQuality}
        onToggleFullScreen={toggleFullScreen}
      />
    </div>
  );
}
