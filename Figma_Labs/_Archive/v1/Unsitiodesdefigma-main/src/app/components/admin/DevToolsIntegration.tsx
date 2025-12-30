import { useState } from 'react';
import { Database, Code, FileJson, RefreshCw, Trash2, Terminal, CheckCircle, Wand2, Zap, PlayCircle, SearchCheck, FileCode, Settings, Eye, EyeOff, FileText, ShieldOff, FileSearch, ListOrdered, Rocket, Sparkles, Filter, Archive, Grid3x3 } from 'lucide-react';
import { AutoSetupRunner } from './AutoSetupRunner';
import { SetupVerifier } from './SetupVerifier';
import { CompleteSetupScript } from './CompleteSetupScript';
import { RLSKiller } from './RLSKiller';
import { ManualVerifier } from './ManualVerifier';
import { StepByStepSetup } from './StepByStepSetup';
import { UltimateSQLExecutor } from './UltimateSQLExecutor';
import { ScriptRunner } from './ScriptRunner';

type ToolView = 'none' | 'connection' | 'setup' | 'schema' | 'sync' | 'reset' | 'sql' | 'verify' | 'wizard' | 'direct' | 'oneclick' | 'autorun' | 'verifier' | 'completescript' | 'rlskiller' | 'manualverifier' | 'stepbystep' | 'ultimatesql' | 'scriptrunner';

type ToolCategory = 'all' | 'sql' | 'scripts' | 'setup' | 'verification' | 'maintenance' | 'sync' | 'archived';

interface Tool {
  id: ToolView;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  category: ToolCategory;
  status: 'active' | 'deprecated' | 'archived';
  badge?: string;
}

