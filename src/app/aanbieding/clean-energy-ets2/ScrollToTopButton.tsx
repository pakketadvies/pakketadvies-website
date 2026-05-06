'use client'

import { ArrowRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'

export function ScrollToTopButton() {
  return (
    <Button
      size="lg"
      variant="primary"
      className="bg-brand-teal-500 hover:bg-brand-teal-600 text-white"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
    >
      Scroll naar boven
      <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
    </Button>
  )
}
