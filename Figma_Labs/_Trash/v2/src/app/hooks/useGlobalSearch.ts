/**
 * HOOK: useGlobalSearch
 * 
 * Hook React para búsqueda global en el Centro de Documentación
 * 
 * FEATURES:
 * - ✅ Búsqueda fuzzy instantánea
 * - ✅ Filtros avanzados
 * - ✅ Historial de búsquedas recientes
 * - ✅ Debounce automático
 * - ✅ Performance optimizado con useMemo
 * 
 * EJEMPLO DE USO:
 * ```tsx
 * const { results, search, recentSearches } = useGlobalSearch(documents);
 * 
 * // Buscar
 * search('React hooks');
 * 
 * // Con filtros
 * search('React hooks', {
 *   filters: { categories: ['tutorial'] }
 * });
 * ```
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { searchIndexService, type SearchResult, type SearchOptions, type SearchFilters } from '../services/searchIndexService';
import type { DiscoveredDocument } from '../types/documentation';

interface UseGlobalSearchOptions {
  /** Auto-indexar documentos al montar */
  autoIndex?: boolean;
  
  /** Threshold de fuzzy matching */
  threshold?: number;
  
  /** Límite de resultados */
  limit?: number;
  
  /** Debounce delay en ms */
  debounceMs?: number;
  
  /** Guardar búsquedas recientes */
  saveHistory?: boolean;
  
  /** Máximo de búsquedas recientes */
  maxHistory?: number;
}

interface UseGlobalSearchReturn {
  /** Resultados de búsqueda */
  results: SearchResult[];
  
  /** Query actual */
  query: string;
  
  /** Función para buscar */
  search: (query: string, options?: Partial<SearchOptions>) => void;
  
  /** Limpiar búsqueda */
  clear: () => void;
  
  /** Búsquedas recientes */
  recentSearches: string[];
  
  /** Limpiar historial */
  clearHistory: () => void;
  
  /** Filtros activos */
  filters: SearchFilters | undefined;
  
  /** Actualizar filtros */
  setFilters: (filters: SearchFilters | undefined) => void;
  
  /** Loading state */
  isSearching: boolean;
  
  /** Estadísticas del índice */
  indexStats: ReturnType<typeof searchIndexService.getStats>;
  
  /** Re-indexar documentos */
  reindex: () => void;
}

const STORAGE_KEY = 'documentationSearchHistory';

/**
 * Hook para búsqueda global
 */
export function useGlobalSearch(
  documents: DiscoveredDocument[],
  options: UseGlobalSearchOptions = {}
): UseGlobalSearchReturn {
  const {
    autoIndex = true,
    threshold = 0.3,
    limit = 50,
    debounceMs = 150,
    saveHistory = true,
    maxHistory = 10,
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<SearchFilters | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Auto-indexar documentos cuando cambian
   */
  useEffect(() => {
    if (autoIndex && documents.length > 0) {
      searchIndexService.indexDocuments(documents);
    }
  }, [documents, autoIndex]);

  /**
   * Cargar historial de búsquedas desde localStorage
   */
  useEffect(() => {
    if (saveHistory) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const history = JSON.parse(stored);
          setRecentSearches(Array.isArray(history) ? history : []);
        }
      } catch (error) {
        console.error('Error cargando historial de búsquedas:', error);
      }
    }
  }, [saveHistory]);

  /**
   * Guardar búsqueda en historial
   */
  const saveToHistory = useCallback(
    (searchQuery: string) => {
      if (!saveHistory || !searchQuery.trim()) return;

      setRecentSearches((prev) => {
        // Evitar duplicados
        const filtered = prev.filter((q) => q !== searchQuery);
        // Agregar al inicio
        const updated = [searchQuery, ...filtered].slice(0, maxHistory);
        
        // Guardar en localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Error guardando historial de búsquedas:', error);
        }
        
        return updated;
      });
    },
    [saveHistory, maxHistory]
  );

  /**
   * Limpiar historial
   */
  const clearHistory = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error limpiando historial de búsquedas:', error);
    }
  }, []);

  /**
   * Ejecutar búsqueda
   */
  const performSearch = useCallback(
    (searchQuery: string, searchOptions?: Partial<SearchOptions>) => {
      // Si query está vacío, limpiar resultados
      if (!searchQuery.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const searchResults = searchIndexService.search({
          query: searchQuery,
          filters,
          limit,
          threshold,
          includePreview: true,
          contextLines: 2,
          ...searchOptions,
        });

        setResults(searchResults);
        
        // Guardar en historial
        saveToHistory(searchQuery);
      } catch (error) {
        console.error('Error en búsqueda global:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [filters, limit, threshold, saveToHistory]
  );

  /**
   * Buscar con debounce
   */
  const search = useCallback(
    (searchQuery: string, searchOptions?: Partial<SearchOptions>) => {
      setQuery(searchQuery);

      // Limpiar timer anterior
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Si query está vacío, ejecutar inmediatamente
      if (!searchQuery.trim()) {
        performSearch(searchQuery, searchOptions);
        return;
      }

      // Debounce para queries no vacíos
      debounceTimerRef.current = setTimeout(() => {
        performSearch(searchQuery, searchOptions);
      }, debounceMs);
    },
    [performSearch, debounceMs]
  );

  /**
   * Limpiar búsqueda
   */
  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  /**
   * Re-indexar documentos
   */
  const reindex = useCallback(() => {
    if (documents.length > 0) {
      searchIndexService.reindex(documents);
    }
  }, [documents]);

  /**
   * Obtener estadísticas del índice
   */
  const indexStats = useMemo(() => {
    return searchIndexService.getStats();
  }, [results]); // Re-calcular cuando cambian resultados

  /**
   * Cleanup al desmontar
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    results,
    query,
    search,
    clear,
    recentSearches,
    clearHistory,
    filters,
    setFilters,
    isSearching,
    indexStats,
    reindex,
  };
}
