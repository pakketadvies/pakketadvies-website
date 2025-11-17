import Link from 'next/link'
import Image from 'next/image'
import { Factory, Check, ArrowRight, Lightning, TrendUp, Clock, Gauge, Handshake, Lightbulb, Wrench, Fire, SolarPanel, Phone } from '@phosphor-icons/react/dist/ssr'

export default function IndustriePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy-700 via-brand-navy-600 to-brand-navy-700 text-white py-12 md:py-16 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/features-dashboard.jpg"
            alt="Industrie sector"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/20 border border-white/30 rounded-full px-4 py-2 mb-6">
              <Factory weight="duotone" className="w-5 h-5" />
              <span className="text-sm font-semibold">Industrie & Productie</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Energieoplossingen voor <span className="text-gray-200">productie en maakindustrie</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Maatwerk contracten voor grootverbruikers. Piekverbruik-management, volume pooling en tarieven 
              die direct impact hebben op je productiekosten en marge.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/calculator">
                <button className="px-8 py-4 bg-white text-brand-navy-700 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
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
              Energie-uitdagingen in de industrie
            </h2>
            <p className="text-lg text-brand-navy-600">
              Productiebedrijven hebben unieke energiebehoeften met hoog verbruik en specifieke patronen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Gauge,
                title: 'Grootverbruik 24/7',
                desc: 'Hoge continue belasting met pieken tijdens productie. Energie is een significante kostenpost.',
                solution: 'Maatwerk contracten afgestemd op je productiepatronen met volume-voordeel.'
              },
              {
                icon: TrendUp,
                title: 'Productiepieken',
                desc: 'Wisselende belasting afhankelijk van orders, seizoenen en productiepieken.',
                solution: 'Flexibele tariefstructuren en piekverbruik-optimalisatie.'
              },
              {
                icon: Clock,
                title: 'Directe impact op marge',
                desc: 'Energiekosten zijn direct onderdeel van de kostprijs per product. Elke cent telt.',
                solution: 'Scherp onderhandelde tarieven door volume pooling - tot 25% besparing.'
              }
            ].map((challenge, i) => {
              const Icon = challenge.icon
              return (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <Icon weight="duotone" className="w-10 h-10 text-brand-navy-600 mb-4" />
                  <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                    {challenge.title}
                  </h3>
                  <p className="text-brand-navy-600 mb-4">{challenge.desc}</p>
                  <div className="bg-brand-teal-50 rounded-lg p-3 border border-brand-teal-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb weight="duotone" className="w-4 h-4 text-brand-teal-700" />
                      <div className="text-xs font-semibold text-brand-teal-800">Oplossing:</div>
                    </div>
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
              Zo helpen we productiebedrijven
            </h2>
            <p className="text-lg text-brand-navy-600">
              Vanaf 200.000 kWh komen maatwerk contracten in beeld met maximaal voordeel.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-6">
                Volume pooling voordelen
              </h3>
              <p className="text-brand-navy-600 mb-6">
                Door je volume te bundelen met andere industriële bedrijven krijg je toegang tot tarieven 
                die normaal alleen voor zeer grote afnemers beschikbaar zijn.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    benefit: '15-25% extra korting',
                    desc: 'Bovenop reguliere contracttarieven door gebundelde inkoop'
                  },
                  {
                    benefit: 'Persoonlijke accountmanager',
                    desc: 'Direct contact voor al je energievragen en optimalisatie'
                  },
                  {
                    benefit: 'Flexibele contractvoorwaarden',
                    desc: 'Aangepast aan jouw productieproces en seizoenspatronen'
                  },
                  {
                    benefit: 'Piekverbruik management',
                    desc: 'Advies over load shifting en piekspreiding voor extra besparing'
                  }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <Check weight="bold" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-brand-navy-500 mb-1">{item.benefit}</div>
                      <div className="text-sm text-brand-navy-600">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">
                Case: Drukkerij met 3-ploegendienst
              </h3>
              <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
                <div className="text-center mb-4">
                  <div className="text-sm text-brand-navy-600 mb-1">Besparing per jaar</div>
                  <div className="text-5xl font-bold text-brand-navy-700 mb-1">€18.300</div>
                  <div className="text-sm text-brand-navy-600">22% extra korting</div>
                </div>
              </div>
              <p className="text-brand-navy-700 mb-4">
                Een drukkerij met 24/7 productie (340.000 kWh/jaar) stapte over naar een maatwerk contract. 
                Door volume pooling en optimale timing van de inkoop bespaarden ze €18.300 per jaar.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span className="text-brand-navy-600">Type bedrijf:</span>
                  <span className="font-semibold">Drukkerij (3-ploegen)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span className="text-brand-navy-600">Verbruik:</span>
                  <span className="font-semibold">340.000 kWh/jaar</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span className="text-brand-navy-600">Contract:</span>
                  <span className="font-semibold">Maatwerk 3 jaar</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-brand-navy-600">Extra voordeel:</span>
                  <span className="font-semibold text-green-600">22% volume korting</span>
                </div>
              </div>
            </div>
          </div>

          {/* Extra Services */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-6 text-center">
              Extra services voor industrie
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Energie-audit',
                  desc: 'Gratis analyse van je productieproces en besparingsmogelijkheden',
                  icon: Lightbulb
                },
                {
                  title: 'Load shifting advies',
                  desc: 'Optimaliseer productie-uren voor lagere energiekosten',
                  icon: Lightning
                },
                {
                  title: 'WKK-integratie',
                  desc: 'Advies over warmte-kracht-koppeling bij geschiktheid',
                  icon: Fire
                },
                {
                  title: 'Zelfopwekking',
                  desc: 'Mogelijkheden voor zonnepanelen en saldering',
                  icon: SolarPanel
                }
              ].map((service, i) => {
                const Icon = service.icon
                return (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-brand-teal-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon weight="duotone" className="w-6 h-6 text-brand-teal-500" />
                  </div>
                  <div className="font-semibold text-brand-navy-500 mb-2">{service.title}</div>
                  <div className="text-sm text-brand-navy-600">{service.desc}</div>
                </div>
              )})}
            </div>
          </div>
        </div>
      </section>

      {/* Typical Usage */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-8 text-center">
            Typisch energieverbruik industrie
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { type: 'Klein productie', range: '100.000 - 300.000 kWh', contract: 'Vast of dynamisch' },
              { type: 'Middelgroot productie', range: '300.000 - 800.000 kWh', contract: 'Maatwerk aanbevolen' },
              { type: 'Groot productie', range: '800.000+ kWh', contract: 'Maatwerk verplicht' }
            ].map((usage, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="font-semibold text-brand-navy-500 mb-3">{usage.type}</div>
                <div className="mb-3">
                  <div className="text-xs text-brand-navy-600">Jaarverbruik:</div>
                  <div className="font-bold text-brand-navy-700 text-lg">{usage.range}</div>
                </div>
                <div>
                  <div className="text-xs text-brand-navy-600">Aanbevolen:</div>
                  <div className="text-sm font-semibold text-brand-teal-600">{usage.contract}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-brand-teal-50 rounded-xl p-6 border-2 border-brand-teal-200">
            <div className="flex items-start gap-3">
              <Lightning weight="duotone" className="w-6 h-6 text-brand-teal-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-brand-navy-500 mb-2">Wanneer maatwerk?</div>
                <p className="text-sm text-brand-navy-700 mb-3">
                  Vanaf <strong>60.000 kWh</strong> of <strong>10.000 m³</strong> gas kom je in aanmerking voor maatwerk. 
                  Maar het wordt echt interessant vanaf 200.000 kWh - dan zijn de besparingen significant.
                </p>
                <p className="text-sm text-brand-navy-700">
                  <strong>Voorbeeld:</strong> Bij 500.000 kWh bespaar je gemiddeld €12.000 - €15.000 per jaar extra door maatwerk 
                  vergeleken met een standaard contract.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-12 text-center">
            Industrieën die we bedienen
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Drukkerijen', typical: '200.000 - 500.000 kWh' },
              { name: 'Metaalbewerking', typical: '300.000 - 800.000 kWh' },
              { name: 'Kunststofverwerking', typical: '400.000 - 1.000.000 kWh' },
              { name: 'Voedingsmiddelen', typical: '200.000 - 600.000 kWh' },
              { name: 'Textiel & kleding', typical: '150.000 - 400.000 kWh' },
              { name: 'Machinebouw', typical: '250.000 - 700.000 kWh' }
            ].map((industry, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all">
                <div className="font-semibold text-brand-navy-500 mb-2">{industry.name}</div>
                <div className="text-sm text-brand-navy-600">Typisch: {industry.typical}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-navy-700 to-brand-navy-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-teal-500 to-transparent opacity-50" />
        
        <div className="container-custom text-center relative z-10">
          <Handshake weight="duotone" className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Verlaag je productiekosten met scherpe energietarieven
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Volume pooling, piekverbruik-management en persoonlijke begeleiding. 
            Ontdek hoeveel je kunt besparen op je energiekosten.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <button className="px-8 py-4 bg-brand-teal-500 hover:bg-brand-teal-600 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Lightning weight="duotone" className="w-6 h-6" />
                Bereken je besparing
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold text-lg border border-white/20 transition-all flex items-center justify-center gap-2">
                Vraag maatwerk aan
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

