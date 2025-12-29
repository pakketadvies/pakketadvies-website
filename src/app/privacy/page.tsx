'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { WaveDivider } from '@/components/ui/WaveDivider'
import { ShieldCheck, Lock, Eye, FileText, Envelope } from '@phosphor-icons/react'
import Link from 'next/link'

export default function PrivacyPage() {
  const lastUpdated = '27 december 2024'

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-16 md:py-24 pb-20 md:pb-28 pt-32 md:pt-40 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal-500/20 border border-brand-teal-400/30 mb-6">
              <ShieldCheck weight="duotone" className="w-5 h-5 text-brand-teal-300" />
              <span className="text-sm font-semibold text-brand-teal-200">Privacy & Beveiliging</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Privacyverklaring
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-4 max-w-2xl">
              Bij PakketAdvies nemen we uw privacy serieus. Deze privacyverklaring legt uit hoe we omgaan met uw persoonsgegevens.
            </p>
            <p className="text-sm text-gray-400">
              Laatst bijgewerkt: {lastUpdated}
            </p>
          </div>
        </div>

        <WaveDivider variant="hero" />
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="prose prose-lg max-w-none">
            
            {/* Inleiding */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-brand-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText weight="duotone" className="w-6 h-6 text-brand-teal-600" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                      Wie zijn wij?
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      PakketAdvies is een energiebemiddelaar die bedrijven en particulieren helpt bij het vinden van het beste energiecontract. Wij zijn gevestigd in Groningen en geregistreerd bij de Kamer van Koophandel.
                    </p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Bedrijfsnaam:</strong> PakketAdvies</p>
                      <p><strong>Adres:</strong> Stavangerweg 13, 9723 JC Groningen</p>
                      <p><strong>E-mail:</strong> <Link href="mailto:info@pakketadvies.nl" className="text-brand-teal-600 hover:underline">info@pakketadvies.nl</Link></p>
                      <p><strong>Telefoon:</strong> <Link href="tel:+31850477065" className="text-brand-teal-600 hover:underline">085 047 7065</Link></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Welke gegevens verzamelen wij */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-brand-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Eye weight="duotone" className="w-6 h-6 text-brand-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                      Welke gegevens verzamelen wij?
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Wij verzamelen alleen de gegevens die nodig zijn om onze diensten te kunnen leveren:
                    </p>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span><strong>Contactgegevens:</strong> naam, e-mailadres, telefoonnummer, adres</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span><strong>Bedrijfsgegevens:</strong> bedrijfsnaam, KvK-nummer, sector (indien van toepassing)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span><strong>Energiegegevens:</strong> verbruik, aansluitwaarden, huidige leverancier, contractdetails</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span><strong>Technische gegevens:</strong> IP-adres, browsertype, apparaatinformatie (via cookies)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Waarom verzamelen wij deze gegevens */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-brand-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lock weight="duotone" className="w-6 h-6 text-brand-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                      Waarom verzamelen wij deze gegevens?
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Wij gebruiken uw gegevens voor de volgende doeleinden:
                    </p>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span>Het verlenen van energieadvies en het vergelijken van energiecontracten</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span>Het bemiddelen bij het afsluiten van energiecontracten</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span>Het onderhouden van contact met u over uw energiecontract</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span>Het verbeteren van onze dienstverlening en website</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span>Het voldoen aan wettelijke verplichtingen</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Met wie delen wij uw gegevens */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Met wie delen wij uw gegevens?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Wij delen uw gegevens alleen met derden wanneer dit noodzakelijk is voor het leveren van onze diensten:
                </p>
                <ul className="space-y-3 text-gray-700 mb-4">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Energieleveranciers:</strong> om contracten af te sluiten en offertes op te vragen</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Service providers:</strong> voor hosting, e-mailverzending en betalingsverwerking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Overheidsinstanties:</strong> wanneer dit wettelijk verplicht is</span>
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Wij verkopen uw gegevens <strong>nooit</strong> aan derden voor marketingdoeleinden.
                </p>
              </CardContent>
            </Card>

            {/* Bewaartermijn */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Hoe lang bewaren wij uw gegevens?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Wij bewaren uw gegevens niet langer dan noodzakelijk:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Contactgegevens:</strong> zolang u klant bij ons bent en daarna maximaal 7 jaar (wettelijke bewaarplicht)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Contractgegevens:</strong> minimaal 7 jaar na beëindiging van het contract</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Marketinggegevens:</strong> totdat u zich afmeldt voor onze nieuwsbrief</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Uw rechten */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Uw rechten
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  U heeft de volgende rechten met betrekking tot uw persoonsgegevens:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Inzagerecht:</strong> u kunt opvragen welke gegevens wij van u hebben</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Correctierecht:</strong> u kunt onjuiste gegevens laten corrigeren</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Verwijderingsrecht:</strong> u kunt vragen om verwijdering van uw gegevens (tenzij wij deze wettelijk moeten bewaren)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Bezwaarrecht:</strong> u kunt bezwaar maken tegen het gebruik van uw gegevens voor marketingdoeleinden</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Dataportabiliteit:</strong> u kunt uw gegevens in een gestructureerd formaat ontvangen</span>
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Om gebruik te maken van uw rechten, kunt u contact met ons opnemen via <Link href="mailto:info@pakketadvies.nl" className="text-brand-teal-600 hover:underline">info@pakketadvies.nl</Link>.
                </p>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Cookies
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Onze website gebruikt cookies om de gebruikerservaring te verbeteren. Voor meer informatie over cookies, zie onze <Link href="/cookies" className="text-brand-teal-600 hover:underline">cookieverklaring</Link>.
                </p>
              </CardContent>
            </Card>

            {/* Beveiliging */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-brand-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck weight="duotone" className="w-6 h-6 text-brand-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                      Beveiliging
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te beschermen tegen verlies, diefstal of misbruik. Dit omvat:
                    </p>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span>Versleutelde verbindingen (SSL/TLS)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span>Beveiligde servers en databases</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span>Toegangsbeperkingen voor medewerkers</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span>Regelmatige beveiligingsaudits</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wijzigingen */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Wijzigingen in deze privacyverklaring
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Wij kunnen deze privacyverklaring van tijd tot tijd aanpassen. Wijzigingen worden op deze pagina gepubliceerd met vermelding van de datum van de laatste wijziging. Wij raden u aan deze pagina regelmatig te raadplegen.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-gradient-to-br from-brand-teal-50 to-brand-teal-100/50 border-brand-teal-200">
              <CardContent className="pt-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Envelope weight="duotone" className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                      Vragen over privacy?
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Heeft u vragen over deze privacyverklaring of over hoe wij omgaan met uw gegevens? Neem dan contact met ons op:
                    </p>
                    <div className="space-y-2 text-gray-700">
                      <p>
                        <strong>E-mail:</strong> <Link href="mailto:info@pakketadvies.nl" className="text-brand-teal-600 hover:underline">info@pakketadvies.nl</Link>
                      </p>
                      <p>
                        <strong>Telefoon:</strong> <Link href="tel:+31850477065" className="text-brand-teal-600 hover:underline">085 047 7065</Link>
                      </p>
                      <p>
                        <strong>Adres:</strong> Stavangerweg 13, 9723 JC Groningen
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>
    </div>
  )
}

