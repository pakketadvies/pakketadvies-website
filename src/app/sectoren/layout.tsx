import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sectoren - PakketAdvies | Energieadvies per sector',
  description: 'PakketAdvies biedt gespecialiseerd energieadvies voor verschillende sectoren: horeca, retail, kantoren, industrie, agrarisch en vastgoed.',
  keywords: [
    'energieadvies horeca',
    'energieadvies retail',
    'energieadvies kantoren',
    'energieadvies industrie',
    'energieadvies agrarisch',
    'energieadvies vastgoed',
    'sector specifiek energieadvies',
  ],
  openGraph: {
    title: 'Sectoren - PakketAdvies | Energieadvies per sector',
    description: 'PakketAdvies biedt gespecialiseerd energieadvies voor verschillende sectoren.',
    url: 'https://pakketadvies.nl/sectoren',
    siteName: 'PakketAdvies',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sectoren - PakketAdvies | Energieadvies per sector',
    description: 'PakketAdvies biedt gespecialiseerd energieadvies voor verschillende sectoren.',
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/sectoren',
  },
}

export default function SectorenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
