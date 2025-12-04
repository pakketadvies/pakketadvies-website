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

interface MarketingStoryPreviewFullResProps {
  content: MarketingContent
  previewRef?: React.RefObject<HTMLDivElement | null>
}

const iconMap = {
  energy: Lightning,
  savings: CurrencyEur,
  contract: FileText,
  support: Headset,
}

// Scale factor: 304px -> 1080px = 3.552... (using 3.55)
const SCALE = 1080 / 304

export function MarketingStoryPreviewFullRes({ content, previewRef }: MarketingStoryPreviewFullResProps) {
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
      data-preview-element="story-fullres"
      className={`relative overflow-hidden ${getBackgroundClasses()}`}
      style={{
        width: '1080px',
        height: '1920px',
        borderRadius: `${16 * SCALE}px`, // rounded-2xl scaled
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

      {/* Content - All sizes scaled by 3.55x */}
      <div 
        className="relative h-full flex flex-col justify-between"
        style={{
          padding: `${24 * SCALE}px`, // p-6 = 24px -> 85.2px
        }}
      >
        {/* Top Section - Logo */}
        {content.showLogo && (
          <div 
            className="flex items-start justify-between"
            style={{ marginBottom: `${16 * SCALE}px` }} // mb-4 = 16px -> 56.8px
          >
            <div 
              className="relative w-auto"
              style={{ height: `${32 * SCALE}px` }} // h-8 = 32px -> 113.6px
            >
              <Image
                src={isLightBackground ? "/images/logo-dark.png" : "/images/logo-wit.png"}
                alt="PakketAdvies"
                width={140 * SCALE}
                height={32 * SCALE}
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        )}

        {/* Middle Section - Main Content */}
        <div className="flex-1 flex flex-col justify-center" style={{ gap: `${12 * SCALE}px` }}> {/* space-y-3 = 12px -> 42.6px */}
          {/* Icon */}
          {content.showIcons && Icon && (
            <div style={{ marginBottom: `${12 * SCALE}px` }}> {/* mb-3 = 12px -> 42.6px */}
              <div 
                className={`${isLightBackground ? 'bg-brand-teal-50' : 'bg-white/20 backdrop-blur-sm'} flex items-center justify-center border ${isLightBackground ? 'border-brand-teal-200' : 'border-white/30'}`}
                style={{
                  width: `${56 * SCALE}px`, // w-14 = 56px -> 198.8px
                  height: `${56 * SCALE}px`, // h-14 = 56px -> 198.8px
                  borderRadius: `${12 * SCALE}px`, // rounded-xl = 12px -> 42.6px
                }}
              >
                <Icon 
                  size={28 * SCALE}
                  weight="bold" 
                  className={isLightBackground ? 'text-brand-teal-600' : 'text-white'} 
                />
              </div>
            </div>
          )}

          {/* Headline */}
          <h2 
            className={`font-display font-bold leading-tight ${textColor}`}
            style={{ fontSize: `${30 * SCALE}px` }} // text-3xl = 30px -> 106.5px
          >
            {content.headline}
          </h2>

          {/* Subheadline */}
          {content.subheadline && (
            <h3 
              className={`font-semibold ${textColorMuted}`}
              style={{ fontSize: `${20 * SCALE}px` }} // text-xl = 20px -> 71px
            >
              {content.subheadline}
            </h3>
          )}

          {/* Description */}
          {content.description && (
            <p 
              className={`leading-relaxed ${textColorMuted}`}
              style={{ 
                fontSize: `${16 * SCALE}px`, // text-base = 16px -> 56.8px
                maxWidth: `${320 * SCALE}px`, // max-w-xs = 320px -> 1136px
              }}
            >
              {content.description}
            </p>
          )}

          {/* Features */}
          {content.showIcons && (
            <div 
              className="flex flex-col"
              style={{ 
                gap: `${8 * SCALE}px`, // gap-2 = 8px -> 28.4px
                marginTop: `${16 * SCALE}px`, // mt-4 = 16px -> 56.8px
              }}
            >
              {['Gratis', 'Onafhankelijk', 'Persoonlijk'].map((feature) => (
                <div 
                  key={feature}
                  className={`flex items-center ${isLightBackground ? 'bg-brand-teal-50 border border-brand-teal-200' : 'bg-white/20 backdrop-blur-sm border border-white/30'}`}
                  style={{
                    gap: `${8 * SCALE}px`, // gap-2 = 8px -> 28.4px
                    paddingLeft: `${12 * SCALE}px`, // px-3 = 12px -> 42.6px
                    paddingRight: `${12 * SCALE}px`, // px-3 = 12px -> 42.6px
                    paddingTop: `${6 * SCALE}px`, // py-1.5 = 6px -> 21.3px
                    paddingBottom: `${6 * SCALE}px`, // py-1.5 = 6px -> 21.3px
                    borderRadius: `${9999 * SCALE}px`, // rounded-full
                    width: 'fit-content',
                  }}
                >
                  <CheckCircle 
                    size={14 * SCALE}
                    weight="fill"
                    className={isLightBackground ? 'text-brand-teal-600' : 'text-white'}
                  />
                  <span 
                    className={`font-medium ${isLightBackground ? 'text-brand-navy-700' : 'text-white'}`}
                    style={{ fontSize: `${12 * SCALE}px` }} // text-xs = 12px -> 42.6px
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section - CTA */}
        <div style={{ marginTop: `${16 * SCALE}px` }}> {/* mt-4 = 16px -> 56.8px */}
          <div 
            className={`inline-flex items-center ${isLightBackground ? 'bg-brand-teal-500 text-white shadow-lg shadow-brand-teal-500/30' : 'bg-white text-brand-navy-500 shadow-lg'}`}
            style={{
              gap: `${8 * SCALE}px`, // gap-2 = 8px -> 28.4px
              paddingLeft: `${20 * SCALE}px`, // px-5 = 20px -> 71px
              paddingRight: `${20 * SCALE}px`, // px-5 = 20px -> 71px
              paddingTop: `${12 * SCALE}px`, // py-3 = 12px -> 42.6px
              paddingBottom: `${12 * SCALE}px`, // py-3 = 12px -> 42.6px
              borderRadius: `${12 * SCALE}px`, // rounded-xl = 12px -> 42.6px
              fontSize: `${16 * SCALE}px`, // text-base = 16px -> 56.8px
              fontWeight: '600',
            }}
          >
            {content.ctaText || 'Bereken je besparing'}
            <CurrencyEur size={18 * SCALE} weight="bold" />
          </div>
        </div>
      </div>
    </div>
  )
}

