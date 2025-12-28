import { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 relative',
  {
    variants: {
      variant: {
        primary: 'bg-brand-teal-500 text-white shadow-lg shadow-brand-teal-500/30 hover:shadow-xl hover:shadow-brand-teal-500/40 hover:scale-105 hover:bg-brand-teal-600 focus:ring-brand-teal-500 active:scale-[0.98]',
        secondary: 'bg-brand-navy-500 text-white shadow-lg shadow-brand-navy-500/30 hover:shadow-xl hover:shadow-brand-navy-500/40 hover:scale-105 hover:bg-brand-navy-600 focus:ring-brand-navy-500 active:scale-[0.98]',
        premium: 'bg-brand-purple-500 text-white shadow-lg shadow-brand-purple-500/30 hover:shadow-xl hover:shadow-brand-purple-500/40 hover:scale-105 hover:bg-brand-purple-600 focus:ring-brand-purple-500 active:scale-[0.98]',
        outline: 'border-2 border-brand-navy-500 text-brand-navy-600 hover:bg-brand-navy-50 hover:scale-105 focus:ring-brand-navy-500 active:scale-[0.98]',
        ghost: 'text-gray-700 hover:bg-gray-100 hover:text-brand-navy-600 focus:ring-gray-300 active:scale-[0.98]',
        danger: 'bg-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 hover:bg-red-700 focus:ring-red-500 active:scale-[0.98]',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, disabled, children, ...props }: ButtonProps) {
  const isLoading = disabled && props['aria-busy'] === 'true'
  
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }), isLoading && 'cursor-wait')}
      disabled={disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="opacity-0">{children}</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
