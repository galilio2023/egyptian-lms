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
  const titleId = React.useId();
  const descId = React.useId();
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);
  const previousOverflow = React.useRef<string>("");

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement | null;
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move initial focus into dialog
    const focusTimer = setTimeout(() => {
      if (dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          dialogRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow.current;
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement.current?.focus?.();
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
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={cn("fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity", backdropClassName)}
        onClick={onClose}
      />

      {/* Dialog Shell */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={cn(
          "relative w-full bg-white rounded-3xl border-2 border-purple-100 shadow-2xl z-10 overflow-hidden transform transition-all duration-200 my-auto max-h-[92dvh] flex flex-col focus:outline-none",
          maxWidthStyles[effectiveMaxWidth],
          className
        )}
      >
        {/* Header */}
        {(title || icon) ? (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-purple-100 bg-purple-50/40 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {icon && <div className="text-purple-600 shrink-0">{icon}</div>}
              <div>
                {title && (
                  <h2 id={titleId} className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descId} className="text-xs text-slate-500 font-medium mt-0.5">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق النافذة"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white border border-transparent hover:border-purple-200 transition-colors cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="absolute top-4 left-4 z-10">
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق النافذة"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white border border-transparent hover:border-purple-200 transition-colors cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/80 backdrop-blur-sm"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-3.5 sm:px-6 bg-slate-50 border-t border-purple-100 flex flex-wrap items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
