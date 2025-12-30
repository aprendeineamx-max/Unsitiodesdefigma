-- ==========================================
-- SCRIPT DE INVESTIGACIÓN
-- ==========================================
-- Ejecuta este script para ver EXACTAMENTE qué existe en tu base de datos

-- 1. Ver todas las tablas que existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Ver TODAS las columnas de tipo UUID en TODAS las tablas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND data_type = 'uuid'
ORDER BY table_name, column_name;

-- 3. Ver TODAS las foreign keys que existen
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 4. Ver cuántos registros hay en cada tabla
SELECT 
    'users' as table_name, 
    COUNT(*) as row_count,
    COUNT(DISTINCT id) as unique_ids
FROM users
UNION ALL
SELECT 'courses', COUNT(*), COUNT(DISTINCT id) FROM courses
UNION ALL
SELECT 'modules', COUNT(*), COUNT(DISTINCT id) FROM modules
UNION ALL
SELECT 'lessons', COUNT(*), COUNT(DISTINCT id) FROM lessons
UNION ALL
SELECT 'posts', COUNT(*), COUNT(DISTINCT id) FROM posts
UNION ALL
SELECT 'comments', COUNT(*), COUNT(DISTINCT id) FROM comments
UNION ALL
SELECT 'blog_posts', COUNT(*), COUNT(DISTINCT id) FROM blog_posts
UNION ALL
SELECT 'badges', COUNT(*), COUNT(DISTINCT id) FROM badges
UNION ALL
SELECT 'challenges', COUNT(*), COUNT(DISTINCT id) FROM challenges
UNION ALL
SELECT 'study_groups', COUNT(*), COUNT(DISTINCT id) FROM study_groups
UNION ALL
SELECT 'forum_posts', COUNT(*), COUNT(DISTINCT id) FROM forum_posts;

-- 5. Ver ejemplos de IDs en las tablas principales
SELECT 'users' as table_name, id, created_at FROM users LIMIT 3;
SELECT 'posts' as table_name, id, user_id, created_at FROM posts LIMIT 3;
SELECT 'comments' as table_name, id, created_at FROM comments LIMIT 3;
