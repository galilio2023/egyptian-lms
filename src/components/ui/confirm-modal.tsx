"use client";

import React, { useState } from "react";
import { AlertTriangle, AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  variant = "danger",
  isLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  const effectiveLoading = isLoading || internalLoading;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };

  const variantConfig = {
    danger: {
      icon: <AlertTriangle className="w-5 h-5" />,
      iconBg: "bg-rose-100 text-rose-600",
      buttonVariant: "danger" as const,
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5" />,
      iconBg: "bg-amber-100 text-amber-600",
      buttonVariant: "secondary" as const,
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      iconBg: "bg-blue-100 text-blue-600",
      buttonVariant: "outline" as const,
    },
    success: {
      icon: <CheckCircle2 className="w-5 h-5" />,
      iconBg: "bg-emerald-100 text-emerald-600",
      buttonVariant: "success" as const,
    },
  }[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={effectiveLoading ? () => {} : onClose}
      title={title}
      maxWidth="sm"
      icon={
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${variantConfig.iconBg}`}>
          {variantConfig.icon}
        </div>
      }
      footer={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={effectiveLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variantConfig.buttonVariant}
            size="sm"
            onClick={handleConfirm}
            disabled={effectiveLoading}
          >
            {effectiveLoading && <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />}
            <span>{confirmText}</span>
          </Button>
        </>
      }
    >
      <div className="text-xs text-slate-600 leading-relaxed text-right">
        {message}
      </div>
    </Modal>
  );
};
