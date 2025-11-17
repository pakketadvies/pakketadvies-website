import Link from 'next/link'
import Image from 'next/image'
import { Lock, Check, ArrowRight, Calendar, Shield, TrendDown, Lightning, ChartLine } from '@phosphor-icons/react/dist/ssr'

export default function VastContractPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-12 md:py-16 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/office-team.jpg"
            alt="Business certainty"
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 to-brand-navy-600/90" />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 mb-6">
              <Lock weight="duotone" className="w-5 h-5 text-blue-300" />
              <span className="text-sm font-semibold text-blue-200">Vast Contract</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Vaste energieprijs, <span className="text-brand-teal-500">volledige zekerheid</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Weet precies wat je betaalt voor energie. Geen verrassingen, geen prijsschommelingen. 
              Perfect voor bedrijven die budgetzekerheid en rust willen.
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
              Waarom kiezen voor een vast contract?
            </h2>
            <p className="text-lg text-gray-600">
              Een vast energiecontract biedt je de zekerheid van een vaste prijs gedurende de hele looptijd.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Lock,
                title: 'Vaste prijs garantie',
                description: 'Je energieprijs blijft hetzelfde, ongeacht marktschommelingen. Wat je afspreekt is wat je betaalt.'
              },
              {
                icon: Shield,
                title: 'Bescherming tegen prijsstijgingen',
                description: 'Wanneer de energieprijzen stijgen, profiteer jij van je vooraf vastgelegde lage tarief.'
              },
              {
                icon: Calendar,
                title: 'Kies je looptijd',
                description: 'Kies zelf of je 1, 2, 3 of 5 jaar zekerheid wilt. Hoe langer de looptijd, hoe scherper het tarief.'
              },
              {
                icon: ChartLine,
                title: 'Eenvoudige budgettering',
                description: 'Plan je energiekosten jaren vooruit. Perfect voor financiële planning en begroting.'
              },
              {
                icon: TrendDown,
                title: 'Geen verborgen kosten',
                description: 'Wat je ziet is wat je krijgt. Transparante prijsopbouw zonder verrassingen achteraf.'
              },
              {
                icon: Check,
                title: 'Altijd goed advies',
                description: 'We adviseren een vast contract alleen als dit in jouw voordeel is op basis van marktanalyse.'
              }
            ].map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <div key={i} className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                    <Icon weight="duotone" className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
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

      {/* For Who */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-6">
                Voor wie is een vast contract ideaal?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Een vast energiecontract past perfect bij bedrijven die waarde hechten aan voorspelbaarheid 
                en stabiliteit in hun energiekosten.
              </p>

              <ul className="space-y-4">
                {[
                  { title: 'Kantoren', desc: 'Voorspelbaar verbruik en stabiele bedrijfsvoering' },
                  { title: 'Winkels & retail', desc: 'Vaste openingstijden en constante energiebehoefte' },
                  { title: 'Vastgoedbeheer', desc: 'Meerdere panden met langetermijn planning' },
                  { title: 'Horeca', desc: 'Budgetzekerheid voor stabiele exploitatie' },
                  { title: 'MKB bedrijven', desc: 'Die rust en duidelijkheid willen in hun kosten' }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                    <Check weight="bold" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-brand-navy-500">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12">
              <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                <div className="text-sm text-gray-600 mb-1">Gemiddelde besparing</div>
                <div className="text-4xl font-bold text-brand-navy-500 mb-1">€3.200</div>
                <div className="text-sm text-gray-600">per jaar met een vast contract</div>
              </div>

              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">
                Voorbeeld: Kantoor Amsterdam
              </h3>
              <p className="text-gray-700 mb-6">
                Een middelgroot kantoor met 80 medewerkers stapte over naar een 3-jarig vast contract. 
                Door het juiste moment van afsluiten bespaarden ze €3.200 per jaar vergeleken met hun vorige leverancier.
              </p>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Verbruik</span>
                  <span className="font-semibold text-brand-navy-500">85.000 kWh/jaar</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Looptijd</span>
                  <span className="font-semibold text-brand-navy-500">3 jaar vast</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Contract type</span>
                  <span className="font-semibold text-brand-navy-500">Groene stroom</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Looptijd Options */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Kies je looptijd
            </h2>
            <p className="text-lg text-gray-600">
              Hoe langer je kiest, hoe scherper het tarief. Wij adviseren de looptijd die het beste bij jouw situatie past.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { jaar: 1, desc: 'Maximale flexibiliteit', popular: false },
              { jaar: 2, desc: 'Balans tussen flex en zekerheid', popular: false },
              { jaar: 3, desc: 'Meest gekozen optie', popular: true },
              { jaar: 5, desc: 'Scherpste tarieven', popular: false }
            ].map((option, i) => (
              <div 
                key={i} 
                className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all hover:shadow-xl ${
                  option.popular ? 'border-brand-teal-500' : 'border-gray-200'
                }`}
              >
                {option.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Populair
                  </div>
                )}
                <div className="text-center">
                  <div className="text-5xl font-bold text-brand-navy-500 mb-2">{option.jaar}</div>
                  <div className="text-sm font-semibold text-gray-600 mb-4">jaar</div>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-gray-100">
        <div className="container-custom max-w-4xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-12 text-center">
            Veelgestelde vragen
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'Wat gebeurt er als de energieprijzen dalen?',
                a: 'Bij een vast contract betaal je de afgesproken prijs, ongeacht marktbewegingen. Als prijzen dalen profiteer je hier niet van, maar bij stijgingen ben je beschermd. Wij adviseren daarom alleen een vast contract als we verwachten dat dit in jouw voordeel is.'
              },
              {
                q: 'Kan ik tussentijds opzeggen?',
                a: 'Een vast contract heeft een vaste looptijd en kan niet tussentijds opgezegd worden. Aan het einde van de looptijd kun je kiezen om over te stappen naar een ander contract of leverancier.'
              },
              {
                q: 'Wanneer is het beste moment om een vast contract af te sluiten?',
                a: 'Dit hangt af van de actuele marktprijzen. Onze energiespecialisten volgen de markt dagelijks en adviseren je over het optimale moment om een vast contract af te sluiten.'
              },
              {
                q: 'Kan ik ook groene energie met een vast contract?',
                a: 'Absoluut! Al onze vaste contracten zijn beschikbaar met groene stroom en/of groen gas uit 100% hernieuwbare bronnen.'
              },
              {
                q: 'Wat is het verschil met een dynamisch contract?',
                a: 'Bij een vast contract betaal je een vaste prijs per kWh voor de hele looptijd. Bij een dynamisch contract volgt de prijs de markt per uur en kun je profiteren van daluren, maar heb je minder zekerheid.'
              }
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
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
          <Lock weight="duotone" className="w-16 h-16 text-brand-teal-500 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Klaar voor zekerheid over je energiekosten?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Bereken direct hoeveel je kunt besparen met een vast contract, of vraag een vrijblijvende offerte aan.
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
                Vraag offerte aan
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

