'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { MarketingEditor } from '@/components/admin/marketing/MarketingEditor'
import { MarketingPreviews } from '@/components/admin/marketing/MarketingPreviews'
import { useState } from 'react'

export interface MarketingContent {
  headline: string
  subheadline: string
  description: string
  ctaText: string
  backgroundColor: 'navy' | 'teal' | 'white' | 'gradient-navy-teal' | 'gradient-teal-purple'
  imageUrl: string
  showLogo: boolean
  showIcons: boolean
  iconType: 'energy' | 'savings' | 'contract' | 'support'
}

const defaultContent: MarketingContent = {
  headline: 'Bespaar tot €5.000 per jaar',
  subheadline: 'Op je zakelijke energiekosten',
  description: 'Wij helpen MKB bedrijven het beste energiecontract te vinden. Gratis, onafhankelijk en persoonlijk advies.',
  ctaText: 'Bereken je besparing',
  backgroundColor: 'gradient-navy-teal',
  imageUrl: '/images/hero-main.jpg',
  showLogo: true,
  showIcons: true,
  iconType: 'savings',
}

export default function MarketingPage() {
  const [content, setContent] = useState<MarketingContent>(defaultContent)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-brand-navy-500 mb-2">Marketing Content Generator</h1>
          <p className="text-gray-600">
            Maak marketing content voor Meta campagnes. Gebruik screenshots van de previews voor je posts en stories.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            <MarketingEditor content={content} onChange={setContent} />
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <MarketingPreviews content={content} />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

