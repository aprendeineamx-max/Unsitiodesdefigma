# 📊 Guía de Sistema de Tracking de Actividad

## 🎯 Descripción General

Hemos implementado un sistema completo de tracking de actividad que permite seguir el progreso detallado de los estudiantes a nivel de lección, registrar sesiones de estudio, gestionar deadlines y visualizar estadísticas de aprendizaje en tiempo real.

## 📋 Tablas Nuevas Creadas

### 1. **user_progress** - Progreso Detallado por Lección
Rastrea el progreso de cada usuario en cada lección individual.

```sql
- user_id: ID del usuario
- course_id: ID del curso
- lesson_id: ID de la lección
- module_id: ID del módulo
- status: 'not_started' | 'in_progress' | 'completed'
- progress_percentage: 0-100
- time_spent: Tiempo en segundos
- started_at, completed_at, last_accessed
```

### 2. **activity_logs** - Registro de Actividad Diaria
Agrupa la actividad del usuario por día para estadísticas.

```sql
- user_id: ID del usuario
- date: Fecha de la actividad
- study_time: Tiempo de estudio en minutos
- xp_earned: XP ganado ese día
- lessons_completed: Número de lecciones completadas
- exercises_completed: Número de ejercicios completados
```

### 3. **deadlines** - Fechas Límite y Tareas
Gestiona fechas límite de proyectos, quizzes y asignaciones.

```sql
- user_id: ID del usuario
- course_id: ID del curso (opcional)
- title: Título de la tarea
- description: Descripción
- type: 'assignment' | 'project' | 'quiz' | 'exam' | 'milestone'
- due_date: Fecha límite
- status: 'pending' | 'submitted' | 'completed' | 'overdue'
- priority: 'low' | 'medium' | 'high' | 'urgent'
```

### 4. **study_sessions** - Sesiones de Estudio
Registra sesiones individuales de estudio con timestamps.

```sql
- user_id: ID del usuario
- course_id: ID del curso
- lesson_id: ID de la lección (opcional)
- started_at: Inicio de la sesión
- ended_at: Fin de la sesión
- duration: Duración en segundos
- focus_score: Puntuación de enfoque (opcional)
```

## 🔧 Hooks Disponibles

### Activity Logs
```typescript
import { useActivityLogs } from '../hooks/useSupabaseData';

// En tu componente:
const { activities, loading, error } = useActivityLogs(userId, 7); // Últimos 7 días
```

### Deadlines
```typescript
import { useDeadlines } from '../hooks/useSupabaseData';

const { deadlines, loading, error } = useDeadlines(userId, {
  status: 'pending',
  limit: 5
});
```

### Progreso Detallado
```typescript
import { useDetailedProgress } from '../hooks/useSupabaseData';

const { progress, loading, error } = useDetailedProgress(userId, courseId);
```

### Sesiones de Estudio
```typescript
import { useStudySessions } from '../hooks/useSupabaseData';

const { sessions, loading, error } = useStudySessions(userId, {
  courseId: 'xxx',
  limit: 10
});
```

## 🛠️ Funciones Utilitarias

### 1. Actualizar Progreso de Lección
```typescript
import { updateLessonProgress } from '../hooks/useSupabaseData';

// Marcar lección como en progreso
await updateLessonProgress(userId, lessonId, courseId, moduleId, {
  status: 'in_progress',
  progressPercentage: 50,
  timeSpent: 300 // 5 minutos en segundos
});

// Marcar lección como completada
await updateLessonProgress(userId, lessonId, courseId, moduleId, {
  status: 'completed'
});
```

### 2. Gestionar Sesiones de Estudio
```typescript
import { startStudySession, endStudySession } from '../hooks/useSupabaseData';

// Iniciar sesión
const { data: session } = await startStudySession(userId, courseId, lessonId);

// Terminar sesión (calcula duración automáticamente)
await endStudySession(session.id);
```

### 3. Crear Deadlines
```typescript
import { createDeadline } from '../hooks/useSupabaseData';

await createDeadline(userId, {
  title: 'Proyecto Final - React',
  description: 'Completar aplicación de e-commerce',
  type: 'project',
  dueDate: new Date('2024-12-31'),
  courseId: 'xxx',
  priority: 'high'
});
```

### 4. Actualizar Estado de Deadline
```typescript
import { updateDeadlineStatus } from '../hooks/useSupabaseData';

await updateDeadlineStatus(deadlineId, 'completed');
```

## 🔄 Triggers Automáticos

### 1. Actualización de Activity Logs
Cuando se actualiza `user_progress`, automáticamente:
- Actualiza o crea un registro en `activity_logs` para ese día
- Suma el tiempo de estudio
- Suma el XP ganado (50 XP por lección completada)
- Incrementa el contador de lecciones completadas

### 2. Actualización de XP del Usuario
Cuando se gana XP en `activity_logs`, automáticamente:
- Actualiza el XP total del usuario en `profiles`
- Recalcula el nivel del usuario (1 nivel cada 1000 XP)

### 3. Auto-marcar Deadlines Vencidos
Antes de insertar/actualizar un deadline:
- Si la fecha límite ha pasado y el status es 'pending'
- Automáticamente cambia el status a 'overdue'

## 📊 Vistas Disponibles

### 1. user_weekly_activity
Muestra la actividad de los últimos 7 días:
```sql
SELECT * FROM user_weekly_activity WHERE user_id = 'xxx';
```

