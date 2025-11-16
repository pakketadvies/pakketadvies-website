import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function OverOnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Over PakketAdvies</h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Dé specialist in energiebemiddeling voor MKB en grootzakelijke klanten
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container-custom max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="text-3xl font-bold text-brand-navy-500 mb-4">Wie zijn wij?</h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  PakketAdvies is hét onafhankelijke energieadviesbureau voor zakelijke klanten. Met meer dan 10 jaar ervaring in de energiemarkt helpen wij MKB'ers en grootzakelijke bedrijven bij het vinden van de beste energiecontracten.
                </p>
                <p className="text-gray-500 leading-relaxed">
                  Wij geloven dat energie inkopen simpel en transparant moet zijn. Daarom nemen wij u volledig uit handen: van het vergelijken van aanbiedingen tot en met de overstap naar uw nieuwe leverancier. En ook daarna blijven we u begeleiden.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="pt-8">
                <h2 className="text-3xl font-bold text-brand-navy-500 mb-4">Onze missie</h2>
                <p className="text-gray-500 leading-relaxed">
                  Wij willen dat elk bedrijf in Nederland het beste energiecontract heeft. Een contract dat past bij hun verbruik, hun duurzaamheidsdoelen en hun budget. Door onafhankelijk advies, persoonlijke service en jarenlange expertise maken we dat mogelijk.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-8 text-center">
                  <div className="text-4xl font-bold text-brand-teal-500 mb-2">500+</div>
                  <p className="text-gray-500">Tevreden klanten</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-8 text-center">
                  <div className="text-4xl font-bold text-brand-teal-500 mb-2">10+</div>
                  <p className="text-gray-500">Jaar ervaring</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-8 text-center">
                  <div className="text-4xl font-bold text-brand-teal-500 mb-2">€2M+</div>
                  <p className="text-gray-500">Totaal bespaard</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-8">
                <h2 className="text-3xl font-bold text-brand-navy-500 mb-4">Waarom PakketAdvies?</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <div>
                      <strong className="text-brand-navy-500">100% onafhankelijk</strong>
                      <p className="text-gray-500">Wij werken niet voor leveranciers, maar voor u</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <div>
                      <strong className="text-brand-navy-500">Persoonlijk contact</strong>
                      <p className="text-gray-500">U heeft één vast aanspreekpunt die u kent en begrijpt</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <div>
                      <strong className="text-brand-navy-500">Altijd actueel</strong>
                      <p className="text-gray-500">We blijven u proactief adviseren over nieuwe kansen</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-teal-500 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Maak kennis met PakketAdvies
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Ontdek wat we voor uw bedrijf kunnen betekenen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <Button size="lg" variant="primary" className="bg-white text-brand-teal-500 hover:bg-white/90">Start gratis berekening</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="border-white text-white hover:bg-white/10">Neem contact op</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

