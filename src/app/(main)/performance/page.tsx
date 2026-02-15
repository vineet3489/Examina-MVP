'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Target,
  BookOpen,
  Calculator,
  Brain,
  Globe,
  AlertCircle,
  Lightbulb,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress-bar'
import { ScoreRing } from '@/components/test/score-ring'

// Mock data for charts
const scoreTrendData = [
  { test: 'Test 1', score: 42 },
  { test: 'Test 2', score: 55 },
  { test: 'Test 3', score: 48 },
  { test: 'Test 4', score: 62 },
  { test: 'Test 5', score: 58 },
  { test: 'Test 6', score: 70 },
]

const subjectBarData = [
  { subject: 'English', score: 68, fill: '#6C5CE7' },
  { subject: 'Maths', score: 52, fill: '#4A90D9' },
  { subject: 'Reasoning', score: 61, fill: '#E84393' },
  { subject: 'GK', score: 74, fill: '#00B894' },
]

interface SubjectInfo {
  name: string
  icon: React.ElementType
  level: string
  progress: number
  testsTaken: number
  color: string
  bg: string
}

const subjectsData: SubjectInfo[] = [
  {
    name: 'English',
    icon: BookOpen,
    level: 'Intermediate',
    progress: 68,
    testsTaken: 4,
    color: '#6C5CE7',
    bg: 'bg-violet-50',
  },
  {
    name: 'Mathematics',
    icon: Calculator,
    level: 'Beginner',
    progress: 52,
    testsTaken: 3,
    color: '#4A90D9',
    bg: 'bg-blue-50',
  },
  {
    name: 'Reasoning',
    icon: Brain,
    level: 'Intermediate',
    progress: 61,
    testsTaken: 3,
    color: '#E84393',
    bg: 'bg-pink-50',
  },
  {
    name: 'General Knowledge',
    icon: Globe,
    level: 'Advanced',
    progress: 74,
    testsTaken: 5,
    color: '#00B894',
    bg: 'bg-emerald-50',
  },
]

const weakAreas = [
  { topic: 'Algebra', subject: 'Mathematics', accuracy: 35 },
  { topic: 'Tenses', subject: 'English', accuracy: 40 },
  { topic: 'Syllogism', subject: 'Reasoning', accuracy: 42 },
  { topic: 'Indian Economy', subject: 'General Knowledge', accuracy: 45 },
]

const recommendations = [
  'Focus on Algebra basics - solve 10 problems daily',
  'Practice tense identification with sentence exercises',
  'Use Venn diagrams for Syllogism problems',
  'Read current affairs daily for 20 minutes',
]

function getLevelVariant(level: string): 'success' | 'warning' | 'purple' {
  if (level === 'Advanced') return 'success'
  if (level === 'Intermediate') return 'purple'
  return 'warning'
}

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

export default function PerformancePage() {
  const [overallScore, setOverallScore] = useState(64)
  const [predictedPercentile, setPredictedPercentile] = useState(72)

  useEffect(() => {
    // Try to load real data from localStorage
    const tests = ['full-mock-1', 'english-practice', 'maths-practice', 'reasoning-practice', 'gk-practice']
    let totalScore = 0
    let totalQuestions = 0
    let hasData = false

    tests.forEach((testId) => {
      const saved = localStorage.getItem(`examina_test_result_${testId}`)
      if (saved) {
        try {
          const result = JSON.parse(saved)
          totalScore += result.score
          totalQuestions += result.total
          hasData = true
        } catch {
          // ignore
        }
      }
    })

    if (hasData && totalQuestions > 0) {
      const pct = Math.round((totalScore / totalQuestions) * 100)
      setOverallScore(pct)
      if (pct >= 90) setPredictedPercentile(95)
      else if (pct >= 80) setPredictedPercentile(85)
      else if (pct >= 70) setPredictedPercentile(72)
      else if (pct >= 60) setPredictedPercentile(55)
      else if (pct >= 50) setPredictedPercentile(40)
      else setPredictedPercentile(25)
    }
  }, [])

  return (
    <motion.div
      className="px-4 pt-12 pb-24 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your progress and identify areas for improvement
        </p>
      </motion.div>

      {/* Overall Readiness Gauge */}
      <motion.div variants={item} className="flex justify-center">
        <ScoreRing score={overallScore} total={100} size={160} strokeWidth={12} />
      </motion.div>

      {/* Predicted Percentile */}
      <motion.div variants={item}>
        <Card variant="gradient" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Predicted Percentile</p>
              <p className="text-4xl font-bold text-white mt-1">{predictedPercentile}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Target size={28} className="text-white" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Score Trend Line Chart */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-gray-900 mb-3">Score Trend</h2>
        <Card variant="elevated">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrendData}>
                <XAxis
                  dataKey="test"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6C5CE7"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#6C5CE7', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: '#6C5CE7', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Subject-wise Bar Chart */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-gray-900 mb-3">Subject-wise Performance</h2>
        <Card variant="elevated">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectBarData} barCategoryGap="25%">
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Subject Cards */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-gray-900 mb-3">Subject Details</h2>
        <div className="space-y-3">
          {subjectsData.map((subject, index) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.08, duration: 0.4 }}
            >
              <Card>
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${subject.bg} flex items-center justify-center shrink-0`}
                  >
                    <subject.icon size={20} style={{ color: subject.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{subject.name}</h3>
                      <Badge variant={getLevelVariant(subject.level)}>{subject.level}</Badge>
                    </div>
                    <ProgressBar
                      value={subject.progress}
                      max={100}
                      color={subject.color}
                      className="mb-1.5"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{subject.progress}% accuracy</span>
                      <span>{subject.testsTaken} tests taken</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Improvement Areas */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle size={18} className="text-yellow-500" />
          Improvement Areas
        </h2>
        <div className="space-y-2">
          {weakAreas.map((area, index) => (
            <motion.div
              key={area.topic}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.08, duration: 0.3 }}
            >
              <Card className="border-l-4" style={{ borderLeftColor: area.accuracy < 40 ? '#ef4444' : '#eab308' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{area.topic}</p>
                    <p className="text-xs text-gray-500">{area.subject}</p>
                  </div>
                  <Badge variant={area.accuracy < 40 ? 'error' : 'warning'}>
                    {area.accuracy}% accuracy
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recommended Actions */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Lightbulb size={18} className="text-[#6C5CE7]" />
          Recommended Actions
        </h2>
        <Card variant="elevated" className="space-y-3">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-[#6C5CE7]/10 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp size={12} className="text-[#6C5CE7]" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
            </motion.div>
          ))}
        </Card>
      </motion.div>
    </motion.div>
  )
}
