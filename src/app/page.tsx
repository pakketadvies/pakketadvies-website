import { Hero } from '@/components/sections/Hero'
import { ContractTypes } from '@/components/sections/ContractTypes'
import { Sectors } from '@/components/sections/Sectors'
import { Features } from '@/components/sections/Features'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Testimonials } from '@/components/sections/Testimonials'
import { CTA } from '@/components/sections/CTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <ContractTypes />
      <Sectors />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </>
  )
}
