import { useState } from 'react';
import {
  FileText,
  Clock,
  Edit,
  Trash2,
  Copy,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Calendar,
  Tag,
  Folder,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Draft {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category?: string;
  tags: string[];
  lastSaved: string;
  createdAt: string;
  wordCount: number;
  status: 'draft' | 'review' | 'scheduled';
  scheduledFor?: string;
  coverImage?: string;
}

interface DraftManagerProps {
  drafts: Draft[];
  onEditDraft?: (draftId: string) => void;
  onDeleteDraft?: (draftId: string) => void;
  onDuplicateDraft?: (draftId: string) => void;
  onPreviewDraft?: (draftId: string) => void;
  onCreateNew?: () => void;
  onPublishDraft?: (draftId: string) => void;
}

export function DraftManager({
  drafts,
  onEditDraft,
  onDeleteDraft,
  onDuplicateDraft,
  onPreviewDraft,
  onCreateNew,
  onPublishDraft
}: DraftManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'review' | 'scheduled'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title'>('recent');
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Filter and sort drafts
  let filteredDrafts = drafts.filter(draft => {
    const matchesSearch = draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         draft.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         draft.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || draft.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  filteredDrafts = filteredDrafts.sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime();
      case 'oldest':
        return new Date(a.lastSaved).getTime() - new Date(b.lastSaved).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const toggleSelection = (draftId: string) => {
    setSelectedDrafts(prev =>
      prev.includes(draftId) ? prev.filter(id => id !== draftId) : [...prev, draftId]
    );
  };

  const handleBulkDelete = () => {
    if (confirm(`¿Eliminar ${selectedDrafts.length} borradores?`)) {
      selectedDrafts.forEach(id => onDeleteDraft?.(id));
      setSelectedDrafts([]);
    }
  };

  const statusConfig = {
    draft: { label: 'Borrador', color: 'gray', icon: FileText },
    review: { label: 'En revisión', color: 'yellow', icon: AlertCircle },
    scheduled: { label: 'Programado', color: 'blue', icon: Calendar }
  };

  const stats = {
    total: drafts.length,
    draft: drafts.filter(d => d.status === 'draft').length,
    review: drafts.filter(d => d.status === 'review').length,
    scheduled: drafts.filter(d => d.status === 'scheduled').length,
    totalWords: drafts.reduce((sum, d) => sum + d.wordCount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gestor de Borradores
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra tus artículos en proceso
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Nuevo Borrador
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.draft}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Borradores</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.review}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">En Revisión</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.scheduled}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Programados</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {(stats.totalWords / 1000).toFixed(1)}k
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Palabras</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar borradores..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#98CA3F]"
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borradores</option>
              <option value="review">En revisión</option>
              <option value="scheduled">Programados</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#98CA3F]"
            >
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="title">Por título</option>
            </select>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedDrafts.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
              {selectedDrafts.length} seleccionados
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={() => setSelectedDrafts([])}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drafts List */}
      {filteredDrafts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12">
          <div className="text-center max-w-md mx-auto">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No se encontraron borradores' : 'No tienes borradores'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery
                ? 'Intenta con otro término de búsqueda'
                : 'Comienza a escribir tu próximo artículo'}
            </p>
            {!searchQuery && (
              <button
                onClick={onCreateNew}
                className="px-6 py-3 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium"
              >
                Crear Primer Borrador
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDrafts.map((draft) => {
            const config = statusConfig[draft.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={draft.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="flex gap-4 p-5">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedDrafts.includes(draft.id)}
                    onChange={() => toggleSelection(draft.id)}
                    className="w-5 h-5 rounded border-gray-300 text-[#98CA3F] focus:ring-[#98CA3F] mt-1"
                  />

                  {/* Cover Image */}
                  {draft.coverImage && (
                    <img
                      src={draft.coverImage}
                      alt={draft.title}
                      className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Status badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          config.color === 'gray'
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            : config.color === 'yellow'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                      {draft.category && (
                        <span className="inline-block px-2.5 py-1 bg-[#98CA3F]/10 text-[#98CA3F] rounded-full text-xs font-semibold">
                          {draft.category}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-1">
                      {draft.title || 'Sin título'}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {draft.excerpt || draft.content.substring(0, 150)}
                    </p>

                    {/* Tags */}
                    {draft.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {draft.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                        {draft.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{draft.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Guardado {new Date(draft.lastSaved).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span>{draft.wordCount.toLocaleString()} palabras</span>
                      {draft.scheduledFor && (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(draft.scheduledFor).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditDraft?.(draft.id)}
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => onPreviewDraft?.(draft.id)}
                      className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                      title="Vista previa"
                    >
                      <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </button>
                    <button
                      onClick={() => onDuplicateDraft?.(draft.id)}
                      className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                      title="Duplicar"
                    >
                      <Copy className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(showMenu === draft.id ? null : draft.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>

                      {showMenu === draft.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowMenu(null)}
                          />
                          <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]">
                            <button
                              onClick={() => {
                                onPublishDraft?.(draft.id);
                                setShowMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">Publicar</span>
                            </button>
                            <button
                              onClick={() => {
                                onDeleteDraft?.(draft.id);
                                setShowMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                              <span className="text-sm text-red-600 dark:text-red-400">Eliminar</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
