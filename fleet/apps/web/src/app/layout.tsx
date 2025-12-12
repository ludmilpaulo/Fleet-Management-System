import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from '@/providers/ReduxProvider';
import { MixpanelProvider } from '@/components/providers/mixpanel-provider';
import { I18nProvider } from '@/providers/I18nProvider';
import { CacheClearer } from '@/components/cache/CacheClearer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.fleetia.online'),
  title: {
    default: "Fleet Management System - Modern Fleet Operations Platform",
    template: "%s | Fleet Management System"
  },
  description: "Modern fleet management system with role-based access for admin, staff, drivers, and inspectors. Track vehicles, manage drivers, schedule maintenance, and ensure compliance all in one platform.",
  keywords: [
    "fleet management",
    "vehicle tracking",
    "fleet operations",
    "driver management",
    "vehicle maintenance",
    "fleet analytics",
    "route optimization",
    "fleet compliance",
    "fleet software",
    "commercial vehicle management"
  ],
  authors: [{ name: "FleetIA Team" }],
  creator: "FleetIA",
  publisher: "FleetIA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.fleetia.online",
    siteName: "Fleet Management System",
    title: "Fleet Management System - Modern Fleet Operations Platform",
    description: "Modern fleet management system with role-based access. Streamline your fleet operations with comprehensive tracking and management.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Fleet Management System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fleet Management System - Modern Fleet Operations Platform",
    description: "Modern fleet management system with role-based access for comprehensive fleet operations.",
    images: ["/og-image.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fleet Management",
  },
  alternates: {
    canonical: "https://www.fleetia.online",
  },
  category: "Business",
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <CacheClearer />
        <ReduxProvider>
          <MixpanelProvider>
            <I18nProvider>
              {children}
            </I18nProvider>
          </MixpanelProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
