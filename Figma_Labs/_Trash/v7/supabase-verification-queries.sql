-- =====================================================
-- Queries de Verificación de Supabase
-- =====================================================
-- Ejecuta estas queries una por una para verificar todo
-- =====================================================

-- =====================================================
-- 1. VERIFICAR TABLAS CREADAS
-- =====================================================
SELECT 
  table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE table_schema = 'public' 
   AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- RESULTADO ESPERADO: 10 tablas
-- achievements, blog_posts, comments, courses, enrollments, 
-- followers, likes, notifications, posts, profiles

-- =====================================================
-- 2. VERIFICAR COLUMNAS DE CADA TABLA
-- =====================================================

-- Profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Courses
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'courses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Blog Posts
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 3. VERIFICAR ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Ver si RLS está habilitado en todas las tablas
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- RESULTADO ESPERADO: rowsecurity = true para todas las tablas

-- Ver todas las políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- RESULTADO ESPERADO: Múltiples políticas por tabla

-- =====================================================
-- 4. VERIFICAR ÍNDICES
-- =====================================================
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- RESULTADO ESPERADO: Índices en user_id, created_at, etc.

-- =====================================================
-- 5. VERIFICAR TRIGGERS
-- =====================================================
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- RESULTADO ESPERADO: 
-- - Trigger on_auth_user_created en auth.users
-- - Triggers update_*_updated_at en cada tabla

-- =====================================================
-- 6. VERIFICAR FUNCIONES
-- =====================================================
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- RESULTADO ESPERADO:
-- - handle_new_user
-- - increment_course_students
-- - update_updated_at_column

-- =====================================================
-- 7. VERIFICAR CONSTRAINTS
-- =====================================================
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- RESULTADO ESPERADO: 
-- PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK constraints

-- =====================================================
-- 8. VERIFICAR FOREIGN KEYS
-- =====================================================
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.update_rule,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 9. VERIFICAR DATOS (después de insertar test data)
-- =====================================================

-- Contar registros
SELECT 'profiles' as tabla, COUNT(*) as total FROM public.profiles
UNION ALL
SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'blog_posts', COUNT(*) FROM public.blog_posts
UNION ALL
SELECT 'posts', COUNT(*) FROM public.posts
UNION ALL
SELECT 'comments', COUNT(*) FROM public.comments
UNION ALL
SELECT 'likes', COUNT(*) FROM public.likes
UNION ALL
SELECT 'enrollments', COUNT(*) FROM public.enrollments
UNION ALL
SELECT 'achievements', COUNT(*) FROM public.achievements
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'followers', COUNT(*) FROM public.followers
ORDER BY tabla;

-- Ver perfiles
SELECT id, email, full_name, role, level, xp, streak
FROM public.profiles
ORDER BY created_at DESC;

-- Ver cursos
SELECT id, title, instructor_id, category, difficulty, price, students_count, status
FROM public.courses
ORDER BY created_at DESC;

-- Ver blog posts
SELECT id, title, author_id, category, status, views_count, published_at
FROM public.blog_posts
ORDER BY published_at DESC;

-- Ver posts sociales
SELECT id, user_id, content, type, likes_count, comments_count, views_count
FROM public.posts
ORDER BY created_at DESC;

-- =====================================================
-- 10. PROBAR QUERIES CON JOINS
-- =====================================================

-- Blog posts con autor
SELECT 
  bp.id,
  bp.title,
  bp.slug,
  p.full_name as author_name,
  p.avatar_url as author_avatar,
  bp.category,
  bp.views_count,
  bp.likes_count,
  bp.published_at
FROM public.blog_posts bp
JOIN public.profiles p ON bp.author_id = p.id
WHERE bp.status = 'published'
ORDER BY bp.published_at DESC;

-- Posts sociales con usuario
SELECT 
  po.id,
  po.content,
  po.type,
  p.full_name as user_name,
  p.avatar_url as user_avatar,
  po.likes_count,
  po.comments_count,
  po.views_count,
  po.created_at
