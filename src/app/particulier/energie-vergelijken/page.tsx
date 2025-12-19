import type { Metadata } from 'next'
import Link from 'next/link'
import { QuickCalculator } from '@/components/calculator/QuickCalculator'
import { WaveDivider } from '@/components/ui/WaveDivider'

export const metadata: Metadata = {
  title: 'Energie vergelijken',
  description:
    'Vergelijk energiecontracten voor thuis: vast, variabel of dynamisch. Met duidelijke uitleg over tarieven, looptijd en zonnepanelen.',
  alternates: { canonical: 'https://pakketadvies.nl/particulier/energie-vergelijken' },
}

export default function EnergieVergelijkenPage() {
  return (
    <div className="bg-white">
      {/* Header / Hero */}
      <section className="relative pt-28 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-brand-navy-500 via-brand-navy-600 to-brand-teal-600 overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/90 text-sm font-semibold">
                Energie vergelijken
              </p>
              <h1 className="mt-5 font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                Vergelijk energiecontracten voor thuis
              </h1>
              <p className="mt-4 text-white/85 text-lg leading-relaxed max-w-xl">
                Vergelijk contracten op een manier die je snapt. We focussen niet alleen op prijs, maar ook op vaste kosten, looptijd,
                voorwaarden en (bij zonnepanelen) teruglevering.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="#vergelijken"
                  className="inline-flex justify-center items-center px-6 py-3 bg-white text-brand-navy-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Start met vergelijken
                </Link>
                <Link
                  href="/particulier/dynamisch"
                  className="inline-flex justify-center items-center px-6 py-3 bg-white/10 text-white rounded-xl font-semibold border border-white/20 hover:bg-white/15 transition-all"
                >
                  Keuzehulp: dynamisch
                </Link>
              </div>
            </div>

            {/* Form */}
            <div id="vergelijken" className="scroll-mt-28">
              <QuickCalculator resultsPath="/particulier/energie-vergelijken/resultaten" />
            </div>
          </div>
        </div>

        <WaveDivider />
      </section>

      <div className="container-custom py-12">

        {/* What you need / common questions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Wat heb je nodig?</h2>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>
                <span className="font-semibold text-brand-navy-600">Adres</span> (postcode + huisnummer)
              </li>
              <li>
                <span className="font-semibold text-brand-navy-600">Verbruik</span> (schatting is oké)
              </li>
              <li>
                <span className="font-semibold text-brand-navy-600">Zonnepanelen?</span> Dan ook teruglevering meenemen
              </li>
              <li>
                <span className="font-semibold text-brand-navy-600">Huidig contract</span> (optioneel, voor context)
              </li>
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              Tip: je jaarafrekening is handig, maar niet verplicht.
            </p>
          </div>

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
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Keuzehulp</h2>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              Twijfel je tussen vast, variabel of dynamisch? Begin met dit simpele uitgangspunt:
            </p>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>
                <span className="font-semibold text-brand-navy-600">Vast</span>: je wilt zekerheid
              </li>
              <li>
                <span className="font-semibold text-brand-navy-600">Variabel</span>: je wilt flexibiliteit
              </li>
              <li>
                <span className="font-semibold text-brand-navy-600">Dynamisch</span>: je kunt verbruik sturen (vaak met zonnepanelen)
              </li>
            </ul>
            <div className="mt-4 space-y-2">
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/particulier/vast">
                Lees: Vast contract →
              </Link>
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/particulier/variabel">
                Lees: Variabel contract →
              </Link>
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/particulier/dynamisch">
                Lees: Dynamisch contract →
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ teaser */}
        <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-600">Veelgestelde vragen</h2>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Snel antwoord op de meest voorkomende vragen over contracttypes, overstappen en zonnepanelen.
              </p>
            </div>
            <Link
              href="/particulier/faq"
              className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-brand-teal-50 hover:border-brand-teal-200 transition-all"
            >
              Naar FAQ
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-2xl p-5">
              <p className="font-semibold text-brand-navy-600">Waar moet ik op letten behalve prijs?</p>
              <p className="mt-2 text-gray-600 text-sm">
                Let vooral op vaste kosten, looptijd, voorwaarden en bij zonnepanelen teruglevering.
              </p>
            </div>
            <div className="border border-gray-200 rounded-2xl p-5">
              <p className="font-semibold text-brand-navy-600">Kan ik overstappen als ik nog een contract heb?</p>
              <p className="mt-2 text-gray-600 text-sm">
                Vaak wel. Houd rekening met mogelijke opzegkosten; wij helpen je dit te checken.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8">
          <div className="bg-gradient-to-br from-brand-navy-500 to-brand-teal-600 rounded-3xl p-8 md:p-10 text-white">
            <h2 className="font-display text-2xl md:text-3xl font-bold">Start je vergelijking</h2>
            <p className="mt-3 text-white/85 max-w-2xl">
              Begin met vergelijken en ontdek wat het beste past bij jouw situatie.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="#vergelijken"
                className="inline-flex justify-center items-center px-6 py-3 bg-white text-brand-navy-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Vergelijk nu
              </Link>
              <Link
                href="/particulier/klantenservice"
                className="inline-flex justify-center items-center px-6 py-3 bg-white/10 text-white rounded-xl font-semibold border border-white/20 hover:bg-white/15 transition-all"
              >
                Hulp nodig?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


