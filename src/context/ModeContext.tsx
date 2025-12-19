'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export type Mode = 'zakelijk' | 'particulier'

interface ModeContextType {
  mode: Mode
  setMode: (mode: Mode) => void
  toggleMode: () => void
}

const ModeContext = createContext<ModeContextType | undefined>(undefined)

const MODE_STORAGE_KEY = 'pakketadvies-mode'
const DEFAULT_MODE: Mode = 'zakelijk'

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(DEFAULT_MODE)
  const [isInitialized, setIsInitialized] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Initialize mode from pathname, localStorage, or default
  useEffect(() => {
    if (isInitialized) return

    // Check if we're on a particulier route
    if (pathname?.startsWith('/particulier')) {
      setModeState('particulier')
      if (typeof window !== 'undefined') {
        localStorage.setItem(MODE_STORAGE_KEY, 'particulier')
      }
      setIsInitialized(true)
      return
    }

    // Check localStorage
    if (typeof window !== 'undefined') {
      const storedMode = localStorage.getItem(MODE_STORAGE_KEY) as Mode | null
      if (storedMode === 'zakelijk' || storedMode === 'particulier') {
        setModeState(storedMode)
        setIsInitialized(true)
        return
      }
    }

    // Default to zakelijk
    setModeState(DEFAULT_MODE)
    setIsInitialized(true)
  }, [pathname, isInitialized])

  // Update localStorage when mode changes
  useEffect(() => {
    if (!isInitialized) return

    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(MODE_STORAGE_KEY, mode)
    }
  }, [mode, isInitialized])

  const setMode = (newMode: Mode) => {
    setModeState(newMode)
    if (typeof window !== 'undefined') {
      localStorage.setItem(MODE_STORAGE_KEY, newMode)
    }
  }

  const toggleMode = () => {
    const newMode = mode === 'zakelijk' ? 'particulier' : 'zakelijk'
    setMode(newMode)
    
    // Navigate appropriately
    if (newMode === 'particulier') {
      router.push('/particulier/vergelijken')
    } else {
      router.push('/')
    }
  }

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  const context = useContext(ModeContext)
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider')
  }
  return context
}

