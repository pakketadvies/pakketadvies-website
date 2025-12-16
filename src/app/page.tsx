import type { Metadata } from 'next'
import { Hero } from '@/components/sections/Hero'
import { ContractTypes } from '@/components/sections/ContractTypes'
import { Sectors } from '@/components/sections/Sectors'
import { Features } from '@/components/sections/Features'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Testimonials } from '@/components/sections/Testimonials'
import { CTA } from '@/components/sections/CTA'
import { OrganizationSchema } from '@/components/seo/StructuredData'
import { getBestDeals } from '@/lib/get-best-deals'

export const metadata: Metadata = {
  title: 'PakketAdvies - Het beste energiecontract voor uw bedrijf',
  description: 'We regelen het beste energiecontract voor uw bedrijf. Simpel, transparant en altijd met uw voordeel voorop. Vergelijk energiecontracten en bespaar tot 30% op uw energiekosten.',
  keywords: 'zakelijke energie, energiecontract vergelijken, energieadvies bedrijf, grootverbruik energie, kleinverbruik energie, energieprijzen zakelijk, energie besparen bedrijf',
  openGraph: {
    title: 'PakketAdvies - Het beste energiecontract voor uw bedrijf',
    description: 'We regelen het beste energiecontract voor uw bedrijf. Simpel, transparant en altijd met uw voordeel voorop.',
    type: 'website',
    url: 'https://pakketadvies.nl',
    siteName: 'PakketAdvies',
    images: [
      {
        url: 'https://pakketadvies.nl/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'PakketAdvies - Energiecontract Advies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PakketAdvies - Het beste energiecontract voor uw bedrijf',
    description: 'We regelen het beste energiecontract voor uw bedrijf. Simpel, transparant en altijd met uw voordeel voorop.',
    images: ['https://pakketadvies.nl/images/hero-main.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

export default async function HomePage() {
  // Fetch best deals server-side for instant loading
  console.log('🔵 [HomePage] START - Fetching best deals...')
  let bestDealsData
  try {
    bestDealsData = await getBestDeals(5, 'alle')
    console.log('✅ [HomePage] Best deals fetched:', bestDealsData?.contracten?.length || 0, 'contracts')
    console.log('✅ [HomePage] Best deals data:', JSON.stringify(bestDealsData, null, 2))
  } catch (error: any) {
    console.error('❌ [HomePage] ERROR fetching best deals:', error)
    console.error('❌ [HomePage] Error stack:', error?.stack)
    bestDealsData = { contracten: [], averagePrice: 0 }
  }

  // Add debug info to page as comment for client-side inspection
  const debugInfo = {
    contractCount: bestDealsData?.contracten?.length || 0,
    averagePrice: bestDealsData?.averagePrice || 0,
    hasContracts: (bestDealsData?.contracten?.length || 0) > 0,
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `console.log('🔵 [HomePage-Debug] Server-side result:', ${JSON.stringify(debugInfo)});`,
        }}
      />
      <OrganizationSchema />
      <Hero initialBestDeals={bestDealsData} />
      <ContractTypes />
      <Sectors />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </>
  )
}