export function DevToolsIntegration() {
  const [activeView, setActiveView] = useState<ToolView>('none');
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [floatingButtonVisible, setFloatingButtonVisible] = useState(() => {
    return localStorage.getItem('devtools-button-visible') === 'true';
  });

  const toggleFloatingButton = () => {
    const newValue = !floatingButtonVisible;
    setFloatingButtonVisible(newValue);
    localStorage.setItem('devtools-button-visible', newValue.toString());
    // Dispatch custom event to notify DevToolsMenu (NO reload needed!)
    window.dispatchEvent(new CustomEvent('devtools-visibility-changed', { detail: newValue }));
  };

  const tools: Tool[] = [
    // 🚀 SQL & QUERIES (Categoría Principal)
    {
      id: 'ultimatesql',
      title: 'Ultimate SQL Executor',
      description: 'Editor SQL profesional con tabs, historial, favoritos y 16+ scripts integrados',
      icon: Rocket,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-900/20',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-700',
      category: 'sql',
      status: 'active',
      badge: '⭐ RECOMENDADO'
    },

    // 📜 SCRIPTS & AUTOMATION (Nueva Categoría)
    {
      id: 'scriptrunner',
      title: 'Script Runner',
      description: 'Ejecutar scripts de mantenimiento y migración (Node.js, Python, PHP, etc.)',
      icon: Terminal,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-900/20',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-700',
      category: 'scripts',
      status: 'active',
      badge: '🆕 NUEVO'
    },
    
    // ✅ VERIFICACIÓN & TESTING
    {
      id: 'verifier',
      title: 'Setup Verifier',
      description: 'Verificar configuración completa de base de datos',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-900/20',
      textColor: 'text-green-400',
      borderColor: 'border-green-700',
      category: 'verification',
      status: 'active',
      badge: '✅ ACTIVO'
    },
    {
      id: 'manualverifier',
      title: 'Manual Verifier',
      description: 'Verificar configuración manualmente paso a paso',
      icon: FileSearch,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-900/20',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-700',
      category: 'verification',
      status: 'active'
    },
    
    // 🛠️ MANTENIMIENTO & ADMIN
    {
      id: 'rlskiller',
      title: 'RLS Killer',
      description: 'Desactivar Row Level Security para desarrollo',
      icon: ShieldOff,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-900/20',
      textColor: 'text-red-400',
      borderColor: 'border-red-700',
      category: 'maintenance',
      status: 'active',
      badge: '⚠️ PRECAUCIÓN'
    },
    {
      id: 'reset',
      title: 'Database Resetter',
      description: 'Limpiar y resetear base de datos completa',
      icon: Trash2,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-900/20',
      textColor: 'text-red-400',
      borderColor: 'border-red-700',
      category: 'maintenance',
      status: 'active',
      badge: '⚠️ PELIGRO'
    },
    
    // 🔄 SINCRONIZACIÓN
    {
      id: 'sync',
      title: 'Master Data Sync',
      description: 'Sincronizar datos maestros desde mock data',
      icon: RefreshCw,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-900/20',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-700',
      category: 'sync',
      status: 'active'
    },

    // 🗄️ ARCHIVADAS (Reemplazadas por Ultimate SQL Executor)
    {
      id: 'connection',
      title: 'Connection Test',
      description: 'Verificar conexión a Supabase (Obsoleto)',
      icon: Database,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-900/20',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-700',
      category: 'archived',
      status: 'archived',
      badge: '📦 ARCHIVADO'
    },
    {
      id: 'sql',
      title: 'SQL Executor',
      description: 'Ejecutar SQL básico (Reemplazado por Ultimate SQL)',
      icon: Code,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-900/20',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-700',
      category: 'archived',
      status: 'archived',
      badge: '📦 ARCHIVADO'
    },
    {
      id: 'verify',
      title: 'SQL Verification',
      description: 'Verificar SQL simple (Reemplazado por Ultimate SQL)',
      icon: CheckCircle,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-900/20',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-700',
      category: 'archived',
      status: 'archived',
      badge: '📦 ARCHIVADO'
    },
    {
      id: 'setup',
      title: 'Database Setup',
      description: 'Configurar esquema básico (Reemplazado por Ultimate SQL)',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-900/20',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-700',
      category: 'archived',
      status: 'archived',
      badge: '📦 ARCHIVADO'
    },
    {
      id: 'schema',
      title: 'Schema Inspector',
      description: 'Inspeccionar tablas (Integrado en Ultimate SQL)',
      icon: Eye,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-900/20',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-700',
      category: 'archived',
      status: 'archived',
      badge: '📦 ARCHIVADO'
    },
    {
      id: 'wizard',
      title: 'Auto Setup Wizard',
      description: 'Wizard de configuración (Redundante)',
      icon: Wand2,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-900/20',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-700',
      category: 'archived',
      status: 'archived',
      badge: '📦 ARCHIVADO'
    },
    {
      id: 'direct',
      title: 'Direct Database Setup',
      description: 'Setup directo (Redundante)',
      icon: Database,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-900/20',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-700',
      category: 'archived',
      status: 'archived',
      badge: '📦 ARCHIVADO'
    },
    {
      id: 'oneclick',
      title: 'One-Click Setup',
      description: 'Setup rápido (Redundante)',
      icon: PlayCircle,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-900/20',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-700',
      category: 'archived',
      status: 'archived',
      badge: '📦 ARCHIVADO'
    },
    {
      id: 'autorun',
      title: 'Auto Setup Runner',
      description: 'Runner automático (Reemplazado por Ultimate SQL)',
      icon: Zap,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-900/20',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-700',
      category: 'archived',
      status: 'archived',
      badge: '📦 ARCHIVADO'
    },
    {
      id: 'completescript',
      title: 'Complete Setup Script',
      description: 'Script completo (Integrado en Ultimate SQL)',
      icon: FileText,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-900/20',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-700',
      category: 'archived',
      status: 'archived',
      badge: '📦 ARCHIVADO'
    },
    {
      id: 'stepbystep',
      title: 'Step-by-Step Setup',
      description: 'Setup paso a paso (Integrado en Ultimate SQL)',
      icon: ListOrdered,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-900/20',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-700',
      category: 'archived',
      status: 'archived',
      badge: '📦 ARCHIVADO'
    }
  ];

  const categories = [
    { id: 'all' as ToolCategory, name: 'Todas', icon: Grid3x3, count: tools.filter(t => t.status !== 'archived').length },
    { id: 'sql' as ToolCategory, name: 'SQL & Queries', icon: Code, count: tools.filter(t => t.category === 'sql' && t.status !== 'archived').length },
    { id: 'scripts' as ToolCategory, name: 'Scripts', icon: FileJson, count: tools.filter(t => t.category === 'scripts' && t.status !== 'archived').length },
    { id: 'verification' as ToolCategory, name: 'Verificación', icon: CheckCircle, count: tools.filter(t => t.category === 'verification' && t.status !== 'archived').length },
    { id: 'maintenance' as ToolCategory, name: 'Mantenimiento', icon: Settings, count: tools.filter(t => t.category === 'maintenance' && t.status !== 'archived').length },
    { id: 'sync' as ToolCategory, name: 'Sincronización', icon: RefreshCw, count: tools.filter(t => t.category === 'sync' && t.status !== 'archived').length },
    { id: 'archived' as ToolCategory, name: 'Archivadas', icon: Archive, count: tools.filter(t => t.status === 'archived').length }
  ];

  const filteredTools = tools.filter(tool => {
    if (activeCategory === 'all') {
      return tool.status !== 'archived';
    }
    if (activeCategory === 'archived') {
      return tool.status === 'archived';
    }
    return tool.category === activeCategory && tool.status !== 'archived';
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Herramientas de Desarrollo</h1>
        <p className="text-purple-100">Gestión avanzada de base de datos y sincronización</p>
      </div>

      {/* Tools Grid */}
      {activeView === 'none' && (
        <>
          {/* Floating Button Toggle Card */}
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-2 border-indigo-600 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-xl">
                  {floatingButtonVisible ? (
                    <Eye className="w-7 h-7 text-white" />
                  ) : (
                    <EyeOff className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Botón Flotante de DevTools
                  </h3>
                  <p className="text-sm text-indigo-200">
                    {floatingButtonVisible 
                      ? '✅ El botón flotante está visible en la esquina inferior izquierda' 
                      : '❌ El botón flotante está oculto (recomendado para producción)'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleFloatingButton}
                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors shadow-lg ${
                  floatingButtonVisible ? 'bg-green-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform shadow-md ${
                    floatingButtonVisible ? 'translate-x-11' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-indigo-700">
              <p className="text-xs text-indigo-300">
                💡 El botón flotante está <strong>oculto por defecto</strong> al cargar el sitio. 
                Actívalo aquí cuando necesites acceso rápido a las herramientas desde cualquier página.
              </p>
            </div>
          </div>

          {/* Category Filters */}
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xl font-bold text-white">Filtrar por Categoría</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                const isArchived = category.id === 'archived';
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      isActive
                        ? isArchived
                          ? 'bg-gray-900/50 border-gray-600 shadow-lg'
                          : 'bg-indigo-900/50 border-indigo-600 shadow-lg'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`w-6 h-6 ${
                        isActive
                          ? isArchived ? 'text-gray-400' : 'text-indigo-400'
                          : 'text-slate-400'
                      }`} />
                      <span className={`text-sm font-semibold ${
                        isActive
                          ? isArchived ? 'text-gray-300' : 'text-indigo-300'
                          : 'text-slate-300'
                      }`}>
                        {category.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive
                          ? isArchived ? 'bg-gray-800 text-gray-300' : 'bg-indigo-800 text-indigo-200'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {category.count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Banner for Archived */}
          {activeCategory === 'archived' && (
            <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Archive className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-yellow-300 mb-2">📦 Herramientas Archivadas</h3>
                  <p className="text-yellow-200 mb-2">
                    Estas herramientas han sido reemplazadas por el <strong>Ultimate SQL Executor</strong> que incluye 
                    todas sus funcionalidades en un solo lugar.
                  </p>
                  <p className="text-sm text-yellow-300">
                    💡 Se mantienen disponibles por compatibilidad pero se recomienda usar la herramienta principal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tools Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {activeCategory === 'all' && '🚀 Todas las Herramientas Activas'}
                {activeCategory === 'sql' && '💻 SQL & Queries'}
                {activeCategory === 'scripts' && '📜 Scripts'}
                {activeCategory === 'verification' && '✅ Verificación & Testing'}
                {activeCategory === 'maintenance' && '🛠️ Mantenimiento & Admin'}
                {activeCategory === 'sync' && '🔄 Sincronización'}
                {activeCategory === 'archived' && '🗄️ Herramientas Archivadas'}
              </h3>
              <span className="text-sm text-slate-400">
                {filteredTools.length} {filteredTools.length === 1 ? 'herramienta' : 'herramientas'}
              </span>
            </div>
            
            {filteredTools.length === 0 ? (
              <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-12 text-center">
                <p className="text-slate-400 text-lg">No hay herramientas en esta categoría</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map((tool) => {
                  const Icon = tool.icon;
                  const isArchived = tool.status === 'archived';
                  
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveView(tool.id)}
                      className={`group p-6 ${tool.bgColor} border-2 ${tool.borderColor} rounded-2xl transition-all duration-300 text-left relative ${
                        isArchived 
                          ? 'opacity-60 hover:opacity-80' 
                          : 'hover:shadow-xl hover:scale-105'
                      }`}
                    >
                      {tool.badge && (
                        <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-lg shadow-lg">
                          {tool.badge}
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className={`p-3 bg-gradient-to-br ${tool.color} rounded-xl shadow-lg ${
                          isArchived ? '' : 'group-hover:scale-110'
                        } transition-transform`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold text-lg ${tool.textColor} mb-1`}>{tool.title}</h3>
                          <p className="text-sm text-slate-400">{tool.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Tool Views */}
      {activeView !== 'none' && (
        <div className="bg-slate-800 rounded-2xl border-2 border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {tools.find(t => t.id === activeView)?.title}
            </h2>
            <button
              onClick={() => setActiveView('none')}
              className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors font-semibold"
            >
              ← Volver
            </button>
          </div>

          {activeView === 'connection' && <SupabaseConnectionTest />}
          {activeView === 'setup' && <DatabaseSetup />}
          {activeView === 'schema' && <SchemaInspector />}
          {activeView === 'sync' && <MasterDataSync />}
          {activeView === 'reset' && <DatabaseResetter />}
          {activeView === 'sql' && <SQLExecutor />}
          {activeView === 'verify' && <SQLVerification />}
          {activeView === 'wizard' && <AutoSetupWizard />}
          {activeView === 'direct' && <DirectDatabaseSetup />}
          {activeView === 'oneclick' && <OneClickSetup />}
          {activeView === 'autorun' && <AutoSetupRunner />}
          {activeView === 'verifier' && <SetupVerifier />}
          {activeView === 'completescript' && <CompleteSetupScript />}
          {activeView === 'rlskiller' && <RLSKiller />}
          {activeView === 'manualverifier' && <ManualVerifier />}
          {activeView === 'stepbystep' && <StepByStepSetup />}
          {activeView === 'ultimatesql' && <UltimateSQLExecutor />}
          {activeView === 'scriptrunner' && <ScriptRunner />}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleFloatingButton}
        className={`fixed bottom-4 right-4 p-4 bg-indigo-600 text-white rounded-full shadow-lg transition-all duration-300 hover:bg-indigo-700 ${floatingButtonVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {floatingButtonVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

// SQL Executor Component
function SQLExecutor() {
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'examples' | 'setup' | 'custom'>('examples');

  const executeSql = async () => {
    if (!sql.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { supabase } = await import('../../../lib/supabase');
      
      // Execute raw SQL
      const { data, error: sqlError } = await supabase.rpc('exec_sql', { query: sql });

      if (sqlError) throw sqlError;

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    {
      title: 'Contar cursos',
      sql: 'SELECT COUNT(*) as total FROM courses;'
    },
    {
      title: 'Top 5 cursos más populares',
      sql: 'SELECT title, students, rating FROM courses ORDER BY students DESC LIMIT 5;'
    },
    {
      title: 'Cursos por categoría',
      sql: 'SELECT category, COUNT(*) as total FROM courses GROUP BY category ORDER BY total DESC;'
    },
    {
      title: 'Estadsticas generales',
      sql: 'SELECT COUNT(*) as total_courses, AVG(price) as avg_price, SUM(students) as total_students FROM courses;'
    }
  ];

  const setupScripts = [
    {
      title: '🔧 Create exec_sql Function',
      description: '⚠️ EJECUTA ESTO PRIMERO - Crea la función necesaria para ejecutar SQL',
      category: 'setup',
      sql: `-- =====================================================
-- CREAR FUNCIÓN EXEC_SQL (REQUERIDA)
-- =====================================================
-- Esta función permite ejecutar SQL arbitrario desde la aplicación
-- NOTA: Solo funciona con Service Role Key

CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE query;
  RETURN json_build_object('success', true, 'message', 'Query executed successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Dar permisos a la función
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;`
    },
    {
      title: '📊 Activity Tracking Schema',
      description: 'Crear tablas para tracking de actividad, deadlines y progreso detallado',
      category: 'setup',
      sql: `-- =====================================================
-- ENHANCED SCHEMA FOR ACTIVITY TRACKING & PROGRESS
-- =====================================================

-- USER_PROGRESS TABLE (Detailed lesson-level tracking)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_spent INTEGER DEFAULT 0,
  
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  
  UNIQUE(user_id, lesson_id)
);

-- ACTIVITY_LOGS TABLE (Daily activity tracking)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  focus_score INTEGER CHECK (focus_score >= 0 AND focus_score <= 100),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);`
    },
    {
      title: '🔍 Create Indexes',
      description: 'Crear índices para mejorar performance de queries',
      category: 'setup',
      sql: `-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON public.user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON public.user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON public.user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_accessed ON public.user_progress(last_accessed DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
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
    {
      title: '⚡ Create Triggers',
      description: 'Crear triggers automáticos para activity logs y XP',
      category: 'setup',
      sql: `-- Function to update activity log when progress is made
CREATE OR REPLACE FUNCTION update_activity_log()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_activity_log ON public.user_progress;
CREATE TRIGGER trigger_update_activity_log
  AFTER INSERT OR UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_log();

-- Function to update user XP
CREATE OR REPLACE FUNCTION update_user_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    xp = xp + NEW.xp_earned,
    level = FLOOR((xp + NEW.xp_earned) / 1000) + 1,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_xp ON public.activity_logs;
CREATE TRIGGER trigger_update_user_xp
  AFTER INSERT OR UPDATE ON public.activity_logs
  FOR EACH ROW
  WHEN (NEW.xp_earned > 0)
  EXECUTE FUNCTION update_user_xp();

-- Function to auto-update deadline status
CREATE OR REPLACE FUNCTION update_deadline_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.due_date < NOW() AND NEW.status = 'pending' THEN
    NEW.status = 'overdue';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_deadline_status ON public.deadlines;
CREATE TRIGGER trigger_update_deadline_status
  BEFORE INSERT OR UPDATE ON public.deadlines
  FOR EACH ROW
  EXECUTE FUNCTION update_deadline_status();`
    },
    {
      title: '🔒 Enable RLS',
      description: 'Activar Row Level Security en tablas de tracking',
      category: 'setup',
      sql: `-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for user_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
CREATE POLICY "Users can view their own progress" 
  ON public.user_progress FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
CREATE POLICY "Users can insert their own progress" 
  ON public.user_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
CREATE POLICY "Users can update their own progress" 
  ON public.user_progress FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policies for activity_logs
DROP POLICY IF EXISTS "Users can view their own activity" ON public.activity_logs;
CREATE POLICY "Users can view their own activity" 
  ON public.activity_logs FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own activity" ON public.activity_logs;
CREATE POLICY "Users can insert their own activity" 
  ON public.activity_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own activity" ON public.activity_logs;
CREATE POLICY "Users can update their own activity" 
  ON public.activity_logs FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policies for deadlines
DROP POLICY IF EXISTS "Users can view their own deadlines" ON public.deadlines;
CREATE POLICY "Users can view their own deadlines" 
  ON public.deadlines FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own deadlines" ON public.deadlines;
CREATE POLICY "Users can insert their own deadlines" 
  ON public.deadlines FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own deadlines" ON public.deadlines;
CREATE POLICY "Users can update their own deadlines" 
  ON public.deadlines FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own deadlines" ON public.deadlines;
CREATE POLICY "Users can delete their own deadlines" 
  ON public.deadlines FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies for study_sessions
DROP POLICY IF EXISTS "Users can view their own study sessions" ON public.study_sessions;
CREATE POLICY "Users can view their own study sessions" 
  ON public.study_sessions FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own study sessions" ON public.study_sessions;
CREATE POLICY "Users can insert their own study sessions" 
  ON public.study_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own study sessions" ON public.study_sessions;
CREATE POLICY "Users can update their own study sessions" 
  ON public.study_sessions FOR UPDATE 
  USING (auth.uid() = user_id);`
    },
    {
      title: '📝 Sample Activity Data',
      description: 'Insertar datos de ejemplo para testing (últimos 7 días)',
      category: 'setup',
      sql: `-- Insert sample activity logs for testing
DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  SELECT id INTO sample_user_id FROM profiles LIMIT 1;
  
  IF sample_user_id IS NOT NULL THEN
    -- Insert activity for last 7 days
    INSERT INTO activity_logs (user_id, date, study_time, xp_earned, lessons_completed, exercises_completed)
    VALUES
      (sample_user_id, CURRENT_DATE - INTERVAL '6 days', 150, 150, 3, 2),
      (sample_user_id, CURRENT_DATE - INTERVAL '5 days', 120, 120, 2, 1),
      (sample_user_id, CURRENT_DATE - INTERVAL '4 days', 180, 200, 4, 3),
      (sample_user_id, CURRENT_DATE - INTERVAL '3 days', 140, 150, 3, 2),
      (sample_user_id, CURRENT_DATE - INTERVAL '2 days', 160, 180, 3, 2),
      (sample_user_id, CURRENT_DATE - INTERVAL '1 day', 220, 250, 5, 4),
      (sample_user_id, CURRENT_DATE, 95, 100, 2, 1)
    ON CONFLICT (user_id, date) DO UPDATE
    SET 
      study_time = EXCLUDED.study_time,
      xp_earned = EXCLUDED.xp_earned,
      lessons_completed = EXCLUDED.lessons_completed,
      exercises_completed = EXCLUDED.exercises_completed;
  END IF;
END $$;`
    },
    {
      title: '⏰ Sample Deadlines',
      description: 'Insertar deadlines de ejemplo para testing',
      category: 'setup',
      sql: `-- Insert sample deadlines
DO $$
DECLARE
  sample_user_id UUID;
  sample_course_id UUID;
BEGIN
  SELECT id INTO sample_user_id FROM profiles LIMIT 1;
  SELECT id INTO sample_course_id FROM courses WHERE status = 'published' LIMIT 1;
  
  IF sample_user_id IS NOT NULL THEN
    INSERT INTO deadlines (user_id, course_id, title, description, type, due_date, status, priority)
    VALUES
      (sample_user_id, sample_course_id, 'Proyecto Final - Curso React', 'Completar la aplicación de e-commerce', 'project', CURRENT_DATE + INTERVAL '3 days', 'pending', 'high'),
      (sample_user_id, sample_course_id, 'Quiz: Hooks Avanzados', 'Evaluación sobre hooks', 'quiz', CURRENT_DATE + INTERVAL '5 days', 'pending', 'medium'),
      (sample_user_id, sample_course_id, 'Examen Final del Módulo', 'Examen comprehensivo', 'exam', CURRENT_DATE + INTERVAL '7 days', 'pending', 'high'),
      (sample_user_id, NULL, 'Código de Práctica Diaria', 'Completar 5 ejercicios', 'assignment', CURRENT_DATE + INTERVAL '10 days', 'pending', 'low'),
      (sample_user_id, sample_course_id, 'Presentación de Proyecto', 'Presentar proyecto final', 'milestone', CURRENT_DATE + INTERVAL '14 days', 'pending', 'urgent')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <CircleX className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-300">⚠️ Advertencia</p>
            <p className="text-sm text-yellow-200">Esta herramienta ejecuta SQL directamente. Úsala con precaución.</p>
          </div>
        </div>
      </div>

      {/* Category Selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActiveCategory('examples')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeCategory === 'examples' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          }`}
        >
          Ejemplos
        </button>
        <button
          onClick={() => setActiveCategory('setup')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeCategory === 'setup' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          }`}
        >
          Configuración
        </button>
        <button
          onClick={() => setActiveCategory('custom')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeCategory === 'custom' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          }`}
        >
          Personalizado
        </button>
      </div>

      {/* Examples */}
      {activeCategory === 'examples' && (
        <div>
          <h3 className="font-bold text-white mb-3">Ejemplos rápidos:</h3>
          <div className="grid grid-cols-2 gap-3">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setSql(example.sql)}
                className="p-3 text-left bg-slate-700 border-2 border-slate-600 rounded-lg hover:bg-indigo-900/30 hover:border-indigo-500 transition-colors"
              >
                <p className="font-semibold text-sm text-white">{example.title}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">{example.sql}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Setup Scripts */}
      {activeCategory === 'setup' && (
        <div>
          <h3 className="font-bold text-white mb-3">Scripts de Configuración:</h3>
          <div className="grid grid-cols-2 gap-3">
            {setupScripts.map((script, index) => (
              <button
                key={index}
                onClick={() => setSql(script.sql)}
                className="p-3 text-left bg-slate-700 border-2 border-slate-600 rounded-lg hover:bg-indigo-900/30 hover:border-indigo-500 transition-colors"
              >
                <p className="font-semibold text-sm text-white">{script.title}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">{script.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SQL Editor - Always visible */}
      <div>
        <label className="block font-semibold text-white mb-2">Consulta SQL:</label>
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 text-green-300 rounded-lg focus:border-indigo-500 focus:outline-none font-mono text-sm"
          rows={activeCategory === 'custom' ? 12 : 8}
          placeholder="SELECT * FROM courses LIMIT 10;"
        />
      </div>

      {/* Execute Button */}
      <button
        onClick={executeSql}
        disabled={loading || !sql.trim()}
        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
        Ejecutar SQL
      </button>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border-2 border-red-600 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CircleX className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Error al ejecutar SQL</p>
              <p className="text-sm text-red-200 mt-1 font-mono">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-slate-700 border-2 border-green-600 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h3 className="font-bold text-green-300 text-lg">Resultado</h3>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs font-mono text-green-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}