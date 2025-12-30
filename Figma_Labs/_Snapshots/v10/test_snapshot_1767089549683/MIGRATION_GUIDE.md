# 🚀 Guía de Migración a Datos Reales de Supabase

## ✅ Estado Actual

### Infraestructura Completada:
- ✅ **Cliente de Supabase** configurado (`/src/lib/supabase.ts`)
- ✅ **Contexto Global** (`/src/app/context/SupabaseDataContext.tsx`)
- ✅ **Hooks Personalizados** (`/src/hooks/useSupabaseData.ts`)
- ✅ **Schema de Base de Datos** completo con 13 tablas
- ✅ **Sistema de Tracking de Actividad** con 4 tablas adicionales
- ✅ **Triggers Automáticos** para activity_logs, XP y deadlines
- ✅ **Vistas SQL Optimizadas** para queries frecuentes

### Tablas en Base de Datos:
1. ✅ **users** - Perfiles de usuarios
2. ✅ **courses** - Cursos disponibles
3. ✅ **modules** - Módulos de cursos
4. ✅ **lessons** - Lecciones individuales
5. ✅ **blog_posts** - Posts del blog
6. ✅ **posts** - Posts de red social
7. ✅ **comments** - Comentarios
8. ✅ **badges** - Insignias gamificación
9. ✅ **challenges** - Desafíos
10. ✅ **study_groups** - Grupos de estudio
11. ✅ **forum_posts** - Posts del foro
12. ✅ **enrollments** - Inscripciones a cursos
13. ✅ **user_progress** - Progreso detallado del usuario (por lección)
14. ✅ **activity_logs** - Registro de actividad diaria
15. ✅ **deadlines** - Fechas límite y tareas
16. ✅ **study_sessions** - Sesiones de estudio individuales

## 📋 Plan de Migración Completo

### Fase 1: Componentes Principales (ALTA PRIORIDAD)

#### 1.1 HomePage ✅ COMPLETADO
- Ya usa `useSupabaseData()` del contexto
- Convierte datos de Supabase a formato legacy
- Maneja loading y errores

#### 1.2 CoursesPage 🔄 EN PROGRESO
**Archivo:** `/src/app/pages/CoursesPage.tsx`
**Cambios necesarios:**
```tsx
import { useSupabaseData } from '../context/SupabaseDataContext';

// Reemplazar mock data por:
const { courses, loading, errors } = useSupabaseData();
```

#### 1.3 CoursePage (Detalle Individual) 🔴 PENDIENTE
**Archivo:** `/src/app/pages/CoursePage.tsx`
**Cambios necesarios:**
```tsx
import { useCourse } from '../../hooks/useSupabaseData';

function CoursePage({ courseId }) {
  const { course, loading, error } = useCourse(courseId);
  // Usar course en lugar de mock data
}
```

### Fase 2: Blog y Social (MEDIA PRIORIDAD)

#### 2.1 BlogPage 🔄 EN PROGRESO
**Archivo:** `/src/app/pages/BlogPage.tsx`
**Cambios necesarios:**
```tsx
const { blogPosts, loading, errors } = useSupabaseData();
```

#### 2.2 BlogPostPage (Detalle Individual) 🔴 PENDIENTE
**Archivo:** `/src/app/pages/BlogPostPage.tsx`
**Cambios necesarios:**
```tsx
import { useBlogPost } from '../../hooks/useSupabaseData';

function BlogPostPage({ slug }) {
  const { post, loading, error } = useBlogPost(slug);
}
```

#### 2.3 SocialPage 🔴 PENDIENTE
**Archivo:** `/src/app/pages/SocialPage.tsx`
**Cambios necesarios:**
```tsx
import { useSocialPosts } from '../../hooks/useSupabaseData';

const { posts, loading, error } = useSocialPosts({ limit: 50 });
```

### Fase 3: Dashboard del Usuario (ALTA PRIORIDAD)

#### 3.1 DashboardPage 🔴 PENDIENTE
**Archivo:** `/src/app/pages/DashboardPage.tsx`
**Cambios necesarios:**
```tsx
import { useEnrollments, useUserProgress } from '../../hooks/useSupabaseData';
import { useAuth } from '../context/AuthContext';

const { user } = useAuth();
const { enrollments, loading: loadingEnrollments } = useEnrollments(user?.id);
const { progress, loading: loadingProgress } = useUserProgress(user?.id);
```

### Fase 4: Gamificación (MEDIA PRIORIDAD)

#### 4.1 GamificationPage 🔴 PENDIENTE
**Archivo:** `/src/app/pages/GamificationPage.tsx`
**Cambios necesarios:**
```tsx
import { useBadges, useChallenges } from '../../hooks/useSupabaseData';

const { badges, loading: loadingBadges } = useBadges(user?.id);
const { challenges, loading: loadingChallenges } = useChallenges({ active: true });
```

### Fase 5: Grupos y Foro (BAJA PRIORIDAD)

#### 5.1 StudyGroupsPage 🔴 PENDIENTE
**Archivo:** `/src/app/pages/StudyGroupsPage.tsx`
**Cambios necesarios:**
```tsx
import { useStudyGroups } from '../../hooks/useSupabaseData';

const { groups, loading, error } = useStudyGroups({ limit: 50 });
```

