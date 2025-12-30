import { useState } from 'react';
import { Copy, CheckCircle, ExternalLink } from 'lucide-react';

export function CompleteSetupScript() {
  const [copied, setCopied] = useState(false);

  const completeSQL = `-- =====================================================
-- COMPLETE ACTIVITY TRACKING SETUP
-- =====================================================
-- Este script completa la configuración del sistema de Activity Tracking
-- Ejecuta esto en el SQL Editor de Supabase
-- =====================================================

-- =====================================================
-- PASO 1: CREAR ÍNDICES
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

-- =====================================================
-- PASO 2: CREAR TRIGGERS
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
    xp = COALESCE(xp, 0) + NEW.xp_earned,
    level = FLOOR((COALESCE(xp, 0) + NEW.xp_earned) / 1000) + 1,
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

-- =====================================================
-- PASO 3: NO CONFIGURAR ROW LEVEL SECURITY
-- =====================================================
-- RLS está DESACTIVADO para permitir acceso total desde la aplicación
-- NO se activará RLS ni se crearán políticas
-- Esto permite control completo sobre todos los datos

-- =====================================================
-- PASO 4: INSERTAR DATOS DE EJEMPLO
-- =====================================================

-- Insert sample activity logs (últimos 7 días)
DO $$
DECLARE
  sample_user_id TEXT;
BEGIN
  -- Get first user ID
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
  END IF;
END $$;

-- Insert sample deadlines
DO $$
DECLARE
  sample_user_id TEXT;
  sample_course_id TEXT;
BEGIN
  -- Get first user ID and course ID
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
  END IF;
END $$;

-- =====================================================
-- ✅ SETUP COMPLETADO
-- =====================================================
-- Ahora regresa a la app y ejecuta el Setup Verifier
-- para confirmar que todo está funcionando correctamente.
-- =====================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(completeSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-2 border-green-600 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🔧 Script de Configuración Completa (SIN RLS)
        </h2>
        <p className="text-green-100">
          Este script completará la configuración de Activity Tracking: índices, triggers y datos de ejemplo. RLS está DESACTIVADO.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-900/30 border-2 border-blue-600 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-300 mb-4">📋 Instrucciones</h3>
        <ol className="space-y-3 text-blue-100">
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">1.</span>
            <span>Click en el botón <strong>"📋 Copiar Script SQL"</strong> abajo</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">2.</span>
            <span>
              Ve al{' '}
              <a 
                href="https://supabase.com/dashboard/project/bntwyvwavxgspvcvelay/sql/new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-blue-300 inline-flex items-center gap-1"
              >
                SQL Editor de Supabase <ExternalLink className="w-4 h-4" />
              </a>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">3.</span>
            <span>Pega el script (Ctrl+V) y click en <strong>"RUN"</strong> o presiona Ctrl+Enter</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">4.</span>
            <span>Espera a que termine (debería decir "Success")</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">5.</span>
            <span>Regresa aquí y ve al <strong>Setup Verifier</strong> para confirmar</span>
          </li>
        </ol>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
      >
        {copied ? (
          <>
            <CheckCircle className="w-6 h-6" />
            ✅ Script Copiado al Portapapeles
          </>
        ) : (
          <>
            <Copy className="w-6 h-6" />
            📋 Copiar Script SQL Completo
          </>
        )}
      </button>

      {/* SQL Preview */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">Vista Previa del Script:</h3>
          <span className="text-sm text-slate-400">
            {completeSQL.split('\n').length} líneas
          </span>
        </div>
        <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
          <pre className="text-xs font-mono text-green-300">
            {completeSQL}
          </pre>
        </div>
      </div>

      {/* What it does */}
      <div className="bg-purple-900/30 border-2 border-purple-600 rounded-xl p-6">
        <h3 className="text-xl font-bold text-purple-300 mb-4">✨ ¿Qué hace este script?</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-950/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-200 mb-2">🔍 Índices</h4>
            <p className="text-sm text-purple-100">
              Crea 9 índices para mejorar la velocidad de queries en activity_logs, deadlines y study_sessions
            </p>
          </div>
          <div className="bg-purple-950/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-200 mb-2">⚡ Triggers</h4>
            <p className="text-sm text-purple-100">
              3 triggers automáticos para actualizar actividad, XP y estado de deadlines
            </p>
          </div>
          <div className="bg-purple-950/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-200 mb-2">🚫 Sin RLS</h4>
            <p className="text-sm text-purple-100">
              RLS desactivado - Acceso total a todos los datos sin restricciones
            </p>
          </div>
          <div className="bg-purple-950/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-200 mb-2">📝 Datos</h4>
            <p className="text-sm text-purple-100">
              7 días de actividad + 5 deadlines de ejemplo para testing inmediato
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {copied && (
        <div className="bg-green-900/30 border-2 border-green-600 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-xl font-bold text-green-300">✅ Script Copiado</h3>
              <p className="text-green-100 mt-1">
                Ahora pégalo en el SQL Editor de Supabase y ejecútalo. 
                Después regresa al Setup Verifier para confirmar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}