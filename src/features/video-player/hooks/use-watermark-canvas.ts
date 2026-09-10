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

      // Draw subtle, non-intrusive ghost watermark (18% opacity)
      // Legible on screen recording leaks without straining or fatiguing the student's eyes
      ctx.save();
      ctx.font = "500 12px system-ui, -apple-system, sans-serif";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.20)";
      ctx.lineWidth = 1.5;
      ctx.strokeText(`${studentName}`, pos.x, pos.y);
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.fillText(`${studentName}`, pos.x, pos.y);

      ctx.font = "500 10px monospace";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.20)";
      ctx.lineWidth = 1.5;
      ctx.strokeText(`${studentPhone} • ${liveTime}`, pos.x, pos.y + 14);
      ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
      ctx.fillText(`${studentPhone} • ${liveTime}`, pos.x, pos.y + 14);

      // Faint corner watermark for anti-cropping defense
      ctx.font = "400 9px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.fillText(`ID:${studentPhone.slice(-6)}`, 16, 20);
      ctx.fillText(`ID:${studentPhone.slice(-6)}`, canvas.width - 80, 20);
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
