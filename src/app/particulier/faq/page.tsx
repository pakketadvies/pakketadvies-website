import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Veelgestelde vragen',
  alternates: { canonical: 'https://pakketadvies.nl/particulier/faq' },
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
    q: 'Kan ik overstappen als ik nog een contract heb?',
    a: 'Meestal wel, maar let op eventuele opzegboete. Bij vergelijken nemen we dit mee zodat je een goede keuze maakt.',
  },
  {
    q: 'Hoe snel kan ik overstappen?',
    a: 'Dat verschilt per leverancier en contract. Vaak kan overstappen binnen enkele weken; bij verhuizing kan het sneller of direct aansluiten.',
  },
  {
    q: 'Waar moet ik op letten bij terugleververgoeding en -kosten?',
    a: 'Niet alleen het tarief telt: bekijk ook teruglevervoorwaarden, vaste kosten en eventuele terugleverkosten.',
  },
]

export default function ParticulierFaqPage() {
  return (
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
  )
}


