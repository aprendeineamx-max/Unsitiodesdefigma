import { useState } from 'react';
import { BookmarkCheck, Trash2, Eye, Clock, Calendar, Filter, Grid, List as ListIcon, Check, X } from 'lucide-react';

interface ReadingListItem {
  id: string;
  postId: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  image?: string;
  category: string;
  tags: string[];
  readTime: number;
  views: number;
  addedAt: string;
  isRead: boolean;
  progress?: number; // 0-100
  notes?: string;
}

interface ReadingListProps {
  items: ReadingListItem[];
  onPostClick?: (postId: string) => void;
  onRemove?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  onAddNote?: (id: string, note: string) => void;
}

export function ReadingList({
  items,
  onPostClick,
  onRemove,
  onMarkAsRead,
  onAddNote
}: ReadingListProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Filter items
  let filteredItems = items;
  if (filter === 'unread') {
    filteredItems = items.filter(item => !item.isRead);
  } else if (filter === 'read') {
    filteredItems = items.filter(item => item.isRead);
  }

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case 'oldest':
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const toggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkRemove = () => {
    selectedItems.forEach(id => onRemove?.(id));
    setSelectedItems([]);
  };

  const handleBulkMarkAsRead = () => {
    selectedItems.forEach(id => onMarkAsRead?.(id));
    setSelectedItems([]);
  };

  const stats = {
    total: items.length,
    unread: items.filter(i => !i.isRead).length,
    read: items.filter(i => i.isRead).length,
    totalReadTime: items.reduce((sum, i) => sum + i.readTime, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookmarkCheck className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Mi Lista de Lectura</h1>
            </div>
            <p className="text-white/80">
              Guarda artículos para leer más tarde y haz seguimiento de tu progreso
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold mb-1">{stats.total}</div>
            <div className="text-sm text-white/80">Total guardados</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold mb-1">{stats.unread}</div>
            <div className="text-sm text-white/80">Por leer</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold mb-1">{stats.read}</div>
            <div className="text-sm text-white/80">Completados</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold mb-1">{Math.round(stats.totalReadTime)}</div>
            <div className="text-sm text-white/80">Minutos totales</div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filter tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-[#98CA3F] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todos ({stats.total})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-[#98CA3F] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Por leer ({stats.unread})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'read'
                  ? 'bg-[#98CA3F] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Leídos ({stats.read})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="title">Por título</option>
            </select>

            {/* View mode */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-800 text-[#98CA3F] shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-800 text-[#98CA3F] shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedItems.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
              {selectedItems.length} seleccionados
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Marcar como leído
              </button>
              <button
                onClick={handleBulkRemove}
                className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {sortedItems.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookmarkCheck className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No hay artículos guardados
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Empieza a guardar artículos para leer más tarde y organizarlos en tu lista de lectura.
            </p>
          </div>
        </div>
      )}

      {/* Items */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="flex gap-4 p-5">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelection(item.id)}
                  className="w-5 h-5 rounded border-gray-300 text-[#98CA3F] focus:ring-[#98CA3F] mt-1"
                />

                {/* Image */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Category & status */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2.5 py-1 bg-[#98CA3F]/10 text-[#98CA3F] rounded-full text-xs font-semibold">
                      {item.category}
                    </span>
                    {item.isRead ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                        <Check className="w-3 h-3" />
                        Leído
                      </span>
                    ) : item.progress ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                        {Math.round(item.progress)}% completado
                      </span>
                    ) : null}
                  </div>

                  {/* Title */}
                  <button
                    onClick={() => onPostClick?.(item.postId)}
                    className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 hover:text-[#98CA3F] transition-colors text-left mb-2"
                  >
                    {item.title}
                  </button>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {item.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.author.avatar}
                        alt={item.author.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span>{item.author.name}</span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {item.readTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.addedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {item.progress && !item.isRead && (
                    <div className="mt-3">
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#98CA3F] rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {!item.isRead && (
                    <button
                      onClick={() => onMarkAsRead?.(item.id)}
                      className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      title="Marcar como leído"
                    >
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </button>
                  )}
                  <button
                    onClick={() => onRemove?.(item.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Image */}
              {item.image && (
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    className="absolute top-3 left-3 w-5 h-5 rounded border-white text-[#98CA3F] focus:ring-[#98CA3F] shadow-lg"
                  />
                  {item.isRead && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Leído
                    </div>
                  )}
                </div>
              )}

              <div className="p-5">
                <span className="inline-block px-2.5 py-1 bg-[#98CA3F]/10 text-[#98CA3F] rounded-full text-xs font-semibold mb-3">
                  {item.category}
                </span>

                <button
                  onClick={() => onPostClick?.(item.postId)}
                  className="font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-[#98CA3F] transition-colors text-left mb-2"
                >
                  {item.title}
                </button>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                  {item.excerpt}
                </p>

                {/* Progress */}
                {item.progress && !item.isRead && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progreso</span>
                      <span className="font-semibold">{Math.round(item.progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#98CA3F] rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.author.avatar}
                      alt={item.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {item.readTime} min
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {!item.isRead && (
                      <button
                        onClick={() => onMarkAsRead?.(item.id)}
                        className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                      >
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </button>
                    )}
                    <button
                      onClick={() => onRemove?.(item.id)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
