import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Energieprijzen voor particulieren | PakketAdvies',
  description: 'Bekijk actuele en historische energieprijzen voor particulieren. Inzicht in marktprijzen voor elektriciteit en gas.',
  keywords: 'energieprijzen, elektriciteitsprijzen, gasprijzen, marktprijzen, energieprijzen particulier',
}

export default function ParticulierEnergieprijzenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

