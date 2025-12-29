import type { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/Card'
import { WaveDivider } from '@/components/ui/WaveDivider'
import { Cookie, ChartBar, ShieldCheck, Gear, Envelope } from '@phosphor-icons/react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookieverklaring | PakketAdvies',
  description: 'Lees onze cookieverklaring om te zien welke cookies PakketAdvies gebruikt en waarvoor.',
  alternates: {
    canonical: 'https://pakketadvies.nl/cookies',
  },
}

export default function CookiesPage() {
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
              <Cookie weight="duotone" className="w-5 h-5 text-brand-teal-300" />
              <span className="text-sm font-semibold text-brand-teal-200">Cookies & Tracking</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Cookieverklaring
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-4 max-w-2xl">
              Deze pagina legt uit welke cookies wij gebruiken en waarom. U kunt uw cookievoorkeuren op elk moment aanpassen.
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
            
            {/* Wat zijn cookies */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-brand-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Cookie weight="duotone" className="w-6 h-6 text-brand-teal-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                      Wat zijn cookies?
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Cookies zijn kleine tekstbestanden die op uw computer, tablet of smartphone worden opgeslagen wanneer u een website bezoekt. Cookies maken het mogelijk om informatie over uw bezoek aan onze website op te slaan, zodat we uw gebruikerservaring kunnen verbeteren.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Cookies kunnen geen persoonlijke informatie zoals uw naam of e-mailadres lezen. Ze kunnen wel informatie bevatten over uw browsegedrag en voorkeuren.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Welke cookies gebruiken wij */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Welke cookies gebruiken wij?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Wij gebruiken de volgende soorten cookies:
                </p>

                {/* Functionele cookies */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Gear weight="duotone" className="w-5 h-5 text-brand-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                        Functionele cookies (noodzakelijk)
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        Deze cookies zijn noodzakelijk voor het functioneren van de website. Zonder deze cookies kunnen bepaalde functies niet werken.
                      </p>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-brand-teal-600 font-bold mt-1">•</span>
                          <span><strong>Sessiebeheer:</strong> om uw sessie bij te houden tijdens uw bezoek</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-brand-teal-600 font-bold mt-1">•</span>
                          <span><strong>Voorkeuren:</strong> om uw voorkeuren (zoals taal) op te slaan</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-brand-teal-600 font-bold mt-1">•</span>
                          <span><strong>Beveiliging:</strong> om de beveiliging van de website te waarborgen</span>
                        </li>
                      </ul>
                      <p className="text-sm text-gray-600 mt-3">
                        <strong>Bewaartermijn:</strong> Deze cookies worden automatisch verwijderd wanneer u de browser sluit (sessiecookies) of na een bepaalde periode (persistente cookies).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analytische cookies */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ChartBar weight="duotone" className="w-5 h-5 text-brand-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                        Analytische cookies
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        Deze cookies helpen ons te begrijpen hoe bezoekers onze website gebruiken, zodat we de website kunnen verbeteren.
                      </p>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-brand-teal-600 font-bold mt-1">•</span>
                          <span><strong>Google Analytics:</strong> om bezoekersstatistieken bij te houden (anoniem)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-brand-teal-600 font-bold mt-1">•</span>
                          <span><strong>Paginaweergaven:</strong> om te zien welke pagina's populair zijn</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-brand-teal-600 font-bold mt-1">•</span>
                          <span><strong>Gebruikersgedrag:</strong> om te begrijpen hoe gebruikers door de website navigeren</span>
                        </li>
                      </ul>
                      <p className="text-sm text-gray-600 mt-3">
                        <strong>Bewaartermijn:</strong> Maximaal 2 jaar. U kunt deze cookies uitschakelen zonder dat dit de functionaliteit van de website beïnvloedt.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Marketing cookies */}
                <div className="mb-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShieldCheck weight="duotone" className="w-5 h-5 text-brand-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                        Marketing cookies (optioneel)
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        Deze cookies worden gebruikt om relevante advertenties te tonen en om de effectiviteit van marketingcampagnes te meten.
                      </p>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        <strong>Op dit moment gebruiken wij geen marketing cookies.</strong> Mocht dit in de toekomst veranderen, dan zullen we u hierover informeren en om uw toestemming vragen.
                      </p>
                      <p className="text-sm text-gray-600 mt-3">
                        <strong>Bewaartermijn:</strong> Variabel, afhankelijk van de cookie. U kunt deze cookies altijd uitschakelen.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookies van derden */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Cookies van derden
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Sommige cookies worden geplaatst door derde partijen. Deze partijen hebben hun eigen privacy- en cookiebeleid:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Google Analytics:</strong> voor website-analyse. Lees het <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-teal-600 hover:underline">privacybeleid van Google</a>.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-brand-teal-600 font-bold mt-1">•</span>
                    <span><strong>Vercel:</strong> voor hosting en performance-analyse. Lees het <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-brand-teal-600 hover:underline">privacybeleid van Vercel</a>.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Cookievoorkeuren beheren */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Uw cookievoorkeuren beheren
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  U heeft de mogelijkheid om cookies te beheren via uw browserinstellingen. U kunt cookies blokkeren, verwijderen of waarschuwingen instellen wanneer cookies worden geplaatst.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>Let op:</strong> Als u cookies uitschakelt, kan dit de functionaliteit van onze website beïnvloeden. Sommige functies werken mogelijk niet meer correct.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-brand-navy-500 mb-2">Hoe cookies beheren in uw browser:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-brand-teal-600 font-bold mt-1">•</span>
                      <span><strong>Chrome:</strong> Instellingen → Privacy en beveiliging → Cookies en andere sitegegevens</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-teal-600 font-bold mt-1">•</span>
                      <span><strong>Firefox:</strong> Opties → Privacy & Beveiliging → Cookies en sitegegevens</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-teal-600 font-bold mt-1">•</span>
                      <span><strong>Safari:</strong> Voorkeuren → Privacy → Cookies en websitegegevens</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-brand-teal-600 font-bold mt-1">•</span>
                      <span><strong>Edge:</strong> Instellingen → Cookies en site-machtigingen</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Wijzigingen */}
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Wijzigingen in deze cookieverklaring
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Wij kunnen deze cookieverklaring van tijd tot tijd aanpassen. Wijzigingen worden op deze pagina gepubliceerd met vermelding van de datum van de laatste wijziging. Wij raden u aan deze pagina regelmatig te raadplegen.
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
                      Vragen over cookies?
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Heeft u vragen over ons gebruik van cookies? Neem dan contact met ons op:
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
                    <p className="text-sm text-gray-600 mt-4">
                      Voor meer informatie over privacy, zie onze <Link href="/privacy" className="text-brand-teal-600 hover:underline">privacyverklaring</Link>.
                    </p>
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

