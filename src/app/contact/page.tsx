import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Image from 'next/image'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-16 md:py-20 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/office-team.jpg"
            alt="Professional office team"
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 to-brand-navy-600/90" />
        </div>
        
        <div className="container-custom relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact</h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Heeft u vragen of wilt u vrijblijvend advies? Neem contact met ons op.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container-custom max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardContent className="pt-8">
                <h2 className="text-2xl font-bold text-brand-navy-500 mb-6">Stuur een bericht</h2>
                <form className="space-y-4">
                  <Input label="Naam" placeholder="Uw naam" />
                  <Input label="Email" type="email" placeholder="uw.email@bedrijf.nl" />
                  <Input label="Telefoon" type="tel" placeholder="06 12345678" />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-brand-navy-500">
                      Bericht
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Uw vraag of opmerking..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500/50 focus:outline-none focus:ring-3 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all duration-150 resize-none"
                    />
                  </div>
                  <Button className="w-full">Verstuur bericht</Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-teal-50 flex items-center justify-center text-brand-teal-500 flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-navy-500 mb-1">Telefoon</h3>
                      <p className="text-gray-500">088 - 123 45 67</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Ma-vr: 09:00 - 17:00
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-teal-50 flex items-center justify-center text-brand-teal-500 flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-navy-500 mb-1">Email</h3>
                      <p className="text-gray-500">info@pakketadvies.nl</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Reactie binnen 24 uur
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-teal-50 flex items-center justify-center text-brand-teal-500 flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-navy-500 mb-1">Bezoekadres</h3>
                      <p className="text-gray-500">
                        Energiestraat 123<br />
                        1234 AB Amsterdam
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Op afspraak
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

