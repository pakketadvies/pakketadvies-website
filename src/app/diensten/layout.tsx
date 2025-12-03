import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Diensten - PakketAdvies | Energieadvies voor bedrijven',
  description: 'PakketAdvies helpt bedrijven met energieadvies, contractvergelijking en overstappen. Gratis en vrijblijvend advies voor de beste energiecontracten.',
  keywords: [
    'energieadvies bedrijven',
    'zakelijke energie',
    'energiecontract vergelijken',
    'energie overstappen',
    'energiebesparing bedrijven',
    'energieconsultant',
    'energieadviseur',
    'zakelijke energietarieven',
    'energiecontracten vergelijken',
  ],
  openGraph: {
    title: 'Diensten - PakketAdvies | Energieadvies voor bedrijven',
    description: 'PakketAdvies helpt bedrijven met energieadvies, contractvergelijking en overstappen. Gratis en vrijblijvend advies.',
    url: 'https://pakketadvies.nl/diensten',
    siteName: 'PakketAdvies',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diensten - PakketAdvies | Energieadvies voor bedrijven',
    description: 'PakketAdvies helpt bedrijven met energieadvies, contractvergelijking en overstappen.',
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/diensten',
  },
}

export default function DienstenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
