import Link from "next/link";
import { 
  EliteLogoBadge, 
  OfficialShieldCheckSvg, 
  WhatsAppBubbleSvg, 
  HotlinePhoneSvg, 
  EgyptianPhoneSvg, 
  YouTubePlaySvg, 
  FacebookBadgeSvg 
} from "@/components/ui/illustrated-icons";

interface FooterProps {
  whatsappNumber?: string;
  hotlineNumber?: string;
  inquiriesNumber?: string;
  academyName?: string;
  teacherName?: string;
  teacherNameArabic?: string;
}

export function Footer({
  whatsappNumber: customWhatsapp,
  hotlineNumber = "0225006000",
  inquiriesNumber = "01100000000",
  academyName = "أكاديمية إيليت",
  teacherName = "Lead Instructor",
  teacherNameArabic,
}: FooterProps = {}) {
  const whatsappNumber = customWhatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201000000000";
    
  return (
    <footer className="w-full bg-white/80 backdrop-blur-md border-t-2 border-purple-200/80 pt-16 pb-12 text-slate-600 relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-0 inset-s-1/4 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 inset-e-1/4 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-purple-100">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <EliteLogoBadge className="w-12 h-12 hover:scale-105 transition-transform" />
              <div>
                <span className="text-xl font-black text-slate-900 block">
                  {academyName}
                </span>
                <span className="text-xs text-purple-700 font-bold">{teacherName}</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 font-medium">
              المنصة التعليمية الأولى لتبسيط مناهج اللغة الإنجليزية الحديثة (Connect &amp; Connect Plus) للمرحلة الابتدائية بنظام المكافآت التفاعلي والفيديوهات المحمية.
            </p>
            <div className="flex items-center gap-2 text-xs font-black text-purple-900 bg-purple-100/60 py-1.5 px-3 rounded-xl w-fit">
              <OfficialShieldCheckSvg className="w-5 h-5 text-purple-700" />
              <span>معتمد رسمي للمناهج الوزارية المصرية</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-slate-900 font-black text-base">المراحل الدراسية</h4>
            <ul className="space-y-2.5 text-xs font-bold">
              <li>
                <Link href="/portal/dashboard" className="hover:text-purple-700 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>الصف الأول الابتدائي (Grade 1)</span>
                </Link>
              </li>
              <li>
                <Link href="/portal/dashboard" className="hover:text-purple-700 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>الصف الثاني الابتدائي (Grade 2)</span>
                </Link>
              </li>
              <li>
                <Link href="/portal/dashboard" className="hover:text-purple-700 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>الصف الثالث الابتدائي (Grade 3)</span>
                </Link>
              </li>
              <li>
                <Link href="/student-login" className="hover:text-purple-700 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>بوابة الطالب التفاعلية</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Support & Contact */}
          <div className="space-y-4">
            <h4 className="text-slate-900 font-black text-base">التواصل وخدمة أولياء الأمور</h4>
            <ul className="space-y-3 text-xs font-bold">
              <li className="flex items-center gap-2.5">
                <WhatsAppBubbleSvg className="w-6 h-6 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <span>واتساب المتابعة:</span>
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-black hover:underline" dir="ltr">
                    <bdi dir="ltr">{whatsappNumber}</bdi>
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <HotlinePhoneSvg className="w-6 h-6 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <span>الخط الساخن:</span>
                  <a href={`tel:${hotlineNumber}`} className="text-purple-900 font-black hover:underline" dir="ltr">
                    <bdi dir="ltr">{hotlineNumber}</bdi>
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <EgyptianPhoneSvg className="w-6 h-6 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <span>استفسارات الحجز:</span>
                  <a href={`tel:${inquiriesNumber}`} className="text-slate-900 font-black hover:underline" dir="ltr">
                    <bdi dir="ltr">{inquiriesNumber}</bdi>
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Channels */}
          <div className="space-y-4">
            <h4 className="text-slate-900 font-black text-base">تابعنا على المنصات الرسمية</h4>
            <p className="text-xs text-slate-500 font-medium">شاهد الشروحات التأسيسية والمسابقات الأسبوعية:</p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform drop-shadow-sm"
                aria-label="YouTube"
                title={`قناة ${academyName} على يوتيوب`}
              >
                <YouTubePlaySvg className="w-9 h-9" />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform drop-shadow-sm"
                aria-label="Facebook"
                title="صفحة الأكاديمية على فيسبوك"
              >
                <FacebookBadgeSvg className="w-9 h-9" />
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform drop-shadow-sm"
                aria-label="WhatsApp"
                title="جروب أولياء الأمور على واتساب"
              >
                <WhatsAppBubbleSvg className="w-9 h-9" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Rights */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p suppressHydrationWarning>© {new Date().getFullYear()} {academyName} — جميع الحقوق محفوظة لـ {teacherNameArabic || teacherName || "إدارة المنصة"}.</p>
          <div className="flex items-center gap-1.5 text-xs text-purple-700 font-bold bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            <span>المنصة الذكية الأولى لتأسيس اللغة الإنجليزية للأطفال 🌟</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
