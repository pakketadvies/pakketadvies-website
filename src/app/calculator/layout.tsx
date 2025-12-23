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
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Calculator Content */}
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
    </div>
  )
}