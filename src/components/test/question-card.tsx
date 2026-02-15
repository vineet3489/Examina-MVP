'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface QuestionCardProps {
  questionNumber: number
  totalQuestions: number
  questionText: string
  options: string[]
  selectedOption: number | null
  onSelectOption: (index: number) => void
}

const optionLabels = ['A', 'B', 'C', 'D']

export function QuestionCard({
  questionNumber,
  totalQuestions,
  questionText,
  options,
  selectedOption,
  onSelectOption,
}: QuestionCardProps) {
  return (
    <motion.div
      key={questionNumber}
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full"
    >
      {/* Question text */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-[#6C5CE7] uppercase tracking-wide mb-2">
          Question {questionNumber} of {totalQuestions}
        </p>
        <p className="text-lg font-semibold text-gray-900 leading-relaxed">
          {questionText}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedOption === index
          return (
            <motion.button
              key={index}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectOption(index)}
              className={cn(
                'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                isSelected
                  ? 'border-[#6C5CE7] bg-[#6C5CE7]/10 text-[#6C5CE7]'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              )}
            >
              <span
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200',
                  isSelected
                    ? 'bg-[#6C5CE7] text-white'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                {optionLabels[index]}
              </span>
              <span className="text-[15px] font-medium">{option}</span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
