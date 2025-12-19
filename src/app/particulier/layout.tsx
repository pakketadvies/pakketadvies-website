import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Energie vergelijken voor particulieren | PakketAdvies',
  description: 'Vergelijk alle energieleveranciers en vind het beste energiecontract voor jouw situatie. Gratis, onafhankelijk en binnen 2 minuten.',
  keywords: 'energie vergelijken particulier, energieleverancier vergelijken, energiecontract particulier, beste energietarieven particulier',
  openGraph: {
    title: 'Energie vergelijken voor particulieren | PakketAdvies',
    description: 'Vergelijk alle energieleveranciers en vind het beste energiecontract voor jouw situatie. Gratis, onafhankelijk en binnen 2 minuten.',
    type: 'website',
    url: 'https://pakketadvies.nl/particulier',
    siteName: 'PakketAdvies',
    images: [
      {
        url: 'https://pakketadvies.nl/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'PakketAdvies - Energie vergelijken voor particulieren',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Energie vergelijken voor particulieren | PakketAdvies',
    description: 'Vergelijk alle energieleveranciers en vind het beste energiecontract voor jouw situatie.',
    images: ['https://pakketadvies.nl/images/hero-main.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/particulier',
  },
}

export default function ParticulierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

