-- ==========================================
-- SCRIPT FINAL CORRECTO - VERIFICADO CON ESQUEMA REAL
-- ==========================================
-- Basado en: /ESTO_SI_FUNCIONA.sql que convirtió TODO a TEXT
-- Estructura actual: Todas las columnas ID son TEXT, no UUID
-- ==========================================

-- PASO 1: Limpiar todas las tablas (SOLO DATOS, NO ESTRUCTURA)
TRUNCATE TABLE user_progress, user_challenges, user_badges, enrollments, likes, comments, posts, blog_posts, forum_posts, followers, notifications, achievements, lessons, modules, study_groups, courses, challenges, badges, profiles, users CASCADE;

-- PASO 2: Insertar usuarios en tabla 'users' (NO auth.users)
INSERT INTO users (id, email, username, created_at, updated_at) VALUES
('1', 'juan@platzi.com', 'juanperez', NOW(), NOW()),
('2', 'maria@platzi.com', 'mariagarcia', NOW(), NOW()),
('3', 'carlos@platzi.com', 'carloslopez', NOW(), NOW());

-- PASO 3: Insertar profiles (con FK a users que acabamos de crear)
INSERT INTO profiles (id, email, full_name, avatar_url, role, level, xp, streak, created_at, updated_at) VALUES
('1', 'juan@platzi.com', 'Juan Pérez', 'https://i.pravatar.cc/150?img=1', 'instructor', 5, 500, 10, NOW(), NOW()),
('2', 'maria@platzi.com', 'María García', 'https://i.pravatar.cc/150?img=2', 'student', 3, 300, 7, NOW(), NOW()),
('3', 'carlos@platzi.com', 'Carlos López', 'https://i.pravatar.cc/150?img=3', 'student', 2, 200, 5, NOW(), NOW());

