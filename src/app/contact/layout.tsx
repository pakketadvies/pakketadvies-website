import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact - PakketAdvies | Vraag advies over energiecontracten',
  description: 'Neem contact op met PakketAdvies voor persoonlijk advies over energiecontracten. Bel 085 047 7065 of stuur een bericht via het contactformulier. We helpen je graag verder.',
  keywords: [
    'contact pakketadvies',
    'energieadvies',
    'energiecontract advies',
    'energiebesparing',
    'zakelijke energie',
    'energieconsultant',
    'energieadviseur',
    'contact energie',
    'vraag energieadvies',
    'bel energieadviseur',
  ],
  openGraph: {
    title: 'Contact - PakketAdvies | Vraag advies over energiecontracten',
    description: 'Neem contact op met PakketAdvies voor persoonlijk advies over energiecontracten. Bel 085 047 7065 of stuur een bericht via het contactformulier.',
    url: 'https://pakketadvies.nl/contact',
    siteName: 'PakketAdvies',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact - PakketAdvies | Vraag advies over energiecontracten',
    description: 'Neem contact op met PakketAdvies voor persoonlijk advies over energiecontracten.',
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
