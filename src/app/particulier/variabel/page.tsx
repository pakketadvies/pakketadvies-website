import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Variabel energiecontract',
  alternates: { canonical: 'https://pakketadvies.nl/particulier/variabel' },
}

export default function VariabelPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-14 md:pt-32">
      <div className="container-custom">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <p className="text-brand-teal-600 font-semibold">Variabel contract</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-navy-600">
            Meebewegen met de markt
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
            Bij een variabel contract kunnen tarieven periodiek wijzigen. Dat kan prettig zijn als prijzen dalen, maar het geeft minder
            zekerheid dan een vast contract.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href="/particulier/energie-vergelijken"
              className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold"
            >
              Vergelijk variabele contracten
            </Link>
            <Link
              href="/particulier/vast"
              className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-brand-teal-50 hover:border-brand-teal-200 transition-all"
            >
              Liever zekerheid? Vast
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Wanneer past variabel?</h2>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>Je wilt flexibiliteit en niet lang “vastzitten”.</li>
              <li>Je kunt accepteren dat tarieven kunnen stijgen of dalen.</li>
              <li>Je wil later makkelijk kunnen overstappen naar vast of dynamisch.</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Waar let je op?</h2>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>Wanneer mogen tarieven wijzigen (en hoe vaak)?</li>
              <li>Vaste kosten per maand en welkomst/acties (als die er zijn).</li>
              <li>Bij zonnepanelen: teruglevervoorwaarden blijven belangrijk.</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Snelle check</h2>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              Wil je vooral flexibiliteit en later kunnen bijsturen? Dan is variabel vaak een logische start. Wil je maximale controle
              per uur? Kijk dan naar dynamisch.
            </p>
            <div className="mt-4 space-y-2">
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/particulier/dynamisch">
                Bekijk dynamisch →
              </Link>
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/calculator">
                Start vergelijken →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-600">Veelgestelde vragen (kort)</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-2xl p-5">
              <p className="font-semibold text-brand-navy-600">Kan ik later alsnog vastzetten?</p>
              <p className="mt-2 text-gray-600 text-sm">Ja, vaak kun je later overstappen naar een vast contract als je dat wil.</p>
            </div>
            <div className="border border-gray-200 rounded-2xl p-5">
              <p className="font-semibold text-brand-navy-600">Is variabel “altijd goedkoper”?</p>
              <p className="mt-2 text-gray-600 text-sm">Niet per se. Het hangt af van prijzen, voorwaarden en jouw verbruik.</p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/particulier/faq"
              className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-brand-teal-50 hover:border-brand-teal-200 transition-all"
            >
              Bekijk alle FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


