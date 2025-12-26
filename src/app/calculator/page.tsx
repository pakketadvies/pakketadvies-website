import type { Metadata } from 'next'
import { CalculatorFlow } from '@/components/calculator/CalculatorFlow'

export const metadata: Metadata = {
  title: 'Energiecalculator | PakketAdvies - Bereken je energiekosten',
  description:
    'Bereken je energiekosten met onze energiecalculator. Vergelijk energiecontracten voor je bedrijf en ontdek hoeveel je kunt besparen. Gratis en vrijblijvend.',
  keywords: [
    'energiecalculator',
    'energiekosten berekenen',
    'energiecontract berekenen',
    'zakelijke energie calculator',
    'energie vergelijken bedrijf',
  ],
  openGraph: {
    title: 'Energiecalculator | PakketAdvies - Bereken je energiekosten',
    description:
      'Bereken je energiekosten met onze energiecalculator. Vergelijk energiecontracten voor je bedrijf en ontdek hoeveel je kunt besparen.',
    type: 'website',
    url: 'https://pakketadvies.nl/calculator',
    siteName: 'PakketAdvies',
    locale: 'nl_NL',
    images: [
      {
        url: 'https://pakketadvies.nl/images/calculator-laptop.jpg',
        width: 1200,
        height: 630,
        alt: 'PakketAdvies - Energiecalculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Energiecalculator | PakketAdvies - Bereken je energiekosten',
    description: 'Bereken je energiekosten met onze energiecalculator. Vergelijk energiecontracten en bespaar.',
    images: ['https://pakketadvies.nl/images/calculator-laptop.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/calculator',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

export default function CalculatorPage() {
  return <CalculatorFlow />
}
