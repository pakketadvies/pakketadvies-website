'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/service-worker'

export function PWARegistration() {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return null
}

