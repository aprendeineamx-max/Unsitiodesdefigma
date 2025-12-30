-- ==========================================
-- SOLUCIÓN DEFINITIVA: Basada en datos REALES
-- ==========================================
-- Este script:
-- 1. Elimina políticas RLS
-- 2. Elimina foreign keys
-- 3. BORRA todos los datos existentes
-- 4. Convierte UUID → TEXT
-- 5. Recrea todo

-- ==========================================
-- PASO 1: Eliminar políticas RLS
-- ==========================================
DO $$ 
DECLARE
    r RECORD;
BEGIN
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
-- PASO 2: Eliminar TODAS las foreign keys
-- ==========================================
DO $$
DECLARE
    r RECORD;
BEGIN
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
-- PASO 3: BORRAR todos los datos existentes
-- ==========================================
TRUNCATE TABLE user_progress CASCADE;
TRUNCATE TABLE user_challenges CASCADE;
TRUNCATE TABLE user_badges CASCADE;
TRUNCATE TABLE enrollments CASCADE;
TRUNCATE TABLE likes CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE posts CASCADE;
TRUNCATE TABLE blog_posts CASCADE;
TRUNCATE TABLE forum_posts CASCADE;
TRUNCATE TABLE followers CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE achievements CASCADE;
TRUNCATE TABLE lessons CASCADE;
TRUNCATE TABLE modules CASCADE;
TRUNCATE TABLE study_groups CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE challenges CASCADE;
TRUNCATE TABLE badges CASCADE;
TRUNCATE TABLE profiles CASCADE;
TRUNCATE TABLE users CASCADE;

-- ==========================================
-- PASO 4: Convertir UUID → TEXT (TODAS las columnas identificadas)
-- ==========================================

-- ACHIEVEMENTS
ALTER TABLE achievements ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE achievements ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- BADGES
ALTER TABLE badges ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- BLOG_POSTS
ALTER TABLE blog_posts ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE blog_posts ALTER COLUMN author_id TYPE TEXT USING author_id::TEXT;

-- CHALLENGES
ALTER TABLE challenges ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- COMMENTS
ALTER TABLE comments ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE comments ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE comments ALTER COLUMN post_id TYPE TEXT USING post_id::TEXT;
ALTER TABLE comments ALTER COLUMN parent_id TYPE TEXT USING parent_id::TEXT;
ALTER TABLE comments ALTER COLUMN blog_post_id TYPE TEXT USING blog_post_id::TEXT;

-- COURSES
ALTER TABLE courses ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE courses ALTER COLUMN instructor_id TYPE TEXT USING instructor_id::TEXT;

-- ENROLLMENTS
ALTER TABLE enrollments ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE enrollments ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE enrollments ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;

-- FOLLOWERS
ALTER TABLE followers ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE followers ALTER COLUMN follower_id TYPE TEXT USING follower_id::TEXT;
ALTER TABLE followers ALTER COLUMN following_id TYPE TEXT USING following_id::TEXT;

-- FORUM_POSTS
ALTER TABLE forum_posts ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE forum_posts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE forum_posts ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;

-- LESSONS
ALTER TABLE lessons ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE lessons ALTER COLUMN module_id TYPE TEXT USING module_id::TEXT;
ALTER TABLE lessons ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;

-- LIKES
ALTER TABLE likes ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE likes ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE likes ALTER COLUMN post_id TYPE TEXT USING post_id::TEXT;
ALTER TABLE likes ALTER COLUMN comment_id TYPE TEXT USING comment_id::TEXT;
ALTER TABLE likes ALTER COLUMN blog_post_id TYPE TEXT USING blog_post_id::TEXT;

-- MODULES
ALTER TABLE modules ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE modules ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;

-- NOTIFICATIONS
ALTER TABLE notifications ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE notifications ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- POSTS
ALTER TABLE posts ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE posts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- PROFILES
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- STUDY_GROUPS
ALTER TABLE study_groups ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE study_groups ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;
ALTER TABLE study_groups ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT;

