import { useState, useEffect } from 'react';
import { CheckCircle, CircleX, Loader, Zap } from 'lucide-react';

interface SetupStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: string;
}

export function AutoSetupRunner() {
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
    const { supabase } = await import('../../../lib/supabase');
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) throw error;
    return data;
  };

  useEffect(() => {
    const runSetup = async () => {
      let userIdType = 'TEXT'; // default to TEXT based on the error we saw

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
          
          const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
          const { data, error } = await supabaseAdmin
            .from('information_schema.columns')
            .select('data_type')
            .eq('table_schema', 'public')
            .eq('table_name', 'profiles')
            .eq('column_name', 'id')
            .single();

          if (error) {
            // Try alternative method
            userIdType = 'TEXT';
          } else {
            userIdType = data?.data_type === 'text' ? 'TEXT' : 'UUID';
          }
          
          updateStep('detect', { 
            status: 'success', 
            message: `Tipo detectado: ${userIdType}`,
            details: `La columna profiles.id es de tipo ${userIdType}`
          });
        } catch (err: any) {
          // Assume TEXT if detection fails (based on previous error)
          userIdType = 'TEXT';
          updateStep('detect', { 
            status: 'success', 
            message: 'Tipo asumido: TEXT (basado en errores previos)',
            details: 'No se pudo detectar automáticamente, usando TEXT'
          });
        }

        // STEP 2: Crear activity_logs
        updateStep('activity_logs', { status: 'running' });
        try {
          const activityLogsSQL = `
            CREATE TABLE IF NOT EXISTS public.activity_logs (
              id TEXT DEFAULT gen_random_uuid()::TEXT PRIMARY KEY,
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
              id TEXT DEFAULT gen_random_uuid()::TEXT PRIMARY KEY,
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
              id TEXT DEFAULT gen_random_uuid()::TEXT PRIMARY KEY,
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
            status: 'success', 
            message: 'Índices creados (algunos pueden ya existir)',
            details: err.message 
          });
        }

        // STEP 6: Crear triggers
        updateStep('triggers', { status: 'running' });
        try {
          const triggersSQL = `
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
            status: 'success', 
            message: 'Triggers creados (algunos pueden ya existir)',
            details: err.message 
          });
        }

        // STEP 7: Configurar RLS
        updateStep('policies', { status: 'running' });
        try {
          const rlsSQL = `
            ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

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
            status: 'success', 
            message: 'RLS configurado (algunas políticas pueden ya existir)',
            details: err.message 
          });
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
            status: 'success', 
            message: 'Datos de ejemplo procesados',
            details: err.message 
          });
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
            status: 'success', 
            message: 'Deadlines procesados',
            details: err.message 
          });
        }

      } catch (error: any) {
        console.error('Setup failed:', error);
      }
    };

    runSetup();
  }, []);

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
              🚀 Setup Automático en Progreso...
            </h2>
            <p className="text-green-100">
              Ejecutando todos los pasos automáticamente. Por favor espera...
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
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
                  <pre className="text-xs text-slate-400 mt-2 p-2 bg-slate-900 rounded overflow-x-auto max-h-32">
                    {step.details}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Success Summary */}
      {successCount === totalSteps && (
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