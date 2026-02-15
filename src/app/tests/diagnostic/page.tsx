'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronRight, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { QuestionCard } from '@/components/test/question-card'
import { Timer } from '@/components/test/timer'
import type { Question } from '@/types'
import allQuestions from '@/data/questions.json'

const TOTAL_QUESTIONS = 15
const QUESTIONS_PER_SUBJECT = 4
const SUBJECTS: Array<Question['subject']> = ['english', 'maths', 'reasoning', 'gk']

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function selectDiagnosticQuestions(): Question[] {
  const questions: Question[] = []
  // Distribute: 4 per subject for first 3, remaining for last = 4+4+4+3 = 15
  const perSubject = [4, 4, 4, 3]

  SUBJECTS.forEach((subject, si) => {
    const subjectQuestions = (allQuestions as Question[]).filter(
      (q) => q.subject === subject && q.type === 'diagnostic'
    )
    const shuffled = shuffleArray(subjectQuestions)
    questions.push(...shuffled.slice(0, perSubject[si]))
  })

  // If we still need more questions, fill from any subject
  if (questions.length < TOTAL_QUESTIONS) {
    const remaining = (allQuestions as Question[]).filter(
      (q) => q.type === 'diagnostic' && !questions.find((sel) => sel.id === q.id)
    )
    const shuffled = shuffleArray(remaining)
    questions.push(...shuffled.slice(0, TOTAL_QUESTIONS - questions.length))
  }

  return shuffleArray(questions).slice(0, TOTAL_QUESTIONS)
}

export default function DiagnosticTestPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [timeSpent, setTimeSpent] = useState(0)
  const [questionTimes, setQuestionTimes] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const questionStartTime = useRef<number>(Date.now())

  // Initialize questions on mount
  useEffect(() => {
    const selected = selectDiagnosticQuestions()
    setQuestions(selected)
    setAnswers(new Array(selected.length).fill(null))
    setQuestionTimes(new Array(selected.length).fill(0))
    setIsRunning(true)
    questionStartTime.current = Date.now()
  }, [])

  const handleTimerTick = useCallback((seconds: number) => {
    setTimeSpent(seconds)
  }, [])

  const handleSelectOption = useCallback((optionIndex: number) => {
    setAnswers((prev) => {
      const updated = [...prev]
      updated[currentQuestion] = optionIndex
      return updated
    })
  }, [currentQuestion])

  const trackQuestionTime = useCallback(() => {
    const elapsed = Math.round((Date.now() - questionStartTime.current) / 1000)
    setQuestionTimes((prev) => {
      const updated = [...prev]
      updated[currentQuestion] = (updated[currentQuestion] || 0) + elapsed
      return updated
    })
    questionStartTime.current = Date.now()
  }, [currentQuestion])

  const handleNext = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      trackQuestionTime()
      setCurrentQuestion((prev) => prev + 1)
    }
  }, [currentQuestion, questions.length, trackQuestionTime])

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setIsRunning(false)
    trackQuestionTime()

    // Calculate scores per subject
    const subjectScores: Record<string, { score: number; total: number; time: number }> = {}

    questions.forEach((q, idx) => {
      if (!subjectScores[q.subject]) {
        subjectScores[q.subject] = { score: 0, total: 0, time: 0 }
      }
      subjectScores[q.subject].total += 1
      subjectScores[q.subject].time += questionTimes[idx] || 0
      if (answers[idx] === q.correct_answer) {
        subjectScores[q.subject].score += 1
      }
    })

    const totalCorrect = Object.values(subjectScores).reduce((sum, s) => sum + s.score, 0)

    const diagnosticResult = {
      totalScore: totalCorrect,
      totalQuestions: questions.length,
      timeSpent,
      subjectScores,
      questionTimes,
      answers: questions.map((q, idx) => ({
        questionId: q.id,
        subject: q.subject,
        topic: q.topic,
        userAnswer: answers[idx],
        correctAnswer: q.correct_answer,
        isCorrect: answers[idx] === q.correct_answer,
        timeSpent: questionTimes[idx] || 0,
      })),
      completedAt: new Date().toISOString(),
    }

    // Save to localStorage
    localStorage.setItem('diagnosticResult', JSON.stringify(diagnosticResult))

    // Brief delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    router.push('/tests/diagnostic/results')
  }, [questions, answers, timeSpent, questionTimes, trackQuestionTime, router])

  const isLastQuestion = currentQuestion === questions.length - 1
  const hasSelectedOption = answers[currentQuestion] !== null && answers[currentQuestion] !== undefined

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#6C5CE7] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading questions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
                    router.back()
                  }
                }}
                className="p-1 -ml-1 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-lg font-bold text-gray-900">Diagnostic Test</h1>
            </div>
            <div className="flex items-center gap-4">
              <Timer isRunning={isRunning} onTick={handleTimerTick} />
              <span className="text-sm font-semibold text-[#6C5CE7] bg-[#6C5CE7]/10 px-2.5 py-1 rounded-full">
                {currentQuestion + 1}/{questions.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <ProgressBar value={currentQuestion + 1} max={questions.length} />
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 px-4 py-6">
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion}
            questionNumber={currentQuestion + 1}
            totalQuestions={questions.length}
            questionText={questions[currentQuestion].question_text}
            options={questions[currentQuestion].options}
            selectedOption={answers[currentQuestion]}
            onSelectOption={handleSelectOption}
          />
        </AnimatePresence>
      </div>

      {/* Bottom action */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 pb-safe">
        {isLastQuestion ? (
          <Button
            size="lg"
            disabled={!hasSelectedOption || isSubmitting}
            loading={isSubmitting}
            onClick={handleSubmit}
            className="w-full"
          >
            <Send size={18} className="mr-2" />
            Submit Test
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={!hasSelectedOption}
            onClick={handleNext}
            className="w-full"
          >
            Next
            <ChevronRight size={18} className="ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
