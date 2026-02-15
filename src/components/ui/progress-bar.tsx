import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max: number
  className?: string
  color?: string
}

export function ProgressBar({ value, max, className, color = '#6C5CE7' }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  return (
    <div className={cn('h-2 w-full rounded-full bg-gray-100 overflow-hidden', className)}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  )
}
