import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { DockNav } from "@/components/DockNav";
import { GlobalHeader } from "@/components/GlobalHeader";
import { CacheCleanup } from "@/components/ai/CacheCleanup";
import { Analytics } from "@vercel/analytics/next";
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
    default: "Your Personal Ramadan Coach",
    template: "%s | Ramadan Coach",
  },
  description:
    "Your personal Ramadan coach for athletes — by Coach Hamza Abdullah, retired NFL player. Track prayers, hydration, nutrition, and build your personalized routine.",
  keywords: [
    "Ramadan",
    "fasting",
    "athletes",
    "Muslim",
    "Islam",
    "Hamza Abdullah",
    "NFL",
    "hydration",
    "nutrition",
    "prayer tracker",
    "Quran",
    "Ramadan coach",
  ],
  authors: [{ name: "Hamza Abdullah", url: "https://probigbros.com" }],
  creator: "Hamza Abdullah",
  publisher: "Pro Big Bros LLC",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ramadan Coach",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Your Personal Ramadan Coach",
    title: "Your Personal Ramadan Coach - by Coach Hamza",
    description:
      "Your personal Ramadan coach for athletes — by Coach Hamza Abdullah, retired NFL player.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Your Personal Ramadan Coach Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Your Personal Ramadan Coach",
    description:
      "Your personal Ramadan coach for athletes — by Coach Hamza Abdullah, retired NFL player.",
    images: ["/icon-512.png"],
    creator: "@ProBigBros",
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
    name: "Your Personal Ramadan Coach",
    description:
      "Your personal Ramadan coach for athletes — by Coach Hamza Abdullah, retired NFL player.",
    url: siteUrl,
    applicationCategory: "HealthApplication",
    operatingSystem: "Any",
    author: {
      "@type": "Person",
      name: "Hamza Abdullah",
      jobTitle: "Retired NFL Player & Ramadan Coach",
      url: "https://probigbros.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Pro Big Bros LLC",
      url: "https://probigbros.com",
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
