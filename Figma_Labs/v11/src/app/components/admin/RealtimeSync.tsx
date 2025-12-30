import { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Activity,
  Database,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  Clock
} from 'lucide-react';
import { supabaseHelpers } from '../../../lib/supabase';

interface SyncStatus {
  connected: boolean;
  lastSync: Date | null;
  syncCount: number;
  errors: number;
  activeSubscriptions: number;
}

export function RealtimeSync() {
  const [status, setStatus] = useState<SyncStatus>({
    connected: false,
    lastSync: null,
    syncCount: 0,
    errors: 0,
    activeSubscriptions: 0
  });
  const [logs, setLogs] = useState<Array<{ time: Date; type: 'info' | 'success' | 'error'; message: string }>>([]);
  const [autoSync, setAutoSync] = useState(true);

  const addLog = (type: 'info' | 'success' | 'error', message: string) => {
    setLogs(prev => [{ time: new Date(), type, message }, ...prev.slice(0, 49)]);
  };

  useEffect(() => {
    if (!autoSync) return;

    // Subscribe to courses changes
    const coursesChannel = supabaseHelpers.supabase
      .channel('courses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'courses'
        },
        (payload) => {
          addLog('success', `Curso ${payload.eventType}: ${(payload.new as any)?.title || (payload.old as any)?.title || 'desconocido'}`);
          setStatus(prev => ({
            ...prev,
            lastSync: new Date(),
            syncCount: prev.syncCount + 1
          }));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setStatus(prev => ({ ...prev, connected: true, activeSubscriptions: prev.activeSubscriptions + 1 }));
          addLog('success', '✅ Conectado a sincronización de cursos');
        } else if (status === 'CLOSED') {
          setStatus(prev => ({ ...prev, connected: false, activeSubscriptions: Math.max(0, prev.activeSubscriptions - 1) }));
          addLog('error', '❌ Desconectado de sincronización de cursos');
        }
      });

    // Subscribe to posts changes
    const postsChannel = supabaseHelpers.supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          addLog('info', `Post ${payload.eventType}`);
          setStatus(prev => ({
            ...prev,
            lastSync: new Date(),
            syncCount: prev.syncCount + 1
          }));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setStatus(prev => ({ ...prev, activeSubscriptions: prev.activeSubscriptions + 1 }));
          addLog('success', '✅ Conectado a sincronización de posts');
        } else if (status === 'CLOSED') {
          setStatus(prev => ({ ...prev, activeSubscriptions: Math.max(0, prev.activeSubscriptions - 1) }));
          addLog('error', '❌ Desconectado de sincronización de posts');
        }
      });

    // Subscribe to blog posts changes
    const blogPostsChannel = supabaseHelpers.supabase
      .channel('blog-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts'
        },
        (payload) => {
          addLog('info', `Blog post ${payload.eventType}: ${(payload.new as any)?.title || (payload.old as any)?.title || 'desconocido'}`);
          setStatus(prev => ({
            ...prev,
            lastSync: new Date(),
            syncCount: prev.syncCount + 1
          }));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setStatus(prev => ({ ...prev, activeSubscriptions: prev.activeSubscriptions + 1 }));
          addLog('success', '✅ Conectado a sincronización de blog posts');
        } else if (status === 'CLOSED') {
          setStatus(prev => ({ ...prev, activeSubscriptions: Math.max(0, prev.activeSubscriptions - 1) }));
          addLog('error', '❌ Desconectado de sincronización de blog posts');
        }
      });

    return () => {
      coursesChannel.unsubscribe();
      postsChannel.unsubscribe();
      blogPostsChannel.unsubscribe();
      setStatus(prev => ({ ...prev, connected: false, activeSubscriptions: 0 }));
    };
  }, [autoSync]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Sincronización en Tiempo Real</h1>
        <p className="text-green-100">Monitor de cambios y actualizaciones automáticas</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm font-semibold">Estado de Conexión</span>
            {status.connected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
          </div>
          <p className={`text-2xl font-bold ${status.connected ? 'text-green-400' : 'text-red-400'}`}>
            {status.connected ? 'Conectado' : 'Desconectado'}
          </p>
          <p className="text-xs text-slate-400 mt-1">{status.activeSubscriptions} suscripciones activas</p>
        </div>

        <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm font-semibold">Última Sincronización</span>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {status.lastSync ? formatTime(status.lastSync) : '--:--:--'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {status.lastSync ? new Date().toLocaleDateString('es-ES') : 'Sin sincronización'}
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm font-semibold">Cambios Detectados</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">{status.syncCount}</p>
          <p className="text-xs text-slate-400 mt-1">Total en esta sesión</p>
        </div>

        <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm font-semibold">Errores</span>
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">{status.errors}</p>
          <p className="text-xs text-slate-400 mt-1">Sin errores detectados</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-lg mb-1">Sincronización Automática</h3>
            <p className="text-sm text-slate-300">
              {autoSync ? 'La sincronización está activa y escuchando cambios' : 'La sincronización está pausada'}
            </p>
          </div>
          <button
            onClick={() => setAutoSync(!autoSync)}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              autoSync
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-slate-600 text-slate-200 hover:bg-slate-500'
            }`}
          >
            {autoSync ? '✅ Activa' : '⏸️ Pausada'}
          </button>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-slate-800 rounded-xl border-2 border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-lg">Registro de Actividad</h3>
          <button
            onClick={() => setLogs([])}
            className="text-sm text-slate-300 hover:text-white font-semibold"
          >
            Limpiar
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay actividad reciente</p>
            <p className="text-sm mt-1">Los cambios aparecerán aquí en tiempo real</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 ${
                  log.type === 'success' ? 'bg-green-900/20 border-green-700' :
                  log.type === 'error' ? 'bg-red-900/20 border-red-700' :
                  'bg-blue-900/20 border-blue-700'
                }`}
              >
                {log.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />}
                {log.type === 'error' && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                {log.type === 'info' && <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${
                    log.type === 'success' ? 'text-green-300' :
                    log.type === 'error' ? 'text-red-300' :
                    'text-blue-300'
                  }`}>
                    {log.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatTime(log.time)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="bg-slate-800 border-2 border-indigo-700 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-900/50 rounded-lg">
            <Database className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-300 mb-2">¿Cómo funciona la sincronización?</h4>
            <ul className="space-y-1 text-sm text-indigo-200">
              <li>• Escucha cambios en tiempo real en las tablas de Supabase</li>
              <li>• Detecta INSERT, UPDATE y DELETE automáticamente</li>
              <li>• Actualiza la interfaz sin necesidad de recargar</li>
              <li>• Mantiene la aplicación siempre sincronizada con la base de datos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}