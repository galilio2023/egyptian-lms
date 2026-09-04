"use client";

import { Video } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface HeroVideoSectionProps {
  heroVideoUrl: string;
  onChange: (value: string) => void;
}

export function HeroVideoSection({ heroVideoUrl, onChange }: HeroVideoSectionProps) {
  return (
    <Card className="border-2 border-purple-100 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2.5 border-b border-purple-50 pb-3">
        <Video className="w-5 h-5 text-indigo-600" />
        <h2 className="font-black text-base text-slate-900">فيديو الشرح التفاعلي الرئيسي (Hero Video)</h2>
      </CardHeader>

      <CardContent className="pt-5 space-y-1.5 text-right">
        <label htmlFor="heroVideoUrl" className="text-xs font-bold text-slate-700">
          رابط بث الفيديو الرئيسي (HLS / m3u8 أو MP4 أو Bunny Stream)
        </label>
        <Input
          id="heroVideoUrl"
          type="url"
          dir="ltr"
          required
          value={heroVideoUrl}
          onChange={(e) => onChange(e.target.value)}
          className="bg-purple-50/40 border-purple-200 text-xs font-mono font-bold"
        />
        <p className="text-[11px] text-slate-500 font-medium">
          هذا هو الفيديو التفاعلي ذو العلامة المائية الذي يظهر مباشرة في واجهة الصفحة الرئيسية للزوار الجدد.
        </p>
      </CardContent>
    </Card>
  );
}
