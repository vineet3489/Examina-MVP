'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ChatBubbleProps {
  message: string
  isUser: boolean
  timestamp?: string
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
        <p className="whitespace-pre-wrap">{message}</p>
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
