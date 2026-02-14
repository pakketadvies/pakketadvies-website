'use client'

import { PencilSimple } from '@phosphor-icons/react'

interface FloatingEditButtonProps {
  onClick: () => void
}

export default function FloatingEditButton({ onClick }: FloatingEditButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed right-4 z-50 w-14 h-14 bg-brand-teal-500 hover:bg-brand-teal-600 active:scale-95 rounded-full shadow-lg shadow-brand-teal-500/30 flex items-center justify-center transition-all duration-200 animate-bounce-in"
      style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      aria-label="Verbruik en adres aanpassen"
    >
      <PencilSimple weight="duotone" className="w-6 h-6 text-white" />
    </button>
  )
}

