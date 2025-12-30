import { useState } from 'react';
import { CheckCircle, XCircle, Loader, Play, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface SetupResult {
  step: string;
  success: boolean;
  message: string;
  details?: string;
}

export function DirectDatabaseSetup() {
  const [results, setResults] = useState<SetupResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  const addResult = (step: string, success: boolean, message: string, details?: string) => {
    setResults(prev => [...prev, { step, success, message, details }]);
  };

  const executeSetup = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Step 1: Create activity_logs table
      setCurrentStep('Creando tabla activity_logs...');
      try {
        const { error: activityLogsError } = await supabase.rpc('exec_ddl', {
          sql: `
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
          `
        });

        if (activityLogsError) throw activityLogsError;
        addResult('activity_logs', true, 'Tabla creada exitosamente');
      } catch (error: any) {
        // If exec_ddl doesn't exist, try direct insert
        addResult('activity_logs', false, 'Error', error.message);
      }

      // Step 2: Create deadlines table
      setCurrentStep('Creando tabla deadlines...');
      try {
        const { error: deadlinesError } = await supabase.rpc('exec_ddl', {
          sql: `
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
          `
        });

        if (deadlinesError) throw deadlinesError;
        addResult('deadlines', true, 'Tabla creada exitosamente');
      } catch (error: any) {
        addResult('deadlines', false, 'Error', error.message);
      }

      // Step 3: Create study_sessions table
      setCurrentStep('Creando tabla study_sessions...');
      try {
        const { error: studySessionsError } = await supabase.rpc('exec_ddl', {
          sql: `
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
          `
        });

        if (studySessionsError) throw studySessionsError;
        addResult('study_sessions', true, 'Tabla creada exitosamente');
      } catch (error: any) {
        addResult('study_sessions', false, 'Error', error.message);
      }

      setCurrentStep('¡Completado!');
    } catch (error: any) {
      addResult('general', false, 'Error general', error.message);
    } finally {
      setIsRunning(false);
      setCurrentStep('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning */}
      <div className="bg-red-900/30 border-2 border-red-600 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-300 text-lg mb-2">⚠️ POR QUÉ NO PUEDO EJECUTAR DDL CON ANON KEY</h3>
            <div className="text-sm text-red-200 space-y-2">
              <p><strong>Razón técnica:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>La <code className="bg-red-950 px-1 rounded">anon key</code> es una clave pública limitada</li>
                <li>Solo tiene permisos de lectura/escritura en tablas (DML: SELECT, INSERT, UPDATE, DELETE)</li>
                <li>NO tiene permisos para modificar esquemas (DDL: CREATE, ALTER, DROP)</li>
                <li>Esto es por diseño de seguridad de Supabase</li>
              </ul>

              <p className="mt-3"><strong>Solución:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>✅ <strong>Opción 1 (RECOMENDADA):</strong> Usar el SQL Editor de Supabase Dashboard (tienes permisos de administrador allí)</li>
                <li>⚠️ <strong>Opción 2:</strong> Crear una función RPC que ejecute DDL (requiere service_role key - NO segura para exponer)</li>
                <li>❌ <strong>Opción 3:</strong> Usar service_role key en frontend (NUNCA hacer esto - es una vulnerabilidad de seguridad)</li>
              </ul>

              <p className="mt-3 font-bold text-red-300">
                🔒 CONCLUSIÓN: El SQL Editor de Supabase es la única forma segura de ejecutar DDL sin exponer credenciales sensibles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation Card */}
      <div className="bg-blue-900/30 border-2 border-blue-600 rounded-xl p-6">
        <h3 className="font-bold text-blue-300 text-lg mb-3">💡 ¿Qué está pasando?</h3>
        <div className="text-sm text-blue-200 space-y-2">
          <p>
            Tu tabla <code className="bg-blue-950 px-1 rounded">profiles</code> usa <code className="bg-blue-950 px-1 rounded">TEXT</code> para el ID, 
            no <code className="bg-blue-950 px-1 rounded">UUID</code>.
          </p>
          <p>
            Por eso el error decía: <em>"Key columns are of incompatible types: uuid and text"</em>
          </p>
          <p className="font-semibold text-blue-300 mt-3">
            ✅ He corregido todos los scripts para usar TEXT en lugar de UUID
          </p>
        </div>
      </div>

      {/* Execute Button */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-3">Setup Automático (Experimental)</h2>
        <p className="text-indigo-100 mb-4">
          Este componente intentará crear las tablas usando RPC. Si falla, deberás usar el SQL Editor manual.
        </p>
        <button
          onClick={executeSetup}
          disabled={isRunning}
          className="flex items-center gap-3 px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              {currentStep}
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Intentar Setup Automático
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-white text-lg">Resultados:</h3>
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 ${
                result.success
                  ? 'bg-green-900/20 border-green-600'
                  : 'bg-red-900/20 border-red-600'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                    {result.step}
                  </p>
                  <p className={`text-sm ${result.success ? 'text-green-200' : 'text-red-200'}`}>
                    {result.message}
                  </p>
                  {result.details && (
                    <pre className="text-xs mt-2 p-2 bg-slate-900 rounded overflow-x-auto">
                      {result.details}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual SQL Scripts */}
      <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-6">
        <h3 className="font-bold text-white text-lg mb-4">📋 Scripts SQL Corregidos (Copiar a Supabase SQL Editor)</h3>
        
        <div className="space-y-4">
          {/* Script 1 */}
          <div>
            <h4 className="font-semibold text-indigo-300 mb-2">1️⃣ Crear Tablas (REQUERIDO)</h4>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-green-300 whitespace-pre-wrap">
{`-- =====================================================
-- CREAR TABLAS DE ACTIVITY TRACKING (TIPOS CORREGIDOS)
-- =====================================================

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
);`}
              </pre>
            </div>
          </div>

          {/* Script 2 */}
          <div>
            <h4 className="font-semibold text-indigo-300 mb-2">2️⃣ Crear Índices (REQUERIDO)</h4>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-green-300 whitespace-pre-wrap">
{`-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON public.activity_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, date);

CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON public.deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON public.deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON public.deadlines(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_status ON public.deadlines(user_id, status);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON public.study_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_course_id ON public.study_sessions(course_id);`}
              </pre>
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={() => {
              const sql = `-- SCRIPT 1: Crear Tablas
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

-- SCRIPT 2: Crear Índices
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON public.activity_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON public.deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON public.deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON public.deadlines(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_status ON public.deadlines(user_id, status);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON public.study_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_course_id ON public.study_sessions(course_id);`;

              navigator.clipboard.writeText(sql);
              alert('✅ SQL copiado al portapapeles!\n\nAhora:\n1. Ve a Supabase SQL Editor\n2. Pega el SQL\n3. Haz click en Run');
            }}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            📋 Copiar TODO el SQL al Portapapeles
          </button>
        </div>
      </div>
    </div>
  );
}
