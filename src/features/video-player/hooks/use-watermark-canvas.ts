"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseWatermarkCanvasOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  studentName: string;
  studentPhone: string;
}

export function useWatermarkCanvas({
  containerRef,
  canvasRef,
  studentName,
  studentPhone,
}: UseWatermarkCanvasOptions) {
  // Gentle, non-distracting drift velocity (barely perceptible to peripheral vision)
  const watermarkPos = useRef({ x: 40, y: 50, vx: 0.18, vy: 0.12 });
  const lastJitterTime = useRef<number>(0);

  const updateCanvasSize = useCallback(() => {
    if (containerRef.current && canvasRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width || containerRef.current.clientWidth || 800;
      canvasRef.current.height = rect.height || containerRef.current.clientHeight || 450;
    }
  }, [containerRef, canvasRef]);

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

      // Ultra-slow direction adjustment every 20 seconds to prevent pattern burn-in
      if (now - lastJitterTime.current > 20000) {
        pos.vx = (pos.vx > 0 ? 1 : -1) * (0.15 + Math.random() * 0.1);
        pos.vy = (pos.vy > 0 ? 1 : -1) * (0.10 + Math.random() * 0.08);
        lastJitterTime.current = now;
      }

      pos.x += pos.vx;
      pos.y += pos.vy;

      // Bounce horizontally safely inside container
      if (pos.x <= 20 || pos.x >= canvas.width - 240) pos.vx *= -1;

      // Keep strictly in the upper 45% zone so center board and lower subtitles stay 100% clean
      const maxY = Math.max(70, canvas.height * 0.45);
      if (pos.y <= 35 || pos.y >= maxY) pos.vy *= -1;

      // Live timestamp
      const liveTime = new Date().toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Fixed subtle corner stamp: Teacher & Platform Copyright Notice
      ctx.save();
      ctx.font = "500 10px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.fillText("© جميع الحقوق محفوظة للمعلم والمنصة", 16, 22);

      // Draw subtle ghost student license fingerprint (18% opacity)
      // Clearly indicates this is the student's personal viewing license to deter piracy
      ctx.font = "500 11px system-ui, -apple-system, sans-serif";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.20)";
      ctx.lineWidth = 1.5;
      ctx.strokeText(`رخصة مشاهدة: ${studentName}`, pos.x, pos.y);
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.fillText(`رخصة مشاهدة: ${studentName}`, pos.x, pos.y);

      ctx.font = "500 10px monospace";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.20)";
      ctx.lineWidth = 1.5;
      ctx.strokeText(`${studentPhone} • جلسة ${liveTime}`, pos.x, pos.y + 14);
      ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
      ctx.fillText(`${studentPhone} • جلسة ${liveTime}`, pos.x, pos.y + 14);

      // Faint corner watermark for forensic tracking
      ctx.font = "400 9px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.fillText(`LIC-${studentPhone.slice(-6)}`, canvas.width - 85, 22);
      ctx.restore();

      animationId = requestAnimationFrame(renderWatermark);
    };

    renderWatermark();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [studentName, studentPhone, canvasRef]);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    document.addEventListener("fullscreenchange", updateCanvasSize);
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      document.removeEventListener("fullscreenchange", updateCanvasSize);
    };
  }, [updateCanvasSize]);

  return { updateCanvasSize };
}
