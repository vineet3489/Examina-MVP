'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight, Bookmark, AlertTriangle, XCircle, BookOpen, MessageCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { formatTime } from '@/lib/utils'
import allQuestions from '@/data/questions.json'
import type { Question } from '@/types'

interface TestConfig {
  title: string
  timeMinutes: number
  subject?: string
  questionCount: number
}

const testConfigs: Record<string, TestConfig> = {
  'full-mock-1': {
    title: 'SSC CGL Full Mock Test 1',
    timeMinutes: 60,
    questionCount: 60,
  },
  'english-practice': {
    title: 'English Practice Set',
    timeMinutes: 15,
    subject: 'english',
    questionCount: 15,
  },
  'maths-practice': {
    title: 'Maths Practice Set',
    timeMinutes: 20,
    subject: 'maths',
    questionCount: 15,
  },
  'reasoning-practice': {
    title: 'Reasoning Practice Set',
    timeMinutes: 15,
    subject: 'reasoning',
    questionCount: 15,
  },
  'gk-practice': {
    title: 'GK Practice Set',
    timeMinutes: 10,
    subject: 'gk',
    questionCount: 15,
  },
}

export default function TestPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.testId as string

  const config = testConfigs[testId]

  const questions: Question[] = useMemo(() => {
    if (!config) return []
    const typed = allQuestions as Question[]
    if (config.subject) {
      return typed
        .filter((q) => q.subject === config.subject)
        .slice(0, config.questionCount)
    }
    // Full mock: take all 60 questions
    return typed.slice(0, config.questionCount)
  }, [config])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<number, number>>(new Map())
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(config ? config.timeMinutes * 60 : 0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [startTime] = useState(Date.now())

  const isPractice = !!config?.subject

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || !config) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isSubmitted, config])

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true)
    setShowConfirmModal(false)

    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    let score = 0
    const sectionScores: Record<string, { score: number; total: number; time: number }> = {}

    questions.forEach((q, idx) => {
      const subject = q.subject
      if (!sectionScores[subject]) {
        sectionScores[subject] = { score: 0, total: 0, time: 0 }
      }
      sectionScores[subject].total += 1

      const userAnswer = answers.get(idx)
      if (userAnswer === q.correct_answer) {
        score += 1
        sectionScores[subject].score += 1
      }
    })

    // Distribute time proportionally across sections
    const totalQuestions = questions.length
    Object.keys(sectionScores).forEach((subject) => {
      sectionScores[subject].time = Math.round(
        (sectionScores[subject].total / totalQuestions) * timeTaken
      )
    })

    const result = {
      testId,
      score,
      total: questions.length,
      timeTaken,
      sectionScores,
      answers: Array.from(answers.entries()),
      questions: questions.map((q) => ({
        id: q.id,
        subject: q.subject,
        topic: q.topic,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
      })),
      completedAt: new Date().toISOString(),
    }

    localStorage.setItem(`examina_test_result_${testId}`, JSON.stringify(result))

    router.push(`/tests/results/${testId}`)
  }, [answers, questions, testId, startTime, router])

  const selectAnswer = (optionIndex: number) => {
    if (isSubmitted) return
    setAnswers((prev) => {
      const next = new Map(prev)
      next.set(currentIndex, optionIndex)
      return next
    })

    // In practice mode, show feedback if wrong
    if (isPractice && optionIndex !== questions[currentIndex].correct_answer) {
      setTimeout(() => setShowFeedback(true), 300)
    }
  }

  const toggleMarkForReview = () => {
    setMarkedForReview((prev) => {
      const next = new Set(prev)
      if (next.has(currentIndex)) {
        next.delete(currentIndex)
      } else {
        next.add(currentIndex)
      }
      return next
    })
  }

  const goNext = () => {
    // In practice mode, block if current answer is wrong
    if (isPractice && answers.has(currentIndex) && answers.get(currentIndex) !== questions[currentIndex].correct_answer) {
      setShowFeedback(true)
      return
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (!config || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-gray-500">Test not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/tests')}>
          Back to Tests
        </Button>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const answeredCount = answers.size
  const unansweredCount = questions.length - answeredCount

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="text-gray-500 hover:text-gray-700 shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="font-semibold text-gray-900 text-sm truncate">
              {config.title}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium shrink-0">
            <Clock
              size={16}
              className={timeRemaining <= 60 ? 'text-red-500' : 'text-gray-500'}
            />
            <span className={timeRemaining <= 60 ? 'text-red-500' : 'text-gray-700'}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Question Navigation Dots */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scroll-container">
          {questions.map((_, idx) => {
            let dotColor = 'bg-gray-200' // unanswered
            if (answers.has(idx)) dotColor = 'bg-[#6C5CE7]' // answered
            if (markedForReview.has(idx)) dotColor = 'bg-yellow-400' // marked
            const isActive = idx === currentIndex

            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-medium transition-all ${dotColor} ${
                  isActive ? 'ring-2 ring-offset-1 ring-[#6C5CE7] scale-110' : ''
                } ${answers.has(idx) || markedForReview.has(idx) ? 'text-white' : 'text-gray-500'}`}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Question Counter */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs text-gray-500">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Question Card */}
      <div className="flex-1 px-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <Card variant="elevated" className="mb-4">
              <p className="text-gray-900 font-medium leading-relaxed">
                {currentQuestion.question_text}
              </p>
            </Card>

            <div className="space-y-3">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = answers.get(currentIndex) === optIdx

                return (
                  <motion.button
                    key={optIdx}
                    onClick={() => selectAnswer(optIdx)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-[#6C5CE7] bg-[#6C5CE7]/5'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                          isSelected
                            ? 'bg-[#6C5CE7] text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span
                        className={`text-sm ${
                          isSelected ? 'text-[#6C5CE7] font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option}
                      </span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-30">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={18} className="mr-1" />
            Previous
          </Button>

          <button
            onClick={toggleMarkForReview}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              markedForReview.has(currentIndex)
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Bookmark
              size={16}
              fill={markedForReview.has(currentIndex) ? 'currentColor' : 'none'}
            />
            Review
          </button>

          {currentIndex === questions.length - 1 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowConfirmModal(true)}
            >
              Submit
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={goNext}>
              Next
              <ChevronRight size={18} className="ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Wrong Answer Feedback Modal (Practice Mode) */}
      <Modal isOpen={showFeedback} onClose={() => {}}>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={24} className="text-red-500" />
            <h3 className="font-bold text-gray-900">Not quite right!</h3>
          </div>
          <div className="bg-green-50 rounded-xl p-3 mb-3">
            <p className="text-xs text-green-700 font-medium mb-1">Correct Answer:</p>
            <p className="text-sm text-green-800 font-semibold">
              {String.fromCharCode(65 + currentQuestion.correct_answer)}. {currentQuestion.options[currentQuestion.correct_answer]}
            </p>
          </div>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{currentQuestion.explanation}</p>
          <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">Study this topic:</p>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => router.push(`/flashcards?subject=${currentQuestion.subject}&topic=${encodeURIComponent(currentQuestion.topic)}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold"
            >
              <BookOpen size={14} />
              Review Flashcards
            </button>
            <button
              onClick={() => router.push(`/tutor?topic=${encodeURIComponent(currentQuestion.topic)}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold"
            >
              <MessageCircle size={14} />
              Ask AI Tutor
            </button>
          </div>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              setAnswers((prev) => {
                const next = new Map(prev)
                next.delete(currentIndex)
                return next
              })
              setShowFeedback(false)
            }}
          >
            Try Again
          </Button>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-yellow-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Submit Test?</h3>
          <p className="text-sm text-gray-500 mb-1">
            You have answered <span className="font-semibold text-gray-700">{answeredCount}</span> out of{' '}
            <span className="font-semibold text-gray-700">{questions.length}</span> questions.
          </p>
          {unansweredCount > 0 && (
            <p className="text-sm text-yellow-600 mb-4">
              {unansweredCount} question{unansweredCount > 1 ? 's' : ''} left unanswered.
            </p>
          )}
          {markedForReview.size > 0 && (
            <p className="text-xs text-gray-400 mb-4">
              {markedForReview.size} marked for review
            </p>
          )}
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirmModal(false)}
            >
              Continue
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
