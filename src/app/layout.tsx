import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { Toaster } from "sonner";
import { ServiceWorkerRegister } from "@/components/shared/service-worker-register";
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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://elite-academy.edu.eg";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "المنصة التعليمية الذكية للأبطال | منهج اللغة الإنجليزية",
    template: "%s | أكاديمية إيليت التعليمية",
  },
  description: "المنصة الرائدة والممتعة في تعليم وتأسيس اللغة الإنجليزية للأطفال والمراحل الابتدائية (Grade 1 - Grade 6). شرح كرتوني تفاعلي، مغامرات واختبارات بمكافآت، ومتابعة دورية لأولياء الأمور.",
  applicationName: "المنصة التعليمية الذكية",
  authors: [{ name: "Elite Academy", url: appUrl }],
  generator: "Next.js",
  keywords: [
    "المنصة التعليمية الذكية",
    "تعليم انجليزي اطفال",
    "منهج كونكت",
    "Connect Plus",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "تأسيس فونكس وصوتيات",
    "كويزات تفاعلية",
  ],
  creator: "Elite Academy Education",
  publisher: "Elite Academy",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "المنصة التعليمية الذكية للأبطال | أكاديمية إيليت",
    description: "المنصة الرائدة في تعليم وتأسيس اللغة الإنجليزية للأطفال والمراحل الابتدائية بشرح تفاعلي كرتوني.",
    url: "/",
    siteName: "أكاديمية إيليت التعليمية",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "شعار المنصة التعليمية الذكية للأبطال",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "المنصة التعليمية الذكية للأبطال | أكاديمية إيليت",
    description: "شرح تفاعلي كرتوني وكويزات وجوائز تميز في اللغة الإنجليزية للمراحل الابتدائية.",
    images: ["/icon-512.png"],
  },
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
    title: "Elite Academy",
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
        <ServiceWorkerRegister />
        {children}
        <Toaster richColors position="top-center" dir="rtl" />
      </body>
    </html>
  );
}

