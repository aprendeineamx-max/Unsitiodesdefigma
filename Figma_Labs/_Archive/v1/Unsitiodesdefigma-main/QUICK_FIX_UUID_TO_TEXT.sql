-- ==========================================
-- QUICK FIX: Cambiar ID de UUID a TEXT
-- ==========================================
-- Ejecuta este SQL en Supabase SQL Editor

-- 1. CURSOS: Cambiar id de UUID a TEXT
ALTER TABLE courses 
ALTER COLUMN id TYPE TEXT 
USING id::TEXT;

-- 2. MODULES: Cambiar id y course_id de UUID a TEXT
ALTER TABLE modules 
ALTER COLUMN id TYPE TEXT 
USING id::TEXT;

ALTER TABLE modules 
ALTER COLUMN course_id TYPE TEXT 
USING course_id::TEXT;

-- 3. LESSONS: Cambiar id, module_id y course_id de UUID a TEXT
ALTER TABLE lessons 
ALTER COLUMN id TYPE TEXT 
USING id::TEXT;

ALTER TABLE lessons 
ALTER COLUMN module_id TYPE TEXT 
USING module_id::TEXT;

ALTER TABLE lessons 
ALTER COLUMN course_id TYPE TEXT 
USING course_id::TEXT;

-- 4. POSTS: Cambiar id y user_id de UUID a TEXT
ALTER TABLE posts 
ALTER COLUMN id TYPE TEXT 
USING id::TEXT;

ALTER TABLE posts 
ALTER COLUMN user_id TYPE TEXT 
USING user_id::TEXT;

-- 5. COMMENTS: Cambiar id, post_id, user_id y parent_comment_id de UUID a TEXT
ALTER TABLE comments 
ALTER COLUMN id TYPE TEXT 
USING id::TEXT;

ALTER TABLE comments 
ALTER COLUMN post_id TYPE TEXT 
USING post_id::TEXT;

ALTER TABLE comments 
ALTER COLUMN user_id TYPE TEXT 
USING user_id::TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='comments' AND column_name='parent_comment_id'
  ) THEN
    ALTER TABLE comments 
    ALTER COLUMN parent_comment_id TYPE TEXT 
    USING parent_comment_id::TEXT;
  END IF;
END $$;

-- 6. USERS: Cambiar id de UUID a TEXT
ALTER TABLE users 
ALTER COLUMN id TYPE TEXT 
USING id::TEXT;

-- 7. BLOG_POSTS: Cambiar id y author_id de UUID a TEXT
ALTER TABLE blog_posts 
ALTER COLUMN id TYPE TEXT 
USING id::TEXT;

ALTER TABLE blog_posts 
ALTER COLUMN author_id TYPE TEXT 
USING author_id::TEXT;

-- 8. BADGES: Cambiar id de UUID a TEXT
ALTER TABLE badges 
ALTER COLUMN id TYPE TEXT 
USING id::TEXT;

-- 9. CHALLENGES: Cambiar id de UUID a TEXT
ALTER TABLE challenges 
ALTER COLUMN id TYPE TEXT 
USING id::TEXT;

-- 10. STUDY_GROUPS: Cambiar id y created_by de UUID a TEXT
ALTER TABLE study_groups 
ALTER COLUMN id TYPE TEXT 
USING id::TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='study_groups' AND column_name='course_id'
  ) THEN
    ALTER TABLE study_groups 
    ALTER COLUMN course_id TYPE TEXT 
    USING course_id::TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='study_groups' AND column_name='created_by'
  ) THEN
    ALTER TABLE study_groups 
    ALTER COLUMN created_by TYPE TEXT 
    USING created_by::TEXT;
  END IF;
END $$;

-- 11. FORUM_POSTS: Cambiar id, user_id y course_id de UUID a TEXT
ALTER TABLE forum_posts 
ALTER COLUMN id TYPE TEXT 
USING id::TEXT;

ALTER TABLE forum_posts 
ALTER COLUMN user_id TYPE TEXT 
USING user_id::TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='forum_posts' AND column_name='course_id'
  ) THEN
    ALTER TABLE forum_posts 
    ALTER COLUMN course_id TYPE TEXT 
    USING course_id::TEXT;
  END IF;
END $$;

-- ==========================================
-- ✅ ¡Migración completada!
-- ==========================================
-- Todas las columnas ID ahora son TEXT en lugar de UUID
-- Ahora ejecuta "Master Data Sync" nuevamente
