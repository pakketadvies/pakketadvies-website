'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ModeSwitchProps {
  compact?: boolean
}

export function ModeSwitch({ compact = false }: ModeSwitchProps) {
  const [mode, setModeState] = useState<'zakelijk' | 'particulier'>('zakelijk')
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    // Initialize from pathname or localStorage
    if (pathname?.startsWith('/particulier')) {
      setModeState('particulier')
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pakketadvies-mode') as 'zakelijk' | 'particulier' | null
      if (stored === 'particulier' || stored === 'zakelijk') {
        setModeState(stored)
      }
    }
  }, [pathname])

  const setMode = (newMode: 'zakelijk' | 'particulier') => {
    setModeState(newMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pakketadvies-mode', newMode)
    }
    if (newMode === 'particulier') {
      if (!pathname?.startsWith('/particulier')) {
        router.push('/particulier')
      }
    } else {
      if (pathname?.startsWith('/particulier')) {
        router.push('/')
      }
    }
  }

  return (
    <div className={cn(
      'flex items-center rounded-xl bg-gray-100 p-1',
      compact ? 'gap-0.5' : 'gap-1'
    )}>
      <button
        onClick={() => setMode('zakelijk')}
        className={cn(
          'rounded-lg font-semibold transition-all duration-200',
          mode === 'zakelijk'
            ? 'bg-brand-teal-500 text-white shadow-md'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200',
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'
        )}
        aria-label="Zakelijk"
        aria-pressed={mode === 'zakelijk'}
      >
        Zakelijk
      </button>
      <button
        onClick={() => setMode('particulier')}
        className={cn(
          'rounded-lg font-semibold transition-all duration-200',
          mode === 'particulier'
            ? 'bg-brand-teal-500 text-white shadow-md'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200',
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'
        )}
        aria-label="Particulier"
        aria-pressed={mode === 'particulier'}
      >
        Particulier
      </button>
    </div>
  )
}

