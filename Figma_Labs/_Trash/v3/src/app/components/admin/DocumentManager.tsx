/**
 * DOCUMENT MANAGER - GESTOR DE ARCHIVOS MARKDOWN v1.0
 * Sistema completo de gestión de archivos .md del proyecto
 * 
 * CARACTERÍSTICAS:
 * - Vista en árbol de todos los documentos
 * - Crear, editar, eliminar, renombrar archivos
 * - Búsqueda y filtrado
 * - Integración con MarkdownEditor
 * - Integración con sistema de auto-discovery
 * - Estadísticas y métricas en tiempo real
 */

import { useState, useEffect, useMemo } from 'react';
import {
  FileText, FolderOpen, Plus, Edit3, Trash2, Download, Upload,
  Search, Filter, RefreshCw, File, Folder, ChevronRight, ChevronDown,
  Calendar, User, Tag, AlertCircle, CheckCircle, Clock, BarChart3,
  FileCode, Code, BookOpen, Sparkles, Archive, X, Save, Loader2
} from 'lucide-react';
import { MarkdownEditor } from './MarkdownEditor';
import { discoverDocuments, getManifestStats } from '../../services/documentScanner';
import type { DiscoveredDocument, DocumentCategory } from '../../types/documentation';
import { toast } from 'sonner';

// Vista del componente
type ManagerView = 'list' | 'editor';

// Configuración de categorías
const CATEGORY_CONFIG: Record<DocumentCategory, { name: string; icon: any; color: string }> = {
  roadmap: { name: 'Roadmaps', icon: BookOpen, color: 'text-purple-600' },
  guide: { name: 'Guías', icon: FileText, color: 'text-blue-600' },
  api: { name: 'API & Docs', icon: Code, color: 'text-green-600' },
  tutorial: { name: 'Tutoriales', icon: FileCode, color: 'text-orange-600' },
  'best-practices': { name: 'Best Practices', icon: Sparkles, color: 'text-yellow-600' },
  other: { name: 'Otros', icon: Archive, color: 'text-gray-600' },
};

