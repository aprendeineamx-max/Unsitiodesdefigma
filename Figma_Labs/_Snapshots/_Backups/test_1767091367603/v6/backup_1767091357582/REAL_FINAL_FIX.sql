-- ==========================================
-- SOLUCIÓN REAL Y DEFINITIVA
-- ==========================================

-- 1. Eliminar políticas RLS
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 2. Eliminar TODOS los constraints (foreign keys, check, unique, PRIMARY KEY)
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (
        SELECT conname, conrelid::regclass AS table_name
        FROM pg_constraint
        WHERE connamespace = 'public'::regnamespace
        AND contype IN ('f', 'c', 'u', 'p')  -- f=foreign, c=check, u=unique, p=primary
    ) LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I', r.table_name, r.conname);
    END LOOP;
END $$;

-- 3. TRUNCATE datos
TRUNCATE TABLE user_progress, user_challenges, user_badges, enrollments, likes, comments, posts, blog_posts, forum_posts, followers, notifications, achievements, lessons, modules, study_groups, courses, challenges, badges, profiles, users CASCADE;

-- 4. Convertir UUID → TEXT (todas las columnas)
ALTER TABLE achievements ALTER COLUMN id TYPE TEXT, ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE badges ALTER COLUMN id TYPE TEXT;
ALTER TABLE blog_posts ALTER COLUMN id TYPE TEXT, ALTER COLUMN author_id TYPE TEXT;
ALTER TABLE challenges ALTER COLUMN id TYPE TEXT;
ALTER TABLE comments ALTER COLUMN id TYPE TEXT, ALTER COLUMN user_id TYPE TEXT, ALTER COLUMN post_id TYPE TEXT, ALTER COLUMN parent_id TYPE TEXT, ALTER COLUMN blog_post_id TYPE TEXT;
ALTER TABLE courses ALTER COLUMN id TYPE TEXT, ALTER COLUMN instructor_id TYPE TEXT;
ALTER TABLE enrollments ALTER COLUMN id TYPE TEXT, ALTER COLUMN user_id TYPE TEXT, ALTER COLUMN course_id TYPE TEXT;
ALTER TABLE followers ALTER COLUMN id TYPE TEXT, ALTER COLUMN follower_id TYPE TEXT, ALTER COLUMN following_id TYPE TEXT;
ALTER TABLE forum_posts ALTER COLUMN id TYPE TEXT, ALTER COLUMN user_id TYPE TEXT, ALTER COLUMN course_id TYPE TEXT;
ALTER TABLE lessons ALTER COLUMN id TYPE TEXT, ALTER COLUMN module_id TYPE TEXT, ALTER COLUMN course_id TYPE TEXT;
ALTER TABLE likes ALTER COLUMN id TYPE TEXT, ALTER COLUMN user_id TYPE TEXT, ALTER COLUMN post_id TYPE TEXT, ALTER COLUMN comment_id TYPE TEXT, ALTER COLUMN blog_post_id TYPE TEXT;
ALTER TABLE modules ALTER COLUMN id TYPE TEXT, ALTER COLUMN course_id TYPE TEXT;
ALTER TABLE notifications ALTER COLUMN id TYPE TEXT, ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE posts ALTER COLUMN id TYPE TEXT, ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE study_groups ALTER COLUMN id TYPE TEXT, ALTER COLUMN course_id TYPE TEXT, ALTER COLUMN created_by TYPE TEXT;
ALTER TABLE user_badges ALTER COLUMN id TYPE TEXT, ALTER COLUMN user_id TYPE TEXT, ALTER COLUMN badge_id TYPE TEXT;
ALTER TABLE user_challenges ALTER COLUMN id TYPE TEXT, ALTER COLUMN user_id TYPE TEXT, ALTER COLUMN challenge_id TYPE TEXT;
ALTER TABLE user_progress ALTER COLUMN id TYPE TEXT, ALTER COLUMN user_id TYPE TEXT, ALTER COLUMN course_id TYPE TEXT, ALTER COLUMN lesson_id TYPE TEXT;
ALTER TABLE users ALTER COLUMN id TYPE TEXT;

-- 5. Recrear PRIMARY KEYS
ALTER TABLE achievements ADD PRIMARY KEY (id);
ALTER TABLE badges ADD PRIMARY KEY (id);
ALTER TABLE blog_posts ADD PRIMARY KEY (id);
ALTER TABLE challenges ADD PRIMARY KEY (id);
ALTER TABLE comments ADD PRIMARY KEY (id);
ALTER TABLE courses ADD PRIMARY KEY (id);
ALTER TABLE enrollments ADD PRIMARY KEY (id);
ALTER TABLE followers ADD PRIMARY KEY (id);
ALTER TABLE forum_posts ADD PRIMARY KEY (id);
ALTER TABLE lessons ADD PRIMARY KEY (id);
ALTER TABLE likes ADD PRIMARY KEY (id);
ALTER TABLE modules ADD PRIMARY KEY (id);
ALTER TABLE notifications ADD PRIMARY KEY (id);
ALTER TABLE posts ADD PRIMARY KEY (id);
ALTER TABLE profiles ADD PRIMARY KEY (id);
ALTER TABLE study_groups ADD PRIMARY KEY (id);
ALTER TABLE user_badges ADD PRIMARY KEY (id);
ALTER TABLE user_challenges ADD PRIMARY KEY (id);
ALTER TABLE user_progress ADD PRIMARY KEY (id);
ALTER TABLE users ADD PRIMARY KEY (id);

-- 6. Recrear foreign keys
ALTER TABLE achievements ADD CONSTRAINT achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_blog_post_id_fkey FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;
ALTER TABLE courses ADD CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE enrollments ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE enrollments ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE followers ADD CONSTRAINT followers_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE followers ADD CONSTRAINT followers_following_id_fkey FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE forum_posts ADD CONSTRAINT forum_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE forum_posts ADD CONSTRAINT forum_posts_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE likes ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE likes ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE likes ADD CONSTRAINT likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE likes ADD CONSTRAINT likes_blog_post_id_fkey FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;
ALTER TABLE modules ADD CONSTRAINT modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE posts ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE study_groups ADD CONSTRAINT study_groups_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE study_groups ADD CONSTRAINT study_groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_badges ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE;
ALTER TABLE user_challenges ADD CONSTRAINT user_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_challenges ADD CONSTRAINT user_challenges_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE;
ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_progress ADD CONSTRAINT user_progress_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE user_progress ADD CONSTRAINT user_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;

-- 7. Recrear políticas RLS
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

-- ✅ LISTO - Ejecuta Master Data Sync ahora
