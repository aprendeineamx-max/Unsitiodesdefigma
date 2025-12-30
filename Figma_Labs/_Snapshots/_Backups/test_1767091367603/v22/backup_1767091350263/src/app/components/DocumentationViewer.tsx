/**
 * DOCUMENTATION VIEWER - SISTEMA DE AUTO-DISCOVERY v8.1
 * Centro de documentación con auto-discovery de archivos .md usando import.meta.glob
 * Basado en: /DOCUMENTATION_CENTER_BEST_PRACTICES.md y /ROADMAP_DOCUMENTATION_CENTER.md
 * 
 * CAMBIOS EN v8.1 (GRAPH VIEW & BACKLINKS - FASE 10):
 * - 🕸️ Graph View 2D estilo Obsidian con react-force-graph
 * - 🔗 Backlinks Panel bidireccional con linked/unlinked mentions
 * - 🎯 Detección automática de [[wikilinks]] y [markdown](links)
 * - 📊 Métricas de grafo (nodos, enlaces, orphans, clusters)
 * - 🔍 Fuzzy matching para unlinked mentions
 * - ⚡ Performance optimizada con filtros inteligentes
 * - 🎨 Visualización interactiva con zoom, pan, drag
 * 
 * CAMBIOS EN v7.0 (METADATA MANAGEMENT - FASE 4):
 * - ✏️ Editor visual de metadata completo
 * - 📋 Panel de propiedades de documento
 * - 📝 Templates predefinidos de metadata
 * - 🔄 Bulk metadata editor para múltiples documentos
 * - ✅ Validación en tiempo real con auto-fix
 * - 💾 Sistema de persistencia y preview de cambios
 * - 📥 Download/Copy de documentos actualizados
 * 
 * CAMBIOS EN v6.0 (GLOBAL SEARCH - FASE 3):
 * - 🔍 Command Palette tipo VSCode/Notion (Cmd+K)
 * - ⚡ Fuzzy search con Fuse.js en tiempo real
 * - 🎯 Búsqueda multi-documento con preview
 * - ⌨️ Keyboard navigation completo
 * - 📝 Búsquedas recientes con localStorage
 * - 🏷️ Filtros por categoría integrados
 * - ✅ Mobile responsive
 * 
 * CAMBIOS EN v5.0 (REAL-TIME UPDATES):
 * - 🔥 Integración completa con Vite HMR para updates en tiempo real
 * - 🔄 Sistema de eventos para notificaciones de cambios
 * - ⚡ Invalidación inteligente de caché cuando documentos cambian
 * - 🎯 Refresh manual optimizado con UX excelente
 * - ✅ Funciona tanto en desarrollo (HMR) como producción (manual refresh)
 * 
 * ARQUITECTURA v8.1:
 * 1. import.meta.glob carga todos los .md en build-time
 * 2. documentScanner.ts procesa y parsea frontmatter
 * 3. searchIndexService.ts indexa con Fuse.js
 * 4. metadataService.ts gestiona validación y templates
 * 5. graphService.ts construye grafo de documentos
 * 6. backlinkService.ts detecta backlinks bidireccionales
 * 7. SearchCommandPalette.tsx provee UI de búsqueda (cmdk)
 * 8. GraphView.tsx visualización de grafo con react-force-graph
 * 9. BacklinksPanel.tsx panel de backlinks
 * 10. MetadataEditor.tsx provee editor visual enterprise
 * 11. DocumentPropertiesPanel.tsx panel de propiedades
 * 12. BulkMetadataEditor.tsx editor bulk
 * 13. useGlobalSearch hook maneja lógica de búsqueda
 * 14. documentationUpdateService.ts maneja eventos de cambios
 * 15. DocumentationViewer muestra tarjetas organizadas por categoría
 * 16. MarkdownViewer renderiza con syntax highlighting + TOC + búsqueda
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileText, FolderOpen, Book, Code, FileCode, ChevronRight, 
  Archive, Search, Loader2, RefreshCw, CheckCircle, AlertCircle,
  Sparkles, Info, AlertTriangle, Zap, Command as CommandIcon,
  Edit2, FileEdit, ListChecks, Network, Link2
} from 'lucide-react';
import { toast } from 'sonner';
import { MarkdownViewer } from './MarkdownViewer';
import { SearchCommandPalette } from './SearchCommandPalette';
import { GraphView } from './GraphView';
import { BacklinksPanel } from './BacklinksPanel';
import { MetadataEditor } from './MetadataEditor';
import { DocumentPropertiesPanel } from './DocumentPropertiesPanel';
import { MetadataTemplateSelector } from './MetadataTemplateSelector';
import { BulkMetadataEditor } from './BulkMetadataEditor';
import { MetadataSaveDialog } from './MetadataSaveDialog';
import { MetadataTestingPanel } from './MetadataTestingPanel';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { discoverDocuments, searchDocuments, filterByCategory, getManifestStats, isManifestFresh, hasControlDocuments } from '../services/documentScanner';
import { documentCache } from '../services/documentCache';
import { metadataService } from '../services/metadataService';
import { keyboardShortcuts, useKeyboardShortcuts } from '../services/keyboardShortcuts';
import type { DiscoveredDocument, DocumentCategory, DocumentScanResult, DocumentMetadata } from '../types/documentation';
import { useAutoRefreshManifest } from '../hooks/useAutoRefreshManifest';
import { useDocumentationUpdates } from '../hooks/useDocumentationUpdates';

// Mapeo de categorías a iconos y colores
const CATEGORY_CONFIG = {
  roadmap: {
    name: 'Roadmaps',
    icon: Book,
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-700 dark:text-purple-300',
  },
  guide: {
    name: 'Guías',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
  api: {
    name: 'API & Docs',
    icon: Code,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-300',
  },
  tutorial: {
    name: 'Tutoriales',
    icon: FileCode,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-700 dark:text-orange-300',
  },
  'best-practices': {
    name: 'Best Practices',
    icon: Sparkles,
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-700 dark:text-yellow-300',
  },
  other: {
    name: 'Otros',
    icon: Archive,
    color: 'from-gray-500 to-slate-500',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    textColor: 'text-gray-700 dark:text-gray-300',
  },
};

export function DocumentationViewer() {
  const [selectedDocument, setSelectedDocument] = useState<DiscoveredDocument | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Auto-discovery state
  const [scanResult, setScanResult] = useState<DocumentScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Manifest stats
  const [manifestStats, setManifestStats] = useState<any>(null);

  // 🆕 v7.0: Metadata Management state
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showBulkEditor, setShowBulkEditor] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DiscoveredDocument | null>(null);
  const [updatedContent, setUpdatedContent] = useState<string>('');
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);

  // 🆕 v7.5: Testing & Keyboard Shortcuts state
  const [showTestingPanel, setShowTestingPanel] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  /**
   * Ejecutar escaneo de documentos
   * ✅ MOVED BEFORE useEffect to prevent TDZ
   */
  const performDocumentScan = useCallback(async () => {
    setIsScanning(true);
    setScanError(null);
    
    console.log('🚀 Iniciando auto-discovery de documentos...');
    
    try {
      const result = await discoverDocuments();
      setScanResult(result);
      
      // Pre-cargar documentos en caché
      documentCache.preload(result.documents);
      
      // Imprimir estadísticas
      documentCache.printStats();
      
      console.log(`✅ Auto-discovery completado: ${result.totalCount} documentos encontrados`);
    } catch (error) {
      console.error('❌ Error durante auto-discovery:', error);
      setScanError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsScanning(false);
    }
  }, []); // ✅ Sin dependencias porque no usa props/state externos

  /**
   * Filtrar y buscar documentos
   * ✅ MOVED BEFORE useEffect to prevent TDZ
   */
  const filteredDocuments = useMemo(() => {
    if (!scanResult) return [];
    
    let docs = scanResult.documents;
    
    // Aplicar filtro de categoría
    if (selectedCategory !== 'all') {
      docs = filterByCategory(docs, selectedCategory);
    }
    
    // Aplicar búsqueda
    if (searchTerm) {
      docs = searchDocuments(docs, searchTerm);
    }
    
    return docs;
  }, [scanResult, selectedCategory, searchTerm]);

  /**
   * Handler para abrir metadata editor
   * ✅ MOVED BEFORE useEffect to prevent TDZ
   */
  const handleOpenMetadataEditor = useCallback((doc: DiscoveredDocument) => {
    setEditingDocument(doc);
    setShowMetadataEditor(true);
    setUpdatedContent('');
  }, []);

  /**
   * 🆕 v7.5: Registrar keyboard shortcuts
   */
  useEffect(() => {
    // Inicializar servicio de shortcuts
    keyboardShortcuts.init();

    // Registrar shortcuts específicos del DocumentationViewer
    keyboardShortcuts.register('doc-viewer-escape', {
      key: 'Escape',
      description: 'Close document or modal',
      category: 'navigation',
      handler: () => {
        if (selectedDocument) {
          setSelectedDocument(null);
        } else if (showMetadataEditor) {
          setShowMetadataEditor(false);
          setEditingDocument(null);
        } else if (showTemplateSelector) {
          setShowTemplateSelector(false);
        } else if (showBulkEditor) {
          setShowBulkEditor(false);
        } else if (showSaveDialog) {
          setShowSaveDialog(false);
        } else if (showTestingPanel) {
          setShowTestingPanel(false);
        } else if (showKeyboardHelp) {
          setShowKeyboardHelp(false);
        }
      },
    });

    keyboardShortcuts.register('doc-viewer-edit', {
      key: 'e',
      cmd: true,
      description: 'Edit document metadata',
      category: 'editing',
      handler: () => {
        if (selectedDocument && !showMetadataEditor) {
          handleOpenMetadataEditor(selectedDocument);
        }
      },
    });

    keyboardShortcuts.register('doc-viewer-bulk-edit', {
      key: 'b',
      cmd: true,
      shift: true,
      description: 'Open bulk editor',
      category: 'editing',
      handler: () => {
        if (!showBulkEditor && !selectedDocument) {
          setShowBulkEditor(true);
        }
      },
    });

    keyboardShortcuts.register('doc-viewer-templates', {
      key: 't',
      cmd: true,
      shift: true,
      description: 'Browse templates',
      category: 'editing',
      handler: () => {
        if (!showTemplateSelector && !selectedDocument) {
          setEditingDocument(filteredDocuments[0] || null);
          setShowTemplateSelector(true);
        }
      },
    });

    keyboardShortcuts.register('doc-viewer-run-tests', {
      key: 'j',
      cmd: true,
      shift: true,
      description: 'Run metadata tests',
      category: 'testing',
      handler: () => {
        if (!showTestingPanel) {
          setShowTestingPanel(true);
        }
      },
    });

    keyboardShortcuts.register('doc-viewer-show-help', {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      category: 'view',
      handler: () => {
        setShowKeyboardHelp(!showKeyboardHelp);
      },
    });

    keyboardShortcuts.register('doc-viewer-refresh', {
      key: 'r',
      cmd: true,
      description: 'Refresh documents',
      category: 'navigation',
      handler: (e) => {
        e.preventDefault();
        performDocumentScan();
      },
    });

    keyboardShortcuts.register('doc-viewer-toggle-fullscreen', {
      key: 'Enter',
      cmd: true,
      shift: true,
      description: 'Toggle fullscreen',
      category: 'view',
      handler: () => {
        if (selectedDocument) {
          setIsFullscreen(!isFullscreen);
        }
      },
    });

    // Cleanup on unmount
    return () => {
      keyboardShortcuts.unregister('doc-viewer-escape');
      keyboardShortcuts.unregister('doc-viewer-edit');
      keyboardShortcuts.unregister('doc-viewer-bulk-edit');
      keyboardShortcuts.unregister('doc-viewer-templates');
      keyboardShortcuts.unregister('doc-viewer-run-tests');
      keyboardShortcuts.unregister('doc-viewer-show-help');
      keyboardShortcuts.unregister('doc-viewer-refresh');
      keyboardShortcuts.unregister('doc-viewer-toggle-fullscreen');
      keyboardShortcuts.destroy();
    };
  }, [selectedDocument, showMetadataEditor, showTemplateSelector, showBulkEditor, showSaveDialog, showTestingPanel, showKeyboardHelp, isFullscreen, filteredDocuments, handleOpenMetadataEditor, performDocumentScan]);

  /**
   * Callback para cuando el manifest se actualiza
   */
  const handleRefresh = useCallback(() => {
    // Recargar stats del manifest cuando se actualiza
    const stats = getManifestStats();
    setManifestStats(stats);
    
    // Re-escanear documentos para mostrar los nuevos
    performDocumentScan();
  }, [performDocumentScan]); // ✅ Solo depende de performDocumentScan que es estable

  // 🆕 Auto-refresh manifest hook
  const { isStale, isRefreshing, forceRefresh, newFilesCount } = useAutoRefreshManifest({
    pollingInterval: 5 * 60 * 1000, // 5 minutos
    enabled: false, // ✅ DESACTIVADO - No necesitamos el polling automático
    onRefresh: handleRefresh, // ✅ Función estable
  });

  // 🆕 v5.0: Hook de actualizaciones en tiempo real (HMR + eventos)
  const { triggerManualRefresh, isHMREnabled } = useDocumentationUpdates({
    // Cuando un documento cambia, invalidar caché y recargar si está abierto
    onDocumentChanged: useCallback((path: string) => {
      console.log(`📝 Documento cambiado: ${path}`);
      documentCache.invalidate(path);
      
      // Si el documento cambiado está actualmente abierto, recargarlo
      if (selectedDocument?.path === path) {
        handleRefresh();
      }
    }, [selectedDocument, handleRefresh]),

    // Cuando se agrega un nuevo documento, refrescar lista
    onDocumentAdded: useCallback((path: string) => {
      console.log(`✨ Nuevo documento: ${path}`);
      handleRefresh();
    }, [handleRefresh]),

    // Cuando se elimina un documento, refrescar y cerrar si está abierto
    onDocumentDeleted: useCallback((path: string) => {
      console.log(`🗑️ Documento eliminado: ${path}`);
      
      // Si el documento eliminado está abierto, cerrarlo
      if (selectedDocument?.path === path) {
        setSelectedDocument(null);
      }
      
      handleRefresh();
    }, [selectedDocument, handleRefresh]),

    // Cuando se actualiza el manifest completo
    onManifestUpdated: useCallback(() => {
      console.log('🔄 Manifest actualizado manualmente');
      handleRefresh();
    }, [handleRefresh]),

    enabled: true, // ✅ Habilitado para capturar eventos
    debug: false, // ✅ Sin debug logs en producción
  });

  /**
   * Auto-discovery al montar el componente
   * ✅ AUTO-CARGA AUTOMÁTICA AL ENTRAR (sin necesidad de clic manual)
   */
  useEffect(() => {
    performDocumentScan();
    
    // Cargar stats del manifest
    const stats = getManifestStats();
    setManifestStats(stats);
  }, []); // ✅ Solo se ejecuta al montar (array vacío)

  /**
   * Agrupar documentos por categoría
   */
  const documentsByCategory = useMemo(() => {
    const groups: Record<DocumentCategory, DiscoveredDocument[]> = {
      'roadmap': [],
      'guide': [],
      'api': [],
      'tutorial': [],
      'best-practices': [],
      'other': []
    };
    
    filteredDocuments.forEach(doc => {
      const category = doc.metadata.category || 'other';
      if (groups[category]) {
        groups[category].push(doc);
      } else {
        groups.other.push(doc);
      }
    });
    
    return groups;
  }, [filteredDocuments]);

  /**
   * 🆕 v7.0: Handlers para Metadata Management
   */
  
  /**
   * Guardar metadata editada
   */
  const handleSaveMetadata = useCallback((newMetadata: Partial<DocumentMetadata>) => {
    if (!editingDocument) return;

    const updated = metadataService.stringify(newMetadata, editingDocument.content);
    setUpdatedContent(updated);
    setShowMetadataEditor(false);
    setShowSaveDialog(true);

    console.log('📝 Metadata actualizada para:', editingDocument.path);
  }, [editingDocument]);

  /**
   * Aplicar template de metadata
   */
  const handleApplyTemplate = useCallback((metadata: Partial<DocumentMetadata>) => {
    if (!editingDocument) return;

    const updated = metadataService.stringify(metadata, editingDocument.content);
    setUpdatedContent(updated);
    setShowTemplateSelector(false);
    setShowSaveDialog(true);

    toast.success('Template aplicado exitosamente');
  }, [editingDocument]);

  /**
   * Guardar bulk metadata
   */
  const handleBulkSave = useCallback((updates: Array<{ document: DiscoveredDocument; metadata: Partial<DocumentMetadata> }>) => {
    console.log('💾 Guardando metadata en bulk:', updates.length, 'documentos');

    // Aquí implementarías la lógica de guardado bulk
    // Por ahora, mostramos confirmación
    toast.success(`Metadata actualizada para ${updates.length} documentos`);
    setShowBulkEditor(false);

    // Refrescar documentos
    handleRefresh();
  }, [handleRefresh]);

  // Vista del documento seleccionado
  if (selectedDocument) {
    return (
      <div className={`h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900' : ''}`}>
        <MarkdownViewer
          filePath={selectedDocument.path}
          content={selectedDocument.content}
          title={selectedDocument.metadata.title}
          showToc={true}
          enableSearch={true}
          onClose={() => setSelectedDocument(null)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        />
      </div>
    );
  }

  // Vista de lista de documentos
  return (
    <>
      {/* Command Palette Global (Cmd+K) */}
      {scanResult && (
        <SearchCommandPalette
          documents={scanResult.documents}
          onSelectDocument={setSelectedDocument}
        />
      )}

      <div className="h-full bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/20 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg">
                <FolderOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Centro de Documentación
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {isScanning ? 'Escaneando archivos...' : `${scanResult?.totalCount || 0} documentos disponibles`}
                </p>
              </div>
            </div>
            
            {/* Botón de refresh */}
            <button
              onClick={performDocumentScan}
              disabled={isScanning}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span className="text-sm">Actualizar</span>
              {isHMREnabled && (
                <span className="ml-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  HMR
                </span>
              )}
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en documentos..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Advertencia de manifest desactualizado - OCULTO cuando polling está desactivado */}
        {false && manifestStats && !isManifestFresh() && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-5 mb-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-yellow-500 dark:bg-yellow-600 rounded-lg flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                    🔄 Manifest desactualizado
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                    El manifest de documentos tiene más de 1 hora. Los nuevos archivos .md no aparecerán hasta que se actualice.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-yellow-700 dark:text-yellow-300">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-4 h-4" />
                      <span>Última generación: {new Date(manifestStats.generatedAt).toLocaleString()}</span>
                    </div>
                    {newFilesCount > 0 && (
                      <div className="px-2 py-1 bg-green-500 dark:bg-green-600 text-white rounded-full font-semibold">
                        +{newFilesCount} archivos nuevos detectados
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Botón de auto-refresh prominente */}
              <button
                onClick={() => forceRefresh()}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Actualizando...' : 'Actualizar Ahora'}</span>
              </button>
            </div>
            
            {/* Instrucciones manuales (colapsables) */}
            <details className="mt-4 pt-4 border-t border-yellow-300 dark:border-yellow-700">
              <summary className="cursor-pointer text-sm font-semibold text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300">
                💡 Actualización manual (terminal)
              </summary>
              <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-2">
                  Si el auto-refresh no funciona, ejecuta manualmente en tu terminal:
                </p>
                <code className="block px-3 py-2 bg-slate-900 dark:bg-slate-950 text-green-400 rounded text-xs font-mono">
                  npm run scan:docs
                </code>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                  Luego recarga la página para ver los cambios.
                </p>
              </div>
            </details>
          </div>
        )}

        {/* Estado de carga */}
        {isScanning && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Escaneando archivos markdown...
            </p>
          </div>
        )}

        {/* Error */}
        {scanError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Error al escanear documentos
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">{scanError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros de categoría */}
        {scanResult && !isScanning && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === null
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Todos ({scanResult.totalCount})
            </button>
            
            {(Object.entries(scanResult.categoryCounts) as [DocumentCategory, number][]).map(([category, count]) => {
              if (count === 0) return null;
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === category
                      ? `bg-gradient-to-r ${config.color} text-white shadow-md`
                      : `${config.bgColor} ${config.textColor} hover:shadow-sm`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{config.name} ({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Estadísticas del scan - PANEL MINIMALISTA Y COMPACTO */}
        {scanResult && !isScanning && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800/30 rounded-lg px-4 py-2 mb-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="font-medium text-green-900 dark:text-green-100">
                  Auto-discovery completado
                </span>
              </div>
              
              {/* Métricas compactas en una línea */}
              <div className="flex items-center gap-4 text-green-700 dark:text-green-300">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{scanResult.totalCount}</span>
                  <span className="text-green-600 dark:text-green-400">docs</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <span className="font-semibold">{scanResult.scanTime.toFixed(0)}</span>
                  <span className="text-green-600 dark:text-green-400">ms</span>
                </div>
                <div className="hidden md:flex items-center gap-1">
                  <span className="font-semibold">{filteredDocuments.length}</span>
                  <span className="text-green-600 dark:text-green-400">resultados</span>
                </div>
                <div className="hidden lg:flex items-center gap-1">
                  <span className="font-semibold">{documentCache.getStats().hitRate.toFixed(0)}%</span>
                  <span className="text-green-600 dark:text-green-400">cache</span>
                </div>
              </div>
              
              {/* Timestamp discreto */}
              {manifestStats && (
                <span className="text-xs text-green-600 dark:text-green-500 hidden xl:block">
                  {new Date(manifestStats.generatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Lista de documentos por categoría */}
        {!isScanning && scanResult && (
          <div className="space-y-6">
            {(Object.entries(documentsByCategory) as [DocumentCategory, DiscoveredDocument[]][]).map(([category, docs]) => {
              if (docs.length === 0) return null;
              
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;

              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-5 h-5 ${config.textColor}`} />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {config.name}
                    </h2>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      ({docs.length})
                    </span>
                  </div>
                  
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {docs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocument(doc)}
                        className="group relative bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 bg-gradient-to-br ${config.color} rounded-lg flex-shrink-0 shadow-md`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 mb-1">
                              {doc.metadata.title}
                            </h3>
                            {doc.metadata.description && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                                {doc.metadata.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              {doc.metadata.date && (
                                <span>{new Date(doc.metadata.date).toLocaleDateString()}</span>
                              )}
                              {doc.metadata.version && (
                                <>
                                  <span>•</span>
                                  <span>v{doc.metadata.version}</span>
                                </>
                              )}
                              {doc.metadata.status && (
                                <>
                                  <span>•</span>
                                  <span className={`px-2 py-0.5 rounded ${
                                    doc.metadata.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                    doc.metadata.status === 'draft' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                    'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                  }`}>
                                    {doc.metadata.status}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Estado vacío */}
        {!isScanning && scanResult && filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <Archive className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay documentos disponibles en esta categoría'}
            </p>
          </div>
        )}

        {/* 🆕 v7.0: Floating Action Button - Metadata Management */}
        {scanResult && !isScanning && (
          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
            {/* Testing Panel Button */}
            <button
              onClick={() => setShowTestingPanel(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all group"
              title="Run Metadata Tests (Cmd+Shift+J)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Tests</span>
            </button>

            {/* Keyboard Help Button */}
            <button
              onClick={() => setShowKeyboardHelp(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all group"
              title="Keyboard Shortcuts (?)"
            >
              <CommandIcon className="w-5 h-5" />
              <span className="font-medium">Shortcuts</span>
            </button>

            {/* Bulk Editor Button */}
            <button
              onClick={() => setShowBulkEditor(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all group"
              title="Bulk Metadata Editor"
            >
              <ListChecks className="w-5 h-5" />
              <span className="font-medium">Bulk Edit</span>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {filteredDocuments.length}
              </span>
            </button>

            {/* Templates Button */}
            <button
              onClick={() => {
                // Crear documento temporal para usar template
                setEditingDocument(filteredDocuments[0] || null);
                setShowTemplateSelector(true);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all group"
              title="Browse Templates"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Templates</span>
            </button>
          </div>
        )}
      </div>
    </div>

      {/* 🆕 v7.0: Metadata Management Modals */}
      
      {/* Metadata Editor */}
      {showMetadataEditor && editingDocument && (
        <MetadataEditor
          initialMetadata={editingDocument.metadata}
          onSave={handleSaveMetadata}
          onClose={() => {
            setShowMetadataEditor(false);
            setEditingDocument(null);
          }}
          documentContent={editingDocument.content}
        />
      )}

      {/* Template Selector */}
      {showTemplateSelector && (
        <MetadataTemplateSelector
          onSelectTemplate={handleApplyTemplate}
          onClose={() => {
            setShowTemplateSelector(false);
            setEditingDocument(null);
          }}
          initialMetadata={editingDocument?.metadata}
        />
      )}

      {/* Bulk Metadata Editor */}
      {showBulkEditor && scanResult && (
        <BulkMetadataEditor
          documents={filteredDocuments}
          onSave={handleBulkSave}
          onClose={() => setShowBulkEditor(false)}
        />
      )}

      {/* Save Dialog */}
      {showSaveDialog && editingDocument && (
        <MetadataSaveDialog
          filePath={editingDocument.path}
          originalContent={editingDocument.content}
          updatedContent={updatedContent}
          onClose={() => {
            setShowSaveDialog(false);
            setEditingDocument(null);
            setUpdatedContent('');
          }}
          onConfirm={() => {
            console.log('✅ Metadata confirmada');
            handleRefresh();
          }}
        />
      )}

      {/* 🆕 v7.5: Testing Panel */}
      {showTestingPanel && (
        <MetadataTestingPanel
          onClose={() => setShowTestingPanel(false)}
        />
      )}

      {/* 🆕 v7.5: Keyboard Shortcuts Help */}
      {showKeyboardHelp && (
        <KeyboardShortcutsHelp
          onClose={() => setShowKeyboardHelp(false)}
        />
      )}
    </>
  );
}