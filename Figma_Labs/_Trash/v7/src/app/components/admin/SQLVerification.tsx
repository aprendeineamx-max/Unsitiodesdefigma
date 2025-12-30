import { useState } from 'react';
import { CheckCircle, XCircle, Loader, AlertTriangle, Play } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface VerificationResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message?: string;
  details?: any;
}

export function SQLVerification() {
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const verifyTable = async (tableName: string): Promise<VerificationResult> => {
    addLog(`Verificando tabla: ${tableName}...`);
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
      
      if (error) {
        addLog(`❌ Error en ${tableName}: ${error.message}`);
        return {
          name: tableName,
          status: 'error',
          message: error.message
        };
      }
      
      addLog(`✅ Tabla ${tableName} existe`);
      return {
        name: tableName,
        status: 'success',
        message: 'Tabla existe y es accesible'
      };
    } catch (err: any) {
      addLog(`❌ Excepción en ${tableName}: ${err.message}`);
      return {
        name: tableName,
        status: 'error',
        message: err.message
      };
    }
  };

  const countRecords = async (tableName: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) return -1;
      return count || 0;
    } catch {
      return -1;
    }
  };

  const runVerification = async () => {
    setIsRunning(true);
    setResults([]);
    setLog([]);
    
    addLog('🚀 Iniciando verificación de base de datos...');
    addLog('='.repeat(60));

    const newResults: VerificationResult[] = [];

    // Verificar tablas base
    addLog('\n📋 VERIFICANDO TABLAS BASE...\n');
    
    const baseTables = ['profiles', 'courses', 'lessons', 'modules'];
    for (const table of baseTables) {
      const result = await verifyTable(table);
      if (result.status === 'success') {
        const count = await countRecords(table);
        result.details = { count };
        addLog(`   📊 ${table}: ${count} registros`);
      }
      newResults.push(result);
    }

    // Verificar tablas de activity tracking
    addLog('\n📋 VERIFICANDO TABLAS DE ACTIVITY TRACKING...\n');
    
    const activityTables = ['user_progress', 'activity_logs', 'deadlines', 'study_sessions'];
    for (const table of activityTables) {
      const result = await verifyTable(table);
      if (result.status === 'success') {
        const count = await countRecords(table);
        result.details = { count };
        addLog(`   📊 ${table}: ${count} registros`);
      } else {
        result.status = 'warning';
        result.message = 'Tabla no existe - necesita ser creada en DevTools → SQL Executor';
        addLog(`   ⚠️  ${table}: NECESITA SER CREADA`);
      }
      newResults.push(result);
    }

    // Verificar otras tablas importantes
    addLog('\n📋 VERIFICANDO OTRAS TABLAS...\n');
    
    const otherTables = ['blog_posts', 'posts', 'comments', 'likes', 'enrollments', 'achievements'];
    for (const table of otherTables) {
      const result = await verifyTable(table);
      if (result.status === 'success') {
        const count = await countRecords(table);
        result.details = { count };
        addLog(`   📊 ${table}: ${count} registros`);
      }
      newResults.push(result);
    }

    // Resumen
    addLog('\n' + '='.repeat(60));
    addLog('📊 RESUMEN DE VERIFICACIÓN\n');
    
    const successful = newResults.filter(r => r.status === 'success').length;
    const errors = newResults.filter(r => r.status === 'error').length;
    const warnings = newResults.filter(r => r.status === 'warning').length;
    
    addLog(`✅ Exitosos: ${successful}`);
    addLog(`⚠️  Advertencias: ${warnings}`);
    addLog(`❌ Errores: ${errors}`);
    addLog(`📊 Total: ${newResults.length}\n`);

    if (warnings > 0) {
      addLog('⚠️  ACCIÓN REQUERIDA:');
      addLog('Las tablas de Activity Tracking necesitan ser creadas.');
      addLog('Ve a: Admin Panel → Dev Tools → SQL Executor → Configuración');
      addLog('Ejecuta los scripts en este orden:');
      addLog('  1. 📊 Activity Tracking Schema');
      addLog('  2. 🔍 Create Indexes');
      addLog('  3. ⚡ Create Triggers');
      addLog('  4. 🔒 Enable RLS');
      addLog('  5. (Opcional) 📝 Sample Activity Data');
      addLog('  6. (Opcional) ⏰ Sample Deadlines\n');
    } else if (errors === 0) {
      addLog('🎉 ¡Todas las tablas están configuradas correctamente!\n');
    }

    setResults(newResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: VerificationResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Loader className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: VerificationResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-600 bg-green-900/20';
      case 'error':
        return 'border-red-600 bg-red-900/20';
      case 'warning':
        return 'border-yellow-600 bg-yellow-900/20';
      default:
        return 'border-gray-600 bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Verificación de Base de Datos</h2>
        <p className="text-blue-100">Verifica el estado de todas las tablas y detecta problemas</p>
      </div>

      {/* Run Button */}
      <button
        onClick={runVerification}
        disabled={isRunning}
        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isRunning ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Verificando...
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Ejecutar Verificación
          </>
        )}
      </button>

      {/* Results Grid */}
      {results.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Resultados:</h3>
          <div className="grid grid-cols-2 gap-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 border-2 rounded-xl ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(result.status)}
                  <span className="font-semibold text-white">{result.name}</span>
                </div>
                {result.message && (
                  <p className="text-sm text-slate-300 mb-1">{result.message}</p>
                )}
                {result.details?.count !== undefined && result.status === 'success' && (
                  <p className="text-xs text-slate-400">
                    {result.details.count} registro{result.details.count !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Console */}
      {log.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Log de Ejecución:</h3>
          <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-4 max-h-96 overflow-y-auto">
            <pre className="text-xs font-mono text-green-300 whitespace-pre-wrap">
              {log.join('\n')}
            </pre>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-900/20 border-2 border-green-600 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">
              {results.filter(r => r.status === 'success').length}
            </div>
            <div className="text-sm text-green-300 mt-1">Exitosos</div>
          </div>
          <div className="bg-yellow-900/20 border-2 border-yellow-600 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {results.filter(r => r.status === 'warning').length}
            </div>
            <div className="text-sm text-yellow-300 mt-1">Advertencias</div>
          </div>
          <div className="bg-red-900/20 border-2 border-red-600 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-red-400">
              {results.filter(r => r.status === 'error').length}
            </div>
            <div className="text-sm text-red-300 mt-1">Errores</div>
          </div>
        </div>
      )}
    </div>
  );
}
