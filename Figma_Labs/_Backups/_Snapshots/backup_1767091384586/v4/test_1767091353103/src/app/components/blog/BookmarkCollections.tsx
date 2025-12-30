import { useState } from 'react';
import {
  Bookmark,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Lock,
  Globe,
  Users,
  Grid,
  List,
  Search,
  FolderOpen,
  Check,
  X,
  Eye
} from 'lucide-react';

interface BookmarkCollection {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  visibility: 'private' | 'public' | 'shared';
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
  items?: BookmarkItem[];
}

interface BookmarkItem {
  id: string;
  postId: string;
  title: string;
  excerpt: string;
  image?: string;
  author: string;
  addedAt: string;
  tags: string[];
}

interface BookmarkCollectionsProps {
  collections: BookmarkCollection[];
  onCreateCollection?: (collection: Partial<BookmarkCollection>) => void;
  onUpdateCollection?: (id: string, collection: Partial<BookmarkCollection>) => void;
  onDeleteCollection?: (id: string) => void;
  onAddToCollection?: (collectionId: string, postId: string) => void;
  onRemoveFromCollection?: (collectionId: string, itemId: string) => void;
  onViewCollection?: (collectionId: string) => void;
}

export function BookmarkCollections({
  collections,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
  onAddToCollection,
  onRemoveFromCollection,
  onViewCollection
}: BookmarkCollectionsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<BookmarkCollection | null>(null);

  const [newCollection, setNewCollection] = useState<Partial<BookmarkCollection>>({
    name: '',
    description: '',
    icon: '📚',
    color: '#98CA3F',
    visibility: 'private'
  });

  const availableIcons = ['📚', '💡', '🚀', '💻', '🎨', '📱', '⚡', '🔥', '⭐', '🎯', '🌟', '💎', '🏆', '🎓', '🔖'];
  const availableColors = [
    '#98CA3F', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
    '#10B981', '#EF4444', '#6366F1', '#14B8A6', '#F97316'
  ];

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCollection = () => {
    if (newCollection.name && newCollection.name.trim()) {
      onCreateCollection?.(newCollection);
      setShowCreateModal(false);
      setNewCollection({
        name: '',
        description: '',
        icon: '📚',
        color: '#98CA3F',
        visibility: 'private'
      });
    }
  };

  const visibilityIcons = {
    private: Lock,
    public: Globe,
    shared: Users
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mis Colecciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organiza tus artículos guardados en colecciones temáticas
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Nueva Colección
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar colecciones..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
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
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-800 text-[#98CA3F] shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {collections.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Colecciones</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {collections.reduce((sum, c) => sum + c.itemsCount, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Items Guardados</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {collections.filter(c => c.visibility === 'public').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Públicas</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {collections.filter(c => c.visibility === 'shared').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Compartidas</div>
        </div>
      </div>

      {/* Collections */}
      {filteredCollections.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center max-w-md mx-auto">
            <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No se encontraron colecciones' : 'No tienes colecciones'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery
                ? 'Intenta con otro término de búsqueda'
                : 'Crea tu primera colección para organizar tus artículos guardados'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium"
              >
                Crear Primera Colección
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => {
            const VisibilityIcon = visibilityIcons[collection.visibility];
            return (
              <div
                key={collection.id}
                className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-[#98CA3F]/50 transition-all group"
              >
                {/* Header */}
                <div
                  className="p-6"
                  style={{ backgroundColor: `${collection.color}15` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: collection.color }}
                    >
                      {collection.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg">
                        <VisibilityIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2 line-clamp-1">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {collection.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {collection.itemsCount} {collection.itemsCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-500">
                      Actualizado {new Date(collection.updatedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => onViewCollection?.(collection.id)}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[#98CA3F] hover:text-white transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Colección
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCollections.map((collection) => {
            const VisibilityIcon = visibilityIcons[collection.visibility];
            return (
              <div
                key={collection.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: collection.color }}
                  >
                    {collection.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        {collection.name}
                      </h3>
                      <VisibilityIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                      {collection.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{collection.itemsCount} items</span>
                      <span>•</span>
                      <span>Actualizado {new Date(collection.updatedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewCollection?.(collection.id)}
                      className="px-4 py-2 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium"
                    >
                      Ver
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Nueva Colección
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Nombre de la colección
                </label>
                <input
                  type="text"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                  placeholder="Ej: Tutoriales de React"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Descripción
                </label>
                <textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                  placeholder="Describe de qué trata esta colección..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Icono
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {availableIcons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewCollection({ ...newCollection, icon })}
                      className={`p-3 rounded-lg border-2 transition-all text-2xl ${
                        newCollection.icon === icon
                          ? 'border-[#98CA3F] bg-[#98CA3F]/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-[#98CA3F]/50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Color
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCollection({ ...newCollection, color })}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        newCollection.color === color
                          ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Visibilidad
                </label>
                <div className="space-y-2">
                  {(['private', 'public', 'shared'] as const).map((visibility) => (
                    <button
                      key={visibility}
                      onClick={() => setNewCollection({ ...newCollection, visibility })}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        newCollection.visibility === visibility
                          ? 'border-[#98CA3F] bg-[#98CA3F]/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-[#98CA3F]/50'
                      }`}
                    >
                      {visibility === 'private' && <Lock className="w-5 h-5" />}
                      {visibility === 'public' && <Globe className="w-5 h-5" />}
                      {visibility === 'shared' && <Users className="w-5 h-5" />}
                      <div className="text-left flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white capitalize">
                          {visibility === 'private' && 'Privada'}
                          {visibility === 'public' && 'Pública'}
                          {visibility === 'shared' && 'Compartida'}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {visibility === 'private' && 'Solo tú puedes ver esta colección'}
                          {visibility === 'public' && 'Cualquiera puede ver esta colección'}
                          {visibility === 'shared' && 'Compartida con personas específicas'}
                        </div>
                      </div>
                      {newCollection.visibility === visibility && (
                        <Check className="w-5 h-5 text-[#98CA3F]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={!newCollection.name?.trim()}
                className="flex-1 px-4 py-2.5 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Colección
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
