"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  className?: string;
  backdropClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  maxWidth,
  size,
  className,
  backdropClassName,
}) => {
  const effectiveMaxWidth = size || maxWidth || "lg";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className={cn("fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity", backdropClassName)}
        onClick={onClose}
      />

      {/* Dialog Shell */}
      <div
        className={cn(
          "relative w-full bg-white rounded-3xl border-2 border-purple-100 shadow-2xl z-10 overflow-hidden transform transition-all duration-200 animate-in fade-in zoom-in-95 my-8",
          maxWidthStyles[effectiveMaxWidth],
          className
        )}
      >
        {/* Header */}
        {(title || icon) && (
          <div className="flex items-center justify-between p-6 border-b border-purple-100 bg-purple-50/40">
            <div className="flex items-center gap-3">
              {icon && <div className="text-purple-600">{icon}</div>}
              <div>
                {title && (
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white border border-transparent hover:border-purple-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-4 sm:px-6 bg-slate-50 border-t border-purple-100 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
