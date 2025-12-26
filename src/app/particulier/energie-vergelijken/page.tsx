import type { Metadata } from 'next'
import { WaveDivider } from '@/components/ui/WaveDivider'
import { ConsumerCompareWizard } from '@/components/particulier/ConsumerCompareWizard'

export const metadata: Metadata = {
  title: 'Energie vergelijken | PakketAdvies',
  description:
    'Vergelijk energiecontracten voor thuis: vast, variabel of dynamisch. Met duidelijke uitleg over tarieven, looptijd en zonnepanelen. Bespaar tot 30% op je energierekening.',
  keywords: [
    'energie vergelijken',
    'energiecontract vergelijken',
    'stroom en gas vergelijken',
    'energieleverancier vergelijken',
    'energie besparen',
    'energieprijzen vergelijken',
  ],
  openGraph: {
    title: 'Energie vergelijken | PakketAdvies',
    description:
      'Vergelijk energiecontracten voor thuis: vast, variabel of dynamisch. Met duidelijke uitleg over tarieven, looptijd en zonnepanelen. Bespaar tot 30% op je energierekening.',
    type: 'website',
    url: 'https://pakketadvies.nl/particulier/energie-vergelijken',
    siteName: 'PakketAdvies',
    locale: 'nl_NL',
    images: [
      {
        url: 'https://pakketadvies.nl/images/calculator-laptop.jpg',
        width: 1200,
        height: 630,
        alt: 'PakketAdvies - Energie vergelijken',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Energie vergelijken | PakketAdvies',
    description:
      'Vergelijk energiecontracten voor thuis: vast, variabel of dynamisch. Bespaar tot 30% op je energierekening.',
    images: ['https://pakketadvies.nl/images/calculator-laptop.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/particulier/energie-vergelijken',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

export default function EnergieVergelijkenPage() {
  return (
    <div className="bg-white">
      {/* Header / Hero */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 bg-gradient-to-br from-brand-navy-500 via-brand-navy-600 to-brand-teal-600 overflow-hidden">
        <div className="container-custom relative z-10">
          <ConsumerCompareWizard />
        </div>
        <WaveDivider variant="heroLow" />
      </section>
    </div>
  )
}


