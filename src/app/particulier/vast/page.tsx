import type { Metadata } from 'next'
import Link from 'next/link'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'

export const metadata: Metadata = {
  title: 'Vast energiecontract | PakketAdvies',
  description:
    'Een vast energiecontract geeft prijszekerheid: je tarief blijft gelijk gedurende de looptijd. Ideaal als je rust wilt en liever niet elke maand aan je contract denkt. Vergelijk vaste contracten en bespaar.',
  keywords: [
    'vast energiecontract',
    'vaste energietarieven',
    'prijszekerheid energie',
    'vast contract stroom en gas',
    'energiecontract vast',
  ],
  openGraph: {
    title: 'Vast energiecontract | PakketAdvies',
    description:
      'Een vast energiecontract geeft prijszekerheid: je tarief blijft gelijk gedurende de looptijd. Ideaal als je rust wilt. Vergelijk vaste contracten en bespaar.',
    type: 'website',
    url: 'https://pakketadvies.nl/particulier/vast',
    siteName: 'PakketAdvies',
    locale: 'nl_NL',
    images: [
      {
        url: 'https://pakketadvies.nl/images/contract-signing.jpg',
        width: 1200,
        height: 630,
        alt: 'PakketAdvies - Vast energiecontract',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vast energiecontract | PakketAdvies',
    description: 'Een vast energiecontract geeft prijszekerheid. Vergelijk vaste contracten en bespaar.',
    images: ['https://pakketadvies.nl/images/contract-signing.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/particulier/vast',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

export default function VastPage() {
  const breadcrumbs = [
    { name: 'Home', url: 'https://pakketadvies.nl' },
    { name: 'Particulier', url: 'https://pakketadvies.nl/particulier' },
    { name: 'Vast energiecontract', url: 'https://pakketadvies.nl/particulier/vast' },
  ]

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <div className="bg-gray-50 min-h-screen pt-28 pb-14 md:pt-32">
      <div className="container-custom">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <p className="text-brand-teal-600 font-semibold">Vast contract</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-navy-600">
            Zekerheid met een vaste prijs
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
            Een vast energiecontract geeft voorspelbaarheid: je tarief blijft gelijk gedurende de looptijd. Ideaal als je rust wilt en
            liever niet elke maand aan je contract denkt.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href="/particulier/energie-vergelijken"
              className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold"
            >
              Vergelijk vaste contracten
            </Link>
            <Link
              href="/particulier/faq"
              className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-brand-teal-50 hover:border-brand-teal-200 transition-all"
            >
              Veelgestelde vragen
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Wanneer is vast slim?</h2>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>Je wilt prijszekerheid voor langere tijd.</li>
              <li>Je hebt geen behoefte om tarieven actief te volgen.</li>
              <li>Je vindt “rust” belangrijker dan maximale flexibiliteit.</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Waar let je op?</h2>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>Looptijd (bijv. 1, 2 of 3 jaar) en voorwaarden.</li>
              <li>Vaste kosten per maand (niet alleen kWh/m³).</li>
              <li>Bij zonnepanelen: terugleververgoeding en eventuele kosten.</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-brand-navy-600">Valkuilen</h2>
            <ul className="mt-3 space-y-2 text-gray-600 text-sm leading-relaxed">
              <li>Te focussen op alleen het actietarief.</li>
              <li>Voorwaarden rond teruglevering overslaan.</li>
              <li>Onnodig lange looptijd kiezen “omdat het kan”.</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-600">Snel kiezen in 30 seconden</h2>
          <p className="mt-3 text-gray-600 leading-relaxed max-w-3xl">
            Vind je het prettig dat je maandbedrag zo voorspelbaar mogelijk is? Dan is vast vaak de meest logische start. Wil je liever
            flexibiliteit of kun je je verbruik sturen? Bekijk dan ook variabel of dynamisch.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/particulier/variabel"
              className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-brand-teal-50 hover:border-brand-teal-200 transition-all"
            >
              Bekijk variabel
            </Link>
            <Link
              href="/particulier/dynamisch"
              className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-brand-teal-50 hover:border-brand-teal-200 transition-all"
            >
              Bekijk dynamisch
            </Link>
            <Link
              href="/calculator"
              className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold"
            >
              Vergelijk nu
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}


