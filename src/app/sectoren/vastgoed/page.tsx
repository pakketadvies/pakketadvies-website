import Link from 'next/link'
import Image from 'next/image'
import { Buildings, Check, ArrowRight, Lightning, ChartLine, FileText, TrendUp, Handshake } from '@phosphor-icons/react/dist/ssr'

export default function VastgoedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-500 to-purple-600 text-white py-12 md:py-16 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/office-team.jpg"
            alt="Vastgoed sector"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/20 border border-white/30 rounded-full px-4 py-2 mb-6">
              <Buildings weight="duotone" className="w-5 h-5" />
              <span className="text-sm font-semibold">Vastgoed Sector</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Energieoplossingen voor <span className="text-purple-200">vastgoedbeleggers en -beheerders</span>
            </h1>
            <p className="text-lg md:text-xl text-purple-100 mb-8">
              Optimaliseer energie-inkoop over je complete vastgoedportefeuille. Centrale facturering, 
              ESG-rapportage en doorbelasting naar huurders - alles onder controle.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/calculator">
                <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
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
              Energie-uitdagingen in vastgoed
            </h2>
            <p className="text-lg text-gray-600">
              Vastgoedbeheer vraagt om professioneel energiemanagement over meerdere panden en huurders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Buildings,
                title: 'Portfolio management',
                desc: 'Meerdere panden met verschillende aansluitingen, huurders en contracten - complex om te beheren.',
                solution: 'Centrale inkoop en management voor je complete portfolio met één aanspreekpunt.'
              },
              {
                icon: FileText,
                title: 'Doorbelasting huurders',
                desc: 'Energie-kosten moeten correct en transparant doorbelast worden naar huurders.',
                solution: 'Geautomatiseerde doorbelasting per pand met duidelijke specificaties.'
              },
              {
                icon: TrendUp,
                title: 'ESG & duurzaamheid',
                desc: 'Beleggers eisen steeds vaker rapportage over duurzaamheid en energielabels.',
                solution: 'Complete ESG-rapportage met CO₂-footprint en energielabel-verbeteradvies.'
              }
            ].map((challenge, i) => {
              const Icon = challenge.icon
              return (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <Icon weight="duotone" className="w-10 h-10 text-purple-500 mb-4" />
                  <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                    {challenge.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{challenge.desc}</p>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="text-xs font-semibold text-purple-800 mb-1">💡 Oplossing:</div>
                    <div className="text-sm text-purple-700">{challenge.solution}</div>
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
              Zo helpen we vastgoedbeheerders
            </h2>
            <p className="text-lg text-gray-600">
              Van enkele panden tot grote portefeuilles - professioneel energiemanagement op maat.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-6">
                Portfolio energie-inkoop
              </h3>
              <ul className="space-y-4">
                {[
                  {
                    title: 'Centrale inkoop',
                    desc: 'Eén contract voor je complete portfolio, volume-voordeel door bundeling'
                  },
                  {
                    title: 'Per-pand rapportage',
                    desc: 'Inzicht in verbruik en kosten per individueel pand in je portfolio'
                  },
                  {
                    title: 'Geautomatiseerde doorbelasting',
                    desc: 'Correcte en transparante doorberekening naar huurders'
                  },
                  {
                    title: 'Vaste accountmanager',
                    desc: 'Één aanspreekpunt voor je complete vastgoedportefeuille'
                  }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <Check weight="bold" className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-brand-navy-500 mb-1">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">
                ESG & Duurzaamheid
              </h3>
              <p className="text-gray-700 mb-6">
                Beleggers en stakeholders vragen steeds vaker om inzicht in de duurzaamheid van vastgoed. 
                Wij leveren complete rapportage en advies over energielabel-verbetering.
              </p>
              <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
                {[
                  { metric: 'CO₂-footprint', value: 'Per pand & totaal' },
                  { metric: 'Energielabels', value: 'Actueel + verbeteradvies' },
                  { metric: 'Groene energie %', value: 'Volledige transparantie' },
                  { metric: 'BENG-compliance', value: 'Advies nieuwbouw' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="text-sm text-gray-600">{item.metric}</span>
                    <span className="font-semibold text-purple-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Case Study */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl border border-gray-200">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Case: Vastgoedfonds met 24 panden
                </h3>
                <p className="text-gray-700 mb-6">
                  Een vastgoedfonds met 24 commerciële panden (kantoren en retail) bundelde hun complete 
                  energieportefeuille. Totaal verbruik: 950.000 kWh + 120.000 m³ gas. Door volume-inkoop, 
                  centrale facturering en geautomatiseerde doorbelasting naar huurders bespaarden ze €24.500 
                  per jaar én kregen ze complete ESG-rapportage voor hun beleggers.
                </p>
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 mb-1">Aantal panden</div>
                      <div className="text-2xl font-bold text-purple-600">24</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Totaal verbruik</div>
                      <div className="text-2xl font-bold text-purple-600">950k kWh</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Besparing/jaar</div>
                      <div className="text-2xl font-bold text-green-600">€24.500</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Extra korting</div>
                      <div className="text-2xl font-bold text-purple-600">22%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
                  <div className="text-sm opacity-90 mb-2">Totale besparing</div>
                  <div className="text-5xl font-bold mb-4">€24.500</div>
                  <div className="text-sm opacity-90">per jaar over 24 panden</div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="font-semibold text-brand-navy-500 mb-3">Geleverde services:</div>
                  <ul className="space-y-2 text-sm">
                    {[
                      'Centrale inkoop en facturering',
                      'Geautomatiseerde doorbelasting per huurder',
                      'Volledige ESG-rapportage voor beleggers',
                      'Energielabel verbeteradvies per pand',
                      'Vaste accountmanager voor portfolio'
                    ].map((service, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                        <span className="text-gray-700">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Complete vastgoed energie-services
            </h2>
            <p className="text-lg text-gray-600">
              Alles wat je nodig hebt voor professioneel energiemanagement van je vastgoedportefeuille.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '📊',
                title: 'Portfolio dashboard',
                desc: 'Real-time inzicht in verbruik en kosten per pand'
              },
              {
                icon: '🔄',
                title: 'Automatische doorbelasting',
                desc: 'Correcte verdeling naar huurders met specificaties'
              },
              {
                icon: '🌱',
                title: 'ESG-rapportage',
                desc: 'Duurzaamheidsrapportage voor beleggers en stakeholders'
              },
              {
                icon: '📈',
                title: 'Energielabel advies',
                desc: 'Verbeteradvies voor hogere labels en waardestijging'
              },
              {
                icon: '💰',
                title: 'Volume voordeel',
                desc: '15-25% extra korting door bundeling portfolio'
              },
              {
                icon: '📝',
                title: 'Contractbeheer',
                desc: 'Centraal beheer van alle energie-contracten'
              },
              {
                icon: '🏗️',
                title: 'Nieuwbouw support',
                desc: 'Energie-advisering bij nieuwbouw en renovaties'
              },
              {
                icon: '☎️',
                title: 'Vaste accountmanager',
                desc: 'Één aanspreekpunt voor je complete portfolio'
              }
            ].map((service, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all text-center">
                <div className="text-4xl mb-3">{service.icon}</div>
                <div className="font-semibold text-brand-navy-500 mb-2">{service.title}</div>
                <div className="text-sm text-gray-600">{service.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typical Portfolio */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-8 text-center">
            Typische vastgoedportefeuilles
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { type: 'Klein portfolio', panden: '3-10 panden', range: '200.000 - 600.000 kWh' },
              { type: 'Middelgroot portfolio', panden: '10-30 panden', range: '600.000 - 2.000.000 kWh' },
              { type: 'Groot portfolio', panden: '30+ panden', range: '2.000.000+ kWh' }
            ].map((portfolio, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="font-semibold text-brand-navy-500 mb-2">{portfolio.type}</div>
                <div className="text-sm text-gray-600 mb-3">{portfolio.panden}</div>
                <div>
                  <div className="text-xs text-gray-600">Totaal verbruik:</div>
                  <div className="font-bold text-purple-600 text-lg">{portfolio.range}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-purple-600 to-purple-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
        
        <div className="container-custom text-center relative z-10">
          <Handshake weight="duotone" className="w-16 h-16 text-purple-200 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Optimaliseer energie over je complete vastgoedportefeuille
          </h2>
          <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Centrale inkoop, transparante doorbelasting, ESG-rapportage en maximaal volume-voordeel. 
            Alles onder controle met één vaste accountmanager.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Lightning weight="duotone" className="w-6 h-6" />
                Bereken portfolio besparing
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 bg-purple-800 hover:bg-purple-900 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
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

