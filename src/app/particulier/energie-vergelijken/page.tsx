import type { Metadata } from 'next'
import { WaveDivider } from '@/components/ui/WaveDivider'
import { ConsumerCompareWizard } from '@/components/particulier/ConsumerCompareWizard'

export const metadata: Metadata = {
  title: 'Energie vergelijken',
  description:
    'Vergelijk energiecontracten voor thuis: vast, variabel of dynamisch. Met duidelijke uitleg over tarieven, looptijd en zonnepanelen.',
  alternates: { canonical: 'https://pakketadvies.nl/particulier/energie-vergelijken' },
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


