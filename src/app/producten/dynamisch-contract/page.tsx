import Link from 'next/link'
import Image from 'next/image'
import { Lightning, Check, ArrowRight, TrendUp, Clock, ChartLine, Coins, Calendar } from '@phosphor-icons/react/dist/ssr'

export default function DynamischContractPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-12 md:py-16 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/features-dashboard.jpg"
            alt="Dynamic energy pricing"
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 to-brand-navy-600/90" />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-brand-teal-500/20 border border-brand-teal-400/30 rounded-full px-4 py-2 mb-6">
              <Lightning weight="duotone" className="w-5 h-5 text-brand-teal-300" />
              <span className="text-sm font-semibold text-brand-teal-200">Dynamisch Contract</span>
              <span className="bg-brand-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Populair</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Profiteer van lage energieprijzen, <span className="text-brand-teal-500">volledige flexibiliteit</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Met een dynamisch contract volg je de actuele energieprijzen. Profiteer van daluren en lage prijspieken. 
              Maandelijks opzegbaar, zonder langdurige binding.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/calculator">
                <button className="px-8 py-4 bg-brand-teal-500 hover:bg-brand-teal-600 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
                  <Lightning weight="duotone" className="w-6 h-6" />
                  Bereken je besparing
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold text-lg border border-white/20 transition-all flex items-center justify-center gap-2">
                  Vraag offerte aan
                  <ArrowRight weight="bold" className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Waarom kiezen voor een dynamisch contract?
            </h2>
            <p className="text-lg text-gray-600">
              Met een dynamisch contract profiteer je van de actuele marktprijzen en heb je volledige flexibiliteit.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: TrendUp,
                title: 'Profiteer van lage prijzen',
                description: 'Wanneer de energieprijzen dalen, betaal je automatisch minder. Je profiteert direct van gunstige marktomstandigheden.'
              },
              {
                icon: Clock,
                title: 'Bespaar met daluren',
                description: 'Energie is goedkoper in daluren (\'s nachts en weekenden). Slim gebruik = direct lagere kosten.'
              },
              {
                icon: Calendar,
                title: 'Maandelijks opzegbaar',
                description: 'Geen langdurige binding. Je kunt elke maand opzeggen of overstappen naar een ander contract.'
              },
              {
                icon: ChartLine,
                title: 'Volledige transparantie',
                description: 'Je ziet precies wat je betaalt per uur. Real-time inzicht in je energiekosten via ons platform.'
              },
              {
                icon: Coins,
                title: 'Geen exit kosten',
                description: 'Wil je switchen? Dat kan zonder extra kosten. Je betaalt alleen voor wat je verbruikt.'
              },
              {
                icon: Lightning,
                title: 'Ideaal voor flexibel verbruik',
                description: 'Perfect als je je verbruik kunt aanpassen aan gunstige uren of seizoensgebonden fluctuaties hebt.'
              }
            ].map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <div key={i} className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 bg-brand-teal-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-teal-500 transition-colors">
                    <Icon weight="duotone" className="w-7 h-7 text-brand-teal-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-teal-50 to-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-6">
                Hoe werkt een dynamisch contract?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Bij een dynamisch contract volgt je energieprijs de actuele groothandelsprijzen op de energiemarkt. 
                Deze prijzen veranderen elk uur op basis van vraag en aanbod.
              </p>

              <div className="space-y-6">
                {[
                  {
                    step: '1',
                    title: 'Prijs volgt de markt',
                    desc: 'Je betaalt de actuele marktprijs per uur, plus een transparante opslag voor levering en netbeheer.'
                  },
                  {
                    step: '2',
                    title: 'Automatische optimalisatie',
                    desc: 'Onze slimme meter registreert je verbruik per uur. Geen extra actie nodig van jouw kant.'
                  },
                  {
                    step: '3',
                    title: 'Maandelijkse afrekening',
                    desc: 'Je ontvangt een duidelijk overzicht van je verbruik en kosten per uur. Volledig transparant.'
                  },
                  {
                    step: '4',
                    title: 'Flexibel switchen',
                    desc: 'Vind je een vast contract toch beter? Schakel op elk moment over zonder extra kosten.'
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 bg-white rounded-xl p-5 shadow-lg border border-gray-200">
                    <div className="w-10 h-10 bg-brand-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-navy-500 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl border border-gray-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-6">
                Voorbeeld prijsverloop
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div>
                    <div className="text-sm text-gray-600">03:00 - 06:00 uur</div>
                    <div className="font-bold text-green-700">Daluur</div>
                  </div>
                  <div className="text-2xl font-bold text-green-700">€0,08</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div>
                    <div className="text-sm text-gray-600">09:00 - 12:00 uur</div>
                    <div className="font-bold text-blue-700">Normaal</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">€0,12</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <div>
                    <div className="text-sm text-gray-600">18:00 - 21:00 uur</div>
                    <div className="font-bold text-orange-700">Piekuur</div>
                  </div>
                  <div className="text-2xl font-bold text-orange-700">€0,18</div>
                </div>
              </div>

              <div className="bg-brand-teal-50 rounded-xl p-6 border-2 border-brand-teal-200">
                <div className="text-sm text-gray-600 mb-2">💡 Slim tip</div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Door energie-intensieve processen te plannen in daluren (zoals wasmachines, opladen van voertuigen, 
                  of productieprocessen) kun je tot 40% besparen op je energiekosten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Who */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Voor wie is een dynamisch contract ideaal?
            </h2>
            <p className="text-lg text-gray-600">
              Een dynamisch energiecontract past perfect bij bedrijven die flexibel zijn en willen profiteren van marktprijzen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'MKB met flexibel verbruik',
                desc: 'Bedrijven die hun verbruik kunnen aanpassen aan gunstige uren, zoals productiebedrijven die \'s nachts kunnen draaien.',
                icon: '🏭'
              },
              {
                title: 'Horeca',
                desc: 'Restaurants en hotels met wisselende openingstijden die kunnen profiteren van daluren voor koeling en bereiding.',
                icon: '🍽️'
              },
              {
                title: 'Innovatieve bedrijven',
                desc: 'Organisaties die actief willen meedenken over energiebesparing en duurzaamheid.',
                icon: '💡'
              },
              {
                title: 'Bedrijven met slimme meters',
                desc: 'Je hebt een slimme meter nodig om per uur te kunnen afrekenen. Wij helpen je hiermee als je deze nog niet hebt.',
                icon: '📊'
              },
              {
                title: 'Marktbewuste ondernemers',
                desc: 'Bedrijven die de energiemarkt volgen en strategisch willen inkopen op gunstige momenten.',
                icon: '📈'
              },
              {
                title: 'Bedrijven zonder binding-wens',
                desc: 'Ondernemers die geen langdurige contracten willen en volledige flexibiliteit waarderen.',
                icon: '🔓'
              }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-brand-teal-300 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-12 text-center">
            Dynamisch vs. Vast
          </h2>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left p-6 font-semibold text-brand-navy-500">Eigenschap</th>
                    <th className="text-center p-6 font-semibold text-brand-teal-600">Dynamisch</th>
                    <th className="text-center p-6 font-semibold text-blue-600">Vast</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { label: 'Prijszekerheid', dynamisch: '❌', vast: '✅' },
                    { label: 'Profiteer van lage prijzen', dynamisch: '✅', vast: '❌' },
                    { label: 'Opzegtermijn', dynamisch: 'Maandelijks', vast: 'Einde looptijd' },
                    { label: 'Transparantie', dynamisch: 'Volledig per uur', vast: 'Vaste prijs' },
                    { label: 'Flexibiliteit', dynamisch: 'Maximaal', vast: 'Beperkt' },
                    { label: 'Geschikt bij dalend prijspeil', dynamisch: '✅ Zeer', vast: '❌' },
                    { label: 'Geschikt bij stijgend prijspeil', dynamisch: '❌', vast: '✅ Zeer' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="p-6 font-medium text-gray-900">{row.label}</td>
                      <td className="p-6 text-center text-gray-700">{row.dynamisch}</td>
                      <td className="p-6 text-center text-gray-700">{row.vast}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-12 text-center">
            Veelgestelde vragen
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'Wat als de energieprijzen plotseling stijgen?',
                a: 'Bij een dynamisch contract betaal je inderdaad meer wanneer de prijzen stijgen. Echter, door slim gebruik te maken van daluren en onze real-time monitoring kun je pieken vermijden. Bovendien kun je altijd maandelijks switchen naar een vast contract als je denkt dat prijzen langdurig hoog blijven.'
              },
              {
                q: 'Heb ik een slimme meter nodig?',
                a: 'Ja, voor een dynamisch contract is een slimme meter verplicht. Deze meet je verbruik per uur, zodat we precies kunnen afrekenen op basis van de actuele prijzen. Heb je nog geen slimme meter? Wij regelen de installatie voor je.'
              },
              {
                q: 'Hoeveel kan ik gemiddeld besparen?',
                a: 'Dat verschilt per bedrijf en hangt af van je verbruikspatroon. Bedrijven die slim gebruik maken van daluren kunnen 20-40% besparen vergeleken met een gemiddeld vast contract. Wij berekenen vooraf een inschatting op basis van jouw situatie.'
              },
              {
                q: 'Kan ik overstappen naar een vast contract?',
                a: 'Ja, dat kan altijd. Je kunt maandelijks opzeggen en overstappen naar een vast contract als je denkt dat dat voordeliger wordt. Wij adviseren je graag over het juiste moment.'
              },
              {
                q: 'Krijg ik inzicht in mijn verbruik per uur?',
                a: 'Absoluut! Via ons online platform zie je real-time je verbruik en de bijbehorende kosten per uur. Je krijgt ook inzicht in gemiddelde prijzen per dag/week, zodat je patronen kunt herkennen en je verbruik kunt optimaliseren.'
              }
            ].map((faq, i) => (
              <details key={i} className="group bg-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-white transition-colors">
                  <span className="font-semibold text-brand-navy-500 pr-8">{faq.q}</span>
                  <ArrowRight weight="bold" className="w-5 h-5 text-brand-teal-500 transform group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-brand-navy-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-teal-500 to-transparent opacity-50" />
        
        <div className="container-custom text-center relative z-10">
          <Lightning weight="duotone" className="w-16 h-16 text-brand-teal-500 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Klaar om te profiteren van dynamische energieprijzen?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Bereken direct hoeveel je kunt besparen met een dynamisch contract, of vraag vrijblijvend advies aan.
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
                Vraag advies aan
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