-- PASO 4: Insertar cursos (con instructor_id que es TEXT y apunta a users.id)
INSERT INTO courses (id, title, slug, description, thumbnail_url, instructor_id, instructor, category, difficulty, duration, price, rating, students_count, created_at, updated_at) VALUES
('1', 'JavaScript Desde Cero', 'javascript-desde-cero', 'Aprende JavaScript desde los fundamentos hasta conceptos avanzados', 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400', '1', 'Juan Pérez', 'Programación', 'beginner', 2400, 0, 4.8, 1250, NOW(), NOW()),
('2', 'React Avanzado', 'react-avanzado', 'Domina React, Hooks, Context API y más', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', '1', 'Juan Pérez', 'Programación', 'advanced', 3600, 0, 4.9, 850, NOW(), NOW()),
('3', 'Python para Data Science', 'python-para-data-science', 'Análisis de datos con Python, Pandas y NumPy', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400', '1', 'Juan Pérez', 'Data Science', 'intermediate', 3000, 0, 4.7, 920, NOW(), NOW());

-- PASO 5: Insertar módulos (course_id es TEXT)
INSERT INTO modules (id, course_id, title, description, order_index, created_at, updated_at) VALUES
('1', '1', 'Introducción a JavaScript', 'Fundamentos del lenguaje', 1, NOW(), NOW()),
('2', '1', 'Variables y Tipos de Datos', 'Aprende sobre variables, strings, numbers', 2, NOW(), NOW()),
('3', '2', 'React Hooks', 'useState, useEffect y custom hooks', 1, NOW(), NOW()),
('4', '3', 'Introducción a Python', 'Conceptos básicos de Python', 1, NOW(), NOW()),
('5', '3', 'Pandas y NumPy', 'Librerías para análisis de datos', 2, NOW(), NOW());

-- PASO 6: Insertar lecciones (todos los IDs son TEXT, duration es INTEGER en minutos)
INSERT INTO lessons (id, module_id, course_id, title, description, video_url, duration, order_index, created_at, updated_at) VALUES
('1', '1', '1', '¿Qué es JavaScript?', 'Introducción al lenguaje más popular de la web', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 600, 1, NOW(), NOW()),
('2', '1', '1', 'Configurando el Entorno', 'Instala VS Code y Node.js', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 900, 2, NOW(), NOW()),
('3', '2', '1', 'Variables con let y const', 'Diferencias entre var, let y const', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 720, 1, NOW(), NOW()),
('4', '2', '1', 'Tipos de Datos', 'String, Number, Boolean, Object, Array', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 840, 2, NOW(), NOW()),
('5', '3', '2', 'Introducción a React Hooks', 'Por qué usar hooks en React', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 600, 1, NOW(), NOW()),
('6', '3', '2', 'useState Hook', 'Manejo de estado con useState', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 900, 2, NOW(), NOW()),
('7', '4', '3', '¿Qué es Python?', 'Introducción al lenguaje Python', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 600, 1, NOW(), NOW()),
('8', '5', '3', 'Pandas Básico', 'DataFrames y Series en Pandas', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1200, 1, NOW(), NOW());

-- PASO 7: Insertar posts del blog (author_id es TEXT y apunta a users.id)
INSERT INTO blog_posts (id, author_id, title, slug, excerpt, content, cover_image_url, category, tags, status, views_count, likes_count, comments_count, reading_time, published_at, created_at, updated_at) VALUES
('1', '1', 'El Futuro del Desarrollo Web en 2025', 'futuro-desarrollo-web-2025', 'Explora las tendencias tecnológicas que marcarán el desarrollo web', '## Introducción\n\nEl desarrollo web está en constante evolución. En 2025, veremos cambios significativos.\n\n## Tendencias Principales\n\n1. **IA en el Desarrollo**: La inteligencia artificial se integrará más en las herramientas de desarrollo.\n2. **Web3**: Tecnologías descentralizadas ganarán tracción.\n3. **Edge Computing**: Procesamiento más cercano al usuario.\n\n## Conclusión\n\nEl futuro es emocionante para los desarrolladores web.', 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800', 'Tecnología', ARRAY['web', 'tendencias', '2025'], 'published', 1250, 45, 12, 8, NOW(), NOW(), NOW()),
('2', '1', 'Guía Completa de React Hooks', 'guia-completa-react-hooks', 'Todo lo que necesitas saber sobre React Hooks', '## useState\n\nEl hook más básico para manejar estado.\n\n```javascript\nconst [count, setCount] = useState(0);\n```\n\n## useEffect\n\nPara efectos secundarios.\n\n```javascript\nuseEffect(() => {\n  // código\n}, []);\n```\n\n## Custom Hooks\n\nCrea tus propios hooks reutilizables.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', 'Programación', ARRAY['react', 'hooks', 'javascript'], 'published', 980, 38, 8, 12, NOW(), NOW(), NOW()),
('3', '1', 'Python para Principiantes', 'python-para-principiantes', 'Comienza tu viaje en programación con Python', '## ¿Por qué Python?\n\nPython es perfecto para principiantes por su sintaxis clara.\n\n## Primeros Pasos\n\n1. Instala Python\n2. Escribe tu primer programa\n3. Aprende los conceptos básicos', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800', 'Programación', ARRAY['python', 'principiantes'], 'published', 750, 28, 5, 6, NOW(), NOW(), NOW());

-- PASO 8: Insertar posts sociales (user_id es TEXT)
INSERT INTO posts (id, user_id, content, image_url, type, likes_count, comments_count, views_count, created_at, updated_at) VALUES
('1', '2', '¡Acabo de completar el curso de JavaScript! 🎉 #platzi #javascript', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600', 'post', 25, 5, 150, NOW(), NOW()),
('2', '3', 'Estudiando React hooks hoy 💻 ¿Alguien tiene tips?', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600', 'post', 18, 3, 95, NOW(), NOW()),
('3', '2', 'Mi setup de desarrollo para 2025 ⚡', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600', 'post', 42, 8, 220, NOW(), NOW());

-- PASO 9: Insertar badges
INSERT INTO badges (id, name, description, icon, category, rarity, created_at, updated_at) VALUES
('1', 'Primera Lección', 'Completa tu primera lección', '🎓', 'learning', 'common', NOW(), NOW()),
('2', 'Racha de 7 Días', 'Mantén una racha de 7 días consecutivos', '🔥', 'streak', 'rare', NOW(), NOW()),
('3', 'Experto en JS', 'Completa el curso de JavaScript', '⭐', 'achievement', 'epic', NOW(), NOW()),
('4', 'React Master', 'Completa el curso de React', '⚛️', 'achievement', 'epic', NOW(), NOW()),
('5', 'Python Ninja', 'Completa el curso de Python', '🐍', 'achievement', 'epic', NOW(), NOW());

-- PASO 10: Insertar challenges
INSERT INTO challenges (id, title, description, type, xp_reward, target_value, created_at, updated_at) VALUES
('1', 'Lección Diaria', 'Completa 1 lección hoy', 'daily', 50, 1, NOW(), NOW()),
('2', 'Racha Semanal', 'Estudia 7 días seguidos', 'weekly', 200, 7, NOW(), NOW()),
('3', 'Maestro del Curso', 'Completa cualquier curso al 100%', 'milestone', 500, 100, NOW(), NOW()),
('4', 'Estudiante Activo', 'Completa 5 lecciones esta semana', 'weekly', 150, 5, NOW(), NOW()),
('5', 'Maratón de Aprendizaje', 'Completa 20 lecciones este mes', 'monthly', 500, 20, NOW(), NOW());

-- PASO 11: Insertar enrollments (inscripciones de estudiantes a cursos)
INSERT INTO enrollments (id, user_id, course_id, status, progress, enrolled_at, created_at, updated_at) VALUES
('1', '2', '1', 'active', 25, NOW(), NOW(), NOW()),
('2', '2', '2', 'active', 10, NOW(), NOW(), NOW()),
('3', '3', '1', 'active', 50, NOW(), NOW(), NOW()),
('4', '3', '3', 'active', 15, NOW(), NOW(), NOW());

-- ✅ LISTO - VERIFICADO CON ESQUEMA REAL
-- Este script inserta datos en el orden correcto:
-- 1. users (sin dependencias)
-- 2. profiles (depende de users)
-- 3. courses (depende de users.id como instructor_id)
-- 4. modules (depende de courses)
-- 5. lessons (depende de modules y courses)
-- 6. blog_posts (depende de users)
-- 7. posts (depende de users)
-- 8. badges (sin dependencias)
-- 9. challenges (sin dependencias)
-- 10. enrollments (depende de users y courses)