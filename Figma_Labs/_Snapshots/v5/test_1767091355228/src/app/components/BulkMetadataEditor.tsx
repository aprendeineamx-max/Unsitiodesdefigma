/**
 * BULK METADATA EDITOR
 * Editor en batch para actualizar metadata de múltiples documentos
 */

import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { metadataService } from '../services/metadataService';
import type { DiscoveredDocument, DocumentMetadata, DocumentCategory, DocumentStatus } from '../types/documentation';

interface BulkMetadataEditorProps {
  /**
   * Documentos disponibles
   */
  documents: DiscoveredDocument[];
  
  /**
   * Callback cuando se guardan cambios
   */
  onSave: (updates: Array<{ document: DiscoveredDocument; metadata: Partial<DocumentMetadata> }>) => void;
  
  /**
   * Callback para cerrar
   */
  onClose: () => void;
  
  /**
   * Si está en modo loading
   */
  isLoading?: boolean;
}

const CATEGORIES: Array<{ value: DocumentCategory; label: string }> = [
  { value: 'roadmap', label: 'Roadmap' },
  { value: 'guide', label: 'Guide' },
  { value: 'api', label: 'API Documentation' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'best-practices', label: 'Best Practices' },
  { value: 'other', label: 'Other' },
];

const STATUSES: Array<{ value: DocumentStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

interface BulkUpdate {
  updateCategory?: boolean;
  category?: DocumentCategory;
  updateStatus?: boolean;
  status?: DocumentStatus;
  updateAuthor?: boolean;
  author?: string;
  updateVersion?: boolean;
  version?: string;
  addTags?: string[];
  removeTags?: string[];
}

export function BulkMetadataEditor({
  documents,
  onSave,
  onClose,
  isLoading = false,
}: BulkMetadataEditorProps) {
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all');
  const [previewChanges, setPreviewChanges] = useState(false);

  const { control, watch, handleSubmit, reset } = useForm<BulkUpdate>({
    defaultValues: {
      updateCategory: false,
      updateStatus: false,
      updateAuthor: false,
      updateVersion: false,
      addTags: [],
      removeTags: [],
    },
  });

  const watchedFields = watch();

  /**
   * Documentos filtrados
   */
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (filterCategory !== 'all' && doc.metadata.category !== filterCategory) return false;
      if (filterStatus !== 'all' && doc.metadata.status !== filterStatus) return false;
      return true;
    });
  }, [documents, filterCategory, filterStatus]);

  /**
   * Toggle selección de documento
   */
  const toggleDocument = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };

  /**
   * Seleccionar/Deseleccionar todos
   */
  const toggleAll = () => {
    if (selectedDocs.size === filteredDocuments.length) {
      setSelectedDocs(new Set());
    } else {
      setSelectedDocs(new Set(filteredDocuments.map(d => d.id)));
    }
  };

  /**
   * Aplicar cambios
   */
  const handleApplyChanges = handleSubmit((data) => {
    const selectedDocuments = documents.filter(d => selectedDocs.has(d.id));
    
    const updates = selectedDocuments.map(doc => {
      const newMetadata: Partial<DocumentMetadata> = { ...doc.metadata };

      // Aplicar actualizaciones condicionales
      if (data.updateCategory && data.category) {
        newMetadata.category = data.category;
      }
      
      if (data.updateStatus && data.status) {
        newMetadata.status = data.status;
      }
      
      if (data.updateAuthor && data.author) {
        newMetadata.author = data.author;
      }
      
      if (data.updateVersion && data.version) {
        newMetadata.version = data.version;
      }

      // Tags: agregar
      if (data.addTags && data.addTags.length > 0) {
        const currentTags = newMetadata.tags || [];
        newMetadata.tags = [...new Set([...currentTags, ...data.addTags])];
      }

      // Tags: remover
      if (data.removeTags && data.removeTags.length > 0) {
        newMetadata.tags = (newMetadata.tags || []).filter(
          tag => !data.removeTags?.includes(tag)
        );
      }

      // Auto-fix metadata
      const fixedMetadata = metadataService.autofix(newMetadata);

      return {
        document: doc,
        metadata: fixedMetadata,
      };
    });

    onSave(updates);
  });

  /**
   * Preview de cambios
   */
  const renderPreview = () => {
    const selectedDocuments = documents.filter(d => selectedDocs.has(d.id));
    
    return (
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
          Changes Preview
        </h4>
        <div className="space-y-2 text-sm">
          <p className="text-blue-700 dark:text-blue-300">
            <span className="font-medium">{selectedDocuments.length} documents</span> will be updated:
          </p>
          
          <ul className="space-y-1 ml-4">
            {watchedFields.updateCategory && (
              <li className="text-blue-700 dark:text-blue-300">
                • Category → <span className="font-medium">{watchedFields.category}</span>
              </li>
            )}
            {watchedFields.updateStatus && (
              <li className="text-blue-700 dark:text-blue-300">
                • Status → <span className="font-medium">{watchedFields.status}</span>
              </li>
            )}
            {watchedFields.updateAuthor && (
              <li className="text-blue-700 dark:text-blue-300">
                • Author → <span className="font-medium">{watchedFields.author}</span>
              </li>
            )}
            {watchedFields.updateVersion && (
              <li className="text-blue-700 dark:text-blue-300">
                • Version → <span className="font-medium">{watchedFields.version}</span>
              </li>
            )}
            {watchedFields.addTags && watchedFields.addTags.length > 0 && (
              <li className="text-blue-700 dark:text-blue-300">
                • Add tags: {watchedFields.addTags.join(', ')}
              </li>
            )}
            {watchedFields.removeTags && watchedFields.removeTags.length > 0 && (
              <li className="text-blue-700 dark:text-blue-300">
                • Remove tags: {watchedFields.removeTags.join(', ')}
              </li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Bulk Metadata Editor
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Update metadata for multiple documents at once
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Document List */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Filters & Selection */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAll}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {selectedDocs.size === filteredDocuments.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  {selectedDocs.size === filteredDocuments.length ? 'Deselect' : 'Select'} All
                </button>

                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedDocs.size} / {filteredDocuments.length} selected
                </span>
              </div>

              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as DocumentCategory | 'all')}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as DocumentStatus | 'all')}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="all">All Statuses</option>
                  {STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredDocuments.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => toggleDocument(doc.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedDocs.has(doc.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      {selectedDocs.has(doc.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate mb-1">
                        {doc.metadata.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                          {doc.metadata.category}
                        </span>
                        {doc.metadata.status && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                            {doc.metadata.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {filteredDocuments.length === 0 && (
                <div className="text-center py-12">
                  <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No documents match the filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Update Form */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <form className="space-y-6">
                {/* Category Update */}
                <div>
                  <Controller
                    name="updateCategory"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Update Category
                        </span>
                      </label>
                    )}
                  />
                  {watchedFields.updateCategory && (
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      )}
                    />
                  )}
                </div>

                {/* Status Update */}
                <div>
                  <Controller
                    name="updateStatus"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Update Status
                        </span>
                      </label>
                    )}
                  />
                  {watchedFields.updateStatus && (
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        >
                          {STATUSES.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      )}
                    />
                  )}
                </div>

                {/* Author Update */}
                <div>
                  <Controller
                    name="updateAuthor"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Update Author
                        </span>
                      </label>
                    )}
                  />
                  {watchedFields.updateAuthor && (
                    <Controller
                      name="author"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Author name"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      )}
                    />
                  )}
                </div>

                {/* Version Update */}
                <div>
                  <Controller
                    name="updateVersion"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Update Version
                        </span>
                      </label>
                    )}
                  />
                  {watchedFields.updateVersion && (
                    <Controller
                      name="version"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="1.0.0"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      )}
                    />
                  )}
                </div>

                {/* Preview */}
                {selectedDocs.size > 0 && renderPreview()}
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleApplyChanges}
                    disabled={selectedDocs.size === 0 || isLoading}
                    className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Apply to {selectedDocs.size} Documents
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
