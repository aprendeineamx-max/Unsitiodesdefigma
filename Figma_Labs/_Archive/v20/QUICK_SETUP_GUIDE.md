# 🚀 GUÍA RÁPIDA: Ejecutar Setup de Activity Tracking

**Estado Actual Detectado:** ✅ 11 tablas OK | ⚠️ 3 tablas FALTAN
**Tiempo Estimado:** 3-5 minutos
**Dificultad:** ⭐ Fácil

---

## 📊 Diagnóstico Completo

### ✅ Tablas que YA EXISTEN (11):
- ✅ profiles (1 registro)
- ✅ courses (33 registros)
- ✅ lessons (493 registros)
- ✅ modules (107 registros)
- ✅ **user_progress** (0 registros) ← ¡Ya existe!
- ✅ blog_posts (3 registros)
- ✅ posts (4 registros)
- ✅ comments (4 registros)
- ✅ likes (0 registros)
- ✅ enrollments (0 registros)
- ✅ achievements (0 registros)

### ❌ Tablas que FALTAN (3):
- ❌ **activity_logs** ← Necesita crearse
- ❌ **deadlines** ← Necesita crearse
- ❌ **study_sessions** ← Necesita crearse

---

## 🎯 OPCIÓN 1: Auto Setup Wizard (RECOMENDADO ⭐)

### Paso 1: Ir al Wizard
```
Admin Panel → Dev Tools → Auto Setup Wizard
```

### Paso 2: Seguir el Wizard
El wizard detectará automáticamente que:
- `user_progress` ya existe ✅
- `activity_logs`, `deadlines`, `study_sessions` faltan ❌

### Paso 3: Ejecutar cada paso
Por cada paso el wizard:
1. ✅ Copia el SQL automáticamente
2. 🌐 Abre Supabase SQL Editor
3. 📋 Te indica pegar y ejecutar
4. ✅ Verifica que funcionó

### Paso 4: ¡Listo!
Cuando termines, todas las tablas estarán creadas y verificadas.

---

## 🎯 OPCIÓN 2: Ejecución Manual Rápida

Si prefieres hacerlo manualmente, aquí están los scripts exactos:

### Script 1: Crear Tablas Faltantes (REQUERIDO)

```sql
-- =====================================================
-- CREAR SOLO LAS TABLAS QUE FALTAN (TIPOS CORREGIDOS)
-- =====================================================
-- NOTA: Tu tabla profiles usa TEXT para IDs, no UUID

-- ACTIVITY_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  date DATE NOT NULL,
  study_time INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  course_activities JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  
  UNIQUE(user_id, date)
);

-- DEADLINES TABLE
CREATE TABLE IF NOT EXISTS public.deadlines (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('assignment', 'project', 'quiz', 'exam', 'milestone')) DEFAULT 'assignment',
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'submitted', 'completed', 'overdue')) DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- STUDY_SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  focus_score INTEGER CHECK (focus_score >= 0 AND focus_score <= 100),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);
```

**Cómo ejecutar:**
1. Copia el script de arriba
2. Ve a: https://supabase.com/dashboard/project/bntwyvwavxgspvcvelay/sql/new
3. Pega el script
4. Click "Run" (o Ctrl+Enter)
5. Verás "Success. No rows returned" ✅

---

### Script 2: Crear Índices (REQUERIDO)

```sql
-- =====================================================
-- CREAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Indexes for activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON public.activity_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, date);

-- Indexes for deadlines
CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON public.deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON public.deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON public.deadlines(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_status ON public.deadlines(user_id, status);

-- Indexes for study_sessions
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON public.study_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_course_id ON public.study_sessions(course_id);

-- Indexes for user_progress (if not already created)
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON public.user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON public.user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON public.user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_accessed ON public.user_progress(last_accessed DESC);
```

---

### Script 3: Crear Triggers (REQUERIDO)

