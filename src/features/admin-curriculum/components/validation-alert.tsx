"use client";

import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
} from "lucide-react";
import { CurriculumValidationResult } from "@/lib/ai/curriculum-validator";

interface ValidationAlertProps {
  validation: CurriculumValidationResult;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function ValidationAlert({
  validation,
  isExpanded: isExpandedProp,
  onToggle,
}: ValidationAlertProps) {
  const [isExpanded, setIsExpanded] = React.useState(isExpandedProp ?? false);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.();
  };

  const type = !validation.valid ? "error" : validation.warnings.length > 0 ? "warning" : "success";

  const colorConfig = {
    error: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      icon: "text-rose-600",
      title: "text-rose-950",
      text: "text-rose-800",
      badge: "bg-rose-100 text-rose-700",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: "text-amber-600",
      title: "text-amber-950",
      text: "text-amber-800",
      badge: "bg-amber-100 text-amber-700",
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: "text-emerald-600",
      title: "text-emerald-950",
      text: "text-emerald-800",
      badge: "bg-emerald-100 text-emerald-700",
    },
  };

  const colors = colorConfig[type];
  const hasDetails = validation.errors.length > 0 || validation.warnings.length > 0;

  const icon =
    type === "error" ? (
      <AlertCircle className={`w-5 h-5 ${colors.icon}`} />
    ) : type === "warning" ? (
      <AlertTriangle className={`w-5 h-5 ${colors.icon}`} />
    ) : (
      <CheckCircle2 className={`w-5 h-5 ${colors.icon}`} />
    );

  return (
    <div className={`rounded-2xl border ${colors.bg} ${colors.border}`}>
      <div
        className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={hasDetails ? handleToggle : undefined}
      >
        <div className="flex items-start gap-3 flex-1">
          {icon}
          <div className="flex-1">
            <h3 className={`text-sm font-black ${colors.title} mb-0.5`}>
              {type === "error" && "❌ أخطاء حرجة"}
              {type === "warning" && "⚠️ تحذيرات"}
              {type === "success" && "✅ وحدة جاهزة"}
            </h3>
            <p className={`text-xs font-medium ${colors.text}`}>
              {type === "error" &&
                `يوجد ${validation.errors.filter((e) => e.severity === "critical").length} أخطاء حرجة`}
              {type === "warning" &&
                `يوجد ${validation.warnings.length} تحذير (يمكنك المتابعة)`}
              {type === "success" && `جودة الوحدة: ${validation.score || 100}/100`}
            </p>
          </div>
        </div>
        {hasDetails && (
          <ChevronDown
            className={`w-4 h-4 ${colors.icon} shrink-0 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {/* Details Section */}
      {hasDetails && isExpanded && (
        <div className={`border-t ${colors.border} p-4 space-y-3`}>
          {/* Critical Errors */}
          {validation.errors.filter((e) => e.severity === "critical").length > 0 && (
            <div className="space-y-2">
              <p className={`text-xs font-bold ${colors.title}`}>🔴 أخطاء حرجة (يجب إصلاحها):</p>
              <div className="space-y-1.5">
                {validation.errors
                  .filter((e) => e.severity === "critical")
                  .map((error, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className={`text-xs font-bold ${colors.badge} px-2 py-0.5 rounded-md shrink-0 mt-0.5`}>
                        {error.field}
                      </span>
                      <p className={`text-xs ${colors.text} leading-relaxed flex-1`}>
                        {error.message}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Regular Errors */}
          {validation.errors.filter((e) => e.severity === "error").length > 0 && (
            <div className="space-y-2">
              <p className={`text-xs font-bold ${colors.title}`}>🟡 أخطاء أخرى:</p>
              <div className="space-y-1.5">
                {validation.errors
                  .filter((e) => e.severity === "error")
                  .map((error, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className={`text-xs font-bold ${colors.badge} px-2 py-0.5 rounded-md shrink-0 mt-0.5`}>
                        {error.field}
                      </span>
                      <p className={`text-xs ${colors.text} leading-relaxed flex-1`}>
                        {error.message}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div className="space-y-2">
              <p className={`text-xs font-bold ${colors.title}`}>💡 تحذيرات (اختياري):</p>
              <div className="space-y-1.5">
                {validation.warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Info className={`w-3.5 h-3.5 ${colors.icon} shrink-0 mt-0.5`} />
                    <p className={`text-xs ${colors.text} leading-relaxed flex-1`}>
                      <span className="font-bold">{warning.field}:</span> {warning.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quality Score */}
          {validation.score !== undefined && (
            <div className="p-3 rounded-xl bg-white/70 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${colors.text}`}>جودة المحتوى</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-white/50">
                    <div
                      className={`h-full rounded-full ${
                        validation.score >= 80
                          ? "bg-emerald-500"
                          : validation.score >= 60
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${validation.score}%` }}
                    />
                  </div>
                  <span className={`text-sm font-black ${colors.title}`}>
                    {validation.score}/100
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
