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
      // Wait a bit for any pending renders and images to load
      await new Promise((resolve) => setTimeout(resolve, 500))

      // The element is already at full resolution (1080x1080 or 1080x1920)
      // Just render it with html2canvas at scale 1 for exact export
      const canvas = await html2canvas(elementRef.current, {
        width: width,
        height: height,
        scale: 1, // No scaling - element is already at target size
        useCORS: true,
        logging: false,
        backgroundColor: null,
        allowTaint: false,
        imageTimeout: 15000,
      })

      // Convert to blob
      canvas.toBlob((blob) => {
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
