import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { InstallPrompt } from "@/components/ui/InstallPrompt";
import { PWARegistration } from "@/components/layout/PWARegistration";
import { FacebookPixel } from "@/components/tracking/FacebookPixel";
import { GoogleAnalytics } from "@/components/tracking/GoogleAnalytics";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PakketAdvies - Het beste energiecontract voor uw bedrijf",
    template: "%s | PakketAdvies",
  },
  description: "We regelen het beste energiecontract voor uw bedrijf. Simpel, transparant en altijd met uw voordeel voorop. Vergelijk energiecontracten en bespaar tot 30% op uw energiekosten.",
  keywords: "zakelijke energie, energiecontract vergelijken, energieadvies bedrijf, grootverbruik energie, kleinverbruik energie, energieprijzen zakelijk, energie besparen bedrijf",
  manifest: "/manifest.json",
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

export const viewport: Viewport = {
  themeColor: "#00AF9B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const facebookPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="nl" className={`overscroll-none ${plusJakartaSans.variable} ${spaceGrotesk.variable}`}>
      <body>
        <PWARegistration />
        <LayoutWrapper>{children}</LayoutWrapper>
        <InstallPrompt />
        {gaMeasurementId && <GoogleAnalytics measurementId={gaMeasurementId} />}
        {facebookPixelId && <FacebookPixel pixelId={facebookPixelId} />}
      </body>
    </html>
  );
}