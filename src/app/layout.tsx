import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { GlobalHeader } from "@/components/GlobalHeader";
import { CacheCleanup } from "@/components/ai/CacheCleanup";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coach Hamza's Ramadan Guide",
  description:
    "An interactive guide for athletes fasting during Ramadan — by Hamza Abdullah, retired NFL player.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ramadan Guide",
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
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-background text-foreground`}>
        <CacheCleanup />
        <DesktopNav />
        <GlobalHeader />
        <main className="safe-bottom md:pt-14">{children}</main>
        <BottomNav />
        <Analytics />
      </body>
    </html>
  );
}
