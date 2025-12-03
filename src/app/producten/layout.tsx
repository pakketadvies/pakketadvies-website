import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Producten - PakketAdvies | Energiecontracten voor bedrijven',
  description: 'Bekijk onze energiecontracten: vast, dynamisch en maatwerk. PakketAdvies helpt bedrijven de beste energiecontracten te vinden.',
  keywords: [
    'energiecontracten',
    'vast contract',
    'dynamisch contract',
    'maatwerk contract',
    'zakelijke energie',
    'energiecontracten vergelijken',
  ],
  openGraph: {
    title: 'Producten - PakketAdvies | Energiecontracten voor bedrijven',
    description: 'Bekijk onze energiecontracten: vast, dynamisch en maatwerk voor bedrijven.',
    url: 'https://pakketadvies.nl/producten',
    siteName: 'PakketAdvies',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Producten - PakketAdvies | Energiecontracten voor bedrijven',
    description: 'Bekijk onze energiecontracten: vast, dynamisch en maatwerk voor bedrijven.',
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/producten',
  },
}

export default function ProductenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
