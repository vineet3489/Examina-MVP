'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ScoreRingProps {
  score: number
  total: number
  size?: number
  strokeWidth?: number
  className?: string
}

function getScoreColor(percentage: number): string {
  if (percentage >= 70) return '#22c55e'
  if (percentage >= 40) return '#eab308'
  return '#ef4444'
}

export function ScoreRing({
  score,
  total,
  size = 160,
  strokeWidth = 12,
  className,
}: ScoreRingProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0)
  const percentage = Math.round((score / total) * 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedPercent / 100) * circumference
  const color = getScoreColor(percentage)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent(percentage)
    }, 300)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className={`relative inline-flex items-center justify-center ${className ?? ''}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-3xl font-bold"
          style={{ color }}
        >
          {percentage}%
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-sm text-gray-500 font-medium"
        >
          {score}/{total}
        </motion.span>
      </div>
    </div>
  )
}