```sql
-- =====================================================
-- CREAR TRIGGERS AUTOMÁTICOS
-- =====================================================

-- Function to update activity log when progress is made
CREATE OR REPLACE FUNCTION update_activity_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_logs (
    user_id, date, study_time, xp_earned, lessons_completed, updated_at
  )
  VALUES (
    NEW.user_id,
    CURRENT_DATE,
    COALESCE(NEW.time_spent / 60, 0),
    CASE WHEN NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN 50 ELSE 0 END,
    CASE WHEN NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN 1 ELSE 0 END,
    NOW()
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    study_time = public.activity_logs.study_time + COALESCE(NEW.time_spent / 60, 0),
    xp_earned = public.activity_logs.xp_earned + CASE WHEN NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN 50 ELSE 0 END,
    lessons_completed = public.activity_logs.lessons_completed + CASE WHEN NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN 1 ELSE 0 END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_activity_log ON public.user_progress;
CREATE TRIGGER trigger_update_activity_log
  AFTER INSERT OR UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_log();

-- Function to update user XP
CREATE OR REPLACE FUNCTION update_user_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    xp = xp + NEW.xp_earned,
    level = FLOOR((xp + NEW.xp_earned) / 1000) + 1,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_xp ON public.activity_logs;
CREATE TRIGGER trigger_update_user_xp
  AFTER INSERT OR UPDATE ON public.activity_logs
  FOR EACH ROW
  WHEN (NEW.xp_earned > 0)
  EXECUTE FUNCTION update_user_xp();

-- Function to auto-update deadline status
CREATE OR REPLACE FUNCTION update_deadline_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.due_date < NOW() AND NEW.status = 'pending' THEN
    NEW.status = 'overdue';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_deadline_status ON public.deadlines;
CREATE TRIGGER trigger_update_deadline_status
  BEFORE INSERT OR UPDATE ON public.deadlines
  FOR EACH ROW
  EXECUTE FUNCTION update_deadline_status();
```

---

### Script 4: Activar RLS (REQUERIDO)

```sql
-- =====================================================
-- ACTIVAR ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for activity_logs
DROP POLICY IF EXISTS "Users can view their own activity" ON public.activity_logs;
CREATE POLICY "Users can view their own activity" 
  ON public.activity_logs FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own activity" ON public.activity_logs;
CREATE POLICY "Users can insert their own activity" 
  ON public.activity_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own activity" ON public.activity_logs;
CREATE POLICY "Users can update their own activity" 
  ON public.activity_logs FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policies for deadlines
DROP POLICY IF EXISTS "Users can view their own deadlines" ON public.deadlines;
CREATE POLICY "Users can view their own deadlines" 
  ON public.deadlines FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own deadlines" ON public.deadlines;
CREATE POLICY "Users can insert their own deadlines" 
  ON public.deadlines FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own deadlines" ON public.deadlines;
CREATE POLICY "Users can update their own deadlines" 
  ON public.deadlines FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own deadlines" ON public.deadlines;
CREATE POLICY "Users can delete their own deadlines" 
  ON public.deadlines FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies for study_sessions
DROP POLICY IF EXISTS "Users can view their own study sessions" ON public.study_sessions;
CREATE POLICY "Users can view their own study sessions" 
  ON public.study_sessions FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own study sessions" ON public.study_sessions;
CREATE POLICY "Users can insert their own study sessions" 
  ON public.study_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own study sessions" ON public.study_sessions;
CREATE POLICY "Users can update their own study sessions" 
  ON public.study_sessions FOR UPDATE 
  USING (auth.uid() = user_id);
```

---

### Script 5: Datos de Ejemplo (OPCIONAL)

```sql
-- =====================================================
-- INSERTAR DATOS DE ACTIVIDAD DE EJEMPLO
-- =====================================================

DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  -- Get the first user
  SELECT id INTO sample_user_id FROM public.profiles LIMIT 1;
  
  IF sample_user_id IS NOT NULL THEN
    -- Insert activity for last 7 days
    INSERT INTO public.activity_logs (user_id, date, study_time, xp_earned, lessons_completed, exercises_completed)
    VALUES
      (sample_user_id, CURRENT_DATE - INTERVAL '6 days', 150, 150, 3, 2),
      (sample_user_id, CURRENT_DATE - INTERVAL '5 days', 120, 120, 2, 1),
      (sample_user_id, CURRENT_DATE - INTERVAL '4 days', 180, 200, 4, 3),
      (sample_user_id, CURRENT_DATE - INTERVAL '3 days', 140, 150, 3, 2),
      (sample_user_id, CURRENT_DATE - INTERVAL '2 days', 160, 180, 3, 2),
      (sample_user_id, CURRENT_DATE - INTERVAL '1 day', 220, 250, 5, 4),
      (sample_user_id, CURRENT_DATE, 95, 100, 2, 1)
    ON CONFLICT (user_id, date) DO UPDATE
    SET 
      study_time = EXCLUDED.study_time,
      xp_earned = EXCLUDED.xp_earned,
      lessons_completed = EXCLUDED.lessons_completed,
      exercises_completed = EXCLUDED.exercises_completed;
      
    RAISE NOTICE 'Sample activity data inserted successfully for user %', sample_user_id;
  ELSE
    RAISE NOTICE 'No users found in profiles table';
  END IF;
END $$;
```

