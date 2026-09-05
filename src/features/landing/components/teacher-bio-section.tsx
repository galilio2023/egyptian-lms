import React from "react";
import { EliteLogoBadge } from "@/components/ui/illustrated-icons";

interface TeacherBioSectionProps {
  teacherNameArabic?: string;
  teacherTitle?: string;
  teacherBio?: string;
  academyName?: string;
}

export const TeacherBioSection: React.FC<TeacherBioSectionProps> = ({
  teacherNameArabic = "المعلم المشرف",
  teacherTitle = "المشرف الأكاديمي وكبير المعلمين",
  teacherBio,
  academyName = "أكاديمية إيليت",
}) => {
  const displayTitle = teacherTitle || "المشرف الأكاديمي وكبير المعلمين";
  const displayName = teacherNameArabic || "المعلم المشرف";

  return (
    <section id="about_section" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="modern-card p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border border-purple-200 shadow-xl bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20">
          
          {/* Teacher Details */}
          <div className="lg:col-span-8 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-800 text-xs font-bold">
              <EliteLogoBadge className="w-5 h-5" />
              {displayTitle}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              {displayName}
            </h2>

            {teacherBio ? (
              <div className="p-4 rounded-2xl bg-white/80 border border-purple-100 text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-line shadow-xs">
                {teacherBio}
              </div>
            ) : (
              <div className="space-y-3.5 text-sm text-slate-600 leading-relaxed font-medium">
                <p className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-2 shrink-0 shadow-sm" />
                  <span><strong>خبرة تعليمية وأكاديمية متقدمة</strong> — سنوات طويلة من الخبرة في تدريس وتأسيس المراحل الابتدائية ومدارس اللغات والتجريبي وفق أحدث المناهج المعتمدة.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-sm" />
                  <span>حاصل على شهادات تدريبية معتمدة في تعليم الصوتيات وطرق التدريس التفاعلية (Phonics & Interactive English Methodology).</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-2 shrink-0 shadow-sm" />
                  <span>مبتكر سلاسل الشرح التفاعلي وبنوك الأسئلة الذكية المتوافقة مع أحدث مواصفات المناهج الوزارية الحديثة والأنشطة الإثرائية.</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 mt-2 shrink-0 shadow-sm" />
                  <span><strong>الإشراف الأكاديمي على {academyName}:</strong> متابعة مستمرة للطلاب وتقارير أسبوعية دورية لولي الأمر لضمان أقصى درجات التفوق.</span>
                </p>
              </div>
            )}
          </div>

          {/* Teacher Card Profile */}
          <div className="lg:col-span-4 text-center p-7 rounded-3xl bg-white border-2 border-purple-200/80 shadow-lg space-y-4">
            <div className="w-28 h-28 rounded-3xl bg-gradient-vibrant text-white flex items-center justify-center text-3xl font-black mx-auto shadow-xl shadow-purple-500/25">
              🎓
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">{displayName}</h3>
              <span className="text-xs text-purple-700 font-bold block mt-0.5">{displayTitle}</span>
            </div>
            <div className="pt-3 border-t border-purple-100 flex items-center justify-around text-xs font-bold text-slate-700">
              <div>
                <div className="font-black text-2xl text-purple-700">+15</div>
                <div className="text-slate-500 font-medium text-[11px]">عاماً من الخبرة</div>
              </div>
              <div>
                <div className="font-black text-2xl text-emerald-600">Grade 1-6</div>
                <div className="text-slate-500 font-medium text-[11px]">المراحل التأسيسية</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
