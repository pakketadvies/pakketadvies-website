import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Vast energiecontract',
  alternates: { canonical: 'https://pakketadvies.nl/particulier/vast' },
}

export default function VastPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-14 md:pt-32">
      <div className="container-custom">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <p className="text-brand-teal-600 font-semibold">Vast contract</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-navy-600">
            Zekerheid met een vaste prijs
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
            Een vast contract geeft voorspelbaarheid: je tarief blijft gelijk gedurende de looptijd. Handig als je rust wilt, of als je
            verwacht dat prijzen gaan stijgen.
          </p>
          <div className="mt-7 flex gap-3">
            <Link
              href="/particulier/energie-vergelijken"
              className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold"
            >
              Vergelijk vaste contracten
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


