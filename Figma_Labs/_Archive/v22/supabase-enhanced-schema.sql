-- =====================================================
-- ENHANCED SCHEMA FOR ACTIVITY TRACKING & PROGRESS
-- =====================================================
-- Execute this SQL in your Supabase SQL Editor
-- This extends the existing schema with new tables
-- =====================================================

-- =====================================================
-- USER_PROGRESS TABLE (Detailed lesson-level tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  
  -- Progress tracking
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_spent INTEGER DEFAULT 0, -- in seconds
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  
  UNIQUE(user_id, lesson_id)
);

-- =====================================================
-- ACTIVITY_LOGS TABLE (Daily activity tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Activity data
  date DATE NOT NULL,
  study_time INTEGER DEFAULT 0, -- in minutes
  xp_earned INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  
  -- Activity breakdown by course
  course_activities JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  
  UNIQUE(user_id, date)
);

-- =====================================================
-- DEADLINES TABLE (Course/project deadlines)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.deadlines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  
  -- Deadline details
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('assignment', 'project', 'quiz', 'exam', 'milestone')) DEFAULT 'assignment',
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'submitted', 'completed', 'overdue')) DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- =====================================================
-- STUDY_SESSIONS TABLE (Individual study sessions)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  
  -- Session data
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds, calculated when session ends
  
  -- Metrics
  focus_score INTEGER CHECK (focus_score >= 0 AND focus_score <= 100), -- Optional: tracking focus
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- =====================================================
-- LESSONS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  duration INTEGER DEFAULT 0, -- in minutes
  order_index INTEGER DEFAULT 0,
  type TEXT CHECK (type IN ('video', 'reading', 'quiz', 'exercise', 'project')) DEFAULT 'video',
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- =====================================================
-- MODULES TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON public.user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON public.user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON public.user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_accessed ON public.user_progress(last_accessed DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON public.activity_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, date);

CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON public.deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON public.deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON public.deadlines(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_status ON public.deadlines(user_id, status);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON public.study_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_course_id ON public.study_sessions(course_id);

CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);

-- =====================================================
-- FUNCTIONS - Update activity logs automatically
-- =====================================================

