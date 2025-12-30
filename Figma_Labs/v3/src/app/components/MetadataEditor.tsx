/**
 * METADATA EDITOR - Editor Visual de Frontmatter
 * Componente enterprise para edición de metadata de documentos
 */

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  X, 
  Wand2,
  Eye,
  Code,
  Sparkles
} from 'lucide-react';
import { useMetadataValidation } from '../hooks/useMetadataValidation';
import { useMetadataTemplates } from '../hooks/useMetadataTemplates';
import { metadataService } from '../services/metadataService';
import type { DocumentMetadata, DocumentCategory, DocumentStatus } from '../types/documentation';

interface MetadataEditorProps {
  /**
   * Metadata inicial
   */
  initialMetadata: Partial<DocumentMetadata>;
  
  /**
   * Callback cuando se guarda
   */
  onSave: (metadata: Partial<DocumentMetadata>) => void;
  
  /**
   * Callback para cerrar
   */
  onClose: () => void;
  
  /**
   * Si está en modo loading
   */
  isLoading?: boolean;
  
  /**
   * Contenido del documento (para sugerencias de tags)
   */
  documentContent?: string;
}

const CATEGORIES: Array<{ value: DocumentCategory; label: string }> = [
  { value: 'roadmap', label: 'Roadmap' },
  { value: 'guide', label: 'Guide' },
  { value: 'api', label: 'API Documentation' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'best-practices', label: 'Best Practices' },
  { value: 'other', label: 'Other' },
];

const STATUSES: Array<{ value: DocumentStatus; label: string; color: string }> = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { value: 'review', label: 'Review', color: 'bg-yellow-500' },
  { value: 'published', label: 'Published', color: 'bg-green-500' },
  { value: 'archived', label: 'Archived', color: 'bg-red-500' },
];

export function MetadataEditor({
  initialMetadata,
  onSave,
  onClose,
  isLoading = false,
  documentContent = '',
}: MetadataEditorProps) {
  const [currentMetadata, setCurrentMetadata] = useState<Partial<DocumentMetadata>>(initialMetadata);
  const [showYamlPreview, setShowYamlPreview] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  // Form management con react-hook-form
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<Partial<DocumentMetadata>>({
    defaultValues: initialMetadata,
  });

  // Validation hook con debounce
  const { 
    validation, 
    isValidating, 
    hasErrors, 
    hasWarnings,
    applyAutoFix 
  } = useMetadataValidation(currentMetadata, {
    debounceMs: 300,
    autoValidate: true,
    autoFix: false,
  });

  // Templates hook
  const { filteredTemplates, selectTemplate, applyTemplate } = useMetadataTemplates({
    category: currentMetadata.category,
  });

  // Watch form changes
  const watchedFields = watch();
  
  useEffect(() => {
    setCurrentMetadata(watchedFields);
  }, [watchedFields]);

  // Sugerencias de tags basadas en contenido
  useEffect(() => {
    if (documentContent) {
      const existingTags = currentMetadata.tags || [];
      const suggestions = metadataService.suggestTags(documentContent, existingTags);
      setSuggestedTags(suggestions);
    }
  }, [documentContent, currentMetadata.tags]);

  /**
   * Handler para guardar
   */
  const handleSave = handleSubmit((data) => {
    // Auto-fix antes de guardar
    const fixedData = applyAutoFix(data);
    onSave(fixedData);
  });

  /**
   * Aplicar auto-fix manualmente
   */
  const handleAutoFix = () => {
    const fixed = applyAutoFix(currentMetadata);
    Object.entries(fixed).forEach(([key, value]) => {
      setValue(key as keyof DocumentMetadata, value);
    });
  };

  /**
   * Agregar tag sugerido
   */
  const handleAddSuggestedTag = (tag: string) => {
    const currentTags = currentMetadata.tags || [];
    if (!currentTags.includes(tag)) {
      setValue('tags', [...currentTags, tag]);
    }
  };

  /**
   * Remover tag
   */
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = currentMetadata.tags || [];
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  /**
   * Generar preview YAML
   */
  const generateYamlPreview = () => {
    const yaml = metadataService.stringify(currentMetadata, '');
    return yaml.split('---\n')[1]?.split('---')[0] || '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Metadata Editor
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Edit document frontmatter properties
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Validation Status */}
        {validation && (
          <div className="px-6 pt-4">
            {hasErrors && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 dark:text-red-100 text-sm mb-1">
                    Validation Errors ({validation.errors.length})
                  </h4>
                  <ul className="space-y-1">
                    {validation.errors.map((error, i) => (
                      <li key={i} className="text-sm text-red-700 dark:text-red-300">
                        <span className="font-medium">{error.field}:</span> {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {!hasErrors && hasWarnings && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 text-sm mb-1">
                    Warnings ({validation.warnings.length})
                  </h4>
                  <ul className="space-y-1">
                    {validation.warnings.map((warning, i) => (
                      <li key={i} className="text-sm text-yellow-700 dark:text-yellow-300">
                        <span className="font-medium">{warning.field}:</span> {warning.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {!hasErrors && !hasWarnings && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                  All metadata is valid ✓
                </span>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <form className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required', minLength: 3 }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter document title..."
                  />
                )}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Brief description of the document..."
                  />
                )}
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2">
                      {STATUSES.map(status => (
                        <button
                          key={status.value}
                          type="button"
                          onClick={() => field.onChange(status.value)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            field.value === status.value
                              ? `${status.color} text-white`
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              
              {/* Current Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {(currentMetadata.tags || []).map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggested Tags */}
              {suggestedTags.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                      Suggested tags
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddSuggestedTag(tag)}
                        className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Tag Input */}
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type a tag and press Enter..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const newTag = input.value.trim().toLowerCase();
                        if (newTag && !(field.value || []).includes(newTag)) {
                          field.onChange([...(field.value || []), newTag]);
                          input.value = '';
                        }
                      }
                    }}
                  />
                )}
              />
            </div>

            {/* Author, Date, Version */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Author
                </label>
                <Controller
                  name="author"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Author name"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Version
                </label>
                <Controller
                  name="version"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1.0.0"
                    />
                  )}
                />
              </div>
            </div>

            {/* YAML Preview */}
            {showYamlPreview && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    YAML Preview
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowYamlPreview(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Hide
                  </button>
                </div>
                <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-sm overflow-x-auto">
                  {generateYamlPreview()}
                </pre>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoFix}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              Auto-Fix
            </button>
            
            <button
              type="button"
              onClick={() => setShowYamlPreview(!showYamlPreview)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showYamlPreview ? 'Hide' : 'Show'} YAML
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={hasErrors || isLoading || isValidating}
              className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
