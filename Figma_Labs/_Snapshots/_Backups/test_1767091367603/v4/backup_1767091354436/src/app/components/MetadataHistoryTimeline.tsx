/**
 * METADATA HISTORY TIMELINE
 * Timeline vertical profesional para visualizar historial de cambios
 * 
 * Features:
 * - Timeline vertical con eventos
 * - Categorización por tipo de acción
 * - Filtros por fecha y tipo
 * - Diff viewer integrado
 * - Restore confirmation
 * - Undo/Redo support
 * - Real-time updates
 */

import React, { useState, useMemo } from 'react';
import {
  Clock,
  Edit,
  Save,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  Filter,
  Search,
  Download,
  Copy,
  ChevronDown,
  ChevronRight,
  GitBranch,
} from 'lucide-react';
import { toast } from 'sonner';
import { MetadataVersionDiff } from './MetadataVersionDiff';
import type { DocumentMetadata } from '../types/documentation';

export interface MetadataHistoryEntry {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'bulk-update';
  documentPath: string;
  documentTitle: string;
  author: string;
  description: string;
  metadataBefore: Partial<DocumentMetadata> | null;
  metadataAfter: Partial<DocumentMetadata>;
  changeCount: number;
  tags: string[];
}

interface MetadataHistoryTimelineProps {
  entries: MetadataHistoryEntry[];
  onRestore: (entry: MetadataHistoryEntry) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  currentDocumentPath?: string;
}

const ACTION_ICONS = {
  create: Save,
  update: Edit,
  delete: Trash2,
  restore: RotateCcw,
  'bulk-update': GitBranch,
};

const ACTION_COLORS = {
  create: 'from-green-500 to-emerald-500',
  update: 'from-blue-500 to-cyan-500',
  delete: 'from-red-500 to-rose-500',
  restore: 'from-purple-500 to-pink-500',
  'bulk-update': 'from-orange-500 to-amber-500',
};

const ACTION_LABELS = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  restore: 'Restored',
  'bulk-update': 'Bulk Update',
};

