import { InputHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'w-full rounded-md border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      inputSize: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-5 py-3 text-base',
      },
      state: {
        default: 'border-gray-300 focus:border-brand-teal-500 focus:ring-brand-teal-500 bg-white',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50',
        success: 'border-brand-teal-500 focus:border-brand-teal-500 focus:ring-brand-teal-500 bg-white',
      },
    },
    defaultVariants: {
      inputSize: 'md',
      state: 'default',
    },
  }
)

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  helpText?: string
}

export function Input({
  className,
  inputSize,
  state,
  label,
  error,
  helpText,
  ...props
}: InputProps) {
  const finalState = error ? 'error' : state

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-gray-900">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={cn(inputVariants({ inputSize, state: finalState, className }))}
        {...props}
      />
      {error && (
        <p className="text-sm font-medium text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="text-sm text-gray-600">{helpText}</p>
      )}
    </div>
  )
}
