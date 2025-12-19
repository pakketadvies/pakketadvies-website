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
    // Always sync with pathname first
    if (pathname?.startsWith('/particulier')) {
      setModeState('particulier')
      if (typeof window !== 'undefined') {
        localStorage.setItem('pakketadvies-mode', 'particulier')
      }
    } else {
      setModeState('zakelijk')
      if (typeof window !== 'undefined') {
        localStorage.setItem('pakketadvies-mode', 'zakelijk')
      }
    }
  }, [pathname])

  const setMode = (newMode: 'zakelijk' | 'particulier') => {
    setModeState(newMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pakketadvies-mode', newMode)
    }
    
    // Navigate immediately
    if (newMode === 'particulier') {
      router.push('/particulier')
    } else {
      router.push('/')
    }
  }

  return (
    <div className={cn(
      'flex items-center rounded-lg bg-gray-100 p-0.5',
      compact ? 'gap-0' : 'gap-0'
    )}>
      <button
        onClick={() => setMode('zakelijk')}
        className={cn(
          'rounded-md font-medium transition-all duration-200 text-xs',
          mode === 'zakelijk'
            ? 'bg-brand-teal-500 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200',
          compact ? 'px-2 py-1' : 'px-2.5 py-1.5'
        )}
        aria-label="Zakelijk"
        aria-pressed={mode === 'zakelijk'}
      >
        Zakelijk
      </button>
      <button
        onClick={() => setMode('particulier')}
        className={cn(
          'rounded-md font-medium transition-all duration-200 text-xs',
          mode === 'particulier'
            ? 'bg-brand-teal-500 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200',
          compact ? 'px-2 py-1' : 'px-2.5 py-1.5'
        )}
        aria-label="Particulier"
        aria-pressed={mode === 'particulier'}
      >
        Particulier
      </button>
    </div>
  )
}

