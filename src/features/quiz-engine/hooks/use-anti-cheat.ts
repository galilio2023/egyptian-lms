"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UseAntiCheatOptions {
  isSubmitted: boolean;
  onAutoSubmit: () => void;
  onWarningSound: () => void;
}

export function useAntiCheat({
  isSubmitted,
  onAutoSubmit,
  onWarningSound,
}: UseAntiCheatOptions) {
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);

  useEffect(() => {
    if (isSubmitted) return;
    let graceTimeout: NodeJS.Timeout | null = null;

    const triggerSuspiciousLeave = () => {
      if (graceTimeout) return;
      graceTimeout = setTimeout(() => {
        setTabSwitchWarnings((prev) => {
          const updated = prev + 1;
          onWarningSound();
          if (updated >= 3) {
            toast.error(
              "⚠️ تنبيه أمني: مغادرة شاشة الاختبار 3 مرات! تم تسليم الاختبار تلقائياً منعاً للغش."
            );
            onAutoSubmit();
          } else {
            toast.warning(
              `⚠️ تحذير أمني: يرجى عدم مغادرة شاشة الاختبار أو التبديل بين النوافذ (${updated}/3).`
            );
          }
          return updated;
        });
        graceTimeout = null;
      }, 4000);
    };

    const cancelSuspiciousLeave = () => {
      if (graceTimeout) {
        clearTimeout(graceTimeout);
        graceTimeout = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerSuspiciousLeave();
      } else {
        cancelSuspiciousLeave();
      }
    };

    const handleWindowBlur = () => {
      triggerSuspiciousLeave();
    };

    const handleWindowFocus = () => {
      cancelSuspiciousLeave();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      if (graceTimeout) clearTimeout(graceTimeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [isSubmitted, onAutoSubmit, onWarningSound]);

  const resetWarnings = () => setTabSwitchWarnings(0);

  return {
    tabSwitchWarnings,
    resetWarnings,
  };
}
