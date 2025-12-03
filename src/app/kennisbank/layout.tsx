import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kennisbank - PakketAdvies | Artikelen over energie en energiecontracten',
  description: 'Lees artikelen over energie, energiecontracten, energiebesparing en meer. De kennisbank van PakketAdvies met actuele informatie en tips.',
  keywords: [
    'energie artikelen',
    'energiekennisbank',
    'energie informatie',
    'energiecontracten uitleg',
    'energiebesparing tips',
    'energie nieuws',
    'energie gids',
    'energie kennis',
  ],
  openGraph: {
    title: 'Kennisbank - PakketAdvies | Artikelen over energie en energiecontracten',
    description: 'Lees artikelen over energie, energiecontracten, energiebesparing en meer in de kennisbank van PakketAdvies.',
    url: 'https://pakketadvies.nl/kennisbank',
    siteName: 'PakketAdvies',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kennisbank - PakketAdvies | Artikelen over energie en energiecontracten',
    description: 'Lees artikelen over energie, energiecontracten, energiebesparing en meer in de kennisbank van PakketAdvies.',
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/kennisbank',
  },
}

export default function KennisbankLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
