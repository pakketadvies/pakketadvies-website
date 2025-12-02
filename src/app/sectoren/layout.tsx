import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sectoren - Energieadvies per sector | PakketAdvies',
  description: 'Energieadvies op maat voor elke sector. Van horeca tot industrie: wij kennen de specifieke uitdagingen van uw sector en helpen u besparen.',
  keywords: 'sectoren, horeca energie, retail energie, industrie energie, vastgoed energie, zakelijke energie per sector',
  openGraph: {
    title: 'Sectoren - Energieadvies per sector | PakketAdvies',
    description: 'Energieadvies op maat voor elke sector. Van horeca tot industrie.',
    type: 'website',
    url: 'https://pakketadvies.nl/sectoren',
    siteName: 'PakketAdvies',
    images: [
      {
        url: 'https://pakketadvies.nl/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'Sectoren PakketAdvies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sectoren - Energieadvies per sector | PakketAdvies',
    description: 'Energieadvies op maat voor elke sector.',
    images: ['https://pakketadvies.nl/images/hero-main.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/sectoren',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

export default function SectorenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

