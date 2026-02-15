'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  GraduationCap,
  Briefcase,
  FileText,
  BookOpen,
  School,
  Check,
} from 'lucide-react'

const exams = [
  {
    id: 'ssc_cgl',
    name: 'SSC CGL',
    description: 'Combined Graduate Level',
    icon: Briefcase,
    enabled: true,
  },
  {
    id: 'ssc_chsl',
    name: 'SSC CHSL',
    description: 'Combined Higher Secondary',
    icon: FileText,
    enabled: false,
  },
  {
    id: 'ssc_mts',
    name: 'SSC MTS',
    description: 'Multi Tasking Staff',
    icon: BookOpen,
    enabled: false,
  },
  {
    id: 'gmat',
    name: 'GMAT',
    description: 'Graduate Management Test',
    icon: GraduationCap,
    enabled: false,
  },
  {
    id: 'class_10_12',
    name: 'Class 10-12',
    description: 'Board Exam Prep',
    icon: School,
    enabled: false,
  },
]

export default function SelectExamPage() {
  const [selectedExam, setSelectedExam] = useState<string | null>('ssc_cgl')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleContinue = async () => {
    if (!selectedExam) return
    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      await supabase.from('profiles').upsert({
        user_id: user.id,
        name: user.user_metadata.full_name || '',
        email: user.email,
        avatar_url: user.user_metadata.avatar_url || null,
        exam_type: selectedExam,
        subscription_status: 'free',
        streak_count: 0,
      })

      router.push('/onboarding/diagnostic')
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            Choose Your Exam
          </h1>
          <p className="text-gray-500 mt-2">
            Select the exam you&apos;re preparing for
          </p>
        </motion.div>
      </div>

      {/* Exam Grid */}
      <div className="flex-1 px-6">
        <div className="grid grid-cols-2 gap-3">
          {exams.map((exam, index) => {
            const Icon = exam.icon
            const isSelected = selectedExam === exam.id
            const isDisabled = !exam.enabled

            return (
              <motion.button
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.07 }}
                onClick={() => {
                  if (exam.enabled) setSelectedExam(exam.id)
                }}
                disabled={isDisabled}
                className={`relative rounded-2xl p-4 text-left transition-all duration-200 border-2 ${
                  isSelected
                    ? 'border-[#6C5CE7] bg-[#6C5CE7]/5 shadow-md shadow-[#6C5CE7]/10'
                    : isDisabled
                    ? 'border-gray-100 bg-gray-50 opacity-60'
                    : 'border-gray-200 bg-white hover:border-[#6C5CE7]/30'
                }`}
              >
                {/* Coming Soon Badge */}
                {isDisabled && (
                  <span className="absolute top-2 right-2 text-[10px] font-semibold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                )}

                {/* Selected Checkmark */}
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#6C5CE7] flex items-center justify-center"
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </motion.span>
                )}

                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                    isSelected
                      ? 'bg-[#6C5CE7] text-white'
                      : isDisabled
                      ? 'bg-gray-200 text-gray-400'
                      : 'bg-[#6C5CE7]/10 text-[#6C5CE7]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <h3
                  className={`font-semibold text-sm ${
                    isDisabled ? 'text-gray-400' : 'text-foreground'
                  }`}
                >
                  {exam.name}
                </h3>
                <p
                  className={`text-xs mt-0.5 ${
                    isDisabled ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  {exam.description}
                </p>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="px-6 pb-8 pt-4"
      >
        <Button
          size="lg"
          variant="primary"
          onClick={handleContinue}
          loading={loading}
          disabled={!selectedExam}
          className="w-full"
        >
          Continue
        </Button>
      </motion.div>
    </div>
  )
}
