import type { Metadata } from 'next'
import { ResultatenFlow } from '@/components/calculator/ResultatenFlow'

export const metadata: Metadata = {
  title: 'Resultaten energie vergelijken | PakketAdvies',
  description: 'Resultatenpagina met gepersonaliseerde energiecontracten op basis van ingevulde verbruiksgegevens.',
  alternates: {
    canonical: 'https://pakketadvies.nl/calculator/resultaten',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-snippet': -1,
    },
  },
}

export default function ResultatenPage() {
  return <ResultatenFlow audience="business" />
}
