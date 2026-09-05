"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface VoiceNoteRecorderProps {
  audioUrl?: string | null;
  onAudioChange: (dataUrl: string | null) => void;
  disabled?: boolean;
}

export function VoiceNoteRecorder({
  audioUrl,
  onAudioChange,
  disabled = false,
}: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    if (disabled) return;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("متصفحك لا يدعم تسجيل الصوت المباشر.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onAudioChange(base64Audio);
        };
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            // Auto stop at 60 seconds
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn("Microphone access error:", err);
      toast.error("يرجى إعطاء الإذن لاستخدام الميكروفون لتسجيل قراءة الكلمات.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    toast.success("تم تسجيل الملاحظة الصوتية بنجاح 🎤");
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
    setRecordingSeconds(0);
    toast.info("تم حذف التسجيل الصوتي.");
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
        شجّع طفلك على قراءة جمل الدرس أو نطق الحروف بصوته ليستمع إليها مستر أحمد ويصحح النطق.
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
      )}
    </div>
  );
}
