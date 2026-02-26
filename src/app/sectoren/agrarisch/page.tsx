import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Plant, Check, ArrowRight, Lightning, Sun, Fire, TrendUp, Handshake, Lightbulb, Wrench, CurrencyDollar, Leaf, Gear } from '@phosphor-icons/react/dist/ssr'

export const metadata: Metadata = {
  title: 'Zakelijke energie voor agrarisch',
  description: 'Energieadvies voor glastuinbouw en agrarische bedrijven met hoog verbruik, WKK-integratie en slimme contractstrategieën.',
  alternates: {
    canonical: 'https://pakketadvies.nl/sectoren/agrarisch',
  },
  openGraph: {
    title: 'Zakelijke energie voor agrarisch | PakketAdvies',
    description: 'Energieoplossingen voor agrarische bedrijven met focus op grootverbruik, verduurzaming en kostenbeheersing.',
    url: 'https://pakketadvies.nl/sectoren/agrarisch',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zakelijke energie voor agrarisch | PakketAdvies',
    description: 'Energieoplossingen voor agrarische bedrijven met focus op grootverbruik, verduurzaming en kostenbeheersing.',
  },
}

export default function AgrarischPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-teal-600 via-brand-teal-500 to-brand-teal-600 text-white py-12 md:py-16 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/solar-roof.jpg"
            alt="Agrarisch sector"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/20 border border-white/30 rounded-full px-4 py-2 mb-6">
              <Plant weight="duotone" className="w-5 h-5" />
              <span className="text-sm font-semibold">Agrarische Sector</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Energieoplossingen voor <span className="text-brand-teal-200">glastuinbouw en agrarische bedrijven</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-teal-100 mb-8">
              Specialist in extreem hoogverbruik. Van assimilatiebelichting tot WKK-integratie - 
              we begrijpen de unieke energiebehoeften van de tuinbouwsector.
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
              Energie-uitdagingen in de agrarische sector
            </h2>
            <p className="text-lg text-gray-600">
              Glastuinbouw heeft het hoogste energieverbruik per m² van alle sectoren.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sun,
                title: 'Assimilatiebelichting',
                desc: 'Enorme hoeveelheden elektriciteit voor groeilicht, vooral in wintermaanden.',
                solution: 'Speciale teelttarieven en WKK-compatibele contracten voor optimale kosten.'
              },
              {
                icon: Fire,
                title: 'WKK-integratie',
                desc: 'Warmte-kracht-koppeling voor verwarming én elektriciteit. Complexe salderingsregelingen.',
                solution: 'Expertise in WKK-contracten, saldering en terugleveringen naar het net.'
              },
              {
                icon: TrendUp,
                title: 'Seizoensgebonden verbruik',
                desc: 'Extreem hoog verbruik in winter (belichting), laag in zomer. Enorme fluctuaties.',
                solution: 'Flexibele contracten met seizoensgebonden tariefstructuren.'
              }
            ].map((challenge, i) => {
              const Icon = challenge.icon
              return (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <Icon weight="duotone" className="w-10 h-10 text-brand-teal-600 mb-4" />
                  <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                    {challenge.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{challenge.desc}</p>
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
              Zo helpen we glastuinbouw bedrijven
            </h2>
            <p className="text-lg text-gray-600">
              Expertise in de meest energie-intensieve sector van Nederland.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-6">
                Speciale glastuinbouw contracten
              </h3>
              <ul className="space-y-4">
                {[
                  {
                    title: 'WKK-vriendelijke contracten',
                    desc: 'Geoptimaliseerd voor bedrijven met warmte-kracht-koppeling en saldering'
                  },
                  {
                    title: 'Teruglever-regelingen',
                    desc: 'Optimale voorwaarden voor teruglevering van eigen opgewekte stroom'
                  },
                  {
                    title: 'Seizoens-tarieven',
                    desc: 'Tariefstructuur aangepast aan winterpiek en zomerdal verbruik'
                  },
                  {
                    title: 'SDE++ subsidie advies',
                    desc: 'Hulp bij aanvraag en optimalisatie van duurzaamheidssubsidies'
                  }
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <Check weight="bold" className="w-6 h-6 text-brand-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-brand-navy-500 mb-1">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-brand-teal-50 to-brand-teal-100 rounded-2xl p-8 border border-brand-teal-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">
                Case: Tomatenkwekerij 4 hectare
              </h3>
              <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600 mb-1">Besparing per jaar</div>
                  <div className="text-5xl font-bold text-brand-teal-600 mb-1">€42.000</div>
                  <div className="text-sm text-gray-600">door slim contractbeheer</div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Een tomatenkwekerij met 4 hectare kassen en WKK (2.800.000 kWh/jaar + 350.000 m³ gas) 
                stapte over naar een maatwerk contract met optimale WKK-integratie en salderingsvoorwaarden. 
                Besparing: €42.000 per jaar.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-brand-teal-200">
                  <span className="text-gray-600">Oppervlakte:</span>
                  <span className="font-semibold">4 hectare kassen</span>
                </div>
                <div className="flex justify-between py-2 border-b border-brand-teal-200">
                  <span className="text-gray-600">Verbruik:</span>
                  <span className="font-semibold">2.800.000 kWh + 350k m³</span>
                </div>
                <div className="flex justify-between py-2 border-b border-brand-teal-200">
                  <span className="text-gray-600">WKK:</span>
                  <span className="font-semibold">Ja, met saldering</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Contract:</span>
                  <span className="font-semibold text-brand-teal-600">Maatwerk 5 jaar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Extra Services */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-6 text-center">
              Specialistische services voor glastuinbouw
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
              {
                title: 'WKK-optimalisatie',
                desc: 'Maximale saldering en teruglevering regelen',
                icon: Gear
              },
              {
                title: 'Subsidie advies',
                desc: 'SDE++ en andere duurzaamheidsregelingen',
                icon: CurrencyDollar
              },
              {
                title: 'LED-verlichting',
                desc: 'Advies over overstap van SON-T naar LED',
                icon: Lightbulb
              },
              {
                title: 'CO₂-dosering',
                desc: 'Integratie met CO₂-installaties en optimalisatie',
                icon: Leaf
              }
            ].map((service, i) => {
              const Icon = service.icon
              return (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-brand-teal-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon weight="duotone" className="w-6 h-6 text-brand-teal-500" />
                </div>
                <div className="font-semibold text-brand-navy-500 mb-2">{service.title}</div>
                <div className="text-sm text-gray-600">{service.desc}</div>
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
            Typisch energieverbruik glastuinbouw
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { size: '1 hectare kassen', kwh: '600.000 - 1.000.000', gas: '80.000 - 120.000 m³' },
              { size: '2-5 hectare kassen', kwh: '1.200.000 - 5.000.000', gas: '150.000 - 600.000 m³' },
              { size: '5+ hectare kassen', kwh: '5.000.000+', gas: '600.000+ m³' }
            ].map((usage, i) => (
              <div key={i} className="bg-brand-teal-50 rounded-xl p-6 border border-brand-teal-200">
                <div className="font-semibold text-brand-navy-500 mb-3">{usage.size}</div>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-600">Elektriciteit:</div>
                    <div className="font-bold text-brand-teal-600">{usage.kwh} kWh</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Gas:</div>
                    <div className="font-bold text-brand-teal-600">{usage.gas}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-brand-teal-50 rounded-xl p-6 border-2 border-brand-teal-200">
            <div className="flex items-start gap-3">
              <Lightning weight="duotone" className="w-6 h-6 text-brand-teal-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-brand-navy-500 mb-2">Wist je dat?</div>
                <p className="text-sm text-gray-700 mb-3">
                  Glastuinbouw verbruikt gemiddeld <strong>1.000 kWh per m²</strong> per jaar - dat is 100x zoveel 
                  als een gemiddeld huishouden! Energie is vaak 15-30% van de totale productiekosten.
                </p>
                <p className="text-sm text-gray-700">
                  Door slim contractbeheer, WKK-optimalisatie en LED-belichting kun je tot 40% besparen op je 
                  energiekosten. Bij grote kwekerijen zijn besparingen van €50.000+ per jaar realistisch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crops We Serve */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-12 text-center">
            Gewassen & specialisaties
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { crop: 'Tomaten', typical: 'Hoog verbruik belichting + verwarming' },
              { crop: 'Paprika', typical: 'Continue klimaatbeheersing nodig' },
              { crop: 'Komkommer', typical: 'Hoge temperatuur + luchtvochtigheid' },
              { crop: 'Sierteelt (rozen/chrysanten)', typical: 'Intensieve belichting voor kwaliteit' },
              { crop: 'Potplanten', typical: 'Seizoensgebonden piek-verbruik' },
              { crop: 'Biologische teelt', typical: 'Vaak met duurzaamheidseisen' }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-brand-teal-400 hover:shadow-lg transition-all">
                <div className="font-semibold text-brand-navy-500 mb-2">{item.crop}</div>
                <div className="text-sm text-gray-600">{item.typical}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-teal-600 to-brand-teal-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
        
        <div className="container-custom text-center relative z-10">
          <Handshake weight="duotone" className="w-16 h-16 text-brand-teal-200 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Verlaag je energiekosten per kilo product
          </h2>
          <p className="text-lg md:text-xl text-brand-teal-100 mb-8 max-w-2xl mx-auto">
            Specialist in glastuinbouw energie. Van WKK-integratie tot LED-belichting - 
            we helpen je met maximale besparing op je grootste kostenpost.
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
                Plan gespecialiseerd advies
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