#### 5.2 ForumPage 🔴 PENDIENTE
**Archivo:** `/src/app/pages/ForumPage.tsx`
**Cambios necesarios:**
```tsx
import { useForumPosts } from '../../hooks/useSupabaseData';

const { forumPosts, loading, error } = useForumPosts({ limit: 100 });
```

## 🔧 Utilidades y Componentes de Soporte

### Loading States Component
**Crear:** `/src/app/components/LoadingState.tsx`
```tsx
export function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Cargando datos...</p>
      </div>
    </div>
  );
}
```

### Error State Component
**Crear:** `/src/app/components/ErrorState.tsx`
```tsx
export function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-2xl font-bold text-white mb-2">Error al cargar datos</h3>
        <p className="text-slate-400 mb-6">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}
```

### Empty State Component
**Crear:** `/src/app/components/EmptyState.tsx`
```tsx
export function EmptyState({ title, message, icon = '📭' }: { title: string; message: string; icon?: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{message}</p>
    </div>
  );
}
```

## 📊 Checklist de Migración

### Backend/Database
- [x] Configurar cliente de Supabase
- [x] Crear esquema de base de datos (13 tablas)
- [x] Insertar datos de prueba con Master Data Sync
- [x] Crear helpers de Supabase
- [x] Crear contexto global de datos
- [x] Crear hooks personalizados

### Frontend - Páginas Principales
- [x] HomePage - Usa Supabase ✅
- [x] CourseDetail - Usa Supabase ✅
- [x] BlogPage - Usa Supabase ✅
- [x] BlogPostPage - Usa Supabase ✅
- [x] FeedPage (Social) - Usa Supabase ✅
- [x] DashboardPage - Usa Supabase ✅ (con activity tracking y deadlines)
- [ ] CoursesPage - Migrar a Supabase
- [ ] CoursePage - Migrar a Supabase

### Sistema de Tracking de Actividad
- [x] Tabla user_progress creada ✅
- [x] Tabla activity_logs creada ✅
- [x] Tabla deadlines creada ✅
- [x] Tabla study_sessions creada ✅
- [x] Hooks de tracking implementados ✅
- [x] Triggers automáticos configurados ✅
- [x] Dashboard con datos reales ✅
- [x] Sistema de recomendaciones inteligente ✅

### Frontend - Características Especiales
- [ ] GamificationPage - Migrar a Supabase
- [ ] StudyGroupsPage - Migrar a Supabase
- [ ] ForumPage - Migrar a Supabase
- [ ] SubscriptionsPage - Verificar integración

### Componentes de UI
- [ ] Crear LoadingState component
- [ ] Crear ErrorState component
- [ ] Crear EmptyState component
- [ ] Actualizar CourseCard para manejar loading
- [ ] Actualizar BlogPostCard para manejar loading

### Testing
- [ ] Verificar carga de cursos
- [ ] Verificar filtrado y búsqueda
- [ ] Verificar paginación
- [ ] Verificar manejo de errores
- [ ] Verificar estados de carga
- [ ] Verificar datos vacíos

## 🎯 Próximos Pasos Inmediatos

1. **Crear componentes de Loading/Error/Empty** (15 min)
2. **Migrar CoursesPage** (30 min)
3. **Migrar CoursePage** (45 min)
4. **Migrar DashboardPage** (60 min)

**Tiempo estimado total:** ~4 horas

## 💡 Notas Importantes

### Conversión de Datos
El contexto `SupabaseDataContext` ya incluye la función `convertToLegacyCourse` que convierte datos de Supabase al formato legacy usado por los componentes existentes. Esto permite una migración gradual sin romper componentes.

### Manejo de Errores
Todos los hooks retornan `{ data, loading, error }`. Siempre manejar los 3 estados:
```tsx
if (loading) return <LoadingState />;
if (error) return <ErrorState error={error.message} />;
if (!data || data.length === 0) return <EmptyState />;
```

### Performance
- Los datos se cachean en el contexto
- Las queries están optimizadas con índices
- Se usa paginación cuando es necesario
- Los componentes se re-renderizan solo cuando cambian los datos

### Datos de Prueba
Usar **Master Data Sync** desde DevTools para:
- Insertar 100+ cursos reales
- Insertar posts de blog
- Insertar posts sociales
- Insertar badges, challenges, etc.

## 🚨 Problemas Comunes y Soluciones

### 1. "No se encuentran cursos"
**Causa:** Base de datos vacía
**Solución:** Ejecutar Master Data Sync desde DevTools

### 2. "Error de autenticación"
**Causa:** Usuario no autenticado
**Solución:** Verificar que el usuario esté logueado con AuthContext

### 3. "Datos no se actualizan"
**Causa:** Cache del contexto
**Solución:** Llamar a `refreshCourses()`, `refreshBlogPosts()`, etc.

### 4. "Tipos incompatibles"
**Causa:** Diferencia entre tipos de Supabase y legacy
**Solución:** Usar `convertToLegacyCourse` del contexto

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [React Query para caching](https://tanstack.com/query/latest)
- [Schema Inspector en DevTools](#)

---

**Última actualización:** 2024-12-25
**Estado:** ✅ Migración avanzada (70% completado)