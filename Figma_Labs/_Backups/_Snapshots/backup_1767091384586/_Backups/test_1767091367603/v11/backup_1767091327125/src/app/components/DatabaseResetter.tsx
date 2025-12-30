import { useState } from 'react';
import { Trash2, RefreshCw, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ResetLog {
  table: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  error?: string;
}

export function DatabaseResetter() {
  const [logs, setLogs] = useState<ResetLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Orden correcto para borrar (respetando foreign keys)
  const TABLES_TO_RESET = [
    'user_progress',
    'user_challenges',
    'user_badges',
    'enrollments',
    'likes',
    'comments',
    'posts',
    'blog_posts',
    'forum_posts',
    'followers',
    'notifications',
    'achievements',
    'lessons',
    'modules',
    'study_groups',
    'courses',
    'challenges',
    'badges',
    'profiles',
    'users',
  ];

  const addLog = (table: string, status: ResetLog['status'], message?: string, error?: string) => {
    setLogs(prev => {
      const existing = prev.findIndex(l => l.table === table);
      if (existing >= 0) {
        const newLogs = [...prev];
        newLogs[existing] = { table, status, message, error };
        return newLogs;
      }
      return [...prev, { table, status, message, error }];
    });
  };

  const resetDatabase = async () => {
    if (!supabase) return;
    
    setIsRunning(true);
    setLogs([]);
    setShowConfirmation(false);

    let successCount = 0;
    let errorCount = 0;

    try {
      for (const table of TABLES_TO_RESET) {
        addLog(table, 'running', `Limpiando ${table}...`);

        try {
          // Usar delete() con un filtro siempre verdadero para borrar todo
          const { error, count } = await supabase
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Filtro que siempre es verdadero

          if (error) {
            // Si falla con delete(), intentar con un filtro más simple
            console.warn(`Error deleting from ${table}, trying alternative:`, error);
            
            // Método alternativo: seleccionar todos los IDs y borrarlos
            const { data: rows } = await supabase
              .from(table)
              .select('id')
              .limit(1000);

            if (rows && rows.length > 0) {
              const ids = rows.map(r => r.id);
              const { error: deleteError } = await supabase
                .from(table)
                .delete()
                .in('id', ids);

              if (deleteError) {
                throw deleteError;
              }
              
              addLog(table, 'success', `✅ ${rows.length} registros eliminados`);
              successCount++;
            } else {
              addLog(table, 'success', `✅ Tabla vacía o limpiada`);
              successCount++;
            }
          } else {
            addLog(table, 'success', `✅ ${count || 0} registros eliminados`);
            successCount++;
          }
        } catch (err: any) {
          console.error(`Error resetting ${table}:`, err);
          addLog(table, 'error', `❌ Error: ${err.message}`, JSON.stringify(err));
          errorCount++;
          // Continuar con la siguiente tabla en vez de detener todo
        }

        // Pequeña pausa para no saturar
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Resumen final
      if (errorCount === 0) {
        addLog('complete', 'success', `🎉 Base de datos completamente limpiada. ${successCount} tablas reseteadas.`);
      } else {
        addLog('complete', 'error', `⚠️ Reset completado con errores: ${successCount} éxitos, ${errorCount} fallos.`);
      }

    } catch (error: any) {
      console.error('Error resetting database:', error);
      addLog('error', 'error', error.message || 'Error desconocido');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: ResetLog['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-red-500 p-6 max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
          <Trash2 className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Database Resetter
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Resetear base de datos a estado limpio
          </p>
        </div>
      </div>

      {/* Warning & Confirmation */}
      {!showConfirmation && logs.length === 0 && (
        <div className="mb-6">
          <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border-2 border-red-300 dark:border-red-700">
            <div className="flex items-start gap-4 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-900 dark:text-red-200 mb-2">
                  ⚠️ ADVERTENCIA - Acción Destructiva
                </h3>
                <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                  Esta operación eliminará TODOS los datos de las siguientes {TABLES_TO_RESET.length} tablas:
                </p>
                <div className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {TABLES_TO_RESET.map(table => (
                      <div key={table} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="font-mono text-gray-700 dark:text-gray-300">{table}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-red-800 dark:text-red-300 font-bold">
                  ⚡ Esta acción NO se puede deshacer
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-2">
                  Después del reset, usa "Master Data Sync" para volver a cargar los datos.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(true)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Entiendo los riesgos, continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Double Confirmation */}
      {showConfirmation && logs.length === 0 && (
        <div className="mb-6">
          <div className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border-2 border-orange-400 dark:border-orange-600">
            <h3 className="font-bold text-orange-900 dark:text-orange-200 mb-3 flex items-center gap-2">
              <RefreshCw className="w-6 h-6" />
              Confirmación Final
            </h3>
            <p className="text-sm text-orange-800 dark:text-orange-300 mb-4">
              ¿Estás COMPLETAMENTE seguro de que deseas eliminar todos los datos de {TABLES_TO_RESET.length} tablas?
            </p>
            <div className="flex gap-3">
              <button
                onClick={resetDatabase}
                disabled={isRunning}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Reseteando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    SÍ, RESETEAR AHORA
                  </>
                )}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isRunning}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  log.status === 'error' 
                    ? 'bg-red-50 dark:bg-red-900/20' 
                    : log.status === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-gray-50 dark:bg-slate-700/50'
                }`}
              >
                <div className="mt-0.5">
                  {getStatusIcon(log.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {log.table}
                  </p>
                  {log.message && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {log.message}
                    </p>
                  )}
                  {log.error && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                        Ver error completo
                      </summary>
                      <pre className="text-xs bg-red-100 dark:bg-red-900/30 p-2 rounded mt-1 overflow-x-auto">
                        {log.error}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {logs.some(log => log.table === 'complete' && log.status === 'success') && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg">
          <p className="text-green-800 dark:text-green-300 font-bold text-center">
            ✅ Base de datos completamente limpiada
          </p>
          <p className="text-sm text-green-700 dark:text-green-400 text-center mt-1">
            Ahora usa "Master Data Sync" para cargar todos los datos de nuevo
          </p>
        </div>
      )}

      {/* Info Box */}
      {logs.length === 0 && !showConfirmation && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>💡 Tip:</strong> Después del reset, ve a "Master Data Sync" para restaurar todos los datos ({TABLES_TO_RESET.length} tablas).
          </p>
        </div>
      )}
    </div>
  );
}
