import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { WaveDivider } from '@/components/ui/WaveDivider'
import { ConsumerAddressStartCard } from '@/components/particulier/ConsumerAddressStartCard'

export const metadata: Metadata = {
  title: 'Energie vergelijken voor thuis',
  alternates: { canonical: 'https://pakketadvies.nl/particulier' },
}

export default function ParticulierHomePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative pt-28 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-brand-navy-500 via-brand-navy-600 to-brand-teal-600 overflow-hidden">
        <div className="container-custom relative z-10">
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
            </div>

            <ConsumerAddressStartCard />
          </div>
        </div>

        <WaveDivider variant="heroLow" />
      </section>

      {/* Choice helper */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-brand-navy-600">Welke optie past bij jou?</h2>
            <p className="mt-2 text-gray-600">
              Je hoeft niet alles te weten over energie. Kies het contracttype dat bij jouw voorkeuren past — wij helpen je vergelijken.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal-600">Vast</p>
              <h3 className="mt-2 font-display text-xl font-bold text-brand-navy-600">Rust & zekerheid</h3>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Je wilt voorspelbare kosten. Handig als je geen verrassingen wil en je liever “klaar” bent.
              </p>
              <div className="mt-4 flex gap-3">
                <Link className="text-brand-teal-600 font-semibold hover:underline" href="/particulier/vast">
                  Lees meer →
                </Link>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal-600">Variabel</p>
              <h3 className="mt-2 font-display text-xl font-bold text-brand-navy-600">Flexibel</h3>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Je vindt flexibiliteit belangrijk en kunt omgaan met tariefwijzigingen gedurende het jaar.
              </p>
              <div className="mt-4 flex gap-3">
                <Link className="text-brand-teal-600 font-semibold hover:underline" href="/particulier/variabel">
                  Lees meer →
                </Link>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal-600">Dynamisch</p>
              <h3 className="mt-2 font-display text-xl font-bold text-brand-navy-600">Slim sturen</h3>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Je kunt verbruik verplaatsen (bijv. laden/was) en wil profiteren van daluren. Vaak relevant bij zonnepanelen.
              </p>
              <div className="mt-4 flex gap-3">
                <Link className="text-brand-teal-600 font-semibold hover:underline" href="/particulier/dynamisch">
                  Lees meer →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/particulier/energie-vergelijken"
              className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-brand-teal-500/25 hover:bg-brand-teal-600 transition-all"
            >
              Start met vergelijken
            </Link>
            <Link
              href="/particulier/faq"
              className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-brand-teal-50 hover:border-brand-teal-200 transition-all"
            >
              Bekijk veelgestelde vragen
            </Link>
          </div>
        </div>
      </section>

      {/* Steps (Pricewise/Gaslicht style, but PakketAdvies tone) */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-brand-navy-600">In 3 stappen geregeld</h2>
            <p className="mt-2 text-gray-600">
              Vergelijken hoeft niet ingewikkeld te zijn. Dit is hoe de meeste mensen het aanpakken.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <p className="text-brand-teal-600 font-semibold">1. Vul je situatie in</p>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Denk aan adres, verbruik (schatting is oké), en of je zonnepanelen hebt.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <p className="text-brand-teal-600 font-semibold">2. Vergelijk contracten</p>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Let niet alleen op prijs, maar ook op looptijd, vaste kosten en voorwaarden (teruglevering).
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <p className="text-brand-teal-600 font-semibold">3. Kies met vertrouwen</p>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Twijfel je? Dan helpen we met een korte check zodat je een keuze maakt die bij je past.
              </p>
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

      {/* Bottom CTA */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="bg-gradient-to-br from-brand-navy-500 to-brand-teal-600 rounded-3xl p-8 md:p-10 text-white overflow-hidden">
            <h2 className="font-display text-3xl font-bold">Klaar om te vergelijken?</h2>
            <p className="mt-3 text-white/85 max-w-2xl">
              Start met vergelijken en ontdek welk contracttype logisch is voor jouw situatie — vast, variabel of dynamisch.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/particulier/energie-vergelijken"
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
      </section>
    </div>
  )
}


