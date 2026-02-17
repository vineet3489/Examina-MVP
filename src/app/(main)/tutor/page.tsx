'use client'

import { Suspense, useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, X } from 'lucide-react'
import { ChatBubble } from '@/components/tutor/chat-bubble'
import { TypingIndicator } from '@/components/tutor/typing-indicator'
import { Modal } from '@/components/ui/modal'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const FREE_MESSAGE_LIMIT = 5
const WELCOME_MESSAGE =
  "Hi! I'm your SSC exam tutor. Ask me anything about English, Maths, Reasoning, or GK. I can help in Hindi and English both!"

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function getTimestamp() {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getDailyMessageCount(): number {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem('examina_tutor_usage')
  if (!stored) return 0
  try {
    const parsed = JSON.parse(stored)
    if (parsed.date === getTodayKey()) {
      return parsed.count
    }
    return 0
  } catch {
    return 0
  }
}

function setDailyMessageCount(count: number) {
  localStorage.setItem(
    'examina_tutor_usage',
    JSON.stringify({ date: getTodayKey(), count })
  )
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-3 border-[#6C5CE7] border-t-transparent rounded-full animate-spin" /></div>}>
      <TutorContent />
    </Suspense>
  )
}

function TutorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTopic = searchParams.get('topic')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: WELCOME_MESSAGE,
      timestamp: getTimestamp(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [showPaywall, setShowPaywall] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load daily message count on mount
  useEffect(() => {
    setMessageCount(getDailyMessageCount())
  }, [])

  // Pre-fill input if topic query param exists
  useEffect(() => {
    if (initialTopic) {
      setInput(`Explain the topic "${initialTopic}" in detail with examples`)
    }
  }, [initialTopic])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    // Check free tier limit
    if (messageCount >= FREE_MESSAGE_LIMIT) {
      setShowPaywall(true)
      return
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: getTimestamp(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.slice(1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Sorry, I encountered an error. Please try again in a moment.',
            timestamp: getTimestamp(),
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.message,
            timestamp: getTimestamp(),
          },
        ])
      }

      // Increment daily count
      const newCount = messageCount + 1
      setMessageCount(newCount)
      setDailyMessageCount(newCount)
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, something went wrong. Please check your connection and try again.',
          timestamp: getTimestamp(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, messageCount])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const remainingMessages = Math.max(0, FREE_MESSAGE_LIMIT - messageCount)

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900">AI Tutor</h1>
          <p className="text-xs text-green-500">Online</p>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <ChatBubble
              key={index}
              message={msg.content}
              isUser={msg.role === 'user'}
              timestamp={msg.timestamp}
            />
          ))}
        </AnimatePresence>

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 bg-white px-4 pt-2 pb-20">
        {/* Free tier counter */}
        <p className="text-xs text-gray-400 text-center mb-2">
          {remainingMessages > 0
            ? `${remainingMessages}/${FREE_MESSAGE_LIMIT} free messages today`
            : 'Daily free messages used up'}
        </p>

        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your doubt..."
            className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] transition-colors"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full bg-[#6C5CE7] flex items-center justify-center text-white disabled:opacity-40 transition-opacity flex-shrink-0 active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Paywall Modal */}
      <Modal isOpen={showPaywall} onClose={() => setShowPaywall(false)}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-[#6C5CE7]" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Upgrade to Premium
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            You have used all {FREE_MESSAGE_LIMIT} free messages today. Upgrade
            for unlimited AI tutoring!
          </p>
          <div className="bg-purple-50 rounded-xl p-4 mb-6">
            <p className="text-2xl font-bold text-[#6C5CE7]">
              ₹29<span className="text-sm font-normal text-gray-500">/week</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Unlimited AI tutoring + all premium features
            </p>
          </div>
          <button
            onClick={() => {
              setShowPaywall(false)
              router.push('/subscribe')
            }}
            className="w-full py-3 rounded-xl bg-[#6C5CE7] text-white font-semibold text-sm active:scale-[0.98] transition-transform"
          >
            Upgrade Now
          </button>
          <button
            onClick={() => setShowPaywall(false)}
            className="mt-3 text-sm text-gray-400"
          >
            Maybe later
          </button>
        </div>
      </Modal>
    </div>
  )
}
