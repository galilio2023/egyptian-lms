"use client";

import { GraduationCap } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MockPlatformSettings } from "@/lib/db/mock-data";

interface AcademyBrandingSectionProps {
  settings: MockPlatformSettings;
  onChange: (field: keyof MockPlatformSettings, value: string) => void;
}

export function AcademyBrandingSection({ settings, onChange }: AcademyBrandingSectionProps) {
  return (
    <Card className="border-2 border-purple-100 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2.5 border-b border-purple-50 pb-3">
        <GraduationCap className="w-5 h-5 text-purple-600" />
        <h2 className="font-black text-base text-slate-900">هوية الأكاديمية واسم المعلم المشرف</h2>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Arabic Academy Name */}
          <div className="space-y-1.5 text-right">
            <label htmlFor="academyNameArabic" className="text-xs font-bold text-slate-700">
              اسم الأكاديمية (باللغة العربية)
            </label>
            <Input
              id="academyNameArabic"
              type="text"
              required
              value={settings.academyNameArabic}
              onChange={(e) => onChange("academyNameArabic", e.target.value)}
              className="bg-purple-50/40 border-purple-200 text-xs font-bold"
            />
          </div>

          {/* English Academy Name */}
          <div className="space-y-1.5 text-right">
            <label htmlFor="academyNameEnglish" className="text-xs font-bold text-slate-700">
              Academy Name (English)
            </label>
            <Input
              id="academyNameEnglish"
              type="text"
              dir="ltr"
              required
              value={settings.academyNameEnglish}
              onChange={(e) => onChange("academyNameEnglish", e.target.value)}
              className="bg-purple-50/40 border-purple-200 text-xs font-bold text-left"
            />
          </div>

          {/* Arabic Teacher Name */}
          <div className="space-y-1.5 text-right">
            <label htmlFor="teacherNameArabic" className="text-xs font-bold text-slate-700">
              اسم المعلم المشرف (باللغة العربية)
            </label>
            <Input
              id="teacherNameArabic"
              type="text"
              required
              value={settings.teacherNameArabic}
              onChange={(e) => onChange("teacherNameArabic", e.target.value)}
              className="bg-purple-50/40 border-purple-200 text-xs font-bold"
            />
          </div>

          {/* English Teacher Name */}
          <div className="space-y-1.5 text-right">
            <label htmlFor="teacherNameEnglish" className="text-xs font-bold text-slate-700">
              Instructor Name (English)
            </label>
            <Input
              id="teacherNameEnglish"
              type="text"
              dir="ltr"
              required
              value={settings.teacherNameEnglish}
              onChange={(e) => onChange("teacherNameEnglish", e.target.value)}
              className="bg-purple-50/40 border-purple-200 text-xs font-bold text-left"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
