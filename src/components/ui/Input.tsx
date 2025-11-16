'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'w-full px-4 rounded-xl border text-gray-900 placeholder:text-gray-500/50 transition-all duration-150 focus:outline-none focus:ring-3 disabled:bg-gray-50 disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'h-10 text-sm',
        md: 'h-12 md:h-14 text-base',
      },
      state: {
        default: 'border-gray-300 focus:border-brand-teal-500 focus:ring-brand-teal-500/20',
        error: 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
        success: 'border-success-500 focus:border-success-500 focus:ring-success-500/20',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
)

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  helpText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, state, label, error, helpText, ...props }, ref) => {
    const inputState = error ? 'error' : state

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-brand-navy-500"
          >
            {label}
          </label>
        )}
        <input
          className={cn(inputVariants({ size, state: inputState, className }))}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-error-500 flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="text-xs text-gray-500">{helpText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }

