import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { InstallPrompt } from "@/components/ui/InstallPrompt";
import { PWARegistration } from "@/components/layout/PWARegistration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PakketAdvies - Het beste energiecontract voor uw bedrijf",
    template: "%s | PakketAdvies",
  },
  description: "We regelen het beste energiecontract voor uw bedrijf. Simpel, transparant en altijd met uw voordeel voorop. Vergelijk energiecontracten en bespaar tot 30% op uw energiekosten.",
  keywords: "zakelijke energie, energiecontract vergelijken, energieadvies bedrijf, grootverbruik energie, kleinverbruik energie, energieprijzen zakelijk, energie besparen bedrijf",
  manifest: "/manifest.json",
  themeColor: "#00AF9B",
  metadataBase: new URL('https://pakketadvies.nl'),
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://pakketadvies.nl',
    siteName: 'PakketAdvies',
    title: 'PakketAdvies - Het beste energiecontract voor uw bedrijf',
    description: 'We regelen het beste energiecontract voor uw bedrijf. Simpel, transparant en altijd met uw voordeel voorop.',
    images: [
      {
        url: 'https://pakketadvies.nl/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'PakketAdvies - Energiecontract Advies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PakketAdvies - Het beste energiecontract voor uw bedrijf',
    description: 'We regelen het beste energiecontract voor uw bedrijf.',
    images: ['https://pakketadvies.nl/images/hero-main.jpg'],
  },
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PakketAdvies",
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
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
