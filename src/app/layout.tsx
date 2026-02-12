import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { DockNav } from "@/components/DockNav";
import { GlobalHeader } from "@/components/GlobalHeader";
import { CacheCleanup } from "@/components/ai/CacheCleanup";
import { Analytics } from "@vercel/analytics/react";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { InstallPrompt } from "@/components/InstallPrompt";
import { HealthPromptProvider } from "@/components/health/HealthPromptProvider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://ramadan-guide.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ramadan Companion — Your All-in-One Ramadan App",
    template: "%s | Ramadan Companion",
  },
  description:
    "Track prayers, Qur'an, hydration & dhikr. Get AI-powered coaching, daily reminders, and a personalized Ramadan routine — all in one beautiful app. Free.",
  keywords: [
    "Ramadan",
    "fasting",
    "athletes",
    "Muslim",
    "Islam",
    "hydration",
    "nutrition",
    "prayer tracker",
    "Quran",
    "Ramadan app",
    "dhikr",
  ],
  authors: [{ name: "Mutaaf Aziz" }],
  creator: "Mutaaf Aziz",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ramadan Companion",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Ramadan Companion",
    title: "Ramadan Companion — Prayers, Qur'an, Dhikr & AI Coaching",
    description:
      "Everything you need for your best Ramadan yet. Track prayers, Qur'an progress, hydration & dhikr — with AI-powered daily coaching. Free & private.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Ramadan Companion App",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Ramadan Companion — Your All-in-One Ramadan App",
    description:
      "Track prayers, Qur'an, hydration & dhikr with AI coaching. Everything for your best Ramadan — free & private.",
    images: ["/icon-512.png"],
    creator: "@mutaafaziz",
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
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1c" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Ramadan Companion",
    description:
      "Track prayers, Qur'an, hydration & dhikr with AI-powered coaching. Everything for your best Ramadan.",
    url: siteUrl,
    applicationCategory: "HealthApplication",
    operatingSystem: "Any",
    author: {
      "@type": "Person",
      name: "Mutaaf Aziz",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} antialiased bg-background text-foreground`}>
        <CacheCleanup />
        <GlobalHeader />
        <main className="safe-bottom">{children}</main>
        <DockNav />
        <BottomNav />
        <Analytics />
        <ServiceWorkerRegistration />
        <InstallPrompt />
        <HealthPromptProvider />
      </body>
    </html>
  );
}
