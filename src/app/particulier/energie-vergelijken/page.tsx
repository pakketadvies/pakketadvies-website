import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Energie vergelijken',
  description:
    'Vergelijk energiecontracten voor thuis: vast, variabel of dynamisch. Met duidelijke uitleg over tarieven, looptijd en zonnepanelen.',
  alternates: { canonical: 'https://pakketadvies.nl/particulier/energie-vergelijken' },
}

export default function EnergieVergelijkenPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-14 md:pt-32">
      <div className="container-custom">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-sm">
          <p className="text-brand-teal-600 font-semibold">Energie vergelijken</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-navy-600">
            Vergelijk vaste, variabele en dynamische contracten
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
            Dit is de particuliere vergelijkomgeving (MVP). We starten met een overzichtelijke flow en breiden dit stapsgewijs uit.
            Voor nu kun je meteen door naar de calculator en daar de vergelijking doen — terwijl je in “Particulier” mode blijft.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href="/calculator"
              className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-brand-teal-500/25 hover:bg-brand-teal-600 transition-all"
            >
              Start vergelijking
            </Link>
            <Link
              href="/particulier/dynamisch"
              className="inline-flex justify-center items-center px-6 py-3 bg-white text-brand-navy-600 rounded-xl font-semibold border border-gray-200 hover:border-brand-teal-300 hover:bg-brand-teal-50 transition-all"
            >
              Lees over dynamisch
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">In 3 stappen</h2>
            <ol className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>
                <span className="font-semibold text-brand-navy-600">1.</span> Vul je situatie in (verbruik, zonnepanelen, voorkeuren)
              </li>
              <li>
                <span className="font-semibold text-brand-navy-600">2.</span> Vergelijk tarieven, looptijd en voorwaarden
              </li>
              <li>
                <span className="font-semibold text-brand-navy-600">3.</span> Kies wat bij je past — wij helpen als je twijfelt
              </li>
            </ol>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Contracttypes</h2>
            <div className="mt-3 space-y-2">
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/particulier/vast">
                Vast: zekerheid
              </Link>
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/particulier/variabel">
                Variabel: meebewegen
              </Link>
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/particulier/dynamisch">
                Dynamisch: uurtarieven (interessant met zonnepanelen)
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Veelgestelde vragen</h2>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              We bouwen een dedicated FAQ voor particulier. Tot die tijd vind je alvast veel uitleg in onze kennisbank.
            </p>
            <Link className="mt-3 inline-flex text-brand-teal-600 font-semibold hover:underline" href="/particulier/faq">
              Bekijk FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