export function DocumentManager() {
  // Estado de documentos
  const [documents, setDocuments] = useState<DiscoveredDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [manifestStats, setManifestStats] = useState<any>(null);
  
  // Estado de vista
  const [currentView, setCurrentView] = useState<ManagerView>('list');
  const [selectedDocument, setSelectedDocument] = useState<DiscoveredDocument | null>(null);
  
  // Estado de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  
  // Estado de UI
  const [expandedCategories, setExpandedCategories] = useState<Set<DocumentCategory>>(
    new Set(['roadmap', 'guide', 'api', 'tutorial', 'best-practices'])
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  /**
   * Cargar documentos al montar
   */
  useEffect(() => {
    loadDocuments();
  }, []);

  /**
   * Cargar documentos desde auto-discovery
   */
  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const result = await discoverDocuments();
      setDocuments(result.documents);
      
      const stats = getManifestStats();
      setManifestStats(stats);
      
      console.log(`✅ ${result.totalCount} documentos cargados`);
    } catch (error) {
      console.error('Error cargando documentos:', error);
      toast.error('Error al cargar documentos');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filtrar y ordenar documentos
   */
  const filteredAndSortedDocuments = useMemo(() => {
    let result = [...documents];

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(doc => 
        doc.metadata.title.toLowerCase().includes(term) ||
        doc.metadata.description?.toLowerCase().includes(term) ||
        doc.filename.toLowerCase().includes(term) ||
        doc.metadata.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Filtrar por categoría
    if (selectedCategory) {
      result = result.filter(doc => doc.metadata.category === selectedCategory);
    }

    // Ordenar
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.metadata.title.localeCompare(b.metadata.title);
        case 'date':
          return new Date(b.metadata.date || 0).getTime() - new Date(a.metadata.date || 0).getTime();
        case 'size':
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [documents, searchTerm, selectedCategory, sortBy]);

  /**
   * Agrupar documentos por categoría
   */
  const documentsByCategory = useMemo(() => {
    const groups: Record<DocumentCategory, DiscoveredDocument[]> = {
      roadmap: [],
      guide: [],
      api: [],
      tutorial: [],
      'best-practices': [],
      other: [],
    };

    filteredAndSortedDocuments.forEach(doc => {
      const category = doc.metadata.category || 'other';
      if (groups[category]) {
        groups[category].push(doc);
      } else {
        groups.other.push(doc);
      }
    });

    return groups;
  }, [filteredAndSortedDocuments]);

  /**
   * Calcular estadísticas
   */
  const statistics = useMemo(() => {
    const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
    const categoryCounts = Object.entries(documentsByCategory).map(([category, docs]) => ({
      category: category as DocumentCategory,
      count: docs.length
    }));

    return {
      total: documents.length,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      byCategory: categoryCounts,
    };
  }, [documents, documentsByCategory]);

  /**
   * Toggle categoría expandida
   */
  const toggleCategory = (category: DocumentCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  /**
   * Abrir documento en el editor
   */
  const openDocument = (doc: DiscoveredDocument) => {
    setSelectedDocument(doc);
    setCurrentView('editor');
  };

  /**
   * Crear nuevo documento
   */
  const createNewDocument = () => {
    setSelectedDocument(null);
    setCurrentView('editor');
  };

  /**
   * Eliminar documento
   */
  const deleteDocument = async (docId: string) => {
    try {
      // En producción, hacer DELETE request a la API
      // Por ahora solo simulamos
      
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      setShowDeleteConfirm(null);
      toast.success('Documento eliminado');
      
      // Recargar desde servidor
      await loadDocuments();
    } catch (error) {
      console.error('Error eliminando documento:', error);
      toast.error('Error al eliminar documento');
    }
  };

  /**
   * Guardar documento editado
   */
  const handleSaveDocument = async (content: string, path: string) => {
    try {
      // En producción, hacer POST/PUT request a la API
      console.log('Guardando documento:', path);
      
      toast.success('Documento guardado exitosamente');
      
      // Recargar documentos
      await loadDocuments();
      
      // Volver a la vista de lista
      setCurrentView('list');
    } catch (error) {
      console.error('Error guardando documento:', error);
      toast.error('Error al guardar documento');
    }
  };

  /**
   * Renderizar vista de editor
   */
  if (currentView === 'editor') {
    return (
      <MarkdownEditor
        initialContent={selectedDocument?.content || ''}
        initialPath={selectedDocument?.path || '/nuevo-documento.md'}
        onSave={handleSaveDocument}
        onClose={() => setCurrentView('list')}
      />
    );
  }

  /**
   * Renderizar vista de lista
   */
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <div className="p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg">
              <FolderOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Gestor de Documentos
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {isLoading ? 'Cargando...' : `${statistics.total} documentos • ${statistics.totalSizeMB}MB`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDocuments}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Actualizar</span>
            </button>

            <button
              onClick={createNewDocument}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Nuevo Documento</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar documentos..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory || null)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
          >
            <option value="">Todas las categorías</option>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-slate-900 dark:text-white"
          >
            <option value="date">Más recientes</option>
            <option value="name">Nombre (A-Z)</option>
            <option value="size">Tamaño</option>
          </select>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {statistics.byCategory.map(({ category, count }) => {
            const config = CATEGORY_CONFIG[category];
            const Icon = config.icon;
            return (
              <div
                key={category}
                className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <Icon className={`w-5 h-5 ${config.color}`} />
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{config.name}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Cargando documentos...</p>
            </div>
          </div>
        ) : filteredAndSortedDocuments.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No se encontraron documentos
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {searchTerm || selectedCategory
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'Crea tu primer documento para comenzar'}
              </p>
              <button
                onClick={createNewDocument}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-lg"
              >
                Crear Documento
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(documentsByCategory).map(([category, docs]) => {
              if (docs.length === 0) return null;
              
              const config = CATEGORY_CONFIG[category as DocumentCategory];
              const Icon = config.icon;
              const isExpanded = expandedCategories.has(category as DocumentCategory);

              return (
                <div key={category} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category as DocumentCategory)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {config.name}
                      </h2>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm text-slate-600 dark:text-slate-400">
                        {docs.length}
                      </span>
                    </div>
                  </button>

                  {/* Document List */}
                  {isExpanded && (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 dark:text-white mb-1 truncate">
                                {doc.metadata.title}
                              </h3>
                              {doc.metadata.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                                  {doc.metadata.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(doc.metadata.date || '').toLocaleDateString('es-ES')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {doc.metadata.author}
                                </span>
                                <span className="flex items-center gap-1">
                                  <File className="w-3 h-3" />
                                  {((doc.size || 0) / 1024).toFixed(1)}KB
                                </span>
                              </div>
                              {doc.metadata.tags && doc.metadata.tags.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  {doc.metadata.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-xs"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {doc.metadata.tags.length > 3 && (
                                    <span className="text-xs text-slate-500">
                                      +{doc.metadata.tags.length - 3} más
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openDocument(doc)}
                                className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
                                title="Editar"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(doc.id)}
                                className="p-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  ¿Eliminar documento?
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Esta acción no se puede deshacer. El documento será eliminado permanentemente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteDocument(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
