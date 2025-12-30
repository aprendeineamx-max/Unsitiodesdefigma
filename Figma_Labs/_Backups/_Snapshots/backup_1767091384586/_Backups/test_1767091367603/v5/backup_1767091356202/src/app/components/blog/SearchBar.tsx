import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Clock, Tag, User, FileText } from 'lucide-react';

interface SearchSuggestion {
  id: string;
  type: 'post' | 'tag' | 'author' | 'category';
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<any>;
  trending?: boolean;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  showTrending?: boolean;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  suggestions = [],
  placeholder = 'Buscar artículos, autores, tags...',
  showTrending = true,
  autoFocus = false
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trending searches mock data
  const trendingSearches = [
    'React Server Components',
    'TypeScript 5.0',
    'Inteligencia Artificial',
    'UI/UX Design',
    'Node.js Performance'
  ];

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused) return;

    const totalItems = value ? suggestions.length : trendingSearches.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (value) {
            const selected = suggestions[selectedIndex];
            onChange(selected.title);
            onSearch(selected.title);
          } else {
            const selected = trendingSearches[selectedIndex];
            onChange(selected);
            onSearch(selected);
          }
        } else if (value) {
          onSearch(value);
        }
        setIsFocused(false);
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSearch(suggestion);
    setIsFocused(false);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const getTypeIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'post':
        return FileText;
      case 'tag':
        return Tag;
      case 'author':
        return User;
      case 'category':
        return FileText;
      default:
        return FileText;
    }
  };

  const showSuggestions = isFocused && (value || showTrending);
  const displaySuggestions = value ? suggestions : null;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-400"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {/* Search Results */}
          {displaySuggestions && displaySuggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Resultados
              </div>
              {displaySuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon || getTypeIcon(suggestion.type);
                return (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion.title)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A2540] to-[#0F3554] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#98CA3F]" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {suggestion.title}
                        </span>
                        {suggestion.trending && (
                          <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                        )}
                      </div>
                      {suggestion.subtitle && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {suggestion.subtitle}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 uppercase">
                      {suggestion.type}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {displaySuggestions && displaySuggestions.length === 0 && value && (
            <div className="py-8 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                No se encontraron resultados
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          )}

          {/* Trending Searches */}
          {!value && showTrending && (
            <div className="py-2">
              <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                Búsquedas Populares
              </div>
              {trendingSearches.map((search, index) => (
                <button
                  key={search}
                  onClick={() => handleSuggestionClick(search)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                  }`}
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {search}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Tips */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Tip:</span> Usa{' '}
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">↓</kbd>{' '}
              para navegar y{' '}
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">Enter</kbd>{' '}
              para seleccionar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
