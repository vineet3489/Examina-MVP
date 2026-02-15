'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Settings,
  Bell,
  Info,
  LogOut,
  Crown,
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  full_name: string
  email: string
  avatar_url?: string
  exam_type?: string
  subscription_status?: string
  subscription_expires_at?: string
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

const mockStats = {
  testsTaken: 12,
  studyStreak: 7,
  questionsSolved: 340,
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

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

          setProfile({
            full_name: profileData?.full_name || user.user_metadata?.full_name || 'Student',
            email: user.email || '',
            avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url,
            exam_type: profileData?.exam_type || 'SSC CGL',
            subscription_status: profileData?.subscription_status || 'free',
            subscription_expires_at: profileData?.subscription_expires_at,
          })
        }
      } catch {
        // fallback
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      setSigningOut(false)
    }
  }

  const isPremium = profile?.subscription_status === 'premium'
  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'ST'

  const expiryDate = profile?.subscription_expires_at
    ? new Date(profile.subscription_expires_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-[#6C5CE7] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      className="px-4 pt-12 pb-24 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Avatar and User Info */}
      <motion.div variants={item} className="flex flex-col items-center text-center">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-3"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6C5CE7] to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg mb-3">
            {initials}
          </div>
        )}
        <h1 className="text-xl font-bold text-gray-900">
          {profile?.full_name || 'Student'}
        </h1>
        <p className="text-sm text-gray-500">{profile?.email}</p>
        <div className="mt-2">
          <Badge variant="purple">{profile?.exam_type || 'SSC CGL'}</Badge>
        </div>
      </motion.div>

      {/* Subscription Card */}
      <motion.div variants={item}>
        {isPremium ? (
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Crown size={20} className="text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">Premium Plan</h3>
                    <Badge variant="success">Active</Badge>
                  </div>
                  {expiryDate && (
                    <p className="text-xs text-gray-500">
                      Expires on {expiryDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Crown size={20} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Free Plan</h3>
                  <p className="text-xs text-gray-500">
                    Limited features available
                  </p>
                </div>
              </div>
              <Link
                href="/subscribe"
                className="px-4 py-2 rounded-xl bg-[#6C5CE7] text-white text-sm font-semibold shadow-lg shadow-[#6C5CE7]/25 hover:bg-[#5A4BD1] transition-colors"
              >
                Upgrade
              </Link>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <Card className="flex flex-col items-center py-4">
          <p className="text-2xl font-bold text-[#6C5CE7]">
            {mockStats.testsTaken}
          </p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">
            Tests Taken
          </p>
        </Card>
        <Card className="flex flex-col items-center py-4">
          <p className="text-2xl font-bold text-[#E84393]">
            {mockStats.studyStreak}
          </p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">
            Study Streak
          </p>
        </Card>
        <Card className="flex flex-col items-center py-4">
          <p className="text-2xl font-bold text-[#00B894]">
            {mockStats.questionsSolved}
          </p>
          <p className="text-[11px] text-gray-500 font-medium mt-1">
            Solved
          </p>
        </Card>
      </motion.div>

      {/* Settings List */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-gray-900 mb-3">Settings</h2>
        <Card className="divide-y divide-gray-50 p-0 overflow-hidden">
          {/* Subscription */}
          <Link
            href="/subscribe"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <Crown size={18} className="text-violet-600" />
              </div>
              <span className="text-sm font-medium text-gray-800">
                Subscription
              </span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>

          {/* Notifications */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Bell size={18} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-800">
                Notifications
              </span>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
                notificationsEnabled ? 'bg-[#6C5CE7]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 shadow-sm ${
                  notificationsEnabled
                    ? 'translate-x-[22px]'
                    : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* About Examina */}
          <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Info size={18} className="text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-800">
                About Examina
              </span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <LogOut size={18} className="text-red-500" />
            </div>
            <span className="text-sm font-medium text-red-500">
              {signingOut ? 'Signing Out...' : 'Sign Out'}
            </span>
          </button>
        </Card>
      </motion.div>

      {/* App Version */}
      <motion.div variants={item} className="text-center">
        <p className="text-xs text-gray-400">Examina v1.0.0</p>
      </motion.div>
    </motion.div>
  )
}
