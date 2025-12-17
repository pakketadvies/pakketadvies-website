import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aanbiedingen - PakketAdvies | Energiecontract aanbiedingen',
  description: 'Bekijk onze speciale energiecontract aanbiedingen: particulier 3-jarig, MKB 3-jarig, grootzakelijk en dynamische tarieven.',
  keywords: [
    'energiecontract aanbieding',
    '3-jarig energiecontract',
    'particulier energiecontract',
    'mkb energiecontract',
    'grootzakelijk energie',
    'dynamische energietarieven',
  ],
  openGraph: {
    title: 'Aanbiedingen - PakketAdvies | Energiecontract aanbiedingen',
    description: 'Bekijk onze speciale energiecontract aanbiedingen en ontdek hoeveel je kunt besparen.',
    type: 'website',
    url: 'https://pakketadvies.nl/aanbieding',
    siteName: 'PakketAdvies',
  },
}

export default function AanbiedingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

