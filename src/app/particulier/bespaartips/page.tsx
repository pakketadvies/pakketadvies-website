import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { ArrowRight, Lightbulb, Leaf, Coins } from '@phosphor-icons/react'

export const metadata: Metadata = {
  title: 'Energie bespaartips | PakketAdvies',
  description: 'Praktische tips om energie te besparen en je energiekosten te verlagen. Eenvoudige stappen die direct resultaat opleveren.',
  alternates: {
    canonical: 'https://pakketadvies.nl/particulier/bespaartips',
  },
}

const tips = [
  {
    icon: Lightbulb,
    title: '10 tips om energie te besparen',
    description: 'Eenvoudige stappen die direct resultaat opleveren. Van LED-verlichting tot sluipverbruik voorkomen.',
    href: '/particulier/bespaartips/10-tips',
  },
  {
    icon: Coins,
    title: 'Vaste vs variabele tarieven: wat is beter?',
    description: 'Ontdek welk type energiecontract het beste bij jouw situatie past en waar je het meeste mee bespaart.',
    href: '/particulier/bespaartips/vast-vs-variabel',
  },
  {
    icon: Leaf,
    title: 'Zonnepanelen: is het de investering waard?',
    description: 'Alles over zonnepanelen: kosten, opbrengst, terugverdientijd en of het de moeite waard is voor jou.',
    href: '/particulier/bespaartips/zonnepanelen',
  },
]

export default function BespaartipsPage() {
  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="container-custom max-w-4xl text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Energie bespaartips
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Praktische tips om energie te besparen en je energiekosten te verlagen
          </p>
        </div>
      </section>

      {/* Tips Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8">
            {tips.map((tip, index) => {
              const Icon = tip.icon
              return (
                <Link key={index} href={tip.href}>
                  <Card className="hover-lift h-full">
                    <CardContent className="pt-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 shadow-lg mb-6">
                        <Icon weight="duotone" className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-3">
                        {tip.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {tip.description}
                      </p>
                      <div className="flex items-center gap-2 text-brand-teal-600 font-semibold">
                        Lees meer
                        <ArrowRight weight="bold" className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

