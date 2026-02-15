-- Examina Database Schema
-- Run this in Supabase SQL Editor

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  avatar_url TEXT,
  exam_type TEXT DEFAULT '',
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  streak_count INTEGER DEFAULT 0,
  streak_last_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diagnostic results
CREATE TABLE IF NOT EXISTS diagnostic_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study plans
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_data JSONB NOT NULL DEFAULT '[]',
  current_day INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions bank
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  explanation TEXT DEFAULT '',
  type TEXT DEFAULT 'practice' CHECK (type IN ('diagnostic', 'mock', 'practice')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mock tests
CREATE TABLE IF NOT EXISTS mock_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_type TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  score INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  section_scores JSONB DEFAULT '{}'
);

-- Mock test answers
CREATE TABLE IF NOT EXISTS mock_test_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mock_test_id UUID REFERENCES mock_tests(id) ON DELETE CASCADE NOT NULL,
  question_id UUID,
  user_answer INTEGER,
  is_correct BOOLEAN DEFAULT FALSE,
  time_spent INTEGER DEFAULT 0
);

-- Flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User flashcard progress
CREATE TABLE IF NOT EXISTS user_flashcard_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  flashcard_id UUID REFERENCES flashcards(id) ON DELETE CASCADE NOT NULL,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 3),
  last_reviewed TIMESTAMPTZ DEFAULT NOW(),
  next_review TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, flashcard_id)
);

-- AI chat history
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories
CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  type TEXT DEFAULT 'tip' CHECK (type IN ('tip', 'news', 'motivation')),
  active_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own diagnostic results" ON diagnostic_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diagnostic results" ON diagnostic_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own study plans" ON study_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study plans" ON study_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study plans" ON study_plans FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own mock tests" ON mock_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mock tests" ON mock_tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mock tests" ON mock_tests FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own mock test answers" ON mock_test_answers FOR SELECT USING (
  mock_test_id IN (SELECT id FROM mock_tests WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own mock test answers" ON mock_test_answers FOR INSERT WITH CHECK (
  mock_test_id IN (SELECT id FROM mock_tests WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own flashcard progress" ON user_flashcard_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own flashcard progress" ON user_flashcard_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcard progress" ON user_flashcard_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat history" ON ai_chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat history" ON ai_chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat history" ON ai_chat_history FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read for questions, flashcards, and stories
CREATE POLICY "Anyone can view questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Anyone can view flashcards" ON flashcards FOR SELECT USING (true);
CREATE POLICY "Anyone can view active stories" ON stories FOR SELECT USING (active_until > NOW());

-- Indexes for performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_diagnostic_results_user_id ON diagnostic_results(user_id);
CREATE INDEX idx_mock_tests_user_id ON mock_tests(user_id);
CREATE INDEX idx_questions_subject ON questions(subject);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_flashcards_subject ON flashcards(subject);
CREATE INDEX idx_stories_active ON stories(active_until);

-- Seed some stories
INSERT INTO stories (title, content, type, active_until) VALUES
('SSC CGL 2025 Notification', 'SSC CGL 2025 exam dates announced! Start preparing now with Examina.', 'news', NOW() + INTERVAL '30 days'),
('Grammar Tip', 'Remember: "Neither...nor" always takes a singular verb when both subjects are singular. Example: Neither Ram nor Shyam was present.', 'tip', NOW() + INTERVAL '7 days'),
('Stay Motivated!', 'Every expert was once a beginner. Keep pushing forward - your SSC dream is achievable!', 'motivation', NOW() + INTERVAL '7 days'),
('Quick Math Trick', 'To find % change: (Change/Original) x 100. This works for profit, loss, discount, and population problems!', 'tip', NOW() + INTERVAL '7 days'),
('Success Story', 'Priya scored 195/200 in SSC CGL after 3 months of dedicated preparation. You can do it too!', 'motivation', NOW() + INTERVAL '7 days');
