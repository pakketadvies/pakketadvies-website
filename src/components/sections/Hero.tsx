import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="relative min-h-[70vh] flex items-center bg-gradient-to-br from-brand-teal-500 to-brand-navy-500 text-white">
      <div className="container-custom py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Het beste energiecontract voor uw bedrijf
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              We regelen het beste energiecontract voor uw bedrijf. Simpel, transparant en altijd met uw voordeel voorop.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="primary" asChild className="bg-white text-brand-teal-500 hover:bg-white/90">
                <Link href="/calculator">Bereken uw besparing →</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild className="border-white text-white hover:bg-white/10">
                <Link href="/over-ons">Meer over ons</Link>
              </Button>
            </div>
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Gratis advies</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Zorgeloos overstappen</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>500+ tevreden klanten</span>
              </div>
            </div>
          </div>

          {/* Image placeholder */}
          <div className="hidden lg:block">
            <div className="aspect-square rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-48 h-48 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

