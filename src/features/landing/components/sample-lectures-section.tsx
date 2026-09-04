import React from "react";
import Link from "next/link";
import { Play, Sparkles } from "lucide-react";
import { type MockPlatformSettings } from "@/lib/db/mock-data";

export interface SampleLecturesSectionProps {
  sampleLectures?: MockPlatformSettings["sampleLectures"];
}

export const SampleLecturesSection: React.FC<SampleLecturesSectionProps> = ({ sampleLectures }) => {
  return (
    <section className="py-16 bg-gradient-to-b from-purple-50/50 to-white/60 border-y border-purple-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold text-purple-800 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 inline-flex items-center gap-2">
            <Play className="w-4 h-4" />
            <span>المحاضرات المجانية — شاهد قبل ما تشترك</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            جرّب أسلوب الشرح التفاعلي مجاناً
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto font-medium">
            اختر أي محاضرة تجريبية من الأسفل وشاهد طريقة الشرح الممتعة والمبسطة قبل الاشتراك في الكورس.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sampleLectures?.map((lecture) => (
            <a
              key={lecture.id}
              href={lecture.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group modern-card overflow-hidden bg-white border-2 border-purple-100 hover:border-purple-300 shadow-md hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={lecture.thumbnailUrl}
                  alt={lecture.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-purple-700 fill-purple-700 ms-0.5" />
                  </div>
                </div>
                <div className="absolute top-2 start-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                  {lecture.badgeText || "مجاني"}
                </div>
              </div>
              <div className="p-3 text-right">
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
                  {lecture.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {lecture.description}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/student-register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-vibrant text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 hover:scale-[1.03] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            سجّل مجاناً وشاهد المزيد من المحاضرات
          </Link>
        </div>
      </div>
    </section>
  );
};
