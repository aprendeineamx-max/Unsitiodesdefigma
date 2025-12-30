-- ==========================================
-- SCRIPT: DESACTIVAR RLS (ROW LEVEL SECURITY)
-- ==========================================
-- Este script desactiva RLS solo en las tablas que existen
-- ==========================================

-- IMPORTANTE: Solo para desarrollo/demostración
-- En producción, mantén RLS activado para seguridad

-- Desactivar RLS en tabla profiles (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: profiles';
    END IF;
END $$;

-- Desactivar RLS en tabla courses (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
        ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: courses';
    END IF;
END $$;

-- Desactivar RLS en tabla lessons (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lessons') THEN
        ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: lessons';
    END IF;
END $$;

-- Desactivar RLS en tabla enrollments (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'enrollments') THEN
        ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: enrollments';
    END IF;
END $$;

-- Desactivar RLS en tabla progress (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'progress') THEN
        ALTER TABLE progress DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: progress';
    END IF;
END $$;

-- Desactivar RLS en tabla reviews (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
        ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: reviews';
    END IF;
END $$;

-- Desactivar RLS en tabla certificates (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'certificates') THEN
        ALTER TABLE certificates DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: certificates';
    END IF;
END $$;

-- Desactivar RLS en tabla blog_posts (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts') THEN
        ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: blog_posts';
    END IF;
END $$;

-- Desactivar RLS en tabla blog_comments (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_comments') THEN
        ALTER TABLE blog_comments DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: blog_comments';
    END IF;
END $$;

-- Desactivar RLS en tabla achievements (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'achievements') THEN
        ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: achievements';
    END IF;
END $$;

-- Desactivar RLS en tabla user_achievements (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_achievements') THEN
        ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: user_achievements';
    END IF;
END $$;

-- Desactivar RLS en tabla notifications (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: notifications';
    END IF;
END $$;

-- Desactivar RLS en tabla messages (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
        ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: messages';
    END IF;
END $$;

-- Desactivar RLS en tabla study_groups (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'study_groups') THEN
        ALTER TABLE study_groups DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: study_groups';
    END IF;
END $$;

-- Desactivar RLS en tabla group_members (si existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'group_members') THEN
        ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS desactivado en: group_members';
    END IF;
END $$;

-- Verificar que RLS está desactivado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ==========================================
-- ✅ RLS DESACTIVADO EXITOSAMENTE
-- ==========================================
-- Ahora puedes insertar datos masivamente desde tu aplicación
-- sin restricciones de seguridad a nivel de fila
-- ==========================================
