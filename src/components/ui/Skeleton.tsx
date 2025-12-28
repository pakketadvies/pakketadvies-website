'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, variant = 'rectangular', width, height }: SkeletonProps) {
  const baseClasses = 'animate-skeleton bg-gray-200 rounded'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  )
}

/**
 * Skeleton loader for contract cards
 */
export function ContractCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 animate-fade-in">
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
      </div>
      <Skeleton variant="rectangular" width="100%" height={48} />
    </div>
  )
}

/**
 * Skeleton loader for list items
 */
export function ListItemSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="50%" height={18} />
          <Skeleton variant="text" width="30%" height={14} />
        </div>
      </div>
    </div>
  )
}

