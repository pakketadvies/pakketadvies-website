import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Buildings,
  Check,
  ArrowRight,
  Lightning,
  Users,
  House,
  Calculator,
  Handshake,
  Lightbulb,
} from '@phosphor-icons/react/dist/ssr'

export const metadata: Metadata = {
  title: 'Zakelijke energie voor VvE',
  description:
    'Energieoplossingen voor VvE-beheer met focus op collectieve voorzieningen, voorspelbare kosten en duidelijke rapportage.',
  alternates: {
    canonical: 'https://pakketadvies.nl/sectoren/vve',
  },
  openGraph: {
    title: 'Zakelijke energie voor VvE | PakketAdvies',
    description:
      'Vergelijk energiecontracten voor VvE’s met stabiele kosten en grip op verbruik van collectieve ruimtes.',
    url: 'https://pakketadvies.nl/sectoren/vve',
    type: 'website',
  },
}

export default function VvePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-brand-purple-600 via-brand-purple-500 to-brand-purple-600 text-white py-12 md:py-16 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/office-team.jpg" alt="VvE beheer" fill className="object-cover" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/20 border border-white/30 rounded-full px-4 py-2 mb-6">
              <Buildings weight="duotone" className="w-5 h-5" />
              <span className="text-sm font-semibold">VvE</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Energieoplossingen voor <span className="text-brand-purple-200">Verenigingen van Eigenaren</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-purple-100 mb-8">
              Voor algemene ruimtes, liften, ventilatie en verlichting wil je vooral stabiliteit: heldere kosten, betrouwbare
              levering en een contract dat past bij de VvE-begroting.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/calculator?addressType=zakelijk&segment=vve">
                <button className="px-8 py-4 bg-white text-brand-purple-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                  <Lightning weight="duotone" className="w-6 h-6" />
                  Bereken je VvE-besparing
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">Wat speelt er bij VvE’s?</h2>
            <p className="text-lg text-gray-600">
              VvE’s hebben andere prioriteiten dan reguliere bedrijven: voorspelbaarheid, transparantie en draagvlak bij bewoners.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: House,
                title: 'Collectieve voorzieningen',
                desc: 'Verbruik voor trappenhuisverlichting, lift, ventilatie en algemene installaties.',
              },
              {
                icon: Calculator,
                title: 'Begroting en servicekosten',
                desc: 'Een stabiel contract voorkomt verrassingen in de VvE-begroting en servicekosten.',
              },
              {
                icon: Users,
                title: 'Duidelijke communicatie',
                desc: 'Bestuur en beheerder willen duidelijke rapportage richting bewoners en ledenvergadering.',
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <Icon weight="duotone" className="w-10 h-10 text-brand-purple-500 mb-4" />
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">Onze aanpak voor VvE</h2>
            <p className="text-lg text-gray-600">Simpel, transparant en gericht op stabiele maandlasten.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-6">Wat je krijgt</h3>
              <ul className="space-y-4">
                {[
                  'Contractadvies op basis van VvE-verbruik en installaties',
                  'Voorkeur voor stabiele kosten en heldere looptijd',
                  'Inzichtelijke vergelijking van meerdere leveranciers',
                  'Praktische toelichting voor bestuur en beheer',
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <Check weight="bold" className="w-6 h-6 text-brand-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-brand-purple-50 to-brand-purple-100 rounded-2xl p-8 border border-brand-purple-200">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">Typisch VvE-profiel</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Verbruik:</span>
                    <span className="font-semibold text-brand-purple-700">25.000 - 180.000 kWh/jaar</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Doel:</span>
                    <span className="font-semibold text-brand-purple-700">Stabiele maandlasten</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-gray-600">Aanpak:</span>
                    <span className="font-semibold text-brand-purple-700">Duidelijk en voorspelbaar</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-brand-purple-200 bg-white/70 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb weight="duotone" className="w-4 h-4 text-brand-purple-700" />
                  <span className="text-xs font-semibold text-brand-purple-800">Tip</span>
                </div>
                <p className="text-sm text-brand-purple-700">
                  Neem het jaarverbruik van de algemene aansluiting mee. Dan krijg je direct een realistischer voorstel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-purple-600 to-brand-purple-700 relative overflow-hidden">
        <div className="container-custom text-center relative z-10">
          <Handshake weight="duotone" className="w-16 h-16 text-brand-purple-200 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Klaar voor een stabiel VvE-contract?</h2>
          <p className="text-lg md:text-xl text-brand-purple-100 mb-8 max-w-2xl mx-auto">
            Vergelijk vrijblijvend en ontvang een voorstel dat aansluit op jullie gebouw en begroting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator?addressType=zakelijk&segment=vve">
              <button className="px-8 py-4 bg-white text-brand-purple-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Lightning weight="duotone" className="w-6 h-6" />
                Start vergelijking
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 bg-brand-purple-800 hover:bg-brand-purple-900 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
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
