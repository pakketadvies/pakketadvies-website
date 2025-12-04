'use client'

import { MarketingContent } from '@/app/admin/marketing/page'
import { 
  Lightning, 
  CurrencyEur, 
  FileText, 
  Headset,
  Image as ImageIcon,
  Palette
} from '@phosphor-icons/react'

interface MarketingEditorProps {
  content: MarketingContent
  onChange: (content: MarketingContent) => void
}

export function MarketingEditor({ content, onChange }: MarketingEditorProps) {
  const updateField = <K extends keyof MarketingContent>(
    field: K,
    value: MarketingContent[K]
  ) => {
    onChange({ ...content, [field]: value })
  }

  const backgroundOptions = [
    { value: 'navy', label: 'Navy', color: 'bg-brand-navy-500' },
    { value: 'teal', label: 'Teal', color: 'bg-brand-teal-500' },
    { value: 'white', label: 'Wit', color: 'bg-white' },
    { value: 'gradient-navy-teal', label: 'Gradient Navy → Teal', color: 'bg-gradient-to-br from-brand-navy-500 to-brand-teal-500' },
    { value: 'gradient-teal-purple', label: 'Gradient Teal → Purple', color: 'bg-gradient-to-br from-brand-teal-500 to-brand-purple-500' },
  ] as const

  const iconOptions = [
    { value: 'energy', label: 'Energie', icon: Lightning },
    { value: 'savings', label: 'Besparing', icon: CurrencyEur },
    { value: 'contract', label: 'Contract', icon: FileText },
    { value: 'support', label: 'Ondersteuning', icon: Headset },
  ]

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-teal-50 flex items-center justify-center">
          <Palette size={20} className="text-brand-teal-600" />
        </div>
        <h2 className="text-xl font-bold text-brand-navy-500">Content Editor</h2>
      </div>

      {/* Headline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hoofdtekst
        </label>
        <input
          type="text"
          value={content.headline}
          onChange={(e) => updateField('headline', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent"
          placeholder="Bijv: Bespaar tot €5.000 per jaar"
        />
      </div>

      {/* Subheadline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subtekst
        </label>
        <input
          type="text"
          value={content.subheadline}
          onChange={(e) => updateField('subheadline', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent"
          placeholder="Bijv: Op je zakelijke energiekosten"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Beschrijving
        </label>
        <textarea
          value={content.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent resize-none"
          placeholder="Beschrijving van je dienst of aanbieding..."
        />
      </div>

      {/* CTA Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Call-to-Action Tekst
        </label>
        <input
          type="text"
          value={content.ctaText}
          onChange={(e) => updateField('ctaText', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent"
          placeholder="Bijv: Bereken je besparing"
        />
      </div>

      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Achtergrondkleur
        </label>
        <div className="grid grid-cols-2 gap-2">
          {backgroundOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateField('backgroundColor', option.value)}
              className={`
                relative p-3 rounded-lg border-2 transition-all
                ${content.backgroundColor === option.value
                  ? 'border-brand-teal-500 ring-2 ring-brand-teal-200'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className={`${option.color} w-full h-8 rounded mb-2`} />
              <span className="text-xs font-medium text-gray-700">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Achtergrondafbeelding URL
        </label>
        <div className="flex items-center gap-2">
          <ImageIcon size={20} className="text-gray-400" />
          <input
            type="text"
            value={content.imageUrl}
            onChange={(e) => updateField('imageUrl', e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent"
            placeholder="/images/hero-main.jpg"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Gebruik een relatief pad zoals /images/hero-main.jpg
        </p>
      </div>

      {/* Icon Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Icoon Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {iconOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => updateField('iconType', option.value)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                  ${content.iconType === option.value
                    ? 'border-brand-teal-500 bg-brand-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <Icon 
                  size={20} 
                  weight={content.iconType === option.value ? 'fill' : 'regular'}
                  className={content.iconType === option.value ? 'text-brand-teal-600' : 'text-gray-400'}
                />
                <span className="text-sm font-medium text-gray-700">{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={content.showLogo}
            onChange={(e) => updateField('showLogo', e.target.checked)}
            className="w-5 h-5 text-brand-teal-600 border-gray-300 rounded focus:ring-brand-teal-500"
          />
          <span className="text-sm font-medium text-gray-700">Logo tonen</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={content.showIcons}
            onChange={(e) => updateField('showIcons', e.target.checked)}
            className="w-5 h-5 text-brand-teal-600 border-gray-300 rounded focus:ring-brand-teal-500"
          />
          <span className="text-sm font-medium text-gray-700">Iconen tonen</span>
        </label>
      </div>
    </div>
  )
}

