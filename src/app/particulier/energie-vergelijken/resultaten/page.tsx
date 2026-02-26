import type { Metadata } from 'next'
import { ResultatenFlow } from '@/components/calculator/ResultatenFlow'

export const metadata: Metadata = {
  title: 'Resultaten energie vergelijken',
  description: 'Bekijk en vergelijk energiecontracten voor thuis op basis van jouw situatie.',
  alternates: { canonical: 'https://pakketadvies.nl/particulier/energie-vergelijken/resultaten' },
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

export default function ParticulierResultatenPage() {
  return <ResultatenFlow audience="consumer" />
}


