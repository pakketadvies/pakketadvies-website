import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'PakketAdvies - Energie vergelijken voor thuis',
    template: '%s | PakketAdvies',
  },
  description:
    'Vergelijk energiecontracten voor thuis. Vast, variabel of dynamisch — ontdek wat het beste past bij jouw situatie en bespaar eenvoudig op je energierekening.',
  keywords:
    'energie vergelijken, energiecontract, stroom en gas, dynamisch energiecontract, vast energiecontract, variabel energiecontract, zonnepanelen, energieleverancier',
  alternates: {
    canonical: 'https://pakketadvies.nl/particulier',
  },
}

export default function ParticulierLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}


