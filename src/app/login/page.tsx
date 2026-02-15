'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BookOpen, Brain, BarChart3, Target, Mail } from 'lucide-react'

const slides = [
  {
    icon: Brain,
    title: '100% Personalized Learning',
    description: 'AI-powered study plans tailored just for you',
    gradient: 'from-[#6C5CE7] to-[#a855f7]',
  },
  {
    icon: BookOpen,
    title: '24/7 AI Tutor',
    description: 'Get instant doubt solving anytime, anywhere',
    gradient: 'from-[#7C3AED] to-[#6C5CE7]',
  },
  {
    icon: Target,
    title: 'Smart Mock Tests',
    description: 'Practice with real SSC-level questions & analytics',
    gradient: 'from-[#8B5CF6] to-[#7C3AED]',
  },
  {
    icon: BarChart3,
    title: 'Track Your Progress',
    description: 'Predictive analytics to guarantee your success',
    gradient: 'from-[#a855f7] to-[#8B5CF6]',
  },
]

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) =>
  Math.abs(offset) * velocity

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

export default function LoginPage() {
  const [[currentSlide, direction], setSlide] = useState([0, 0])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const paginate = useCallback(
    (newDirection: number) => {
      const nextSlide = currentSlide + newDirection
      if (nextSlide >= 0 && nextSlide < slides.length) {
        setSlide([nextSlide, newDirection])
      }
    },
    [currentSlide]
  )

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipe = swipePower(info.offset.x, info.velocity.x)
    if (swipe < -swipeConfidenceThreshold) {
      paginate(1)
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        console.error('Google sign-in error:', error.message)
        setLoading(false)
      }
    } catch (err) {
      console.error('Sign-in failed:', err)
      setLoading(false)
    }
  }

  const handleEmailSignIn = () => {
    router.push('/login/email')
  }

  const slide = slides[currentSlide]
  const SlideIcon = slide.icon

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {/* Carousel Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
        <div className="w-full max-w-sm relative overflow-hidden" style={{ minHeight: '320px' }}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing"
            >
              {/* Gradient Circle with Icon */}
              <div
                className={`w-40 h-40 rounded-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center mb-8 shadow-xl shadow-[#6C5CE7]/20`}
              >
                <SlideIcon className="w-16 h-16 text-white" strokeWidth={1.5} />
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-3 px-4">
                {slide.title}
              </h2>
              <p className="text-base text-gray-500 px-6 leading-relaxed">
                {slide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot Indicators */}
        <div className="flex gap-2 mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setSlide([index, index > currentSlide ? 1 : -1])}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 h-2.5 bg-[#6C5CE7]'
                  : 'w-2.5 h-2.5 bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Auth Buttons Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="px-6 pb-8 space-y-3 w-full max-w-sm mx-auto"
      >
        {/* Google Sign In */}
        <Button
          size="lg"
          variant="primary"
          onClick={handleGoogleSignIn}
          loading={loading}
          className="w-full gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Email Sign In */}
        <Button
          size="lg"
          variant="outline"
          onClick={handleEmailSignIn}
          className="w-full gap-3"
        >
          <Mail className="w-5 h-5" />
          Continue with Email
        </Button>

        {/* Terms */}
        <p className="text-xs text-center text-gray-400 pt-2">
          By continuing, you agree to our{' '}
          <span className="underline text-gray-500">Terms</span> &{' '}
          <span className="underline text-gray-500">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  )
}
