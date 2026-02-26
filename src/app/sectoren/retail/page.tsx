import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Storefront, Check, ArrowRight, Lightning, Buildings, ChartLine, ShieldCheck, Handshake, Lightbulb, ChartLineUp, CalendarCheck, Users, Package } from '@phosphor-icons/react/dist/ssr'

export const metadata: Metadata = {
  title: 'Zakelijke energie voor retail',
  description: 'Energieadvies voor winkels en winkelketens. Optimaliseer energiekosten per vestiging met slimme contractkeuzes en centrale inkoop.',
  alternates: {
    canonical: 'https://pakketadvies.nl/sectoren/retail',
  },
  openGraph: {
    title: 'Zakelijke energie voor retail | PakketAdvies',
    description: 'Energieoplossingen voor retail met focus op vestigingsbeheer, kostencontrole en inkoopvoordeel.',
    url: 'https://pakketadvies.nl/sectoren/retail',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zakelijke energie voor retail | PakketAdvies',
    description: 'Energieoplossingen voor retail met focus op vestigingsbeheer, kostencontrole en inkoopvoordeel.',
  },
}

export default function RetailPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy-600 via-brand-navy-500 to-brand-navy-600 text-white py-12 md:py-16 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/testimonial-warehouse.jpg"
            alt="Retail sector"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/20 border border-white/30 rounded-full px-4 py-2 mb-6">
              <Storefront weight="duotone" className="w-5 h-5" />
              <span className="text-sm font-semibold">Retail Sector</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Energieoplossingen voor <span className="text-brand-navy-200">winkels en winkelketens</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8">
              Optimaliseer je energiekosten over alle vestigingen met centrale inkoop, portfolio management 
              en transparante rapportage per locatie.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/calculator">
                <button className="px-8 py-4 bg-white text-brand-navy-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                  <Lightning weight="duotone" className="w-6 h-6" />
                  Bereken je besparing
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold text-lg border border-white/20 transition-all flex items-center justify-center gap-2">
                  Plan adviesgesprek
                  <ArrowRight weight="bold" className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Energie-uitdagingen in de retail
            </h2>
            <p className="text-lg text-gray-600">
              Retail bedrijven hebben unieke energiebehoeften, vooral bij meerdere vestigingen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Buildings,
                title: 'Meerdere vestigingen',
                desc: 'Elk met eigen aansluiting, maar je wilt uniforme inkoop en centrale facturering.',
                solution: 'Portfolio management met één centraal contract voor alle locaties.'
              },
              {
                icon: ChartLine,
                title: 'Kosten per m² beheersen',
                desc: 'Energiekosten zijn een significante kostenpost per vierkante meter winkelruimte.',
                solution: 'Transparante rapportage per vestiging met benchmarking mogelijkheden.'
              },
              {
                icon: ShieldCheck,
                title: 'Voorspelbaar verbruik',
                desc: 'Vaste openingstijden betekenen consistent verbruikspatroon, ideaal voor planning.',
                solution: 'Vaste contracten met scherpe tarieven door voorspelbaarheid.'
              }
            ].map((challenge, i) => {
              const Icon = challenge.icon
              return (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <Icon weight="duotone" className="w-10 h-10 text-brand-navy-500 mb-4" />
                  <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                    {challenge.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{challenge.desc}</p>
                  <div className="bg-brand-navy-50 rounded-lg p-3 border border-brand-navy-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb weight="duotone" className="w-4 h-4 text-brand-navy-700" />
                      <div className="text-xs font-semibold text-brand-navy-800">Oplossing:</div>
                    </div>
                    <div className="text-sm text-brand-navy-700">{challenge.solution}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Solutions */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Zo helpen we retail bedrijven
            </h2>
            <p className="text-lg text-gray-600">
              Van enkele winkels tot grote ketens - onze oplossingen schalen mee met jouw bedrijf.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-6">
                Voor enkele winkels (1-3 locaties)
              </h3>
              <div className="space-y-4">
                {[
                  {
                    type: 'Vast contract (3 jaar)',
                    reason: 'Budgetzekerheid en voorspelbare kosten voor stabiele exploitatie',
                    benefit: 'Zekerheid + transparantie'
                  },
                  {
                    type: 'Dynamisch contract',
                    reason: 'Voor flexibiliteit en profijt van daluren (vooral voor koeling)',
                    benefit: 'Tot 20% besparing'
                  }
                ].map((contract, i) => (
                  <div key={i} className="border-l-4 border-brand-navy-500 bg-brand-navy-50 rounded-r-lg p-4">
                    <div className="font-semibold text-brand-navy-500 mb-1">{contract.type}</div>
                    <div className="text-sm text-gray-600 mb-2">{contract.reason}</div>
                    <div className="text-xs font-bold text-brand-navy-600">→ {contract.benefit}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-6">
                Voor winkelketens (4+ locaties)
              </h3>
              <div className="space-y-4">
                {[
                  {
                    type: 'Maatwerk contract',
                    reason: 'Bundel alle vestigingen voor volume-voordeel en centrale facturering',
                    benefit: '15-25% extra korting'
                  },
                  {
                    type: 'Portfolio management',
                    reason: 'Centrale inkoop, uniforme voorwaarden, rapportage per vestiging',
                    benefit: 'Maximaal overzicht'
                  }
                ].map((contract, i) => (
                  <div key={i} className="border-l-4 border-brand-purple-500 bg-brand-purple-50 rounded-r-lg p-4">
                    <div className="font-semibold text-brand-navy-500 mb-1">{contract.type}</div>
                    <div className="text-sm text-gray-600 mb-2">{contract.reason}</div>
                    <div className="text-xs font-bold text-brand-purple-600">→ {contract.benefit}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Case Study */}
          <div className="bg-gradient-to-br from-brand-navy-50 to-gray-100 rounded-2xl overflow-hidden border border-brand-navy-200">
            {/* Mobile-first responsive photo */}
            <div className="relative h-56 md:h-64 lg:h-72 overflow-hidden">
              <Image
                src="/images/retail-store.jpg"
                alt="Retail store interior"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-4 md:bottom-4 md:left-6">
                <h3 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-white">
                  Case: Kledingketen met 8 vestigingen
                </h3>
              </div>
            </div>

            <div className="p-6 md:p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-700 mb-6">
                  Een kledingketen bundelde het verbruik van alle 8 winkels (totaal 180.000 kWh). 
                  Door centrale inkoop en volume-voordeel bespaarden ze €6.800 per jaar. 
                  Bovendien krijgen ze nu één centrale factuur met duidelijke breakdown per vestiging.
                </p>
                <ul className="space-y-3">
                  {[
                    'Centrale inkoop voor alle vestigingen',
                    'Één factuur met breakdown per winkel',
                    'ESG-rapportage voor alle locaties',
                    'Vaste accountmanager voor de hele keten'
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check weight="bold" className="w-5 h-5 text-brand-navy-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-600 mb-1">Totale besparing per jaar</div>
                  <div className="text-5xl font-bold text-brand-navy-600 mb-1">€6.800</div>
                  <div className="text-sm text-gray-600">over 8 vestigingen</div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Aantal vestigingen:</span>
                    <span className="font-semibold">8 winkels</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Totaal verbruik:</span>
                    <span className="font-semibold">180.000 kWh/jaar</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Contract type:</span>
                    <span className="font-semibold">Maatwerk 3 jaar</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Extra korting:</span>
                    <span className="font-semibold text-brand-navy-600">18% volume voordeel</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typical Usage */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-8 text-center">
            Typisch energieverbruik retail
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { type: 'Kleine winkel', size: '< 100 m²', range: '10.000 - 25.000 kWh' },
              { type: 'Middelgrote winkel', size: '100 - 500 m²', range: '25.000 - 80.000 kWh' },
              { type: 'Grote winkel/supermarkt', size: '> 500 m²', range: '80.000 - 200.000+ kWh' }
            ].map((usage, i) => (
              <div key={i} className="bg-brand-navy-50 rounded-xl p-6 border border-brand-navy-200">
                <div className="font-semibold text-brand-navy-500 mb-2">{usage.type}</div>
                <div className="text-sm text-gray-600 mb-3">{usage.size}</div>
                <div>
                  <div className="text-xs text-gray-600">Jaarverbruik:</div>
                  <div className="font-bold text-brand-navy-600 text-lg">{usage.range}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-brand-teal-50 rounded-xl p-6 border-2 border-brand-teal-200">
            <div className="flex items-start gap-3">
              <Lightning weight="duotone" className="w-6 h-6 text-brand-teal-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-brand-navy-500 mb-2">Besparingstip voor retail:</div>
                <p className="text-sm text-gray-700">
                  Koeling is vaak de grootste energieverbruiker in retail (30-40% van totaal verbruik). 
                  Met LED-verlichting, efficiënte koeling en een dynamisch contract kun je tot 35% besparen op je energiekosten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extra Services */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Extra services voor retail
            </h2>
            <p className="text-lg text-gray-600">
              Meer dan alleen energie-inkoop - we helpen je met het complete energiemanagement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'ESG-rapportage',
                desc: 'Duurzaamheidsrapportage per vestiging voor stakeholders',
                icon: ChartLineUp
              },
              {
                title: 'Benchmark tools',
                desc: 'Vergelijk verbruik tussen je vestigingen en identificeer uitschieters',
                icon: ChartLine
              },
              {
                title: 'Expansie support',
                desc: 'Nieuwe winkel openen? Wij regelen direct de energie-aansluiting',
                icon: Storefront
              },
              {
                title: 'Energie-audit',
                desc: 'Gratis advies over besparingsmogelijkheden per locatie',
                icon: Lightbulb
              }
            ].map((service, i) => {
              const Icon = service.icon
              return (
              <div key={i} className="text-center bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-brand-navy-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon weight="duotone" className="w-6 h-6 text-brand-navy-500" />
                </div>
                <div className="font-semibold text-brand-navy-500 mb-2">{service.title}</div>
                <div className="text-sm text-gray-600">{service.desc}</div>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-navy-600 to-brand-navy-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
        
        <div className="container-custom text-center relative z-10">
          <Handshake weight="duotone" className="w-16 h-16 text-brand-navy-200 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Optimaliseer je energiekosten over alle vestigingen
          </h2>
          <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Of je nu 1 winkel of 50 vestigingen hebt - we regelen de beste energiedeal voor jouw retailbedrijf.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <button className="px-8 py-4 bg-white text-brand-navy-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Lightning weight="duotone" className="w-6 h-6" />
                Bereken je besparing
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 bg-brand-navy-800 hover:bg-brand-navy-900 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
                Plan adviesgesprek
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

