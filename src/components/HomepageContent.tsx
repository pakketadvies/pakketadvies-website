'use client'

import { useMode } from '@/context/ModeContext'
import { Hero } from '@/components/sections/Hero'
import { ContractTypes } from '@/components/sections/ContractTypes'
import { Sectors } from '@/components/sections/Sectors'
import { Features } from '@/components/sections/Features'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Testimonials } from '@/components/sections/Testimonials'
import { CTA } from '@/components/sections/CTA'
import { ParticulierHero } from '@/components/particulier/ParticulierHero'
import { WaaromOverstappen } from '@/components/particulier/WaaromOverstappen'
import { Stappenplan } from '@/components/particulier/Stappenplan'
import { ParticulierFAQ } from '@/components/particulier/ParticulierFAQ'
import { ParticulierCTA } from '@/components/particulier/ParticulierCTA'

interface HomepageContentProps {
  initialBestDeals?: {
    contracten: any[]
    averagePrice: number
  }
}

export function HomepageContent({ initialBestDeals }: HomepageContentProps) {
  const { mode } = useMode()

  if (mode === 'particulier') {
    return (
      <>
        <ParticulierHero />
        <WaaromOverstappen />
        <Stappenplan />
        <ParticulierFAQ />
        <ParticulierCTA />
      </>
    )
  }

  // Zakelijk (default)
  return (
    <>
      <Hero initialBestDeals={initialBestDeals} />
      <ContractTypes />
      <Sectors />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </>
  )
}

