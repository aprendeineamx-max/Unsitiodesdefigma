import { useState, useEffect, useRef } from 'react';
import { Play, Copy, CheckCircle, AlertCircle, Loader, Terminal, FileJson, Table2, Download, Wrench, History, Star, StarOff, Trash2, Save, FolderOpen, Code2, Zap, FileText, Plus, X, Sparkles } from 'lucide-react';

// Credenciales de Supabase
const SUPABASE_URL = 'https://bntwyvwavxgspvcvelay.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHd5dndhdnhnc3B2Y3ZlbGF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUyMDI1OSwiZXhwIjoyMDgyMDk2MjU5fQ.h7UOc0Kd0ofFJz6YQYs4hgSvLkxl0-grfJS1VuzSPoo';

interface ExecutionResult {
  success: boolean;
  data?: any[];
  error?: string;
  rowCount?: number;
  executionTime?: number;
  timestamp?: string;
}

interface QueryHistory {
  id: string;
  query: string;
  timestamp: string;
  success: boolean;
  rowCount?: number;
  executionTime?: number;
}

interface Favorite {
  id: string;
  name: string;
  query: string;
  category: string;
  timestamp: string;
}

interface Tab {
  id: string;
  name: string;
  query: string;
  result: ExecutionResult | null;
}

const SQL_SNIPPETS = {
  'Select All': 'SELECT * FROM table_name LIMIT 10;',
  'Count Rows': 'SELECT COUNT(*) as total FROM table_name;',
  'Insert Data': 'INSERT INTO table_name (column1, column2) VALUES (value1, value2);',
  'Update Data': 'UPDATE table_name SET column1 = value1 WHERE condition;',
  'Delete Data': 'DELETE FROM table_name WHERE condition;',
  'Create Index': 'CREATE INDEX idx_name ON table_name(column_name);',
  'Join Tables': 'SELECT a.*, b.* FROM table1 a JOIN table2 b ON a.id = b.foreign_id;',
  'Group By': 'SELECT column, COUNT(*) FROM table_name GROUP BY column;',
  'Subquery': 'SELECT * FROM table1 WHERE id IN (SELECT foreign_id FROM table2);',
  'Transaction': 'BEGIN;\n-- Your queries here\nCOMMIT;'
};

const TABLE_NAMES = [
  'profiles', 'courses', 'modules', 'lessons', 'user_progress', 
  'activity_logs', 'deadlines', 'study_sessions', 'posts', 'comments',
  'blog_posts', 'enrollments', 'badges', 'challenges', 'forum_posts',
  'study_groups', 'users'
];

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
  'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET', 'INSERT INTO', 'UPDATE', 'DELETE',
  'CREATE', 'DROP', 'ALTER', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
  'DISTINCT', 'AS', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE'
];

