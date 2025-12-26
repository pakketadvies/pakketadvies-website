import type { Metadata } from 'next'
import { FAQSchema } from '@/components/seo/StructuredData'

export const metadata: Metadata = {
  title: 'Veelgestelde vragen | PakketAdvies',
  description:
    'Veelgestelde vragen over energiecontracten, energie vergelijken, vast vs variabel vs dynamisch, zonnepanelen en meer. Vind snel antwoorden op je vragen.',
  keywords: [
    'energie faq',
    'veelgestelde vragen energie',
    'energiecontract vragen',
    'energie advies',
    'energie uitleg',
  ],
  openGraph: {
    title: 'Veelgestelde vragen | PakketAdvies',
    description:
      'Veelgestelde vragen over energiecontracten, energie vergelijken, vast vs variabel vs dynamisch, zonnepanelen en meer.',
    type: 'website',
    url: 'https://pakketadvies.nl/particulier/faq',
    siteName: 'PakketAdvies',
    locale: 'nl_NL',
    images: [
      {
        url: 'https://pakketadvies.nl/images/hero-main.jpg',
        width: 1200,
        height: 630,
        alt: 'PakketAdvies - Veelgestelde vragen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veelgestelde vragen | PakketAdvies',
    description: 'Veelgestelde vragen over energiecontracten, energie vergelijken en meer.',
    images: ['https://pakketadvies.nl/images/hero-main.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/particulier/faq',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

const faqs = [
  {
    q: 'Wat is het verschil tussen vast, variabel en dynamisch?',
    a: 'Vast = prijszekerheid voor de looptijd. Variabel = tarief kan wijzigen. Dynamisch = stroomprijs per uur (en vaak gas per dag) op basis van marktprijzen.',
  },
  {
    q: 'Is dynamisch slim met zonnepanelen?',
    a: 'Dat kan, maar hangt af van je teruglevering, verbruikspatroon en (teruglever)voorwaarden. Wij helpen je dit helder te vergelijken.',
  },
  {
    q: 'Waar moet ik op letten behalve het tarief per kWh?',
    a: 'Kijk ook naar vaste kosten per maand, looptijd, voorwaarden en bij zonnepanelen naar teruglevering en eventuele kosten.',
  },
  {
    q: 'Wat is een goede schatting van mijn verbruik?',
    a: 'Je jaarafrekening is het meest precies. Heb je die niet? Dan kun je beginnen met een schatting; vergelijken blijft zinvol.',
  },
  {
    q: 'Kan ik overstappen als ik nog een contract heb?',
    a: 'Meestal wel, maar let op eventuele opzegboete. Bij vergelijken nemen we dit mee zodat je een goede keuze maakt.',
  },
  {
    q: 'Hoe snel kan ik overstappen?',
    a: 'Dat verschilt per leverancier en contract. Vaak kan overstappen binnen enkele weken; bij verhuizing kan het sneller of direct aansluiten.',
  },
  {
    q: 'Moet ik zelf mijn oude contract opzeggen?',
    a: 'In veel gevallen wordt dit voor je geregeld bij een overstap. Bij verhuizing werkt het soms anders; check dit vooraf.',
  },
  {
    q: 'Wat betekenen vaste kosten?',
    a: 'Dat zijn maandelijkse kosten los van je verbruik. Ze kunnen de totale kosten sterk beïnvloeden, zeker bij laag verbruik.',
  },
  {
    q: 'Wat als ik geen gasaansluiting heb?',
    a: 'Dan vergelijk je alleen stroom. Dit is juist een belangrijk verschil, omdat vaste kosten en voorwaarden dan anders kunnen uitpakken.',
  },
  {
    q: 'Wat is het verschil tussen enkel- en dubbeltarief?',
    a: 'Bij dubbeltarief heb je piek/dal (dag/nacht) tarieven. Bij enkel tarief is het één prijs. Welke beter is hangt af van je verbruikspatroon.',
  },
  {
    q: 'Wanneer is vast beter dan dynamisch?',
    a: 'Vast past vaak bij mensen die zekerheid willen. Dynamisch past bij wie kan sturen op uren en risico/variatie accepteert.',
  },
  {
    q: 'Waar moet ik op letten bij teruglevering?',
    a: 'Let op terugleververgoeding, mogelijke terugleverkosten en de voorwaarden. Niet alleen het kWh-tarief is belangrijk.',
  },
  {
    q: 'Kan ik later wisselen van contracttype?',
    a: 'Dat kan vaak, maar voorwaarden en eventuele opzegkosten zijn bepalend. Daarom vergelijken we altijd op het totaalplaatje.',
  },
  {
    q: 'Waar moet ik op letten bij terugleververgoeding en -kosten?',
    a: 'Niet alleen het tarief telt: bekijk ook teruglevervoorwaarden, vaste kosten en eventuele terugleverkosten.',
  },
]

export default function ParticulierFaqPage() {
  // Transform FAQs for structured data
  const faqQuestions = faqs.map((f) => ({
    question: f.q,
    answer: f.a,
  }))

  return (
    <>
      <FAQSchema questions={faqQuestions} />
      <div className="bg-gray-50 min-h-screen pt-28 pb-14 md:pt-32">
        <div className="container-custom">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10">
            <p className="text-brand-teal-600 font-semibold">FAQ</p>
            <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold text-brand-navy-600">
              Veelgestelde vragen (Particulier)
            </h1>
            <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl">
              Antwoorden in consumententaal. We breiden deze lijst uit op basis van de vragen die we het vaakst krijgen.
            </p>

            <div className="mt-8 space-y-4">
              {faqs.map((f) => (
                <div key={f.q} className="border border-gray-200 rounded-2xl p-6">
                  <h2 className="font-semibold text-brand-navy-600">{f.q}</h2>
                  <p className="mt-2 text-gray-600 leading-relaxed text-sm">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


