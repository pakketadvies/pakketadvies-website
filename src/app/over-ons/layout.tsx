import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Over ons - Wie is PakketAdvies?',
  description: 'PakketAdvies helpt bedrijven het beste energiecontract te vinden. Onze missie: simpel, transparant en altijd met uw voordeel voorop. Lees meer over ons verhaal.',
  keywords: 'over ons, PakketAdvies, energieadvies, energieadviseur, zakelijke energie, energiecontract',
  openGraph: {
    title: 'Over ons - Wie is PakketAdvies?',
    description: 'PakketAdvies helpt bedrijven het beste energiecontract te vinden. Onze missie: simpel, transparant en altijd met uw voordeel voorop.',
    type: 'website',
    url: 'https://pakketadvies.nl/over-ons',
    siteName: 'PakketAdvies',
    images: [
      {
        url: 'https://pakketadvies.nl/images/office-team.jpg',
        width: 1200,
        height: 630,
        alt: 'Over PakketAdvies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Over ons - Wie is PakketAdvies?',
    description: 'PakketAdvies helpt bedrijven het beste energiecontract te vinden.',
    images: ['https://pakketadvies.nl/images/office-team.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/over-ons',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

export default function OverOnsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

