"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Sparkles, X, ExternalLink } from "lucide-react";
import { type MockPlatformSettings } from "@/lib/db/mock-data";

export interface SampleLecturesSectionProps {
  sampleLectures?: MockPlatformSettings["sampleLectures"];
}

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match
    ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0`
    : null;
}

export const SampleLecturesSection: React.FC<SampleLecturesSectionProps> = ({
  sampleLectures,
}) => {
  type LectureType = NonNullable<MockPlatformSettings["sampleLectures"]>[number];
  const [activeLecture, setActiveLecture] = useState<LectureType | null>(null);

  const activeEmbedUrl = activeLecture
    ? getYouTubeEmbedUrl(activeLecture.videoUrl)
    : null;

  return (
    <section className="py-16 bg-gradient-to-b from-purple-50/50 to-white/60 border-y border-purple-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold text-purple-800 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 inline-flex items-center gap-2">
            <Play className="w-4 h-4" />
            <span>المحاضرات الكرتونية المجانية — شاهد قبل ما تشترك</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            جرّب أسلوب الشرح التفاعلي والكرتوني للأطفال
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto font-medium">
            اختر أي محاضرة تجريبية من الأسفل وشاهد طريقة الشرح الممتعة والمبسطة لتأسيس الإنجليزية والصوتيات.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sampleLectures?.map((lecture) => (
            <div
              key={lecture.id}
              onClick={() => setActiveLecture(lecture)}
              className="group modern-card overflow-hidden bg-white border-2 border-purple-100 hover:border-purple-300 shadow-md hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer text-right"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={lecture.thumbnailUrl}
                  alt={lecture.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform text-purple-700">
                    <Play className="w-6 h-6 fill-purple-700 ms-0.5" />
                  </div>
                </div>
                <div className="absolute top-2.5 start-2.5 px-2.5 py-0.5 rounded-full bg-gradient-vibrant text-white text-[10px] font-black shadow-xs">
                  {lecture.badgeText || "مجاني"}
                </div>
              </div>
              <div className="p-4 text-right space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                  {lecture.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                  {lecture.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/student-register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-vibrant text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 hover:scale-[1.03] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            سجّل مجاناً واستمتع بجميع مغامرات المنهج
          </Link>
        </div>
      </div>

      {/* Interactive In-Page Video Modal */}
      {activeLecture && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-50 duration-200"
          onClick={() => setActiveLecture(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-slate-900 border border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30">
                  {activeLecture.badgeText || "محاضرة كرتونية مجانية"}
                </span>
                <h3 className="text-sm sm:text-base font-black text-white mt-1">
                  {activeLecture.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveLecture(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Responsive 16:9 Video Frame */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner">
              {activeEmbedUrl ? (
                <iframe
                  src={activeEmbedUrl}
                  title={activeLecture.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                  تعذر تحميل مشغل الفيديو.
                </div>
              )}
            </div>

            {/* Modal Bottom CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-300 font-medium">
                {activeLecture.description}
              </p>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <a
                  href={activeLecture.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>مشاهدة على YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <Link
                  href="/student-register"
                  className="px-4 py-2 rounded-xl bg-gradient-vibrant text-white text-xs font-black shadow-md shadow-purple-500/25 hover:scale-105 transition-all"
                >
                  انضم للأكاديمية الآن 🚀
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
