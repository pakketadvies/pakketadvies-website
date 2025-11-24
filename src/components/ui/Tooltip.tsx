'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  className?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  title?: string
}

export default function Tooltip({ content, children, className, position = 'bottom', title }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsMobileOpen(false)
        setIsVisible(false)
      }
    }

    if (isMobileOpen || isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
      }
    }
  }, [isMobileOpen, isVisible])

  // Prevent body scroll when mobile tooltip is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false)
        setIsVisible(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <>
      <div className={cn('relative inline-flex', className)}>
        {/* Trigger */}
        <div
          ref={triggerRef}
          className="inline-flex items-center"
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {children}
        </div>

        {/* Desktop Tooltip - Centered modal style */}
        {isVisible && (
          <div
            className="fixed inset-0 z-50 hidden lg:flex items-center justify-center pointer-events-none"
            onClick={() => setIsVisible(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
            
            {/* Modal - Better centered and sized */}
            <div
              ref={tooltipRef}
              className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-6 p-6 pointer-events-auto animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors z-10"
                aria-label="Sluiten"
              >
                <X weight="bold" className="w-5 h-5 text-gray-500" />
              </button>

              {/* Content */}
              {title && (
                <h3 className="text-xl font-bold text-brand-navy-500 mb-5 pr-10">{title}</h3>
              )}
              <div className="max-h-[75vh] overflow-y-auto scrollbar-thin pr-1">
                {content}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Modal - Fullscreen overlay */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Fullscreen Modal */}
          <div
            ref={tooltipRef}
            className="fixed inset-0 z-50 lg:hidden bg-white flex flex-col animate-fade-in"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
              {title && (
                <h3 className="text-xl font-bold text-brand-navy-500">{title}</h3>
              )}
              {!title && <div />}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                aria-label="Sluiten"
              >
                <X weight="bold" className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
              {content}
            </div>
          </div>
        </>
      )}
    </>
  )
}
