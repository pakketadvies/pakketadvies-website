import type { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/Card'
import { WaveDivider } from '@/components/ui/WaveDivider'
import { FileText, Scale, CheckCircle, AlertCircle, Envelope } from '@phosphor-icons/react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Algemene voorwaarden | PakketAdvies',
  description: 'Lees de algemene voorwaarden van PakketAdvies voor het gebruik van onze diensten en website.',
  alternates: {
    canonical: 'https://pakketadvies.nl/algemene-voorwaarden',
  },
}

export default function AlgemeneVoorwaardenPage() {
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
              <Scale weight="duotone" className="w-5 h-5 text-brand-teal-300" />
              <span className="text-sm font-semibold text-brand-teal-200">Juridisch</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Algemene voorwaarden
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-4 max-w-2xl">
              De algemene voorwaarden voor het gebruik van de diensten van PakketAdvies.
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
            
            {/* Artikel 1: Definities */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Artikel 1: Definities
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>PakketAdvies:</strong> de energiebemiddelaar die deze algemene voorwaarden hanteert</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Klant:</strong> de natuurlijke of rechtspersoon die gebruik maakt van de diensten van PakketAdvies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Diensten:</strong> alle diensten die PakketAdvies levert, waaronder energieadvies, contractvergelijking en bemiddeling</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Overeenkomst:</strong> de overeenkomst tussen PakketAdvies en de klant voor het leveren van diensten</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Artikel 2: Toepasselijkheid */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Artikel 2: Toepasselijkheid
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Deze algemene voorwaarden zijn van toepassing op alle diensten die PakketAdvies levert. Door gebruik te maken van onze diensten, gaat u akkoord met deze voorwaarden.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Afwijkingen van deze voorwaarden zijn alleen geldig indien deze schriftelijk zijn overeengekomen.
                </p>
              </CardContent>
            </Card>

            {/* Artikel 3: Diensten */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Artikel 3: Diensten
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  PakketAdvies biedt de volgende diensten:
                </p>
                <ul className="space-y-3 text-gray-700 mb-4">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span>Gratis energieadvies en contractvergelijking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span>Bemiddeling bij het afsluiten van energiecontracten</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span>Ondersteuning bij overstappen naar een nieuwe energieleverancier</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span>Contractbeheer en monitoring van de energiemarkt</span>
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  PakketAdvies is een onafhankelijke bemiddelaar en werkt niet exclusief voor één energieleverancier.
                </p>
              </CardContent>
            </Card>

            {/* Artikel 4: Kosten */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-brand-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle weight="duotone" className="w-6 h-6 text-brand-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                      Artikel 4: Kosten
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      <strong>Ons advies is volledig gratis en vrijblijvend.</strong> U betaalt NOOIT aan PakketAdvies - ook niet als u een energiecontract afsluit.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      PakketAdvies ontvangt een vergoeding van de energieleverancier wanneer u een contract afsluit. Deze vergoeding heeft geen invloed op het tarief dat u betaalt. U krijgt altijd het scherpste tarief dat we kunnen onderhandelen.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Er zijn geen verborgen kosten of toeslagen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Artikel 5: Verplichtingen klant */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Artikel 5: Verplichtingen van de klant
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  De klant is verplicht om:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span>Accurate en volledige informatie te verstrekken over zijn energieverbruik en situatie</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span>PakketAdvies tijdig te informeren over wijzigingen die van invloed kunnen zijn op de dienstverlening</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span>De overeenkomst met de energieleverancier na te komen</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span>Eventuele benodigde documenten tijdig aan te leveren</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Artikel 6: Verplichtingen PakketAdvies */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Artikel 6: Verplichtingen van PakketAdvies
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  PakketAdvies verbindt zich ertoe om:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span>De diensten met zorgvuldigheid en professionaliteit te verlenen</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span>Objectief en onafhankelijk advies te geven</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span>De klant tijdig te informeren over relevante ontwikkelingen</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span>Vertrouwelijke informatie vertrouwelijk te behandelen</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Artikel 7: Aansprakelijkheid */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-brand-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle weight="duotone" className="w-6 h-6 text-brand-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                      Artikel 7: Aansprakelijkheid
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      PakketAdvies is niet aansprakelijk voor:
                    </p>
                    <ul className="space-y-3 text-gray-700 mb-4">
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span>Schade voortvloeiend uit handelingen of nalatigheden van energieleveranciers</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span>Wijzigingen in tarieven of voorwaarden door energieleveranciers</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span>Onjuiste of onvolledige informatie verstrekt door de klant</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal-600 font-bold mt-1">•</span>
                        <span>Indirecte schade, gevolgschade of gederfde winst</span>
                      </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed">
                      De aansprakelijkheid van PakketAdvies is beperkt tot het bedrag dat door de verzekering wordt uitgekeerd, of indien dit niet het geval is, tot het bedrag dat de klant in het desbetreffende kalenderjaar aan PakketAdvies heeft betaald voor de diensten.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Artikel 8: Intellectueel eigendom */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Artikel 8: Intellectueel eigendom
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Alle intellectuele eigendomsrechten op de diensten, materialen en informatie van PakketAdvies blijven eigendom van PakketAdvies. De klant verkrijgt geen rechten op deze materialen, behalve het recht om deze te gebruiken voor het beoogde doel.
                </p>
              </CardContent>
            </Card>

            {/* Artikel 9: Privacy */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Artikel 9: Privacy
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  PakketAdvies verwerkt persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG). Voor meer informatie, zie onze <Link href="/privacy" className="text-brand-teal-600 hover:underline">privacyverklaring</Link>.
                </p>
              </CardContent>
            </Card>

            {/* Artikel 10: Opzegging */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Artikel 10: Opzegging
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  De klant kan de overeenkomst te allen tijde opzeggen zonder opgaaf van reden. PakketAdvies kan de overeenkomst opzeggen met inachtneming van een opzegtermijn van 30 dagen.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Opzegging dient schriftelijk te geschieden via e-mail naar <Link href="mailto:info@pakketadvies.nl" className="text-brand-teal-600 hover:underline">info@pakketadvies.nl</Link>.
                </p>
              </CardContent>
            </Card>

            {/* Artikel 11: Geschillen */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Artikel 11: Geschillen en toepasselijk recht
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Op deze algemene voorwaarden is Nederlands recht van toepassing. Geschillen zullen in eerste aanleg worden voorgelegd aan de bevoegde rechter in het arrondissement waar PakketAdvies is gevestigd.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Voordat een geschil aan de rechter wordt voorgelegd, zullen partijen trachten het geschil in onderling overleg op te lossen.
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
                      Vragen over deze voorwaarden?
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Heeft u vragen over deze algemene voorwaarden? Neem dan contact met ons op:
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