export function ProSQLExecutor() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', name: 'Query 1', query: '', result: null }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [isExecuting, setIsExecuting] = useState(false);
  const [viewMode, setViewMode] = useState<'json' | 'table'>('table');
  const [setupDone, setSetupDone] = useState(() => {
    return localStorage.getItem('sql_executor_setup_done') === 'true';
  });
  
  // History & Favorites
  const [history, setHistory] = useState<QueryHistory[]>(() => {
    const saved = localStorage.getItem('sql_executor_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    const saved = localStorage.getItem('sql_executor_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [favoriteName, setFavoriteName] = useState('');
  const [favoriteCategory, setFavoriteCategory] = useState('General');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('sql_executor_history', JSON.stringify(history.slice(0, 50)));
  }, [history]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('sql_executor_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save setup status
  useEffect(() => {
    localStorage.setItem('sql_executor_setup_done', setupDone.toString());
  }, [setupDone]);

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
      title: '🔍 Verificar Sistema',
      category: 'Verificación',
      sql: `SELECT 
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename IN ('activity_logs', 'deadlines', 'study_sessions') AND schemaname = 'public' AND indexname LIKE 'idx_%') as indices_count,
  (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('update_activity_log', 'update_user_xp', 'update_deadline_status')) as functions_count,
  (SELECT COUNT(*) FROM pg_trigger WHERE tgname IN ('trigger_update_activity_log', 'trigger_update_user_xp', 'trigger_update_deadline_status')) as triggers_count,
  (SELECT COUNT(*) FROM public.activity_logs) as activity_logs,
  (SELECT COUNT(*) FROM public.deadlines) as deadlines,
  (SELECT COUNT(*) FROM public.user_progress) as user_progress;`
    },
    tables: {
      title: '📊 Listar Tablas',
      category: 'Info',
      sql: `SELECT table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;`
    },
    schema: {
      title: '🔍 Ver Schema',
      category: 'Info',
      sql: `SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'courses'
ORDER BY ordinal_position;`
    }
  };

  const executeSQL = async (queryToExecute?: string) => {
    const sqlToExecute = queryToExecute || activeTab.query;
    if (!sqlToExecute.trim()) return;

    setIsExecuting(true);

    const startTime = performance.now();
    const timestamp = new Date().toISOString();

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ query: sqlToExecute })
      });

      const executionTime = performance.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      let finalData = data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        if (data.success !== undefined) {
          finalData = [data];
        }
      }

      const result: ExecutionResult = {
        success: true,
        data: Array.isArray(finalData) ? finalData : [finalData],
        rowCount: Array.isArray(finalData) ? finalData.length : 1,
        executionTime,
        timestamp
      };

      // Update active tab result
      setTabs(tabs.map(t => 
        t.id === activeTabId ? { ...t, result } : t
      ));

      // Add to history
      const historyItem: QueryHistory = {
        id: Date.now().toString(),
        query: sqlToExecute,
        timestamp,
        success: true,
        rowCount: result.rowCount,
        executionTime
      };
      setHistory([historyItem, ...history]);

    } catch (err: any) {
      const executionTime = performance.now() - startTime;
      const result: ExecutionResult = {
        success: false,
        error: err.message || 'Error desconocido',
        executionTime,
        timestamp
      };

      // Update active tab result
      setTabs(tabs.map(t => 
        t.id === activeTabId ? { ...t, result } : t
      ));

      // Add to history
      const historyItem: QueryHistory = {
        id: Date.now().toString(),
        query: sqlToExecute,
        timestamp,
        success: false,
        executionTime
      };
      setHistory([historyItem, ...history]);

    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to execute
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeSQL();
    }
    
    // Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      updateTabQuery(value.substring(0, start) + '  ' + value.substring(end));
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const updateTabQuery = (query: string) => {
    setTabs(tabs.map(t => 
      t.id === activeTabId ? { ...t, query } : t
    ));
  };

  const addNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      name: `Query ${tabs.length + 1}`,
      query: '',
      result: null
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const renameTab = (tabId: string, newName: string) => {
    setTabs(tabs.map(t => 
      t.id === tabId ? { ...t, name: newName } : t
    ));
  };

  const saveFavorite = () => {
    if (!favoriteName.trim() || !activeTab.query.trim()) return;

    const favorite: Favorite = {
      id: Date.now().toString(),
      name: favoriteName,
      query: activeTab.query,
      category: favoriteCategory,
      timestamp: new Date().toISOString()
    };

    setFavorites([favorite, ...favorites]);
    setShowSaveDialog(false);
    setFavoriteName('');
  };

  const deleteFavorite = (id: string) => {
    setFavorites(favorites.filter(f => f.id !== id));
  };

  const loadFromHistory = (item: QueryHistory) => {
    updateTabQuery(item.query);
    setShowHistory(false);
  };

  const loadFromFavorites = (fav: Favorite) => {
    updateTabQuery(fav.query);
    setShowFavorites(false);
  };

  const loadSnippet = (snippet: string) => {
    updateTabQuery(snippet);
    setShowSnippets(false);
  };

  const formatSQL = () => {
    // Basic SQL formatting
    let formatted = activeTab.query
      .replace(/\bSELECT\b/gi, '\nSELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bJOIN\b/gi, '\nJOIN')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bLIMIT\b/gi, '\nLIMIT')
      .trim();
    
    updateTabQuery(formatted);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadJSON = () => {
    if (!activeTab.result?.data) return;
    const blob = new Blob([JSON.stringify(activeTab.result.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-result-${Date.now()}.json`;
    a.click();
  };

  const exportHistory = () => {
    const blob = new Blob([JSON.stringify({ history, favorites }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sql-executor-backup-${Date.now()}.json`;
    a.click();
  };

  const clearHistory = () => {
    if (confirm('¿Eliminar todo el historial?')) {
      setHistory([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-2 border-indigo-600 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                ⚡ PRO SQL Executor
              </h2>
              <p className="text-indigo-100">
                Editor SQL profesional con tabs, historial, favoritos, snippets y atajos de teclado
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                showHistory ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
              title="Historial (Últimas 50 queries)"
            >
              <History className="w-4 h-4" />
              <span className="text-xs">{history.length}</span>
            </button>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                showFavorites ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
              title="Favoritos"
            >
              <Star className="w-4 h-4" />
              <span className="text-xs">{favorites.length}</span>
            </button>
            <button
              onClick={() => setShowSnippets(!showSnippets)}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                showSnippets ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
              title="Snippets SQL"
            >
              <Code2 className="w-4 h-4" />
            </button>
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
              <div className="bg-yellow-950/50 rounded-lg p-4 mb-3 max-h-48 overflow-y-auto">
                <pre className="text-xs font-mono text-yellow-200 whitespace-pre-wrap">
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

      {/* History Panel */}
      {showHistory && (
        <div className="bg-slate-900 border-2 border-indigo-600 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5" />
              Historial de Queries ({history.length})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={exportHistory}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={clearHistory}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No hay queries en el historial</p>
            ) : (
              history.map(item => (
                <div
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors border border-slate-700 hover:border-indigo-500"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {item.success ? (
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {item.rowCount !== undefined && <span>{item.rowCount} filas</span>}
                      <span>{item.executionTime?.toFixed(0)}ms</span>
                    </div>
                  </div>
                  <code className="text-xs text-green-300 font-mono block truncate">
                    {item.query}
                  </code>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Favorites Panel */}
      {showFavorites && (
        <div className="bg-slate-900 border-2 border-yellow-600 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Favoritos ({favorites.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {favorites.length === 0 ? (
              <p className="text-slate-400 text-center py-8 col-span-2">No hay favoritos guardados</p>
            ) : (
              favorites.map(fav => (
                <div
                  key={fav.id}
                  className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-yellow-500 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-white">{fav.name}</h4>
                      <span className="text-xs text-slate-400">{fav.category}</span>
                    </div>
                    <button
                      onClick={() => deleteFavorite(fav.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <code className="text-xs text-green-300 font-mono block truncate mb-2">
                    {fav.query}
                  </code>
                  <button
                    onClick={() => loadFromFavorites(fav)}
                    className="w-full px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Cargar Query
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Snippets Panel */}
      {showSnippets && (
        <div className="bg-slate-900 border-2 border-green-600 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-green-400" />
            Snippets SQL
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(SQL_SNIPPETS).map(([name, snippet]) => (
              <button
                key={name}
                onClick={() => loadSnippet(snippet)}
                className="p-3 bg-slate-800 rounded-lg hover:bg-green-900/30 hover:border-green-500 border-2 border-slate-700 transition-all text-left"
              >
                <p className="text-sm font-semibold text-white">{name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Scripts */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">🚀 Scripts Rápidos</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(quickScripts).map(([key, script]) => (
            <button
              key={key}
              onClick={() => updateTabQuery(script.sql)}
              className="p-3 bg-slate-800 border-2 border-slate-700 rounded-lg hover:bg-indigo-900/30 hover:border-indigo-500 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-white group-hover:text-indigo-300">
                  {script.title}
                </p>
                <span className="text-xs text-slate-500">{script.category}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden">
        <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-slate-700">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-t-lg transition-colors ${
                tab.id === activeTabId
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <button
                onClick={() => setActiveTabId(tab.id)}
                className="flex-1"
              >
                <span className="text-sm">{tab.name}</span>
              </button>
              {tabs.length > 1 && (
                <button
                  onClick={() => closeTab(tab.id)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addNewTab}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            title="Nueva tab (Ctrl+T)"
          >
            <Plus className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* SQL Editor */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">📝 Editor SQL</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm flex items-center gap-2"
                title="Guardar como favorito"
              >
                <Star className="w-4 h-4" />
                Guardar
              </button>
              <button
                onClick={formatSQL}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
                title="Formatear SQL"
              >
                <Sparkles className="w-4 h-4" />
                Formatear
              </button>
              <button
                onClick={() => updateTabQuery('')}
                className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors text-sm"
              >
                Limpiar
              </button>
              <button
                onClick={() => copyToClipboard(activeTab.query)}
                className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors text-sm flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={activeTab.query}
            onChange={(e) => updateTabQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-700 text-green-300 rounded-lg focus:border-indigo-500 focus:outline-none font-mono text-sm resize-none"
            rows={14}
            placeholder="-- Escribe tu SQL aquí o usa snippets/favoritos
-- Atajos: Ctrl+Enter = Ejecutar | Tab = Indentar
SELECT * FROM courses LIMIT 10;"
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>{activeTab.query.split('\n').length} líneas</span>
              <span>{activeTab.query.length} caracteres</span>
              <span className="text-indigo-400">Ctrl+Enter para ejecutar</span>
            </div>
            <button
              onClick={() => executeSQL()}
              disabled={isExecuting || !activeTab.query.trim()}
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
      </div>

      {/* Save Favorite Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border-2 border-yellow-600 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">💾 Guardar como Favorito</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Nombre</label>
                <input
                  type="text"
                  value={favoriteName}
                  onChange={(e) => setFavoriteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border-2 border-slate-700 text-white rounded-lg focus:border-yellow-500 focus:outline-none"
                  placeholder="Ej: Listar cursos activos"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Categoría</label>
                <select
                  value={favoriteCategory}
                  onChange={(e) => setFavoriteCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border-2 border-slate-700 text-white rounded-lg focus:border-yellow-500 focus:outline-none"
                >
                  <option>General</option>
                  <option>Verificación</option>
                  <option>Setup</option>
                  <option>Info</option>
                  <option>Mantenimiento</option>
                </select>
              </div>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setFavoriteName('');
                  }}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveFavorite}
                  disabled={!favoriteName.trim()}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {activeTab.result && (
        <div className={`rounded-xl p-6 border-2 ${
          activeTab.result.success 
            ? 'bg-green-900/30 border-green-600' 
            : 'bg-red-900/30 border-red-600'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {activeTab.result.success ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-400" />
              )}
              <div>
                <h3 className="text-xl font-bold text-white">
                  {activeTab.result.success ? '✅ Ejecución Exitosa' : '❌ Error en Ejecución'}
                </h3>
                <p className="text-sm text-slate-300">
                  Tiempo: {activeTab.result.executionTime?.toFixed(2)}ms
                  {activeTab.result.rowCount !== undefined && ` • ${activeTab.result.rowCount} filas`}
                  {activeTab.result.timestamp && ` • ${new Date(activeTab.result.timestamp).toLocaleTimeString()}`}
                </p>
              </div>
            </div>
            {activeTab.result.success && activeTab.result.data && (
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

          {!activeTab.result.success && activeTab.result.error && (
            <div className="bg-red-950/50 rounded-lg p-4">
              <p className="font-mono text-sm text-red-200">{activeTab.result.error}</p>
            </div>
          )}

          {activeTab.result.success && activeTab.result.data && (
            <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
              {viewMode === 'json' ? (
                <pre className="text-xs font-mono text-green-300">
                  {JSON.stringify(activeTab.result.data, null, 2)}
                </pre>
              ) : (
                <div className="overflow-x-auto">
                  {activeTab.result.data.length > 0 ? (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          {Object.keys(activeTab.result.data[0]).map((key) => (
                            <th key={key} className="px-4 py-2 font-semibold text-indigo-300">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeTab.result.data.map((row, idx) => (
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

      {/* Features Info */}
      <div className="bg-blue-900/30 border-2 border-blue-600 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-300 mb-3">✨ Características PRO</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-blue-100 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span><strong>Tabs múltiples</strong> - Abre varias queries simultáneamente</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span><strong>Historial automático</strong> - Últimas 50 queries guardadas</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span><strong>Favoritos</strong> - Guarda queries importantes con nombre</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span><strong>Snippets SQL</strong> - 10 plantillas listas para usar</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span><strong>Atajos de teclado</strong> - Ctrl+Enter ejecuta, Tab indenta</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span><strong>Formatear SQL</strong> - Embellece automáticamente el código</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span><strong>Export/Import</strong> - Guarda historial y favoritos</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span><strong>Vista dual</strong> - JSON o Tabla según prefieras</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <span><strong>LocalStorage</strong> - Persiste tus datos entre sesiones</span>
          </div>
        </div>
      </div>
    </div>
  );
}
