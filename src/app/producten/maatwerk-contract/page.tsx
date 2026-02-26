import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Diamond, Check, ArrowRight, Users, Handshake, ChartLine, Lightning, ShieldCheck, HeadsetIcon as Headset, Plant, Hospital, Desktop, Lightbulb, Storefront, Buildings, Factory } from '@phosphor-icons/react/dist/ssr'

export const metadata: Metadata = {
  title: 'Maatwerk energiecontract voor grootverbruik',
  description: 'Vraag een maatwerk energiecontract aan voor grootzakelijk verbruik met scherpe tarieven, persoonlijke inkoopstrategie en gespecialiseerde begeleiding.',
  alternates: {
    canonical: 'https://pakketadvies.nl/producten/maatwerk-contract',
  },
  openGraph: {
    title: 'Maatwerk energiecontract voor grootverbruik | PakketAdvies',
    description: 'Maatwerk contracten voor grootzakelijke energiebehoeften met persoonlijke begeleiding en tariefonderhandeling.',
    url: 'https://pakketadvies.nl/producten/maatwerk-contract',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maatwerk energiecontract voor grootverbruik | PakketAdvies',
    description: 'Maatwerk contracten voor grootzakelijke energiebehoeften met persoonlijke begeleiding en tariefonderhandeling.',
  },
}

