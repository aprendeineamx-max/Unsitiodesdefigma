-- ==========================================
-- RESET COMPLETO A ESTADO LIMPIO
-- ==========================================
-- Restablece la base de datos al estado donde funcionaba el Master Data Sync

-- PASO 1: Limpiar todos los datos (mantener estructura)
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

-- ✅ LISTO - Base de datos limpia
-- Ahora usa el botón "Master Data Sync" en la UI para insertar los datos
