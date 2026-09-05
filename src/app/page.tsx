"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloatingButton } from "@/components/layout/whatsapp-floating-btn";
import { EgyptianCheckoutModal } from "@/features/checkout";
import { 
  INITIAL_UNITS, 
  INITIAL_PLATFORM_SETTINGS,
  type MockUnit,
  type MockPlatformSettings 
} from "@/lib/db/mock-data";
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

export default function HomePage() {
  const [selectedUnit, setSelectedUnit] = useState<MockUnit | null>(null);
  const [activeGradeFilter, setActiveGradeFilter] = useState<string>("all");
  const [units, setUnits] = useState<MockUnit[]>(INITIAL_UNITS);
  const [settings, setSettings] = useState<MockPlatformSettings>(INITIAL_PLATFORM_SETTINGS);

  useEffect(() => {
    let active = true;
    fetch("/api/public/landing-data")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) {
          if (data?.units && data.units.length > 0) {
            setUnits(data.units);
          }
          if (data?.settings) {
            setSettings(data.settings);
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col text-slate-900 overflow-x-hidden relative">
      {/* Background artwork & frosted overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-20 scale-105 pointer-events-none"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      <div className="fixed inset-0 bg-white/35 backdrop-blur-[0.5px] -z-10 pointer-events-none" />

      {/* Global Header */}
      <Header 
        academyName={settings.academyNameArabic}
        teacherName={settings.teacherNameEnglish}
      />

      {/* Landing Feature Sections */}
      <HeroSection teacherName={settings.teacherNameArabic} />
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
            alert("تم تسجيل طلب الاشتراك وتفعيله بنجاح!");
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
