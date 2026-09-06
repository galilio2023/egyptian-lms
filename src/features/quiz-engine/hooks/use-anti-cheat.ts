"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const handledWarningCountRef = useRef(0);
  const autoSubmitStartedRef = useRef(false);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  const onWarningSoundRef = useRef(onWarningSound);

  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
    onWarningSoundRef.current = onWarningSound;
  }, [onAutoSubmit, onWarningSound]);

  const autoSubmitOnce = useCallback((message: string) => {
    if (autoSubmitStartedRef.current) return;
    autoSubmitStartedRef.current = true;
    toast.error(message);
    onAutoSubmitRef.current();
  }, []);

  useEffect(() => {
    if (isSubmitted || tabSwitchWarnings <= handledWarningCountRef.current) return;

    handledWarningCountRef.current = tabSwitchWarnings;
    onWarningSoundRef.current();

    if (tabSwitchWarnings >= 5) {
      autoSubmitOnce("عفواً يا بطل! غادرت شاشة الاختبار 5 مرات. تم تسليم إجاباتك تلقائياً.");
    } else {
      toast.warning(`انتبه يا بطل 🌟 يرجى البقاء في شاشة الاختبار للتركيز (${tabSwitchWarnings}/5).`);
    }
  }, [autoSubmitOnce, isSubmitted, tabSwitchWarnings]);

  useEffect(() => {
    if (isSubmitted) return;
    let blurTimeout: NodeJS.Timeout | null = null;
    let graceTimeout: NodeJS.Timeout | null = null;

    const triggerSuspiciousLeave = () => {
      if (blurTimeout || graceTimeout) return;
      
      blurTimeout = setTimeout(() => {
        setTabSwitchWarnings((previousCount) => previousCount + 1);
      }, 3000);

      graceTimeout = setTimeout(() => {
        autoSubmitOnce("عفواً يا بطل! غبت عن شاشة الاختبار لفترة طويلة. تم تسليم إجاباتك تلقائياً.");
      }, 8000);
    };

    const cancelSuspiciousLeave = () => {
      if (blurTimeout) {
        clearTimeout(blurTimeout);
        blurTimeout = null;
      }
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
  }, [autoSubmitOnce, isSubmitted]);

  const resetWarnings = () => {
    handledWarningCountRef.current = 0;
    autoSubmitStartedRef.current = false;
    setTabSwitchWarnings(0);
  };

  return {
    tabSwitchWarnings,
    resetWarnings,
  };
}
