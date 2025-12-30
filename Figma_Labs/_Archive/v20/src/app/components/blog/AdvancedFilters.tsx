import { useState } from 'react';
import {
  Filter,
  X,
  Calendar,
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageCircle,
  Clock,
  User,
  Tag,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';

export interface FilterOptions {
  categories: string[];
  tags: string[];
  authors: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'latest' | 'popular' | 'trending' | 'mostViewed' | 'mostLiked';
  readTime: 'all' | 'short' | 'medium' | 'long'; // short: <5min, medium: 5-15min, long: >15min
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  availableCategories: Array<{ id: string; name: string; count?: number }>;
  availableTags: Array<{ id: string; name: string; count?: number }>;
  availableAuthors: Array<{ id: string; name: string; avatar?: string }>;
  onReset?: () => void;
}

export function AdvancedFilters({
  filters,
  onChange,
  availableCategories,
  availableTags,
  availableAuthors,
  onReset
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.authors.length > 0 ||
    filters.dateRange !== 'all' ||
    filters.sortBy !== 'latest' ||
    filters.readTime !== 'all';

  const activeFiltersCount =
    filters.categories.length +
    filters.tags.length +
    filters.authors.length +
    (filters.dateRange !== 'all' ? 1 : 0) +
    (filters.sortBy !== 'latest' ? 1 : 0) +
    (filters.readTime !== 'all' ? 1 : 0);

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    onChange({ ...filters, categories: newCategories });
  };

  const toggleTag = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(id => id !== tagId)
      : [...filters.tags, tagId];
    onChange({ ...filters, tags: newTags });
  };

  const toggleAuthor = (authorId: string) => {
    const newAuthors = filters.authors.includes(authorId)
      ? filters.authors.filter(id => id !== authorId)
      : [...filters.authors, authorId];
    onChange({ ...filters, authors: newAuthors });
  };

  const handleReset = () => {
    onChange({
      categories: [],
      tags: [],
      authors: [],
      dateRange: 'all',
      sortBy: 'latest',
      readTime: 'all'
    });
    onReset?.();
  };

  const sortOptions = [
    { value: 'latest', label: 'Más Recientes', icon: Calendar },
    { value: 'popular', label: 'Más Populares', icon: TrendingUp },
    { value: 'trending', label: 'Tendencia', icon: TrendingUp },
    { value: 'mostViewed', label: 'Más Vistos', icon: Eye },
    { value: 'mostLiked', label: 'Más Gustados', icon: ThumbsUp }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Todo el tiempo' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'year', label: 'Este año' }
  ];

  const readTimeOptions = [
    { value: 'all', label: 'Cualquier duración' },
    { value: 'short', label: 'Lectura rápida (< 5 min)' },
    { value: 'medium', label: 'Lectura media (5-15 min)' },
    { value: 'long', label: 'Lectura larga (> 15 min)' }
  ];

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
          hasActiveFilters
            ? 'bg-[#98CA3F] border-[#98CA3F] text-white hover:bg-[#7fb32f]'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="font-medium">Filtros</span>
        {activeFiltersCount > 0 && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            hasActiveFilters ? 'bg-white/20' : 'bg-[#98CA3F] text-white'
          }`}>
            {activeFiltersCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.categories.map(catId => {
            const cat = availableCategories.find(c => c.id === catId);
            return cat ? (
              <span
                key={catId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
              >
                {cat.name}
                <button
                  onClick={() => toggleCategory(catId)}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null;
          })}
          {filters.tags.map(tagId => {
            const tag = availableTags.find(t => t.id === tagId);
            return tag ? (
              <span
                key={tagId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
              >
                #{tag.name}
                <button
                  onClick={() => toggleTag(tagId)}
                  className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null;
          })}
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-3 h-3" />
            Limpiar todo
          </button>
        </div>
      )}

      {/* Filters Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 max-h-[600px] overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#98CA3F]" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Filtros Avanzados
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Ordenar por
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {sortOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => onChange({ ...filters, sortBy: option.value as any })}
                        className={`p-3 rounded-lg border transition-all ${
                          filters.sortBy === option.value
                            ? 'bg-[#98CA3F] border-[#98CA3F] text-white'
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mx-auto mb-1 ${
                          filters.sortBy === option.value ? 'text-white' : 'text-gray-400'
                        }`} />
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Fecha de publicación
                </label>
                <div className="space-y-2">
                  {dateRangeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => onChange({ ...filters, dateRange: option.value as any })}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border transition-all ${
                        filters.dateRange === option.value
                          ? 'bg-[#98CA3F] border-[#98CA3F] text-white'
                          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Read Time */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Clock className="w-4 h-4" />
                  Tiempo de lectura
                </label>
                <div className="space-y-2">
                  {readTimeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => onChange({ ...filters, readTime: option.value as any })}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border transition-all ${
                        filters.readTime === option.value
                          ? 'bg-[#98CA3F] border-[#98CA3F] text-white'
                          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Categorías ({availableCategories.length})
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableCategories.map(category => (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="w-4 h-4 text-[#98CA3F] rounded border-gray-300 focus:ring-[#98CA3F]"
                      />
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                      {category.count !== undefined && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {category.count}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <Tag className="w-4 h-4" />
                  Tags ({availableTags.length})
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {availableTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filters.tags.includes(tag.id)
                          ? 'bg-[#98CA3F] text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      #{tag.name}
                      {tag.count !== undefined && ` (${tag.count})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Authors */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <User className="w-4 h-4" />
                  Autores ({availableAuthors.length})
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableAuthors.map(author => (
                    <label
                      key={author.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.authors.includes(author.id)}
                        onChange={() => toggleAuthor(author.id)}
                        className="w-4 h-4 text-[#98CA3F] rounded border-gray-300 focus:ring-[#98CA3F]"
                      />
                      {author.avatar && (
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                        {author.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Limpiar Filtros
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-[#98CA3F] text-white rounded-lg font-medium hover:bg-[#7fb32f] transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
