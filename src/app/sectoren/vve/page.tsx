import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Buildings,
  Check,
  ArrowRight,
  Lightning,
  Users,
  HouseLine,
  ShieldCheck,
  Wallet,
  BuildingApartment,
  WarningCircle,
  Handshake,
} from '@phosphor-icons/react/dist/ssr'
import { VveContactForm } from '@/components/sectoren/VveContactForm'

export const metadata: Metadata = {
  title: 'Zakelijke energie voor VvE',
  description:
    'Vrijblijvend en gratis energieadvies voor VvE-eigenaren, met focus op zekerheid, transparantie, ETS-2 voorbereiding en stabiele maandlasten voor bewoners.',
  alternates: {
    canonical: 'https://pakketadvies.nl/sectoren/vve',
  },
  openGraph: {
    title: 'Zakelijke energie voor VvE | PakketAdvies',
    description:
      'In crisistijden zekerheid voor VvE-besturen en bewoners: gratis advies, veel contractmogelijkheden en bescherming richting ETS-2.',
    url: 'https://pakketadvies.nl/sectoren/vve',
    type: 'website',
  },
}

export default function VvePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-brand-purple-700 via-brand-purple-600 to-brand-navy-700 text-white py-12 md:py-16 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/office-team.jpg" alt="VvE beheer" fill className="object-cover" />
        </div>

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <div className="inline-flex items-center gap-3 bg-white/20 border border-white/30 rounded-full px-4 py-2 mb-6">
                <Buildings weight="duotone" className="w-5 h-5" />
                <span className="text-sm font-semibold">VvE zekerheid in onrustige tijden</span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Zekerheid voor <span className="text-brand-purple-200">VvE-eigenaren en bewoners</span>
              </h1>
              <p className="text-lg md:text-xl text-brand-purple-100 mb-6">
                We kijken vrijblijvend mee naar het beste energieadvies voor jouw VvE. In deze crisistijd zorgen we voor rust, grip op kosten
                en contractkeuzes die passen bij jullie gebouwen, leden en begroting.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  'Gratis en vrijblijvende begeleiding voor VvE-besturen en beheerders.',
                  'Veel mogelijkheden die extra zekerheid bieden bij prijsschommelingen.',
                  'Oplossingen voor meerdere woningen, appartementen en flatgebouwen.',
                  'Duidelijk advies over ETS-2 en bescherming richting 01-01-2028.',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check weight="bold" className="w-5 h-5 text-brand-purple-200 mt-1 flex-shrink-0" />
                    <span className="text-brand-purple-50">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#vve-contact-form">
                  <button className="px-8 py-4 bg-white text-brand-purple-700 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                    <Lightning weight="duotone" className="w-6 h-6" />
                    Vraag vrijblijvend advies aan
                  </button>
                </Link>
                <Link href="#vve-contact-form">
                  <button className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl font-semibold text-lg border border-white/20 transition-all flex items-center justify-center gap-2">
                    Vul direct het formulier in
                    <ArrowRight weight="bold" className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>

            <div id="vve-contact-form" className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-white/30 scroll-mt-40">
              <h2 className="font-display text-2xl font-bold text-brand-navy-500 mb-2">Vraag direct VvE-advies aan</h2>
              <p className="text-gray-600 mb-6">Laat je gegevens achter. We nemen snel contact op en denken vrijblijvend met je mee.</p>
              <VveContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">Waarom VvE’s nu extra zekerheid nodig hebben</h2>
            <p className="text-lg text-gray-600">
              De energiemarkt blijft onrustig. Daarom helpen wij VvE-besturen met keuzes die zekerheid bieden voor bewoners, servicekosten en
              meerjarenbegrotingen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Zekerheid in crisistijden',
                desc: 'Contracten en strategieen die passen bij onvoorspelbare marktomstandigheden.',
              },
              {
                icon: Wallet,
                title: 'Grip op kosten voor bewoners',
                desc: 'Heldere keuzes om onverwachte pieken in servicekosten zoveel mogelijk te beperken.',
              },
              {
                icon: Users,
                title: 'Draagvlak en duidelijkheid',
                desc: 'Transparante toelichting die je makkelijk deelt met leden, bewoners en beheerder.',
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">Speciaal voor VvE’s met meerdere gebouwen</h2>
            <p className="text-lg text-gray-600">Voor meerdere woningen, complexen en flatgebouwen hebben we verschillende passende routes.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-6">Wat je van ons mag verwachten</h3>
              <ul className="space-y-4">
                {[
                  'Vrijblijvend meekijken naar het beste energieadvies voor jullie bewoners en leden.',
                  'Meerdere contractmogelijkheden voor verschillende VvE-profielen en looptijden.',
                  'Advies voor een of meerdere aansluitingen, gebouwen en woonblokken.',
                  'Transparante uitleg over risico, voordeel en impact op de VvE-begroting.',
                  'Gratis advies: je zit nergens aan vast.',
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <Check weight="bold" className="w-6 h-6 text-brand-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-brand-purple-50 to-brand-purple-100 rounded-2xl p-8 border border-brand-purple-200">
              <div className="bg-white rounded-xl p-6 shadow-lg mb-5">
                <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4 flex items-center gap-3">
                  <BuildingApartment weight="duotone" className="w-7 h-7 text-brand-purple-700" />
                  Voor grotere VvE-structuren
                </h3>
                <p className="text-gray-700">
                  Heb je meerdere woningen, portieken of flatgebouwen? Dan combineren we verschillende mogelijkheden tot een advies dat rust en
                  voorspelbaarheid geeft op complexniveau.
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <h4 className="font-display text-xl font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <WarningCircle weight="fill" className="w-5 h-5" />
                  ETS-2 vanaf 01-01-2028
                </h4>
                <p className="text-amber-900 text-sm leading-relaxed">
                  De ETS-2 bijmengverplichting kan extra druk op energiekosten zetten. Wij kunnen een product aanbieden dat je VvE en bewoners
                  helpt om hier beter tegen beschermd te zijn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto rounded-3xl border border-gray-200 bg-gray-50 p-8 md:p-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">Transparant, vrijblijvend en professioneel</h2>
            <p className="text-lg text-gray-700 mb-6">
              We werken met een heldere werkwijze: eerst inventariseren, dan vergelijken, daarna adviseren. Je ziet precies wat de mogelijkheden
              zijn en waarom een voorstel wel of niet past. Altijd zonder verplichting.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              {[
                'Geen verborgen kosten: advies is gratis.',
                'Heldere communicatie richting bestuur en leden.',
                'Praktische vervolgstappen als je wilt doorpakken.',
                'Volledig vrijblijvend: jij houdt de regie.',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <HouseLine weight="duotone" className="w-5 h-5 text-brand-purple-600 mt-1 flex-shrink-0" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-purple-600 to-brand-purple-700 relative overflow-hidden">
        <div className="container-custom text-center relative z-10">
          <Handshake weight="duotone" className="w-16 h-16 text-brand-purple-200 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Klaar voor zekerheid voor jouw VvE?</h2>
          <p className="text-lg md:text-xl text-brand-purple-100 mb-8 max-w-2xl mx-auto">
            Vraag gratis advies aan en ontdek welke mogelijkheden het beste passen bij jullie bewoners, gebouwen en budget.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#vve-contact-form">
              <button className="px-8 py-4 bg-white text-brand-purple-600 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Lightning weight="duotone" className="w-6 h-6" />
                Vul het formulier in
              </button>
            </Link>
            <Link href="#vve-contact-form">
              <button className="px-8 py-4 bg-brand-purple-800 hover:bg-brand-purple-900 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
                Vraag vrijblijvend advies aan
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
