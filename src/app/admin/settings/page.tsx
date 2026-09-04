"use client";

import { useState } from "react";
import { Save, Sliders, Info } from "lucide-react";
import { AdminPageHeader } from "@/components/shared";
import { Button } from "@/components/ui";
import { EliteLogoBadge } from "@/components/ui/illustrated-icons";
import {
  ContactPhonesSection,
  AcademyBrandingSection,
  HeroVideoSection,
  CarouselLecturesSection,
  AddSampleLectureModal,
  useAdminSettings,
} from "@/features/admin-settings";

export default function AdminSettingsPage() {
  const {
    settings,
    isLoading,
    isSaving,
    handleFieldChange,
    saveSettings,
    addSampleLecture,
    removeSampleLecture,
  } = useAdminSettings();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-8 text-center space-y-3">
        <EliteLogoBadge className="w-12 h-12 mx-auto animate-bounce" />
        <p className="text-xs font-bold text-purple-900">جاري تحميل إعدادات المنصة والهواتف...</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <AdminPageHeader
        title="إعدادات المنصة وهواتف التواصل وكاروسيل المحاضرات"
        description="تحكم كامل في أسماء الأكاديمية والمعلم، أرقام الواتساب وخدمة العملاء، وفيديوهات المعاينة المجانية بالصفحة الرئيسية."
        icon={<Sliders className="w-7 h-7 text-purple-600" />}
        actions={
          <Button
            variant="vibrant"
            onClick={() => saveSettings()}
            isLoading={isSaving}
          >
            <Save className="w-4 h-4 me-1" />
            <span>حفظ كافة التغييرات الآن</span>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Contact Phone Numbers */}
        <ContactPhonesSection
          settings={settings}
          onChange={handleFieldChange}
        />

        {/* 2. Academy & Teacher Branding */}
        <AcademyBrandingSection
          settings={settings}
          onChange={handleFieldChange}
        />

        {/* 3. Hero Video */}
        <HeroVideoSection
          heroVideoUrl={settings.heroVideoUrl}
          onChange={(val) => handleFieldChange("heroVideoUrl", val)}
        />

        {/* 4. Carousel Sample Lectures */}
        <CarouselLecturesSection
          lectures={settings.sampleLectures || []}
          onDeleteLecture={removeSampleLecture}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Sticky Save Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Info className="w-4 h-4 text-amber-400" />
            <span>التعديلات تنعكس فوراً على كامل صفحات المنصة والموقع العام.</span>
          </div>

          <Button
            type="submit"
            variant="vibrant"
            isLoading={isSaving}
          >
            حفظ التغييرات الآن
          </Button>
        </div>
      </form>

      {/* Add Sample Lecture Modal */}
      <AddSampleLectureModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addSampleLecture}
        currentCount={settings.sampleLectures?.length || 0}
      />
    </div>
  );
}
