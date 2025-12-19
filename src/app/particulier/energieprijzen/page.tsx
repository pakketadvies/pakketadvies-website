import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Energieprijzen voor particulieren | PakketAdvies',
  description: 'Bekijk actuele en historische energieprijzen. Inzicht in marktprijzen voor elektriciteit en gas.',
  alternates: {
    canonical: 'https://pakketadvies.nl/particulier/energieprijzen',
  },
}

// Redirect to main energieprijzen page (same content for both modes)
export default function ParticulierEnergieprijzenPage() {
  redirect('/kennisbank/energieprijzen')
}

