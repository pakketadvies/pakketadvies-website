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

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Snel naar</h2>
            <div className="mt-4 space-y-2">
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/particulier/energie-vergelijken">
                Energie vergelijken →
              </Link>
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/particulier/zonnepanelen">
                Zonnepanelen & teruglevering →
              </Link>
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/particulier/verhuizen">
                Verhuizen →
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Veelgestelde onderwerpen</h2>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>Vast vs variabel vs dynamisch</li>
              <li>Looptijd en voorwaarden</li>
              <li>Terugleververgoeding en terugleverkosten</li>
              <li>Overstappen en (eventuele) opzegkosten</li>
              <li>Verhuizen en startdatum</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Onze tip</h2>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              Twijfel je tussen twee contracten? Stuur ons je situatie (zonnepanelen/verbruik) en we helpen je snel kiezen.
            </p>
            <div className="mt-4 space-y-2">
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/contact">
                Contact opnemen →
              </Link>
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/particulier/faq">
                Eerst FAQ lezen →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-600">Direct starten</h2>
          <p className="mt-3 text-gray-600 leading-relaxed max-w-3xl">
            Wil je het simpel houden? Start met vergelijken — je ziet meteen welke contracttypes logisch zijn, en je kunt altijd later
            bijsturen.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/calculator"
              className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold"
            >
              Start vergelijking
            </Link>
            <Link
              href="/particulier/kennisbank"
              className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-brand-teal-50 hover:border-brand-teal-200 transition-all"
            >
              Lees uitleg
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