export function MetadataHistoryTimeline({
  entries,
  onRestore,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  currentDocumentPath,
}: MetadataHistoryTimelineProps) {
  const [selectedEntry, setSelectedEntry] = useState<MetadataHistoryEntry | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  /**
   * Filtrar entries
   */
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Filtrar por documento actual si está especificado
    if (currentDocumentPath) {
      filtered = filtered.filter(e => e.documentPath === currentDocumentPath);
    }

    // Filtrar por tipo de acción
    if (filterAction !== 'all') {
      filtered = filtered.filter(e => e.action === filterAction);
    }

    // Filtrar por fecha
    if (filterDate !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(e => {
        const entryDate = new Date(e.timestamp);
        
        switch (filterDate) {
          case 'today':
            return entryDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return entryDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return entryDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.documentTitle.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search) ||
        e.author.toLowerCase().includes(search) ||
        e.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    return filtered;
  }, [entries, filterAction, filterDate, searchTerm, currentDocumentPath]);

  /**
   * Formatear timestamp
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  /**
   * Formatear fecha completa
   */
  const formatFullDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Toggle expandir entry
   */
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEntries(newExpanded);
  };

  /**
   * Ver diff
   */
  const handleViewDiff = (entry: MetadataHistoryEntry) => {
    setSelectedEntry(entry);
    setShowDiff(true);
  };

  /**
   * Restaurar versión
   */
  const handleRestore = (entry: MetadataHistoryEntry) => {
    if (confirm(`Are you sure you want to restore this version?\n\n"${entry.description}"\n\nThis will create a new entry in the history.`)) {
      onRestore(entry);
      toast.success('Version restored successfully');
    }
  };

  /**
   * Exportar historial
   */
  const handleExport = () => {
    const json = JSON.stringify(filteredEntries, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metadata-history-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('History exported');
  };

  /**
   * Copiar historial
   */
  const handleCopy = () => {
    const json = JSON.stringify(filteredEntries, null, 2);
    navigator.clipboard.writeText(json);
    toast.success('History copied to clipboard');
  };

  /**
   * Agrupar entries por fecha
   */
  const groupedEntries = useMemo(() => {
    const groups: Record<string, MetadataHistoryEntry[]> = {};
    
    filteredEntries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });

    return groups;
  }, [filteredEntries]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Metadata History
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredEntries.length} version{filteredEntries.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo (Cmd+Z)"
            >
              <RotateCcw className="w-5 h-5 text-gray-500" />
            </button>

            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform rotate-180"
              title="Redo (Cmd+Shift+Z)"
            >
              <RotateCcw className="w-5 h-5 text-gray-500" />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

            {/* Export/Copy */}
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Copy history"
            >
              <Copy className="w-5 h-5 text-gray-500" />
            </button>

            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Export history"
            >
              <Download className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* Filter by action */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All actions</option>
            <option value="create">Created</option>
            <option value="update">Updated</option>
            <option value="delete">Deleted</option>
            <option value="restore">Restored</option>
            <option value="bulk-update">Bulk updates</option>
          </select>

          {/* Filter by date */}
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-6">
        {Object.keys(groupedEntries).length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No history entries
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchTerm || filterAction !== 'all' || filterDate !== 'all'
                ? 'No entries match your filters. Try adjusting them.'
                : 'Start making changes to documents to see history here.'}
            </p>
          </div>
        ) : (
          /* Timeline Groups */
          <div className="space-y-8">
            {Object.entries(groupedEntries).map(([dateKey, dateEntries]) => (
              <div key={dateKey}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {dateKey}
                  </h3>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>

                {/* Timeline Entries */}
                <div className="relative pl-8 space-y-6">
                  {/* Vertical Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                  {dateEntries.map((entry, index) => {
                    const Icon = ACTION_ICONS[entry.action];
                    const isExpanded = expandedEntries.has(entry.id);

                    return (
                      <div key={entry.id} className="relative">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-6 top-2 w-4 h-4 rounded-full bg-gradient-to-r ${ACTION_COLORS[entry.action]} border-4 border-white dark:border-gray-800`} />

                        {/* Entry Card */}
                        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all">
                          {/* Header */}
                          <div
                            className="p-4 cursor-pointer"
                            onClick={() => toggleExpand(entry.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`p-2 bg-gradient-to-r ${ACTION_COLORS[entry.action]} rounded-lg`}>
                                  <Icon className="w-4 h-4 text-white" />
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {ACTION_LABELS[entry.action]}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {formatTimestamp(entry.timestamp)}
                                    </span>
                                  </div>

                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    {entry.description}
                                  </p>

                                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {entry.author}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Edit className="w-3 h-3" />
                                      {entry.changeCount} change{entry.changeCount !== 1 ? 's' : ''}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatFullDate(entry.timestamp)}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors">
                                {isExpanded ? (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-600">
                              <div className="pt-4 space-y-3">
                                {/* Tags */}
                                {entry.tags.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                      Tags
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                      {entry.tags.map(tag => (
                                        <span
                                          key={tag}
                                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-2">
                                  <button
                                    onClick={() => handleViewDiff(entry)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded transition-colors text-sm"
                                  >
                                    <GitBranch className="w-4 h-4" />
                                    View Changes
                                  </button>

                                  {entry.action !== 'delete' && (
                                    <button
                                      onClick={() => handleRestore(entry)}
                                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded transition-colors text-sm"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                      Restore
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diff Viewer Modal */}
      {showDiff && selectedEntry && (
        <MetadataVersionDiff
          before={selectedEntry.metadataBefore}
          after={selectedEntry.metadataAfter}
          documentTitle={selectedEntry.documentTitle}
          timestamp={selectedEntry.timestamp}
          onClose={() => {
            setShowDiff(false);
            setSelectedEntry(null);
          }}
          onRestore={() => handleRestore(selectedEntry)}
        />
      )}
    </div>
  );
}
