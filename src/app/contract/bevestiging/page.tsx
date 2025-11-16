import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function BevestigingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-3xl">
        <Card>
          <CardContent className="pt-12 pb-8 text-center">
            {/* Success icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-success-50 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-success-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Contract succesvol afgesloten!
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Gefeliciteerd! Uw nieuwe energiecontract is succesvol afgesloten. U ontvangt binnen 24
              uur een bevestiging per email met alle details.
            </p>

            {/* Contract details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500">Contractnummer:</span>
                <span className="font-semibold text-brand-navy-500">#PA-2025-001234</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500">Leverancier:</span>
                <span className="font-semibold text-brand-navy-500">Groene Stroom</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Maandbedrag:</span>
                <span className="font-semibold text-brand-navy-500">€137</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button variant="secondary">Download contract (PDF)</Button>
              <Button variant="ghost">Email opnieuw versturen</Button>
            </div>
          </CardContent>
        </Card>

        {/* Next steps */}
        <Card className="mt-8">
          <CardContent className="pt-8">
            <h2 className="text-2xl font-bold text-brand-navy-500 mb-6">Wat gebeurt er nu?</h2>

            <div className="space-y-6">
              <div className="flex gap-4">
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
                  <h3 className="font-semibold text-brand-navy-500 mb-1">Binnen 24 uur</h3>
                  <p className="text-gray-500">
                    U ontvangt een bevestigingsmail met alle contractgegevens en een PDF van het
                    contract.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
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
                  <h3 className="font-semibold text-brand-navy-500 mb-1">Binnen 2 werkdagen</h3>
                  <p className="text-gray-500">
                    De leverancier neemt contact met u op om eventuele laatste details door te
                    nemen.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-teal-50 flex items-center justify-center text-brand-teal-500 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy-500 mb-1">Binnen 3 weken</h3>
                  <p className="text-gray-500">
                    Uw nieuwe contract gaat in. Wij regelen de overstap van uw huidige leverancier.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="mt-8 text-center">
          <Button size="lg" asChild>
            <Link href="/">Terug naar home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

