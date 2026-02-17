'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ChatBubbleProps {
  message: string
  isUser: boolean
  timestamp?: string
}

function formatMessage(text: string): React.ReactNode {
  return text.split('\n').map((line, i, arr) => {
    // Process bold markers
    const parts = line.split(/(\*\*[^*]+\*\*)/).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>
      }
      return part
    })

    // Detect bullet list items
    if (/^[-*]\s/.test(line)) {
      return (
        <div key={i} className="flex gap-1.5 ml-1 my-0.5">
          <span className="shrink-0">{'\u2022'}</span>
          <span>{parts.slice(1)}</span>
        </div>
      )
    }

    // Detect numbered list items
    if (/^\d+\.\s/.test(line)) {
      return (
        <div key={i} className="ml-1 my-0.5">
          {parts}
        </div>
      )
    }

    // Empty lines as spacing
    if (line.trim() === '') {
      return <div key={i} className="h-2" />
    }

    return (
      <React.Fragment key={i}>
        {parts}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    )
  })
}

export function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-[#6C5CE7] text-white rounded-br-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        )}
      >
        <div className="whitespace-pre-wrap">
          {isUser ? message : formatMessage(message)}
        </div>
        {timestamp && (
          <p
            className={cn(
              'text-[10px] mt-1',
              isUser ? 'text-white/60' : 'text-gray-400'
            )}
          >
            {timestamp}
          </p>
        )}
      </div>
    </motion.div>
  )
}
