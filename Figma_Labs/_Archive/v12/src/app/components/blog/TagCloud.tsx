import { useState } from 'react';
import { Tag, TrendingUp, Hash, X } from 'lucide-react';

interface TagData {
  id: string;
  name: string;
  count: number;
  trending?: boolean;
  category?: string;
}

interface TagCloudProps {
  tags: TagData[];
  selectedTags?: string[];
  onTagClick?: (tagId: string) => void;
  variant?: 'cloud' | 'list' | 'compact';
  maxTags?: number;
  showCount?: boolean;
  colorScheme?: 'default' | 'category' | 'gradient';
}

export function TagCloud({
  tags,
  selectedTags = [],
  onTagClick,
  variant = 'cloud',
  maxTags,
  showCount = true,
  colorScheme = 'gradient'
}: TagCloudProps) {
  const [showAll, setShowAll] = useState(false);

  // Sort tags by count
  const sortedTags = [...tags].sort((a, b) => b.count - a.count);
  const displayTags = maxTags && !showAll
    ? sortedTags.slice(0, maxTags)
    : sortedTags;

  // Get tag size based on count (for cloud variant)
  const getTagSize = (count: number) => {
    const maxCount = Math.max(...tags.map(t => t.count));
    const minCount = Math.min(...tags.map(t => t.count));
    const range = maxCount - minCount;
    const normalized = range === 0 ? 0.5 : (count - minCount) / range;

    if (normalized > 0.8) return 'text-2xl';
    if (normalized > 0.6) return 'text-xl';
    if (normalized > 0.4) return 'text-lg';
    if (normalized > 0.2) return 'text-base';
    return 'text-sm';
  };

  // Get color based on scheme
  const getTagColor = (tag: TagData, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-[#98CA3F] text-white border-[#98CA3F]';
    }

    if (colorScheme === 'gradient') {
      const colors = [
        'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
        'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
        'bg-gradient-to-r from-orange-500 to-red-500 text-white',
        'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
        'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
      ];
      const index = Math.abs(tag.name.charCodeAt(0)) % colors.length;
      return colors[index];
    }

    if (colorScheme === 'category' && tag.category) {
      const categoryColors: Record<string, string> = {
        desarrollo: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        diseño: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
        data: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        ia: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      };
      return categoryColors[tag.category] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }

    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600';
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#98CA3F]" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Tags Populares
            </h3>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {displayTags.map(tag => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => onTagClick?.(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${getTagColor(tag, isSelected)}`}
                >
                  #{tag.name}
                  {showCount && ` (${tag.count})`}
                  {tag.trending && <TrendingUp className="inline w-3 h-3 ml-1" />}
                </button>
              );
            })}
          </div>
          {maxTags && tags.length > maxTags && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-3 text-sm text-[#98CA3F] hover:text-[#7fb32f] font-medium transition-colors"
            >
              {showAll ? 'Mostrar menos' : `Ver todos (${tags.length})`}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#98CA3F]" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Tags
          </h3>
        </div>
        <div className="space-y-2">
          {displayTags.map(tag => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => onTagClick?.(tag.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-[#98CA3F] border-[#98CA3F] text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Hash className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                  <span className="font-medium">{tag.name}</span>
                  {tag.trending && (
                    <TrendingUp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-orange-500'}`} />
                  )}
                </div>
                {showCount && (
                  <span className={`text-sm font-semibold ${
                    isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {tag.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {maxTags && tags.length > maxTags && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 text-sm text-[#98CA3F] hover:text-[#7fb32f] font-medium transition-colors"
          >
            {showAll ? 'Mostrar menos' : `Ver todos (${tags.length})`}
          </button>
        )}
      </div>
    );
  }

  // Cloud variant (default)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Explora por Tags
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tags.length} tags disponibles
            </p>
          </div>
        </div>
        {selectedTags.length > 0 && (
          <button
            onClick={() => selectedTags.forEach(tag => onTagClick?.(tag))}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="text-sm font-medium">
              Limpiar ({selectedTags.length})
            </span>
          </button>
        )}
      </div>

      {/* Tag Cloud */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {displayTags.map(tag => {
            const isSelected = selectedTags.includes(tag.id);
            const sizeClass = getTagSize(tag.count);
            return (
              <button
                key={tag.id}
                onClick={() => onTagClick?.(tag.id)}
                className={`px-4 py-2 rounded-full font-semibold transition-all border hover:scale-110 ${sizeClass} ${getTagColor(tag, isSelected)}`}
                style={{
                  opacity: isSelected ? 1 : 0.8
                }}
              >
                <span className="flex items-center gap-2">
                  #{tag.name}
                  {showCount && (
                    <span className={`text-xs ${
                      isSelected || colorScheme === 'gradient'
                        ? 'opacity-80'
                        : 'text-gray-500'
                    }`}>
                      {tag.count}
                    </span>
                  )}
                  {tag.trending && (
                    <TrendingUp className="w-4 h-4" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {maxTags && tags.length > maxTags && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2.5 bg-[#98CA3F] text-white rounded-lg font-medium hover:bg-[#7fb32f] transition-colors"
            >
              {showAll ? 'Mostrar menos' : `Ver todos los tags (${tags.length})`}
            </button>
          </div>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              Tags seleccionados ({selectedTags.length})
            </span>
            <button
              onClick={() => selectedTags.forEach(tag => onTagClick?.(tag))}
              className="text-sm text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 font-medium"
            >
              Limpiar todo
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <button
                  key={tag.id}
                  onClick={() => onTagClick?.(tag.id)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 rounded-full text-sm font-medium hover:bg-blue-300 dark:hover:bg-blue-700 transition-colors"
                >
                  #{tag.name}
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Tag Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Total Tags</span>
          </div>
          <span className="text-3xl font-bold">{tags.length}</span>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Trending</span>
          </div>
          <span className="text-3xl font-bold">
            {tags.filter(t => t.trending).length}
          </span>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Más Popular</span>
          </div>
          <span className="text-lg font-bold truncate">
            #{sortedTags[0]?.name || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}
