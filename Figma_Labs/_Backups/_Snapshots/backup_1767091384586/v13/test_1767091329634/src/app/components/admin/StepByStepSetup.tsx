import { useState } from 'react';
import { Copy, CheckCircle, PlayCircle, ListOrdered } from 'lucide-react';

export function StepByStepSetup() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (step: string, script: string) => {
    navigator.clipboard.writeText(script);
    setCopied(step);
    setTimeout(() => setCopied(null), 3000);
  };

  const step1_indexes = `-- =====================================================
-- PASO 1: CREAR ÍNDICES (Ejecutar PRIMERO)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON public.activity_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, date);

CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON public.deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON public.deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON public.deadlines(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_status ON public.deadlines(user_id, status);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON public.study_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_course_id ON public.study_sessions(course_id);

-- Verificar que se crearon
SELECT COUNT(*) as indices_creados 
FROM pg_indexes 
WHERE tablename IN ('activity_logs', 'deadlines', 'study_sessions') 
  AND schemaname = 'public'
  AND indexname LIKE 'idx_%';

-- Debería devolver: indices_creados = 9`;

  const step2_functions = `-- =====================================================
-- PASO 2: CREAR FUNCIONES (Ejecutar SEGUNDO)
-- =====================================================

-- Function 1: Update activity log when progress is made
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

-- Function 2: Update user XP
CREATE OR REPLACE FUNCTION update_user_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    xp = COALESCE(xp, 0) + NEW.xp_earned,
    level = FLOOR((COALESCE(xp, 0) + NEW.xp_earned) / 1000) + 1,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Auto-update deadline status
CREATE OR REPLACE FUNCTION update_deadline_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.due_date < NOW() AND NEW.status = 'pending' THEN
    NEW.status = 'overdue';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar que se crearon
SELECT proname as function_name 
FROM pg_proc 
WHERE proname IN (
  'update_activity_log',
  'update_user_xp',
  'update_deadline_status'
);

-- Debería devolver 3 filas con los nombres de las funciones`;

  const step3_triggers = `-- =====================================================
-- PASO 3: CREAR TRIGGERS (Ejecutar TERCERO)
-- =====================================================

-- Trigger 1: Update activity log on user_progress changes
DROP TRIGGER IF EXISTS trigger_update_activity_log ON public.user_progress;
CREATE TRIGGER trigger_update_activity_log
  AFTER INSERT OR UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_log();

-- Trigger 2: Update user XP on activity_logs changes
DROP TRIGGER IF EXISTS trigger_update_user_xp ON public.activity_logs;
CREATE TRIGGER trigger_update_user_xp
  AFTER INSERT OR UPDATE ON public.activity_logs
  FOR EACH ROW
  WHEN (NEW.xp_earned > 0)
  EXECUTE FUNCTION update_user_xp();

-- Trigger 3: Auto-update deadline status
DROP TRIGGER IF EXISTS trigger_update_deadline_status ON public.deadlines;
CREATE TRIGGER trigger_update_deadline_status
  BEFORE INSERT OR UPDATE ON public.deadlines
  FOR EACH ROW
  EXECUTE FUNCTION update_deadline_status();

-- Verificar que se crearon
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgname IN (
  'trigger_update_activity_log',
  'trigger_update_user_xp',
  'trigger_update_deadline_status'
);

-- Debería devolver 3 filas con los nombres de triggers y sus tablas`;

  const step4_data = `-- =====================================================
-- PASO 4: INSERTAR DATOS DE EJEMPLO (Ejecutar CUARTO)
-- =====================================================

-- Insert sample activity logs (últimos 7 días)
DO $$
DECLARE
  sample_user_id TEXT;
BEGIN
  SELECT id INTO sample_user_id FROM public.profiles LIMIT 1;
  
  IF sample_user_id IS NOT NULL THEN
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
      
    RAISE NOTICE 'Insertados 7 registros de actividad para user_id: %', sample_user_id;
  ELSE
    RAISE NOTICE 'No se encontró ningún usuario en la tabla profiles';
  END IF;
END $$;

-- Insert sample deadlines
DO $$
DECLARE
  sample_user_id TEXT;
  sample_course_id TEXT;
BEGIN
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
    
    RAISE NOTICE 'Insertados 5 deadlines para user_id: %', sample_user_id;
  ELSE
    RAISE NOTICE 'No se encontró ningún usuario en la tabla profiles';
  END IF;
END $$;

-- Verificar datos insertados
SELECT 
  (SELECT COUNT(*) FROM public.activity_logs) as activity_logs_count,
  (SELECT COUNT(*) FROM public.deadlines) as deadlines_count;

-- Debería devolver counts mayores a 0`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-600 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-600 rounded-xl">
            <ListOrdered className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              📋 Setup Paso a Paso
            </h2>
            <p className="text-purple-100">
              Ejecuta cada paso individualmente en orden. Cada paso incluye su propia verificación.
            </p>
          </div>
        </div>
      </div>

      {/* Why Step by Step */}
      <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-xl p-6">
        <h3 className="text-xl font-bold text-yellow-300 mb-3">⚠️ ¿Por qué paso a paso?</h3>
        <p className="text-yellow-100 mb-3">
          El script completo dice "Success" pero no crea los índices/triggers. Al ejecutar paso a paso:
        </p>
        <ul className="space-y-2 text-yellow-100">
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Puedes verificar que cada paso se ejecutó correctamente</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Identificas exactamente dónde falla si hay algún error</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Cada paso incluye una query de verificación inmediata</span>
          </li>
        </ul>
      </div>

      {/* Step 1: Índices */}
      <div className="bg-slate-900 border-2 border-blue-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
              1
            </div>
            <h3 className="text-xl font-bold text-white">Crear Índices</h3>
          </div>
          <button
            onClick={() => handleCopy('step1', step1_indexes)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {copied === 'step1' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Paso 1
              </>
            )}
          </button>
        </div>
        <p className="text-slate-300 mb-3">
          Crea 9 índices para optimizar queries en activity_logs, deadlines y study_sessions
        </p>
        <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto">
          <pre className="text-xs font-mono text-blue-300">
            {step1_indexes}
          </pre>
        </div>
        <div className="mt-3 bg-blue-900/30 rounded-lg p-3">
          <p className="text-sm text-blue-200">
            <strong>✅ Resultado esperado:</strong> indices_creados = 9
          </p>
        </div>
      </div>

      {/* Step 2: Funciones */}
      <div className="bg-slate-900 border-2 border-green-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-bold text-white text-lg">
              2
            </div>
            <h3 className="text-xl font-bold text-white">Crear Funciones</h3>
          </div>
          <button
            onClick={() => handleCopy('step2', step2_functions)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            {copied === 'step2' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Paso 2
              </>
            )}
          </button>
        </div>
        <p className="text-slate-300 mb-3">
          Crea 3 funciones: update_activity_log, update_user_xp, update_deadline_status
        </p>
        <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto">
          <pre className="text-xs font-mono text-green-300">
            {step2_functions}
          </pre>
        </div>
        <div className="mt-3 bg-green-900/30 rounded-lg p-3">
          <p className="text-sm text-green-200">
            <strong>✅ Resultado esperado:</strong> 3 filas con nombres de funciones
          </p>
        </div>
      </div>

      {/* Step 3: Triggers */}
      <div className="bg-slate-900 border-2 border-orange-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white text-lg">
              3
            </div>
            <h3 className="text-xl font-bold text-white">Crear Triggers</h3>
          </div>
          <button
            onClick={() => handleCopy('step3', step3_triggers)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            {copied === 'step3' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Paso 3
              </>
            )}
          </button>
        </div>
        <p className="text-slate-300 mb-3">
          Crea 3 triggers automáticos vinculados a las funciones
        </p>
        <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto">
          <pre className="text-xs font-mono text-orange-300">
            {step3_triggers}
          </pre>
        </div>
        <div className="mt-3 bg-orange-900/30 rounded-lg p-3">
          <p className="text-sm text-orange-200">
            <strong>✅ Resultado esperado:</strong> 3 filas con triggers y sus tablas
          </p>
        </div>
      </div>

      {/* Step 4: Datos */}
      <div className="bg-slate-900 border-2 border-purple-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-lg">
              4
            </div>
            <h3 className="text-xl font-bold text-white">Insertar Datos de Ejemplo</h3>
          </div>
          <button
            onClick={() => handleCopy('step4', step4_data)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            {copied === 'step4' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Paso 4
              </>
            )}
          </button>
        </div>
        <p className="text-slate-300 mb-3">
          Inserta 7 días de actividad y 5 deadlines de ejemplo
        </p>
        <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto">
          <pre className="text-xs font-mono text-purple-300">
            {step4_data}
          </pre>
        </div>
        <div className="mt-3 bg-purple-900/30 rounded-lg p-3">
          <p className="text-sm text-purple-200">
            <strong>✅ Resultado esperado:</strong> activity_logs_count {'>'} 0, deadlines_count {'>'} 0
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-900/30 border-2 border-blue-600 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-300 mb-4">📋 Instrucciones</h3>
        <ol className="space-y-3 text-blue-100">
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">1.</span>
            <span>Click en <strong>"Copiar Paso 1"</strong> y ejecútalo en el SQL Editor</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">2.</span>
            <span>Verifica que la query de verificación devuelva <strong>indices_creados = 9</strong></span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">3.</span>
            <span>Repite para los Pasos 2, 3 y 4 verificando cada resultado</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">4.</span>
            <span>Si algún paso falla, reporta el error exacto que aparece</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
