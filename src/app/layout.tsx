import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { InstallPrompt } from "@/components/ui/InstallPrompt";
import { PWARegistration } from "@/components/layout/PWARegistration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PakketAdvies - Het beste energiecontract voor uw bedrijf",
  description: "We regelen het beste energiecontract voor uw bedrijf. Simpel, transparant en altijd met uw voordeel voorop.",
  manifest: "/manifest.json",
  themeColor: "#00AF9B",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PakketAdvies",
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <PWARegistration />
        <LayoutWrapper>{children}</LayoutWrapper>
        <InstallPrompt />
      </body>
    </html>
  );
}
