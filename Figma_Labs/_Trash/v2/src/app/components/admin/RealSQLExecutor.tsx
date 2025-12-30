import { useState } from 'react';
import { Play, Copy, CheckCircle, AlertCircle, Loader, Terminal, FileJson, Table2, Download, Wrench } from 'lucide-react';

// Credenciales de Supabase
const SUPABASE_URL = 'https://bntwyvwavxgspvcvelay.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHd5dndhdnhnc3B2Y3ZlbGF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUyMDI1OSwiZXhwIjoyMDgyMDk2MjU5fQ.h7UOc0Kd0ofFJz6YQYs4hgSvLkxl0-grfJS1VuzSPoo';

interface ExecutionResult {
  success: boolean;
  data?: any[];
  error?: string;
  rowCount?: number;
  executionTime?: number;
}

export function RealSQLExecutor() {
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [viewMode, setViewMode] = useState<'json' | 'table'>('table');
  const [setupDone, setSetupDone] = useState(false);

  const setupScript = `-- =====================================================
-- CREAR FUNCIÓN EXEC_SQL (EJECUTA ESTO PRIMERO EN SUPABASE SQL EDITOR)
-- =====================================================

-- Primero eliminar la función anterior si existe
DROP FUNCTION IF EXISTS public.exec_sql(text);

-- Crear la función con el nombre correcto del parámetro
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_json json;
  rec record;
  result_array json[] := '{}';
BEGIN
  -- Intentar ejecutar como SELECT y devolver resultados
  IF TRIM(UPPER(query)) LIKE 'SELECT%' THEN
    FOR rec IN EXECUTE query LOOP
      result_array := array_append(result_array, row_to_json(rec));
    END LOOP;
    RETURN array_to_json(result_array);
  ELSE
    -- Para DDL/DML solo ejecutar y devolver éxito
    EXECUTE query;
    RETURN json_build_object('success', true, 'message', 'Query ejecutado correctamente');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Dar permisos
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;

-- Verificar que se creó correctamente
SELECT proname, proargnames 
FROM pg_proc 
WHERE proname = 'exec_sql';`;

  const quickScripts = {
    verify: {
      title: '🔍 Verificar Todo',
      sql: `SELECT 
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename IN ('activity_logs', 'deadlines', 'study_sessions') AND schemaname = 'public' AND indexname LIKE 'idx_%') as indices_count,
  (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('update_activity_log', 'update_user_xp', 'update_deadline_status')) as functions_count,
  (SELECT COUNT(*) FROM pg_trigger WHERE tgname IN ('trigger_update_activity_log', 'trigger_update_user_xp', 'trigger_update_deadline_status')) as triggers_count,
  (SELECT COUNT(*) FROM public.activity_logs) as activity_logs,
  (SELECT COUNT(*) FROM public.deadlines) as deadlines,
  (SELECT COUNT(*) FROM public.user_progress) as user_progress;`
    },
    step1: {
      title: '1️⃣ Crear Índices',
      sql: `CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON public.activity_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON public.deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON public.deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON public.deadlines(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_status ON public.deadlines(user_id, status);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON public.study_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_course_id ON public.study_sessions(course_id);`
    },
    step1Verify: {
      title: '1️⃣✓ Verificar Índices',
      sql: `SELECT COUNT(*) as indices_creados 
FROM pg_indexes 
WHERE tablename IN ('activity_logs', 'deadlines', 'study_sessions') 
  AND schemaname = 'public'
  AND indexname LIKE 'idx_%';`
    },
    step2: {
      title: '2️⃣ Crear Funciones',
      sql: `CREATE OR REPLACE FUNCTION update_activity_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, date, study_time, xp_earned, lessons_completed, updated_at)
  VALUES (NEW.user_id, CURRENT_DATE, COALESCE(NEW.time_spent / 60, 0),
    CASE WHEN NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN 50 ELSE 0 END,
    CASE WHEN NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN 1 ELSE 0 END, NOW())
  ON CONFLICT (user_id, date) DO UPDATE SET
    study_time = public.activity_logs.study_time + COALESCE(NEW.time_spent / 60, 0),
    xp_earned = public.activity_logs.xp_earned + CASE WHEN NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN 50 ELSE 0 END,
    lessons_completed = public.activity_logs.lessons_completed + CASE WHEN NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN 1 ELSE 0 END,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET xp = COALESCE(xp, 0) + NEW.xp_earned, level = FLOOR((COALESCE(xp, 0) + NEW.xp_earned) / 1000) + 1, updated_at = NOW() WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_deadline_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.due_date < NOW() AND NEW.status = 'pending' THEN NEW.status = 'overdue'; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`
    },
    step2Verify: {
      title: '2️⃣✓ Verificar Funciones',
      sql: `SELECT proname as function_name FROM pg_proc WHERE proname IN ('update_activity_log', 'update_user_xp', 'update_deadline_status');`
    },
    step3: {
      title: '3️⃣ Crear Triggers',
      sql: `DROP TRIGGER IF EXISTS trigger_update_activity_log ON public.user_progress;
CREATE TRIGGER trigger_update_activity_log AFTER INSERT OR UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION update_activity_log();

DROP TRIGGER IF EXISTS trigger_update_user_xp ON public.activity_logs;
CREATE TRIGGER trigger_update_user_xp AFTER INSERT OR UPDATE ON public.activity_logs FOR EACH ROW WHEN (NEW.xp_earned > 0) EXECUTE FUNCTION update_user_xp();

DROP TRIGGER IF EXISTS trigger_update_deadline_status ON public.deadlines;
CREATE TRIGGER trigger_update_deadline_status BEFORE INSERT OR UPDATE ON public.deadlines FOR EACH ROW EXECUTE FUNCTION update_deadline_status();`
    },
    step3Verify: {
      title: '3️⃣✓ Verificar Triggers',
      sql: `SELECT tgname as trigger_name, tgrelid::regclass as table_name FROM pg_trigger WHERE tgname IN ('trigger_update_activity_log', 'trigger_update_user_xp', 'trigger_update_deadline_status');`
    },
    step4: {
      title: '4️⃣ Insertar Datos',
      sql: `DO $$
DECLARE sample_user_id TEXT; sample_course_id TEXT;
BEGIN
  SELECT id INTO sample_user_id FROM public.profiles LIMIT 1;
  SELECT id INTO sample_course_id FROM public.courses LIMIT 1;
  
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
    ON CONFLICT (user_id, date) DO UPDATE SET study_time = EXCLUDED.study_time, xp_earned = EXCLUDED.xp_earned, lessons_completed = EXCLUDED.lessons_completed, exercises_completed = EXCLUDED.exercises_completed;
    
    INSERT INTO public.deadlines (user_id, course_id, title, description, type, due_date, status, priority)
    VALUES
      (sample_user_id, sample_course_id, 'Proyecto Final - Curso React', 'Completar la aplicación de e-commerce', 'project', CURRENT_DATE + INTERVAL '3 days', 'pending', 'high'),
      (sample_user_id, sample_course_id, 'Quiz: Hooks Avanzados', 'Evaluación sobre hooks personalizados', 'quiz', CURRENT_DATE + INTERVAL '5 days', 'pending', 'medium'),
      (sample_user_id, sample_course_id, 'Examen Final del Módulo', 'Examen comprehensivo de React', 'exam', CURRENT_DATE + INTERVAL '7 days', 'pending', 'high'),
      (sample_user_id, NULL, 'Código de Práctica Diaria', 'Completar 5 ejercicios de algoritmos', 'assignment', CURRENT_DATE + INTERVAL '10 days', 'pending', 'low'),
      (sample_user_id, sample_course_id, 'Presentación de Proyecto', 'Presentar proyecto final ante la clase', 'milestone', CURRENT_DATE + INTERVAL '14 days', 'pending', 'urgent')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;`
    },
    step4Verify: {
      title: '4️⃣✓ Verificar Datos',
      sql: `SELECT 
  (SELECT COUNT(*) FROM public.activity_logs) as activity_logs_count,
  (SELECT COUNT(*) FROM public.deadlines) as deadlines_count;`
    }
  };

  const executeSQL = async () => {
    if (!sql.trim()) return;

    setIsExecuting(true);
    setResult(null);

    const startTime = performance.now();

    try {
      // Llamar a la función exec_sql via RPC
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ query: sql })
      });

      const executionTime = performance.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // El resultado puede ser un array directamente o un objeto con success
      let finalData = data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        if (data.success !== undefined) {
          // Es un mensaje de éxito/error
          finalData = [data];
        }
      }

      setResult({
        success: true,
        data: Array.isArray(finalData) ? finalData : [finalData],
        rowCount: Array.isArray(finalData) ? finalData.length : 1,
        executionTime
      });
    } catch (err: any) {
      const executionTime = performance.now() - startTime;
      setResult({
        success: false,
        error: err.message || 'Error desconocido',
        executionTime
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadJSON = () => {
    if (!result?.data) return;
    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-result-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-2 border-indigo-600 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-600 rounded-xl">
            <Terminal className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              🚀 Real SQL Executor
            </h2>
            <p className="text-indigo-100">
              Ejecutor SQL REAL que devuelve resultados exactos usando Service Role Key
            </p>
          </div>
        </div>
      </div>

      {/* Setup Warning */}
      {!setupDone && (
        <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Wrench className="w-8 h-8 text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-yellow-300 mb-3">⚠️ Configuración Requerida (Una Sola Vez)</h3>
              <p className="text-yellow-100 mb-3">
                Para que este executor funcione, necesitas ejecutar el siguiente script UNA VEZ en el SQL Editor de Supabase:
              </p>
              <div className="bg-yellow-950/50 rounded-lg p-4 mb-3">
                <pre className="text-xs font-mono text-yellow-200 overflow-x-auto whitespace-pre-wrap">
                  {setupScript}
                </pre>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => copyToClipboard(setupScript)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Script
                </button>
                <button
                  onClick={() => setSetupDone(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Ya lo ejecuté
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Scripts */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">🚀 Scripts Rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(quickScripts).map(([key, script]) => (
            <button
              key={key}
              onClick={() => setSql(script.sql)}
              className="p-3 bg-slate-800 border-2 border-slate-700 rounded-lg hover:bg-indigo-900/30 hover:border-indigo-500 transition-all text-left group"
            >
              <p className="font-semibold text-sm text-white group-hover:text-indigo-300">
                {script.title}
              </p>
              <p className="text-xs text-slate-400 mt-1">Click para cargar</p>
            </button>
          ))}
        </div>
      </div>

      {/* SQL Editor */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">📝 Editor SQL</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSql('')}
              className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors text-sm"
            >
              Limpiar
            </button>
            <button
              onClick={() => copyToClipboard(sql)}
              className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors text-sm flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar
            </button>
          </div>
        </div>
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-700 text-green-300 rounded-lg focus:border-indigo-500 focus:outline-none font-mono text-sm resize-none"
          rows={14}
          placeholder="-- Escribe tu SQL aquí o usa los scripts rápidos arriba
SELECT * FROM courses LIMIT 10;"
        />
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-400">
            {sql.split('\n').length} líneas • {sql.length} caracteres
          </p>
          <button
            onClick={executeSQL}
            disabled={isExecuting || !sql.trim()}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Ejecutar SQL
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className={`rounded-xl p-6 border-2 ${
          result.success 
            ? 'bg-green-900/30 border-green-600' 
            : 'bg-red-900/30 border-red-600'
        }`}>
          {/* Result Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {result.success ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-400" />
              )}
              <div>
                <h3 className="text-xl font-bold text-white">
                  {result.success ? '✅ Ejecución Exitosa' : '❌ Error en Ejecución'}
                </h3>
                <p className="text-sm text-slate-300">
                  Tiempo: {result.executionTime?.toFixed(2)}ms
                  {result.rowCount !== undefined && ` • ${result.rowCount} filas`}
                </p>
              </div>
            </div>
            {result.success && result.data && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('json')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                    viewMode === 'json' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  <FileJson className="w-4 h-4" />
                  JSON
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                    viewMode === 'table' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  <Table2 className="w-4 h-4" />
                  Tabla
                </button>
                <button
                  onClick={downloadJSON}
                  className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              </div>
            )}
          </div>

          {/* Error Display */}
          {!result.success && result.error && (
            <div className="bg-red-950/50 rounded-lg p-4">
              <p className="font-mono text-sm text-red-200">{result.error}</p>
            </div>
          )}

          {/* Data Display */}
          {result.success && result.data && (
            <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
              {viewMode === 'json' ? (
                <pre className="text-xs font-mono text-green-300">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              ) : (
                <div className="overflow-x-auto">
                  {result.data.length > 0 ? (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          {Object.keys(result.data[0]).map((key) => (
                            <th key={key} className="px-4 py-2 font-semibold text-indigo-300">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-800 hover:bg-slate-900">
                            {Object.values(row).map((value: any, cellIdx) => (
                              <td key={cellIdx} className="px-4 py-2 text-green-300 font-mono text-xs">
                                {value === null ? (
                                  <span className="text-slate-500 italic">null</span>
                                ) : typeof value === 'object' ? (
                                  JSON.stringify(value)
                                ) : (
                                  String(value)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-slate-400 text-center py-4">
                      Query ejecutado correctamente pero no devolvió datos
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-900/30 border-2 border-blue-600 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-300 mb-3">📋 Instrucciones de Uso</h3>
        <ol className="space-y-2 text-blue-100 text-sm">
          <li className="flex items-start gap-2">
            <span className="font-bold text-blue-400">1.</span>
            <span>Si es tu primera vez, copia y ejecuta el script de setup en Supabase SQL Editor</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-blue-400">2.</span>
            <span>Click en "Ya lo ejecuté" para ocultar el warning</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-blue-400">3.</span>
            <span>Usa los scripts rápidos o escribe tu propio SQL</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-blue-400">4.</span>
            <span>Click en "Ejecutar SQL" y ver resultados REALES idénticos a Supabase</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-blue-400">5.</span>
            <span>Alterna entre vista JSON y Tabla, o descarga los resultados</span>
          </li>
        </ol>
      </div>
    </div>
  );
}