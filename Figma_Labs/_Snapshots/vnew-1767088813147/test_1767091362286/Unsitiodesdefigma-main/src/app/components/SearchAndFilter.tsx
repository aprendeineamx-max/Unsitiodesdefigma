import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  categories: string[];
}

export function SearchAndFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedLevel,
  onLevelChange,
  categories
}: SearchAndFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const levels = ['Todos', 'Principiante', 'Intermedio', 'Avanzado'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar cursos por título o instructor..." 
            className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20 transition-colors"
          />
        </div>

        {/* Filter Button */}
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filtros</span>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Categoría</label>
              <select 
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20 transition-colors"
              >
                <option value="Todos">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Nivel</label>
              <select 
                value={selectedLevel}
                onChange={(e) => onLevelChange(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#98ca3f] focus:ring-2 focus:ring-[#98ca3f]/20 transition-colors"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
