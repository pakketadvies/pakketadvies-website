import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Kennisbank | PakketAdvies - Artikelen over energie voor thuis',
  description:
    'Lees artikelen over energie voor thuis: vast vs variabel vs dynamisch, zonnepanelen, energie besparen, verhuizen en meer. De kennisbank van PakketAdvies met actuele informatie en tips.',
  keywords: [
    'energie artikelen particulier',
    'energiekennisbank thuis',
    'energie informatie particulier',
    'energiecontracten uitleg',
    'energiebesparing tips thuis',
  ],
  openGraph: {
    title: 'Kennisbank | PakketAdvies - Artikelen over energie voor thuis',
    description:
      'Lees artikelen over energie voor thuis: vast vs variabel vs dynamisch, zonnepanelen, energie besparen en meer.',
    type: 'website',
    url: 'https://pakketadvies.nl/particulier/kennisbank',
    siteName: 'PakketAdvies',
    locale: 'nl_NL',
    images: [
      {
        url: 'https://pakketadvies.nl/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'PakketAdvies - Kennisbank',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kennisbank | PakketAdvies - Artikelen over energie voor thuis',
    description: 'Lees artikelen over energie voor thuis: vast vs variabel vs dynamisch, zonnepanelen en meer.',
    images: ['https://pakketadvies.nl/images/hero-main.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/particulier/kennisbank',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

const items = [
  { href: '/particulier/vast', title: 'Vast contract: wanneer is het slim?', tag: 'Vast' },
  { href: '/particulier/variabel', title: 'Variabel contract: voordelen en risico’s', tag: 'Variabel' },
  { href: '/particulier/dynamisch', title: 'Dynamisch contract: hoe werkt het?', tag: 'Dynamisch' },
  { href: '/particulier/zonnepanelen', title: 'Zonnepanelen: teruglevering en voorwaarden', tag: 'Zonnepanelen' },
  { href: '/particulier/verhuizen', title: 'Verhuizen: energie regelen zonder gedoe', tag: 'Verhuizen' },
  { href: '/particulier/faq', title: 'Veelgestelde vragen', tag: 'FAQ' },
  { href: '/particulier/energie-vergelijken', title: 'Energie vergelijken: waar let je op?', tag: 'Vergelijken' },
  { href: '/particulier/klantenservice', title: 'Hulp & klantenservice', tag: 'Service' },
]

export default function ParticulierKennisbankPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-14 md:pt-32">
      <div className="container-custom">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-brand-teal-600 font-semibold">Kennisbank</p>
            <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-navy-600">
              Uitleg voor particulieren
            </h1>
            <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
              Praktische artikelen en antwoorden die je helpen kiezen tussen vast, variabel en dynamisch — inclusief zonnepanelen en
              verhuizen.
            </p>
          </div>
          <Link
            href="/particulier/energie-vergelijken"
            className="hidden md:inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold"
          >
            Vergelijk nu
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal-600">{i.tag}</p>
              <h2 className="mt-2 font-display text-xl font-bold text-brand-navy-600">{i.title}</h2>
              <p className="mt-2 text-gray-600 text-sm">Lees verder →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}


