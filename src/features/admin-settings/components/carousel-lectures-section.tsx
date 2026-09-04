"use client";

import { Play, Plus, ExternalLink, Trash2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { FreeSampleLecture } from "@/lib/db/schema";

interface CarouselLecturesSectionProps {
  lectures: FreeSampleLecture[];
  onDeleteLecture: (id: string) => void;
  onOpenAddModal: () => void;
}

export function CarouselLecturesSection({
  lectures,
  onDeleteLecture,
  onOpenAddModal,
}: CarouselLecturesSectionProps) {
  return (
    <Card className="border-2 border-purple-100 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-50 pb-4">
        <div>
          <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
            <Play className="w-5 h-5 text-pink-600" />
            <span>كاروسيل المحاضرات التجريبية المجانية (Carousel Lectures)</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            الفيديوهات التي تظهر في قسم &quot;المحاضرات المجانية — شاهد قبل ما تشترك&quot; على الصفحة الرئيسية.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onOpenAddModal}
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة محاضرة جديدة للكاروسيل</span>
        </Button>
      </CardHeader>

      <CardContent className="pt-5">
        {lectures.length === 0 ? (
          <EmptyState
            title="لا توجد محاضرات في الكاروسيل حالياً"
            description="أضف محاضرات تعريفية وتجريبية تظهر لزوار الموقع لتحفيزهم على الاشتراك."
            action={
              <Button variant="secondary" size="sm" onClick={onOpenAddModal}>
                <Plus className="w-4 h-4" />
                <span>إضافة محاضرة جديدة</span>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lectures.map((lecture, idx) => (
              <div
                key={lecture.id}
                className="p-3.5 rounded-2xl border border-purple-100 bg-purple-50/20 space-y-3 relative group"
              >
                {/* Thumbnail Preview */}
                <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={lecture.thumbnailUrl}
                    alt={lecture.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 start-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                    {lecture.badgeText || "مجاني"}
                  </div>
                  <div className="absolute top-2 end-2 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-mono">
                    #{idx + 1}
                  </div>
                </div>

                {/* Lecture Details */}
                <div className="space-y-1 text-right">
                  <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-1">
                    {lecture.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                    {lecture.description}
                  </p>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between pt-1 border-t border-purple-100 text-xs">
                  <a
                    href={lecture.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 font-bold text-[11px] flex items-center gap-1 hover:underline"
                  >
                    <span>معاينة الرابط</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onDeleteLecture(lecture.id)}
                    className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف هذه المحاضرة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
