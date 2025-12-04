'use client'

import { MarketingContent } from '@/app/admin/marketing/page'
import Image from 'next/image'
import { 
  Lightning, 
  CurrencyEur, 
  FileText, 
  Headset,
  CheckCircle
} from '@phosphor-icons/react'

interface MarketingStoryPreviewProps {
  content: MarketingContent
  previewRef?: React.RefObject<HTMLDivElement | null>
}

const iconMap = {
  energy: Lightning,
  savings: CurrencyEur,
  contract: FileText,
  support: Headset,
}

export function MarketingStoryPreview({ content, previewRef }: MarketingStoryPreviewProps) {
  const Icon = iconMap[content.iconType]
  
  const getBackgroundClasses = () => {
    switch (content.backgroundColor) {
      case 'navy':
        return 'bg-brand-navy-500'
      case 'teal':
        return 'bg-brand-teal-500'
      case 'white':
        return 'bg-white'
      case 'gradient-navy-teal':
        return 'bg-gradient-to-b from-brand-navy-500 via-brand-navy-600 to-brand-teal-500'
      case 'gradient-teal-purple':
        return 'bg-gradient-to-b from-brand-teal-500 via-brand-teal-600 to-brand-purple-500'
      default:
        return 'bg-gradient-to-b from-brand-navy-500 to-brand-teal-500'
    }
  }

  const isLightBackground = content.backgroundColor === 'white' || content.backgroundColor === 'teal'
  const textColor = isLightBackground ? 'text-brand-navy-500' : 'text-white'
  const textColorMuted = isLightBackground ? 'text-gray-600' : 'text-gray-200'

  return (
    <div 
      ref={previewRef}
      data-preview-element="story"
      className={`
        relative rounded-2xl overflow-hidden
        ${getBackgroundClasses()}
        shadow-2xl
      `}
      style={{ 
        width: '304px', // 1080px scaled down for preview (1080/3.55)
        height: '541px', // 1920px scaled down for preview (1920/3.55)
        aspectRatio: '9 / 16'
      }}
    >
      {/* Background Image with Overlay */}
      {content.imageUrl && (
        <>
          <div className="absolute inset-0">
            <Image
              src={content.imageUrl}
              alt="Background"
              fill
              className="object-cover opacity-30"
              unoptimized
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />
        </>
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Top Section - Logo */}
        {content.showLogo && (
          <div className="flex items-start justify-between mb-4">
            <div className="relative h-8 w-auto">
              <Image
                src={isLightBackground ? "/images/logo-dark.png" : "/images/logo-wit.png"}
                alt="PakketAdvies"
                width={140}
                height={32}
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        )}

        {/* Middle Section - Main Content */}
        <div className="flex-1 flex flex-col justify-center space-y-3">
          {/* Icon */}
          {content.showIcons && Icon && (
            <div className="mb-3">
              <div className={`w-14 h-14 rounded-xl ${isLightBackground ? 'bg-brand-teal-50' : 'bg-white/20 backdrop-blur-sm'} flex items-center justify-center border ${isLightBackground ? 'border-brand-teal-200' : 'border-white/30'}`}>
                <Icon 
                  size={28} 
                  weight="bold" 
                  className={isLightBackground ? 'text-brand-teal-600' : 'text-white'} 
                />
              </div>
            </div>
          )}

          {/* Headline */}
          <h2 className={`font-display font-bold text-3xl leading-tight ${textColor}`}>
            {content.headline}
          </h2>

          {/* Subheadline */}
          {content.subheadline && (
            <h3 className={`font-semibold text-xl ${textColorMuted}`}>
              {content.subheadline}
            </h3>
          )}

          {/* Description */}
          {content.description && (
            <p className={`text-base leading-relaxed ${textColorMuted} max-w-xs`}>
              {content.description}
            </p>
          )}

          {/* Features */}
          {content.showIcons && (
            <div className="flex flex-col gap-2 mt-4">
              {['Gratis', 'Onafhankelijk', 'Persoonlijk'].map((feature) => (
                <div 
                  key={feature}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isLightBackground ? 'bg-brand-teal-50 border border-brand-teal-200' : 'bg-white/20 backdrop-blur-sm border border-white/30'} w-fit`}
                >
                  <CheckCircle 
                    size={14} 
                    weight="fill"
                    className={isLightBackground ? 'text-brand-teal-600' : 'text-white'}
                  />
                  <span className={`text-xs font-medium ${isLightBackground ? 'text-brand-navy-700' : 'text-white'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section - CTA */}
        <div className="mt-4">
          <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-base ${isLightBackground ? 'bg-brand-teal-500 text-white shadow-lg shadow-brand-teal-500/30' : 'bg-white text-brand-navy-500 shadow-lg'}`}>
            {content.ctaText || 'Bereken je besparing'}
            <CurrencyEur size={18} weight="bold" />
          </div>
        </div>
      </div>
    </div>
  )
}

