import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export function calculatePercentile(score: number, total: number): number {
  const percentage = (score / total) * 100
  // Simplified percentile estimation
  if (percentage >= 90) return 95
  if (percentage >= 80) return 85
  if (percentage >= 70) return 70
  if (percentage >= 60) return 55
  if (percentage >= 50) return 40
  return 25
}
