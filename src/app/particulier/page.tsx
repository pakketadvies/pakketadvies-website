import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ConsumerAddressStartCard } from '@/components/particulier/ConsumerAddressStartCard'

export const metadata: Metadata = {
  title: 'Energie vergelijken voor thuis | PakketAdvies',
  description:
    'Vergelijk energiecontracten voor thuis: vast, variabel of dynamisch. Ontdek wat het beste past bij jouw situatie en bespaar tot 30% op je energierekening. Gratis en vrijblijvend advies.',
  keywords: [
    'energie vergelijken particulier',
    'energiecontract thuis',
    'stroom en gas vergelijken',
    'dynamisch energiecontract',
    'vast energiecontract',
    'variabel energiecontract',
    'energie besparen thuis',
    'energieleverancier vergelijken',
  ],
  openGraph: {
    title: 'Energie vergelijken voor thuis | PakketAdvies',
    description:
      'Vergelijk energiecontracten voor thuis: vast, variabel of dynamisch. Ontdek wat het beste past bij jouw situatie en bespaar tot 30% op je energierekening.',
    type: 'website',
    url: 'https://pakketadvies.nl/particulier',
    siteName: 'PakketAdvies',
    locale: 'nl_NL',
    images: [
      {
        url: 'https://pakketadvies.nl/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'PakketAdvies - Energie vergelijken voor thuis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Energie vergelijken voor thuis | PakketAdvies',
    description:
      'Vergelijk energiecontracten voor thuis: vast, variabel of dynamisch. Ontdek wat het beste past bij jouw situatie en bespaar tot 30%.',
    images: ['https://pakketadvies.nl/images/hero-main.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/particulier',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

export default function ParticulierHomePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-12 md:py-16 pb-20 md:pb-28 pt-24 md:pt-32 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-main.jpg"
            alt="Professional office team"
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 via-brand-navy-600/90 to-brand-navy-700/95" />
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container-custom relative z-10">
          {/* Mobile Layout */}
          <div className="lg:hidden">
            <div className="text-center mb-6">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
                Bespaar tot{' '}
                <span className="text-brand-teal-400">€500 per jaar</span>
              </h1>
              <p className="text-white/90 text-base md:text-lg leading-relaxed px-4">
                Vergelijk gratis en vind je beste deal
              </p>
            </div>

            <ConsumerAddressStartCard />

            {/* Trust indicators & motivation - Mobile */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                <svg className="w-5 h-5 text-brand-teal-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Gratis vergelijken</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                <svg className="w-5 h-5 text-brand-teal-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>In 2 minuten klaar</span>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white/90 text-sm font-semibold mb-6">
                Energie vergelijken voor thuis
              </p>
              <h1 className="font-display text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                Bespaar tot{' '}
                <span className="text-brand-teal-400">€500 per jaar</span>
              </h1>
              <p className="text-white/90 text-xl leading-relaxed max-w-xl mb-6">
                Vergelijk gratis en vind je beste deal. Vast, variabel of dynamisch — wij helpen je helder vergelijken, met uitleg die je snapt.
              </p>
              
              {/* Trust indicators - Desktop */}
              <div className="flex items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Gratis vergelijken</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">In 2 minuten klaar</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                  <span className="text-sm font-medium">2.500+ reviews</span>
                </div>
              </div>
            </div>

            <ConsumerAddressStartCard />
          </div>
        </div>

        {/* Bottom transition */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
          <svg 
            viewBox="0 0 1440 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-full h-20 md:h-24 lg:h-auto"
            preserveAspectRatio="none"
          >
            <path d="M0,95 Q360,65 720,95 T1440,95 L1440,120 L0,120 Z" fill="white"/>
            <path 
              d="M0,95 Q360,65 720,95 T1440,95" 
              stroke="url(#energyGradient)" 
              strokeWidth="2" 
              fill="none"
              opacity="0.4"
            />
            <defs>
              <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00AF9B" stopOpacity="0" />
                <stop offset="20%" stopColor="#00AF9B" stopOpacity="1" />
                <stop offset="50%" stopColor="#00AF9B" stopOpacity="1" />
                <stop offset="80%" stopColor="#00AF9B" stopOpacity="1" />
                <stop offset="100%" stopColor="#00AF9B" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* Choice helper */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-brand-navy-600">Welke optie past bij jou?</h2>
            <p className="mt-2 text-gray-600">
              Je hoeft niet alles te weten over energie. Kies het contracttype dat bij jouw voorkeuren past — wij helpen je helder vergelijken.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-brand-teal-300 transition-colors">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal-600">Vast</p>
              <h3 className="mt-2 font-display text-xl font-bold text-brand-navy-600">Rust & zekerheid</h3>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Je wilt voorspelbare kosten. Handig als je geen verrassingen wil en je liever "klaar" bent.
              </p>
              <div className="mt-4">
                <Link className="inline-flex items-center gap-1 text-brand-teal-600 font-semibold hover:text-brand-teal-700 hover:underline transition-colors" href="/particulier/vast">
                  Lees meer <span>→</span>
                </Link>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-brand-teal-300 transition-colors">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal-600">Variabel</p>
              <h3 className="mt-2 font-display text-xl font-bold text-brand-navy-600">Flexibel</h3>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Je vindt flexibiliteit belangrijk en kunt omgaan met tariefwijzigingen gedurende het jaar.
              </p>
              <div className="mt-4">
                <Link className="inline-flex items-center gap-1 text-brand-teal-600 font-semibold hover:text-brand-teal-700 hover:underline transition-colors" href="/particulier/variabel">
                  Lees meer <span>→</span>
                </Link>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-brand-teal-300 transition-colors">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal-600">Dynamisch</p>
              <h3 className="mt-2 font-display text-xl font-bold text-brand-navy-600">Slim sturen</h3>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Je kunt verbruik verplaatsen (bijv. laden/was) en wil profiteren van daluren. Vaak interessant bij zonnepanelen.
              </p>
              <div className="mt-4">
                <Link className="inline-flex items-center gap-1 text-brand-teal-600 font-semibold hover:text-brand-teal-700 hover:underline transition-colors" href="/particulier/dynamisch">
                  Lees meer <span>→</span>
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
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-brand-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <p className="text-brand-teal-600 font-semibold">Vul je situatie in</p>
              </div>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Denk aan adres, verbruik (schatting is oké), en of je zonnepanelen hebt.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-brand-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <p className="text-brand-teal-600 font-semibold">Vergelijk contracten</p>
              </div>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Let niet alleen op prijs, maar ook op looptijd, vaste kosten en voorwaarden (teruglevering).
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-brand-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <p className="text-brand-teal-600 font-semibold">Kies met vertrouwen</p>
              </div>
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
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-brand-teal-300 transition-colors">
              <p className="text-brand-navy-600 font-semibold text-lg">Helder & onafhankelijk</p>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Geen jargon, wél duidelijke keuzes: vast, variabel of dynamisch — inclusief uitleg voor zonnepanelen en teruglevering.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-brand-teal-300 transition-colors">
              <p className="text-brand-navy-600 font-semibold text-lg">Snel geregeld</p>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                In een paar minuten vergelijken. Zie meteen welke contracten logisch zijn voor jouw verbruik en woon situatie.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-brand-teal-300 transition-colors">
              <p className="text-brand-navy-600 font-semibold text-lg">Persoonlijk advies</p>
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
              <h2 className="font-display text-3xl font-bold text-brand-navy-600">Handige artikelen</h2>
              <p className="mt-2 text-gray-600">Alles wat je moet weten over energiecontracten, in heldere taal uitgelegd.</p>
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


