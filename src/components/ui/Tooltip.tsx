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
      }
    }

    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
      }
    }
  }, [isMobileOpen])

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

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-b-transparent border-t-brand-teal-200',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-t-transparent border-b-brand-teal-200',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-t-transparent border-b-transparent border-r-transparent border-l-brand-teal-200',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-t-transparent border-b-transparent border-l-transparent border-r-brand-teal-200',
  }

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

        {/* Desktop Tooltip (hover) */}
        <div
          className={cn(
            'absolute z-50 hidden lg:block pointer-events-none transition-opacity duration-200',
            positionClasses[position],
            isVisible ? 'opacity-100' : 'opacity-0'
          )}
        >
        <div className="bg-white border-2 border-brand-teal-200 rounded-xl shadow-xl max-w-sm p-4">
          <div className="relative">
            {/* Arrow */}
            <div className={cn('absolute w-0 h-0 border-4', arrowClasses[position])} />
            {content}
          </div>
        </div>
        </div>
      </div>

      {/* Mobile Modal (tap/click) */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Modal */}
          <div
            ref={tooltipRef}
            className="fixed z-50 lg:hidden bottom-0 left-0 right-0 bg-white border-t-2 border-brand-teal-200 rounded-t-2xl shadow-2xl animate-slide-up max-h-[75vh] overflow-y-auto"
          >
            {/* Header */}
            {title && (
              <div className="sticky top-0 bg-brand-teal-50 border-b-2 border-brand-teal-200 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="font-bold text-brand-navy-500 text-base">{title}</h3>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/80 active:bg-white transition-colors"
                  aria-label="Sluiten"
                >
                  <X weight="bold" className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
            {!title && (
              <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-end border-b border-gray-200 z-10">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  aria-label="Sluiten"
                >
                  <X weight="bold" className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
            {/* Content */}
            <div className="p-6">
              {content}
            </div>
          </div>
        </>
      )}
    </>
  )
}

