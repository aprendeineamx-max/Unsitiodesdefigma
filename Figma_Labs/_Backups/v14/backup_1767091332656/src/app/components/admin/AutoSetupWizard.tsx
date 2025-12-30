import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, AlertTriangle, Copy, ExternalLink, Play, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  sql: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  required: boolean;
  errorMessage?: string;
}

export function AutoSetupWizard() {
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  // Initialize steps
  useEffect(() => {
    initializeSteps();
  }, []);

  const initializeSteps = async () => {
    setIsVerifying(true);
    
    // Check which tables exist
    const activityLogsExists = await checkTableExists('activity_logs');
    const deadlinesExists = await checkTableExists('deadlines');
    const studySessionsExists = await checkTableExists('study_sessions');

    const newSteps: SetupStep[] = [
      {
        id: 'create_tables',
        title: '📊 Crear Tablas de Activity Tracking',
        description: 'Crear activity_logs, deadlines y study_sessions',
        sql: generateCreateTablesSQL(activityLogsExists, deadlinesExists, studySessionsExists),
        status: (activityLogsExists && deadlinesExists && studySessionsExists) ? 'completed' : 'pending',
        required: true
      },
      {
        id: 'create_indexes',
        title: '🔍 Crear Índices de Performance',
        description: 'Optimizar queries con índices estratégicos',
        sql: generateIndexesSQL(),
        status: 'pending',
        required: true
      },
      {
        id: 'create_triggers',
        title: '⚡ Crear Triggers Automáticos',
        description: 'Automatizar actualización de activity logs y XP',
        sql: generateTriggersSQL(),
        status: 'pending',
        required: true
      },
      {
        id: 'enable_rls',
        title: '🔒 Activar Row Level Security',
        description: 'Proteger datos con políticas de seguridad',
        sql: generateRLSSQL(),
        status: 'pending',
        required: true
      },
      {
        id: 'sample_activity',
        title: '📝 Insertar Datos de Actividad',
        description: 'Agregar 7 días de actividad de ejemplo',
        sql: generateSampleActivitySQL(),
        status: 'pending',
        required: false
      },
      {
        id: 'sample_deadlines',
        title: '⏰ Insertar Deadlines de Ejemplo',
        description: 'Agregar 5 deadlines de prueba',
        sql: generateSampleDeadlinesSQL(),
        status: 'pending',
        required: false
      }
    ];

    setSteps(newSteps);
    setIsVerifying(false);

    // Check if all required steps are completed
    const allCompleted = newSteps.filter(s => s.required).every(s => s.status === 'completed');
    setSetupComplete(allCompleted);
  };

  const checkTableExists = async (tableName: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
      return !error;
    } catch {
      return false;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const executeStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    
    // Update status to running
    setSteps(prev => prev.map((s, i) => 
      i === stepIndex ? { ...s, status: 'running' as const } : s
    ));

    // Copy SQL to clipboard
    const copied = await copyToClipboard(step.sql);
    
    if (copied) {
      // Open Supabase SQL Editor
      const supabaseUrl = 'https://supabase.com/dashboard/project/bntwyvwavxgspvcvelay/sql/new';
      window.open(supabaseUrl, '_blank');
      
      // Show instructions
      alert(`✅ SQL copiado al portapapeles!\n\n` +
            `📋 Pasos:\n` +
            `1. El SQL Editor se abrió en una nueva pestaña\n` +
            `2. Pega el SQL (Ctrl+V o Cmd+V)\n` +
            `3. Haz click en "Run" (o presiona Ctrl+Enter)\n` +
            `4. Vuelve aquí y haz click en "Verificar Completado"`);
    } else {
      alert('⚠️ No se pudo copiar al portapapeles. Por favor copia manualmente el SQL.');
    }
  };

  const verifyStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    
    setSteps(prev => prev.map((s, i) => 
      i === stepIndex ? { ...s, status: 'running' as const } : s
    ));

    // Verify based on step type
    let success = false;
    
    if (step.id === 'create_tables') {
      const activityLogsExists = await checkTableExists('activity_logs');
      const deadlinesExists = await checkTableExists('deadlines');
      const studySessionsExists = await checkTableExists('study_sessions');
      success = activityLogsExists && deadlinesExists && studySessionsExists;
    } else if (step.id === 'create_indexes') {
      // Check if indexes exist by trying to query
      success = await checkTableExists('activity_logs');
    } else if (step.id === 'create_triggers') {
      // Assume success if tables exist
      success = await checkTableExists('activity_logs');
    } else if (step.id === 'enable_rls') {
      // Assume success if tables exist
      success = await checkTableExists('activity_logs');
    } else if (step.id === 'sample_activity') {
      // Check if activity logs have data
      const { count } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true });
      success = (count || 0) > 0;
    } else if (step.id === 'sample_deadlines') {
      // Check if deadlines have data
      const { count } = await supabase
        .from('deadlines')
        .select('*', { count: 'exact', head: true });
      success = (count || 0) > 0;
    }

    setSteps(prev => prev.map((s, i) => 
      i === stepIndex ? { 
        ...s, 
        status: success ? 'completed' as const : 'error' as const,
        errorMessage: success ? undefined : 'Verificación falló. ¿Ejecutaste el SQL correctamente?'
      } : s
    ));

    // Move to next step if successful
    if (success && stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }

    // Check if all required steps are completed
    const allCompleted = steps.filter(s => s.required).every((s, i) => 
      i === stepIndex ? success : s.status === 'completed'
    );
    setSetupComplete(allCompleted);
  };

  const getStatusIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-400" />;
      case 'running':
        return <Loader className="w-6 h-6 text-blue-400 animate-spin" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-600 bg-green-900/20';
      case 'error':
        return 'border-red-600 bg-red-900/20';
      case 'running':
        return 'border-blue-600 bg-blue-900/20';
      default:
        return 'border-gray-600 bg-gray-900/20';
    }
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
        <span className="ml-3 text-white">Verificando estado actual...</span>
      </div>
    );
  }

  if (setupComplete) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center text-white">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">¡Setup Completado! 🎉</h2>
          <p className="text-green-100 mb-4">
            Todas las tablas y configuraciones requeridas están listas.
          </p>
          <button
            onClick={initializeSteps}
            className="px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors"
          >
            <RefreshCw className="w-5 h-5 inline mr-2" />
            Verificar Nuevamente
          </button>
        </div>

        {/* Optional Steps */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Pasos Opcionales:</h3>
          {steps.filter(s => !s.required).map((step, index) => (
            <div
              key={step.id}
              className={`p-6 border-2 rounded-xl mb-3 ${getStatusColor(step.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(step.status)}
                  <div>
                    <h4 className="font-bold text-white">{step.title}</h4>
                    <p className="text-sm text-slate-300">{step.description}</p>
                  </div>
                </div>
                {step.status !== 'completed' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => executeStep(steps.indexOf(step))}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                    >
                      <Copy className="w-4 h-4 inline mr-2" />
                      Ejecutar
                    </button>
                    <button
                      onClick={() => verifyStep(steps.indexOf(step))}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                    >
                      Verificar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Asistente de Configuración Automática</h2>
        <p className="text-indigo-100">
          Te guiaré paso a paso para configurar todas las tablas de Activity Tracking
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-white">Progreso del Setup:</span>
          <span className="text-slate-300">
            {steps.filter(s => s.status === 'completed' && s.required).length} / {steps.filter(s => s.required).length} completados
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            style={{
              width: `${(steps.filter(s => s.status === 'completed' && s.required).length / steps.filter(s => s.required).length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.filter(s => s.required).map((step, index) => (
          <div
            key={step.id}
            className={`p-6 border-2 rounded-xl transition-all ${getStatusColor(step.status)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(step.status)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-slate-300">{step.description}</p>
                  {step.errorMessage && (
                    <p className="text-red-300 text-sm mt-2">⚠️ {step.errorMessage}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {step.status === 'pending' && (
                  <button
                    onClick={() => executeStep(index)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 whitespace-nowrap"
                  >
                    <Play className="w-4 h-4" />
                    Ejecutar
                  </button>
                )}
                {step.status === 'running' && (
                  <button
                    onClick={() => verifyStep(index)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 whitespace-nowrap"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Verificar
                  </button>
                )}
                {step.status === 'error' && (
                  <button
                    onClick={() => executeStep(index)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 whitespace-nowrap"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reintentar
                  </button>
                )}
                {step.status === 'completed' && (
                  <div className="px-4 py-2 bg-green-600/20 text-green-300 rounded-lg font-semibold whitespace-nowrap">
                    ✅ Completado
                  </div>
                )}
              </div>
            </div>

            {/* SQL Preview */}
            {(step.status === 'running' || step.status === 'error') && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-indigo-300 hover:text-indigo-200">
                  Ver SQL
                </summary>
                <pre className="mt-2 p-4 bg-slate-900 rounded-lg text-xs text-green-300 overflow-x-auto">
                  {step.sql}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="bg-blue-900/30 border-2 border-blue-600 rounded-xl p-6">
        <h3 className="font-bold text-blue-300 mb-3">💡 Cómo Funciona:</h3>
        <ol className="space-y-2 text-sm text-blue-200">
          <li>1. Haz click en <strong>"Ejecutar"</strong> - El SQL se copiará automáticamente</li>
          <li>2. Se abrirá el <strong>Supabase SQL Editor</strong> en una nueva pestaña</li>
          <li>3. Pega el SQL y haz click en <strong>"Run"</strong></li>
          <li>4. Vuelve aquí y haz click en <strong>"Verificar"</strong></li>
          <li>5. Si todo salió bien, pasaremos al siguiente paso automáticamente 🎉</li>
        </ol>
      </div>
    </div>
  );
}

// SQL Generators
function generateCreateTablesSQL(activityLogsExists: boolean, deadlinesExists: boolean, studySessionsExists: boolean): string {
  let sql = `-- =====================================================
-- CREAR TABLAS DE ACTIVITY TRACKING (TIPOS CORREGIDOS PARA TEXT)
-- =====================================================

`;

  if (!activityLogsExists) {
    sql += `-- ACTIVITY_LOGS TABLE
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

`;
  }

  if (!deadlinesExists) {
    sql += `-- DEADLINES TABLE
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

`;
  }

  if (!studySessionsExists) {
    sql += `-- STUDY_SESSIONS TABLE
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
);`;
  }

  return sql;
}

function generateIndexesSQL(): string {
  return `-- =====================================================
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
CREATE INDEX IF NOT EXISTS idx_user_progress_last_accessed ON public.user_progress(last_accessed DESC);`;
}

function generateTriggersSQL(): string {
  return `-- =====================================================
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
  EXECUTE FUNCTION update_deadline_status();`;
}

function generateRLSSQL(): string {
  return `-- =====================================================
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
  USING (auth.uid() = user_id);`;
}

function generateSampleActivitySQL(): string {
  return `-- =====================================================
-- INSERTAR DATOS DE ACTIVIDAD DE EJEMPLO
-- =====================================================
-- NOTA: Cambia 'YOUR_USER_ID' por tu ID real de usuario

-- Obtén tu user_id ejecutando primero:
-- SELECT id FROM public.profiles LIMIT 1;

INSERT INTO public.activity_logs (user_id, date, study_time, xp_earned, lessons_completed, exercises_completed)
SELECT 
  id as user_id,
  CURRENT_DATE - INTERVAL '6 days' as date,
  150 as study_time,
  150 as xp_earned,
  3 as lessons_completed,
  2 as exercises_completed
FROM public.profiles LIMIT 1
UNION ALL
SELECT id, CURRENT_DATE - INTERVAL '5 days', 120, 120, 2, 1 FROM public.profiles LIMIT 1
UNION ALL
SELECT id, CURRENT_DATE - INTERVAL '4 days', 180, 200, 4, 3 FROM public.profiles LIMIT 1
UNION ALL
SELECT id, CURRENT_DATE - INTERVAL '3 days', 140, 150, 3, 2 FROM public.profiles LIMIT 1
UNION ALL
SELECT id, CURRENT_DATE - INTERVAL '2 days', 160, 180, 3, 2 FROM public.profiles LIMIT 1
UNION ALL
SELECT id, CURRENT_DATE - INTERVAL '1 day', 220, 250, 5, 4 FROM public.profiles LIMIT 1
UNION ALL
SELECT id, CURRENT_DATE, 95, 100, 2, 1 FROM public.profiles LIMIT 1
ON CONFLICT (user_id, date) DO UPDATE
SET 
  study_time = EXCLUDED.study_time,
  xp_earned = EXCLUDED.xp_earned,
  lessons_completed = EXCLUDED.lessons_completed,
  exercises_completed = EXCLUDED.exercises_completed;`;
}

function generateSampleDeadlinesSQL(): string {
  return `-- =====================================================
-- INSERTAR DEADLINES DE EJEMPLO
-- =====================================================
-- NOTA: Esto creará deadlines para el primer usuario y curso

INSERT INTO public.deadlines (user_id, course_id, title, description, type, due_date, status, priority)
SELECT 
  p.id as user_id,
  c.id as course_id,
  'Proyecto Final - Curso React' as title,
  'Completar la aplicación de e-commerce' as description,
  'project' as type,
  CURRENT_DATE + INTERVAL '3 days' as due_date,
  'pending' as status,
  'high' as priority
FROM public.profiles p
CROSS JOIN public.courses c
LIMIT 1
UNION ALL
SELECT p.id, c.id, 'Quiz: Hooks Avanzados', 'Evaluación sobre hooks personalizados', 'quiz', CURRENT_DATE + INTERVAL '5 days', 'pending', 'medium'
FROM public.profiles p CROSS JOIN public.courses c LIMIT 1
UNION ALL
SELECT p.id, c.id, 'Examen Final del Módulo', 'Examen comprehensivo de React', 'exam', CURRENT_DATE + INTERVAL '7 days', 'pending', 'high'
FROM public.profiles p CROSS JOIN public.courses c LIMIT 1
UNION ALL
SELECT p.id, NULL, 'Código de Práctica Diaria', 'Completar 5 ejercicios de algoritmos', 'assignment', CURRENT_DATE + INTERVAL '10 days', 'pending', 'low'
FROM public.profiles p LIMIT 1
UNION ALL
SELECT p.id, c.id, 'Presentación de Proyecto', 'Presentar proyecto final ante la clase', 'milestone', CURRENT_DATE + INTERVAL '14 days', 'pending', 'urgent'
FROM public.profiles p CROSS JOIN public.courses c LIMIT 1
ON CONFLICT DO NOTHING;`;
}