import Link from 'next/link'
import Image from 'next/image'
import { Storefront, Check, ArrowRight, Lightning, Clock, TrendDown, Users, Handshake } from '@phosphor-icons/react/dist/ssr'

export default function HorecaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600 text-white py-12 md:py-16 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/testimonial-warehouse.jpg"
            alt="Horeca sector"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/20 border border-white/30 rounded-full px-4 py-2 mb-6">
              <Storefront weight="duotone" className="w-5 h-5" />
              <span className="text-sm font-semibold">Horeca Sector</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Energieoplossingen voor <span className="text-orange-200">restaurants, hotels en cafés</span>
            </h1>
            <p className="text-lg md:text-xl text-orange-100 mb-8">
              Flexibele energiecontracten die perfect aansluiten bij wisselende openingstijden, piekverbruik 
              en seizoensschommelingen in de horeca.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/calculator">
                <button className="px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
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
              Energie-uitdagingen in de horeca
            </h2>
            <p className="text-lg text-gray-600">
              De horeca heeft specifieke energiebehoeften met hoge pieken en wisselende patronen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: 'Wisselende openingstijden',
                desc: 'Lange dagen, weekenden en feestdagen betekenen energie op atypische momenten.',
                solution: 'Dynamische contracten die inspelen op daluren en flexibele tarieven.'
              },
              {
                icon: TrendDown,
                title: 'Hoge piekverbruiken',
                desc: 'Koeling, ovens, afzuiging en verlichting zorgen voor hoge energie-pieken.',
                solution: 'Tariefstructuren die rekening houden met piekmomenten.'
              },
              {
                icon: Users,
                title: 'Seizoensgebonden fluctuaties',
                desc: 'Zomer vs winter, feestdagen en vakantieperiodes zorgen voor wisselend verbruik.',
                solution: 'Flexibele contracten zonder langdurige binding.'
              }
            ].map((challenge, i) => {
              const Icon = challenge.icon
              return (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <Icon weight="duotone" className="w-10 h-10 text-orange-500 mb-4" />
                  <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                    {challenge.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{challenge.desc}</p>
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <div className="text-xs font-semibold text-orange-800 mb-1">💡 Oplossing:</div>
                    <div className="text-sm text-orange-700">{challenge.solution}</div>
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
              Zo helpen we horecabedrijven
            </h2>
            <p className="text-lg text-gray-600">
              Onze oplossingen zijn speciaal afgestemd op de unieke behoeften van de horecasector.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-6">
                Aanbevolen contracttypes
              </h3>
              <div className="space-y-4">
                {[
                  {
                    type: 'Dynamisch contract',
                    reason: 'Profiteer van lage prijzen tijdens daluren (\'s nachts bereiding, koeling)',
                    saving: 'Tot 30% besparing'
                  },
                  {
                    type: 'Vast contract (1-2 jaar)',
                    reason: 'Voor budgetzekerheid en stabiele exploitatie zonder verrassingen',
                    saving: 'Voorspelbare kosten'
                  }
                ].map((contract, i) => (
                  <div key={i} className="border-l-4 border-orange-500 bg-orange-50 rounded-r-lg p-4">
                    <div className="font-semibold text-brand-navy-500 mb-1">{contract.type}</div>
                    <div className="text-sm text-gray-600 mb-2">{contract.reason}</div>
                    <div className="text-xs font-bold text-orange-600">→ {contract.saving}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">
                Case: Restaurant Amsterdam
              </h3>
              <div className="bg-white rounded-xl p-6 shadow-lg mb-4">
                <div className="text-sm text-gray-600 mb-1">Gemiddelde besparing</div>
                <div className="text-4xl font-bold text-orange-600 mb-1">€4.200</div>
                <div className="text-sm text-gray-600">per jaar</div>
              </div>
              <p className="text-gray-700 mb-4">
                Een restaurant met 120 zitplaatsen stapte over naar een dynamisch contract. 
                Door slim gebruik te maken van daluren voor koeling en bereiding bespaarden ze €4.200 per jaar.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type bedrijf:</span>
                  <span className="font-semibold">Restaurant 120 zitplaatsen</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verbruik:</span>
                  <span className="font-semibold">75.000 kWh + 8.000 m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract:</span>
                  <span className="font-semibold">Dynamisch</span>
                </div>
              </div>
            </div>
          </div>

          {/* Extra benefits */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Snelle overstap',
                desc: 'Binnen 2 weken geregeld, geen onderbreking van je bedrijfsvoering'
              },
              {
                title: 'Geen verborgen kosten',
                desc: 'Transparante prijsopbouw, je weet precies wat je betaalt'
              },
              {
                title: 'Persoonlijk advies',
                desc: 'We kennen de horeca en adviseren op basis van jouw specifieke situatie'
              }
            ].map((benefit, i) => (
              <div key={i} className="flex gap-3">
                <Check weight="bold" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-brand-navy-500 mb-1">{benefit.title}</div>
                  <div className="text-sm text-gray-600">{benefit.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typical Usage */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-8 text-center">
            Typisch energieverbruik horeca
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { type: 'Klein café/lunchroom', range: '15.000 - 30.000 kWh', gas: '2.000 - 5.000 m³' },
              { type: 'Restaurant', range: '40.000 - 100.000 kWh', gas: '5.000 - 15.000 m³' },
              { type: 'Hotel', range: '80.000 - 200.000+ kWh', gas: '10.000 - 30.000+ m³' }
            ].map((usage, i) => (
              <div key={i} className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <div className="font-semibold text-brand-navy-500 mb-3">{usage.type}</div>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-600">Elektriciteit:</div>
                    <div className="font-bold text-orange-600">{usage.range}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Gas:</div>
                    <div className="font-bold text-orange-600">{usage.gas}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-600 to-orange-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
        
        <div className="container-custom text-center relative z-10">
          <Handshake weight="duotone" className="w-16 h-16 text-orange-200 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Klaar voor lagere energiekosten in jouw horecabedrijf?
          </h2>
          <p className="text-lg md:text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Ontdek hoeveel je kunt besparen met een energiecontract dat perfect past bij jouw restaurant, hotel of café.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <button className="px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Lightning weight="duotone" className="w-6 h-6" />
                Bereken je besparing
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 bg-orange-800 hover:bg-orange-900 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
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

