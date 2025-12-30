-- ==========================================
-- DATOS DE PRUEBA CORRECTOS (SIN TOCAR AUTH)
-- ==========================================

-- 1. Insertar SOLO profiles (users es tabla de auth, no la tocamos)
INSERT INTO profiles (id, email, full_name, avatar_url, role, level, xp, streak, created_at, updated_at) VALUES
('1', 'juan@platzi.com', 'Juan Pérez', 'https://i.pravatar.cc/150?img=1', 'instructor', 5, 500, 10, NOW(), NOW()),
('2', 'maria@platzi.com', 'María García', 'https://i.pravatar.cc/150?img=2', 'student', 3, 300, 7, NOW(), NOW()),
('3', 'carlos@platzi.com', 'Carlos López', 'https://i.pravatar.cc/150?img=3', 'student', 2, 200, 5, NOW(), NOW());

-- 2. Insertar cursos
INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, created_at, updated_at) VALUES
('1', 'JavaScript Desde Cero', 'javascript-desde-cero', 'Aprende JavaScript desde los fundamentos hasta conceptos avanzados', 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400', '1', 'Programación', 'beginner', 40, 0, 4.8, 1250, NOW(), NOW()),
('2', 'React Avanzado', 'react-avanzado', 'Domina React, Hooks, Context API y más', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', '1', 'Programación', 'advanced', 60, 0, 4.9, 850, NOW(), NOW()),
('3', 'Python para Data Science', 'python-para-data-science', 'Análisis de datos con Python, Pandas y NumPy', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400', '1', 'Data Science', 'intermediate', 50, 0, 4.7, 920, NOW(), NOW());

-- 3. Insertar módulos
INSERT INTO modules (id, course_id, title, description, order_index, created_at, updated_at) VALUES
('1', '1', 'Introducción a JavaScript', 'Fundamentos del lenguaje', 1, NOW(), NOW()),
('2', '1', 'Variables y Tipos de Datos', 'Aprende sobre variables, strings, numbers', 2, NOW(), NOW()),
('3', '2', 'React Hooks', 'useState, useEffect y custom hooks', 1, NOW(), NOW());

-- 4. Insertar lecciones
INSERT INTO lessons (id, module_id, course_id, title, description, video_url, duration, order_index, created_at, updated_at) VALUES
('1', '1', '1', '¿Qué es JavaScript?', 'Introducción al lenguaje más popular de la web', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 600, 1, NOW(), NOW()),
('2', '1', '1', 'Configurando el Entorno', 'Instala VS Code y Node.js', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 900, 2, NOW(), NOW()),
('3', '2', '1', 'Variables con let y const', 'Diferencias entre var, let y const', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 720, 1, NOW(), NOW());

-- 5. Insertar posts del blog
INSERT INTO blog_posts (id, author_id, title, slug, excerpt, content, cover_image_url, category, tags, status, views_count, likes_count, comments_count, reading_time, published_at, created_at, updated_at) VALUES
('1', '1', 'El Futuro del Desarrollo Web en 2025', 'futuro-desarrollo-web-2025', 'Explora las tendencias tecnológicas que marcarán el desarrollo web', '## Introducción\n\nEl desarrollo web está en constante evolución...', 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800', 'Tecnología', ARRAY['web', 'tendencias', '2025'], 'published', 1250, 45, 12, 8, NOW(), NOW(), NOW()),
('2', '1', 'Guía Completa de React Hooks', 'guia-completa-react-hooks', 'Todo lo que necesitas saber sobre React Hooks', '## useState\n\nEl hook más básico...', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', 'Programación', ARRAY['react', 'hooks', 'javascript'], 'published', 980, 38, 8, 12, NOW(), NOW(), NOW());

-- 6. Insertar posts sociales
INSERT INTO posts (id, user_id, content, image_url, type, likes_count, comments_count, views_count, created_at, updated_at) VALUES
('1', '2', '¡Acabo de completar el curso de JavaScript! 🎉 #platzi', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600', 'post', 25, 5, 150, NOW(), NOW()),
('2', '3', 'Estudiando React hooks hoy 💻', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600', 'post', 18, 3, 95, NOW(), NOW());

-- 7. Insertar badges
INSERT INTO badges (id, name, description, icon, category, rarity, created_at, updated_at) VALUES
('1', 'Primera Lección', 'Completa tu primera lección', '🎓', 'learning', 'common', NOW(), NOW()),
('2', 'Racha de 7 Días', 'Mantén una racha de 7 días consecutivos', '🔥', 'streak', 'rare', NOW(), NOW()),
('3', 'Experto en JS', 'Completa el curso de JavaScript', '⭐', 'achievement', 'epic', NOW(), NOW());

-- 8. Insertar challenges
INSERT INTO challenges (id, title, description, type, xp_reward, target_value, created_at, updated_at) VALUES
('1', 'Lección Diaria', 'Completa 1 lección hoy', 'daily', 50, 1, NOW(), NOW()),
('2', 'Racha Semanal', 'Estudia 7 días seguidos', 'weekly', 200, 7, NOW(), NOW()),
('3', 'Maestro del Curso', 'Completa cualquier curso al 100%', 'milestone', 500, 100, NOW(), NOW());

-- ✅ LISTO