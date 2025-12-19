import type { Metadata } from 'next'
import { SnelleVergelijking } from '@/components/particulier/SnelleVergelijking'
import { TopDeals } from '@/components/particulier/TopDeals'
import { getBestDeals } from '@/lib/get-best-deals'

export const metadata: Metadata = {
  title: 'Energie vergelijken | PakketAdvies',
  description: 'Vergelijk alle energieleveranciers en vind de beste deal voor jouw situatie. 100% gratis en onafhankelijk.',
  alternates: {
    canonical: 'https://pakketadvies.nl/particulier/vergelijken',
  },
}

export default async function VergelijkenPage() {
  // Fetch best deals server-side
  let bestDealsData
  try {
    bestDealsData = await getBestDeals(5, 'alle')
  } catch (error) {
    console.error('Error fetching best deals:', error)
    bestDealsData = { contracten: [], averagePrice: 0 }
  }

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      <div className="container-custom max-w-7xl py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-navy-500 mb-4">
            Energie vergelijken
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vergelijk alle energieleveranciers en vind de beste deal voor jouw situatie
          </p>
        </div>
        <SnelleVergelijking />
        <TopDeals initialData={bestDealsData} />
      </div>
    </div>
  )
}

