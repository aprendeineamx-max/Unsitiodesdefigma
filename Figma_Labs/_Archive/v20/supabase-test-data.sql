-- =====================================================
-- Platzi Clone - Datos de Prueba
-- =====================================================
-- IMPORTANTE: Primero crea un usuario en Supabase Auth
-- Luego reemplaza 'YOUR_USER_ID' con tu ID real de usuario
-- =====================================================

-- NOTA: Obtén tu User ID ejecutando:
-- SELECT id, email FROM auth.users;

-- =====================================================
-- PASO 1: Insertar datos en PROFILES
-- =====================================================
-- El perfil ya debería existir por el trigger automático
-- Solo vamos a actualizarlo con más información

-- Actualizar TU perfil (reemplaza el ID)
UPDATE public.profiles
SET 
  full_name = 'Usuario Demo',
  bio = 'Desarrollador Full Stack apasionado por la educación',
  location = 'Ciudad de México, México',
  website = 'https://ejemplo.com',
  github = 'usuario-demo',
  twitter = 'usuario_demo',
  level = 25,
  xp = 2450,
  streak = 15
WHERE email = 'tu-email@ejemplo.com'; -- Reemplaza con tu email

-- Insertar perfiles adicionales de prueba (estos son ficticios)
-- NOTA: Estos son solo para demostración, no tienen usuarios auth reales
INSERT INTO public.profiles (id, email, full_name, avatar_url, role, level, xp, streak, bio)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'carlos.fernandez@platzi.com', 'Carlos Fernández', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', 'instructor', 42, 4200, 30, 'Instructor de Desarrollo Web con 10+ años de experiencia'),
  ('22222222-2222-2222-2222-222222222222', 'sarah.johnson@platzi.com', 'Sarah Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 'instructor', 38, 3800, 25, 'Experta en React y Frontend moderno'),
  ('33333333-3333-3333-3333-333333333333', 'ana.garcia@platzi.com', 'Ana García', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', 'student', 28, 2800, 20, 'Entusiasta de la tecnología y el aprendizaje continuo'),
  ('44444444-4444-4444-4444-444444444444', 'miguel.santos@platzi.com', 'Miguel Santos', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel', 'instructor', 50, 5000, 45, 'Testing Expert y Quality Assurance Lead'),
  ('55555555-5555-5555-5555-555555555555', 'laura.torres@platzi.com', 'Laura Torres', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura', 'student', 18, 1800, 10, 'Estudiante de Computer Science')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 2: Insertar CURSOS
-- =====================================================
INSERT INTO public.courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status)
VALUES 
  (
    '10000000-0000-0000-0000-000000000001',
    'Curso Profesional de Desarrollo Web Full Stack',
    'desarrollo-web-full-stack',
    'Domina el desarrollo web moderno desde cero hasta nivel profesional. Aprende HTML, CSS, JavaScript, React, Node.js y mucho más.',
    'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800&h=600&fit=crop',
    '11111111-1111-1111-1111-111111111111',
    'Desarrollo Web',
    'intermediate',
    2700, -- 45 horas
    299.00,
    4.9,
    15420,
    135,
    'published'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'React Avanzado: Hooks, Context y Performance',
    'react-avanzado-hooks-context',
    'Optimiza tus aplicaciones React con técnicas avanzadas, hooks personalizados y mejores prácticas.',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
    '22222222-2222-2222-2222-222222222222',
    'Desarrollo Web',
    'advanced',
    1920, -- 32 horas
    249.00,
    4.8,
    12340,
    98,
    'published'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Python para Data Science y Machine Learning',
    'python-data-science-ml',
    'Aprende Python desde cero y conviértete en Data Scientist. Incluye NumPy, Pandas, Scikit-learn y más.',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop',
    '44444444-4444-4444-4444-444444444444',
    'Data Science',
    'intermediate',
    2400, -- 40 horas
    349.00,
    4.9,
    18750,
    120,
    'published'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 3: Insertar BLOG POSTS
-- =====================================================
INSERT INTO public.blog_posts (
  id, author_id, title, slug, excerpt, content, cover_image_url, 
  category, tags, status, reading_time, published_at
)
VALUES 
  (
    '20000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Introducción a React Server Components',
    'introduccion-react-server-components',
    'Descubre cómo los React Server Components están revolucionando el desarrollo web moderno.',
    '# Introducción a React Server Components

React Server Components (RSC) representan un cambio fundamental en cómo construimos aplicaciones React...

## ¿Qué son los Server Components?

Los Server Components son componentes de React que se ejecutan exclusivamente en el servidor...

## Beneficios principales

1. **Mejor rendimiento**: Menos JavaScript en el cliente
2. **Acceso directo a datos**: Sin necesidad de APIs intermedias
3. **Mejor SEO**: Contenido renderizado en servidor

## Ejemplo de uso

```jsx
// ProductList.server.jsx
async function ProductList() {
  const products = await db.products.findAll();
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
```

## Conclusión

Los React Server Components son el futuro del desarrollo web con React...',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop',
    'Desarrollo Web',
    ARRAY['React', 'Server Components', 'Next.js', 'Performance'],
    'published',
    10,
    NOW() - INTERVAL '2 days'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '22222222-2222-2222-2222-222222222222',
    'TypeScript 5.0: Nuevas características que debes conocer',
    'typescript-5-nuevas-caracteristicas',
    'TypeScript 5.0 trae mejoras significativas en rendimiento y nuevas features increíbles.',
    '# TypeScript 5.0: Nuevas características

TypeScript 5.0 ha llegado con mejoras increíbles...

## Decorators estándar

Los decorators ahora siguen el estándar de TC39...

```typescript
function logged(value, context) {
  return function (...args) {
    console.log(`Calling ${context.name}`);
    return value.call(this, ...args);
  };
}

class Calculator {
  @logged
  add(a: number, b: number) {
    return a + b;
  }
}
```

## const Type Parameters

Nueva sintaxis para type parameters inmutables...

## Conclusión

TypeScript 5.0 es una actualización emocionante...',
    'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=630&fit=crop',
    'Programación',
    ARRAY['TypeScript', 'JavaScript', 'Programming'],
    'published',
    8,
    NOW() - INTERVAL '5 days'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '33333333-3333-3333-3333-333333333333',
    'Mi experiencia aprendiendo a programar en 6 meses',
    'mi-experiencia-aprendiendo-programar',
    'Cómo pasé de cero conocimientos a conseguir mi primer trabajo como desarrollador.',
    '# Mi experiencia aprendiendo a programar

Hace 6 meses no sabía nada de programación. Hoy trabajo como desarrollador junior...

## El comienzo

Todo comenzó cuando decidí cambiar de carrera...

## Los primeros 3 meses

- HTML y CSS básico
- JavaScript fundamentals
- Mi primer proyecto: una calculadora

## Los siguientes 3 meses

- React y frameworks modernos
- Backend con Node.js
- Mi primer portfolio

## Consejos para principiantes

1. **Practica todos los días**: La consistencia es clave
2. **Construye proyectos**: No solo tutoriales
3. **Únete a comunidades**: El networking es importante

## Conclusión

Si yo pude, tú también puedes. ¡Adelante!',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=630&fit=crop',
    'Carrera',
    ARRAY['Principiantes', 'Motivación', 'Carrera', 'Aprendizaje'],
    'published',
    6,
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 4: Insertar POSTS SOCIALES
-- =====================================================
INSERT INTO public.posts (id, user_id, content, type, image_url, likes_count, comments_count, views_count)
VALUES 
  (
    '30000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '🚀 Nuevo tutorial sobre React Server Components disponible! Link en mi perfil 👆',
    'post',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1080&h=1080&fit=crop',
    234,
    45,
    1250
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '22222222-2222-2222-2222-222222222222',
    '💡 5 tips de TypeScript que cambiarán tu forma de programar! #1 te va a sorprender 🤯',
    'reel',
    'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1080&h=1920&fit=crop',
    456,
    89,
    3400
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '33333333-3333-3333-3333-333333333333',
    '🎯 ¡Completé el curso de Next.js! Gracias @carlos.fernandez por las excelentes clases',
    'post',
    NULL,
    123,
    23,
    567
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    '44444444-4444-4444-4444-444444444444',
    '🔴 EN VIVO: Construyendo una app Full Stack con Next.js y Supabase',
    'live',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&h=1080&fit=crop',
    789,
    156,
    5600
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 5: Insertar COMENTARIOS
-- =====================================================
INSERT INTO public.comments (id, user_id, blog_post_id, content, likes_count)
VALUES 
  (
    '40000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    '20000000-0000-0000-0000-000000000001',
    '¡Excelente artículo! Muy clara la explicación sobre Server Components 🚀',
    45
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '44444444-4444-4444-4444-444444444444',
    '20000000-0000-0000-0000-000000000001',
    '¿Podrías hacer un tutorial sobre cómo migrar de Client Components a Server Components?',
    23
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '55555555-5555-5555-5555-555555555555',
    '20000000-0000-0000-0000-000000000002',
    'Justo lo que necesitaba! TypeScript 5.0 se ve increíble 💪',
    34
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 6: Insertar LIKES de ejemplo
-- =====================================================
INSERT INTO public.likes (user_id, blog_post_id)
VALUES 
  ('33333333-3333-3333-3333-333333333333', '20000000-0000-0000-0000-000000000001'),
  ('44444444-4444-4444-4444-444444444444', '20000000-0000-0000-0000-000000000001'),
  ('55555555-5555-5555-5555-555555555555', '20000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

INSERT INTO public.likes (user_id, post_id)
VALUES 
  ('22222222-2222-2222-2222-222222222222', '30000000-0000-0000-0000-000000000001'),
  ('33333333-3333-3333-3333-333333333333', '30000000-0000-0000-0000-000000000001'),
  ('44444444-4444-4444-4444-444444444444', '30000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- =====================================================
-- PASO 7: Insertar SEGUIDORES
-- =====================================================
INSERT INTO public.followers (follower_id, following_id)
VALUES 
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222'),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111'),
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- =====================================================
-- PASO 8: Insertar ACHIEVEMENTS
-- =====================================================
INSERT INTO public.achievements (user_id, type, title, description, icon, xp_reward)
VALUES 
  (
    '33333333-3333-3333-3333-333333333333',
    'first_course',
    'Primera Lección Completada',
    'Completaste tu primera lección!',
    '🎓',
    100
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'streak_7',
    'Racha de 7 días',
    'Estudiaste 7 días seguidos!',
    '🔥',
    200
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- PASO 9: Insertar NOTIFICACIONES
-- =====================================================
INSERT INTO public.notifications (user_id, type, title, message, action_url, is_read)
VALUES 
  (
    '33333333-3333-3333-3333-333333333333',
    'achievement',
    'Nuevo logro desbloqueado',
    'Has completado tu primera lección!',
    '/gamification',
    false
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'like',
    'Les gustó tu comentario',
    'Carlos Fernández le dio like a tu comentario',
    '/blog',
    false
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Contar registros en cada tabla
SELECT 'profiles' as tabla, COUNT(*) as registros FROM public.profiles
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
SELECT 'followers', COUNT(*) FROM public.followers
UNION ALL
SELECT 'achievements', COUNT(*) FROM public.achievements
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications
ORDER BY tabla;