export default function MaatwerkContractPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-purple-900 via-brand-navy-600 to-brand-navy-500 text-white py-12 md:py-16 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-main.jpg"
            alt="Custom energy solutions"
            fill
            className="object-cover opacity-10"
          />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-brand-purple-500/20 border border-brand-purple-400/30 rounded-full px-4 py-2 mb-6">
              <Diamond weight="duotone" className="w-5 h-5 text-brand-purple-300" />
              <span className="text-sm font-semibold text-brand-purple-200">Maatwerk Contract</span>
              <span className="bg-brand-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Premium</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Bundel je volumes, <span className="text-brand-teal-500">onderhandel de scherpste tarieven</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Voor grootverbruikers vanaf 60.000 kWh of 10.000 m³. Door volumes te bundelen met andere ondernemers 
              krijg je de onderhandelingskracht van een grote speler en tarieven die anders onbereikbaar zijn.
            </p>
            
            <div className="bg-brand-purple-500/20 border border-brand-purple-400/30 rounded-xl p-6 mb-8 max-w-2xl">
              <div className="flex items-center gap-3 mb-2">
                <Diamond weight="duotone" className="w-6 h-6 text-brand-purple-300" />
                <span className="font-semibold text-brand-purple-200">Geschikt voor:</span>
              </div>
              <p className="text-white text-lg">
                Bedrijven met een jaarverbruik van minimaal <span className="font-bold text-brand-teal-400">60.000 kWh</span> elektriciteit 
                of <span className="font-bold text-brand-teal-400">10.000 m³</span> gas
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <button className="px-8 py-4 bg-brand-teal-500 hover:bg-brand-teal-600 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
                  <Handshake weight="duotone" className="w-6 h-6" />
                  Vraag maatwerk offerte aan
                </button>
              </Link>
              <Link href="/calculator">
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold text-lg border border-white/20 transition-all flex items-center justify-center gap-2">
                  Check je verbruik
                  <ArrowRight weight="bold" className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Hoe werkt volume pooling?
            </h2>
            <p className="text-lg text-gray-600">
              Door volumes van meerdere bedrijven slim te bundelen, creëren we de onderhandelingskracht 
              van een grootverbruiker - met tarieven en voorwaarden die normaal onbereikbaar zijn.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              {[
                {
                  step: '1',
                  title: 'Volume analyse',
                  desc: 'We analyseren je energieverbruik, pieken, contracteinde en specifieke wensen.',
                  icon: ChartLine
                },
                {
                  step: '2',
                  title: 'Strategische bundeling',
                  desc: 'We bundelen jouw volume met vergelijkbare bedrijven voor maximale onderhandelingskracht.',
                  icon: Users
                },
                {
                  step: '3',
                  title: 'Onderhandeling met leveranciers',
                  desc: 'Onze specialisten onderhandelen met meerdere leveranciers. Jij profiteert van de beste deal zonder zelf te onderhandelen.',
                  icon: Handshake
                },
                {
                  step: '4',
                  title: 'Persoonlijke accountmanager',
                  desc: 'Je krijgt een vaste contactpersoon die je helpt met alle energiezaken, van contractbeheer tot facturering.',
                  icon: Headset
                }
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex gap-5 bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-brand-purple-300 hover:shadow-lg transition-all group">
                    <div className="w-14 h-14 bg-brand-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon weight="duotone" className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-brand-purple-600">STAP {item.step}</span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-gradient-to-br from-brand-purple-50 to-brand-purple-100 rounded-2xl p-8 md:p-12">
              <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                <div className="text-sm text-gray-600 mb-1">Gemiddelde extra besparing</div>
                <div className="text-4xl font-bold text-brand-purple-600 mb-1">15-25%</div>
                <div className="text-sm text-gray-600">bovenop normale contracten</div>
              </div>

              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">
                Case: Retailketen (12 vestigingen)
              </h3>
              <p className="text-gray-700 mb-6">
                Een retailketen met 12 vestigingen bundelde hun totale verbruik van 850.000 kWh. 
                Door onze volume pooling en onderhandelingskracht bespaarden ze €18.500 per jaar 
                ten opzichte van hun individuele contracten.
              </p>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Totaal verbruik</span>
                  <span className="font-semibold text-brand-navy-500">850.000 kWh/jaar</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aantal locaties</span>
                  <span className="font-semibold text-brand-navy-500">12 vestigingen</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Extra besparing</span>
                  <span className="font-semibold text-brand-purple-600">€18.500/jaar</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Contract type</span>
                  <span className="font-semibold text-brand-navy-500">3 jaar vast maatwerk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Wat krijg je met een maatwerk contract?
            </h2>
            <p className="text-lg text-gray-600">
              Meer dan alleen een goed tarief - je krijgt een totaalpakket voor optimaal energiebeheer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: ChartLine,
                title: 'Scherpste tarieven',
                description: 'Door volume bundeling onderhandelen we tarieven die 15-25% lager liggen dan standaard contracten. Je profiteert van grootverbruiker-condities.'
              },
              {
                icon: Headset,
                title: 'Persoonlijke accountmanager',
                description: 'Vaste contactpersoon die je helpt met contractbeheer, facturering, marktadvies en alle energievragen. Bereikbaar via directe lijn.'
              },
              {
                icon: Users,
                title: 'Portfolio management',
                description: 'Meerdere locaties of panden? Wij beheren je complete energieportefeuille centraal met uniforme voorwaarden en rapportage.'
              },
              {
                icon: Handshake,
                title: 'Op maat gemaakte voorwaarden',
                description: 'Flexibele betalingsvoorwaarden, aangepaste opzegtermijnen, en contractvoorwaarden die perfect bij jouw bedrijfsvoering passen.'
              },
              {
                icon: ShieldCheck,
                title: 'Risicobeheersing',
                description: 'Strategisch inkopen op het juiste moment. We monitoren de markt en adviseren over optimale inkoopstrategieën.'
              },
              {
                icon: Lightning,
                title: 'Keuze in contractvorm',
                description: 'Vast, dynamisch of een hybride vorm? Bij maatwerk bepaal je zelf de mix die het beste bij je past, zelfs per locatie verschillend.'
              }
            ].map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <div key={i} className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 bg-brand-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-purple-500 transition-colors">
                    <Icon weight="duotone" className="w-7 h-7 text-brand-purple-600 group-hover:text-white transition-colors" />
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
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Voor wie is maatwerk perfect?
            </h2>
            <p className="text-lg text-gray-600">
              Maatwerk contracten zijn ideaal voor grootverbruikers en bedrijven met specifieke energiebehoeften.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Retail & Winkelketens',
                desc: 'Meerdere vestigingen met uniforme energie-inkoop, centrale facturering en rapportage.',
                verbruik: 'Typisch: 200.000+ kWh totaal',
                icon: Storefront
              },
              {
                title: 'Vastgoedbeleggers',
                desc: 'Portfolio met meerdere panden. Energie-inkoop voor huurders met doorbelasting en ESG-rapportage.',
                verbruik: 'Typisch: 500.000+ kWh totaal',
                icon: Buildings
              },
              {
                title: 'Industrie & Productie',
                desc: 'Grootverbruikers met hoge pieken, specifieke aansluitcapaciteit en procesoptimalisatie.',
                verbruik: 'Vanaf: 500.000+ kWh/jaar',
                icon: Factory
              },
              {
                title: 'Glastuinbouw & Telers',
                desc: 'Extreem hoog verbruik door assimilatiebelichting, WKK-integratie en seizoensgebonden patronen.',
                verbruik: 'Vanaf: 1.000.000+ kWh/jaar',
                icon: Plant
              },
              {
                title: 'Zorg & Welzijn',
                desc: 'Zorginstellingen, ziekenhuizen of verpleeghuizen met 24/7 energiebehoefte en hoge betrouwbaarheidseisen.',
                verbruik: 'Vanaf: 300.000+ kWh/jaar',
                icon: Hospital
              },
              {
                title: 'Data Centers & IT',
                desc: 'Constante hoge belasting, kritische uptime en mogelijkheden voor direct line naar opwek.',
                verbruik: 'Vanaf: 1.000.000+ kWh/jaar',
                icon: Desktop
              }
            ].map((item, i) => {
              const Icon = item.icon
              return (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-200 hover:border-brand-purple-300 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-brand-purple-50 rounded-xl flex items-center justify-center">
                    <Icon weight="duotone" className="w-8 h-8 text-brand-purple-500" />
                  </div>
                  <div className="bg-brand-purple-100 text-brand-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                    Premium
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {item.desc}
                </p>
                <div className="bg-brand-purple-50 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                  <Lightbulb weight="duotone" className="w-4 h-4 text-brand-purple-600" />
                  <span className="font-semibold text-brand-purple-700">{item.verbruik}</span>
                </div>
              </div>
            )})}
          </div>

          <div className="mt-12 bg-gradient-to-br from-brand-purple-500 to-brand-purple-600 text-white rounded-2xl p-8 md:p-12 text-center">
            <Diamond weight="duotone" className="w-16 h-16 mx-auto mb-6" />
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Niet zeker of je voldoet aan de minimale afname?
            </h3>
            <p className="text-lg text-brand-purple-100 mb-6 max-w-2xl mx-auto">
              Gebruik onze calculator om je verbruik in te schatten, of neem direct contact op 
              voor een vrijblijvende analyse.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calculator">
                <button className="px-8 py-4 bg-white text-brand-purple-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                  <Lightning weight="duotone" className="w-6 h-6" />
                  Check je verbruik
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-4 bg-brand-purple-700 hover:bg-brand-purple-800 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
                  <Handshake weight="duotone" className="w-6 h-6" />
                  Plan gesprek
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Hoe verloopt het maatwerk traject?
            </h2>
            <p className="text-lg text-gray-600">
              Van eerste kennismaking tot getekend contract in 6 stappen.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                week: 'Week 1',
                title: 'Intake gesprek',
                desc: 'Kennismaking, analyse van je huidige situatie, verbruikspatronen en wensen.'
              },
              {
                week: 'Week 1-2',
                title: 'Data verzameling',
                desc: 'We analyseren je huidige contracten, facturen en verbruiksdata om een compleet beeld te krijgen.'
              },
              {
                week: 'Week 2-3',
                title: 'Volume pooling & onderhandeling',
                desc: 'We bundelen je volume met andere bedrijven en onderhandelen met meerdere leveranciers.'
              },
              {
                week: 'Week 3',
                title: 'Offerte presentatie',
                desc: 'Je ontvangt een gedetailleerde offerte met vergelijking, besparingsinschatting en contractvoorwaarden.'
              },
              {
                week: 'Week 4',
                title: 'Contractualisatie',
                desc: 'Na akkoord regelen we alle administratie, aanmeldingen en communicatie met leveranciers.'
              },
              {
                week: 'Vanaf start',
                title: 'Doorlopend beheer',
                desc: 'Je accountmanager helpt je met facturering, monitoring, optimalisatie en toekomstige contracten.'
              }
            ].map((step, i) => (
              <div key={i} className="flex gap-6 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-brand-purple-600">{step.week}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-purple-900 via-brand-navy-600 to-brand-navy-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-teal-500 to-transparent opacity-50" />
        
        <div className="container-custom text-center relative z-10">
          <Diamond weight="duotone" className="w-16 h-16 text-brand-teal-500 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Klaar voor een maatwerk energieoplossing?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Vraag een vrijblijvende analyse aan en ontdek hoeveel je kunt besparen door volume pooling 
            en professioneel onderhandelde contracten.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button className="px-8 py-4 bg-brand-teal-500 hover:bg-brand-teal-600 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Handshake weight="duotone" className="w-6 h-6" />
                Vraag maatwerk offerte aan
              </button>
            </Link>
            <Link href="/calculator">
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold text-lg border border-white/20 transition-all flex items-center justify-center gap-2">
                Check je verbruik eerst
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Check weight="bold" className="w-5 h-5 text-brand-teal-400" />
              <span>Minimaal 60.000 kWh of 10.000 m³</span>
            </div>
            <div className="flex items-center gap-2">
              <Check weight="bold" className="w-5 h-5 text-brand-teal-400" />
              <span>Persoonlijke accountmanager</span>
            </div>
            <div className="flex items-center gap-2">
              <Check weight="bold" className="w-5 h-5 text-brand-teal-400" />
              <span>15-25% extra besparing</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

