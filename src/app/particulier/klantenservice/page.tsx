import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Klantenservice',
  alternates: { canonical: 'https://pakketadvies.nl/particulier/klantenservice' },
}

export default function KlantenservicePage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-14 md:pt-32">
      <div className="container-custom">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <p className="text-brand-teal-600 font-semibold">Klantenservice</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-navy-600">
            Hulp nodig? We denken met je mee.
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
            Vind snel antwoorden in onze FAQ of neem contact op. We helpen je graag met een korte check over contracttype, teruglevering
            of overstappen.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href="/particulier/faq"
              className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-brand-teal-50 hover:border-brand-teal-200 transition-all"
            >
              Bekijk veelgestelde vragen
            </Link>
            <Link
              href="/contact"
              className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold"
            >
              Neem contact op
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


