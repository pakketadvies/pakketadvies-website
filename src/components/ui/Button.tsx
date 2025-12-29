import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 relative',
  {
    variants: {
      variant: {
        primary: 'bg-brand-teal-500 text-white shadow-lg shadow-brand-teal-500/30 hover:shadow-xl hover:shadow-brand-teal-500/40 hover:scale-105 hover:bg-brand-teal-600 focus:ring-brand-teal-500',
        secondary: 'bg-brand-navy-500 text-white shadow-lg shadow-brand-navy-500/30 hover:shadow-xl hover:shadow-brand-navy-500/40 hover:scale-105 hover:bg-brand-navy-600 focus:ring-brand-navy-500',
        premium: 'bg-brand-purple-500 text-white shadow-lg shadow-brand-purple-500/30 hover:shadow-xl hover:shadow-brand-purple-500/40 hover:scale-105 hover:bg-brand-purple-600 focus:ring-brand-purple-500',
        outline: 'border-2 border-brand-navy-500 text-brand-navy-600 hover:bg-brand-navy-50 hover:scale-105 focus:ring-brand-navy-500',
        ghost: 'text-gray-700 hover:bg-gray-100 hover:text-brand-navy-600 focus:ring-gray-300',
        danger: 'bg-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 hover:bg-red-700 focus:ring-red-500',
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
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  loadingText?: string
}

export function Button({ 
  className, 
  variant, 
  size, 
  loading = false,
  loadingText,
  children,
  disabled,
  ...props 
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'}>
        {loading && loadingText ? loadingText : children}
      </span>
      {loading && !loadingText && (
        <span className="absolute opacity-100 transition-opacity duration-200">
          {children}
        </span>
      )}
    </button>
  )
}
