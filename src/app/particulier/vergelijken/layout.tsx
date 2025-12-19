import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Energie vergelijken voor particulieren | PakketAdvies',
  description: 'Vergelijk alle energieleveranciers en vind het beste energiecontract voor jouw situatie. Gratis, onafhankelijk en binnen 2 minuten.',
  keywords: 'energie vergelijken, energieleverancier vergelijken, energiecontract vergelijken, beste energietarieven, energieprijzen vergelijken',
}

export default function VergelijkenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

