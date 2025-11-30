import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Energieprijzen - Inzicht in de markt | PakketAdvies',
  description: 'Bekijk actuele en historische marktprijzen voor elektriciteit en gas. Interactieve grafieken en gedetailleerde prijstabellen om het beste energiecontract te kiezen.',
  keywords: 'energieprijzen, marktprijzen, elektriciteitsprijzen, gasprijzen, dynamische tarieven, EPEX Spot, TTF, energiecontracten vergelijken',
  openGraph: {
    title: 'Energieprijzen - Inzicht in de markt | PakketAdvies',
    description: 'Bekijk actuele en historische marktprijzen voor elektriciteit en gas.',
    type: 'website',
  },
}

export default function EnergieprijzenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

