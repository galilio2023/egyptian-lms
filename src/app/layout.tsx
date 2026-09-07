import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const cairoFont = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-cairo",
});

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "المنصة التعليمية الذكية | منهج اللغة الإنجليزية للمراحل الابتدائية",
  description: "المنصة الرائدة والممتعة في تعليم وتأسيس اللغة الإنجليزية للأطفال والمراحل الابتدائية (Grade 1 - Grade 6). شرح كرتوني تفاعلي، مغامرات واختبارات بمكافآت، ومتابعة دورية لأولياء الأمور.",
  keywords: ["المنصة التعليمية الذكية", "تعليم انجليزي اطفال", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "تأسيس فونكس"],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [
      { url: "/logo.png", sizes: "256x256" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Educational Platform",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairoFont.variable} suppressHydrationWarning>
      <body
        className={`min-h-screen text-slate-900 antialiased ${cairoFont.className}`}
        suppressHydrationWarning
      >
        {children}
        <Toaster richColors position="top-center" dir="rtl" />
      </body>
    </html>
  );
}

