import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Zonnepanelen & energiecontract | PakketAdvies',
  description:
    'Heb je zonnepanelen? Dan is het belangrijk om het juiste energiecontract te kiezen. Vergelijk contracten met gunstige teruglevervoorwaarden en bespaar maximaal op je energierekening.',
  keywords: [
    'zonnepanelen energiecontract',
    'teruglevering zonnepanelen',
    'energiecontract met zonnepanelen',
    'salderen energie',
    'terugleververgoeding',
    'zonnepanelen terugleveren',
  ],
  openGraph: {
    title: 'Zonnepanelen & energiecontract | PakketAdvies',
    description:
      'Heb je zonnepanelen? Dan is het belangrijk om het juiste energiecontract te kiezen. Vergelijk contracten met gunstige teruglevervoorwaarden.',
    type: 'website',
    url: 'https://pakketadvies.nl/particulier/zonnepanelen',
    siteName: 'PakketAdvies',
    locale: 'nl_NL',
    images: [
      {
        url: 'https://pakketadvies.nl/images/solar-roof.jpg',
        width: 1200,
        height: 630,
        alt: 'PakketAdvies - Zonnepanelen & energiecontract',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zonnepanelen & energiecontract | PakketAdvies',
    description: 'Heb je zonnepanelen? Vergelijk contracten met gunstige teruglevervoorwaarden en bespaar maximaal.',
    images: ['https://pakketadvies.nl/images/solar-roof.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/particulier/zonnepanelen',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
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
            Met zonnepanelen draait het om meer dan alleen het stroomtarief. Terugleververgoeding, eventuele terugleverkosten en
            voorwaarden verschillen per contract. Wij helpen je het totaalplaatje vergelijken.
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

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Checklist</h2>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>Hoeveel lever je gemiddeld terug?</li>
              <li>Wat zijn de vaste kosten per maand?</li>
              <li>Hoe is teruglevering geregeld in de voorwaarden?</li>
              <li>Kun je verbruik verplaatsen (bijv. laden, wassen)?</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Veelgemaakte fouten</h2>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>Alleen kijken naar kWh-tarief en vaste kosten vergeten.</li>
              <li>Teruglevervoorwaarden overslaan.</li>
              <li>Geen rekening houden met seizoensverschil (zomer/winter).</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Welke richting past?</h2>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              Kun je je verbruik slim sturen? Dan kan dynamisch interessant zijn. Wil je vooral rust, dan is vast vaak een goede basis.
            </p>
            <div className="mt-4 space-y-2">
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/particulier/dynamisch">
                Keuzehulp dynamisch →
              </Link>
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/particulier/vast">
                Keuzehulp vast →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-600">Snel starten</h2>
          <p className="mt-3 text-gray-600 leading-relaxed max-w-3xl">
            Start met vergelijken en geef aan dat je zonnepanelen hebt. Dan kunnen we de juiste voorwaarden en teruglevering meenemen in
            de keuze.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/calculator"
              className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold"
            >
              Vergelijk nu
            </Link>
            <Link
              href="/particulier/faq"
              className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-brand-teal-50 hover:border-brand-teal-200 transition-all"
            >
              Bekijk FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