FROM public.posts po
JOIN public.profiles p ON po.user_id = p.id
ORDER BY po.created_at DESC;

-- Comentarios con usuario y post
SELECT 
  c.id,
  c.content,
  p.full_name as commenter_name,
  bp.title as post_title,
  c.likes_count,
  c.created_at
FROM public.comments c
JOIN public.profiles p ON c.user_id = p.id
LEFT JOIN public.blog_posts bp ON c.blog_post_id = bp.id
ORDER BY c.created_at DESC;

-- Cursos con instructor
SELECT 
  c.id,
  c.title,
  c.category,
  c.difficulty,
  c.price,
  c.students_count,
  p.full_name as instructor_name,
  p.avatar_url as instructor_avatar
FROM public.courses c
JOIN public.profiles p ON c.instructor_id = p.id
WHERE c.status = 'published'
ORDER BY c.students_count DESC;

-- =====================================================
-- 11. VERIFICAR FUNCIONALIDAD DE REAL-TIME
-- =====================================================

-- Verificar que las publicaciones (publications) estén configuradas
SELECT * FROM pg_publication;

-- Ver tablas incluidas en real-time
SELECT schemaname, tablename 
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- =====================================================
-- 12. TEST DE SEGURIDAD RLS
-- =====================================================

-- Intentar ver datos sin autenticación (debería funcionar para datos públicos)
SET ROLE anon;

-- Ver perfiles públicos (debería funcionar)
SELECT id, full_name, avatar_url FROM public.profiles LIMIT 5;

-- Ver cursos publicados (debería funcionar)
SELECT id, title FROM public.courses WHERE status = 'published' LIMIT 5;

-- Volver a rol normal
RESET ROLE;

-- =====================================================
-- 13. VERIFICAR STORAGE (si configuraste buckets)
-- =====================================================

-- Ver buckets de storage
SELECT * FROM storage.buckets;

-- Ver políticas de storage
SELECT * FROM storage.objects LIMIT 5;

-- =====================================================
-- 14. ESTADÍSTICAS GENERALES
-- =====================================================

-- Resumen general de la base de datos
SELECT 
  'Total Usuarios' as metrica, COUNT(*) as valor FROM public.profiles
UNION ALL
SELECT 'Total Cursos', COUNT(*) FROM public.courses
UNION ALL
SELECT 'Cursos Publicados', COUNT(*) FROM public.courses WHERE status = 'published'
UNION ALL
SELECT 'Total Posts Blog', COUNT(*) FROM public.blog_posts
UNION ALL
SELECT 'Posts Publicados', COUNT(*) FROM public.blog_posts WHERE status = 'published'
UNION ALL
SELECT 'Total Posts Sociales', COUNT(*) FROM public.posts
UNION ALL
SELECT 'Total Comentarios', COUNT(*) FROM public.comments
UNION ALL
SELECT 'Total Likes', COUNT(*) FROM public.likes
UNION ALL
SELECT 'Total Seguidores', COUNT(*) FROM public.followers
UNION ALL
SELECT 'Total Logros', COUNT(*) FROM public.achievements;

-- Usuarios más activos (por XP)
SELECT 
  full_name,
  email,
  level,
  xp,
  streak,
  role
FROM public.profiles
ORDER BY xp DESC
LIMIT 10;

-- Cursos más populares
SELECT 
  title,
  instructor_id,
  category,
  students_count,
  rating
FROM public.courses
WHERE status = 'published'
ORDER BY students_count DESC
LIMIT 10;

-- Posts más populares
SELECT 
  content,
  type,
  likes_count,
  comments_count,
  views_count
FROM public.posts
ORDER BY views_count DESC
LIMIT 10;

-- =====================================================
-- FIN DE VERIFICACIONES
-- =====================================================
