import type { Metadata } from 'next'
import { OverstappenStappenplan } from '@/components/particulier/OverstappenStappenplan'
import { WaaromOverstappen } from '@/components/particulier/WaaromOverstappen'
import { ParticulierFAQ } from '@/components/particulier/ParticulierFAQ'
import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react'

export const metadata: Metadata = {
  title: 'Overstappen van energieleverancier | PakketAdvies',
  description: 'Alles over overstappen van energieleverancier. Stappenplan, tips en veelgestelde vragen. Wij regelen alles voor je.',
  alternates: {
    canonical: 'https://pakketadvies.nl/particulier/overstappen',
  },
}

export default function OverstappenPage() {
  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="container-custom max-w-4xl text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Overstappen van energieleverancier
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Alles wat je moet weten over overstappen. Eenvoudig, snel en volledig ontzorgd.
          </p>
        </div>
      </section>

      <OverstappenStappenplan />
      <WaaromOverstappen />
      <ParticulierFAQ />

      {/* CTA */}
      <section className="py-16 md:py-24 bg-brand-teal-50">
        <div className="container-custom max-w-4xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-6">
            Klaar om over te stappen?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start nu met vergelijken en vind de beste energieleverancier voor jou
          </p>
          <Link href="/calculator">
            <button className="px-8 py-4 bg-brand-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 hover:bg-brand-teal-600 transition-all duration-300 inline-flex items-center gap-2 text-lg">
              Start vergelijking
              <ArrowRight weight="bold" className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}