### 2. upcoming_deadlines
Muestra deadlines pendientes ordenados por fecha:
```sql
SELECT * FROM upcoming_deadlines WHERE user_id = 'xxx';
```

### 3. course_progress_summary
Resume el progreso por curso:
```sql
SELECT * FROM course_progress_summary WHERE user_id = 'xxx';
```

## 📈 Ejemplo de Uso Completo

### En un Reproductor de Video de Lección:

```typescript
import { useState, useEffect } from 'react';
import { 
  startStudySession, 
  endStudySession, 
  updateLessonProgress 
} from '../hooks/useSupabaseData';
import { useAuth } from '../context/AuthContext';

function VideoPlayer({ courseId, moduleId, lessonId }) {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState(null);
  const [progress, setProgress] = useState(0);

  // Iniciar sesión al montar el componente
  useEffect(() => {
    async function startSession() {
      const { data } = await startStudySession(
        user.id, 
        courseId, 
        lessonId
      );
      setSessionId(data?.id);
      
      // Marcar como "en progreso"
      await updateLessonProgress(
        user.id,
        lessonId,
        courseId,
        moduleId,
        { status: 'in_progress' }
      );
    }
    
    startSession();
    
    // Terminar sesión al desmontar
    return () => {
      if (sessionId) {
        endStudySession(sessionId);
      }
    };
  }, []);

  // Actualizar progreso mientras se ve el video
  const handleVideoProgress = async (percentage) => {
    setProgress(percentage);
    
    await updateLessonProgress(
      user.id,
      lessonId,
      courseId,
      moduleId,
      { 
        progressPercentage: percentage,
        timeSpent: Math.floor(videoRef.current.currentTime)
      }
    );
    
    // Marcar como completado al llegar al 90%
    if (percentage >= 90) {
      await updateLessonProgress(
        user.id,
        lessonId,
        courseId,
        moduleId,
        { status: 'completed' }
      );
    }
  };

  return (
    <video 
      onTimeUpdate={(e) => {
        const percent = (e.target.currentTime / e.target.duration) * 100;
        handleVideoProgress(percent);
      }}
    />
  );
}
```

### En el Dashboard:

```typescript
import { useActivityLogs, useDeadlines } from '../hooks/useSupabaseData';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user } = useAuth();
  
  // Obtener actividad de la última semana
  const { activities } = useActivityLogs(user?.id, 7);
  
  // Obtener deadlines pendientes
  const { deadlines } = useDeadlines(user?.id, { 
    status: 'pending',
    limit: 5 
  });

  // Transformar datos para el gráfico
  const weeklyData = activities.map(activity => ({
    day: new Date(activity.date).toLocaleDateString('es-ES', { weekday: 'short' }),
    hours: activity.study_time / 60, // Convertir minutos a horas
    xp: activity.xp_earned
  }));

  // Mostrar deadlines urgentes
  const urgentDeadlines = deadlines.filter(d => {
    const daysUntilDue = Math.ceil(
      (new Date(d.due_date) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDue <= 3;
  });

  return (
    <div>
      {/* Gráfico de actividad */}
      <ActivityChart data={weeklyData} />
      
      {/* Lista de deadlines urgentes */}
      <UrgentDeadlines deadlines={urgentDeadlines} />
    </div>
  );
}
```

## 🚀 Mejores Prácticas

### 1. **Actualizar Progreso Frecuentemente**
- Actualiza el progreso cada 30-60 segundos durante una sesión activa
- Usa debouncing para evitar demasiadas llamadas a la DB

### 2. **Gestión de Sesiones**
- Siempre termina las sesiones al salir de una lección
- Usa `useEffect` cleanup para asegurar que las sesiones se cierren

### 3. **Deadlines**
- Crea deadlines automáticamente cuando un curso tiene fechas límite
- Envía notificaciones 3, 1 días antes y el día del vencimiento

### 4. **XP y Gamificación**
- Otorga XP por completar lecciones (automático via trigger)
- Otorga XP bonus por:
  - Completar cursos completos
  - Mantener rachas de estudio
  - Participar en foros y ayudar a otros

### 5. **Privacidad**
- Todas las tablas tienen Row Level Security (RLS) activado
- Los usuarios solo pueden ver/modificar sus propios datos

## 🐛 Troubleshooting

### Los activity_logs no se actualizan automáticamente
**Solución**: Verifica que los triggers estén creados:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_activity_log';
```

### El XP del usuario no se actualiza
**Solución**: Verifica que el trigger de XP esté activo y que `xp_earned > 0`.

### Las sesiones quedan abiertas sin `ended_at`
**Solución**: Implementa un cron job que cierre sesiones abiertas por más de 4 horas.

## 📝 TODO / Mejoras Futuras

- [ ] Implementar cron job para cerrar sesiones antiguas
- [ ] Añadir sistema de notificaciones para deadlines
- [ ] Implementar sistema de metas/goals personalizables
- [ ] Añadir analytics avanzados (tiempo promedio por tipo de contenido)
- [ ] Implementar sistema de comparación con otros estudiantes (opcional)
- [ ] Añadir exportación de estadísticas en PDF/CSV

## 🎓 Conclusión

Este sistema de tracking proporciona una visión completa y detallada del progreso del estudiante, permitiendo:
- Visualización precisa de actividad diaria/semanal/mensual
- Gestión efectiva de deadlines y tareas
- Gamificación automática con XP y niveles
- Métricas detalladas para mejorar la experiencia de aprendizaje

¡Úsalo para crear una experiencia de aprendizaje verdaderamente personalizada!
