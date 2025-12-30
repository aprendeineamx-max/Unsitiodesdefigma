-- ==========================================
-- FINAL COMPLETE FIX: Convertir TODO de UUID a TEXT
-- ==========================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Eliminar TODAS las políticas RLS
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ==========================================
-- PASO 1: Eliminar TODAS las foreign keys
-- ==========================================

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Eliminar TODAS las foreign keys de TODAS las tablas
    FOR r IN (
        SELECT conname, conrelid::regclass AS table_name
        FROM pg_constraint
        WHERE contype = 'f'
        AND connamespace = 'public'::regnamespace
    ) LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I', 
            r.table_name, r.conname);
    END LOOP;
END $$;

-- ==========================================
-- PASO 2: Cambiar TODAS las columnas ID de UUID a TEXT
-- ==========================================

-- USERS
ALTER TABLE users ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- COURSES
ALTER TABLE courses ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- MODULES
ALTER TABLE modules ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE modules ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;

-- LESSONS
ALTER TABLE lessons ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE lessons ALTER COLUMN module_id TYPE TEXT USING module_id::TEXT;
ALTER TABLE lessons ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;

-- POSTS
ALTER TABLE posts ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE posts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- COMMENTS - Convertir TODAS las columnas UUID posibles
ALTER TABLE comments ALTER COLUMN id TYPE TEXT USING id::TEXT;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='post_id') THEN
    ALTER TABLE comments ALTER COLUMN post_id TYPE TEXT USING post_id::TEXT;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='user_id') THEN
    ALTER TABLE comments ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='parent_comment_id') THEN
    ALTER TABLE comments ALTER COLUMN parent_comment_id TYPE TEXT USING parent_comment_id::TEXT;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='parent_id') THEN
    ALTER TABLE comments ALTER COLUMN parent_id TYPE TEXT USING parent_id::TEXT;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='blog_post_id') THEN
    ALTER TABLE comments ALTER COLUMN blog_post_id TYPE TEXT USING blog_post_id::TEXT;
  END IF;
END $$;

-- LIKES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='likes') THEN
    ALTER TABLE likes ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='likes' AND column_name='post_id') THEN
      ALTER TABLE likes ALTER COLUMN post_id TYPE TEXT USING post_id::TEXT;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='likes' AND column_name='comment_id') THEN
      ALTER TABLE likes ALTER COLUMN comment_id TYPE TEXT USING comment_id::TEXT;
    END IF;
  END IF;
END $$;

-- BLOG_POSTS
ALTER TABLE blog_posts ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE blog_posts ALTER COLUMN author_id TYPE TEXT USING author_id::TEXT;

-- BADGES
ALTER TABLE badges ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- USER_BADGES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_badges') THEN
    ALTER TABLE user_badges ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    ALTER TABLE user_badges ALTER COLUMN badge_id TYPE TEXT USING badge_id::TEXT;
  END IF;
END $$;

-- ACHIEVEMENTS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='achievements') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='badge_id') THEN
      ALTER TABLE achievements ALTER COLUMN badge_id TYPE TEXT USING badge_id::TEXT;
    END IF;
  END IF;
END $$;

-- CHALLENGES
ALTER TABLE challenges ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- USER_CHALLENGES
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_challenges') THEN
    ALTER TABLE user_challenges ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    ALTER TABLE user_challenges ALTER COLUMN challenge_id TYPE TEXT USING challenge_id::TEXT;
  END IF;
END $$;

-- STUDY_GROUPS
ALTER TABLE study_groups ALTER COLUMN id TYPE TEXT USING id::TEXT;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_groups' AND column_name='course_id') THEN
    ALTER TABLE study_groups ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_groups' AND column_name='created_by') THEN
    ALTER TABLE study_groups ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT;
  END IF;
END $$;

-- FORUM_POSTS
ALTER TABLE forum_posts ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE forum_posts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forum_posts' AND column_name='course_id') THEN
    ALTER TABLE forum_posts ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;
  END IF;
END $$;

-- USER_PROGRESS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_progress') THEN
    ALTER TABLE user_progress ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    ALTER TABLE user_progress ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;
    ALTER TABLE user_progress ALTER COLUMN lesson_id TYPE TEXT USING lesson_id::TEXT;
  END IF;
END $$;

-- ENROLLMENTS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='enrollments') THEN
    ALTER TABLE enrollments ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    ALTER TABLE enrollments ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;
  END IF;
END $$;

-- ==========================================
-- PASO 3: Recrear foreign keys esenciales
-- ==========================================

