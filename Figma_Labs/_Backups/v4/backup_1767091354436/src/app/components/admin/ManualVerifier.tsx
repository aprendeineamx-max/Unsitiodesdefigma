import { useState } from 'react';
import { Copy, CheckCircle, FileSearch } from 'lucide-react';

export function ManualVerifier() {
  const [copied, setCopied] = useState(false);

  const verificationSQL = `-- =====================================================
-- 🔍 SCRIPT DE VERIFICACIÓN MANUAL
-- =====================================================
-- Ejecuta este script en el SQL Editor para verificar
-- que todos los índices y triggers están creados
-- =====================================================

-- 1️⃣ VERIFICAR ÍNDICES
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('activity_logs', 'deadlines', 'study_sessions')
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- Deberías ver 9 índices:
-- idx_activity_logs_user_id
-- idx_activity_logs_date
-- idx_activity_logs_user_date
-- idx_deadlines_user_id
-- idx_deadlines_due_date
-- idx_deadlines_status
-- idx_deadlines_user_status
-- idx_study_sessions_user_id
-- idx_study_sessions_started_at
-- idx_study_sessions_course_id

-- =====================================================

-- 2️⃣ VERIFICAR TRIGGERS
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
WHERE tgname IN (
  'trigger_update_activity_log',
  'trigger_update_user_xp',
  'trigger_update_deadline_status'
)
ORDER BY tgname;

-- Deberías ver 3 triggers:
-- trigger_update_activity_log -> user_progress -> update_activity_log()
-- trigger_update_user_xp -> activity_logs -> update_user_xp()
-- trigger_update_deadline_status -> deadlines -> update_deadline_status()

-- =====================================================

-- 3️⃣ VERIFICAR FUNCIONES
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname IN (
  'update_activity_log',
  'update_user_xp',
  'update_deadline_status'
)
ORDER BY proname;

-- Deberías ver 3 funciones con sus definiciones completas

-- =====================================================

-- 4️⃣ VERIFICAR RLS (debería estar DESACTIVADO)
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('activity_logs', 'deadlines', 'study_sessions')
  AND schemaname = 'public';

-- Todas las tablas deberían tener rls_enabled = false

-- =====================================================

-- 5️⃣ VERIFICAR POLÍTICAS RLS (debería estar VACÍO)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('activity_logs', 'deadlines', 'study_sessions')
  AND schemaname = 'public';

-- Esta query debería devolver 0 filas (no policies)

-- =====================================================
-- ✅ INTERPRETACIÓN DE RESULTADOS
-- =====================================================

/*
✅ TODO ESTÁ BIEN SI:
- Query 1: Devuelve 9 filas (índices)
- Query 2: Devuelve 3 filas (triggers)
- Query 3: Devuelve 3 filas (funciones)
- Query 4: Todas las filas tienen rls_enabled = false
- Query 5: Devuelve 0 filas (sin políticas)

⚠️ HAY PROBLEMAS SI:
- Query 1: Devuelve menos de 9 filas -> Faltan índices
- Query 2: Devuelve menos de 3 filas -> Faltan triggers
- Query 3: Devuelve menos de 3 filas -> Faltan funciones
- Query 4: Alguna tabla tiene rls_enabled = true -> RLS activado
- Query 5: Devuelve filas -> Hay políticas RLS activas

🔧 SOLUCIÓN:
Si algo falla, ve al Complete Setup Script y ejecútalo nuevamente.
*/`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-2 border-cyan-600 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cyan-600 rounded-xl">
            <FileSearch className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              🔍 Verificación Manual del Setup
            </h2>
            <p className="text-cyan-100">
              Script SQL completo para verificar índices, triggers y funciones directamente en Supabase
            </p>
          </div>
        </div>
      </div>

      {/* Why Manual Verification */}
      <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-xl p-6">
        <h3 className="text-xl font-bold text-yellow-300 mb-3">⚠️ ¿Por qué verificación manual?</h3>
        <p className="text-yellow-100 mb-3">
          El Setup Verifier automático no puede acceder a las tablas del sistema de PostgreSQL 
          (pg_indexes, pg_trigger, etc.) desde el cliente de Supabase por razones de seguridad.
        </p>
        <p className="text-yellow-100">
          Para verificar que los índices y triggers realmente se crearon, necesitas ejecutar 
          este script directamente en el SQL Editor de Supabase.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-900/30 border-2 border-blue-600 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-300 mb-4">📋 Instrucciones</h3>
        <ol className="space-y-3 text-blue-100">
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">1.</span>
            <span>Click en <strong>"📋 Copiar Script de Verificación"</strong> abajo</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">2.</span>
            <span>
              Ve al{' '}
              <a 
                href="https://supabase.com/dashboard/project/bntwyvwavxgspvcvelay/sql/new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-blue-300"
              >
                SQL Editor de Supabase
              </a>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">3.</span>
            <span>Pega el script (Ctrl+V) y ejecútalo con <strong>RUN</strong></span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">4.</span>
            <span>Revisa los resultados de cada query (hay 5 queries en total)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">5.</span>
            <span>Lee la interpretación al final del script para saber si todo está bien</span>
          </li>
        </ol>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-cyan-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
      >
        {copied ? (
          <>
            <CheckCircle className="w-6 h-6" />
            ✅ Script Copiado
          </>
        ) : (
          <>
            <Copy className="w-6 h-6" />
            📋 Copiar Script de Verificación
          </>
        )}
      </button>

      {/* Success Message */}
      {copied && (
        <div className="bg-green-900/30 border-2 border-green-600 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-xl font-bold text-green-300">✅ Script Copiado</h3>
              <p className="text-green-100 mt-1">
                Ahora pégalo en el SQL Editor de Supabase y revisa los resultados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* What to Expect */}
      <div className="bg-purple-900/30 border-2 border-purple-600 rounded-xl p-6">
        <h3 className="text-xl font-bold text-purple-300 mb-4">📊 Resultados Esperados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-950/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-200 mb-2">Query 1: Índices</h4>
            <p className="text-sm text-purple-100">
              ✅ <strong>9 filas</strong> con los nombres de índices
            </p>
          </div>
          <div className="bg-purple-950/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-200 mb-2">Query 2: Triggers</h4>
            <p className="text-sm text-purple-100">
              ✅ <strong>3 filas</strong> con nombres de triggers
            </p>
          </div>
          <div className="bg-purple-950/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-200 mb-2">Query 3: Funciones</h4>
            <p className="text-sm text-purple-100">
              ✅ <strong>3 filas</strong> con definiciones completas
            </p>
          </div>
          <div className="bg-purple-950/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-200 mb-2">Query 4: RLS Status</h4>
            <p className="text-sm text-purple-100">
              ✅ Todas con <strong>rls_enabled = false</strong>
            </p>
          </div>
          <div className="bg-purple-950/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-200 mb-2">Query 5: Políticas</h4>
            <p className="text-sm text-purple-100">
              ✅ <strong>0 filas</strong> (sin políticas)
            </p>
          </div>
        </div>
      </div>

      {/* SQL Preview */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">Vista Previa del Script:</h3>
          <span className="text-sm text-slate-400">
            {verificationSQL.split('\n').length} líneas
          </span>
        </div>
        <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
          <pre className="text-xs font-mono text-cyan-300">
            {verificationSQL}
          </pre>
        </div>
      </div>
    </div>
  );
}
