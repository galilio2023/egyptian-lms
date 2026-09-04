import React from "react";
import { User, ChevronLeft } from "lucide-react";
import { EGYPTIAN_GOVERNORATES, INITIAL_GRADES } from "@/lib/db/mock-data";
import { EgyptianPhoneSvg, CurriculumBookSvg } from "@/components/ui/illustrated-icons";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface RegisterStep1Props {
  fullname: string;
  setFullname: (v: string) => void;
  studentPhone: string;
  setStudentPhone: (v: string) => void;
  governorate: string;
  setGovernorate: (v: string) => void;
  gradeLevel: string;
  setGradeLevel: (v: string) => void;
  onNext: (e: React.MouseEvent) => void;
}

export const RegisterStep1: React.FC<RegisterStep1Props> = ({
  fullname,
  setFullname,
  studentPhone,
  setStudentPhone,
  governorate,
  setGovernorate,
  gradeLevel,
  setGradeLevel,
  onNext,
}) => {
  return (
    <div className="space-y-4 text-right">
      {/* Full Name */}
      <Input
        label="اسم الطالب ثلاثياً باللغة العربية"
        required
        placeholder="مثال: يوسف أحمد محمود"
        value={fullname}
        onChange={(e) => setFullname(e.target.value)}
        icon={<User className="w-4 h-4" />}
      />

      {/* Student Phone */}
      <div className="space-y-1.5 text-right">
        <label className="block text-xs font-black text-slate-700">
          رقم موبايل الطالب (اسم المستخدم للدخول)
        </label>
        <div className="relative">
          <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
            <EgyptianPhoneSvg className="w-4 h-4" />
          </div>
          <input
            type="tel"
            dir="ltr"
            required
            maxLength={11}
            placeholder="01012345678"
            value={studentPhone}
            onChange={(e) => setStudentPhone(e.target.value.replace(/\D/g, ""))}
            className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-purple-50/40 border border-purple-200 text-slate-900 placeholder-slate-400 text-xs font-mono font-bold focus:outline-none focus:border-purple-600 text-right"
          />
        </div>
        <p className="text-[10px] text-slate-400 font-medium">
          سيتم استخدام رقم الموبايل لتسجيل الدخول إلى المنصة لاحقاً.
        </p>
      </div>

      {/* Governorate Select */}
      <Select
        label="المحافظة"
        value={governorate}
        onChange={(e) => setGovernorate(e.target.value)}
      >
        <option value="">-- اختر المحافظة --</option>
        {EGYPTIAN_GOVERNORATES.map((gov) => (
          <option key={gov} value={gov}>
            {gov}
          </option>
        ))}
      </Select>

      {/* Grade Selector */}
      <div className="space-y-2 text-right">
        <label className="block text-xs font-black text-slate-700 flex items-center gap-1.5">
          <CurriculumBookSvg className="w-4 h-4" />
          <span>اختر الصف الدراسي للبطل</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INITIAL_GRADES.map((g) => {
            const isSelected = gradeLevel === String(g.gradeNumber);
            return (
              <button
                type="button"
                key={g.id}
                onClick={() => setGradeLevel(String(g.gradeNumber))}
                className={`p-2.5 rounded-xl border-2 text-right transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-600 shadow-md ring-2 ring-purple-200"
                    : "bg-white border-purple-100 hover:border-purple-300 hover:bg-purple-50/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 block">{g.titleEnglish}</span>
                  {isSelected && <span className="text-purple-600 font-black text-xs">✓</span>}
                </div>
                <span className="text-[10px] text-purple-700 font-bold block mt-0.5">{g.titleArabic}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 1 Next Button */}
      <div className="pt-2">
        <Button
          type="button"
          variant="vibrant"
          size="md"
          onClick={onNext}
          className="w-full"
        >
          <span>المتابعة إلى بيانات الأمان وولي الأمر</span>
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
