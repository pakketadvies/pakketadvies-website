import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Energie bespaartips | PakketAdvies',
  description: 'Praktische tips om energie te besparen en je energiekosten te verlagen. Van isolatie tot zonnepanelen.',
  keywords: 'energie besparen, bespaartips, energie besparen thuis, lagere energiekosten, energiezuinig',
}

export default function BespaartipsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

