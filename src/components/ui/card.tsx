import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'gradient'
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-4',
        {
          'bg-white border border-gray-100': variant === 'default',
          'bg-white shadow-lg shadow-gray-100/50': variant === 'elevated',
          'bg-gradient-to-br from-[#6C5CE7] to-[#a855f7] text-white': variant === 'gradient',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
