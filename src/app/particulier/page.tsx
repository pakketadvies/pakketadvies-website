import type { Metadata } from 'next'
import { ParticulierHero } from '@/components/particulier/ParticulierHero'
import { SnelleVergelijking } from '@/components/particulier/SnelleVergelijking'
import { TopDeals } from '@/components/particulier/TopDeals'
import { WaaromOverstappen } from '@/components/particulier/WaaromOverstappen'
import { OverstappenStappenplan } from '@/components/particulier/OverstappenStappenplan'
import { ParticulierFAQ } from '@/components/particulier/ParticulierFAQ'
import { ParticulierReviews } from '@/components/particulier/ParticulierReviews'
import { ParticulierCTA } from '@/components/particulier/ParticulierCTA'
import { getBestDeals } from '@/lib/get-best-deals'

export const metadata: Metadata = {
  title: 'Energie vergelijken voor particulieren | PakketAdvies',
  description: 'Vergelijk energieleveranciers en bespaar tot €500 per jaar. Vind in 2 minuten het beste energiecontract voor jouw situatie. 100% gratis en onafhankelijk.',
  keywords: 'energie vergelijken, energieleverancier vergelijken, energiecontract vergelijken, goedkoopste energie, energie overstappen, energie besparen',
  openGraph: {
    title: 'Energie vergelijken voor particulieren | PakketAdvies',
    description: 'Vergelijk energieleveranciers en bespaar tot €500 per jaar. 100% gratis en onafhankelijk.',
    type: 'website',
    url: 'https://pakketadvies.nl/particulier',
    siteName: 'PakketAdvies',
    images: [
      {
        url: 'https://pakketadvies.nl/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'PakketAdvies - Energie vergelijken',
      },
    ],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/particulier',
  },
}

export default async function ParticulierHomePage() {
  // Fetch best deals server-side for instant loading
  let bestDealsData
  try {
    bestDealsData = await getBestDeals(5, 'alle')
  } catch (error) {
    console.error('Error fetching best deals:', error)
    bestDealsData = { contracten: [], averagePrice: 0 }
  }

  return (
    <>
      <ParticulierHero />
      <SnelleVergelijking />
      <TopDeals initialData={bestDealsData} />
      <WaaromOverstappen />
      <OverstappenStappenplan />
      <ParticulierReviews />
      <ParticulierFAQ />
      <ParticulierCTA />
    </>
  )
}

