import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | بوابة الأبطال",
    default: "لوحة تحكم البطل | المنصة التعليمية الذكية",
  },
  description: "بوابة التعلم الذكية للأبطال لمتابعة المناهج والدروس التفاعلية والاختبارات.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-b from-purple-50/40 via-white to-purple-50/30 text-slate-900 selection:bg-purple-500 selection:text-white">
      {children}
    </div>
  );
}
