'use client'

import { useRef, useCallback } from 'react'
import html2canvas from 'html2canvas'

interface UseDownloadImageOptions {
  width: number
  height: number
  filename: string
}

export function useDownloadImage({ width, height, filename }: UseDownloadImageOptions) {
  const elementRef = useRef<HTMLDivElement>(null)

  const downloadImage = useCallback(async () => {
    if (!elementRef.current) return

    try {
      // Wait a bit for any pending renders
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Get current element dimensions
      const rect = elementRef.current.getBoundingClientRect()
      
      // Calculate the scale needed to get to target resolution
      // Use high scale for quality, then resize to exact dimensions
      const scaleFactor = Math.max(width / rect.width, height / rect.height) * 2 // 2x for quality
      
      // Render with high scale
      const canvas = await html2canvas(elementRef.current, {
        scale: scaleFactor,
        useCORS: true,
        logging: false,
        backgroundColor: null,
        allowTaint: false,
        imageTimeout: 15000,
      })

      // Create final canvas at exact target dimensions
      const finalCanvas = document.createElement('canvas')
      finalCanvas.width = width
      finalCanvas.height = height
      const ctx = finalCanvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      // Use high quality image rendering
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // Draw the scaled canvas onto the final canvas at exact dimensions
      ctx.drawImage(canvas, 0, 0, width, height)

      // Convert to blob
      finalCanvas.toBlob((blob) => {
        if (!blob) {
          alert('Er is een fout opgetreden bij het genereren van de afbeelding.')
          return
        }

        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 'image/png', 1.0) // Highest quality
    } catch (error) {
      console.error('Error downloading image:', error)
      alert('Er is een fout opgetreden bij het downloaden. Probeer het opnieuw.')
    }
  }, [width, height, filename])

  return { elementRef, downloadImage }
}
