import { useState } from 'react';
import { Search, Filter, SlidersHorizontal, Grid, List, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'post' | 'author' | 'tag';
  title: string;
  excerpt?: string;
  author?: {
    name: string;
    avatar: string;
  };
  image?: string;
  category?: string;
  tags?: string[];
  readTime?: number;
  views?: number;
  likes?: number;
  matchScore: number; // relevance score 0-100
  highlightedText?: string; // text snippet with search term highlighted
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  totalResults: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onResultClick?: (result: SearchResult) => void;
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export function SearchResults({
  results,
  query,
  totalResults,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onResultClick,
  isLoading = false,
  viewMode = 'list',
  onViewModeChange
}: SearchResultsProps) {
  const [localViewMode, setLocalViewMode] = useState<'grid' | 'list'>(viewMode);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setLocalViewMode(mode);
    onViewModeChange?.(mode);
  };

  const highlightQuery = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-white px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-[#98CA3F] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Buscando resultados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No encontramos nada para "<span className="font-semibold">{query}</span>".
            Intenta con otros términos de búsqueda.
          </p>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 text-left">
            <p className="font-semibold">Sugerencias:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Verifica la ortografía de las palabras</li>
              <li>Usa términos más generales</li>
              <li>Prueba con sinónimos</li>
              <li>Usa menos palabras clave</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Resultados de búsqueda
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {totalResults.toLocaleString()} resultados para{' '}
            <span className="font-semibold text-gray-900 dark:text-white">"{query}"</span>
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => handleViewModeChange('list')}
            className={`p-2 rounded transition-colors ${
              localViewMode === 'list'
                ? 'bg-white dark:bg-gray-800 text-[#98CA3F] shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`p-2 rounded transition-colors ${
              localViewMode === 'grid'
                ? 'bg-white dark:bg-gray-800 text-[#98CA3F] shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Results */}
      {localViewMode === 'list' ? (
        <div className="space-y-4">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => onResultClick?.(result)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all group text-left"
            >
              <div className="flex gap-4">
                {/* Image */}
                {result.image && (
                  <img
                    src={result.image}
                    alt={result.title}
                    className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Type & Match Score */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2.5 py-1 bg-[#98CA3F]/10 text-[#98CA3F] rounded-full text-xs font-semibold uppercase">
                      {result.type === 'post' ? 'Artículo' : result.type === 'author' ? 'Autor' : 'Tag'}
                    </span>
                    {result.matchScore >= 70 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Muy relevante
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 group-hover:text-[#98CA3F] transition-colors mb-2">
                    {highlightQuery(result.title, query)}
                  </h3>

                  {/* Excerpt or Highlighted Text */}
                  {(result.highlightedText || result.excerpt) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {highlightQuery(result.highlightedText || result.excerpt || '', query)}
                    </p>
                  )}

                  {/* Tags */}
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {result.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Author & Meta */}
                  {result.author && (
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <img
                          src={result.author.avatar}
                          alt={result.author.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{result.author.name}</span>
                      </div>
                      {result.readTime && (
                        <span>{result.readTime} min lectura</span>
                      )}
                      {result.views && (
                        <span>{result.views.toLocaleString()} vistas</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => onResultClick?.(result)}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group text-left"
            >
              {/* Image */}
              {result.image && (
                <div className="relative">
                  <img
                    src={result.image}
                    alt={result.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {result.matchScore >= 70 && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-green-500 rounded-full">
                      <span className="text-xs font-bold text-white">
                        {result.matchScore}% match
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-5">
                {/* Type */}
                <span className="inline-block px-2.5 py-1 bg-[#98CA3F]/10 text-[#98CA3F] rounded-full text-xs font-semibold mb-3 uppercase">
                  {result.type === 'post' ? 'Artículo' : result.type === 'author' ? 'Autor' : 'Tag'}
                </span>

                {/* Title */}
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#98CA3F] transition-colors mb-2">
                  {highlightQuery(result.title, query)}
                </h3>

                {/* Excerpt */}
                {result.excerpt && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                    {highlightQuery(result.excerpt, query)}
                  </p>
                )}

                {/* Footer */}
                {result.author && (
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <img
                      src={result.author.avatar}
                      alt={result.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {result.author.name}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#98CA3F] text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
