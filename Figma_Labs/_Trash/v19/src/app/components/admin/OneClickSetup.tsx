import { useState } from 'react';
import { CheckCircle, CircleX, Loader, Zap, AlertTriangle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface SetupStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: string;
}

const SUPABASE_URL = 'https://bntwyvwavxgspvcvelay.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHd5dndhdnhnc3B2Y3ZlbGF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUyMDI1OSwiZXhwIjoyMDgyMDk2MjU5fQ.h7UOc0Kd0ofFJz6YQYs4hgSvLkxl0-grfJS1VuzSPoo';

export function OneClickSetup() {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<SetupStep[]>([
    { id: 'detect', name: '🔍 Detectar tipo de datos de profiles.id', status: 'pending' },
    { id: 'activity_logs', name: '📊 Crear tabla activity_logs', status: 'pending' },
    { id: 'deadlines', name: '⏰ Crear tabla deadlines', status: 'pending' },
    { id: 'study_sessions', name: '📚 Crear tabla study_sessions', status: 'pending' },
    { id: 'indexes', name: '🔍 Crear índices de performance', status: 'pending' },
    { id: 'triggers', name: '⚡ Crear triggers automáticos', status: 'pending' },
    { id: 'policies', name: '🔒 Configurar Row Level Security', status: 'pending' },
    { id: 'sample_activity', name: '📝 Insertar datos de actividad de ejemplo', status: 'pending' },
    { id: 'sample_deadlines', name: '⏰ Insertar deadlines de ejemplo', status: 'pending' },
  ]);

  const updateStep = (id: string, updates: Partial<SetupStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const executeSQL = async (sql: string): Promise<any> => {
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Try to use exec_sql function if it exists
    try {
      const { data, error } = await supabaseAdmin.rpc('exec_sql', { query: sql });
      if (error) throw error;
      return data;
    } catch (err: any) {
      // If exec_sql doesn't exist, we need to create it first or use alternative method
      if (err.code === 'PGRST202') {
        throw new Error('La función exec_sql no existe. Por favor, créala primero usando el SQL Executor con el script de "Create exec_sql Function".');
      }
      throw err;
    }
  };

  const createExecSqlFunction = async (): Promise<boolean> => {
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(query text)
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        result json;
      BEGIN
        EXECUTE query INTO result;
        RETURN result;
      EXCEPTION
        WHEN OTHERS THEN
          RETURN json_build_object('error', SQLERRM);
      END;
      $$;
    `;

    try {
      // Try to create the function using direct query
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ query: createFunctionSQL })
      });

      if (!response.ok) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const runSetup = async () => {
    setIsRunning(true);
    let userIdType = 'UUID'; // default

    try {
      // STEP 1: Detectar tipo de datos
      updateStep('detect', { status: 'running' });
      try {
        const detectSQL = `
          SELECT data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'id';
        `;
        const result = await executeSQL(detectSQL);
        userIdType = result?.[0]?.data_type === 'text' ? 'TEXT' : 'UUID';
        
        updateStep('detect', { 
          status: 'success', 
          message: `Tipo detectado: ${userIdType}`,
          details: `La columna profiles.id es de tipo ${userIdType}`
        });
      } catch (err: any) {
        updateStep('detect', { 
          status: 'error', 
          message: 'Error al detectar tipo de datos',
          details: err.message 
        });
        throw err;
      }

      // STEP 2: Crear activity_logs
      updateStep('activity_logs', { status: 'running' });
      try {
        const activityLogsSQL = `
          CREATE TABLE IF NOT EXISTS public.activity_logs (
            id ${userIdType} DEFAULT ${userIdType === 'UUID' ? 'uuid_generate_v4()' : "gen_random_uuid()::TEXT"} PRIMARY KEY,
            user_id ${userIdType} REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            
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
        await executeSQL(activityLogsSQL);
        updateStep('activity_logs', { 
          status: 'success', 
          message: 'Tabla creada exitosamente' 
        });
      } catch (err: any) {
        updateStep('activity_logs', { 
          status: 'error', 
          message: 'Error al crear tabla',
          details: err.message 
        });
        throw err;
      }

      // STEP 3: Crear deadlines
      updateStep('deadlines', { status: 'running' });
      try {
        const deadlinesSQL = `
          CREATE TABLE IF NOT EXISTS public.deadlines (
            id ${userIdType} DEFAULT ${userIdType === 'UUID' ? 'uuid_generate_v4()' : "gen_random_uuid()::TEXT"} PRIMARY KEY,
            user_id ${userIdType} REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            course_id ${userIdType} REFERENCES public.courses(id) ON DELETE CASCADE,
            
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
        await executeSQL(deadlinesSQL);
        updateStep('deadlines', { 
          status: 'success', 
          message: 'Tabla creada exitosamente' 
        });
      } catch (err: any) {
        updateStep('deadlines', { 
          status: 'error', 
          message: 'Error al crear tabla',
          details: err.message 
        });
        throw err;
      }

      // STEP 4: Crear study_sessions
      updateStep('study_sessions', { status: 'running' });
      try {
        const studySessionsSQL = `
          CREATE TABLE IF NOT EXISTS public.study_sessions (
            id ${userIdType} DEFAULT ${userIdType === 'UUID' ? 'uuid_generate_v4()' : "gen_random_uuid()::TEXT"} PRIMARY KEY,
            user_id ${userIdType} REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            course_id ${userIdType} REFERENCES public.courses(id) ON DELETE CASCADE,
            lesson_id ${userIdType} REFERENCES public.lessons(id) ON DELETE CASCADE,
            
            started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
            ended_at TIMESTAMP WITH TIME ZONE,
            duration INTEGER,
            focus_score INTEGER CHECK (focus_score >= 0 AND focus_score <= 100),
            notes TEXT,
            
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
          );
        `;
        await executeSQL(studySessionsSQL);
        updateStep('study_sessions', { 
          status: 'success', 
          message: 'Tabla creada exitosamente' 
        });
      } catch (err: any) {
        updateStep('study_sessions', { 
          status: 'error', 
          message: 'Error al crear tabla',
          details: err.message 
        });
        throw err;
      }

      // STEP 5: Crear índices
      updateStep('indexes', { status: 'running' });
      try {
        const indexesSQL = `
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
        `;
        await executeSQL(indexesSQL);
        updateStep('indexes', { 
          status: 'success', 
          message: 'Índices creados exitosamente' 
        });
      } catch (err: any) {
        updateStep('indexes', { 
          status: 'error', 
          message: 'Error al crear índices',
          details: err.message 
        });
        // No throw - continue even if indexes fail
      }

      // STEP 6: Crear triggers
      updateStep('triggers', { status: 'running' });
      try {
        const triggersSQL = `
          -- Function to update activity log when progress is made
          CREATE OR REPLACE FUNCTION update_activity_log()
          RETURNS TRIGGER AS $func$
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
          $func$ LANGUAGE plpgsql;

          DROP TRIGGER IF EXISTS trigger_update_activity_log ON public.user_progress;
          CREATE TRIGGER trigger_update_activity_log
            AFTER INSERT OR UPDATE ON public.user_progress
            FOR EACH ROW
            EXECUTE FUNCTION update_activity_log();

          -- Function to update user XP
          CREATE OR REPLACE FUNCTION update_user_xp()
          RETURNS TRIGGER AS $func$
          BEGIN
            UPDATE public.profiles
            SET 
              xp = COALESCE(xp, 0) + NEW.xp_earned,
              level = FLOOR((COALESCE(xp, 0) + NEW.xp_earned) / 1000) + 1,
              updated_at = NOW()
            WHERE id = NEW.user_id;
            
            RETURN NEW;
          END;
          $func$ LANGUAGE plpgsql;

          DROP TRIGGER IF EXISTS trigger_update_user_xp ON public.activity_logs;
          CREATE TRIGGER trigger_update_user_xp
            AFTER INSERT OR UPDATE ON public.activity_logs
            FOR EACH ROW
            WHEN (NEW.xp_earned > 0)
            EXECUTE FUNCTION update_user_xp();

          -- Function to auto-update deadline status
          CREATE OR REPLACE FUNCTION update_deadline_status()
          RETURNS TRIGGER AS $func$
          BEGIN
            IF NEW.due_date < NOW() AND NEW.status = 'pending' THEN
              NEW.status = 'overdue';
            END IF;
            RETURN NEW;
          END;
          $func$ LANGUAGE plpgsql;

          DROP TRIGGER IF EXISTS trigger_update_deadline_status ON public.deadlines;
          CREATE TRIGGER trigger_update_deadline_status
            BEFORE INSERT OR UPDATE ON public.deadlines
            FOR EACH ROW
            EXECUTE FUNCTION update_deadline_status();
        `;
        await executeSQL(triggersSQL);
        updateStep('triggers', { 
          status: 'success', 
          message: 'Triggers creados exitosamente' 
        });
      } catch (err: any) {
        updateStep('triggers', { 
          status: 'error', 
          message: 'Error al crear triggers',
          details: err.message 
        });
        // No throw - continue
      }

      // STEP 7: Configurar RLS
      updateStep('policies', { status: 'running' });
      try {
        const rlsSQL = `
          -- Enable RLS
          ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

          -- Policies for activity_logs
          DROP POLICY IF EXISTS "Users can view their own activity" ON public.activity_logs;
          CREATE POLICY "Users can view their own activity" 
            ON public.activity_logs FOR SELECT 
            USING (auth.uid()::TEXT = user_id);

          DROP POLICY IF EXISTS "Users can insert their own activity" ON public.activity_logs;
          CREATE POLICY "Users can insert their own activity" 
            ON public.activity_logs FOR INSERT 
            WITH CHECK (auth.uid()::TEXT = user_id);

          DROP POLICY IF EXISTS "Users can update their own activity" ON public.activity_logs;
          CREATE POLICY "Users can update their own activity" 
            ON public.activity_logs FOR UPDATE 
            USING (auth.uid()::TEXT = user_id);

          -- Policies for deadlines
          DROP POLICY IF EXISTS "Users can view their own deadlines" ON public.deadlines;
          CREATE POLICY "Users can view their own deadlines" 
            ON public.deadlines FOR SELECT 
            USING (auth.uid()::TEXT = user_id);

          DROP POLICY IF EXISTS "Users can insert their own deadlines" ON public.deadlines;
          CREATE POLICY "Users can insert their own deadlines" 
            ON public.deadlines FOR INSERT 
            WITH CHECK (auth.uid()::TEXT = user_id);

          DROP POLICY IF EXISTS "Users can update their own deadlines" ON public.deadlines;
          CREATE POLICY "Users can update their own deadlines" 
            ON public.deadlines FOR UPDATE 
            USING (auth.uid()::TEXT = user_id);

          DROP POLICY IF EXISTS "Users can delete their own deadlines" ON public.deadlines;
          CREATE POLICY "Users can delete their own deadlines" 
            ON public.deadlines FOR DELETE 
            USING (auth.uid()::TEXT = user_id);

          -- Policies for study_sessions
          DROP POLICY IF EXISTS "Users can view their own study sessions" ON public.study_sessions;
          CREATE POLICY "Users can view their own study sessions" 
            ON public.study_sessions FOR SELECT 
            USING (auth.uid()::TEXT = user_id);

          DROP POLICY IF EXISTS "Users can insert their own study sessions" ON public.study_sessions;
          CREATE POLICY "Users can insert their own study sessions" 
            ON public.study_sessions FOR INSERT 
            WITH CHECK (auth.uid()::TEXT = user_id);

          DROP POLICY IF EXISTS "Users can update their own study sessions" ON public.study_sessions;
          CREATE POLICY "Users can update their own study sessions" 
            ON public.study_sessions FOR UPDATE 
            USING (auth.uid()::TEXT = user_id);
        `;
        await executeSQL(rlsSQL);
        updateStep('policies', { 
          status: 'success', 
          message: 'Políticas RLS configuradas exitosamente' 
        });
      } catch (err: any) {
        updateStep('policies', { 
          status: 'error', 
          message: 'Error al configurar RLS',
          details: err.message 
        });
        // No throw - continue
      }

      // STEP 8: Insertar datos de actividad de ejemplo
      updateStep('sample_activity', { status: 'running' });
      try {
        const sampleActivitySQL = `
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
            exercises_completed = EXCLUDED.exercises_completed;
        `;
        await executeSQL(sampleActivitySQL);
        updateStep('sample_activity', { 
          status: 'success', 
          message: 'Datos de ejemplo insertados (últimos 7 días)' 
        });
      } catch (err: any) {
        updateStep('sample_activity', { 
          status: 'error', 
          message: 'Error al insertar datos de ejemplo',
          details: err.message 
        });
        // No throw - continue
      }

      // STEP 9: Insertar deadlines de ejemplo
      updateStep('sample_deadlines', { status: 'running' });
      try {
        const sampleDeadlinesSQL = `
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
          ON CONFLICT DO NOTHING;
        `;
        await executeSQL(sampleDeadlinesSQL);
        updateStep('sample_deadlines', { 
          status: 'success', 
          message: 'Deadlines de ejemplo insertados' 
        });
      } catch (err: any) {
        updateStep('sample_deadlines', { 
          status: 'error', 
          message: 'Error al insertar deadlines',
          details: err.message 
        });
        // No throw - continue
      }

    } catch (error: any) {
      console.error('Setup failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const successCount = steps.filter(s => s.status === 'success').length;
  const errorCount = steps.filter(s => s.status === 'error').length;
  const totalSteps = steps.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-2 border-green-600 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-600 rounded-xl">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              🚀 Setup Automático de Activity Tracking
            </h2>
            <p className="text-green-100 mb-4">
              Este asistente configurará automáticamente todas las tablas necesarias para el sistema de Activity Tracking, 
              detectando el tipo de datos correcto y ajustando el schema dinámicamente.
            </p>
            <div className="bg-green-950/50 rounded-lg p-4 border border-green-700">
              <p className="text-sm text-green-200 font-semibold mb-2">✨ Lo que hace este setup:</p>
              <ul className="text-sm text-green-100 space-y-1 list-disc list-inside">
                <li>Detecta automáticamente si profiles.id es TEXT o UUID</li>
                <li>Crea las 3 tablas principales (activity_logs, deadlines, study_sessions)</li>
                <li>Configura índices para mejorar performance</li>
                <li>Crea triggers automáticos para XP y actividad</li>
                <li>Activa Row Level Security (RLS)</li>
                <li>Inserta datos de ejemplo para testing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      {isRunning && (
        <div className="bg-slate-800 border-2 border-indigo-600 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Progreso</h3>
            <div className="text-lg font-bold text-indigo-300">
              {successCount} / {totalSteps} completados
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(successCount / totalSteps) * 100}%` }}
            />
          </div>
          {errorCount > 0 && (
            <p className="text-sm text-red-300 mt-2">⚠️ {errorCount} errores encontrados</p>
          )}
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-4 rounded-xl border-2 transition-all ${
              step.status === 'success'
                ? 'bg-green-900/30 border-green-600'
                : step.status === 'error'
                ? 'bg-red-900/30 border-red-600'
                : step.status === 'running'
                ? 'bg-indigo-900/30 border-indigo-600 animate-pulse'
                : 'bg-slate-800 border-slate-600'
            }`}
          >
            <div className="flex items-start gap-3">
              {step.status === 'success' && (
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              )}
              {step.status === 'error' && (
                <CircleX className="w-6 h-6 text-red-400 flex-shrink-0" />
              )}
              {step.status === 'running' && (
                <Loader className="w-6 h-6 text-indigo-400 flex-shrink-0 animate-spin" />
              )}
              {step.status === 'pending' && (
                <div className="w-6 h-6 rounded-full bg-slate-600 flex-shrink-0" />
              )}
              
              <div className="flex-1">
                <p className={`font-semibold ${
                  step.status === 'success' ? 'text-green-300' :
                  step.status === 'error' ? 'text-red-300' :
                  step.status === 'running' ? 'text-indigo-300' :
                  'text-slate-300'
                }`}>
                  {step.name}
                </p>
                
                {step.message && (
                  <p className="text-sm text-slate-300 mt-1">{step.message}</p>
                )}
                
                {step.details && (
                  <pre className="text-xs text-slate-400 mt-2 p-2 bg-slate-900 rounded overflow-x-auto">
                    {step.details}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={runSetup}
          disabled={isRunning}
          className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
        >
          {isRunning ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              Ejecutando setup...
            </>
          ) : (
            <>
              <Zap className="w-6 h-6" />
              🚀 Ejecutar Setup Completo
            </>
          )}
        </button>
      </div>

      {/* Warning */}
      {!isRunning && successCount === 0 && (
        <>
          <div className="bg-red-900/30 border-2 border-red-600 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xl font-bold text-red-300 mb-3">⚠️ PASO CRÍTICO ANTES DE CONTINUAR</p>
                <p className="text-sm text-red-200 mb-4">
                  Antes de ejecutar el setup automático, <strong>DEBES crear la función exec_sql</strong> en tu base de datos Supabase.
                </p>
                
                <div className="bg-red-950/50 rounded-lg p-4 border border-red-700 mb-4">
                  <p className="font-semibold text-red-200 mb-2">📋 Pasos a seguir:</p>
                  <ol className="text-sm text-red-100 space-y-2 list-decimal list-inside">
                    <li>Ve al <a href="https://supabase.com/dashboard/project/bntwyvwavxgspvcvelay/sql/new" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-red-300">SQL Editor de Supabase</a></li>
                    <li>Copia el SQL de abajo y pégalo en el editor</li>
                    <li>Click en "RUN" o presiona Ctrl+Enter</li>
                    <li>Verifica que veas "Success. No rows returned"</li>
                    <li>Regresa aquí y ejecuta el setup</li>
                  </ol>
                </div>

                <div className="bg-slate-900 rounded-lg p-4 border border-red-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-red-200">SQL a ejecutar en Supabase:</p>
                    <button
                      onClick={() => {
                        const sql = `CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE query;
  RETURN json_build_object('success', true, 'message', 'Query executed successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;`;
                        navigator.clipboard.writeText(sql);
                        alert('✅ SQL copiado al portapapeles!');
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                    >
                      📋 Copiar SQL
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-green-300 overflow-x-auto">
{`CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE query;
  RETURN json_build_object('success', true, 'message', 'Query executed successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-300">💡 Después de crear la función</p>
                <p className="text-sm text-yellow-200 mt-1">
                  Una vez que hayas ejecutado el SQL en Supabase, regresa aquí y click en el botón verde 
                  "🚀 Ejecutar Setup Completo". El sistema detectará automáticamente el tipo de datos correcto 
                  y creará todas las tablas sin errores.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success Summary */}
      {!isRunning && successCount === totalSteps && (
        <div className="bg-green-900/30 border-2 border-green-600 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-12 h-12 text-green-400" />
            <div>
              <h3 className="text-2xl font-bold text-green-300">🎉 ¡Setup Completado!</h3>
              <p className="text-green-100 mt-2">
                Todas las tablas y configuraciones han sido creadas exitosamente. 
                Tu sistema de Activity Tracking está listo para usar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}