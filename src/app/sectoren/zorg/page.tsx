import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Hospital,
  Check,
  ArrowRight,
  Lightning,
  Heartbeat,
  ShieldCheck,
  ChartLine,
  Handshake,
  Lightbulb,
} from '@phosphor-icons/react/dist/ssr'

export const metadata: Metadata = {
  title: 'Zakelijke energie voor zorg',
  description:
    'Energieoplossingen voor zorglocaties met focus op leveringszekerheid, budgetcontrole en verbruiksinzicht.',
  alternates: {
    canonical: 'https://pakketadvies.nl/sectoren/zorg',
  },
  openGraph: {
    title: 'Zakelijke energie voor zorg | PakketAdvies',
    description:
      'Vergelijk energiecontracten voor praktijken en zorglocaties met betrouwbare levering en duidelijke kosten.',
    url: 'https://pakketadvies.nl/sectoren/zorg',
    type: 'website',
  },
}

export default function ZorgPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-brand-teal-600 via-brand-teal-500 to-brand-navy-600 text-white py-12 md:py-16 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/office-team.jpg" alt="Zorgsector" fill className="object-cover" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/20 border border-white/30 rounded-full px-4 py-2 mb-6">
              <Hospital weight="duotone" className="w-5 h-5" />
              <span className="text-sm font-semibold">Zorg</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Energieoplossingen voor <span className="text-teal-100">praktijken en zorglocaties</span>
            </h1>
            <p className="text-lg md:text-xl text-teal-100 mb-8">
              In de zorg is continuiteit cruciaal. Je wilt betrouwbare levering en voorspelbare kosten voor een gezonde exploitatie.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/calculator?addressType=zakelijk&segment=zorg">
                <button className="px-8 py-4 bg-white text-brand-teal-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                  <Lightning weight="duotone" className="w-6 h-6" />
                  Bereken je zorg-besparing
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold text-lg border border-white/20 transition-all flex items-center justify-center gap-2">
                  Plan adviesgesprek
                  <ArrowRight weight="bold" className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">Energie in de zorg: wat telt echt?</h2>
            <p className="text-lg text-gray-600">
              Voor zorgverleners draait het om betrouwbaarheid, kostenbeheersing en rust in de bedrijfsvoering.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Continuiteit',
                desc: 'Kritische processen moeten altijd blijven draaien, zonder onzekerheid over levering.',
              },
              {
                icon: ChartLine,
                title: 'Budgetcontrole',
                desc: 'Voorspelbare energiekosten geven rust in planning en exploitatie.',
              },
              {
                icon: Heartbeat,
                title: 'Operationele zekerheid',
                desc: 'Locaties met medische apparatuur vragen om een stabiele energie-aanpak.',
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <Icon weight="duotone" className="w-10 h-10 text-brand-teal-500 mb-4" />
                  <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">Onze aanpak voor zorglocaties</h2>
            <p className="text-lg text-gray-600">Pragmatisch en duidelijk, met focus op betrouwbare levering en inzicht.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-6">Wat je krijgt</h3>
              <ul className="space-y-4">
                {[
                  'Vergelijking van passende contracten voor zorgprofielen',
                  'Focus op leveringszekerheid en voorspelbare kosten',
                  'Duidelijke uitleg voor management en administratie',
                  'Praktisch advies bij contractkeuze en looptijd',
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <Check weight="bold" className="w-6 h-6 text-brand-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-brand-teal-50 to-brand-teal-100 rounded-2xl p-8 border border-brand-teal-200">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">Typisch zorgprofiel</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Verbruik:</span>
                    <span className="font-semibold text-brand-teal-700">40.000 - 250.000 kWh/jaar</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Prioriteit:</span>
                    <span className="font-semibold text-brand-teal-700">Zekerheid en stabiliteit</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-gray-600">Aanpak:</span>
                    <span className="font-semibold text-brand-teal-700">Helder en betrouwbaar</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-brand-teal-200 bg-white/70 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb weight="duotone" className="w-4 h-4 text-brand-teal-700" />
                  <span className="text-xs font-semibold text-brand-teal-800">Tip</span>
                </div>
                <p className="text-sm text-brand-teal-700">
                  Noteer piekmomenten en openingstijden van je locatie. Zo kunnen we nog gerichter adviseren.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-teal-600 to-brand-navy-700 relative overflow-hidden">
        <div className="container-custom text-center relative z-10">
          <Handshake weight="duotone" className="w-16 h-16 text-teal-200 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Klaar voor een stabiel zorgcontract?</h2>
          <p className="text-lg md:text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Ontvang een voorstel dat past bij jouw zorglocatie en helpt om kosten en continuiteit in balans te houden.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator?addressType=zakelijk&segment=zorg">
              <button className="px-8 py-4 bg-white text-brand-teal-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Lightning weight="duotone" className="w-6 h-6" />
                Start vergelijking
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold text-lg border border-white/20 transition-all flex items-center justify-center gap-2">
                Neem contact op
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
