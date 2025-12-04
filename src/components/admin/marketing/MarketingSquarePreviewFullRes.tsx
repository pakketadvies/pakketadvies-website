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

interface MarketingSquarePreviewFullResProps {
  content: MarketingContent
  previewRef?: React.RefObject<HTMLDivElement | null>
}

const iconMap = {
  energy: Lightning,
  savings: CurrencyEur,
  contract: FileText,
  support: Headset,
}

// Scale factor: 500px -> 1080px = 2.16x
const SCALE = 1080 / 500

export function MarketingSquarePreviewFullRes({ content, previewRef }: MarketingSquarePreviewFullResProps) {
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
        return 'bg-gradient-to-br from-brand-navy-500 via-brand-navy-600 to-brand-teal-500'
      case 'gradient-teal-purple':
        return 'bg-gradient-to-br from-brand-teal-500 via-brand-teal-600 to-brand-purple-500'
      default:
        return 'bg-gradient-to-br from-brand-navy-500 to-brand-teal-500'
    }
  }

  const isLightBackground = content.backgroundColor === 'white' || content.backgroundColor === 'teal'
  const textColor = isLightBackground ? 'text-brand-navy-500' : 'text-white'
  const textColorMuted = isLightBackground ? 'text-gray-600' : 'text-gray-200'

  return (
    <div 
      ref={previewRef}
      data-preview-element="square-fullres"
      className={`relative overflow-hidden ${getBackgroundClasses()}`}
      style={{
        width: '1080px',
        height: '1080px',
        borderRadius: '32px', // 16px * 2.16
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent" />
        </>
      )}

      {/* Content - All sizes scaled by 2.16x */}
      <div 
        className="relative h-full flex flex-col justify-between"
        style={{
          padding: `${32 * SCALE}px`, // 8 * 4 = 32px -> 69.12px
        }}
      >
        {/* Top Section - Logo */}
        {content.showLogo && (
          <div 
            className="flex items-start justify-between"
            style={{ marginBottom: `${16 * SCALE}px` }} // 4 * 4 = 16px -> 34.56px
          >
            <div 
              className="relative w-auto"
              style={{ height: `${40 * SCALE}px` }} // 10 * 4 = 40px -> 86.4px
            >
              <Image
                src={isLightBackground ? "/images/logo-dark.png" : "/images/logo-wit.png"}
                alt="PakketAdvies"
                width={180 * SCALE}
                height={40 * SCALE}
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        )}

        {/* Middle Section - Main Content */}
        <div className="flex-1 flex flex-col justify-center" style={{ gap: `${16 * SCALE}px` }}> {/* space-y-4 = 16px -> 34.56px */}
          {/* Icon */}
          {content.showIcons && Icon && (
            <div style={{ marginBottom: `${16 * SCALE}px` }}> {/* mb-4 = 16px -> 34.56px */}
              <div 
                className={`${isLightBackground ? 'bg-brand-teal-50' : 'bg-white/20 backdrop-blur-sm'} flex items-center justify-center border ${isLightBackground ? 'border-brand-teal-200' : 'border-white/30'}`}
                style={{
                  width: `${64 * SCALE}px`, // w-16 = 64px -> 138.24px
                  height: `${64 * SCALE}px`, // h-16 = 64px -> 138.24px
                  borderRadius: `${16 * SCALE}px`, // rounded-2xl = 16px -> 34.56px
                }}
              >
                <Icon 
                  size={32 * SCALE}
                  weight="bold" 
                  className={isLightBackground ? 'text-brand-teal-600' : 'text-white'} 
                />
              </div>
            </div>
          )}

          {/* Headline */}
          <h2 
            className={`font-display font-bold leading-tight ${textColor}`}
            style={{ fontSize: `${36 * SCALE}px` }} // text-4xl = 36px -> 77.76px
          >
            {content.headline}
          </h2>

          {/* Subheadline */}
          {content.subheadline && (
            <h3 
              className={`font-semibold ${textColorMuted}`}
              style={{ fontSize: `${24 * SCALE}px` }} // text-2xl = 24px -> 51.84px
            >
              {content.subheadline}
            </h3>
          )}

          {/* Description */}
          {content.description && (
            <p 
              className={`leading-relaxed ${textColorMuted}`}
              style={{ 
                fontSize: `${18 * SCALE}px`, // text-lg = 18px -> 38.88px
                maxWidth: `${448 * SCALE}px`, // max-w-md = 448px -> 967.68px
              }}
            >
              {content.description}
            </p>
          )}

          {/* Features */}
          {content.showIcons && (
            <div 
              className="flex flex-wrap"
              style={{ 
                gap: `${12 * SCALE}px`, // gap-3 = 12px -> 25.92px
                marginTop: `${16 * SCALE}px`, // mt-4 = 16px -> 34.56px
              }}
            >
              {['Gratis', 'Onafhankelijk', 'Persoonlijk'].map((feature) => (
                <div 
                  key={feature}
                  className={`flex items-center ${isLightBackground ? 'bg-brand-teal-50 border border-brand-teal-200' : 'bg-white/20 backdrop-blur-sm border border-white/30'}`}
                  style={{
                    gap: `${8 * SCALE}px`, // gap-2 = 8px -> 17.28px
                    paddingLeft: `${12 * SCALE}px`, // px-3 = 12px -> 25.92px
                    paddingRight: `${12 * SCALE}px`, // px-3 = 12px -> 25.92px
                    paddingTop: `${6 * SCALE}px`, // py-1.5 = 6px -> 12.96px
                    paddingBottom: `${6 * SCALE}px`, // py-1.5 = 6px -> 12.96px
                    borderRadius: `${9999 * SCALE}px`, // rounded-full
                  }}
                >
                  <CheckCircle 
                    size={16 * SCALE}
                    weight="fill"
                    className={isLightBackground ? 'text-brand-teal-600' : 'text-white'}
                  />
                  <span 
                    className={`font-medium ${isLightBackground ? 'text-brand-navy-700' : 'text-white'}`}
                    style={{ fontSize: `${14 * SCALE}px` }} // text-sm = 14px -> 30.24px
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section - CTA */}
        <div style={{ marginTop: `${24 * SCALE}px` }}> {/* mt-6 = 24px -> 51.84px */}
          <div 
            className={`inline-flex items-center ${isLightBackground ? 'bg-brand-teal-500 text-white shadow-lg shadow-brand-teal-500/30' : 'bg-white text-brand-navy-500 shadow-lg'}`}
            style={{
              gap: `${8 * SCALE}px`, // gap-2 = 8px -> 17.28px
              paddingLeft: `${24 * SCALE}px`, // px-6 = 24px -> 51.84px
              paddingRight: `${24 * SCALE}px`, // px-6 = 24px -> 51.84px
              paddingTop: `${16 * SCALE}px`, // py-4 = 16px -> 34.56px
              paddingBottom: `${16 * SCALE}px`, // py-4 = 16px -> 34.56px
              borderRadius: `${12 * SCALE}px`, // rounded-xl = 12px -> 25.92px
              fontSize: `${18 * SCALE}px`, // text-lg = 18px -> 38.88px
              fontWeight: '600',
            }}
          >
            {content.ctaText || 'Bereken je besparing'}
            <CurrencyEur size={20 * SCALE} weight="bold" />
          </div>
        </div>
      </div>
    </div>
  )
}

