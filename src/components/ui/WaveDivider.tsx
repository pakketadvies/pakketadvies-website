'use client'

type WaveDividerVariant = 'hero' | 'heroLow' | 'simple'

export function WaveDivider({ variant = 'hero' }: { variant?: WaveDividerVariant }) {
  if (variant === 'simple') {
    return (
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-20 md:h-24 lg:h-auto"
          preserveAspectRatio="none"
        >
          <path d="M0,95 Q360,65 720,95 T1440,95 L1440,120 L0,120 Z" fill="white" />
        </svg>
      </div>
    )
  }

  if (variant === 'heroLow') {
    // Lower wave so it never overlaps content/cards in hero sections that contain forms.
    return (
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden z-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-24 md:h-28 lg:h-auto"
          preserveAspectRatio="none"
        >
          {/* Main white background (lower crest) */}
          <path d="M0,98 Q360,90 720,98 T1440,98 L1440,120 L0,120 Z" fill="white" />

          {/* Subtle teal accent line */}
          <path
            d="M0,98 Q360,90 720,98 T1440,98"
            stroke="url(#energyGradientLow)"
            strokeWidth="2"
            fill="none"
            opacity="0.35"
          />

          <defs>
            <linearGradient id="energyGradientLow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00AF9B" stopOpacity="0" />
              <stop offset="20%" stopColor="#00AF9B" stopOpacity="1" />
              <stop offset="50%" stopColor="#00AF9B" stopOpacity="1" />
              <stop offset="80%" stopColor="#00AF9B" stopOpacity="1" />
              <stop offset="100%" stopColor="#00AF9B" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    )
  }

  // Default: Hero wave with teal accent line (matches `src/components/sections/Hero.tsx` styling)
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden z-0">
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-20 md:h-24 lg:h-auto"
        preserveAspectRatio="none"
      >
        {/* Main white background */}
        <path d="M0,40 Q360,10 720,40 T1440,40 L1440,120 L0,120 Z" fill="white" />

        {/* Subtle teal energy accent line */}
        <path
          d="M0,40 Q360,10 720,40 T1440,40"
          stroke="url(#energyGradient)"
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        />

        <defs>
          <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00AF9B" stopOpacity="0" />
            <stop offset="20%" stopColor="#00AF9B" stopOpacity="1" />
            <stop offset="50%" stopColor="#00AF9B" stopOpacity="1" />
            <stop offset="80%" stopColor="#00AF9B" stopOpacity="1" />
            <stop offset="100%" stopColor="#00AF9B" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}


