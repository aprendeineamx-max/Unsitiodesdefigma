-- =====================================================
-- SAMPLE DATA FOR ACTIVITY TRACKING SYSTEM
-- =====================================================
-- This script inserts sample data to test the activity tracking features
-- Execute this after running supabase-enhanced-schema.sql
-- =====================================================

-- Note: Replace 'YOUR_USER_ID' with actual user ID from your profiles table
-- You can get a user ID by running: SELECT id FROM profiles LIMIT 1;

-- =====================================================
-- 1. SAMPLE ACTIVITY LOGS (Last 7 days)
-- =====================================================

-- Get a sample user ID (you'll need to replace this with actual ID)
DO $$
DECLARE
  sample_user_id UUID;
  sample_course_id UUID;
BEGIN
  -- Get first user
  SELECT id INTO sample_user_id FROM profiles LIMIT 1;
  
  -- Get first course
  SELECT id INTO sample_course_id FROM courses WHERE status = 'published' LIMIT 1;
  
  -- Only proceed if we have a user
  IF sample_user_id IS NOT NULL THEN
    
    -- Insert activity for last 7 days
    INSERT INTO activity_logs (user_id, date, study_time, xp_earned, lessons_completed, exercises_completed)
    VALUES
      -- 6 days ago
      (sample_user_id, CURRENT_DATE - INTERVAL '6 days', 150, 150, 3, 2),
      -- 5 days ago
      (sample_user_id, CURRENT_DATE - INTERVAL '5 days', 120, 120, 2, 1),
      -- 4 days ago
      (sample_user_id, CURRENT_DATE - INTERVAL '4 days', 180, 200, 4, 3),
      -- 3 days ago
      (sample_user_id, CURRENT_DATE - INTERVAL '3 days', 140, 150, 3, 2),
      -- 2 days ago
      (sample_user_id, CURRENT_DATE - INTERVAL '2 days', 160, 180, 3, 2),
      -- Yesterday
      (sample_user_id, CURRENT_DATE - INTERVAL '1 day', 220, 250, 5, 4),
      -- Today
      (sample_user_id, CURRENT_DATE, 95, 100, 2, 1)
    ON CONFLICT (user_id, date) DO UPDATE
    SET 
      study_time = EXCLUDED.study_time,
      xp_earned = EXCLUDED.xp_earned,
      lessons_completed = EXCLUDED.lessons_completed,
      exercises_completed = EXCLUDED.exercises_completed;

    RAISE NOTICE 'Activity logs inserted for user %', sample_user_id;

    -- =====================================================
    -- 2. SAMPLE DEADLINES
    -- =====================================================

    INSERT INTO deadlines (user_id, course_id, title, description, type, due_date, status, priority)
    VALUES
      -- Upcoming deadline - 3 days
      (
        sample_user_id,
        sample_course_id,
        'Proyecto Final - Curso React',
        'Completar la aplicación de e-commerce con carrito de compras y checkout',
        'project',
        CURRENT_DATE + INTERVAL '3 days',
        'pending',
        'high'
      ),
      -- Upcoming deadline - 5 days
      (
        sample_user_id,
        sample_course_id,
        'Quiz: Hooks Avanzados',
        'Evaluación sobre useState, useEffect, useContext y hooks personalizados',
        'quiz',
        CURRENT_DATE + INTERVAL '5 days',
        'pending',
        'medium'
      ),
      -- Upcoming deadline - 7 days
      (
        sample_user_id,
        sample_course_id,
        'Examen Final del Módulo',
        'Examen comprehensivo del módulo de React Avanzado',
        'exam',
        CURRENT_DATE + INTERVAL '7 days',
        'pending',
        'high'
      ),
      -- Upcoming deadline - 10 days
      (
        sample_user_id,
        NULL,
        'Código de Práctica Diaria',
        'Completar al menos 5 ejercicios de algoritmos',
        'assignment',
        CURRENT_DATE + INTERVAL '10 days',
        'pending',
        'low'
      ),
      -- Upcoming deadline - 14 days
      (
        sample_user_id,
        sample_course_id,
        'Presentación de Proyecto',
        'Presentar el proyecto final ante la clase',
        'milestone',
        CURRENT_DATE + INTERVAL '14 days',
        'pending',
        'urgent'
      )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Deadlines inserted for user %', sample_user_id;

    -- =====================================================
    -- 3. SAMPLE USER PROGRESS (Detailed lesson-level)
    -- =====================================================
    
    -- Insert sample lessons and modules first (if they don't exist)
    -- This is a simplified version - you may need to adjust based on your actual schema
    
    DECLARE
      sample_module_id UUID;
      lesson_ids UUID[];
    BEGIN
      -- Get or create a sample module
      SELECT id INTO sample_module_id 
      FROM modules 
      WHERE course_id = sample_course_id 
      LIMIT 1;
      
      -- Only proceed if we have a module
      IF sample_module_id IS NOT NULL THEN
        -- Get some lesson IDs
        SELECT ARRAY_AGG(id) INTO lesson_ids
        FROM lessons
        WHERE module_id = sample_module_id
        LIMIT 5;
        
        -- Insert progress for lessons
        IF lesson_ids IS NOT NULL AND array_length(lesson_ids, 1) > 0 THEN
          -- Lesson 1: Completed
          INSERT INTO user_progress (
            user_id, course_id, module_id, lesson_id,
            status, progress_percentage, time_spent,
            started_at, completed_at, last_accessed
          ) VALUES (
            sample_user_id,
            sample_course_id,
            sample_module_id,
            lesson_ids[1],
            'completed',
            100,
            1800, -- 30 minutes
            NOW() - INTERVAL '3 days',
            NOW() - INTERVAL '3 days' + INTERVAL '30 minutes',
            NOW() - INTERVAL '3 days'
          ) ON CONFLICT (user_id, lesson_id) DO NOTHING;

          -- Lesson 2: Completed
          INSERT INTO user_progress (
            user_id, course_id, module_id, lesson_id,
            status, progress_percentage, time_spent,
            started_at, completed_at, last_accessed
          ) VALUES (
            sample_user_id,
            sample_course_id,
            sample_module_id,
            lesson_ids[2],
            'completed',
            100,
            2100, -- 35 minutes
            NOW() - INTERVAL '2 days',
            NOW() - INTERVAL '2 days' + INTERVAL '35 minutes',
            NOW() - INTERVAL '2 days'
          ) ON CONFLICT (user_id, lesson_id) DO NOTHING;

          -- Lesson 3: In Progress
          IF array_length(lesson_ids, 1) >= 3 THEN
            INSERT INTO user_progress (
              user_id, course_id, module_id, lesson_id,
              status, progress_percentage, time_spent,
              started_at, last_accessed
            ) VALUES (
              sample_user_id,
              sample_course_id,
              sample_module_id,
              lesson_ids[3],
              'in_progress',
              65,
              900, -- 15 minutes
              NOW() - INTERVAL '1 day',
              NOW() - INTERVAL '1 hour'
            ) ON CONFLICT (user_id, lesson_id) DO NOTHING;
          END IF;

          -- Lesson 4: Not Started
          IF array_length(lesson_ids, 1) >= 4 THEN
            INSERT INTO user_progress (
              user_id, course_id, module_id, lesson_id,
              status, progress_percentage, time_spent,
              last_accessed
            ) VALUES (
              sample_user_id,
              sample_course_id,
              sample_module_id,
              lesson_ids[4],
              'not_started',
              0,
              0,
              NOW()
            ) ON CONFLICT (user_id, lesson_id) DO NOTHING;
          END IF;

          RAISE NOTICE 'User progress inserted for % lessons', array_length(lesson_ids, 1);
        END IF;
      END IF;
    END;

    -- =====================================================
    -- 4. SAMPLE STUDY SESSIONS
    -- =====================================================

    DECLARE
      sample_lesson_id UUID;
    BEGIN
      -- Get a lesson ID
      SELECT id INTO sample_lesson_id FROM lessons LIMIT 1;
      
      IF sample_lesson_id IS NOT NULL THEN
        -- Completed session from 2 days ago
        INSERT INTO study_sessions (
          user_id, course_id, lesson_id,
          started_at, ended_at, duration, focus_score
        ) VALUES (
          sample_user_id,
          sample_course_id,
          sample_lesson_id,
          NOW() - INTERVAL '2 days',
          NOW() - INTERVAL '2 days' + INTERVAL '45 minutes',
          2700, -- 45 minutes in seconds
          85 -- Good focus
        );

        -- Completed session from yesterday
        INSERT INTO study_sessions (
          user_id, course_id, lesson_id,
          started_at, ended_at, duration, focus_score
        ) VALUES (
          sample_user_id,
          sample_course_id,
          sample_lesson_id,
          NOW() - INTERVAL '1 day',
          NOW() - INTERVAL '1 day' + INTERVAL '1 hour',
          3600, -- 1 hour in seconds
          92 -- Excellent focus
        );

        -- Active session (still ongoing)
        INSERT INTO study_sessions (
          user_id, course_id, lesson_id,
          started_at
        ) VALUES (
          sample_user_id,
          sample_course_id,
          sample_lesson_id,
          NOW() - INTERVAL '20 minutes'
        );

        RAISE NOTICE 'Study sessions inserted for user %', sample_user_id;
      END IF;
    END;

  ELSE
    RAISE NOTICE 'No users found in profiles table. Please create a user first.';
  END IF;
END $$;

-- =====================================================
-- 5. VERIFY DATA
-- =====================================================

-- Check activity logs
SELECT 
  date,
  study_time,
  xp_earned,
  lessons_completed
FROM activity_logs
ORDER BY date DESC
LIMIT 10;

-- Check deadlines
SELECT 
  title,
  type,
  due_date,
  status,
  priority,
  EXTRACT(DAY FROM (due_date - NOW())) as days_until_due
FROM deadlines
ORDER BY due_date ASC;

-- Check user progress
SELECT 
  l.title as lesson_title,
  up.status,
  up.progress_percentage,
  up.time_spent / 60 as time_spent_minutes,
  up.last_accessed
FROM user_progress up
JOIN lessons l ON up.lesson_id = l.id
ORDER BY up.last_accessed DESC
LIMIT 10;

-- Check study sessions
SELECT 
  ss.started_at,
  ss.ended_at,
  ss.duration / 60 as duration_minutes,
  ss.focus_score,
  l.title as lesson_title
FROM study_sessions ss
LEFT JOIN lessons l ON ss.lesson_id = l.id
ORDER BY ss.started_at DESC
LIMIT 10;

-- =====================================================
-- 6. TEST VIEWS
-- =====================================================

-- Weekly activity view
SELECT * FROM user_weekly_activity LIMIT 10;

-- Upcoming deadlines view
SELECT 
  title,
  course_title,
  days_until_due,
  priority,
  type
FROM upcoming_deadlines
ORDER BY due_date ASC;

-- Course progress summary
SELECT 
  course_title,
  total_lessons_accessed,
  lessons_completed,
  total_time_spent / 60 as total_hours,
  completion_percentage
FROM course_progress_summary;

-- =====================================================
-- DONE!
-- =====================================================

-- You should now have sample data for:
-- ✓ 7 days of activity logs
-- ✓ 5 upcoming deadlines
-- ✓ Progress on 4 lessons (2 completed, 1 in progress, 1 not started)
-- ✓ 3 study sessions (2 completed, 1 active)

-- The data can be viewed in the Dashboard page at /dashboard
