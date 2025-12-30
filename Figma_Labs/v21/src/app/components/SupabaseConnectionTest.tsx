import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

interface ConnectionStatus {
  database: 'success' | 'error' | 'loading';
  profiles: 'success' | 'error' | 'loading';
  courses: 'success' | 'error' | 'loading';
}

export function SupabaseConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    database: 'loading',
    profiles: 'loading',
    courses: 'loading'
  });

  const [counts, setCounts] = useState({
    profiles: 0,
    courses: 0
  });

  const testConnection = async () => {
    setStatus({
      database: 'loading',
      profiles: 'loading',
      courses: 'loading'
    });

    // Test database connection
    try {
      const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      setStatus(prev => ({ ...prev, database: error ? 'error' : 'success' }));
    } catch (e) {
      setStatus(prev => ({ ...prev, database: 'error' }));
    }

    // Test profiles table
    try {
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .limit(1);
      
      setStatus(prev => ({ ...prev, profiles: error ? 'error' : 'success' }));
      if (count !== null) setCounts(prev => ({ ...prev, profiles: count }));
    } catch (e) {
      setStatus(prev => ({ ...prev, profiles: 'error' }));
    }

    // Test courses table
    try {
      const { data, error, count } = await supabase
        .from('courses')
        .select('*', { count: 'exact' })
        .limit(1);
      
      setStatus(prev => ({ ...prev, courses: error ? 'error' : 'success' }));
      if (count !== null) setCounts(prev => ({ ...prev, courses: count }));
    } catch (e) {
      setStatus(prev => ({ ...prev, courses: 'error' }));
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const StatusIcon = ({ status }: { status: 'success' | 'error' | 'loading' }) => {
    if (status === 'loading') return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
    if (status === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border-2 border-purple-500 p-6 max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
          <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            Supabase Connection Test
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Estado de la conexión a la base de datos
          </p>
        </div>
        <button
          onClick={testConnection}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Actualizar"
        >
          <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Database Connection */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Database Connection
          </span>
          <StatusIcon status={status.database} />
        </div>

        {/* Profiles Table */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Profiles
            </span>
            {status.profiles === 'success' && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                ({counts.profiles})
              </span>
            )}
          </div>
          <StatusIcon status={status.profiles} />
        </div>

        {/* Courses Table */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Courses
            </span>
            {status.courses === 'success' && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                ({counts.courses})
              </span>
            )}
          </div>
          <StatusIcon status={status.courses} />
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {status.database === 'success' && status.profiles === 'success' && status.courses === 'success' ? (
          <p className="text-sm text-green-600 dark:text-green-400 text-center">
            ✅ Todas las conexiones funcionando correctamente
          </p>
        ) : status.database === 'loading' || status.profiles === 'loading' || status.courses === 'loading' ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            🔄 Verificando conexiones...
          </p>
        ) : (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            ❌ Hay problemas con algunas conexiones
          </p>
        )}
      </div>
    </div>
  );
}
