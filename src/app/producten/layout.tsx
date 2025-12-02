import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Producten - Energiecontracten vergelijken | PakketAdvies',
  description: 'Vergelijk verschillende energiecontracten: vast, dynamisch en maatwerk. Ontdek welk contract het beste bij uw bedrijf past.',
  keywords: 'energiecontracten, vast contract, dynamisch contract, maatwerk contract, energiecontract vergelijken',
  openGraph: {
    title: 'Producten - Energiecontracten vergelijken | PakketAdvies',
    description: 'Vergelijk verschillende energiecontracten: vast, dynamisch en maatwerk.',
    type: 'website',
    url: 'https://pakketadvies.nl/producten',
    siteName: 'PakketAdvies',
    images: [
      {
        url: 'https://pakketadvies.nl/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'Producten PakketAdvies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Producten - Energiecontracten vergelijken | PakketAdvies',
    description: 'Vergelijk verschillende energiecontracten.',
    images: ['https://pakketadvies.nl/images/hero-main.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/producten',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

export default function ProductenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

