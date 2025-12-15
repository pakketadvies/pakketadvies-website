'use client'

import type { Metadata } from 'next'
import { ReactNode } from 'react'

// Note: Metadata must be in a separate layout.tsx file for client components
// This is handled in the parent layout

export default function CalculatorLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const isResultatenPage = pathname?.includes('/resultaten')
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Calculator Content */}
      <main className="flex-grow bg-gray-50 pt-24 pb-12 md:pt-28 md:pb-16">
        {children}
      </main>
    </div>
  )
}