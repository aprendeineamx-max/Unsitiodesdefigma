import { useState } from 'react';
import { Shield, ShieldOff, Trash2, AlertTriangle, CheckCircle, Loader, Copy } from 'lucide-react';

export function RLSKiller() {
  const [isKilling, setIsKilling] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string[];
  } | null>(null);

  const disableAllRLSScript = `-- =====================================================
-- 🔥 RLS KILLER - DESACTIVAR TODAS LAS POLÍTICAS RLS
-- =====================================================
-- ⚠️ ADVERTENCIA: Esto desactivará TODA la seguridad RLS
-- Solo usar en desarrollo. NO ejecutar en producción.
-- =====================================================

-- PASO 1: Eliminar todas las políticas existentes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
        RAISE NOTICE 'Dropped policy % on %.%', r.policyname, r.schemaname, r.tablename;
    END LOOP;
END $$;

-- PASO 2: Desactivar RLS en todas las tablas
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', 
            r.schemaname, r.tablename);
        RAISE NOTICE 'Disabled RLS on %.%', r.schemaname, r.tablename;
    END LOOP;
END $$;

-- =====================================================
-- ✅ VERIFICACIÓN
-- =====================================================
-- Ver políticas restantes (debería estar vacío)
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Ver tablas con RLS activo (debería estar vacío)
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;

-- =====================================================
-- ✅ RLS COMPLETAMENTE DESACTIVADO
-- =====================================================`;

  const handleKillRLS = async () => {
    setIsKilling(true);
    setResult(null);

    try {
      // Copiar al clipboard automáticamente
      await navigator.clipboard.writeText(disableAllRLSScript);
      
      setResult({
        success: true,
        message: '✅ Script copiado al portapapeles',
        details: [
          'El script SQL ha sido copiado a tu portapapeles',
          'Ve al SQL Editor de Supabase',
          'Pega el script (Ctrl+V) y ejecútalo',
          'Esto eliminará TODAS las políticas RLS',
          'Todas las tablas quedarán sin protección RLS'
        ]
      });
    } catch (error) {
      setResult({
        success: false,
        message: '❌ Error al copiar al portapapeles',
        details: [String(error)]
      });
    } finally {
      setIsKilling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning Header */}
      <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-2 border-red-600 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <ShieldOff className="w-12 h-12 text-red-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">
              🔥 RLS Killer - Desactivar Todas las Políticas
            </h2>
            <p className="text-red-100 mt-1">
              Elimina TODAS las políticas RLS y desactiva la seguridad en todas las tablas
            </p>
          </div>
        </div>

        <div className="bg-red-950/50 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="text-yellow-100">
              <p className="font-bold mb-2">⚠️ ADVERTENCIA IMPORTANTE:</p>
              <ul className="space-y-1 text-sm">
                <li>• Esto eliminará TODAS las políticas de seguridad Row Level Security</li>
                <li>• Todas las tablas quedarán completamente expuestas</li>
                <li>• Cualquier usuario podrá leer/escribir/eliminar cualquier dato</li>
                <li>• Solo usar en desarrollo - NUNCA en producción</li>
                <li>• No hay manera de deshacer esto excepto recrear las políticas manualmente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* What it does */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">🎯 ¿Qué hace este script?</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Trash2 className="w-6 h-6 text-red-400" />
              <h4 className="font-semibold text-white">Eliminar Políticas</h4>
            </div>
            <p className="text-sm text-slate-300">
              Elimina todas las políticas RLS existentes en el schema public
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <ShieldOff className="w-6 h-6 text-orange-400" />
              <h4 className="font-semibold text-white">Desactivar RLS</h4>
            </div>
            <p className="text-sm text-slate-300">
              Desactiva Row Level Security en todas las tablas públicas
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-blue-400" />
              <h4 className="font-semibold text-white">Acceso Total</h4>
            </div>
            <p className="text-sm text-slate-300">
              Permite acceso completo a todos los datos desde tu aplicación
            </p>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h4 className="font-semibold text-white">Verificación</h4>
            </div>
            <p className="text-sm text-slate-300">
              Incluye queries para verificar que no queden políticas activas
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleKillRLS}
        disabled={isKilling}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-red-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isKilling ? (
          <>
            <Loader className="w-6 h-6 animate-spin" />
            Copiando Script...
          </>
        ) : (
          <>
            <Copy className="w-6 h-6" />
            📋 Copiar Script RLS Killer
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className={`rounded-xl p-6 border-2 ${
          result.success 
            ? 'bg-green-900/30 border-green-600' 
            : 'bg-red-900/30 border-red-600'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            {result.success ? (
              <CheckCircle className="w-8 h-8 text-green-400" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-400" />
            )}
            <h3 className="text-xl font-bold text-white">{result.message}</h3>
          </div>
          
          {result.details && result.details.length > 0 && (
            <div className="bg-black/20 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-white">
                {result.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-white">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* SQL Preview */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">Vista Previa del Script:</h3>
          <span className="text-sm text-slate-400">
            {disableAllRLSScript.split('\n').length} líneas
          </span>
        </div>
        <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
          <pre className="text-xs font-mono text-red-300">
            {disableAllRLSScript}
          </pre>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-900/30 border-2 border-blue-600 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-300 mb-4">📋 Instrucciones</h3>
        <ol className="space-y-3 text-blue-100">
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">1.</span>
            <span>Click en <strong>"📋 Copiar Script RLS Killer"</strong> arriba</span>
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
            <span>Verifica en la salida que todas las políticas fueron eliminadas</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-blue-400 text-lg">5.</span>
            <span>Las queries de verificación confirmarán que no hay RLS activo</span>
          </li>
        </ol>
      </div>

      {/* Why No RLS */}
      <div className="bg-purple-900/30 border-2 border-purple-600 rounded-xl p-6">
        <h3 className="text-xl font-bold text-purple-300 mb-4">💡 ¿Por qué desactivar RLS?</h3>
        <div className="space-y-3 text-purple-100">
          <p>
            <strong>Desarrollo rápido:</strong> RLS añade complejidad al desarrollo. 
            Sin RLS puedes insertar, leer y modificar datos libremente desde tu aplicación.
          </p>
          <p>
            <strong>Debugging más fácil:</strong> No tienes que preocuparte por políticas 
            que bloqueen queries legítimas durante el desarrollo.
          </p>
          <p>
            <strong>Control total:</strong> Tu aplicación tiene acceso completo a todos 
            los datos sin restricciones de usuario.
          </p>
          <p className="text-yellow-200 font-semibold">
            ⚠️ Recuerda: Para producción, SIEMPRE debes implementar RLS o manejar 
            la seguridad en tu backend.
          </p>
        </div>
      </div>
    </div>
  );
}
