/**
 * DOCUMENT PROPERTIES PANEL
 * Panel lateral con propiedades del documento y edición inline
 */

import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  User,
  Tag,
  FolderOpen,
  GitBranch,
  Clock,
  Edit2,
  Check,
  X,
  AlertCircle,
  Info,
  TrendingUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { DiscoveredDocument } from '../types/documentation';

interface DocumentPropertiesPanelProps {
  /**
   * Documento actual
   */
  document: DiscoveredDocument | null;
  
  /**
   * Callback para abrir editor completo
   */
  onOpenEditor: () => void;
  
  /**
   * Si el panel está colapsado
   */
  isCollapsed?: boolean;
  
  /**
   * Callback para toggle collapse
   */
  onToggleCollapse?: () => void;
}

export function DocumentPropertiesPanel({
  document,
  onOpenEditor,
  isCollapsed = false,
  onToggleCollapse,
}: DocumentPropertiesPanelProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null);

  if (!document) {
    return (
      <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <FileText className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select a document to view properties
          </p>
        </div>
      </div>
    );
  }

  const { metadata, lastModified, size, filename } = document;

  /**
   * Formato de tamaño de archivo
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /**
   * Color de status
   */
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'review':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'draft':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'archived':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  /**
   * Color de categoría
   */
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'roadmap':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'guide':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'api':
        return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';
      case 'tutorial':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'best-practices':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Document Properties
          </h3>
          <button
            onClick={onOpenEditor}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Open full editor"
          >
            <Edit2 className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {filename}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Title */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {metadata.title}
          </h4>
          {metadata.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {metadata.description}
            </p>
          )}
        </div>

        {/* Status & Category */}
        <div className="space-y-3">
          {/* Status */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Status
            </label>
            <div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(metadata.status)}`}>
                {metadata.status || 'draft'}
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              <FolderOpen className="w-3.5 h-3.5" />
              Category
            </label>
            <div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(metadata.category)}`}>
                {metadata.category || 'other'}
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {metadata.tags && metadata.tags.length > 0 && (
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              <Tag className="w-3.5 h-3.5" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {metadata.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Separator */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Metadata Details */}
        <div className="space-y-3">
          {/* Author */}
          {metadata.author && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Author</p>
                <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
                  {metadata.author}
                </p>
              </div>
            </div>
          )}

          {/* Date */}
          {metadata.date && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {new Date(metadata.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Last Modified */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Last Modified</p>
              <p className="text-sm text-gray-900 dark:text-white font-medium">
                {formatDistanceToNow(lastModified, { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Version */}
          {metadata.version && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <GitBranch className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Version</p>
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {metadata.version}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* File Info */}
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            File Information
          </h5>
          
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Size</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {formatFileSize(size)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Path</span>
              <span className="text-gray-900 dark:text-white font-medium truncate ml-2" title={document.path}>
                {document.path.split('/').pop()}
              </span>
            </div>
          </div>
        </div>

        {/* Validation Warning */}
        {(!metadata.description || !metadata.author || !metadata.tags || metadata.tags.length === 0) && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700" />
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h6 className="text-xs font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                    Incomplete Metadata
                  </h6>
                  <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-0.5">
                    {!metadata.description && <li>• Missing description</li>}
                    {!metadata.author && <li>• Missing author</li>}
                    {(!metadata.tags || metadata.tags.length === 0) && <li>• No tags added</li>}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Help Tip */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Click the edit icon to open the full metadata editor with validation and templates.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onOpenEditor}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" />
          Edit Metadata
        </button>
      </div>
    </div>
  );
}
