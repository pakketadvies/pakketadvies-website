import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dynamisch energiecontract',
  alternates: { canonical: 'https://pakketadvies.nl/particulier/dynamisch' },
}

export default function DynamischPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-14 md:pt-32">
      <div className="container-custom">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <p className="text-brand-teal-600 font-semibold">Dynamisch contract</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-navy-600">
            Uurtarieven en slimme keuzes
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
            Bij dynamisch varieert de stroomprijs per uur. Dat kan interessant zijn als je je verbruik kunt sturen (bijv. met een
            thuisbatterij of slimme apparaten) en/of zonnepanelen hebt.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href="/particulier/zonnepanelen"
              className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-brand-teal-50 hover:border-brand-teal-200 transition-all"
            >
              Dynamisch + zonnepanelen
            </Link>
            <Link
              href="/particulier/energie-vergelijken"
              className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold"
            >
              Vergelijk dynamisch
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


