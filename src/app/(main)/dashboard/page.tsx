'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Brain,
  Calculator,
  Globe,
  Flame,
  Sparkles,
  FileText,
  MessageCircle,
  ChevronRight,
  Trophy,
  Star,
  Zap,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { createClient } from '@/lib/supabase/client'
import { getGreeting } from '@/lib/utils'

interface Profile {
  full_name: string
  avatar_url?: string
  streak_count?: number
}

const stories = [
  { label: 'Tips', color: 'from-violet-500 to-purple-600', emoji: '💡' },
  { label: 'Vocab', color: 'from-blue-500 to-indigo-600', emoji: '📚' },
  { label: 'Quiz', color: 'from-pink-500 to-rose-600', emoji: '🧠' },
  { label: 'Facts', color: 'from-amber-500 to-orange-600', emoji: '🌍' },
  { label: 'Math', color: 'from-emerald-500 to-teal-600', emoji: '🔢' },
  { label: 'News', color: 'from-cyan-500 to-blue-600', emoji: '📰' },
]

const subjects = [
  {
    name: 'English',
    icon: BookOpen,
    progress: 45,
    color: '#6C5CE7',
    bg: 'bg-violet-50',
    href: '/dashboard/study-plan',
  },
  {
    name: 'Maths',
    icon: Calculator,
    progress: 32,
    color: '#4A90D9',
    bg: 'bg-blue-50',
    href: '/dashboard/study-plan',
  },
  {
    name: 'Reasoning',
    icon: Brain,
    progress: 28,
    color: '#E84393',
    bg: 'bg-pink-50',
    href: '/dashboard/study-plan',
  },
  {
    name: 'GK',
    icon: Globe,
    progress: 18,
    color: '#00B894',
    bg: 'bg-emerald-50',
    href: '/dashboard/study-plan',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (profileData) {
            setProfile({
              full_name: profileData.full_name || 'Student',
              avatar_url: profileData.avatar_url,
              streak_count: profileData.streak_count || 3,
            })
          }
        }
      } catch {
        // fallback to default
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const greeting = getGreeting()
  const displayName = profile?.full_name || 'Student'
  const firstName = displayName.split(' ')[0]
  const streakCount = profile?.streak_count || 3

  return (
    <motion.div
      className="px-4 pt-12 pb-4 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header: Greeting + Avatar */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{greeting}</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {loading ? '...' : firstName} 👋
          </h1>
        </div>
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-200">
          {firstName.charAt(0).toUpperCase()}
        </div>
      </motion.div>

      {/* Story Carousel */}
      <motion.div variants={item} className="-mx-4">
        <div className="flex gap-4 px-4 overflow-x-auto scroll-container">
          {stories.map((story, index) => (
            <button key={index} className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${story.color} flex items-center justify-center text-2xl ring-2 ring-white shadow-md`}
              >
                {story.emoji}
              </div>
              <span className="text-[11px] font-medium text-gray-600">{story.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Streak Card */}
      <motion.div variants={item}>
        <Card variant="gradient" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="text-yellow-300" size={24} />
                <span className="text-3xl font-bold">{streakCount}</span>
              </div>
              <p className="text-white/90 text-sm font-medium">
                {streakCount} day streak! Keep it up! 🔥
              </p>
            </div>
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < streakCount ? 'bg-yellow-300' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Continue Study Plan */}
      <motion.div variants={item}>
        <Link href="/dashboard/study-plan">
          <Card variant="elevated" className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-50 to-purple-50 opacity-50" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Sparkles size={18} className="text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Continue Study Plan</h3>
                    <p className="text-xs text-gray-500">Day 1 - Foundation Building</p>
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className="text-gray-400 group-hover:text-violet-500 transition-colors"
                />
              </div>
              <ProgressBar value={3} max={4} color="#6C5CE7" />
              <p className="text-xs text-gray-500 mt-2">3 of 4 tasks completed today</p>
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* Subject Cards Grid */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Subjects</h2>
          <span className="text-xs text-violet-600 font-medium">View all</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
            >
              <Link href={subject.href}>
                <Card className="group hover:shadow-md transition-shadow">
                  <div
                    className={`w-10 h-10 rounded-xl ${subject.bg} flex items-center justify-center mb-3`}
                  >
                    <subject.icon size={20} style={{ color: subject.color }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{subject.name}</h3>
                  <ProgressBar value={subject.progress} max={100} color={subject.color} className="mb-1" />
                  <p className="text-[11px] text-gray-500">{subject.progress}% complete</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="flex gap-3">
          <Link href="/tests" className="flex-1">
            <Card className="flex flex-col items-center gap-2 py-5 hover:shadow-md transition-shadow bg-gradient-to-br from-violet-50 to-white border-violet-100">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <FileText size={22} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Take Mock Test</span>
            </Card>
          </Link>
          <Link href="/tutor" className="flex-1">
            <Card className="flex flex-col items-center gap-2 py-5 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-white border-blue-100">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <MessageCircle size={22} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Ask AI Tutor</span>
            </Card>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