-- USER_BADGES
ALTER TABLE user_badges ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE user_badges ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE user_badges ALTER COLUMN badge_id TYPE TEXT USING badge_id::TEXT;

-- USER_CHALLENGES
ALTER TABLE user_challenges ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE user_challenges ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE user_challenges ALTER COLUMN challenge_id TYPE TEXT USING challenge_id::TEXT;

-- USER_PROGRESS
ALTER TABLE user_progress ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE user_progress ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE user_progress ALTER COLUMN course_id TYPE TEXT USING course_id::TEXT;
ALTER TABLE user_progress ALTER COLUMN lesson_id TYPE TEXT USING lesson_id::TEXT;

-- USERS
ALTER TABLE users ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- ==========================================
-- PASO 5: Recrear foreign keys esenciales
-- ==========================================

-- ACHIEVEMENTS
ALTER TABLE achievements ADD CONSTRAINT achievements_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- BLOG_POSTS
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

-- COMMENTS
ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_post_id_fkey 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_parent_id_fkey 
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_blog_post_id_fkey 
  FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;

-- COURSES
ALTER TABLE courses ADD CONSTRAINT courses_instructor_id_fkey 
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE;

-- ENROLLMENTS
ALTER TABLE enrollments ADD CONSTRAINT enrollments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE enrollments ADD CONSTRAINT enrollments_course_id_fkey 
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- FOLLOWERS
ALTER TABLE followers ADD CONSTRAINT followers_follower_id_fkey 
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE followers ADD CONSTRAINT followers_following_id_fkey 
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE;

-- FORUM_POSTS
ALTER TABLE forum_posts ADD CONSTRAINT forum_posts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE forum_posts ADD CONSTRAINT forum_posts_course_id_fkey 
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- LESSONS
ALTER TABLE lessons ADD CONSTRAINT lessons_module_id_fkey 
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD CONSTRAINT lessons_course_id_fkey 
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- LIKES
ALTER TABLE likes ADD CONSTRAINT likes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE likes ADD CONSTRAINT likes_post_id_fkey 
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE likes ADD CONSTRAINT likes_comment_id_fkey 
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE likes ADD CONSTRAINT likes_blog_post_id_fkey 
  FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;

-- MODULES
ALTER TABLE modules ADD CONSTRAINT modules_course_id_fkey 
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- NOTIFICATIONS
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- POSTS
ALTER TABLE posts ADD CONSTRAINT posts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- PROFILES
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;

-- STUDY_GROUPS
ALTER TABLE study_groups ADD CONSTRAINT study_groups_course_id_fkey 
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE study_groups ADD CONSTRAINT study_groups_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

-- USER_BADGES
ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_badges ADD CONSTRAINT user_badges_badge_id_fkey 
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE;

-- USER_CHALLENGES
ALTER TABLE user_challenges ADD CONSTRAINT user_challenges_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_challenges ADD CONSTRAINT user_challenges_challenge_id_fkey 
  FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE;

-- USER_PROGRESS
ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_progress ADD CONSTRAINT user_progress_course_id_fkey 
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE user_progress ADD CONSTRAINT user_progress_lesson_id_fkey 
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;

-- ==========================================
-- PASO 6: Recrear políticas RLS
-- ==========================================

CREATE POLICY "Allow all for development" ON achievements FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON badges FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON blog_posts FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON challenges FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON comments FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON courses FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON enrollments FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON followers FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON forum_posts FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON lessons FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON likes FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON modules FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON posts FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON study_groups FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON user_badges FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON user_challenges FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON user_progress FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON users FOR ALL USING (true);

-- ==========================================
-- ✅ ¡COMPLETADO!
-- ==========================================
-- Base de datos lista para Master Data Sync:
-- ✓ Todas las tablas vacías
-- ✓ Todas las columnas ID convertidas a TEXT
-- ✓ Foreign keys recreadas
-- ✓ RLS configurado
