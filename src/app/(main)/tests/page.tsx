'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, FileText, Trophy, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TestConfig {
  id: string
  title: string
  questionCount: number
  timeMinutes: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  subject?: string
}

const practiceTests: TestConfig[] = [
  {
    id: 'full-mock-1',
    title: 'SSC CGL Full Mock Test 1',
    questionCount: 100,
    timeMinutes: 60,
    difficulty: 'Hard',
  },
  {
    id: 'english-practice',
    title: 'English Practice Set',
    questionCount: 25,
    timeMinutes: 15,
    difficulty: 'Medium',
    subject: 'english',
  },
  {
    id: 'maths-practice',
    title: 'Maths Practice Set',
    questionCount: 25,
    timeMinutes: 20,
    difficulty: 'Medium',
    subject: 'maths',
  },
  {
    id: 'reasoning-practice',
    title: 'Reasoning Practice Set',
    questionCount: 25,
    timeMinutes: 15,
    difficulty: 'Medium',
    subject: 'reasoning',
  },
  {
    id: 'gk-practice',
    title: 'GK Practice Set',
    questionCount: 25,
    timeMinutes: 10,
    difficulty: 'Easy',
    subject: 'gk',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

function getDifficultyVariant(difficulty: string): 'success' | 'warning' | 'error' {
  if (difficulty === 'Easy') return 'success'
  if (difficulty === 'Medium') return 'warning'
  return 'error'
}

export default function TestsPage() {
  const router = useRouter()
  const [diagnosticTaken, setDiagnosticTaken] = useState(false)
  const [bestScores, setBestScores] = useState<Record<string, number>>({})

  useEffect(() => {
    const diagResult = localStorage.getItem('examina_diagnostic_result')
    if (diagResult) {
      setDiagnosticTaken(true)
    }

    const scores: Record<string, number> = {}
    practiceTests.forEach((test) => {
      const result = localStorage.getItem(`examina_test_result_${test.id}`)
      if (result) {
        try {
          const parsed = JSON.parse(result)
          scores[test.id] = Math.round((parsed.score / parsed.total) * 100)
        } catch {
          // ignore
        }
      }
    })
    setBestScores(scores)
  }, [])

  return (
    <motion.div
      className="px-4 pt-12 pb-24 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-gray-900">Mock Tests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Practice with timed tests and track your scores
        </p>
      </motion.div>

      {/* Diagnostic Test Section */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-gray-900 mb-3">Diagnostic Test</h2>
        <Card
          variant="elevated"
          className="relative overflow-hidden cursor-pointer group"
          onClick={() => {
            if (!diagnosticTaken) {
              router.push('/onboarding/diagnostic')
            }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-purple-50 opacity-50" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#a855f7] flex items-center justify-center shadow-lg shadow-violet-200">
                <FileText size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {diagnosticTaken ? 'Diagnostic Complete' : 'Take Diagnostic Test'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {diagnosticTaken
                    ? 'Your study plan has been personalized'
                    : '60 questions across all subjects to assess your level'}
                </p>
              </div>
            </div>
            {!diagnosticTaken && (
              <ChevronRight
                size={20}
                className="text-gray-400 group-hover:text-[#6C5CE7] transition-colors shrink-0"
              />
            )}
            {diagnosticTaken && (
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Trophy size={16} className="text-green-600" />
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Practice Tests Section */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-gray-900 mb-3">Practice Tests</h2>
        <div className="space-y-3">
          {practiceTests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.08, duration: 0.4 }}
            >
              <Card className="group hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {test.title}
                      </h3>
                      <Badge variant={getDifficultyVariant(test.difficulty)}>
                        {test.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText size={12} />
                        {test.questionCount} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {test.timeMinutes} min
                      </span>
                      {bestScores[test.id] !== undefined && (
                        <span className="flex items-center gap-1 text-[#6C5CE7] font-medium">
                          <Trophy size={12} />
                          Best: {bestScores[test.id]}%
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/tests/${test.id}`)}
                    className="ml-3 px-4 py-2 bg-[#6C5CE7] text-white text-sm font-semibold rounded-xl hover:bg-[#5A4BD1] transition-colors shadow-md shadow-[#6C5CE7]/25 shrink-0"
                  >
                    Start
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
