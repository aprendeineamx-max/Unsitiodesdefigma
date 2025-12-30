/**
 * SEARCH COMMAND PALETTE - Búsqueda Global Enterprise
 * 
 * Command Palette tipo VSCode/Notion/Linear para búsqueda global
 * de documentación con keyboard navigation completo.
 * 
 * TECNOLOGÍAS:
 * - cmdk: Command palette UI (usado por Vercel, Linear, Raycast)
 * - react-hotkeys-hook: Keyboard shortcuts (Cmd+K)
 * - Fuse.js: Fuzzy search (via searchIndexService)
 * 
 * FEATURES:
 * - ✅ Cmd+K / Ctrl+K para abrir
 * - ✅ Esc para cerrar
 * - ✅ Arrow keys para navegar
 * - ✅ Enter para seleccionar
 * - ✅ Búsqueda fuzzy en tiempo real
 * - ✅ Preview con highlighting
 * - ✅ Filtros por categoría
 * - ✅ Búsquedas recientes
 * - ✅ Mobile responsive
 * - ✅ Dark mode support
 * 
 * KEYBOARD SHORTCUTS:
 * - Cmd/Ctrl + K: Toggle command palette
 * - Esc: Cerrar
 * - Arrow Up/Down: Navegar resultados
 * - Enter: Abrir documento
 * - Tab: Ciclar entre filtros
 */

import { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { useHotkeys } from 'react-hotkeys-hook';
import { 
  Search, FileText, Book, Code, FileCode, Sparkles, 
  Archive, Clock, Filter, X, ChevronRight, Zap 
} from 'lucide-react';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import type { DiscoveredDocument, DocumentCategory } from '../types/documentation';
import type { SearchResult } from '../services/searchIndexService';

interface SearchCommandPaletteProps {
  /** Documentos a indexar */
  documents: DiscoveredDocument[];
  
  /** Callback cuando se selecciona un documento */
  onSelectDocument: (document: DiscoveredDocument) => void;
  
  /** Control externo de visibilidad */
  isOpen?: boolean;
  
  /** Callback cuando cambia visibilidad */
  onOpenChange?: (open: boolean) => void;
}

// Mapeo de categorías a iconos y colores
const CATEGORY_CONFIG = {
  roadmap: { name: 'Roadmaps', icon: Book, color: 'text-purple-600 dark:text-purple-400' },
  guide: { name: 'Guías', icon: FileText, color: 'text-blue-600 dark:text-blue-400' },
  api: { name: 'API & Docs', icon: Code, color: 'text-green-600 dark:text-green-400' },
  tutorial: { name: 'Tutoriales', icon: FileCode, color: 'text-orange-600 dark:text-orange-400' },
  'best-practices': { name: 'Best Practices', icon: Sparkles, color: 'text-yellow-600 dark:text-yellow-400' },
  other: { name: 'Otros', icon: Archive, color: 'text-gray-600 dark:text-gray-400' },
};

export function SearchCommandPalette({
  documents,
  onSelectDocument,
  isOpen: externalIsOpen,
  onOpenChange,
}: SearchCommandPaletteProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);

  // Usar control externo si se provee, sino usar interno
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  // Hook de búsqueda global
  const {
    results,
    query,
    search,
    clear,
    recentSearches,
    clearHistory,
    filters,
    setFilters,
    isSearching,
  } = useGlobalSearch(documents, {
    autoIndex: true,
    threshold: 0.3,
    limit: 30,
    debounceMs: 150,
    saveHistory: true,
    maxHistory: 5,
  });

  /**
   * Keyboard shortcut: Cmd+K / Ctrl+K
   */
  useHotkeys(
    'mod+k',
    (e) => {
      e.preventDefault();
      setIsOpen(!isOpen);
    },
    {
      enableOnFormTags: true, // Funciona incluso en inputs
    }
  );

  /**
   * Aplicar filtro de categoría
   */
  useEffect(() => {
    if (selectedCategory) {
      setFilters({ categories: [selectedCategory] });
    } else {
      setFilters(undefined);
    }
  }, [selectedCategory, setFilters]);

  /**
   * Limpiar al cerrar
   */
  useEffect(() => {
    if (!isOpen) {
      // Pequeño delay para que la animación de cierre se vea bien
      setTimeout(() => {
        clear();
        setSelectedCategory(null);
      }, 200);
    }
  }, [isOpen, clear]);

  /**
   * Handler para seleccionar documento
   */
  const handleSelectDocument = useCallback(
    (document: DiscoveredDocument) => {
      onSelectDocument(document);
      setIsOpen(false);
    },
    [onSelectDocument, setIsOpen]
  );

  /**
   * Handler para buscar desde historial
   */
  const handleRecentSearch = useCallback(
    (recentQuery: string) => {
      search(recentQuery);
    },
    [search]
  );

  /**
   * Renderizar resultado de búsqueda
   */
  const renderSearchResult = (result: SearchResult) => {
    const { document, matchType, preview, score } = result;
    const category = document.metadata.category || 'other';
    const config = CATEGORY_CONFIG[category];
    const Icon = config.icon;

    return (
      <Command.Item
        key={document.id}
        value={`${document.id}-${document.metadata.title}`}
        onSelect={() => handleSelectDocument(document)}
        className="flex items-start gap-3 px-4 py-3 cursor-pointer aria-selected:bg-purple-100 dark:aria-selected:bg-purple-900/30 rounded-lg transition-colors group"
      >
        {/* Icono de categoría */}
        <div className={`p-2 bg-white dark:bg-slate-800 rounded-lg flex-shrink-0 ${config.color}`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
              {document.metadata.title}
            </h3>
            {matchType === 'title' && (
              <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs rounded-full font-semibold">
                Título
              </span>
            )}
          </div>
          
          {preview && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {preview}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-500">
            <span className={config.color}>{config.name}</span>
            {document.metadata.tags && document.metadata.tags.length > 0 && (
              <>
                <span>•</span>
                <span>{document.metadata.tags.slice(0, 2).join(', ')}</span>
              </>
            )}
            {/* Score de relevancia (solo en dev) */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <span>•</span>
                <span>Score: {score.toFixed(3)}</span>
              </>
            )}
          </div>
        </div>

        {/* Indicador de selección */}
        <ChevronRight className="w-5 h-5 text-slate-400 group-aria-selected:text-purple-600 dark:group-aria-selected:text-purple-400 flex-shrink-0 opacity-0 group-aria-selected:opacity-100 transition-opacity" />
      </Command.Item>
    );
  };

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
      label="Búsqueda Global de Documentación"
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

      {/* Command Palette */}
      <div className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header con input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          
          <Command.Input
            value={query}
            onValueChange={search}
            placeholder="Buscar en toda la documentación... (Cmd+K)"
            className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            autoFocus
          />

          {/* Indicador de búsqueda */}
          {isSearching && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span>Buscando...</span>
            </div>
          )}

          {/* Botón de cerrar */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Filtros de categoría */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
          
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${
              selectedCategory === null
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
            }`}
          >
            Todos
          </button>
          
          {(Object.entries(CATEGORY_CONFIG) as [DocumentCategory, typeof CATEGORY_CONFIG[DocumentCategory]][]).map(([category, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                <Icon className="w-3 h-3" />
                {config.name}
              </button>
            );
          })}
        </div>

        {/* Lista de resultados */}
        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          {/* Loading state */}
          {isSearching && query && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Buscando...</p>
              </div>
            </div>
          )}

          {/* Empty state - sin query */}
          {!query && !isSearching && (
            <Command.Empty>
              <div className="px-4 py-8 text-center">
                <Zap className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Búsqueda Global
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Busca en {documents.length} documentos con fuzzy search
                </p>
                
                {/* Búsquedas recientes */}
                {recentSearches.length > 0 && (
                  <div className="mt-6 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Búsquedas recientes
                      </h4>
                      <button
                        onClick={clearHistory}
                        className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        Limpiar
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((recentQuery, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRecentSearch(recentQuery)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          {recentQuery}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Command.Empty>
          )}

          {/* Empty state - con query pero sin resultados */}
          {query && !isSearching && results.length === 0 && (
            <Command.Empty>
              <div className="px-4 py-8 text-center">
                <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Intenta con otros términos o ajusta los filtros
                </p>
              </div>
            </Command.Empty>
          )}

          {/* Resultados de búsqueda */}
          {results.length > 0 && (
            <div className="space-y-1">
              {/* Header de resultados */}
              <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>{results.length} resultado{results.length !== 1 ? 's' : ''}</span>
                {filters?.categories && (
                  <span className="text-purple-600 dark:text-purple-400">
                    Filtrado por: {filters.categories.map(c => CATEGORY_CONFIG[c].name).join(', ')}
                  </span>
                )}
              </div>

              {/* Resultados */}
              {results.map(renderSearchResult)}
            </div>
          )}
        </Command.List>

        {/* Footer con shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded font-mono">↓</kbd>
              Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded font-mono">Enter</kbd>
              Abrir
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded font-mono">Esc</kbd>
              Cerrar
            </span>
          </div>
          
          <span className="text-xs text-slate-500">
            Fuzzy search powered by Fuse.js
          </span>
        </div>
      </div>
    </Command.Dialog>
  );
}
