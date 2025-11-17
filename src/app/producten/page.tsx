import Link from 'next/link'
import Image from 'next/image'
import { Lock, Lightning, Diamond, Check, ArrowRight, TrendUp } from '@phosphor-icons/react/dist/ssr'

export default function ProductenPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-12 md:py-16 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-main.jpg"
            alt="Energy solutions"
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 to-brand-navy-600/90" />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Kies het energiecontract dat bij jou past
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              Of je nu zekerheid, flexibiliteit of maximale korting zoekt - wij hebben voor elk bedrijf de juiste oplossing.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          {/* Intro */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Drie manieren om energie af te nemen
            </h2>
            <p className="text-lg text-gray-600">
              Elk bedrijf is uniek. Daarom bieden we drie verschillende contractvormen aan, 
              elk met hun eigen voordelen.
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {/* Vast Contract */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
              <div className="bg-gradient-to-br from-brand-navy-50 to-brand-navy-100 p-8 text-center">
                <div className="w-16 h-16 bg-brand-navy-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Lock weight="duotone" className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-2">
                  Vast Contract
                </h3>
                <p className="text-sm text-gray-600">1 tot 5 jaar looptijd</p>
              </div>
              
              <div className="p-8">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-brand-navy-500 mb-1">Zekerheid</div>
                  <p className="text-gray-600">Weet precies wat je betaalt</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    'Vaste prijs gedurende looptijd',
                    'Geen prijsschommelingen',
                    'Perfect voor budgetplanning',
                    'Keuze uit 1, 2, 3 of 5 jaar',
                    'Bescherming tegen prijsstijgingen'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check weight="bold" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-brand-navy-50 rounded-xl p-4 mb-6">
                  <div className="text-sm font-semibold text-brand-navy-500 mb-1">Ideaal voor:</div>
                  <p className="text-sm text-gray-700">Kantoren, retail, vastgoed - bedrijven die budgetzekerheid willen</p>
                </div>

                <Link href="/producten/vast-contract" className="block">
                  <button className="w-full px-6 py-3 bg-brand-navy-500 hover:bg-brand-navy-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all">
                    Meer over vast
                    <ArrowRight weight="bold" className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Dynamisch Contract */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-brand-teal-500 overflow-hidden hover:shadow-2xl transition-all duration-300 group relative">
              <div className="absolute top-4 right-4 bg-brand-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Populair
              </div>
              
              <div className="bg-gradient-to-br from-brand-teal-50 to-brand-teal-100 p-8 text-center">
                <div className="w-16 h-16 bg-brand-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Lightning weight="duotone" className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-2">
                  Dynamisch Contract
                </h3>
                <p className="text-sm text-gray-600">Maandelijks opzegbaar</p>
              </div>
              
              <div className="p-8">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-brand-navy-500 mb-1">Flexibel</div>
                  <p className="text-gray-600">Volg de energiemarkt</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    'Profiteer van lage energieprijzen',
                    'Prijs volgt de markt per uur',
                    'Geen langdurige binding',
                    'Maandelijks opzegbaar',
                    'Ideaal bij dalend prijspeil'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check weight="bold" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-brand-teal-50 rounded-xl p-4 mb-6">
                  <div className="text-sm font-semibold text-brand-navy-500 mb-1">Ideaal voor:</div>
                  <p className="text-sm text-gray-700">MKB, horeca - bedrijven die flexibiliteit willen en marktbewust zijn</p>
                </div>

                <Link href="/producten/dynamisch-contract" className="block">
                  <button className="w-full px-6 py-3 bg-brand-teal-500 hover:bg-brand-teal-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all">
                    Meer over dynamisch
                    <ArrowRight weight="bold" className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Maatwerk Contract */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
              <div className="bg-gradient-to-br from-brand-purple-50 to-brand-purple-100 p-8 text-center">
                <div className="w-16 h-16 bg-brand-brand-brand-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Diamond weight="duotone" className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-2">
                  Maatwerk Contract
                </h3>
                <p className="text-sm text-gray-600">Voor grootverbruikers</p>
              </div>
              
              <div className="p-8">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-brand-navy-500 mb-1">Beste deal</div>
                  <p className="text-gray-600">Volume = voordeel</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    'Bundeling van volumes',
                    'Scherp onderhandelde tarieven',
                    'Persoonlijke accountmanager',
                    'Op maat gemaakte voorwaarden',
                    'Maximale kostenoptimalisatie'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check weight="bold" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-brand-purple-50 rounded-xl p-4 mb-6">
                  <div className="text-sm font-semibold text-brand-navy-500 mb-1">Ideaal voor:</div>
                  <p className="text-sm text-gray-700">Industrie, retail-ketens, vastgoedportefeuilles - vanaf 60.000 kWh of 10.000 m³</p>
                </div>

                <Link href="/producten/maatwerk-contract" className="block">
                  <button className="w-full px-6 py-3 bg-brand-brand-brand-purple-500 hover:bg-brand-brand-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all">
                    Meer over maatwerk
                    <ArrowRight weight="bold" className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left p-4 md:p-6 font-semibold text-brand-navy-500">Eigenschap</th>
                    <th className="text-center p-4 md:p-6 font-semibold text-brand-navy-500">Vast</th>
                    <th className="text-center p-4 md:p-6 font-semibold text-brand-navy-500">Dynamisch</th>
                    <th className="text-center p-4 md:p-6 font-semibold text-brand-navy-500">Maatwerk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { label: 'Prijszekerheid', vast: true, dynamisch: false, maatwerk: 'Afhankelijk' },
                    { label: 'Flexibiliteit', vast: false, dynamisch: true, maatwerk: true },
                    { label: 'Looptijd', vast: '1-5 jaar', dynamisch: 'Maandelijks', maatwerk: 'Op maat' },
                    { label: 'Minimaal verbruik', vast: 'Geen', dynamisch: 'Geen', maatwerk: '60k kWh / 10k m³' },
                    { label: 'Accountmanager', vast: false, dynamisch: false, maatwerk: true },
                    { label: 'Volume voordeel', vast: false, dynamisch: false, maatwerk: true },
                    { label: 'Geschikt voor', vast: 'Klein-MKB', dynamisch: 'Alle bedrijven', maatwerk: 'Grootverbruikers' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 md:p-6 font-medium text-gray-900">{row.label}</td>
                      <td className="p-4 md:p-6 text-center">
                        {typeof row.vast === 'boolean' ? (
                          row.vast ? (
                            <Check weight="bold" className="w-6 h-6 text-brand-teal-500 mx-auto" />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )
                        ) : (
                          <span className="text-gray-700">{row.vast}</span>
                        )}
                      </td>
                      <td className="p-4 md:p-6 text-center">
                        {typeof row.dynamisch === 'boolean' ? (
                          row.dynamisch ? (
                            <Check weight="bold" className="w-6 h-6 text-brand-teal-500 mx-auto" />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )
                        ) : (
                          <span className="text-gray-700">{row.dynamisch}</span>
                        )}
                      </td>
                      <td className="p-4 md:p-6 text-center">
                        {typeof row.maatwerk === 'boolean' ? (
                          row.maatwerk ? (
                            <Check weight="bold" className="w-6 h-6 text-brand-teal-500 mx-auto" />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )
                        ) : (
                          <span className="text-gray-700">{row.maatwerk}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-brand-navy-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-teal-500 to-transparent opacity-50" />
        
        <div className="container-custom text-center relative z-10">
          <TrendUp weight="duotone" className="w-16 h-16 text-brand-teal-500 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Niet zeker welk contract het beste past?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Gebruik onze calculator om direct te zien welke besparing mogelijk is, 
            of plan een gratis adviesgesprek met één van onze energiespecialisten.
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

