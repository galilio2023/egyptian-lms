"use client";

import React from "react";
import { 
  Calendar, 
  ExternalLink, 
  MessageCircle, 
  Radio, 
  Trash2, 
  Clock 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MockLiveSession } from "../types";

export interface LiveSessionAdminCardProps {
  session: MockLiveSession;
  onToggleLive: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onSendWhatsAppBlast: (session: MockLiveSession) => void;
}

export const LiveSessionAdminCard: React.FC<LiveSessionAdminCardProps> = ({
  session,
  onToggleLive,
  onDelete,
  onSendWhatsAppBlast,
}) => {
  return (
    <div
      className={`modern-card p-6 bg-white/95 backdrop-blur-md border-2 rounded-3xl shadow-md transition-all flex flex-col justify-between space-y-4 ${
        session.isLiveNow
          ? "border-rose-400 ring-4 ring-rose-100 shadow-rose-500/10"
          : "border-purple-100"
      }`}
    >
      <div className="space-y-3 text-right">
        {/* Status Pill */}
        <div className="flex items-center justify-between">
          {session.isLiveNow ? (
            <Badge variant="rose" size="md" className="animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping me-1" />
              <span>🔴 البث المباشر شغال الآن!</span>
            </Badge>
          ) : (
            <Badge variant="purple" size="md">
              <Clock className="w-3.5 h-3.5 me-1" />
              <span>حصة مجدولة قادمة</span>
            </Badge>
          )}

          <span className="text-xs font-extrabold text-purple-800 bg-purple-100/70 px-3 py-1 rounded-full border border-purple-200">
            {session.gradeTitle}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-black text-base text-slate-900">{session.title}</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
            {session.description}
          </p>
        </div>

        {/* Schedule Meta Details */}
        <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs text-slate-700 font-bold space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-purple-700">
              <Calendar className="w-4 h-4" />
              <span>الموعد: {new Date(session.scheduledAt).toLocaleString("ar-EG")}</span>
            </span>
            <span className="text-slate-500">المدة: {session.durationMinutes} دقيقة</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-purple-100/60 font-mono text-[11px]">
            <span className="text-slate-500">
              كلمة المرور: <bdi className="font-bold text-slate-900">{session.meetingPassword}</bdi>
            </span>
            <span className="text-purple-600">المحاضر: {session.instructorName}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-purple-50 flex items-center gap-2">
        <Button
          size="sm"
          variant={session.isLiveNow ? "secondary" : "danger"}
          onClick={() => onToggleLive(session.id)}
          className="flex-1"
        >
          <Radio className="w-3.5 h-3.5 me-1" />
          <span>{session.isLiveNow ? "إنهاء البث ⏹️" : "بدء البث المباشر الآن 🔴"}</span>
        </Button>

        <Button
          size="sm"
          variant="success"
          onClick={() => onSendWhatsAppBlast(session)}
          title="إرسال رابط الحصة على واتساب"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline ms-1">بث لواتساب</span>
        </Button>

        <a
          href={session.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          title="فتح غرفة الزووم"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        <Button
          size="icon"
          variant="danger"
          onClick={() => onDelete(session.id)}
          title="حذف جلسة البث"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
