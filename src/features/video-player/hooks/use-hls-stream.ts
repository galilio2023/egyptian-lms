"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls, { Level } from "hls.js";

export type QualityMode = "auto" | "low" | "high";

export interface UseHlsStreamOptions {
  qualityMode?: QualityMode;
  onQualityModeChange?: (mode: QualityMode) => void;
}

export function useHlsStream(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  src: string,
  options: UseHlsStreamOptions = {}
) {
  const { qualityMode = "auto", onQualityModeChange } = options;

  const hlsRef = useRef<Hls | null>(null);
  const [availableLevels, setAvailableLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [isHlsSupported, setIsHlsSupported] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHlsSupported(Hls.isSupported());
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // تطبيق وضع جودة التشغيل على مستوى hls الحالي
  const applyQualityMode = useCallback(
    (hls: Hls, mode: QualityMode) => {
      const levels = hls.levels;
      if (!levels || levels.length === 0) return;

      if (mode === "auto") {
        // وضع التكيف التلقائي - يختار HLS أفضل جودة حسب الاتصال
        hls.currentLevel = -1;
        setCurrentLevel(-1);
      } else if (mode === "low") {
        // باقة التوفير - أدنى مستوى متاح (480p أو ما دون)
        // نرتب المستويات تصاعدياً بالارتفاع ونختار الأصغر
        const sortedByHeight = [...levels]
          .map((lvl, idx) => ({ lvl, idx }))
          .sort((a, b) => (a.lvl.height ?? 0) - (b.lvl.height ?? 0));
        const lowestIdx = sortedByHeight[0]?.idx ?? 0;
        hls.currentLevel = lowestIdx;
        setCurrentLevel(lowestIdx);
      } else if (mode === "high") {
        // أعلى جودة متاحة
        const sortedByHeight = [...levels]
          .map((lvl, idx) => ({ lvl, idx }))
          .sort((a, b) => (b.lvl.height ?? 0) - (a.lvl.height ?? 0));
        const highestIdx = sortedByHeight[0]?.idx ?? 0;
        hls.currentLevel = highestIdx;
        setCurrentLevel(highestIdx);
      }
    },
    []
  );

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

      // عند اكتمال تحميل قائمة مستويات الجودة
      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setAvailableLevels(data.levels as Level[]);
        applyQualityMode(hls, qualityMode);
      });

      // متابعة تغيير المستوى الفعلي عند التكيف التلقائي
      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        setCurrentLevel(data.level);
      });

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
      onQualityModeChange?.("auto");
      try {
        localStorage.removeItem("elite_data_saver");
      } catch {}
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, videoRef, onQualityModeChange]); // eslint-disable-line react-hooks/exhaustive-deps

  // تطبيق تغيير وضع الجودة على الـ hls الحالي دون إعادة تهيئة البث
  useEffect(() => {
    if (hlsRef.current && availableLevels.length > 0) {
      applyQualityMode(hlsRef.current, qualityMode);
    }
  }, [qualityMode, availableLevels, applyQualityMode]);

  return { hlsRef, availableLevels, currentLevel, isHlsSupported };
}
