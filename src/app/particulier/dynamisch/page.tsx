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
            Bij dynamisch varieert de stroomprijs per uur. Dat kan interessant zijn als je je verbruik kunt sturen (bijv. wassen, laden,
            warmtepomp slim inzetten) en/of zonnepanelen hebt.
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

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Wanneer past dynamisch?</h2>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>Je kunt verbruik verplaatsen naar goedkopere uren.</li>
              <li>Je hebt interesse in “meebewegen” met de markt.</li>
              <li>Je vindt transparantie (uurtarieven) prettig.</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Waar let je op?</h2>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>Vaste kosten en opslag/fee naast de marktprijs.</li>
              <li>Wat gebeurt er bij piekuren (jouw verbruikspatroon)?</li>
              <li>Bij zonnepanelen: teruglevering en voorwaarden.</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Praktische tips</h2>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>Plan was/droger in daluren.</li>
              <li>Laad (als mogelijk) op goedkope uren.</li>
              <li>Check of je meter geschikt is voor uurtarieven.</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-600">Dynamisch met zonnepanelen</h2>
          <p className="mt-3 text-gray-600 leading-relaxed max-w-3xl">
            Met zonnepanelen draait het om de combinatie van jouw teruglevering, verbruiksmomenten en de voorwaarden van de leverancier.
            Daarom vergelijken we altijd op totaalplaatje: niet alleen het tarief, maar ook vaste kosten en terugleverafspraken.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/particulier/zonnepanelen"
              className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-brand-teal-50 hover:border-brand-teal-200 transition-all"
            >
              Lees zonnepanelen uitleg
            </Link>
            <Link
              href="/calculator"
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


