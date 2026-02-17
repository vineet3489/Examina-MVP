'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Trophy,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScoreRing } from '@/components/test/score-ring'
import { formatTime, calculatePercentile, predictSSCSuccess } from '@/lib/utils'

interface SubjectScore {
  score: number
  total: number
  time: number
}

interface DiagnosticResult {
  totalScore: number
  totalQuestions: number
  timeSpent: number
  subjectScores: Record<string, SubjectScore>
  completedAt: string
}

const subjectLabels: Record<string, string> = {
  english: 'English',
  maths: 'Mathematics',
  reasoning: 'Reasoning',
  gk: 'General Knowledge',
}

const subjectIcons: Record<string, string> = {
  english: 'Aa',
  maths: '#',
  reasoning: '?',
  gk: 'GK',
}

function getScoreColor(score: number, total: number): string {
  const pct = (score / total) * 100
  if (pct >= 70) return '#22c55e'
  if (pct >= 40) return '#eab308'
  return '#ef4444'
}

function getScoreBg(score: number, total: number): string {
  const pct = (score / total) * 100
  if (pct >= 70) return 'bg-green-50 border-green-200'
  if (pct >= 40) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}

function getScoreLabel(score: number, total: number): string {
  const pct = (score / total) * 100
  if (pct >= 70) return 'Strong'
  if (pct >= 40) return 'Average'
  return 'Weak'
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
}

export default function DiagnosticResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<DiagnosticResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('diagnosticResult')
    if (stored) {
      setResult(JSON.parse(stored))
    } else {
      router.replace('/tests/diagnostic')
    }
  }, [router])

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#6C5CE7] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { totalScore, totalQuestions, timeSpent, subjectScores } = result
  const percentile = calculatePercentile(totalScore, totalQuestions)

  const strengths = Object.entries(subjectScores).filter(
    ([, s]) => (s.score / s.total) * 100 >= 60
  )
  const weaknesses = Object.entries(subjectScores).filter(
    ([, s]) => (s.score / s.total) * 100 < 60
  )

  const handleGeneratePlan = async () => {
    setIsGenerating(true)

    // Store diagnostic data for the study plan generator
    localStorage.setItem(
      'studyPlanInput',
      JSON.stringify({
        subjectScores,
        totalScore,
        totalQuestions,
        percentile,
      })
    )

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="gradient-primary px-4 pt-6 pb-10 text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-xl font-bold mb-1">Diagnostic Complete!</h1>
          <p className="text-sm text-white/80">Here&apos;s how you performed</p>
        </motion.div>
      </div>

      {/* Score ring - overlapping header */}
      <div className="-mt-8 flex justify-center mb-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="bg-white rounded-2xl shadow-lg p-5"
        >
          <ScoreRing score={totalScore} total={totalQuestions} size={150} strokeWidth={12} />
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 space-y-5"
      >
        {/* Quick stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <Card className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C5CE7]/10 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-[#6C5CE7]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Correct</p>
              <p className="text-lg font-bold text-gray-900">{totalScore}/{totalQuestions}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Time Taken</p>
              <p className="text-lg font-bold text-gray-900">{formatTime(timeSpent)}</p>
            </div>
          </Card>
        </motion.div>

        {/* Subject breakdown */}
        <motion.div variants={itemVariants}>
          <h2 className="text-base font-bold text-gray-900 mb-3">Subject Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(subjectScores).map(([subject, data], index) => {
              const pct = Math.round((data.score / data.total) * 100)
              const color = getScoreColor(data.score, data.total)
              const bgClass = getScoreBg(data.score, data.total)
              const label = getScoreLabel(data.score, data.total)

              return (
                <motion.div
                  key={subject}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card className={`border ${bgClass} p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                          style={{ backgroundColor: color }}
                        >
                          {subjectIcons[subject] || subject[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {subjectLabels[subject] || subject}
                          </p>
                          <p className="text-xs text-gray-500">
                            {data.score}/{data.total} correct &middot; {formatTime(data.time)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold" style={{ color }}>
                          {pct}%
                        </p>
                        <p className="text-xs font-medium" style={{ color }}>
                          {label}
                        </p>
                      </div>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-3 h-1.5 w-full rounded-full bg-white/60 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} className="text-green-500" />
              <h2 className="text-base font-bold text-gray-900">Strengths</h2>
            </div>
            <Card className="border border-green-200 bg-green-50 p-4">
              <div className="space-y-2">
                {strengths.map(([subject, data]) => (
                  <div key={subject} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">
                      {subjectLabels[subject] || subject}
                    </span>
                    <span className="text-xs text-green-600 ml-auto font-semibold">
                      {Math.round((data.score / data.total) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Needs Improvement */}
        {weaknesses.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-500" />
              <h2 className="text-base font-bold text-gray-900">Needs Improvement</h2>
            </div>
            <Card className="border border-amber-200 bg-amber-50 p-4">
              <div className="space-y-2">
                {weaknesses.map(([subject, data]) => (
                  <div key={subject} className="flex items-center gap-2">
                    <XCircle size={16} className="text-amber-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">
                      {subjectLabels[subject] || subject}
                    </span>
                    <span className="text-xs text-amber-600 ml-auto font-semibold">
                      {Math.round((data.score / data.total) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Success Predictor */}
        <motion.div variants={itemVariants}>
          {(() => {
            const prediction = predictSSCSuccess(totalScore, totalQuestions, subjectScores)
            return (
              <Card className="border-2" style={{ borderColor: prediction.color + '30' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: prediction.color + '15' }}>
                    <TrendingUp size={20} style={{ color: prediction.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">SSC CGL Success Prediction</h3>
                    <p className="text-xs font-medium" style={{ color: prediction.color }}>{prediction.likelihood} Chance &middot; ~{percentile}th percentile</p>
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${prediction.percentage}%`, backgroundColor: prediction.color }} />
                </div>
                <p className="text-xs text-gray-500">{prediction.message}</p>
              </Card>
            )
          })()}
        </motion.div>

        {/* Generate Study Plan CTA */}
        <motion.div variants={itemVariants} className="pb-6">
          <Button
            size="lg"
            onClick={handleGeneratePlan}
            loading={isGenerating}
            className="w-full"
          >
            <BookOpen size={18} className="mr-2" />
            Generate My Study Plan
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
