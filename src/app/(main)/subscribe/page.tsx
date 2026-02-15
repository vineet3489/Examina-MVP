'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Crown,
  Check,
  X,
  MessageCircle,
  FileText,
  BarChart3,
  BookOpen,
  Headphones,
  Sparkles,
  ArrowLeft,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

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

interface FeatureRow {
  icon: React.ReactNode
  label: string
  free: string
  premium: string
}

const features: FeatureRow[] = [
  {
    icon: <MessageCircle size={18} className="text-blue-500" />,
    label: 'AI Chats',
    free: '5/day',
    premium: 'Unlimited',
  },
  {
    icon: <FileText size={18} className="text-violet-500" />,
    label: 'Mock Tests',
    free: '1/day',
    premium: 'Unlimited',
  },
  {
    icon: <BarChart3 size={18} className="text-emerald-500" />,
    label: 'Analytics',
    free: 'Basic',
    premium: 'Advanced',
  },
  {
    icon: <BookOpen size={18} className="text-amber-500" />,
    label: 'Study Plan',
    free: 'Generic',
    premium: 'Personalized',
  },
  {
    icon: <Headphones size={18} className="text-pink-500" />,
    label: 'Priority Support',
    free: '',
    premium: 'Included',
  },
]

export default function SubscribePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    async function getEmail() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user?.email) {
          setUserEmail(user.email)
        }
      } catch {
        // ignore
      }
    }
    getEmail()
  }, [])

  const handlePayment = async () => {
    setLoading(true)
    try {
      // Create order
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 2900 }), // 29 rupees in paise
      })
      const { orderId } = await res.json()

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: 2900,
        currency: 'INR',
        name: 'Examina',
        description: 'Premium Weekly Subscription',
        order_id: orderId,
        handler: async (response: any) => {
          // Verify payment
          await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
          router.push('/profile?upgraded=true')
        },
        prefill: { email: userEmail },
        theme: { color: '#6C5CE7' },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Payment error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="px-4 pt-12 pb-24 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Back Button + Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Go Premium</h1>
      </motion.div>

      {/* Hero Section */}
      <motion.div variants={item}>
        <div className="relative rounded-2xl bg-gradient-to-br from-[#6C5CE7] via-purple-600 to-[#a855f7] p-6 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              <Crown size={28} className="text-yellow-300" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Unlock Your Full Potential
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Get unlimited access to AI tutoring, mock tests, and personalized
              study plans to crack your exam.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Feature Comparison */}
      <motion.div variants={item}>
        <h2 className="font-semibold text-gray-900 mb-3">Compare Plans</h2>
        <Card className="p-0 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_70px_70px] px-4 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Feature
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase text-center">
              Free
            </span>
            <span className="text-xs font-semibold text-[#6C5CE7] uppercase text-center">
              Premium
            </span>
          </div>
          {/* Feature Rows */}
          {features.map((feature, index) => (
            <div
              key={feature.label}
              className={`grid grid-cols-[1fr_70px_70px] items-center px-4 py-3 ${
                index < features.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                {feature.icon}
                <span className="text-sm font-medium text-gray-800">
                  {feature.label}
                </span>
              </div>
              <div className="text-center">
                {feature.free ? (
                  <span className="text-xs text-gray-500">{feature.free}</span>
                ) : (
                  <X size={14} className="text-gray-300 mx-auto" />
                )}
              </div>
              <div className="text-center">
                {feature.premium === 'Included' ? (
                  <Check size={16} className="text-green-500 mx-auto" />
                ) : (
                  <span className="text-xs font-semibold text-[#6C5CE7]">
                    {feature.premium}
                  </span>
                )}
              </div>
            </div>
          ))}
        </Card>
      </motion.div>

      {/* Price Card */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-[#6C5CE7]/20 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Sparkles size={16} className="text-[#6C5CE7]" />
            <span className="text-xs font-semibold text-[#6C5CE7] uppercase tracking-wide">
              Best Value
            </span>
          </div>
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="text-4xl font-bold text-gray-900">Rs 29</span>
            <span className="text-sm text-gray-500">/week</span>
          </div>
          <p className="text-xs text-gray-500 mb-5">
            Cancel anytime. No hidden charges.
          </p>
          <Button
            size="lg"
            loading={loading}
            onClick={handlePayment}
            className="w-full"
          >
            <Crown size={18} className="mr-2" />
            Start Premium
          </Button>
          <p className="text-[10px] text-gray-400 mt-3">
            Secured by Razorpay. Recurring weekly subscription.
          </p>
        </Card>
      </motion.div>
    </motion.div>
  )
}
