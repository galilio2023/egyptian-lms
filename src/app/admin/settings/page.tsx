"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Save, 
  Plus, 
  Trash2, 
  Play, 
  ExternalLink, 
  Phone, 
  Video, 
  GraduationCap, 
  Sliders,
  Sparkles,
  Info
} from "lucide-react";
import { 
  WhatsAppBubbleSvg, 
  EgyptianPhoneSvg, 
  HotlinePhoneSvg, 
  EliteLogoBadge 
} from "@/components/ui/illustrated-icons";
import { INITIAL_PLATFORM_SETTINGS, MockPlatformSettings } from "@/lib/db/mock-data";
import type { FreeSampleLecture } from "@/lib/db/schema";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<MockPlatformSettings>(INITIAL_PLATFORM_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New Lecture Modal State
  const [isAddingLecture, setIsAddingLecture] = useState(false);
  const [newLecture, setNewLecture] = useState<FreeSampleLecture>({
    id: "",
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    badgeText: "مجاني",
    orderIndex: 1,
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/actions?type=settings");
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.warn("Failed to load settings from DB, using defaults:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          payload: settings,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "حدث خطأ أثناء حفظ الإعدادات.");
        return;
      }

      toast.success("🎉 تم حفظ وتحديث إعدادات المنصة وهواتف التواصل ومحاضرات الكاروسيل بنجاح!");
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLecture.title.trim() || !newLecture.videoUrl.trim()) {
      toast.error("يرجى ملء عنوان ورابط المحاضرة التجريبية.");
      return;
    }

    // Auto-extract YouTube thumbnail if empty and valid YouTube link
    let finalThumbnail = newLecture.thumbnailUrl.trim();
    if (!finalThumbnail) {
      const ytMatch = newLecture.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (ytMatch && ytMatch[1]) {
        finalThumbnail = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
      } else {
        finalThumbnail = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60";
      }
    }

    const createdItem: FreeSampleLecture = {
      ...newLecture,
      id: `samp-${Date.now()}`,
      thumbnailUrl: finalThumbnail,
      orderIndex: (settings.sampleLectures?.length || 0) + 1,
    };

    setSettings((prev) => ({
      ...prev,
      sampleLectures: [...(prev.sampleLectures || []), createdItem],
    }));

    setIsAddingLecture(false);
    setNewLecture({
      id: "",
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      badgeText: "مجاني",
      orderIndex: 1,
    });

    toast.info("تمت إضافة المحاضرة للقائمة. اضغط على 'حفظ كافة التغييرات' لاعتمادها.");
  };

  const handleDeleteLecture = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      sampleLectures: (prev.sampleLectures || []).filter((l) => l.id !== id),
    }));
    toast.info("تم حذف المحاضرة من القائمة. اضغط على 'حفظ كافة التغييرات' لتثبيت الحذف.");
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center space-y-3">
        <EliteLogoBadge className="w-12 h-12 mx-auto animate-bounce" />
        <p className="text-xs font-bold text-purple-900">جاري تحميل إعدادات المنصة والهواتف...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <Sliders className="w-7 h-7 text-purple-600" />
            <span>إعدادات المنصة وهواتف التواصل وكاروسيل المحاضرات</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            تحكم كامل في أسماء الأكاديمية والمعلم، أرقام الواتساب وخدمة العملاء، وفيديوهات المعاينة المجانية بالصفحة الرئيسية.
          </p>
        </div>

        <button
          onClick={() => handleSaveSettings()}
          disabled={isSaving}
          className="px-6 py-3 rounded-2xl bg-gradient-vibrant hover:scale-[1.02] text-white font-black text-xs shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "جاري الحفظ..." : "حفظ كافة التغييرات الآن"}</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">

        {/* 1. Contact Phone Numbers Section */}
        <div className="modern-card bg-white p-6 sm:p-7 rounded-3xl border-2 border-purple-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-purple-50 pb-3">
            <div className="flex items-center gap-2.5">
              <Phone className="w-5 h-5 text-emerald-600" />
              <h2 className="font-black text-base text-slate-900">أرقام التواصل وخدمة أولياء الأمور</h2>
            </div>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 font-bold px-3 py-1 rounded-full border border-emerald-200">
              تظهر في الهيدر، الفوتر، والزر العائم
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* WhatsApp Number */}
            <div className="space-y-1.5 text-right">
              <label htmlFor="whatsappNumber" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>رقم واتساب المتابعة الرئيسي</span>
                <WhatsAppBubbleSvg className="w-5 h-5" />
              </label>
              <input
                id="whatsappNumber"
                type="tel"
                dir="ltr"
                required
                placeholder="2010xxxxxxxx"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 font-mono font-bold"
              />
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-emerald-600 font-bold inline-flex items-center gap-1 hover:underline pt-0.5"
              >
                <span>تجربة الرابط المباشر لواتساب</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Hotline */}
            <div className="space-y-1.5 text-right">
              <label htmlFor="hotlineNumber" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>الخط الساخن أو الهاتف الأرضي</span>
                <HotlinePhoneSvg className="w-5 h-5" />
              </label>
              <input
                id="hotlineNumber"
                type="tel"
                dir="ltr"
                required
                placeholder="0225006000"
                value={settings.hotlineNumber}
                onChange={(e) => setSettings({ ...settings, hotlineNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 block pt-0.5">يظهر أسفل الموقع لدعم الهواتف الأرضية</span>
            </div>

            {/* Inquiries Mobile */}
            <div className="space-y-1.5 text-right">
              <label htmlFor="inquiriesNumber" className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>رقم استفسارات الحجز والسناتر</span>
                <EgyptianPhoneSvg className="w-5 h-5" />
              </label>
              <input
                id="inquiriesNumber"
                type="tel"
                dir="ltr"
                required
                placeholder="01120004000"
                value={settings.inquiriesNumber}
                onChange={(e) => setSettings({ ...settings, inquiriesNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 block pt-0.5">مخصص لاستقبال مكالمات الحجز</span>
            </div>
          </div>
        </div>

        {/* 2. Academy & Teacher Branding */}
        <div className="modern-card bg-white p-6 sm:p-7 rounded-3xl border-2 border-purple-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-purple-50 pb-3">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <h2 className="font-black text-base text-slate-900">هوية الأكاديمية واسم المعلم المشرف</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Arabic Academy Name */}
            <div className="space-y-1.5 text-right">
              <label htmlFor="academyNameArabic" className="text-xs font-bold text-slate-700">
                اسم الأكاديمية (باللغة العربية)
              </label>
              <input
                id="academyNameArabic"
                type="text"
                required
                value={settings.academyNameArabic}
                onChange={(e) => setSettings({ ...settings, academyNameArabic: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 font-bold"
              />
            </div>

            {/* English Academy Name */}
            <div className="space-y-1.5 text-right">
              <label htmlFor="academyNameEnglish" className="text-xs font-bold text-slate-700">
                Academy Name (English)
              </label>
              <input
                id="academyNameEnglish"
                type="text"
                dir="ltr"
                required
                value={settings.academyNameEnglish}
                onChange={(e) => setSettings({ ...settings, academyNameEnglish: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 font-bold text-left"
              />
            </div>

            {/* Arabic Teacher Name */}
            <div className="space-y-1.5 text-right">
              <label htmlFor="teacherNameArabic" className="text-xs font-bold text-slate-700">
                اسم المعلم المشرف (باللغة العربية)
              </label>
              <input
                id="teacherNameArabic"
                type="text"
                required
                value={settings.teacherNameArabic}
                onChange={(e) => setSettings({ ...settings, teacherNameArabic: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 font-bold"
              />
            </div>

            {/* English Teacher Name */}
            <div className="space-y-1.5 text-right">
              <label htmlFor="teacherNameEnglish" className="text-xs font-bold text-slate-700">
                Instructor Name (English)
              </label>
              <input
                id="teacherNameEnglish"
                type="text"
                dir="ltr"
                required
                value={settings.teacherNameEnglish}
                onChange={(e) => setSettings({ ...settings, teacherNameEnglish: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 font-bold text-left"
              />
            </div>
          </div>
        </div>

        {/* 3. Hero Video Section */}
        <div className="modern-card bg-white p-6 sm:p-7 rounded-3xl border-2 border-purple-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-purple-50 pb-3">
            <Video className="w-5 h-5 text-indigo-600" />
            <h2 className="font-black text-base text-slate-900">فيديو الشرح التفاعلي الرئيسي (Hero Video)</h2>
          </div>

          <div className="space-y-1.5 text-right">
            <label htmlFor="heroVideoUrl" className="text-xs font-bold text-slate-700">
              رابط بث الفيديو الرئيسي (HLS / m3u8 أو MP4 أو Bunny Stream)
            </label>
            <input
              id="heroVideoUrl"
              type="url"
              dir="ltr"
              required
              value={settings.heroVideoUrl}
              onChange={(e) => setSettings({ ...settings, heroVideoUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-200 text-slate-900 text-xs focus:outline-none focus:border-purple-600 font-mono font-bold"
            />
            <p className="text-[11px] text-slate-500 font-medium">
              هذا هو الفيديو التفاعلي ذو العلامة المائية الذي يظهر مباشرة في واجهة الصفحة الرئيسية للزوار الجدد.
            </p>
          </div>
        </div>

        {/* 4. Free Sample Lectures Carousel Management */}
        <div className="modern-card bg-white p-6 sm:p-7 rounded-3xl border-2 border-purple-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-50 pb-4">
            <div>
              <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Play className="w-5 h-5 text-pink-600" />
                <span>كاروسيل المحاضرات التجريبية المجانية (Carousel Lectures)</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                الفيديوهات التي تظهر في قسم &quot;المحاضرات المجانية — شاهد قبل ما تشترك&quot; على الصفحة الرئيسية.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingLecture(true)}
              className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة محاضرة جديدة للكاروسيل</span>
            </button>
          </div>

          {/* Existing Lectures Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings.sampleLectures?.map((lecture, idx) => (
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
                    onClick={() => handleDeleteLecture(lecture.id)}
                    className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف هذه المحاضرة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Lecture Modal Form */}
          {isAddingLecture && (
            <div className="p-5 rounded-2xl bg-purple-50/70 border-2 border-dashed border-purple-200 space-y-4 animate-in fade-in-50">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  إضافة محاضرة جديدة لكاروسيل الصفحة الرئيسية
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingLecture(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  إلغاء
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 text-right">
                  <label htmlFor="newLectureTitle" className="text-[11px] font-bold text-slate-700">عنوان المحاضرة</label>
                  <input
                    id="newLectureTitle"
                    type="text"
                    required
                    placeholder="مثال: Grade 1 Unit 2 Phonics"
                    value={newLecture.title}
                    onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1 text-right">
                  <label htmlFor="newLectureVideoUrl" className="text-[11px] font-bold text-slate-700">رابط الفيديو (YouTube أو مباشر)</label>
                  <input
                    id="newLectureVideoUrl"
                    type="url"
                    dir="ltr"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newLecture.videoUrl}
                    onChange={(e) => setNewLecture({ ...newLecture, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1 text-right">
                  <label htmlFor="newLectureDescription" className="text-[11px] font-bold text-slate-700">الوصف المختصر</label>
                  <input
                    id="newLectureDescription"
                    type="text"
                    placeholder="شرح تفاعلي وممتع للصوتيات"
                    value={newLecture.description}
                    onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs"
                  />
                </div>

                <div className="space-y-1 text-right">
                  <label htmlFor="newLectureBadgeText" className="text-[11px] font-bold text-slate-700">نص الشارة</label>
                  <input
                    id="newLectureBadgeText"
                    type="text"
                    placeholder="مجاني / تجريبي"
                    value={newLecture.badgeText}
                    onChange={(e) => setNewLecture({ ...newLecture, badgeText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleAddLecture}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow transition-all cursor-pointer"
                >
                  إضافة المحاضرة
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Save Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Info className="w-4 h-4 text-amber-400" />
            <span>التعديلات تنعكس فوراً على كامل صفحات المنصة والموقع العام.</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-vibrant hover:scale-[1.02] text-white font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            {isSaving ? "جاري الحفظ..." : "حفظ التغييرات الآن"}
          </button>
        </div>

      </form>

    </div>
  );
}
