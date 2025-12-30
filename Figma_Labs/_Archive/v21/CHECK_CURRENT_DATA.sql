-- ==========================================
-- VER EXACTAMENTE QUÉ DATOS TIENES ACTUALMENTE
-- ==========================================

-- Ver cuántos registros hay en cada tabla
SELECT 
    'users' as tabla, 
    COUNT(*) as cantidad
FROM users
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'modules', COUNT(*) FROM modules
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'blog_posts', COUNT(*) FROM blog_posts
UNION ALL
SELECT 'badges', COUNT(*) FROM badges
UNION ALL
SELECT 'challenges', COUNT(*) FROM challenges
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'user_progress', COUNT(*) FROM user_progress
UNION ALL
SELECT 'likes', COUNT(*) FROM likes
UNION ALL
SELECT 'followers', COUNT(*) FROM followers
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
ORDER BY cantidad DESC;
