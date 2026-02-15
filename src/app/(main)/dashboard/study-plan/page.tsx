'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  Brain,
  Globe,
  CheckCircle2,
  Circle,
  Flame,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import studyPlanData from '@/data/study-plan.json'

const subjectIcons: Record<string, typeof BookOpen> = {
  English: BookOpen,
  Maths: Calculator,
  Reasoning: Brain,
  GK: Globe,
}

const subjectColors: Record<string, string> = {
  English: '#6C5CE7',
  Maths: '#4A90D9',
  Reasoning: '#E84393',
  GK: '#00B894',
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function StudyPlanPage() {
  const router = useRouter()
  const [days, setDays] = useState(studyPlanData.days.map(d => ({ ...d, tasks: d.tasks.map(t => ({ ...t, completed: false })) })))
  const currentDay = 1 // First incomplete day

  function toggleTask(dayIndex: number, taskIndex: number) {
    setDays((prev) => {
      const updated = JSON.parse(JSON.stringify(prev))
      updated[dayIndex].tasks[taskIndex].completed = !updated[dayIndex].tasks[taskIndex].completed
      return updated
    })
  }

  function getCompletionCount(tasks: { completed: boolean }[]) {
    return tasks.filter((t) => t.completed).length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900">Your Study Plan</h1>
            <p className="text-xs text-gray-500">7-day personalized plan</p>
          </div>
        </div>
      </div>

      {/* Plan Days */}
      <motion.div
        className="px-4 py-4 space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {days.map((day, dayIndex) => {
          const completedCount = getCompletionCount(day.tasks)
          const totalTasks = day.tasks.length
          const isCurrentDay = day.day === currentDay
          const isCompleted = completedCount === totalTasks
          const isFuture = day.day > currentDay

          return (
            <motion.div key={day.day} variants={item}>
              <Card
                variant={isCurrentDay ? 'elevated' : 'default'}
                className={`relative overflow-hidden ${
                  isCurrentDay ? 'ring-2 ring-violet-200' : ''
                } ${isFuture ? 'opacity-60' : ''}`}
              >
                {/* Current day indicator */}
                {isCurrentDay && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
                )}

                {/* Day header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCompleted
                          ? 'bg-green-100 text-green-600'
                          : isCurrentDay
                          ? 'bg-violet-100 text-violet-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {isCompleted ? '✓' : day.day}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900">Day {day.day}</h3>
                      <p className="text-xs text-gray-500">{day.theme}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isCurrentDay && (
                      <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                        TODAY
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-1">
                      {completedCount}/{totalTasks}
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                  {day.tasks.map((task, taskIndex) => {
                    const Icon = subjectIcons[task.subject] || BookOpen
                    const color = subjectColors[task.subject] || '#6C5CE7'

                    return (
                      <button
                        key={taskIndex}
                        onClick={() => toggleTask(dayIndex, taskIndex)}
                        className="flex items-center gap-3 w-full text-left py-2 px-2 rounded-xl hover:bg-gray-50 transition-colors"
                        disabled={isFuture}
                      >
                        {task.completed ? (
                          <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                        ) : (
                          <Circle size={20} className="text-gray-300 shrink-0" />
                        )}
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          <Icon size={14} style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              task.completed
                                ? 'text-gray-400 line-through'
                                : 'text-gray-800'
                            }`}
                          >
                            {task.topic}
                          </p>
                          <p className="text-[11px] text-gray-400">{task.subject}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Progress bar for current day */}
                {isCurrentDay && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs font-semibold text-violet-600">
                        {Math.round((completedCount / totalTasks) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(completedCount / totalTasks) * 100}%`,
                        }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
