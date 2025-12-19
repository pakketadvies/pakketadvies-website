import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Energie vergelijken voor thuis',
  alternates: { canonical: 'https://pakketadvies.nl/particulier' },
}

export default function ParticulierHomePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-brand-navy-500 via-brand-navy-600 to-brand-teal-600">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/90 text-sm font-semibold">
                Energie vergelijken voor thuis
              </p>
              <h1 className="mt-5 font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                Vind het energiecontract dat bij jou past
              </h1>
              <p className="mt-4 text-white/85 text-lg leading-relaxed max-w-xl">
                Vast, variabel of dynamisch — wij helpen je helder vergelijken, met uitleg die je snapt. In een paar minuten weet je
                wat verstandig is voor jouw situatie.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/particulier/energie-vergelijken"
                  className="inline-flex justify-center items-center px-6 py-3 bg-white text-brand-navy-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Vergelijk energietarieven
                </Link>
                <Link
                  href="/particulier/dynamisch"
                  className="inline-flex justify-center items-center px-6 py-3 bg-white/10 text-white rounded-xl font-semibold border border-white/20 hover:bg-white/15 transition-all"
                >
                  Meer over dynamisch
                </Link>
              </div>
            </div>

            {/* Card (form-like) */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-white/30">
              <h2 className="font-display text-2xl font-bold text-brand-navy-600">Check je voordeel</h2>
              <p className="mt-2 text-gray-600">
                Vul je gegevens in en start direct met vergelijken. (MVP: we sturen je door naar onze vergelijkpagina.)
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Postcode</label>
                  <input
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
                    placeholder="1234AB"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Huisnummer</label>
                  <input
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
                    placeholder="12"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Ik zit nu bij</label>
                  <select className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500">
                    <option>Leverancier (optioneel)</option>
                    <option>Onbekend / Anders</option>
                    <option>Geen i.v.m. verhuizing</option>
                    <option>Verschillend voor gas en stroom</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link
                  href="/particulier/energie-vergelijken"
                  className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-brand-teal-500/25 hover:bg-brand-teal-600 hover:shadow-xl transition-all"
                >
                  Start vergelijken
                </Link>
                <p className="text-xs text-gray-500">
                  Tip: heb je zonnepanelen? Bekijk dan ook{' '}
                  <Link className="text-brand-teal-600 underline" href="/particulier/zonnepanelen">
                    zonnepaneel-opties
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / highlights */}
      <section className="py-10 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <p className="text-brand-navy-600 font-semibold">Helder & onafhankelijk</p>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Geen jargon, wél duidelijke keuzes: vast, variabel of dynamisch — inclusief uitleg voor zonnepanelen en teruglevering.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <p className="text-brand-navy-600 font-semibold">Snel geregeld</p>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                In een paar minuten vergelijken. Zie meteen welke contracten logisch zijn voor jouw verbruik en woon situatie.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <p className="text-brand-navy-600 font-semibold">Persoonlijk advies</p>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Twijfel je? Dan helpen we je graag. Je kunt altijd contact opnemen voor een korte check.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content cards */}
      <section className="py-12">
        <div className="container-custom">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-bold text-brand-navy-600">Populaire onderwerpen</h2>
              <p className="mt-2 text-gray-600">Praktische uitleg in consumententaal, in dezelfde PakketAdvies stijl.</p>
            </div>
            <Link href="/particulier/kennisbank" className="hidden md:inline-flex text-brand-teal-600 font-semibold hover:underline">
              Naar de kennisbank
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/particulier/dynamisch" className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
              <div className="relative h-40">
                <Image src="/images/solar-roof.jpg" alt="Zonnepanelen" fill className="object-cover" />
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-brand-teal-600">Dynamisch</p>
                <h3 className="mt-2 font-display text-xl font-bold text-brand-navy-600 group-hover:text-brand-teal-600 transition-colors">
                  Is dynamisch interessant voor jou?
                </h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                  Hoe werkt het, wat zijn de risico’s, en wanneer is het slim (zeker met zonnepanelen)?
                </p>
              </div>
            </Link>

            <Link href="/particulier/vast" className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
              <div className="relative h-40">
                <Image src="/images/contract-signing.jpg" alt="Vast contract" fill className="object-cover" />
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-brand-teal-600">Vast contract</p>
                <h3 className="mt-2 font-display text-xl font-bold text-brand-navy-600 group-hover:text-brand-teal-600 transition-colors">
                  Zekerheid met een vaste prijs
                </h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                  Wanneer is vast slim, en waar moet je op letten bij looptijd en voorwaarden?
                </p>
              </div>
            </Link>

            <Link href="/particulier/verhuizen" className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
              <div className="relative h-40">
                <Image src="/images/kantoren-office.jpg" alt="Verhuizen" fill className="object-cover" />
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-brand-teal-600">Verhuizen</p>
                <h3 className="mt-2 font-display text-xl font-bold text-brand-navy-600 group-hover:text-brand-teal-600 transition-colors">
                  Energie regelen bij verhuizing
                </h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                  Checklist + valkuilen: zo voorkom je dubbele kosten en kies je direct goed.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}


