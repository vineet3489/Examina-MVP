'use client'

import { useEffect, useState, useCallback } from 'react'
import { Clock } from 'lucide-react'
import { formatTime } from '@/lib/utils'

interface TimerProps {
  isRunning: boolean
  onTick?: (seconds: number) => void
  className?: string
}

export function Timer({ isRunning, onTick, className }: TimerProps) {
  const [seconds, setSeconds] = useState(0)

  const handleTick = useCallback((s: number) => {
    onTick?.(s)
  }, [onTick])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1
        handleTick(next)
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, handleTick])

  return (
    <div className={`flex items-center gap-1.5 text-sm font-medium text-gray-500 ${className ?? ''}`}>
      <Clock size={16} />
      <span>{formatTime(seconds)}</span>
    </div>
  )
}
