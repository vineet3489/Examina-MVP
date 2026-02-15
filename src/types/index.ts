export interface Profile {
  id: string
  user_id: string
  name: string
  email: string
  avatar_url: string | null
  exam_type: string
  subscription_status: 'free' | 'premium'
  subscription_expires_at: string | null
  streak_count: number
  streak_last_date: string | null
  created_at: string
}

export interface Question {
  id: string
  subject: 'english' | 'maths' | 'reasoning' | 'gk'
  topic: string
  question_text: string
  options: string[]
  correct_answer: number
  difficulty: number
  explanation: string
  type: 'diagnostic' | 'mock' | 'practice'
}

export interface DiagnosticResult {
  id: string
  user_id: string
  subject: string
  score: number
  total: number
  time_spent: number
  created_at: string
}

export interface StudyPlan {
  id: string
  user_id: string
  plan_data: StudyDay[]
  current_day: number
  started_at: string
}

export interface StudyDay {
  day: number
  date?: string
  tasks: StudyTask[]
  completed: boolean
}

export interface StudyTask {
  subject: string
  topic: string
  type: 'content' | 'practice' | 'revision' | 'test'
  completed: boolean
}

export interface MockTest {
  id: string
  user_id: string
  test_type: string
  started_at: string
  completed_at: string | null
  score: number
  total: number
  time_spent: number
  section_scores: Record<string, { score: number; total: number; time: number }>
}

export interface MockTestAnswer {
  id: string
  mock_test_id: string
  question_id: string
  user_answer: number | null
  is_correct: boolean
  time_spent: number
}

export interface Flashcard {
  id: string
  subject: string
  topic: string
  front_text: string
  back_text: string
  difficulty: number
}

export interface FlashcardProgress {
  id: string
  user_id: string
  flashcard_id: string
  mastery_level: number
  last_reviewed: string
  next_review: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Story {
  id: string
  title: string
  content: string
  image_url: string | null
  type: 'tip' | 'news' | 'motivation'
  active_until: string
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  razorpay_order_id: string
  razorpay_payment_id: string | null
  amount: number
  status: 'created' | 'paid' | 'failed'
  created_at: string
}