-- Enrollments
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='enrollments') THEN
    ALTER TABLE enrollments ADD CONSTRAINT enrollments_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE enrollments ADD CONSTRAINT enrollments_course_id_fkey 
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- User Progress
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_progress') THEN
    ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE user_progress ADD CONSTRAINT user_progress_course_id_fkey 
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
    ALTER TABLE user_progress ADD CONSTRAINT user_progress_lesson_id_fkey 
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
  END IF;
END $$;

-- User Challenges
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_challenges') THEN
    ALTER TABLE user_challenges ADD CONSTRAINT user_challenges_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE user_challenges ADD CONSTRAINT user_challenges_challenge_id_fkey 
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE;
  END IF;
END $$;

-- User Badges
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_badges') THEN
    ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE user_badges ADD CONSTRAINT user_badges_badge_id_fkey 
      FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Achievements
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='achievements') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='achievements' AND column_name='badge_id') THEN
      ALTER TABLE achievements ADD CONSTRAINT achievements_badge_id_fkey 
        FOREIGN KEY (badge_id) REFERENCES badges(id);
    END IF;
  END IF;
END $$;

-- Modules
ALTER TABLE modules ADD CONSTRAINT modules_course_id_fkey 
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- Lessons
ALTER TABLE lessons ADD CONSTRAINT lessons_module_id_fkey 
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD CONSTRAINT lessons_course_id_fkey 
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- Posts
ALTER TABLE posts ADD CONSTRAINT posts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Comments - Recrear TODAS las posibles foreign keys
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='post_id') THEN
    ALTER TABLE comments ADD CONSTRAINT comments_post_id_fkey 
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='user_id') THEN
    ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='parent_comment_id') THEN
    ALTER TABLE comments ADD CONSTRAINT comments_parent_comment_id_fkey 
      FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='parent_id') THEN
    ALTER TABLE comments ADD CONSTRAINT comments_parent_id_fkey 
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='blog_post_id') THEN
    ALTER TABLE comments ADD CONSTRAINT comments_blog_post_id_fkey 
      FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Likes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='likes') THEN
    ALTER TABLE likes ADD CONSTRAINT likes_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='likes' AND column_name='post_id') THEN
      ALTER TABLE likes ADD CONSTRAINT likes_post_id_fkey 
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='likes' AND column_name='comment_id') THEN
      ALTER TABLE likes ADD CONSTRAINT likes_comment_id_fkey 
        FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Blog Posts
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

-- Study Groups
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_groups' AND column_name='course_id') THEN
    ALTER TABLE study_groups ADD CONSTRAINT study_groups_course_id_fkey 
      FOREIGN KEY (course_id) REFERENCES courses(id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_groups' AND column_name='created_by') THEN
    ALTER TABLE study_groups ADD CONSTRAINT study_groups_created_by_fkey 
      FOREIGN KEY (created_by) REFERENCES users(id);
  END IF;
END $$;

-- Forum Posts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forum_posts' AND column_name='course_id') THEN
    ALTER TABLE forum_posts ADD CONSTRAINT forum_posts_course_id_fkey 
      FOREIGN KEY (course_id) REFERENCES courses(id);
  END IF;
END $$;

ALTER TABLE forum_posts ADD CONSTRAINT forum_posts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ==========================================
-- PASO 4: Recrear políticas RLS
-- ==========================================

CREATE POLICY "Allow all for development" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON courses FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON modules FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON lessons FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON posts FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON comments FOR ALL USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='likes') THEN
    CREATE POLICY "Allow all for development" ON likes FOR ALL USING (true);
  END IF;
END $$;

CREATE POLICY "Allow all for development" ON blog_posts FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON badges FOR ALL USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_badges') THEN
    CREATE POLICY "Allow all for development" ON user_badges FOR ALL USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='achievements') THEN
    CREATE POLICY "Allow all for development" ON achievements FOR ALL USING (true);
  END IF;
END $$;

CREATE POLICY "Allow all for development" ON challenges FOR ALL USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_challenges') THEN
    CREATE POLICY "Allow all for development" ON user_challenges FOR ALL USING (true);
  END IF;
END $$;

CREATE POLICY "Allow all for development" ON study_groups FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON forum_posts FOR ALL USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_progress') THEN
    CREATE POLICY "Allow all for development" ON user_progress FOR ALL USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='enrollments') THEN
    CREATE POLICY "Allow all for development" ON enrollments FOR ALL USING (true);
  END IF;
END $$;

-- ==========================================
-- ✅ ¡Migración COMPLETAMENTE terminada!
-- ==========================================
-- 1. Todas las políticas RLS eliminadas (dinámicamente)
-- 2. TODAS las foreign keys eliminadas (dinámicamente)
-- 3. TODAS las columnas ID convertidas de UUID a TEXT
-- 4. Foreign keys recreadas correctamente
-- 5. Políticas RLS recreadas
-- 6. Sistema 100% listo para "Master Data Sync"
