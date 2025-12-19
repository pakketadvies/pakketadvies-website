import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Overstappen van energieleverancier | PakketAdvies',
  description: 'Alles wat je moet weten over overstappen van energieleverancier. Stappenplan, tips en veelgestelde vragen.',
  keywords: 'overstappen energieleverancier, energie overstappen, opzeggen energiecontract, nieuwe energieleverancier',
}

export default function OverstappenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