-- Function to update activity log when progress is made
CREATE OR REPLACE FUNCTION update_activity_log()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update activity log for today
  INSERT INTO public.activity_logs (
    user_id,
    date,
    study_time,
    xp_earned,
    lessons_completed,
    updated_at
  )
  VALUES (
    NEW.user_id,
    CURRENT_DATE,
    COALESCE(NEW.time_spent / 60, 0), -- Convert seconds to minutes
    CASE WHEN NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN 50 ELSE 0 END,
    CASE WHEN NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN 1 ELSE 0 END,
    NOW()
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    study_time = public.activity_logs.study_time + COALESCE(NEW.time_spent / 60, 0),
    xp_earned = public.activity_logs.xp_earned + CASE WHEN NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN 50 ELSE 0 END,
    lessons_completed = public.activity_logs.lessons_completed + CASE WHEN NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN 1 ELSE 0 END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update activity log
DROP TRIGGER IF EXISTS trigger_update_activity_log ON public.user_progress;
CREATE TRIGGER trigger_update_activity_log
  AFTER INSERT OR UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_log();

-- Function to update user XP and level
CREATE OR REPLACE FUNCTION update_user_xp()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user profile with new XP
  UPDATE public.profiles
  SET 
    xp = xp + NEW.xp_earned,
    level = FLOOR((xp + NEW.xp_earned) / 1000) + 1,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user XP
DROP TRIGGER IF EXISTS trigger_update_user_xp ON public.activity_logs;
CREATE TRIGGER trigger_update_user_xp
  AFTER INSERT OR UPDATE ON public.activity_logs
  FOR EACH ROW
  WHEN (NEW.xp_earned > 0)
  EXECUTE FUNCTION update_user_xp();

-- Function to auto-update deadline status
CREATE OR REPLACE FUNCTION update_deadline_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark as overdue if past due date and not completed
  IF NEW.due_date < NOW() AND NEW.status = 'pending' THEN
    NEW.status = 'overdue';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update deadline status
DROP TRIGGER IF EXISTS trigger_update_deadline_status ON public.deadlines;
CREATE TRIGGER trigger_update_deadline_status
  BEFORE INSERT OR UPDATE ON public.deadlines
  FOR EACH ROW
  EXECUTE FUNCTION update_deadline_status();

-- =====================================================
-- SAMPLE DATA for Testing
-- =====================================================

-- Note: Insert sample data after creating test users and courses
-- Example activity logs for the last 7 days
/*
INSERT INTO public.activity_logs (user_id, date, study_time, xp_earned, lessons_completed)
VALUES
  ((SELECT id FROM public.profiles LIMIT 1), CURRENT_DATE - INTERVAL '6 days', 150, 150, 3),
  ((SELECT id FROM public.profiles LIMIT 1), CURRENT_DATE - INTERVAL '5 days', 120, 120, 2),
  ((SELECT id FROM public.profiles LIMIT 1), CURRENT_DATE - INTERVAL '4 days', 180, 180, 4),
  ((SELECT id FROM public.profiles LIMIT 1), CURRENT_DATE - INTERVAL '3 days', 140, 140, 3),
  ((SELECT id FROM public.profiles LIMIT 1), CURRENT_DATE - INTERVAL '2 days', 160, 160, 3),
  ((SELECT id FROM public.profiles LIMIT 1), CURRENT_DATE - INTERVAL '1 day', 220, 220, 5),
  ((SELECT id FROM public.profiles LIMIT 1), CURRENT_DATE, 190, 190, 4);
*/

-- =====================================================
-- VIEWS for Easy Querying
-- =====================================================

-- View for user weekly activity
CREATE OR REPLACE VIEW user_weekly_activity AS
SELECT 
  user_id,
  date,
  study_time,
  xp_earned,
  lessons_completed,
  EXTRACT(DOW FROM date) as day_of_week,
  TO_CHAR(date, 'Day') as day_name
FROM public.activity_logs
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;

-- View for upcoming deadlines
CREATE OR REPLACE VIEW upcoming_deadlines AS
SELECT 
  d.*,
  c.title as course_title,
  EXTRACT(DAY FROM (d.due_date - NOW())) as days_until_due
FROM public.deadlines d
LEFT JOIN public.courses c ON d.course_id = c.id
WHERE d.status IN ('pending', 'overdue')
  AND d.due_date >= NOW()
ORDER BY d.due_date ASC;

-- View for course progress summary
CREATE OR REPLACE VIEW course_progress_summary AS
SELECT 
  up.user_id,
  up.course_id,
  c.title as course_title,
  COUNT(DISTINCT up.lesson_id) as total_lessons_accessed,
  COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.lesson_id END) as lessons_completed,
  SUM(up.time_spent) as total_time_spent,
  ROUND(
    (COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.lesson_id END)::DECIMAL / 
    NULLIF(COUNT(DISTINCT up.lesson_id), 0)) * 100, 
    2
  ) as completion_percentage
FROM public.user_progress up
LEFT JOIN public.courses c ON up.course_id = c.id
GROUP BY up.user_id, up.course_id, c.title;

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for user_progress
CREATE POLICY "Users can view their own progress" 
  ON public.user_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
  ON public.user_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
  ON public.user_progress FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policies for activity_logs
CREATE POLICY "Users can view their own activity" 
  ON public.activity_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" 
  ON public.activity_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity" 
  ON public.activity_logs FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policies for deadlines
CREATE POLICY "Users can view their own deadlines" 
  ON public.deadlines FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deadlines" 
  ON public.deadlines FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deadlines" 
  ON public.deadlines FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deadlines" 
  ON public.deadlines FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies for study_sessions
CREATE POLICY "Users can view their own study sessions" 
  ON public.study_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" 
  ON public.study_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" 
  ON public.study_sessions FOR UPDATE 
  USING (auth.uid() = user_id);
