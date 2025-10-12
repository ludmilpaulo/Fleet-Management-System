import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@styles/globals.css";
import { ReduxProvider } from '@/providers/ReduxProvider';
import { MixpanelProvider } from '@/components/providers/mixpanel-provider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fleet Management System",
  description: "Modern fleet management system with role-based access for admin, staff, drivers, and inspectors",
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
      >
        <ReduxProvider>
          <MixpanelProvider>
            {children}
          </MixpanelProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
