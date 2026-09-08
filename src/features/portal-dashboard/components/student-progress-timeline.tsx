"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import type { TimelineEvent } from "@/lib/types/timeline";

const EVENT_COLORS: Record<TimelineEvent["type"], string> = {
  lesson_completed: "bg-blue-100 border-blue-300 text-blue-700",
  quiz_passed: "bg-emerald-100 border-emerald-300 text-emerald-700",
  quiz_failed: "bg-rose-100 border-rose-300 text-rose-600",
  homework_graded: "bg-amber-100 border-amber-300 text-amber-700",
  enrollment: "bg-purple-100 border-purple-300 text-purple-700",
};

const EVENT_DOT_COLORS: Record<TimelineEvent["type"], string> = {
  lesson_completed: "bg-blue-500",
  quiz_passed: "bg-emerald-500",
  quiz_failed: "bg-rose-400",
  homework_graded: "bg-amber-500",
  enrollment: "bg-purple-500",
};

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 7) return `منذ ${days} يوم`;
  return new Date(isoString).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
  });
}

export function StudentProgressTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalQuizzesPassed, setTotalQuizzesPassed] = useState(0);

  useEffect(() => {
    fetch("/api/student/progress-timeline")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { events?: TimelineEvent[]; totalCompleted?: number; totalQuizzesPassed?: number } | null) => {
        if (data?.events) {
          setEvents(data.events);
          setTotalCompleted(data.totalCompleted ?? 0);
          setTotalQuizzesPassed(data.totalQuizzesPassed ?? 0);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const visibleEvents = isExpanded ? events : events.slice(0, 4);

  return (
    <div className="modern-card rounded-3xl overflow-hidden border border-purple-100 shadow-sm">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-black text-slate-900">رحلتك التعليمية</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick stats */}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-bold">
              {totalCompleted} 🎬 محاضرة
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
              {totalQuizzesPassed} 🏅 اختبار ناجح
            </span>
          </div>
          {events.length > 4 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> أقل
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> المزيد ({events.length - 4})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Timeline body */}
      <div className="px-5 pb-5">
        {isLoading ? (
          // Skeleton
          <div className="space-y-3 pt-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="mt-1 w-2.5 h-2.5 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-200 rounded-full w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          // Empty state
          <div className="py-8 text-center">
            <div className="text-4xl mb-2">🌟</div>
            <p className="text-sm font-bold text-slate-700">رحلتك بتبدأ هنا يا بطل!</p>
            <p className="text-xs text-slate-500 mt-1">خش على أول محاضرة وابدأ تجمع نقاط XP</p>
          </div>
        ) : (
          // Timeline events
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute start-[4px] top-2 bottom-2 w-px bg-purple-100" />

            <div className="space-y-3 pt-1">
              {visibleEvents.map((event) => (
                <div key={event.id} className="flex gap-3 items-start relative">
                  {/* Dot */}
                  <div
                    className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-white z-10 ${EVENT_DOT_COLORS[event.type]}`}
                  />

                  {/* Card */}
                  <div
                    className={`flex-1 px-3 py-2 rounded-2xl border text-start ${EVENT_COLORS[event.type]}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-base flex-shrink-0">{event.icon}</span>
                        <span className="text-xs font-black truncate">{event.title}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {event.xpEarned !== undefined && event.xpEarned > 0 && (
                          <span className="text-[10px] font-black bg-white/60 px-1.5 py-0.5 rounded-full">
                            +{event.xpEarned} XP
                          </span>
                        )}
                        {event.score !== undefined && event.maxScore !== undefined && (
                          <span className="text-[10px] font-black bg-white/60 px-1.5 py-0.5 rounded-full">
                            {event.score}/{event.maxScore}
                          </span>
                        )}
                      </div>
                    </div>
                    {event.subtitle && (
                      <p className="text-[11px] opacity-80 mt-0.5 leading-snug pr-6">
                        {event.subtitle}
                      </p>
                    )}
                    <p className="text-[10px] opacity-60 mt-1">
                      {formatRelativeTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
