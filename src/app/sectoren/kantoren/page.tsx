import Link from 'next/link'
import Image from 'next/image'
import { Briefcase, Check, ArrowRight, Lightning, Leaf, Shield, TrendUp, Handshake } from '@phosphor-icons/react/dist/ssr'

export default function KantorenPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-teal-600 via-brand-teal-500 to-brand-teal-600 text-white py-12 md:py-16 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/office-team.jpg"
            alt="Kantoren sector"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/20 border border-white/30 rounded-full px-4 py-2 mb-6">
              <Briefcase weight="duotone" className="w-5 h-5" />
              <span className="text-sm font-semibold">Kantoren & Zakelijke Dienstverlening</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Energieoplossingen voor <span className="text-teal-100">kantoren en zakelijke dienstverlening</span>
            </h1>
            <p className="text-lg md:text-xl text-teal-100 mb-8">
              Voorspelbaar verbruik, budgetzekerheid en ESG-doelen. Perfect voor kantoorpanden die 
              zekerheid willen combineren met duurzaamheid en een groen imago.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/calculator">
                <button className="px-8 py-4 bg-white text-brand-teal-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
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
              Energie-behoeften voor kantoren
            </h2>
            <p className="text-lg text-gray-600">
              Kantoorpanden hebben voorspelbaar verbruik en steeds vaker duurzaamheidsdoelen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: TrendUp,
                title: 'Voorspelbaar verbruik',
                desc: 'Vaste kantooruren betekenen consistent energiepatroon - ideaal voor budgettering.',
                solution: 'Vaste contracten (3 jaar) met scherpe tarieven door voorspelbaarheid.'
              },
              {
                icon: Leaf,
                title: 'ESG & duurzaamheidsdoelen',
                desc: 'Steeds meer bedrijven willen CO₂-neutraal zijn en groene energie afnemen.',
                solution: '100% groene stroom met certificaten en complete CO₂-rapportage.'
              },
              {
                icon: Shield,
                title: 'Budgetzekerheid',
                desc: 'Finance wil voorspelbare kosten zonder verrassingen in de exploitatie.',
                solution: 'Transparante prijsopbouw en vaste tarieven voor meerdere jaren.'
              }
            ].map((challenge, i) => {
              const Icon = challenge.icon
              return (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <Icon weight="duotone" className="w-10 h-10 text-brand-teal-500 mb-4" />
                  <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                    {challenge.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{challenge.desc}</p>
                  <div className="bg-brand-teal-50 rounded-lg p-3 border border-brand-teal-200">
                    <div className="text-xs font-semibold text-brand-teal-800 mb-1">💡 Oplossing:</div>
                    <div className="text-sm text-brand-teal-700">{challenge.solution}</div>
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
              Zo helpen we kantoren
            </h2>
            <p className="text-lg text-gray-600">
              Van kleine kantoren tot grote bedrijfspanden - budgetzekerheid en duurzaamheid gecombineerd.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-6">
                Waarom vaste contracten ideaal zijn
              </h3>
              <p className="text-gray-600 mb-6">
                Door het voorspelbare verbruikspatroon van kantoren (kantooruren, weinig pieken) 
                zijn vaste contracten vaak de beste keuze. Je krijgt zekerheid én scherpe tarieven.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    benefit: 'Budgetzekerheid',
                    desc: 'Weet precies wat je betaalt voor 1-5 jaar, ideaal voor financiële planning'
                  },
                  {
                    benefit: '100% groene energie',
                    desc: 'Voldoe aan ESG-doelen met gecertificeerde groene stroom'
                  },
                  {
                    benefit: 'CO₂-rapportage',
                    desc: 'Complete rapportage voor scope 2 emissies en duurzaamheidsverslagen'
                  },
                  {
                    benefit: 'Geen verborgen kosten',
                    desc: 'Transparante prijsopbouw, wat je ziet is wat je betaalt'
                  }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <Check weight="bold" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-brand-navy-500 mb-1">{item.benefit}</div>
                      <div className="text-sm text-gray-600">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-brand-teal-50 to-brand-teal-100 rounded-2xl p-8 border border-brand-teal-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">
                Case: Advocatenkantoor Amsterdam
              </h3>
              <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600 mb-1">Besparing per jaar</div>
                  <div className="text-5xl font-bold text-brand-teal-600 mb-1">€3.200</div>
                  <div className="text-sm text-gray-600">met 3-jarig vast contract</div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Een advocatenkantoor met 35 medewerkers (85.000 kWh/jaar) stapte over naar een 
                3-jarig vast contract met 100% groene energie. Door het juiste moment van afsluiten 
                en voorspelbaar verbruik bespaarden ze €3.200 per jaar.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-brand-teal-200">
                  <span className="text-gray-600">Medewerkers:</span>
                  <span className="font-semibold">35 fte</span>
                </div>
                <div className="flex justify-between py-2 border-b border-brand-teal-200">
                  <span className="text-gray-600">Verbruik:</span>
                  <span className="font-semibold">85.000 kWh/jaar</span>
                </div>
                <div className="flex justify-between py-2 border-b border-brand-teal-200">
                  <span className="text-gray-600">Contract:</span>
                  <span className="font-semibold">Vast 3 jaar groen</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">CO₂-reductie:</span>
                  <span className="font-semibold text-green-600">100% (0 kg CO₂)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ESG Benefits */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-6 text-center">
              ESG-voordelen voor kantoren
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Scope 2 rapportage',
                  desc: 'Complete CO₂-rapportage voor jaarverslagen en ESG-rapportages',
                  icon: '📊'
                },
                {
                  title: 'Groene certificaten',
                  desc: '100% groene stroom met GvO certificaten (Garanties van Oorsprong)',
                  icon: '🌱'
                },
                {
                  title: 'B-Corp ready',
                  desc: 'Voldoe aan duurzaamheidseisen voor B-Corp certificering',
                  icon: '🏆'
                },
                {
                  title: 'CO₂-neutraal',
                  desc: 'Bereik CO₂-neutraliteit voor scope 2 emissies',
                  icon: '♻️'
                }
              ].map((benefit, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl mb-3">{benefit.icon}</div>
                  <div className="font-semibold text-brand-navy-500 mb-2">{benefit.title}</div>
                  <div className="text-sm text-gray-600">{benefit.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Typical Usage */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-8 text-center">
            Typisch energieverbruik kantoren
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { size: 'Klein kantoor', fte: '< 20 fte', range: '20.000 - 50.000 kWh' },
              { size: 'Middelgroot kantoor', fte: '20-100 fte', range: '50.000 - 150.000 kWh' },
              { size: 'Groot kantoor', fte: '> 100 fte', range: '150.000 - 500.000+ kWh' }
            ].map((usage, i) => (
              <div key={i} className="bg-brand-teal-50 rounded-xl p-6 border border-brand-teal-200">
                <div className="font-semibold text-brand-navy-500 mb-2">{usage.size}</div>
                <div className="text-sm text-gray-600 mb-3">{usage.fte}</div>
                <div>
                  <div className="text-xs text-gray-600">Jaarverbruik:</div>
                  <div className="font-bold text-brand-teal-600 text-lg">{usage.range}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-100 rounded-xl p-6 border border-gray-300">
            <div className="flex items-start gap-3">
              <Lightning weight="duotone" className="w-6 h-6 text-brand-teal-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-brand-navy-500 mb-2">💡 Vuistregel voor kantoren:</div>
                <p className="text-sm text-gray-700">
                  Gemiddeld verbruik: <strong>2.000 - 2.500 kWh per fte per jaar</strong>. 
                  Dit omvat verlichting, computers, airco/verwarming en keukenapparatuur. 
                  Met LED-verlichting en efficiënte klimaatbeheersing kun je dit met 20-30% verlagen.
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
              Extra services voor kantoren
            </h2>
            <p className="text-lg text-gray-600">
              Meer dan alleen energie - we helpen je met duurzaamheid en kostenbesparing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Energie-scan',
                desc: 'Gratis scan van je kantoor voor besparingsmogelijkheden (LED, isolatie, etc.)',
                icon: '🔍'
              },
              {
                title: 'Zonnepanelen advies',
                desc: 'Is jouw dak geschikt? Wij adviseren over terugverdientijd en opbrengst',
                icon: '☀️'
              },
              {
                title: 'Smart meters',
                desc: 'Installatie en koppeling voor real-time inzicht in je verbruik',
                icon: '📱'
              },
              {
                title: 'ESG-rapportage',
                desc: 'Volledige CO₂-footprint en duurzaamheidsrapportage voor scope 2',
                icon: '📈'
              },
              {
                title: 'Groene certificaten',
                desc: 'GvO-certificaten voor aantoonbaar groene energieafname',
                icon: '🌱'
              },
              {
                title: 'Snelle overstap',
                desc: 'Binnen 2 weken geregeld zonder onderbreking van je bedrijf',
                icon: '⚡'
              }
            ].map((service, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-brand-teal-300 hover:shadow-lg transition-all">
                <div className="text-4xl mb-3">{service.icon}</div>
                <div className="font-semibold text-brand-navy-500 mb-2">{service.title}</div>
                <div className="text-sm text-gray-600">{service.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-teal-600 to-brand-teal-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
        
        <div className="container-custom text-center relative z-10">
          <Handshake weight="duotone" className="w-16 h-16 text-teal-200 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Budgetzekerheid en duurzaamheid voor jouw kantoor
          </h2>
          <p className="text-lg md:text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Vaste tarieven, 100% groene energie en complete ESG-rapportage. 
            Bereik je duurzaamheidsdoelen zonder verrassingen in je energiekosten.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <button className="px-8 py-4 bg-white text-brand-teal-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Lightning weight="duotone" className="w-6 h-6" />
                Bereken je besparing
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 bg-brand-teal-800 hover:bg-brand-teal-900 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
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