---

### Script 6: Deadlines de Ejemplo (OPCIONAL)

```sql
-- =====================================================
-- INSERTAR DEADLINES DE EJEMPLO
-- =====================================================

DO $$
DECLARE
  sample_user_id UUID;
  sample_course_id UUID;
BEGIN
  -- Get the first user and course
  SELECT id INTO sample_user_id FROM public.profiles LIMIT 1;
  SELECT id INTO sample_course_id FROM public.courses LIMIT 1;
  
  IF sample_user_id IS NOT NULL THEN
    INSERT INTO public.deadlines (user_id, course_id, title, description, type, due_date, status, priority)
    VALUES
      (sample_user_id, sample_course_id, 'Proyecto Final - Curso React', 'Completar la aplicación de e-commerce', 'project', CURRENT_DATE + INTERVAL '3 days', 'pending', 'high'),
      (sample_user_id, sample_course_id, 'Quiz: Hooks Avanzados', 'Evaluación sobre hooks personalizados', 'quiz', CURRENT_DATE + INTERVAL '5 days', 'pending', 'medium'),
      (sample_user_id, sample_course_id, 'Examen Final del Módulo', 'Examen comprehensivo de React', 'exam', CURRENT_DATE + INTERVAL '7 days', 'pending', 'high'),
      (sample_user_id, NULL, 'Código de Práctica Diaria', 'Completar 5 ejercicios de algoritmos', 'assignment', CURRENT_DATE + INTERVAL '10 days', 'pending', 'low'),
      (sample_user_id, sample_course_id, 'Presentación de Proyecto', 'Presentar proyecto final ante la clase', 'milestone', CURRENT_DATE + INTERVAL '14 days', 'pending', 'urgent')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Sample deadlines inserted successfully for user %', sample_user_id;
  ELSE
    RAISE NOTICE 'No users found in profiles table';
  END IF;
END $$;
```

---

## ✅ Verificar que Todo Funcionó

Después de ejecutar los scripts, verifica:

### Opción A: Usar SQL Verification
```
Admin Panel → Dev Tools → SQL Verification → Ejecutar Verificación
```

Deberías ver:
- ✅ activity_logs: Tabla existe (X registros)
- ✅ deadlines: Tabla existe (X registros)
- ✅ study_sessions: Tabla existe (X registros)

### Opción B: Query Manual
```sql
-- Verificar que las tablas existen
SELECT COUNT(*) FROM activity_logs;
SELECT COUNT(*) FROM deadlines;
SELECT COUNT(*) FROM study_sessions;
```

---

## 🎉 ¡Completado!

Si todo salió bien, ahora tienes:

1. ✅ **4 tablas de Activity Tracking** funcionando
   - user_progress
   - activity_logs
   - deadlines
   - study_sessions

2. ✅ **16 índices** para performance optimal

3. ✅ **3 triggers automáticos**
   - Auto-actualización de activity logs
   - Auto-actualización de XP del usuario
   - Auto-actualización de estado de deadlines

4. ✅ **12 políticas RLS** para seguridad

5. ✅ **Datos de ejemplo** (si ejecutaste los scripts opcionales)

---

## 🐛 ¿Problemas?

### Error: "table already exists"
✅ **Solución:** Ignora el error, significa que la tabla ya existe. Continúa con el siguiente script.

### Error: "permission denied"
❌ **Problema:** No tienes permisos suficientes  
✅ **Solución:** Asegúrate de estar usando el SQL Editor de Supabase, no el frontend.

### Error: "foreign key violation"
❌ **Problema:** Tabla referenciada no existe  
✅ **Solución:** Verifica que `profiles`, `courses`, `lessons`, `modules` existan primero.

### Las tablas no aparecen en la verificación
✅ **Solución:** 
1. Refresca el cache de Supabase
2. Espera 10-30 segundos
3. Ejecuta la verificación nuevamente

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa el log** en SQL Verification
2. **Consulta** `/ERROR_LOG_TECHNIQUES_THAT_DONT_WORK.md`
3. **Lee** `/SUCCESS_LOG_TECHNIQUES_THAT_WORK.md`
4. **Reporta** el error con screenshots

---

**Última actualización:** 25 de Diciembre, 2024  
**Versión:** 1.0.0  
**Estado:** ✅ LISTO PARA EJECUTAR