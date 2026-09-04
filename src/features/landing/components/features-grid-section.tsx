import React from "react";
import { 
  PhonicsSpeechSvg, 
  ExamQuizSheetSvg, 
  WorksheetPdfSvg, 
  WhatsAppBubbleSvg, 
  EgyptianWalletSvg, 
  CenterVoucherCardSvg 
} from "@/components/ui/illustrated-icons";

export const FeaturesGridSection: React.FC = () => {
  return (
    <section id="features_section" className="py-20 bg-white/70 border-t border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-14">
          <span className="text-xs font-bold text-purple-800 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200">
            مميزات منصة إيليت
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            بيئة تعليمية ممتعة تضمن تفوق البطل الصغير
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          <div className="modern-card p-6 space-y-3 bg-white/95 backdrop-blur-md border-2 border-indigo-100 hover:border-indigo-300">
            <PhonicsSpeechSvg className="w-14 h-14" />
            <h3 className="text-base font-extrabold text-slate-900">صوتيات Phonics ونطق سليم</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              تدريبات صوتية مسجلة ومباشرة تشجع الطالب على النطق والتحدث باللكنة الصحيحة بأسلوب كرتوني ممتع.
            </p>
          </div>

          <div className="modern-card p-6 space-y-3 bg-white/95 backdrop-blur-md border-2 border-amber-100 hover:border-amber-300">
            <ExamQuizSheetSvg className="w-14 h-14" />
            <h3 className="text-base font-extrabold text-slate-900">اختبارات ذكية وتصحيح فوري</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              بنك أسئلة إلكتروني يقدم نتائج فورية ونقاط تقييم تعزز ثقة الطالب بنفسه ومستواه الدراسي.
            </p>
          </div>

          <div className="modern-card p-6 space-y-3 bg-white/95 backdrop-blur-md border-2 border-blue-100 hover:border-blue-300">
            <WorksheetPdfSvg className="w-14 h-14" />
            <h3 className="text-base font-extrabold text-slate-900">مذكرات وتمارين شاملة PDF</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              ملازم ملونة وواجبات منظمة تسهل على الطالب وولي الأمر المراجعة اليومية والتطبيق العملي.
            </p>
          </div>

          <div className="modern-card p-6 space-y-3 bg-white/95 backdrop-blur-md border-2 border-emerald-100 hover:border-emerald-300">
            <WhatsAppBubbleSvg className="w-14 h-14" />
            <h3 className="text-base font-extrabold text-slate-900">تقارير واتساب لولي الأمر</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              إشعار تلقائي يصل ولي الأمر عبر واتساب بدرجات الطالب في الاختبارات ومستوى حضوره والتزامه.
            </p>
          </div>

          <div className="modern-card p-6 space-y-3 bg-white/95 backdrop-blur-md border-2 border-orange-100 hover:border-orange-300">
            <EgyptianWalletSvg className="w-14 h-14" />
            <h3 className="text-base font-extrabold text-slate-900">طرق دفع مصرية مرنة</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              تفعيل فوري للاشتراكات عبر فودافون كاش، إنستاباي، كروت ميزة، أو المحافظ الإلكترونية بضغطة زر.
            </p>
          </div>

          <div className="modern-card p-6 space-y-3 bg-white/95 backdrop-blur-md border-2 border-purple-100 hover:border-purple-300">
            <CenterVoucherCardSvg className="w-14 h-14" />
            <h3 className="text-base font-extrabold text-slate-900">كروت شحن السناتر والمكتبات</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              شحن فوري للكورسات باستخدام كروت الخدش المتاحة في السناتر والمكتبات المعتمدة دون الحاجة لبطاقات بنكية.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
