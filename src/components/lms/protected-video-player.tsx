"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { toast } from "sonner";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw, 
  RotateCw, 
  BookmarkCheck,
  Gauge
} from "lucide-react";

interface ProtectedVideoPlayerProps {
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
  const hlsRef = useRef<Hls | null>(null);

  const storageKey = `elite_video_pos_${encodeURIComponent(src)}`;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quality, setQuality] = useState("Auto");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showControls, setShowControls] = useState(true);
  const [seekFeedback, setSeekFeedback] = useState<{ text: string; side: 'left' | 'right' } | null>(null);

  // Lazy initialize savedTime from localStorage without triggering cascading renders in effect
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

  // Watermark state coordinates & AI-jitter timers
  const watermarkPos = useRef({ x: 50, y: 50, vx: 1.4, vy: 1.1 });
  const lastJitterTime = useRef<number>(Date.now());
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);

  // Anti-Screen Capture & Tab Switch Guard
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

  // 1. Initialize HLS.js Stream Player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Sync canvas dimensions
  const updateCanvasSize = useCallback(() => {
    if (containerRef.current && canvasRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width || containerRef.current.clientWidth || 800;
      canvasRef.current.height = rect.height || containerRef.current.clientHeight || 450;
    }
  }, []);

  // 2. Dynamic Anti-AI Jitter Bouncing Watermark + Live Clock Stamp
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const renderWatermark = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pos = watermarkPos.current;
      const now = Date.now();

      // Anti-AI in-painting jitter: subtly change direction every 12 seconds
      if (now - lastJitterTime.current > 12000) {
        pos.vx = (pos.vx > 0 ? 1 : -1) * (1.1 + Math.random() * 0.7);
        pos.vy = (pos.vy > 0 ? 1 : -1) * (0.8 + Math.random() * 0.6);
        lastJitterTime.current = now;
      }

      pos.x += pos.vx;
      pos.y += pos.vy;

      // Bounce horizontally
      if (pos.x <= 20 || pos.x >= canvas.width - 250) pos.vx *= -1;
      
      // Bounce vertically within safe upper 60% zone to keep subtitles clear
      const maxY = Math.max(80, canvas.height * 0.60);
      if (pos.y <= 30 || pos.y >= maxY) pos.vy *= -1;

      // Live timestamp
      const liveTime = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

      // Draw high-contrast semi-transparent floating security stamp
      ctx.save();
      ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.60)";
      ctx.lineWidth = 2.5;
      ctx.strokeText(`${studentName}`, pos.x, pos.y);
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.fillText(`${studentName}`, pos.x, pos.y);

      ctx.font = "bold 11px monospace";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.60)";
      ctx.lineWidth = 2.5;
      ctx.strokeText(`${studentPhone} • ${liveTime}`, pos.x, pos.y + 16);
      ctx.fillStyle = "rgba(52, 211, 153, 0.95)";
      ctx.fillText(`${studentPhone} • ${liveTime}`, pos.x, pos.y + 16);

      // Subtle fixed corner micro-stamps to prevent cropping attacks
      ctx.font = "bold 9px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
      ctx.fillText(`DRM-${studentPhone.slice(-6)}`, 16, 20);
      ctx.fillText(`DRM-${studentPhone.slice(-6)}`, canvas.width - 100, canvas.height - 20);
      ctx.restore();

      animationId = requestAnimationFrame(renderWatermark);
    };

    renderWatermark();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [studentName, studentPhone]);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    document.addEventListener("fullscreenchange", updateCanvasSize);
    document.addEventListener("webkitfullscreenchange", updateCanvasSize);
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      document.removeEventListener("fullscreenchange", updateCanvasSize);
      document.removeEventListener("webkitfullscreenchange", updateCanvasSize);
    };
  }, [updateCanvasSize]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
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

    // Save timestamp every 5 seconds to localStorage
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
      // In RTL: right side seeks forward (+10s), left side rewinds (-10s)
      if (isRightSide) {
        skipTime(10);
        setSeekFeedback({ text: "+10s تقديم", side: 'right' });
      } else {
        skipTime(-10);
        setSeekFeedback({ text: "-10s تراجع", side: 'left' });
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
    videoRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(() => {});
    toast.success(`تم استئناف المحاضرة من الدقيقة ${formatTime(savedTime)}`);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder.toString().padStart(2, "0")}`;
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
      {/* 0. Anti-Screen Recording & Window Blur Shield */}
      {isWindowBlurred && (
        <div 
          onClick={() => {
            setIsWindowBlurred(false);
            if (videoRef.current) {
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          }}
          className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl z-40 flex flex-col items-center justify-center p-6 text-center space-y-4 cursor-pointer animate-in fade-in duration-200"
        >
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base font-black text-white">المحاضرة محمية بنظام DRM</h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              تم إيقاف تشغيل المحاضرة مؤقتاً لمغادرة النافذة أو تفعيل برنامج خارجي. اضغط هنا للاستئناف.
            </p>
          </div>
          <button className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-500/25 transition-all">
            استئناف المشاهدة الآن ▶
          </button>
        </div>
      )}

      {/* 1. Underlying Video */}
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

      {/* 2. Overlaid Canvas for Dynamic Watermark */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* 2.5 Double-Tap Ripple Feedback Indicator */}
      {seekFeedback && (
        <div className={`absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none ${
          seekFeedback.side === 'right' ? 'end-10' : 'start-10'
        }`}>
          <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 text-white font-mono font-black text-sm flex items-center gap-2 animate-pulse">
            {seekFeedback.side === 'right' ? <RotateCw className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
            <span>{seekFeedback.text}</span>
          </div>
        </div>
      )}

      {/* 3. Top Security & Title Banner */}
      <div className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white z-20 transition-opacity duration-300 ${
        showControls || !isPlaying ? "opacity-100" : "opacity-0"
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{title}</h4>
            <span className="text-[10px] text-emerald-400 font-semibold">أكاديمية إيليت • بث HLS آمن ومحمي</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>DRM ACTIVE</span>
        </div>
      </div>

      {/* 4. Resume Playback Toast Card Overlay */}
      {savedTime && !isPlaying && (
        <div className="absolute top-16 start-4 z-30 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/50 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3">
            <BookmarkCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium">
              توقفت سابقاً عند <strong className="font-mono text-amber-300">{formatTime(savedTime)}</strong>
            </span>
            <button
              onClick={resumeSavedPlayback}
              className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              استئناف من هناك
            </button>
            <button
              onClick={() => setSavedTime(null)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* 5. Center Play/Pause Big Button Overlay */}
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

      {/* 6. Bottom Custom Player Controls Bar */}
      <div className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white z-20 transition-opacity duration-300 ${
        showControls || !isPlaying ? "opacity-100" : "opacity-0"
      }`}>
        {/* Progress Bar */}
        <div className="w-full mb-3 flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={progress || 0}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            {/* -10s Rewind */}
            <button
              onClick={() => skipTime(-10)}
              className="px-2 py-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold"
              title="تراجع 10 ثوانٍ"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>-10s</span>
            </button>

            {/* +10s Forward */}
            <button
              onClick={() => skipTime(10)}
              className="px-2 py-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold"
              title="تقديم 10 ثوانٍ"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>+10s</span>
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
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
            {/* Playback Speed Selector (Kid Learning Pace) */}
            <button
              onClick={cycleSpeed}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold font-mono transition-colors flex items-center gap-1 cursor-pointer"
              title="تغيير سرعة الشرح (بطيء / سريع)"
            >
              <Gauge className="w-3.5 h-3.5 text-amber-300" />
              <span>{playbackSpeed}x</span>
            </button>

            {/* Quality Pill */}
            <button 
              onClick={toggleQuality}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold font-mono transition-colors cursor-pointer"
              title="تغيير جودة الفيديو"
            >
              {quality}
            </button>

            <button
              onClick={toggleFullScreen}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              aria-label="شاشة كاملة"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
