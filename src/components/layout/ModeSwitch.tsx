'use client'

import { useMode } from '@/context/ModeContext'
import { usePathname, useRouter } from 'next/navigation'

export function ModeSwitch() {
  const { mode, setMode } = useMode()
  const router = useRouter()
  const pathname = usePathname()

  const handleModeChange = (newMode: 'zakelijk' | 'particulier') => {
    setMode(newMode)
    
    // Navigate appropriately based on mode
    if (newMode === 'particulier') {
      // If already on particulier route, stay there
      if (!pathname?.startsWith('/particulier')) {
        router.push('/particulier/vergelijken')
      }
    } else {
      // If on particulier route, go to homepage
      if (pathname?.startsWith('/particulier')) {
        router.push('/')
      }
    }
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
      <button
        onClick={() => handleModeChange('zakelijk')}
        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
          mode === 'zakelijk'
            ? 'bg-brand-teal-500 text-white shadow-md'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
        }`}
        aria-pressed={mode === 'zakelijk'}
      >
        Zakelijk
      </button>
      <button
        onClick={() => handleModeChange('particulier')}
        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
          mode === 'particulier'
            ? 'bg-brand-teal-500 text-white shadow-md'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
        }`}
        aria-pressed={mode === 'particulier'}
      >
        Particulier
      </button>
    </div>
  )
}

