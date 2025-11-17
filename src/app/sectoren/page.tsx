import Link from 'next/link'
import Image from 'next/image'
import { Storefront, Buildings, Factory, Plant, Hospital, Briefcase, ArrowRight, Lightning, Check } from '@phosphor-icons/react/dist/ssr'

export default function SectorenPage() {
  const sectors = [
    {
      id: 'horeca',
      icon: Storefront,
      title: 'Horeca',
      description: 'Restaurants, hotels, cafés en catering',
      challenges: ['Hoge piekverbruik koeling', 'Wisselende openingstijden', 'Seizoensschommelingen'],
      solutions: ['Dynamische contracten', 'Flexibele tarieven', 'Daluren-optimalisatie'],
      color: 'from-orange-500 to-orange-600',
      typicalUsage: '30.000 - 150.000 kWh/jaar',
      href: '/sectoren/horeca'
    },
    {
      id: 'retail',
      icon: Storefront,
      title: 'Retail',
      description: 'Winkels, supermarkten en winkelketens',
      challenges: ['Meerdere vestigingen', 'Uniforme inkoop', 'Kosten per m²'],
      solutions: ['Portfolio management', 'Centrale facturering', 'Volume voordeel'],
      color: 'from-blue-500 to-blue-600',
      typicalUsage: '20.000 - 200.000 kWh/jaar',
      href: '/sectoren/retail'
    },
    {
      id: 'vastgoed',
      icon: Buildings,
      title: 'Vastgoed',
      description: 'Beleggers, verhuurders en beheerders',
      challenges: ['Meerdere panden', 'ESG-rapportage', 'Doorberekening huurders'],
      solutions: ['Maatwerk contracten', 'Centrale inkoop', 'Duurzaamheidslabels'],
      color: 'from-purple-500 to-purple-600',
      typicalUsage: '100.000+ kWh/jaar per portfolio',
      href: '/sectoren/vastgoed'
    },
    {
      id: 'industrie',
      icon: Factory,
      title: 'Industrie',
      description: 'Productie, maakindustrie en drukkerijen',
      challenges: ['Hoog verbruik 24/7', 'Productiepieken', 'Grote aansluitingen'],
      solutions: ['Volume pooling', 'Piekverbruik beheer', 'Maatwerk tarieven'],
      color: 'from-gray-600 to-gray-700',
      typicalUsage: '200.000+ kWh/jaar',
      href: '/sectoren/industrie'
    },
    {
      id: 'agrarisch',
      icon: Plant,
      title: 'Agrarisch',
      description: 'Glastuinbouw, telers en agrarische bedrijven',
      challenges: ['Extreem hoog verbruik', 'Assimilatiebelichting', 'WKK-integratie'],
      solutions: ['Speciale teelttarieven', 'WKK-contracten', 'Subsidie advies'],
      color: 'from-green-500 to-green-600',
      typicalUsage: '500.000+ kWh/jaar',
      href: '/sectoren/agrarisch'
    },
    {
      id: 'kantoren',
      icon: Briefcase,
      title: 'Kantoren',
      description: 'Kantoorpanden en zakelijke dienstverlening',
      challenges: ['Voorspelbaar verbruik', 'ESG-doelen', 'Budgetzekerheid'],
      solutions: ['Vaste contracten', 'Groene energie', 'Transparante prijzen'],
      color: 'from-brand-teal-500 to-brand-teal-600',
      typicalUsage: '40.000 - 120.000 kWh/jaar',
      href: '/sectoren/kantoren'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-12 md:py-16 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-main.jpg"
            alt="Business sectors"
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 to-brand-navy-600/90" />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Energieoplossingen voor elke sector
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              Wij begrijpen de unieke energie-uitdagingen van jouw branche en bieden oplossingen die perfect aansluiten bij jouw bedrijfsvoering.
            </p>
          </div>
        </div>
      </section>

      {/* Sectors Grid */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {sectors.map((sector) => {
              const Icon = sector.icon
              return (
                <Link
                  key={sector.id}
                  href={sector.href}
                  className="group block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  {/* Color bar */}
                  <div className={`h-4 bg-gradient-to-r ${sector.color}`} />
                  
                  <div className="p-6 md:p-8">
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${sector.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon weight="duotone" className="w-8 h-8 text-white" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-2">
                      {sector.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{sector.description}</p>

                    {/* Typical Usage */}
                    <div className="bg-gray-50 rounded-lg px-3 py-2 mb-4 text-sm">
                      <span className="text-gray-600">Typisch verbruik: </span>
                      <span className="font-semibold text-brand-navy-500">{sector.typicalUsage}</span>
                    </div>

                    {/* Challenges */}
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Uitdagingen:</div>
                      <ul className="space-y-1">
                        {sector.challenges.slice(0, 2).map((challenge, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Solutions */}
                    <div className="mb-6">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Onze oplossingen:</div>
                      <ul className="space-y-1">
                        {sector.solutions.slice(0, 2).map((solution, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <Check weight="bold" className="w-4 h-4 text-brand-teal-500 flex-shrink-0" />
                            <span>{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-brand-teal-600 font-semibold group-hover:gap-3 transition-all">
                      <span>Lees meer</span>
                      <ArrowRight weight="bold" className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us for Your Sector */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Waarom sector-specifieke expertise belangrijk is
            </h2>
            <p className="text-lg text-gray-600">
              Elke sector heeft unieke energiebehoeften. Wij kennen de specifieke uitdagingen en kansen van jouw branche.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Branche-kennis',
                desc: 'We begrijpen de specifieke energiepatronen, pieken en uitdagingen van jouw sector.',
                icon: '🎯'
              },
              {
                title: 'Maatwerk contracten',
                desc: 'Contracten die perfect aansluiten bij je bedrijfsvoering, openingstijden en seizoenspatronen.',
                icon: '⚙️'
              },
              {
                title: 'Sector-netwerk',
                desc: 'Door bundeling met andere bedrijven uit jouw sector krijg je volume-voordeel.',
                icon: '🤝'
              }
            ].map((benefit, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-brand-navy-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-teal-500 to-transparent opacity-50" />
        
        <div className="container-custom text-center relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Staat jouw sector er niet tussen?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Geen probleem! We helpen bedrijven uit alle branches met hun energiecontracten. 
            Plan een gratis adviesgesprek en ontdek wat we voor jou kunnen betekenen.
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
                Plan gratis gesprek
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

