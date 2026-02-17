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

export interface SuccessPrediction {
  likelihood: 'High' | 'Moderate' | 'Low' | 'Needs Work'
  percentage: number
  message: string
  color: string
}

export function predictSSCSuccess(
  score: number,
  total: number,
  sectionScores?: Record<string, { score: number; total: number }>
): SuccessPrediction {
  const pct = (score / total) * 100

  let hasWeakSection = false
  if (sectionScores) {
    hasWeakSection = Object.values(sectionScores).some(
      (s) => s.total > 0 && (s.score / s.total) * 100 < 40
    )
  }

  if (pct >= 80 && !hasWeakSection) {
    return {
      likelihood: 'High',
      percentage: 85,
      message: 'You are performing at a competitive level. Keep practicing to maintain consistency.',
      color: '#22c55e',
    }
  }
  if (pct >= 65) {
    return {
      likelihood: 'Moderate',
      percentage: 60,
      message: 'Good foundation! Focus on your weak areas to improve your chances significantly.',
      color: '#eab308',
    }
  }
  if (pct >= 45) {
    return {
      likelihood: 'Low',
      percentage: 35,
      message: 'You need more practice. Use flashcards and AI tutor to strengthen concepts.',
      color: '#f97316',
    }
  }
  return {
    likelihood: 'Needs Work',
    percentage: 15,
    message: 'Start with the basics. Use flashcards and AI tutor to build your fundamentals.',
    color: '#ef4444',
  }
}
