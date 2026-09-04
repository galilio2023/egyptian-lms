"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ToolType, Point, Stroke } from "../types";

interface UseCanvasDrawingOptions {
  currentPageIndex: number;
  imageUrl?: string;
  isOpen: boolean;
  currentTool: ToolType;
  brushColor: string;
  brushSize: number;
}

export function useCanvasDrawing({
  currentPageIndex,
  imageUrl,
  isOpen,
  currentTool,
  brushColor,
  brushSize,
}: UseCanvasDrawingOptions) {
  const [pageStrokes, setPageStrokes] = useState<Record<number, Stroke[]>>({});
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef<Stroke | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw base student uploaded notebook image
    if (backgroundImageRef.current && backgroundImageRef.current.complete) {
      ctx.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);
    }

    // 2. Draw existing strokes on this page
    const strokes = pageStrokes[currentPageIndex] || [];
    strokes.forEach((stroke) => {
      if (stroke.tool === "check" || stroke.tool === "cross" || stroke.tool === "star") {
        if (!stroke.stampPosition) return;
        ctx.save();
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (stroke.tool === "check") {
          ctx.fillStyle = "#16a34a"; // Green Check
          ctx.fillText("✓ ممتاز", stroke.stampPosition.x, stroke.stampPosition.y);
        } else if (stroke.tool === "cross") {
          ctx.fillStyle = "#dc2626"; // Red Cross
          ctx.fillText("✗ يحتاج إعادة", stroke.stampPosition.x, stroke.stampPosition.y);
        } else if (stroke.tool === "star") {
          ctx.fillStyle = "#f59e0b"; // Gold Star
          ctx.fillText("⭐ 10/10", stroke.stampPosition.x, stroke.stampPosition.y);
        }
        ctx.restore();
        return;
      }

      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.strokeStyle =
        stroke.tool === "highlighter" ? "rgba(250, 204, 21, 0.45)" : stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (stroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
      } else {
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.stroke();
      ctx.restore();
    });
  }, [currentPageIndex, pageStrokes]);

  // Load new background image when page changes
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      backgroundImageRef.current = img;
      if (canvasRef.current) {
        canvasRef.current.width = 800;
        canvasRef.current.height =
          Math.round((img.naturalHeight / img.naturalWidth) * 800) || 1000;
      }
      redrawCanvas();
    };
  }, [isOpen, imageUrl, redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [pageStrokes, redrawCanvas]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const getTouchCoords = (e: React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas || !e.touches[0]) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (currentTool === "check" || currentTool === "cross" || currentTool === "star") {
      const newStroke: Stroke = {
        tool: currentTool,
        color: brushColor,
        size: brushSize,
        points: [coords],
        stampPosition: coords,
      };
      setPageStrokes((prev) => ({
        ...prev,
        [currentPageIndex]: [...(prev[currentPageIndex] || []), newStroke],
      }));
      return;
    }

    setIsDrawing(true);
    currentStrokeRef.current = {
      tool: currentTool,
      color: brushColor,
      size: currentTool === "highlighter" ? 18 : brushSize,
      points: [coords],
    };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getTouchCoords(e);

    if (currentTool === "check" || currentTool === "cross" || currentTool === "star") {
      const newStroke: Stroke = {
        tool: currentTool,
        color: brushColor,
        size: brushSize,
        points: [coords],
        stampPosition: coords,
      };
      setPageStrokes((prev) => ({
        ...prev,
        [currentPageIndex]: [...(prev[currentPageIndex] || []), newStroke],
      }));
      return;
    }

    setIsDrawing(true);
    currentStrokeRef.current = {
      tool: currentTool,
      color: brushColor,
      size: currentTool === "highlighter" ? 18 : brushSize,
      points: [coords],
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    const coords = getCanvasCoords(e);
    currentStrokeRef.current.points.push(coords);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const pts = currentStrokeRef.current.points;
    if (pts.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.strokeStyle =
        currentStrokeRef.current.tool === "highlighter"
          ? "rgba(250, 204, 21, 0.45)"
          : currentStrokeRef.current.color;
      ctx.lineWidth = currentStrokeRef.current.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.restore();
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    const coords = getTouchCoords(e);
    currentStrokeRef.current.points.push(coords);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const pts = currentStrokeRef.current.points;
    if (pts.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.strokeStyle =
        currentStrokeRef.current.tool === "highlighter"
          ? "rgba(250, 204, 21, 0.45)"
          : currentStrokeRef.current.color;
      ctx.lineWidth = currentStrokeRef.current.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.restore();
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentStrokeRef.current) return;
    setIsDrawing(false);
    const completedStroke = currentStrokeRef.current;
    currentStrokeRef.current = null;

    setPageStrokes((prev) => ({
      ...prev,
      [currentPageIndex]: [...(prev[currentPageIndex] || []), completedStroke],
    }));
  };

  const handleUndo = () => {
    setPageStrokes((prev) => {
      const current = prev[currentPageIndex] || [];
      if (current.length === 0) return prev;
      return {
        ...prev,
        [currentPageIndex]: current.slice(0, current.length - 1),
      };
    });
  };

  const handleClearPage = () => {
    setPageStrokes((prev) => ({
      ...prev,
      [currentPageIndex]: [],
    }));
  };

  return {
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleUndo,
    handleClearPage,
  };
}
