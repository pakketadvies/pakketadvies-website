'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    fbq: (
      action: string,
      event: string,
      data?: Record<string, any>
    ) => void
    _fbq: typeof window.fbq
  }
}

interface FacebookPixelProps {
  pixelId: string
}

export function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Track page view on route change
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        window.fbq('track', 'PageView')
      } catch (error) {
        console.error('Facebook Pixel tracking error:', error)
      }
    }
  }, [pathname])

  if (!pixelId || !pixelId.trim()) {
    return null
  }

  // Escape pixelId to prevent XSS
  const safePixelId = pixelId.replace(/[^0-9]/g, '')

  if (!safePixelId) {
    console.error('Invalid Facebook Pixel ID:', pixelId)
    return null
  }

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        onError={(e) => {
          console.error('Facebook Pixel script error:', e)
        }}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s){
              if(f.fbq)return;
              n=f.fbq=function(){
                n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)
              };
              if(!f._fbq)f._fbq=n;
              n.push=n;
              n.loaded=!0;
              n.version='2.0';
              n.queue=[];
              t=b.createElement(e);
              t.async=!0;
              t.src=v;
              s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)
            }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${safePixelId}');
            fbq('track','PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${safePixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

