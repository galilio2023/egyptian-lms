"use client";

import { Phone, ExternalLink, Wallet } from "lucide-react";
import { 
  WhatsAppBubbleSvg, 
  EgyptianPhoneSvg, 
  HotlinePhoneSvg 
} from "@/components/ui/illustrated-icons";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MockPlatformSettings } from "@/lib/db/mock-data";

interface ContactPhonesSectionProps {
  settings: MockPlatformSettings;
  onChange: (field: keyof MockPlatformSettings, value: string) => void;
}

export function ContactPhonesSection({ settings, onChange }: ContactPhonesSectionProps) {
  return (
    <Card className="border-2 border-purple-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-purple-50 pb-3">
        <div className="flex items-center gap-2.5">
          <Phone className="w-5 h-5 text-emerald-600" />
          <h2 className="font-black text-base text-slate-900">أرقام التواصل وخدمة أولياء الأمور</h2>
        </div>
        <span className="text-[11px] text-emerald-700 bg-emerald-50 font-bold px-3 py-1 rounded-full border border-emerald-200">
          تظهر في الهيدر، الفوتر، والزر العائم
        </span>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* WhatsApp Number */}
          <div className="space-y-1.5 text-right">
            <div className="flex items-center justify-between">
              <label htmlFor="whatsappNumber" className="text-xs font-bold text-slate-700">
                رقم واتساب المتابعة الرئيسي
              </label>
              <WhatsAppBubbleSvg className="w-5 h-5" />
            </div>
            <Input
              id="whatsappNumber"
              type="tel"
              dir="ltr"
              required
              placeholder="2010xxxxxxxx"
              value={settings.whatsappNumber}
              onChange={(e) => onChange("whatsappNumber", e.target.value)}
              className="bg-purple-50/40 border-purple-200 text-xs font-mono font-bold"
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
            <div className="flex items-center justify-between">
              <label htmlFor="hotlineNumber" className="text-xs font-bold text-slate-700">
                الخط الساخن أو الهاتف الأرضي
              </label>
              <HotlinePhoneSvg className="w-5 h-5" />
            </div>
            <Input
              id="hotlineNumber"
              type="tel"
              dir="ltr"
              required
              placeholder="0225006000"
              value={settings.hotlineNumber}
              onChange={(e) => onChange("hotlineNumber", e.target.value)}
              className="bg-purple-50/40 border-purple-200 text-xs font-mono font-bold"
            />
            <span className="text-[10px] text-slate-400 block pt-0.5">يظهر أسفل الموقع لدعم الهواتف الأرضية</span>
          </div>

          {/* Inquiries Mobile */}
          <div className="space-y-1.5 text-right">
            <div className="flex items-center justify-between">
              <label htmlFor="inquiriesNumber" className="text-xs font-bold text-slate-700">
                رقم استفسارات الحجز والسناتر
              </label>
              <EgyptianPhoneSvg className="w-5 h-5" />
            </div>
            <Input
              id="inquiriesNumber"
              type="tel"
              dir="ltr"
              required
              placeholder="011xxxxxxxx"
              value={settings.inquiriesNumber}
              onChange={(e) => onChange("inquiriesNumber", e.target.value)}
              className="bg-purple-50/40 border-purple-200 text-xs font-mono font-bold"
            />
            <span className="text-[10px] text-slate-400 block pt-0.5">مخصص لاستقبال مكالمات الحجز</span>
          </div>
        </div>

        {/* Payment Wallets & Transfer Details */}
        <div className="mt-6 pt-5 border-t border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-xs text-slate-800">حسابات التحويل المالي واستقبال الاشتراكات (إنستاباي وفودافون كاش)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Vodafone Cash Number */}
            <div className="space-y-1.5 text-right">
              <label htmlFor="vodafoneCashNumber" className="text-xs font-bold text-slate-700">
                رقم محفظة فودافون كاش / المحافظ الإلكترونية
              </label>
              <Input
                id="vodafoneCashNumber"
                type="tel"
                dir="ltr"
                placeholder="010xxxxxxxx"
                value={settings.vodafoneCashNumber || ""}
                onChange={(e) => onChange("vodafoneCashNumber", e.target.value)}
                className="bg-purple-50/40 border-purple-200 text-xs font-mono font-bold text-left"
              />
              <span className="text-[10px] text-slate-400 block pt-0.5">يظهر لولي الأمر عند اختيار التحويل اليدوي</span>
            </div>

            {/* InstaPay Address */}
            <div className="space-y-1.5 text-right">
              <label htmlFor="instapayAddress" className="text-xs font-bold text-slate-700">
                عنوان حساب إنستاباي (InstaPay Address / IPA)
              </label>
              <Input
                id="instapayAddress"
                type="text"
                dir="ltr"
                placeholder="username@instapay"
                value={settings.instapayAddress || ""}
                onChange={(e) => onChange("instapayAddress", e.target.value)}
                className="bg-purple-50/40 border-purple-200 text-xs font-mono font-bold text-left"
              />
              <span className="text-[10px] text-slate-400 block pt-0.5">مثال: name@instapay للتحويل المباشر</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
