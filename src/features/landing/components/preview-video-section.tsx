import { ProtectedVideoPlayer } from "@/features/video-player";
import { DrmVideoShieldSvg } from "@/components/ui/illustrated-icons";
import { type MockPlatformSettings } from "@/lib/db/mock-data";

export interface PreviewVideoSectionProps {
  settings: MockPlatformSettings;
}

export const PreviewVideoSection: React.FC<PreviewVideoSectionProps> = ({ settings }) => {
  return (
    <section className="py-16 bg-white/60 border-y border-purple-100/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold text-purple-800 px-3.5 py-1 rounded-full bg-purple-100 border border-purple-200 inline-flex items-center gap-2">
            <DrmVideoShieldSvg className="w-5 h-5" />
            <span>معاينة المحاضرة والشرح التفاعلي</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            تجربة حية لمنصة البث والشرح الرقمي
          </h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto font-medium">
            بث فيديو بتقنية HLS مع علامة مائية ديناميكية مخصصة لحماية المحتوى الرقمي وضمان سرعة العرض وجودته.
          </p>
        </div>

        <div className="rounded-3xl p-3 bg-gradient-to-tr from-purple-900 via-indigo-950 to-slate-900 shadow-2xl shadow-indigo-500/20 border-2 border-purple-500/30">
          <ProtectedVideoPlayer
            src={settings.heroVideoUrl || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"}
            studentName={`طالب ${settings.academyNameArabic} (نموذج تجريبي)`}
            studentPhone={settings.whatsappNumber || "01020003000"}
            title="نموذج شرح تفاعلي — Phonics & Letters"
          />
        </div>
      </div>
    </section>
  );
};
