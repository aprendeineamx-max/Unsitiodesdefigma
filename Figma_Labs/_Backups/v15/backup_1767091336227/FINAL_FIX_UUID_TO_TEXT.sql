-- ==========================================
-- FINAL FIX: Cambiar ID de UUID a TEXT
-- ==========================================
-- Este script elimina RLS policies, constraints, cambia tipos, y recrea todo

-- ==========================================
-- PASO 1: Eliminar todas las políticas RLS
-- ==========================================

-- Eliminar todas las políticas de todas las tablas
DROP POLICY IF EXISTS "Allow all for development" ON users;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Public read access" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;

DROP POLICY IF EXISTS "Allow all for development" ON courses;
DROP POLICY IF EXISTS "Enable read access for all users" ON courses;
DROP POLICY IF EXISTS "Public read access" ON courses;

DROP POLICY IF EXISTS "Allow all for development" ON modules;
DROP POLICY IF EXISTS "Enable read access for all users" ON modules;

DROP POLICY IF EXISTS "Allow all for development" ON lessons;
DROP POLICY IF EXISTS "Enable read access for all users" ON lessons;

DROP POLICY IF EXISTS "Allow all for development" ON posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;

DROP POLICY IF EXISTS "Allow all for development" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Enable read access for all users" ON comments;

DROP POLICY IF EXISTS "Allow all for development" ON likes;
DROP POLICY IF EXISTS "Authenticated users can create likes" ON likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
DROP POLICY IF EXISTS "Enable read access for all users" ON likes;

DROP POLICY IF EXISTS "Allow all for development" ON blog_posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON blog_posts;

DROP POLICY IF EXISTS "Allow all for development" ON badges;
DROP POLICY IF EXISTS "Enable read access for all users" ON badges;

DROP POLICY IF EXISTS "Allow all for development" ON user_badges;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_badges;

DROP POLICY IF EXISTS "Allow all for development" ON achievements;
DROP POLICY IF EXISTS "Enable read access for all users" ON achievements;

DROP POLICY IF EXISTS "Allow all for development" ON challenges;
DROP POLICY IF EXISTS "Enable read access for all users" ON challenges;

DROP POLICY IF EXISTS "Allow all for development" ON user_challenges;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_challenges;

DROP POLICY IF EXISTS "Allow all for development" ON study_groups;
DROP POLICY IF EXISTS "Enable read access for all users" ON study_groups;

DROP POLICY IF EXISTS "Allow all for development" ON forum_posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON forum_posts;

DROP POLICY IF EXISTS "Allow all for development" ON user_progress;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_progress;

DROP POLICY IF EXISTS "Allow all for development" ON enrollments;
DROP POLICY IF EXISTS "Enable read access for all users" ON enrollments;

-- ==========================================
-- PASO 2: Eliminar todas las foreign keys
-- ==========================================

-- Enrollments
ALTER TABLE IF EXISTS enrollments DROP CONSTRAINT IF EXISTS enrollments_user_id_fkey;
ALTER TABLE IF EXISTS enrollments DROP CONSTRAINT IF EXISTS enrollments_course_id_fkey;

-- User Progress
ALTER TABLE IF EXISTS user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;
ALTER TABLE IF EXISTS user_progress DROP CONSTRAINT IF EXISTS user_progress_course_id_fkey;
ALTER TABLE IF EXISTS user_progress DROP CONSTRAINT IF EXISTS user_progress_lesson_id_fkey;

-- User Challenges
ALTER TABLE IF EXISTS user_challenges DROP CONSTRAINT IF EXISTS user_challenges_user_id_fkey;
ALTER TABLE IF EXISTS user_challenges DROP CONSTRAINT IF EXISTS user_challenges_challenge_id_fkey;

-- User Badges
ALTER TABLE IF EXISTS user_badges DROP CONSTRAINT IF EXISTS user_badges_user_id_fkey;
ALTER TABLE IF EXISTS user_badges DROP CONSTRAINT IF EXISTS user_badges_badge_id_fkey;

-- Achievements
ALTER TABLE IF EXISTS achievements DROP CONSTRAINT IF EXISTS achievements_badge_id_fkey;

-- Modules
ALTER TABLE IF EXISTS modules DROP CONSTRAINT IF EXISTS modules_course_id_fkey;

-- Lessons
ALTER TABLE IF EXISTS lessons DROP CONSTRAINT IF EXISTS lessons_module_id_fkey;
ALTER TABLE IF EXISTS lessons DROP CONSTRAINT IF EXISTS lessons_course_id_fkey;

-- Posts
ALTER TABLE IF EXISTS posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

-- Comments
ALTER TABLE IF EXISTS comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE IF EXISTS comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE IF EXISTS comments DROP CONSTRAINT IF EXISTS comments_parent_comment_id_fkey;

-- Likes
ALTER TABLE IF EXISTS likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE IF EXISTS likes DROP CONSTRAINT IF EXISTS likes_post_id_fkey;
ALTER TABLE IF EXISTS likes DROP CONSTRAINT IF EXISTS likes_comment_id_fkey;

-- Blog Posts
ALTER TABLE IF EXISTS blog_posts DROP CONSTRAINT IF EXISTS blog_posts_author_id_fkey;

-- Study Groups
ALTER TABLE IF EXISTS study_groups DROP CONSTRAINT IF EXISTS study_groups_course_id_fkey;
ALTER TABLE IF EXISTS study_groups DROP CONSTRAINT IF EXISTS study_groups_created_by_fkey;

-- Forum Posts
ALTER TABLE IF EXISTS forum_posts DROP CONSTRAINT IF EXISTS forum_posts_user_id_fkey;
ALTER TABLE IF EXISTS forum_posts DROP CONSTRAINT IF EXISTS forum_posts_course_id_fkey;

-- ==========================================
-- PASO 3: Cambiar tipos de columnas
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

-- COMMENTS
ALTER TABLE comments ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE comments ALTER COLUMN post_id TYPE TEXT USING post_id::TEXT;
ALTER TABLE comments ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='comments' AND column_name='parent_comment_id'
  ) THEN
    ALTER TABLE comments ALTER COLUMN parent_comment_id TYPE TEXT USING parent_comment_id::TEXT;
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
-- PASO 4: Recrear foreign keys
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

-- Comments
ALTER TABLE comments ADD CONSTRAINT comments_post_id_fkey 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='parent_comment_id') THEN
    ALTER TABLE comments ADD CONSTRAINT comments_parent_comment_id_fkey 
      FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE;
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
-- PASO 5: Recrear políticas RLS
-- ==========================================

-- Política simple para desarrollo: permitir todo
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
-- ✅ ¡Migración completada!
-- ==========================================
-- 1. Políticas RLS eliminadas y recreadas
-- 2. Foreign keys eliminadas y recreadas
-- 3. Todas las columnas ID ahora son TEXT en lugar de UUID
-- 4. Sistema listo para "Master Data Sync"
