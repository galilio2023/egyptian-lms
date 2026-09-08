"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloatingButton } from "@/components/layout/whatsapp-floating-btn";
import { EgyptianCheckoutModal } from "@/features/checkout";
import type { MockUnit, MockPlatformSettings } from "@/lib/db/mock-data";
import {
  HeroSection,
  PreviewVideoSection,
  SampleLecturesSection,
  TeacherBioSection,
  FeaturesGridSection,
  HonorBoardSection,
  CoursesCatalogSection,
  AdventureQuizzesSection,
} from "@/features/landing";

interface HomePageClientProps {
  initialUnits: MockUnit[];
  initialSettings: MockPlatformSettings;
}

export function HomePageClient({ initialUnits, initialSettings }: HomePageClientProps) {
  const [selectedUnit, setSelectedUnit] = useState<MockUnit | null>(null);
  const [activeGradeFilter, setActiveGradeFilter] = useState<string>("all");
  const [units] = useState<MockUnit[]>(initialUnits);
  const [settings] = useState<MockPlatformSettings>(initialSettings);

  const getBackgroundStyle = () => {
    if (settings.backgroundStyle === "custom_image" && settings.customBackgroundUrl) {
      return { backgroundImage: `url('${settings.customBackgroundUrl}')` };
    }
    if (settings.backgroundStyle === "warm_playful") {
      return {
        background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 40%, #ffedd5 100%)",
      };
    }
    if (settings.backgroundStyle === "academic_blue") {
      return {
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #ede9fe 100%)",
      };
    }
    if (settings.backgroundStyle === "cosmic_purple") {
      return {
        background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 40%, #fae8ff 100%)",
      };
    }
    if (settings.backgroundStyle === "emerald_oasis") {
      return {
        background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #f0fdf4 100%)",
      };
    }
    if (settings.backgroundStyle === "doodle_pattern") {
      return {
        background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e0e7ff 100%)",
      };
    }
    if (settings.backgroundStyle === "sunset_rose") {
      return {
        background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fdf2f8 100%)",
      };
    }
    return { backgroundImage: "url('/images/hero-bg.jpg')" };
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900 overflow-x-hidden relative">
      {/* Background artwork & frosted overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-20 scale-105 pointer-events-none transition-all duration-700"
        style={getBackgroundStyle()}
      />
      <div className="fixed inset-0 bg-white/35 backdrop-blur-[0.5px] -z-10 pointer-events-none" />

      {/* Global Header */}
      <Header 
        academyName={settings.academyNameArabic}
        teacherName={settings.teacherNameEnglish}
      />

      {/* Landing Feature Sections */}
      <HeroSection 
        teacherName={settings.teacherNameArabic} 
        settings={settings}
      />
      <PreviewVideoSection settings={settings} />
      <SampleLecturesSection sampleLectures={settings.sampleLectures} />
      <TeacherBioSection
        teacherNameArabic={settings.teacherNameArabic}
        teacherTitle={settings.teacherTitle}
        teacherBio={settings.teacherBio}
        academyName={settings.academyNameArabic}
      />
      <FeaturesGridSection />
      <HonorBoardSection />
      <AdventureQuizzesSection />
      <CoursesCatalogSection
        units={units}
        activeGradeFilter={activeGradeFilter}
        onGradeFilterChange={setActiveGradeFilter}
        onSelectUnit={setSelectedUnit}
      />

      {/* Instant Checkout Modal */}
      {selectedUnit && (
        <EgyptianCheckoutModal
          unit={selectedUnit}
          isOpen={!!selectedUnit}
          vodafoneCashNumber={settings.vodafoneCashNumber}
          instapayAddress={settings.instapayAddress}
          onClose={() => setSelectedUnit(null)}
          onSuccess={() => {
            toast.success("تم تسجيل طلب الاشتراك وتفعيله بنجاح! 🎉");
            setSelectedUnit(null);
          }}
        />
      )}

      {/* Global Footer & WhatsApp Action */}
      <Footer 
        whatsappNumber={settings.whatsappNumber}
        hotlineNumber={settings.hotlineNumber}
        inquiriesNumber={settings.inquiriesNumber}
        academyName={settings.academyNameArabic}
        teacherName={settings.teacherNameEnglish}
        teacherNameArabic={settings.teacherNameArabic}
      />
      <WhatsAppFloatingButton 
        phoneNumber={settings.whatsappNumber} 
        teacherName={settings.teacherNameArabic}
        academyName={settings.academyNameArabic}
      />
    </div>
  );
}
