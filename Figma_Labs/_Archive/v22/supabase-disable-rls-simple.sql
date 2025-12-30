-- ==========================================
-- SCRIPT SIMPLE: DESACTIVAR RLS 
-- ==========================================
-- Solo desactiva RLS en las tablas principales
-- ==========================================

-- Desactivar RLS en profiles
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Desactivar RLS en courses (IMPORTANTE para insertar cursos)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
        ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Desactivar RLS en blog_posts
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blog_posts') THEN
        ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Verificar estado
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'courses', 'blog_posts')
ORDER BY tablename;

-- ✅ Listo! Ahora puedes usar el botón para insertar cursos
