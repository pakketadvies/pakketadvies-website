import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Verhuizen en energie | PakketAdvies',
  description:
    'Verhuizen? Regel je energiecontract op tijd. Wij helpen je het beste contract te vinden voor je nieuwe adres. Vergelijk energiecontracten en bespaar direct vanaf je verhuisdatum.',
  keywords: [
    'verhuizen energie',
    'energiecontract verhuizen',
    'energie overstappen verhuizen',
    'nieuwe woning energie',
    'verhuizen energie regelen',
  ],
  openGraph: {
    title: 'Verhuizen en energie | PakketAdvies',
    description:
      'Verhuizen? Regel je energiecontract op tijd. Wij helpen je het beste contract te vinden voor je nieuwe adres. Vergelijk energiecontracten en bespaar.',
    type: 'website',
    url: 'https://pakketadvies.nl/particulier/verhuizen',
    siteName: 'PakketAdvies',
    locale: 'nl_NL',
    images: [
      {
        url: 'https://pakketadvies.nl/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'PakketAdvies - Verhuizen en energie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verhuizen en energie | PakketAdvies',
    description: 'Verhuizen? Regel je energiecontract op tijd. Vergelijk energiecontracten en bespaar direct.',
    images: ['https://pakketadvies.nl/images/hero-main.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/particulier/verhuizen',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

export default function VerhuizenPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-14 md:pt-32">
      <div className="container-custom">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <p className="text-brand-teal-600 font-semibold">Verhuizen</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-navy-600">
            Energie regelen bij verhuizing
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
            Verhuizen is hét moment om opnieuw te vergelijken. Met een paar slimme stappen voorkom je dubbele kosten en kies je direct een
            passend contract voor je nieuwe adres.
          </p>
          <div className="mt-7 flex gap-3">
            <Link
              href="/particulier/energie-vergelijken"
              className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold"
            >
              Vergelijk bij verhuizing
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Checklist verhuizing</h2>
            <ol className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>
                <span className="font-semibold text-brand-navy-600">1.</span> Noteer meterstanden op overdrachtsdag
              </li>
              <li>
                <span className="font-semibold text-brand-navy-600">2.</span> Check je huidige contract (looptijd/voorwaarden)
              </li>
              <li>
                <span className="font-semibold text-brand-navy-600">3.</span> Vergelijk voor je nieuwe adres
              </li>
              <li>
                <span className="font-semibold text-brand-navy-600">4.</span> Zet de startdatum goed (voorkom dubbele kosten)
              </li>
            </ol>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Veelgemaakte fouten</h2>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>Te laat regelen waardoor je “noodcontract” krijgt.</li>
              <li>Startdatum niet laten aansluiten op sleuteloverdracht.</li>
              <li>Geen rekening houden met opzegkosten van huidig contract.</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Snelle start</h2>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              Begin met vergelijken en kies “verhuizen” in je hoofd. Dan focussen we op een logische startdatum en passende voorwaarden.
            </p>
            <div className="mt-4 space-y-2">
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/calculator">
                Start vergelijking →
              </Link>
              <Link className="block text-brand-teal-600 font-semibold hover:underline" href="/particulier/klantenservice">
                Hulp nodig? →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-600">Veelgestelde vragen (kort)</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-2xl p-5">
              <p className="font-semibold text-brand-navy-600">Kan ik mijn huidige contract meenemen?</p>
              <p className="mt-2 text-gray-600 text-sm">
                Soms wel, soms is opnieuw afsluiten slimmer. Vergelijk altijd even — vooral bij een nieuw adres.
              </p>
            </div>
            <div className="border border-gray-200 rounded-2xl p-5">
              <p className="font-semibold text-brand-navy-600">Wanneer moet ik dit regelen?</p>
              <p className="mt-2 text-gray-600 text-sm">
                Het liefst ruim vóór de sleuteloverdracht. Zo heb je rust en voorkom je dubbele kosten.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/particulier/energie-vergelijken"
              className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold"
            >
              Vergelijk nu
            </Link>
            <Link
              href="/particulier/faq"
              className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-brand-teal-50 hover:border-brand-teal-200 transition-all"
            >
              Bekijk alle FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


