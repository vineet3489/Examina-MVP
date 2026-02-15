'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'

export default function DiagnosticPage() {
  const router = useRouter()

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Illustration Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          className="relative mb-10"
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 w-48 h-48 rounded-full bg-[#6C5CE7]/10 blur-xl" />

          {/* Gradient circle */}
          <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#a855f7] flex items-center justify-center shadow-2xl shadow-[#6C5CE7]/30">
            <BookOpen className="w-20 h-20 text-white" strokeWidth={1.5} />
          </div>

          {/* Small floating accents */}
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#a855f7]/30"
          />
          <motion.div
            animate={{ y: [4, -4, 4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-1 -left-3 w-6 h-6 rounded-full bg-[#6C5CE7]/20"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Let&apos;s assess your level
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-xs mx-auto">
            Take a quick diagnostic test to personalize your study plan
          </p>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="px-6 pb-8 space-y-3 w-full max-w-sm mx-auto"
      >
        <Button
          size="lg"
          variant="primary"
          onClick={() => router.push('/tests/diagnostic')}
          className="w-full"
        >
          Take Diagnostic Test
        </Button>

        <Button
          size="lg"
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="w-full text-gray-500"
        >
          Skip for now
        </Button>
      </motion.div>
    </div>
  )
}
