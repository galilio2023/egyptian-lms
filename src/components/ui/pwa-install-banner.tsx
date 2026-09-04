"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DownloadCloud, Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        Boolean((window.navigator as unknown as { standalone?: boolean }).standalone)
      );
    }
    return false;
  });

  useEffect(() => {
    // 1. Register Service Worker cleanly
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Elite Academy Service Worker active:", reg.scope))
        .catch((err) => console.warn("SW registration note:", err));
    }

    // 2. Check if already running in standalone mode (installed)
    if (typeof window !== "undefined") {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                           Boolean((window.navigator as unknown as { standalone?: boolean }).standalone);
      if (isStandalone) {
        return;
      }
    }

    // 3. Listen for native browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Only show if not dismissed recently
      const dismissed = localStorage.getItem("elite_pwa_dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsVisible(false);
      toast.success("🎉 مبروك! تم تثبيت تطبيق أكاديمية إيليت على جهازك بنجاح!");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.info("لتثبيت التطبيق على الآيفون: اضغط زر المشاركة (Share) ثم 'إضافة إلى الشاشة الرئيسية (Add to Home Screen)'.");
      return;
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      toast.success("جاري تثبيت تطبيق إيليت...");
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("elite_pwa_dismissed", "true");
    }
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mb-5 animate-in slide-in-from-top-4 duration-500">
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-xl shadow-purple-900/25 border-2 border-purple-400/40 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute -end-10 -bottom-10 w-36 h-36 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="flex items-center gap-3.5 z-10 text-right">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20 shrink-0 shadow-inner">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                تطبيق الموبايل (PWA) 📱
              </span>
              <span className="text-[11px] text-purple-200 font-bold hidden sm:inline">
                سريع وبدون الحاجة لفتح المتصفح
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-white mt-1">
              ثبّت تطبيق أكاديمية إيليت على شاشة موبايلك الرئيسية!
            </h4>
            <p className="text-[11px] text-purple-200 font-medium">
              وصول فوري لمحاضراتك، كراسة الواجب، وتنبيهات الحصص المباشرة حتى بدون إنترنت مستمر.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 z-10 w-full sm:w-auto shrink-0 justify-end">
          <button
            onClick={handleDismiss}
            className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="تخطي"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={handleInstallClick}
            className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-400/25 transition-all hover:scale-105 cursor-pointer"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>تثبيت التطبيق الآن مجاناً 📲</span>
          </button>
        </div>

      </div>
    </div>
  );
}
