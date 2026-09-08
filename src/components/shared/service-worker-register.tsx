"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const handleLoad = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((err) => {
            if (process.env.NODE_ENV === "development") {
              console.warn("Service Worker registration note:", err);
            }
          });
      };

      if (document.readyState === "complete") {
        handleLoad();
      } else {
        window.addEventListener("load", handleLoad);
        return () => window.removeEventListener("load", handleLoad);
      }
    }
  }, []);

  return null;
}
