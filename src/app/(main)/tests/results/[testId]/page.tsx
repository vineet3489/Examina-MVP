'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  RotateCcw,
  ArrowLeft,
  TrendingUp,
  Target,
  BookOpen,
  MessageCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { ScoreRing } from '@/components/test/score-ring'
import { formatTime, calculatePercentile, predictSSCSuccess } from '@/lib/utils'

interface SectionScore {
  score: number
  total: number
  time: number
}

interface SavedQuestion {
  id: string
  subject: string
  topic: string
  question_text: string
  options: string[]
  correct_answer: number
  explanation: string
}

interface TestResult {
  testId: string
  score: number
  total: number
  timeTaken: number
  sectionScores: Record<string, SectionScore>
  answers: [number, number][]
  questions: SavedQuestion[]
  completedAt: string
}

const subjectLabels: Record<string, string> = {
  english: 'English',
  maths: 'Mathematics',
  reasoning: 'Reasoning',
  gk: 'General Knowledge',
}

const subjectColors: Record<string, string> = {
  english: '#6C5CE7',
  maths: '#4A90D9',
  reasoning: '#E84393',
  gk: '#00B894',
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function TestResultsPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.testId as string

  const [result, setResult] = useState<TestResult | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(`examina_test_result_${testId}`)
    if (saved) {
      try {
        setResult(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
  }, [testId])

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-gray-500">No results found for this test.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/tests')}>
          Back to Tests
        </Button>
      </div>
    )
  }

  const percentage = Math.round((result.score / result.total) * 100)
  const percentile = calculatePercentile(result.score, result.total)
  const answersMap = new Map(result.answers)

  return (
    <motion.div
      className="px-4 pt-12 pb-24 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <button
          onClick={() => router.push('/tests')}
          className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Tests
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
      </motion.div>

      {/* Score Ring */}
      <motion.div variants={item} className="flex justify-center">
        <ScoreRing score={result.score} total={result.total} size={180} strokeWidth={14} />
      </motion.div>

      {/* Overall Stats */}
      <motion.div variants={item}>
        <Card variant="elevated" className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {result.score}/{result.total}{' '}
            <span className="text-base font-medium text-gray-500">({percentage}%)</span>
          </p>
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Clock size={16} className="text-gray-400" />
              <span>Time: {formatTime(result.timeTaken)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <TrendingUp size={16} className="text-[#6C5CE7]" />
              <span className="font-medium text-[#6C5CE7]">
                {percentile}th percentile
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Success Predictor */}
      <motion.div variants={item}>
        {(() => {
          const prediction = predictSSCSuccess(result.score, result.total, result.sectionScores)
          return (
            <Card className="border-2" style={{ borderColor: prediction.color + '30' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: prediction.color + '15' }}>
                  <Target size={20} style={{ color: prediction.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">SSC CGL Success Prediction</h3>
                  <p className="text-xs font-medium" style={{ color: prediction.color }}>{prediction.likelihood} Chance</p>
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

      {/* Section-wise Breakdown */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-gray-900 mb-3">Section-wise Breakdown</h2>
        <div className="space-y-3">
          {Object.entries(result.sectionScores).map(([subject, section]) => {
            const sectionPct = section.total > 0 ? Math.round((section.score / section.total) * 100) : 0
            const color = subjectColors[subject] || '#6C5CE7'

            return (
              <Card key={subject}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {subjectLabels[subject] || subject}
                  </h3>
                  <Badge
                    variant={sectionPct >= 70 ? 'success' : sectionPct >= 40 ? 'warning' : 'error'}
                  >
                    {sectionPct}%
                  </Badge>
                </div>
                <ProgressBar value={section.score} max={section.total} color={color} />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>
                    {section.score}/{section.total} correct
                  </span>
                  <span>{formatTime(section.time)}</span>
                </div>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* Questions Review */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-gray-900 mb-3">Questions Review</h2>
        <div className="space-y-2">
          {result.questions.map((question, qIdx) => {
            const userAnswer = answersMap.get(qIdx)
            const isCorrect = userAnswer === question.correct_answer
            const isUnanswered = userAnswer === undefined
            const isExpanded = expandedQuestion === qIdx

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: qIdx * 0.02 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    isExpanded ? 'ring-1 ring-gray-200' : ''
                  }`}
                  onClick={() => setExpandedQuestion(isExpanded ? null : qIdx)}
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      {isCorrect ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : (
                        <XCircle
                          size={20}
                          className={isUnanswered ? 'text-gray-300' : 'text-red-500'}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        Q{qIdx + 1}. {question.question_text}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {subjectLabels[question.subject] || question.subject} - {question.topic}
                      </p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform shrink-0 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {question.question_text}
                          </p>
                          <div className="space-y-2">
                            {question.options.map((opt, optIdx) => {
                              const isUserAnswer = userAnswer === optIdx
                              const isCorrectAnswer = question.correct_answer === optIdx
                              let optClass = 'bg-gray-50 text-gray-700 border-gray-100'
                              if (isCorrectAnswer) {
                                optClass = 'bg-green-50 text-green-700 border-green-200'
                              } else if (isUserAnswer && !isCorrectAnswer) {
                                optClass = 'bg-red-50 text-red-700 border-red-200'
                              }

                              return (
                                <div
                                  key={optIdx}
                                  className={`px-3 py-2 rounded-xl text-sm border ${optClass}`}
                                >
                                  <span className="font-medium mr-2">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  {opt}
                                  {isCorrectAnswer && (
                                    <span className="ml-2 text-green-600 text-xs font-medium">
                                      (Correct)
                                    </span>
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <span className="ml-2 text-red-600 text-xs font-medium">
                                      (Your answer)
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-800">
                            <p className="font-medium mb-1">Explanation:</p>
                            <p className="leading-relaxed">{question.explanation}</p>
                          </div>
                          {!isCorrect && !isUnanswered && (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/flashcards?subject=${question.subject}&topic=${encodeURIComponent(question.topic)}`) }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold"
                              >
                                <BookOpen size={14} />
                                Review Flashcards
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/tutor?topic=${encodeURIComponent(question.topic)}`) }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold"
                              >
                                <MessageCircle size={14} />
                                Ask AI Tutor
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={item} className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push(`/tests/${testId}`)}
        >
          <RotateCcw size={16} className="mr-2" />
          Retake Test
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => router.push('/tests')}
        >
          Back to Tests
        </Button>
      </motion.div>
    </motion.div>
  )
}
