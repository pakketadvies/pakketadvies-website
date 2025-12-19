import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Verhuizen en energie',
  alternates: { canonical: 'https://pakketadvies.nl/particulier/verhuizen' },
}

export default function VerhuizenPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-14 md:pt-32">
      <div className="container-custom">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <p className="text-brand-teal-600 font-semibold">Verhuizen</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-navy-600">
            Energie regelen bij verhuizing
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
            Verhuizen is hét moment om opnieuw te vergelijken. We helpen je om dubbele kosten te voorkomen en direct een passend contract
            te kiezen voor je nieuwe adres.
          </p>
          <div className="mt-7 flex gap-3">
            <Link
              href="/particulier/energie-vergelijken"
              className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold"
            >
              Vergelijk bij verhuizing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


