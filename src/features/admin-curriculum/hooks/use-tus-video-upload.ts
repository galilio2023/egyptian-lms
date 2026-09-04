"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import * as tus from "tus-js-client";
import { apiPost } from "@/lib/api/api-client";
import type { MockUnit } from "@/lib/db/mock-data";

export interface VideoUploadProgressState {
  isUploading: boolean;
  isPaused: boolean;
  progress: number;
  uploadedBytes: number;
  totalBytes: number;
  uploadSpeed: string;
  statusText: string;
  videoId?: string;
  isComplete: boolean;
}

export interface UseTusVideoUploadProps {
  unit: MockUnit | null;
  onClose: () => void;
  onSuccess: (unitId: string) => void;
}

export function useTusVideoUpload({ unit, onClose, onSuccess }: UseTusVideoUploadProps) {
  const [uploadMode, setUploadMode] = useState<"direct_file" | "manual_id">("direct_file");
  const [lectureTitle, setLectureTitle] = useState(unit ? `محاضرة جديدة - ${unit.title}` : "");
  const [lectureDuration, setLectureDuration] = useState("45");
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [pdfAttachmentUrl, setPdfAttachmentUrl] = useState("");
  const [manualVideoId, setManualVideoId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const tusUploadRef = useRef<tus.Upload | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastLoadedRef = useRef<number>(0);

  const [uploadState, setUploadState] = useState<VideoUploadProgressState>({
    isUploading: false,
    isPaused: false,
    progress: 0,
    uploadedBytes: 0,
    totalBytes: 0,
    uploadSpeed: "0 MB/s",
    statusText: "بانتظار بدء الرفع",
    isComplete: false,
  });

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    const k = 1024;
    const mb = bytes / (k * k);
    if (mb >= 1000) {
      return `${(mb / k).toFixed(2)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const handleSaveLessonRecord = async (videoIdToSave: string) => {
    if (!unit) return;
    try {
      const res = await apiPost<{ lesson?: unknown }>(
        "/api/admin/actions",
        {
          action: "create_lesson",
          payload: {
            unitId: unit.id,
            title: lectureTitle.trim(),
            videoId: videoIdToSave.trim(),
            videoDurationSeconds: (parseInt(lectureDuration) || 45) * 60,
            pdfAttachmentUrl: pdfAttachmentUrl.trim() || undefined,
            isFreePreview,
          },
        },
        { showToast: false }
      );

      if (!res.success) {
        throw new Error(res.error || "حدث خطأ أثناء حفظ المحاضرة");
      }

      onSuccess(unit.id);
      toast.success(`🎉 تم حفظ وتشفير محاضرة (${lectureTitle}) بنجاح وإضافتها للوحدة!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "فشل حفظ المحاضرة في قاعدة البيانات.");
    }
  };

  const handleStartTusUpload = async () => {
    if (!unit) return;
    if (!selectedFile) {
      toast.error("يرجى اختيار ملف الفيديو أولاً.");
      return;
    }
    if (!lectureTitle.trim()) {
      toast.error("يرجى إدخال عنوان المحاضرة.");
      return;
    }

    setUploadState((prev) => ({
      ...prev,
      isUploading: true,
      isPaused: false,
      statusText: "جاري طلب تصريح الرفع السحابي وتوليد المفاتيح المشفرة...",
      progress: 2,
    }));

    try {
      const ticketRes = await apiPost<{ ticket?: { uploadEndpoint: string; headers: Record<string, string>; videoId: string } }>(
        "/api/admin/video/upload-ticket",
        {
          title: lectureTitle.trim(),
          unitId: unit.id,
        },
        { showToast: false }
      );

      if (!ticketRes.success || !ticketRes.data?.ticket) {
        throw new Error(ticketRes.error || "فشل الحصول على تذكرة الرفع من الخادم.");
      }

      const ticket = ticketRes.data.ticket;
      lastTimeRef.current = Date.now();
      lastLoadedRef.current = 0;

      const upload = new tus.Upload(selectedFile, {
        endpoint: ticket.uploadEndpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: ticket.headers,
        chunkSize: 5 * 1024 * 1024,
        metadata: {
          filename: selectedFile.name,
          filetype: selectedFile.type,
          title: lectureTitle.trim(),
        },
        onError: (error) => {
          console.error("TUS upload error:", error);
          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            statusText: `توقف الرفع بسبب خطأ في الاتصال: ${error.message}`,
          }));
          toast.error(`حدث خطأ أثناء رفع الفيديو: ${error.message}`);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const now = Date.now();
          const elapsed = (now - lastTimeRef.current) / 1000;
          let speedStr = "0 MB/s";

          if (elapsed >= 1) {
            const bytesDiff = bytesUploaded - lastLoadedRef.current;
            const speedMb = bytesDiff / (1024 * 1024) / elapsed;
            speedStr = `${speedMb.toFixed(2)} MB/s`;
            lastTimeRef.current = now;
            lastLoadedRef.current = bytesUploaded;
          }

          const pct = Math.min(100, Math.round((bytesUploaded / bytesTotal) * 100));
          setUploadState((prev) => ({
            ...prev,
            progress: pct,
            uploadedBytes: bytesUploaded,
            totalBytes: bytesTotal,
            uploadSpeed: speedStr,
            statusText: `جاري الرفع السحابي المباشر (${pct}%)...`,
          }));
        },
        onSuccess: async () => {
          setUploadState((prev) => ({
            ...prev,
            isUploading: false,
            isComplete: true,
            progress: 100,
            statusText: "تم رفع الفيديو بنجاح! جاري حفظ المحاضرة في قاعدة البيانات...",
          }));

          await handleSaveLessonRecord(ticket.videoId);
        },
      });

      tusUploadRef.current = upload;

      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });
    } catch (err: unknown) {
      console.error("Upload initiation error:", err);
      toast.error((err as Error)?.message || "فشل بدء عملية الرفع.");
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        statusText: "فشل بدء الرفع",
      }));
    }
  };

  const togglePauseUpload = () => {
    if (!tusUploadRef.current) return;
    if (uploadState.isPaused) {
      tusUploadRef.current.start();
      setUploadState((prev) => ({
        ...prev,
        isPaused: false,
        statusText: "تم استئناف الرفع...",
      }));
      toast.info("تم استئناف رفع الفيديو من النقطة الحالية.");
    } else {
      tusUploadRef.current.abort();
      setUploadState((prev) => ({
        ...prev,
        isPaused: true,
        statusText: "الرفع متوقف مؤقتاً (يمكنك الاستئناف في أي وقت)",
      }));
      toast.warning("تم إيقاف الرفع مؤقتاً. بياناتك محفوظة.");
    }
  };

  const handleSaveManualVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualVideoId.trim()) {
      toast.error("يرجى إدخال معرف الفيديو Bunny Video ID أو الرابط المباشر.");
      return;
    }
    if (!lectureTitle.trim()) {
      toast.error("يرجى إدخال عنوان المحاضرة.");
      return;
    }

    let cleanId = manualVideoId.trim();
    if (cleanId.includes("iframe.mediadelivery.net/play/")) {
      const parts = cleanId.split("/");
      cleanId = parts[parts.length - 1];
    }

    await handleSaveLessonRecord(cleanId);
  };

  return {
    uploadMode,
    setUploadMode,
    lectureTitle,
    setLectureTitle,
    lectureDuration,
    setLectureDuration,
    isFreePreview,
    setIsFreePreview,
    pdfAttachmentUrl,
    setPdfAttachmentUrl,
    manualVideoId,
    setManualVideoId,
    selectedFile,
    setSelectedFile,
    uploadState,
    formatBytes,
    handleStartTusUpload,
    togglePauseUpload,
    handleSaveManualVideo,
  };
}
