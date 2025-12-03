import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Over ons - PakketAdvies | Ons verhaal en missie',
  description: 'Leer PakketAdvies kennen. Wij helpen bedrijven met gratis en onafhankelijk energieadvies. Ontdek ons verhaal, missie en visie.',
  keywords: [
    'over pakketadvies',
    'wie zijn wij',
    'energieadvies',
    'onafhankelijk energieadvies',
    'energieconsultant',
    'energieadviseur',
    'missie pakketadvies',
    'visie pakketadvies',
  ],
  openGraph: {
    title: 'Over ons - PakketAdvies | Ons verhaal en missie',
    description: 'Leer PakketAdvies kennen. Wij helpen bedrijven met gratis en onafhankelijk energieadvies.',
    url: 'https://pakketadvies.nl/over-ons',
    siteName: 'PakketAdvies',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Over ons - PakketAdvies | Ons verhaal en missie',
    description: 'Leer PakketAdvies kennen. Wij helpen bedrijven met gratis en onafhankelijk energieadvies.',
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/over-ons',
  },
}

export default function OverOnsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
