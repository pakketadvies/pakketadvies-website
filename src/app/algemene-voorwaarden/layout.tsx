import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Algemene voorwaarden | PakketAdvies',
  description: 'Lees de algemene voorwaarden van PakketAdvies voor het gebruik van onze diensten en website.',
  alternates: {
    canonical: 'https://pakketadvies.nl/algemene-voorwaarden',
  },
}

export default function AlgemeneVoorwaardenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

