import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CTA() {
  return (
    <section className="py-16 md:py-24 bg-brand-teal-500 text-white">
      <div className="container-custom text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Klaar om te besparen op uw energiekosten?
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Start vandaag nog met een gratis berekening en ontdek hoeveel u kunt besparen
        </p>
        <Button size="lg" variant="primary" asChild className="bg-white text-brand-teal-500 hover:bg-white/90">
          <Link href="/calculator">Start gratis berekening →</Link>
        </Button>
        <p className="mt-6 text-sm text-white/70">
          Vrijblijvend • Geen verplichtingen • Direct resultaat
        </p>
      </div>
    </section>
  )
}

