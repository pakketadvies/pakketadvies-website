import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kennisbank - Alles over zakelijke energie | PakketAdvies',
  description: 'Praktische artikelen, uitleg en tips over zakelijke energiecontracten. Leer alles over grootverbruik, kleinverbruik, energieprijzen, besparen en meer.',
  keywords: 'kennisbank, zakelijke energie, energiecontract, energieadvies, grootverbruik, kleinverbruik, energieprijzen, energie besparen',
  openGraph: {
    title: 'Kennisbank - Alles over zakelijke energie | PakketAdvies',
    description: 'Praktische artikelen, uitleg en tips over zakelijke energiecontracten.',
    type: 'website',
    url: 'https://pakketadvies.nl/kennisbank',
    siteName: 'PakketAdvies',
    images: [
      {
        url: 'https://pakketadvies.nl/images/office-team.jpg',
        width: 1200,
        height: 630,
        alt: 'Kennisbank zakelijke energie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kennisbank - Alles over zakelijke energie | PakketAdvies',
    description: 'Praktische artikelen, uitleg en tips over zakelijke energiecontracten.',
    images: ['https://pakketadvies.nl/images/office-team.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/kennisbank',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

export default function KennisbankLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

