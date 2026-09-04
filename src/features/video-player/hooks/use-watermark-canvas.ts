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
  const watermarkPos = useRef({ x: 50, y: 50, vx: 1.4, vy: 1.1 });
  const lastJitterTime = useRef<number>(Date.now());

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
      const maxY = Math.max(80, canvas.height * 0.6);
      if (pos.y <= 30 || pos.y >= maxY) pos.vy *= -1;

      // Live timestamp
      const liveTime = new Date().toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

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
