'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Brain, RotateCcw, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import flashcardsData from '@/data/flashcards.json'

interface Flashcard {
  id: string
  subject: string
  topic: string
  front_text: string
  back_text: string
  difficulty: number
}

interface MasteryData {
  level: number
  lastReviewed: string
}

type MasteryMap = Record<string, MasteryData>

const subjects = ['All', 'English', 'Maths', 'Reasoning', 'GK'] as const

const subjectColors: Record<string, { bg: string; text: string; badge: 'default' | 'success' | 'warning' | 'error' | 'purple' }> = {
  english: { bg: 'bg-violet-50', text: 'text-violet-700', badge: 'purple' },
  maths: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'default' },
  reasoning: { bg: 'bg-pink-50', text: 'text-pink-700', badge: 'warning' },
  gk: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'success' },
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

function getMasteryFromStorage(): MasteryMap {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem('flashcard-mastery')
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveMasteryToStorage(mastery: MasteryMap) {
  try {
    localStorage.setItem('flashcard-mastery', JSON.stringify(mastery))
  } catch {
    // storage full or unavailable
  }
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-3 border-[#6C5CE7] border-t-transparent rounded-full animate-spin" /></div>}>
      <FlashcardsContent />
    </Suspense>
  )
}

function FlashcardsContent() {
  const searchParams = useSearchParams()
  const initialSubject = searchParams.get('subject')
  const [selectedSubject, setSelectedSubject] = useState<string>(
    initialSubject ? initialSubject.charAt(0).toUpperCase() + initialSubject.slice(1) : 'All'
  )
  const [flashcards] = useState<Flashcard[]>(flashcardsData as Flashcard[])
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null)
  const [mastery, setMastery] = useState<MasteryMap>({})

  useEffect(() => {
    setMastery(getMasteryFromStorage())
  }, [])

  const filteredCards = selectedSubject === 'All'
    ? flashcards
    : flashcards.filter(
        (fc) => fc.subject.toLowerCase() === selectedSubject.toLowerCase()
      )

  const handleFlip = useCallback((id: string) => {
    setFlippedCardId((prev) => (prev === id ? null : id))
  }, [])

  const handleMastery = useCallback(
    (cardId: string, action: 'reset' | 'increment') => {
      setMastery((prev) => {
        const current = prev[cardId]?.level || 0
        const newLevel = action === 'reset' ? 0 : Math.min(current + 1, 3)
        const updated = {
          ...prev,
          [cardId]: {
            level: newLevel,
            lastReviewed: new Date().toISOString(),
          },
        }
        saveMasteryToStorage(updated)
        return updated
      })
      setFlippedCardId(null)
    },
    []
  )

  const getMasteryLevel = (cardId: string) => mastery[cardId]?.level || 0

  return (
    <motion.div
      className="px-4 pt-12 pb-24 space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <BookOpen size={20} className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
          <p className="text-xs text-gray-500">
            {filteredCards.length} cards available
          </p>
        </div>
      </motion.div>

      {/* Subject Filter Tabs */}
      <motion.div variants={item} className="-mx-4">
        <div className="flex gap-2 px-4 overflow-x-auto scroll-container pb-1">
          {subjects.map((subject) => {
            const isActive = selectedSubject === subject
            return (
              <button
                key={subject}
                onClick={() => {
                  setSelectedSubject(subject)
                  setFlippedCardId(null)
                }}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/25'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {subject}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Flashcard Grid */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {filteredCards.map((card) => {
            const isFlipped = flippedCardId === card.id
            const level = getMasteryLevel(card.id)
            const colors = subjectColors[card.subject] || subjectColors.english

            return (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="perspective-1000"
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  className="relative w-full cursor-pointer"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  onClick={() => handleFlip(card.id)}
                >
                  {/* Front Face */}
                  <div
                    className="w-full"
                    style={{
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <Card className="min-h-[180px] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={colors.badge}>
                            {card.subject.charAt(0).toUpperCase() +
                              card.subject.slice(1)}
                          </Badge>
                          {/* Mastery Dots */}
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map((dot) => (
                              <div
                                key={dot}
                                className={`w-2 h-2 rounded-full ${
                                  dot <= level
                                    ? 'bg-green-500'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                          {card.topic}
                        </p>
                        <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-4">
                          {card.front_text}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 mt-3 text-[10px] text-gray-400">
                        <RotateCcw size={10} />
                        <span>Tap to flip</span>
                      </div>
                    </Card>
                  </div>

                  {/* Back Face */}
                  <div
                    className="w-full absolute top-0 left-0"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <Card className="min-h-[180px] flex flex-col justify-between bg-gradient-to-br from-[#6C5CE7]/5 to-purple-50 border-[#6C5CE7]/20">
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Brain size={14} className="text-[#6C5CE7]" />
                          <span className="text-[10px] font-semibold text-[#6C5CE7] uppercase">
                            Answer
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-6">
                          {card.back_text}
                        </p>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMastery(card.id, 'reset')
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-semibold hover:bg-red-100 transition-colors"
                        >
                          <RotateCcw size={10} />
                          Learning
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMastery(card.id, 'increment')
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-50 text-green-600 text-[10px] font-semibold hover:bg-green-100 transition-colors"
                        >
                          <Check size={10} />
                          Got It
                        </button>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {filteredCards.length === 0 && (
        <motion.div
          variants={item}
          className="flex flex-col items-center justify-center py-16 text-gray-400"
        >
          <BookOpen size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No flashcards found</p>
          <p className="text-xs">Try selecting a different subject</p>
        </motion.div>
      )}
    </motion.div>
  )
}
