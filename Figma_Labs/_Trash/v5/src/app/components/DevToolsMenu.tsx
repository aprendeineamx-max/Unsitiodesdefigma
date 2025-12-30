import { useState, useEffect } from 'react';
import { Wrench, Database, Upload, X, Settings, Zap, Eye, Trash2, EyeOff, LayoutDashboard, ChevronRight } from 'lucide-react';
import { SupabaseConnectionTest } from './SupabaseConnectionTest';
import { SupabaseDataInserter } from './SupabaseDataInserterV2';
import { DatabaseSetup } from './DatabaseSetup';
import { MasterDataSync } from './MasterDataSync';
import { SchemaInspector } from './SchemaInspector';
import { DatabaseResetter } from './DatabaseResetter';

type ToolType = 'none' | 'connection' | 'inserter' | 'dbsetup' | 'mastersync' | 'schema' | 'reset' | 'settings';

interface ToolWrapperProps {
  onClose: () => void;
  children: React.ReactNode;
}

function ToolWrapper({ onClose, children }: ToolWrapperProps) {
  return (
    <div className="relative">
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
        title="Cerrar"
      >
        <X className="w-5 h-5" />
      </button>
      {children}
    </div>
  );
}

// Settings Panel Component
function DevToolsSettings({ onClose }: { onClose: () => void }) {
  const [showButton, setShowButton] = useState(() => {
    const saved = localStorage.getItem('devtools-button-visible');
    return saved === 'true';
  });

  const toggleButtonVisibility = () => {
    const newValue = !showButton;
    setShowButton(newValue);
    localStorage.setItem('devtools-button-visible', newValue.toString());
    // Dispatch custom event to notify DevToolsMenu
    window.dispatchEvent(new CustomEvent('devtools-visibility-changed', { detail: newValue }));
  };

  return (
    <div className="bg-slate-800 rounded-2xl shadow-2xl border-2 border-purple-600 p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
            <Settings className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Configuración DevTools</h2>
            <p className="text-sm text-slate-300">Personaliza las herramientas</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Toggle Button Visibility */}
        <div className="bg-slate-700 rounded-xl p-4 border-2 border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {showButton ? (
                <Eye className="w-5 h-5 text-purple-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <h3 className="font-bold text-white">Botón Flotante</h3>
                <p className="text-xs text-slate-400">Mostrar el botón de DevTools en el sitio</p>
              </div>
            </div>
            <button
              onClick={toggleButtonVisibility}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showButton ? 'bg-purple-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showButton ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {showButton 
              ? '✅ El botón flotante está visible' 
              : '❌ El botón flotante está oculto (Accede vía Admin Panel)'}
          </p>
        </div>

        {/* Info */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4">
          <h4 className="font-bold text-blue-300 mb-2">💡 Información</h4>
          <ul className="text-xs text-blue-200 space-y-1">
            <li>• El botón está <strong>oculto por defecto</strong> al cargar el sitio</li>
            <li>• Puedes activarlo desde el Admin Panel → DevTools</li>
            <li>• La configuración se guarda en localStorage</li>
            <li>• Útil para mantener el sitio limpio en producción</li>
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export function DevToolsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolType>('none');
  const [isButtonVisible, setIsButtonVisible] = useState(false);

  // Load button visibility from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('devtools-button-visible');
    // Default is FALSE (hidden) if not set
    setIsButtonVisible(saved === 'true');

    // Listen for visibility changes
    const handleVisibilityChange = (event: CustomEvent) => {
      setIsButtonVisible(event.detail);
    };

    window.addEventListener('devtools-visibility-changed', handleVisibilityChange as EventListener);

    return () => {
      window.removeEventListener('devtools-visibility-changed', handleVisibilityChange as EventListener);
    };
  }, []);

  const openTool = (tool: ToolType) => {
    setActiveTool(tool);
    setIsOpen(false);
  };

  const closeTool = () => {
    setActiveTool('none');
  };

  // Don't render if button is not visible
  if (!isButtonVisible) {
    return null;
  }

  return (
    <>
      {/* Floating Tools Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110"
          title="Herramientas de Desarrollo"
        >
          <Wrench className="w-6 h-6" />
          
          {/* Pulse effect */}
          <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20"></span>
          
          {/* Badge */}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
            7
          </span>
        </button>

        {/* Tools Menu */}
        {isOpen && (
          <div className="absolute bottom-full left-0 mb-3 bg-slate-800 rounded-xl shadow-2xl border-2 border-purple-500 p-3 w-[90vw] max-w-[380px] max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sticky top-0 bg-slate-800 pb-2 border-b border-slate-700 z-10">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-purple-400" />
                Dev Tools
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {/* Settings */}
              <button
                onClick={() => openTool('settings')}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-purple-900/30 transition-colors text-left group"
              >
                <div className="p-2 bg-purple-900/30 rounded-lg group-hover:bg-purple-800/40 transition-colors flex-shrink-0">
                  <Settings className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">
                    Configuración
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    Mostrar/Ocultar botón flotante
                  </p>
                </div>
              </button>

              {/* Supabase Connection Test */}
              <button
                onClick={() => openTool('connection')}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-purple-900/20 transition-colors text-left group"
              >
                <div className="p-2 bg-purple-900/30 rounded-lg group-hover:bg-purple-800/40 transition-colors flex-shrink-0">
                  <Database className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">
                    Connection Test
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    Verificar conexión a Supabase
                  </p>
                </div>
              </button>

              {/* Database Setup */}
              <button
                onClick={() => openTool('dbsetup')}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-emerald-900/20 transition-colors text-left group"
              >
                <div className="p-2 bg-emerald-900/30 rounded-lg group-hover:bg-emerald-800/40 transition-colors flex-shrink-0">
                  <Settings className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">
                    Database Setup
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    Crear 17 tablas en Supabase
                  </p>
                </div>
              </button>

              {/* Master Data Sync */}
              <button
                onClick={() => openTool('mastersync')}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-cyan-900/20 transition-colors text-left group"
              >
                <div className="p-2 bg-cyan-900/30 rounded-lg group-hover:bg-cyan-800/40 transition-colors flex-shrink-0">
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">
                    Master Data Sync
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    Sincronizar TODOS los datos
                  </p>
                </div>
              </button>

              {/* Schema Inspector */}
              <button
                onClick={() => openTool('schema')}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-green-900/20 transition-colors text-left group"
              >
                <div className="p-2 bg-green-900/30 rounded-lg group-hover:bg-green-800/40 transition-colors flex-shrink-0">
                  <Eye className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">
                    Schema Inspector
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    Ver estructura de tablas SQL
                  </p>
                </div>
              </button>

              {/* Data Inserter (Legacy) */}
              <button
                onClick={() => openTool('inserter')}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-blue-900/20 transition-colors text-left group"
              >
                <div className="p-2 bg-blue-900/30 rounded-lg group-hover:bg-blue-800/40 transition-colors flex-shrink-0">
                  <Upload className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">
                    Insert Data (Legacy)
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    Insertar solo cursos básicos
                  </p>
                </div>
              </button>

              {/* Database Resetter */}
              <button
                onClick={() => openTool('reset')}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-red-900/20 transition-colors text-left group"
              >
                <div className="p-2 bg-red-900/30 rounded-lg group-hover:bg-red-800/40 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">
                    Reset Database
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    Eliminar todas las tablas
                  </p>
                </div>
              </button>

              {/* Divider */}
              <div className="border-t border-slate-700 my-3"></div>

              {/* Admin Dashboard - Quick Access at BOTTOM */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Dispatch custom navigation event
                  window.dispatchEvent(new CustomEvent('navigate-to-admin'));
                }}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-2 border-indigo-600 hover:from-indigo-900/60 hover:to-purple-900/60 hover:border-indigo-500 transition-all text-left group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-500 transition-colors flex-shrink-0">
                    <LayoutDashboard className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm flex items-center gap-2">
                      Admin Dashboard
                      <span className="text-xs px-1.5 py-0.5 bg-indigo-600 rounded text-indigo-100">Directo</span>
                    </p>
                    <p className="text-xs text-indigo-300 truncate">
                      Panel de administración completo
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-400 text-center">
                🛠️ Herramientas solo para desarrollo (7 tools)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Active Tool Modals */}
      {activeTool === 'settings' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <ToolWrapper onClose={closeTool}>
            <DevToolsSettings onClose={closeTool} />
          </ToolWrapper>
        </div>
      )}

      {activeTool === 'connection' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <ToolWrapper onClose={closeTool}>
            <SupabaseConnectionTest />
          </ToolWrapper>
        </div>
      )}

      {activeTool === 'dbsetup' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-auto">
          <ToolWrapper onClose={closeTool}>
            <DatabaseSetup />
          </ToolWrapper>
        </div>
      )}

      {activeTool === 'mastersync' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <ToolWrapper onClose={closeTool}>
            <MasterDataSync />
          </ToolWrapper>
        </div>
      )}

      {activeTool === 'schema' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-auto">
          <ToolWrapper onClose={closeTool}>
            <SchemaInspector />
          </ToolWrapper>
        </div>
      )}

      {activeTool === 'inserter' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <ToolWrapper onClose={closeTool}>
            <SupabaseDataInserter />
          </ToolWrapper>
        </div>
      )}

      {activeTool === 'reset' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <ToolWrapper onClose={closeTool}>
            <DatabaseResetter />
          </ToolWrapper>
        </div>
      )}
    </>
  );
}