import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Diensten - Energieadvies voor uw bedrijf | PakketAdvies',
  description: 'Ontdek alle diensten van PakketAdvies. Van energiecontract advies tot monitoring en verduurzaming: wij helpen uw bedrijf energie besparen.',
  keywords: 'diensten, energieadvies, energiecontract, energie monitoring, verduurzaming, energie besparen, zakelijke energie',
  openGraph: {
    title: 'Diensten - Energieadvies voor uw bedrijf | PakketAdvies',
    description: 'Ontdek alle diensten van PakketAdvies. Van energiecontract advies tot monitoring en verduurzaming.',
    type: 'website',
    url: 'https://pakketadvies.nl/diensten',
    siteName: 'PakketAdvies',
    images: [
      {
        url: 'https://pakketadvies.nl/images/features-dashboard.jpg',
        width: 1200,
        height: 630,
        alt: 'Diensten PakketAdvies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diensten - Energieadvies voor uw bedrijf | PakketAdvies',
    description: 'Ontdek alle diensten van PakketAdvies.',
    images: ['https://pakketadvies.nl/images/features-dashboard.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/diensten',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

export default function DienstenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

