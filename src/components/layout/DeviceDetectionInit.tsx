'use client'

import { useEffect } from 'react'
import { initDeviceDetection } from '@/lib/device-detection'

/**
 * Initialize device detection on client-side
 * Adds classes to document root for CSS-based progressive enhancement
 */
export function DeviceDetectionInit() {
  useEffect(() => {
    initDeviceDetection()
  }, [])

  return null
}

