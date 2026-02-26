'use client'

import { useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { lockBodyScroll } from '@/lib/scroll-lock'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent background scroll while modal is open
  useEffect(() => {
    if (!isOpen) return
    return lockBodyScroll()
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  // Render via portal to document.body to ensure it's above everything
  const modalContent = typeof window !== 'undefined' ? createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* Modal - Bottom sheet on mobile, centered on desktop */}
      <div
        className={cn(
          'relative bg-white rounded-t-2xl md:rounded-2xl lg:rounded-3xl shadow-2xl w-full md:w-auto',
          sizeClasses[size],
          'max-h-[90vh] md:max-h-[90vh] overflow-y-auto overflow-x-hidden',
          'animate-slide-up md:animate-scale-in'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl md:rounded-t-2xl lg:rounded-t-3xl z-10">
            {title && (
              <h2 className="text-xl md:text-2xl font-bold text-brand-navy-500">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Sluiten"
              >
                <X weight="bold" className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  ) : null

  return modalContent
}

