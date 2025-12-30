-- =====================================================
-- Datos de Prueba CORREGIDOS - Solo usuarios reales
-- =====================================================
-- Tu User ID: 7c127825-7000-4711-ad61-9dfb99336b51
-- =====================================================

-- =====================================================
-- PASO 1: Actualizar TU perfil con más información
-- =====================================================
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
  streak = 15,
  role = 'student'
WHERE id = '7c127825-7000-4711-ad61-9dfb99336b51';

-- =====================================================
-- PASO 2: Insertar CURSOS (asignados a TU usuario)
-- =====================================================
INSERT INTO public.courses (id, title, slug, description, thumbnail_url, instructor_id, category, difficulty, duration, price, rating, students_count, lessons_count, status)
VALUES 
  (
    '10000000-0000-0000-0000-000000000001',
    'Curso Profesional de Desarrollo Web Full Stack',
    'desarrollo-web-full-stack',
    'Domina el desarrollo web moderno desde cero hasta nivel profesional. Aprende HTML, CSS, JavaScript, React, Node.js y mucho más.',
    'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800&h=600&fit=crop',
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    'Desarrollo Web',
    'intermediate',
    2700,
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
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    'Desarrollo Web',
    'advanced',
    1920,
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
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    'Data Science',
    'intermediate',
    2400,
    349.00,
    4.9,
    18750,
    120,
    'published'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'Diseño UX/UI Profesional con Figma',
    'diseno-ux-ui-figma',
    'Aprende a diseñar interfaces profesionales y crea experiencias de usuario excepcionales.',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
    '7c127825-7000-4711-ad61-9dfb99336b51',
    'Diseño',
    'intermediate',
    2100,
    199.00,
    4.7,
    8920,
    87,
    'published'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'Node.js y Express: Backend Profesional',
    'nodejs-express-backend',
    'Construye APIs REST robustas y escalables con Node.js y Express desde cero.',
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=600&fit=crop',
    '7c127825-7000-4711-ad61-9dfb99336b51',
    'Backend',
    'intermediate',
    1800,
    279.00,
    4.8,
    11250,
    92,
    'published'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 3: Insertar BLOG POSTS (escritos por TI)
-- =====================================================
INSERT INTO public.blog_posts (
  id, author_id, title, slug, excerpt, content, cover_image_url, 
  category, tags, status, reading_time, published_at
)
VALUES 
  (
    '20000000-0000-0000-0000-000000000001',
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
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

Los React Server Components son el futuro del desarrollo web con React. Su capacidad para reducir el JavaScript del cliente mientras mantienen la interactividad es impresionante.

¡Espero que este artículo te haya ayudado a entender mejor esta tecnología!',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop',
    'Desarrollo Web',
    ARRAY['React', 'Server Components', 'Next.js', 'Performance'],
    'published',
    10,
    NOW() - INTERVAL '2 days'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    'TypeScript 5.0: Nuevas características que debes conocer',
    'typescript-5-nuevas-caracteristicas',
    'TypeScript 5.0 trae mejoras significativas en rendimiento y nuevas features increíbles.',
    '# TypeScript 5.0: Nuevas características

TypeScript 5.0 ha llegado con mejoras increíbles en rendimiento y nuevas características que todo desarrollador debe conocer.

## Decorators estándar

Los decorators ahora siguen el estándar de TC39, lo que significa mayor compatibilidad...

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

Nueva sintaxis para type parameters inmutables que mejora la seguridad de tipos.

## Mejoras de Performance

TypeScript 5.0 es hasta 3x más rápido en proyectos grandes gracias a optimizaciones en el compilador.

## Conclusión

TypeScript 5.0 es una actualización emocionante que mejora tanto la experiencia del desarrollador como el rendimiento.',
    'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=630&fit=crop',
    'Programación',
    ARRAY['TypeScript', 'JavaScript', 'Programming'],
    'published',
    8,
    NOW() - INTERVAL '5 days'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    'Cómo configurar Supabase en tu aplicación React',
    'configurar-supabase-react',
    'Guía completa para integrar Supabase como backend de tu aplicación React moderna.',
    '# Cómo configurar Supabase en tu aplicación React

Supabase es una alternativa open-source a Firebase que te permite crear aplicaciones full-stack rápidamente.

## ¿Qué es Supabase?

Supabase combina PostgreSQL, autenticación, storage y funciones en una sola plataforma.

## Instalación

```bash
npm install @supabase/supabase-js
```

## Configuración básica

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
```

## Ejemplo de Query

```typescript
const { data, error } = await supabase
  .from("posts")
  .select("*")
  .limit(10);
```

## Row Level Security

Una de las mejores características de Supabase es RLS, que te permite definir políticas de acceso a nivel de base de datos.

## Conclusión

Supabase hace que trabajar con PostgreSQL sea tan fácil como usar Firebase, pero con todo el poder de SQL.',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop',
    'Desarrollo Web',
    ARRAY['Supabase', 'React', 'PostgreSQL', 'Backend'],
    'published',
    12,
    NOW() - INTERVAL '1 day'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    '10 trucos de CSS que todo desarrollador debe conocer',
    '10-trucos-css-esenciales',
    'Mejora tus habilidades de CSS con estos trucos prácticos y modernos.',
    '# 10 trucos de CSS que todo desarrollador debe conocer

CSS moderno tiene muchas características poderosas que facilitan el desarrollo web.

## 1. CSS Grid para layouts complejos

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

## 2. Custom Properties (Variables CSS)

```css
:root {
  --primary-color: #3b82f6;
  --spacing-unit: 8px;
}
```

## 3. Flexbox para centrado perfecto

```css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

## 4. Clamp() para tipografía responsive

```css
h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
}
```

## 5. Aspect Ratio

```css
.video-container {
  aspect-ratio: 16 / 9;
}
```

...y 5 más en el artículo completo!

## Conclusión

CSS moderno nos da herramientas increíbles. ¡Úsalas!',
    'https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=1200&h=630&fit=crop',
    'Diseño',
    ARRAY['CSS', 'Frontend', 'Web Design', 'Tips'],
    'published',
    7,
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 4: Insertar POSTS SOCIALES (creados por TI)
-- =====================================================
INSERT INTO public.posts (id, user_id, content, type, image_url, likes_count, comments_count, views_count)
VALUES 
  (
    '30000000-0000-0000-0000-000000000001',
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    '🚀 Acabo de terminar de configurar Supabase en mi proyecto! La experiencia de desarrollo es increíble 💯',
    'post',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080&h=1080&fit=crop',
    156,
    28,
    890
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    '💡 5 tips de React que me hubiera gustado saber antes... Thread 🧵👇',
    'post',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1080&h=1080&fit=crop',
    234,
    45,
    1250
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    '🎯 Nuevo artículo en el blog: "TypeScript 5.0 - Nuevas características"

Link en mi perfil 📝',
    'post',
    NULL,
    89,
    12,
    456
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    '🔥 Tutorial rápido de CSS Grid en 60 segundos! 

¿Te gustó? Dale like y guarda para después 💾',
    'reel',
    'https://images.unsplash.com/photo-1523437113738-bbd3cc89fb19?w=1080&h=1920&fit=crop',
    567,
    89,
    4200
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    '✨ Historia del día: Mi setup de desarrollo actualizado

Swipe para ver más fotos 📸',
    'story',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1080&h=1920&fit=crop',
    123,
    15,
    890
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 5: Insertar COMENTARIOS en tus propios posts
-- =====================================================
INSERT INTO public.comments (id, user_id, blog_post_id, content, likes_count)
VALUES 
  (
    '40000000-0000-0000-0000-000000000001',
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    '20000000-0000-0000-0000-000000000001',
    'Gracias por leer! Si tienes preguntas sobre React Server Components, déjalas en los comentarios 👇',
    12
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    '20000000-0000-0000-0000-000000000002',
    'Update: Acabo de actualizar el artículo con más ejemplos de código 🚀',
    8
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASO 6: Insertar ACHIEVEMENTS para TI
-- =====================================================
INSERT INTO public.achievements (user_id, type, title, description, icon, xp_reward)
VALUES 
  (
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    'first_post',
    'Primera Publicación',
    'Creaste tu primer post en la plataforma!',
    '✍️',
    50
  ),
  (
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    'first_course',
    'Primer Curso Creado',
    'Publicaste tu primer curso!',
    '🎓',
    100
  ),
  (
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    'streak_7',
    'Racha de 7 días',
    'Estudiaste 7 días seguidos!',
    '🔥',
    200
  ),
  (
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    'level_25',
    'Nivel 25 Alcanzado',
    'Llegaste al nivel 25!',
    '⭐',
    500
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- PASO 7: Insertar NOTIFICACIONES para TI
-- =====================================================
INSERT INTO public.notifications (user_id, type, title, message, action_url, is_read)
VALUES 
  (
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    'achievement',
    'Nuevo logro desbloqueado!',
    'Has alcanzado el nivel 25! 🎉',
    '/gamification',
    false
  ),
  (
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    'milestone',
    'Hito alcanzado',
    'Tu curso ya tiene 15,000+ estudiantes!',
    '/courses',
    false
  ),
  (
    '7c127825-7000-4711-ad61-9dfb99336b51', -- TU ID
    'welcome',
    'Bienvenido a Platzi Clone!',
    'Estamos felices de tenerte aquí. Explora los cursos disponibles.',
    '/home',
    true
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
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
SELECT 'achievements', COUNT(*) FROM public.achievements
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications
ORDER BY tabla;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- profiles: 1
-- courses: 5
-- blog_posts: 4
-- posts: 5
-- comments: 2
-- achievements: 4
-- notifications: 3
-- =====================================================
