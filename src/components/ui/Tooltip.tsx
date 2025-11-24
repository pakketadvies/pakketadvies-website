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
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  }

  const arrowClasses = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-b-transparent border-t-white',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-t-transparent border-b-white',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-t-transparent border-b-transparent border-r-transparent border-l-white',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-t-transparent border-b-transparent border-l-transparent border-r-white',
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

        {/* Desktop Tooltip (hover) - Elegant and minimal */}
        <div
          className={cn(
            'absolute z-50 hidden lg:block pointer-events-none transition-all duration-200',
            positionClasses[position],
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
          )}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm p-5">
            <div className="relative">
              {/* Arrow */}
              <div className={cn('absolute w-0 h-0 border-[7px] pointer-events-none z-10', arrowClasses[position])} />
              {content}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Modal - Elegant bottom sheet */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Modal */}
          <div
            ref={tooltipRef}
            className="fixed z-50 lg:hidden bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Drag handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
            
            {/* Header */}
            {title && (
              <div className="px-6 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-brand-navy-500">{title}</h3>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    aria-label="Sluiten"
                  >
                    <X weight="bold" className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
              {content}
            </div>
          </div>
        </>
      )}
    </>
  )
}
