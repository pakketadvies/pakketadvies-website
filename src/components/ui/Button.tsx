import { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-brand-navy-500 to-brand-navy-600 text-white shadow-lg shadow-brand-navy-500/30 hover:shadow-xl hover:shadow-brand-navy-500/40 hover:scale-105 focus:ring-brand-navy-500',
        secondary: 'bg-gradient-to-r from-brand-teal-500 to-brand-teal-600 text-white shadow-lg shadow-brand-teal-500/30 hover:shadow-xl hover:shadow-brand-teal-500/40 hover:scale-105 focus:ring-brand-teal-500',
        outline: 'border-2 border-brand-navy-500 text-brand-navy-600 hover:bg-brand-navy-50 hover:scale-105 focus:ring-brand-navy-500',
        ghost: 'text-gray-700 hover:bg-gray-100 hover:text-brand-navy-600 focus:ring-gray-300',
        danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 focus:ring-red-500',
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

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
