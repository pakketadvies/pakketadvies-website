import type { Metadata } from 'next'

export const calculatorMetadata: Metadata = {
  title: 'Energiecalculator - Bereken uw besparing | PakketAdvies',
  description: 'Bereken hoeveel u kunt besparen met een beter energiecontract. Gratis en vrijblijvend. In een paar minuten weet u uw besparing.',
  keywords: 'energiecalculator, energie besparen, energiecontract vergelijken, besparing berekenen, zakelijke energie',
  openGraph: {
    title: 'Energiecalculator - Bereken uw besparing | PakketAdvies',
    description: 'Bereken hoeveel u kunt besparen met een beter energiecontract. Gratis en vrijblijvend.',
    type: 'website',
    url: 'https://pakketadvies.nl/calculator',
    siteName: 'PakketAdvies',
    images: [
      {
        url: 'https://pakketadvies.nl/images/calculator-laptop.jpg',
        width: 1200,
        height: 630,
        alt: 'Energiecalculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Energiecalculator - Bereken uw besparing | PakketAdvies',
    description: 'Bereken hoeveel u kunt besparen met een beter energiecontract.',
    images: ['https://pakketadvies.nl/images/calculator-laptop.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/calculator',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

