"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface VoiceNoteRecorderProps {
  audioUrl?: string | null;
  onAudioChange: (dataUrl: string | null) => void;
  disabled?: boolean;
  targetWord?: string;
}

export function VoiceNoteRecorder({
  audioUrl,
  onAudioChange,
  disabled = false,
  targetWord = "Connect Phonics Practice",
}: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCheckingAi, setIsCheckingAi] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{
    accuracyScore: number;
    pedagogicalAdviceArabic: string;
    praiseArabic: string;
    xpAwarded: number;
  } | null>(null);

  const isMountedRef = useRef(true);
  const pendingStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingActiveRef = useRef(false);

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (isMountedRef.current) {
      setIsRecording(false);
      toast.success("تم تسجيل الملاحظة الصوتية بنجاح 🎤");
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (pendingStreamRef.current) {
        pendingStreamRef.current.getTracks().forEach((track) => track.stop());
        pendingStreamRef.current = null;
      }
      recordingActiveRef.current = false;
    };
  }, []);

  const startRecording = async () => {
    if (disabled || recordingActiveRef.current) return;
    recordingActiveRef.current = true;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("متصفحك لا يدعم تسجيل الصوت المباشر.");
        recordingActiveRef.current = false;
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      pendingStreamRef.current = stream;

      // Unmounted during getUserMedia async resolution
      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        pendingStreamRef.current = null;
        recordingActiveRef.current = false;
        return;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        recordingActiveRef.current = false;
        // Stop all audio tracks to release microphone
        if (pendingStreamRef.current) {
          pendingStreamRef.current.getTracks().forEach((track) => track.stop());
          pendingStreamRef.current = null;
        }
        if (!isMountedRef.current) return;

        const selectedMime = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: selectedMime });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          if (!isMountedRef.current) return;
          const base64Audio = reader.result as string;
          onAudioChange(base64Audio);
        };
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        if (!isMountedRef.current) return;
        const elapsed = Math.min(60, Math.floor((Date.now() - startTime) / 1000));
        setRecordingSeconds(elapsed);
        if (elapsed >= 60) {
          stopRecording();
        }
      }, 500);
    } catch (err) {
      recordingActiveRef.current = false;
      console.warn("Microphone access error:", err);
      toast.error("يرجى إعطاء الإذن لاستخدام الميكروفون لتسجيل قراءة الكلمات.");
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audioElementRef.current = audio;
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDelete = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsPlaying(false);
    onAudioChange(null);
    setAiFeedback(null);
    setRecordingSeconds(0);
    toast.info("تم حذف التسجيل الصوتي.");
  };

  const handleAiCheck = async () => {
    if (!audioUrl) return;
    setIsCheckingAi(true);
    toast.info("جاري فحص نطق الطالب بواسطة مساعد الفونكس الذكي 🎙️...");
    try {
      const res = await fetch("/api/ai/phonics/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioDataUrl: audioUrl,
          targetText: targetWord,
          gradeLevel: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "تعذر فحص النطق حالياً.");
        return;
      }
      setAiFeedback({
        accuracyScore: data.accuracyScore,
        pedagogicalAdviceArabic: data.pedagogicalAdviceArabic,
        praiseArabic: data.praiseArabic,
        xpAwarded: data.xpAwarded,
      });
      toast.success("✨ تم تقييم النطق بنجاح بواسطة الذكاء الاصطناعي!");
    } catch {
      toast.error("حدث خطأ في الاتصال أثناء تقييم النطق.");
    } finally {
      setIsCheckingAi(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="p-3.5 rounded-2xl bg-purple-50/70 border-2 border-dashed border-purple-200 text-right space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-purple-600" />
          <span>تسجيل صوتي لنطق الكلمات (اختياري - مهارة التحدث)</span>
        </span>
        {isRecording && (
          <span className="flex items-center gap-1.5 text-xs font-mono font-black text-rose-600 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>تسجيل: {formatTime(recordingSeconds)} / 1:00</span>
          </span>
        )}
      </div>

      <p className="text-[11px] text-purple-700 font-medium leading-relaxed">
        شجّع طفلك على قراءة جمل الدرس أو نطق الحروف بصوته ليستمع إليها المعلم ويصحح النطق.
      </p>

      {!audioUrl && !isRecording && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startRecording}
          disabled={disabled}
          className="w-full bg-white hover:bg-purple-100/50 border-purple-300 text-purple-800 font-bold"
        >
          <Mic className="w-4 h-4 text-rose-500 me-1.5" />
          <span>اضغط هنا لبدء تسجيل صوت البطل 🎙️</span>
        </Button>
      )}

      {isRecording && (
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={stopRecording}
          className="w-full animate-bounce shadow-md shadow-rose-500/25"
        >
          <Square className="w-4 h-4 me-1.5" />
          <span>إيقاف وحفظ التسجيل الصوتي ({formatTime(recordingSeconds)})</span>
        </Button>
      )}

      {audioUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-purple-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayback}
                className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shadow-sm"
                aria-label={isPlaying ? "إيقاف مؤقت" : "استماع"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ms-0.5" />}
              </button>
              <span className="text-xs font-bold text-slate-800">
                {isPlaying ? "جاري تشغيل صوت الطالب 🔊" : "تم حفظ التسجيل الصوتي بنجاح ✓"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleAiCheck}
                disabled={isCheckingAi || disabled}
                className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                title="فحص النطق بمساعد الذكاء الاصطناعي"
              >
                {isCheckingAi ? (
                  <span>جاري الفحص... ⏳</span>
                ) : (
                  <>
                    <span>✨ فحص النطق الذكي</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={disabled}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="حذف التسجيل وإعادة التسجيل"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI Phonics Coach Feedback Card */}
          {aiFeedback && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/80 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-900 flex items-center gap-1.5">
                  <span>🐝 تقرير المعلم الذكي للنطق:</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[11px] shadow-sm">
                  درجة النطق: {aiFeedback.accuracyScore}%
                </span>
              </div>
              <p className="text-[11px] text-amber-950 font-bold leading-relaxed">
                {aiFeedback.pedagogicalAdviceArabic}
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 text-[10px]">
                <span className="text-emerald-700 font-bold">
                  {aiFeedback.praiseArabic}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                  +{aiFeedback.xpAwarded} XP 🌟
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
