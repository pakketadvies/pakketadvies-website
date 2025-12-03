import type { Metadata } from 'next'
import { Hero } from '@/components/sections/Hero'
import { ContractTypes } from '@/components/sections/ContractTypes'
import { Sectors } from '@/components/sections/Sectors'
import { Features } from '@/components/sections/Features'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Testimonials } from '@/components/sections/Testimonials'
import { CTA } from '@/components/sections/CTA'
import { OrganizationSchema } from '@/components/seo/StructuredData'

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

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
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