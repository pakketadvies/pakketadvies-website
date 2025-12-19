import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Zonnepanelen & energiecontract',
  alternates: { canonical: 'https://pakketadvies.nl/particulier/zonnepanelen' },
}

export default function ZonnepanelenPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-14 md:pt-32">
      <div className="container-custom">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <p className="text-brand-teal-600 font-semibold">Zonnepanelen</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-navy-600">
            Contract kiezen met teruglevering
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
            Met zonnepanelen zijn terugleverkosten en terugleververgoeding belangrijk. We helpen je de voorwaarden te begrijpen en een
            contract te kiezen dat past bij jouw situatie.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href="/particulier/dynamisch"
              className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-brand-teal-50 hover:border-brand-teal-200 transition-all"
            >
              Lees over dynamisch
            </Link>
            <Link
              href="/particulier/energie-vergelijken"
              className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold"
            >
              Start vergelijking
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


