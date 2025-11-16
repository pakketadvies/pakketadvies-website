import { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
  {
    variants: {
      variant: {
        success: 'bg-brand-teal-50 text-teal-700',
        warning: 'bg-warning-50 text-warning-700',
        error: 'bg-error-50 text-error-700',
        info: 'bg-brand-teal-50 text-brand-teal-500',
        neutral: 'bg-gray-50 text-gray-500',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

