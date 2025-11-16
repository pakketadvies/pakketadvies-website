import { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'flex gap-3 p-4 rounded-xl border',
  {
    variants: {
      variant: {
        info: 'bg-brand-teal-50 border-brand-teal-500/20',
        success: 'bg-success-50 border-success-500/20',
        warning: 'bg-warning-50 border-warning-500/20',
        error: 'bg-error-50 border-error-500/20',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
}

function Alert({ className, variant, title, children, ...props }: AlertProps) {
  const iconColor = {
    info: 'text-brand-teal-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    error: 'text-error-500',
  }[variant || 'info']

  const textColor = {
    info: 'text-brand-navy-500',
    success: 'text-success-700',
    warning: 'text-warning-700',
    error: 'text-error-700',
  }[variant || 'info']

  return (
    <div className={cn(alertVariants({ variant }), className)} {...props}>
      <svg
        className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColor)}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {variant === 'success' && (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        )}
        {variant === 'error' && (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        )}
        {variant === 'warning' && (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        )}
        {variant === 'info' && (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        )}
      </svg>
      <div className="flex-1">
        {title && <p className={cn('text-sm font-medium mb-1', textColor)}>{title}</p>}
        <div className="text-sm text-gray-700">{children}</div>
      </div>
    </div>
  )
}

export { Alert, alertVariants }

