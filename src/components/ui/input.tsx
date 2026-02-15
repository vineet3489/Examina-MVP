'use client'
import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6C5CE7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 transition-all',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
export { Input }
