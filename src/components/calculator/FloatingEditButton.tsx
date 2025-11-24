'use client'

import { PencilSimple } from '@phosphor-icons/react'

interface FloatingEditButtonProps {
  onClick: () => void
}

export default function FloatingEditButton({ onClick }: FloatingEditButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-4 z-50 w-14 h-14 bg-brand-purple-500 hover:bg-brand-purple-600 active:scale-95 rounded-full shadow-lg shadow-brand-purple-500/30 flex items-center justify-center transition-all duration-200 animate-bounce-in"
      aria-label="Verbruik en adres aanpassen"
    >
      <PencilSimple weight="duotone" className="w-6 h-6 text-white" />
    </button>
  )
}

