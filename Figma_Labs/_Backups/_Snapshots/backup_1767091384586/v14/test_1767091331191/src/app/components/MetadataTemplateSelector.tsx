/**
 * METADATA TEMPLATE SELECTOR
 * Selector de templates predefinidos + custom con preview
 * 
 * v8.0: Integración con Custom Templates
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  BookOpen,
  Code,
  GraduationCap,
  Star,
  CheckCircle2,
  X,
  Eye,
  Sparkles,
  Plus,
  Edit,
} from 'lucide-react';
import { useMetadataTemplates } from '../hooks/useMetadataTemplates';
import type { MetadataTemplate } from '../services/metadataService';
import type { DocumentMetadata } from '../types/documentation';

interface MetadataTemplateSelectorProps {
  /**
   * Callback cuando se selecciona un template
   */
  onSelectTemplate: (metadata: Partial<DocumentMetadata>) => void;
  
  /**
   * Callback para cerrar
   */
  onClose: () => void;
  
  /**
   * Callback para abrir custom template creator
   */
  onOpenCustomTemplateCreator?: () => void;
  
  /**
   * Metadata inicial para override
   */
  initialMetadata?: Partial<DocumentMetadata>;
}

// Custom Template interface (from CustomTemplateCreator)
interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  metadata: Partial<DocumentMetadata>;
  createdAt: string;
  updatedAt: string;
  isCustom: true;
}

// Iconos por categoría
const CATEGORY_ICONS = {
  roadmap: Star,
  guide: BookOpen,
  api: Code,
  tutorial: GraduationCap,
  'best-practices': CheckCircle2,
  other: FileText,
};

const CATEGORY_COLORS = {
  roadmap: 'from-purple-500 to-pink-500',
  guide: 'from-blue-500 to-cyan-500',
  api: 'from-cyan-500 to-teal-500',
  tutorial: 'from-orange-500 to-red-500',
  'best-practices': 'from-green-500 to-emerald-500',
  other: 'from-gray-500 to-slate-500',
};

/**
 * Cargar custom templates desde localStorage
 */
function loadCustomTemplates(): CustomTemplate[] {
  try {
    const stored = localStorage.getItem('custom-metadata-templates');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading custom templates:', error);
    return [];
  }
}

export function MetadataTemplateSelector({
  onSelectTemplate,
  onClose,
  onOpenCustomTemplateCreator,
  initialMetadata = {},
}: MetadataTemplateSelectorProps) {
  const { templates } = useMetadataTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<MetadataTemplate | CustomTemplate | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [showCustomOnly, setShowCustomOnly] = useState(false);

  // Cargar custom templates
  const customTemplates = useMemo(() => loadCustomTemplates(), []);

  // Combinar templates predefinidos + custom
  const allTemplates = useMemo(() => {
    if (showCustomOnly) {
      return customTemplates;
    }
    return [...templates, ...customTemplates];
  }, [templates, customTemplates, showCustomOnly]);

  /**
   * Aplicar template
   */
  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    const metadata = {
      ...selectedTemplate.metadata,
      ...initialMetadata, // Override con metadata inicial
      date: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString(),
    };

    onSelectTemplate(metadata);
  };

  /**
   * Preview de metadata del template
   */
  const renderPreview = (template: MetadataTemplate | CustomTemplate) => {
    const { metadata } = template;
    
    return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
            Title
          </label>
          <p className="text-sm text-gray-900 dark:text-white">{metadata.title}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
            Description
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400">{metadata.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
              Category
            </label>
            <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              {metadata.category}
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
              Status
            </label>
            <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              {metadata.status}
            </span>
          </div>
        </div>

        {metadata.tags && metadata.tags.length > 0 && (
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-1">
              {metadata.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {metadata.version && (
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
              Version
            </label>
            <p className="text-sm text-gray-900 dark:text-white">{metadata.version}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Choose a Template
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start with a pre-configured metadata template
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Filter Tabs + Create Custom Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCustomOnly(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !showCustomOnly
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Templates ({templates.length + customTemplates.length})
              </button>
              
              <button
                onClick={() => setShowCustomOnly(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showCustomOnly
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Custom Only ({customTemplates.length})
              </button>
            </div>

            {onOpenCustomTemplateCreator && (
              <button
                onClick={onOpenCustomTemplateCreator}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Custom
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTemplates.map((template) => {
              const Icon = CATEGORY_ICONS[template.category as keyof typeof CATEGORY_ICONS] || FileText;
              const gradientColor = CATEGORY_COLORS[template.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.other;
              const isSelected = selectedTemplate?.id === template.id;
              const isPreview = showPreview === template.id;

              return (
                <div key={template.id} className="relative">
                  {/* Template Card */}
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    {/* Icon & Title */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 bg-gradient-to-r ${gradientColor} rounded-lg flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Preview Compact */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                        {template.metadata.category}
                      </span>
                      
                      {template.metadata.tags && template.metadata.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      
                      {template.metadata.tags && template.metadata.tags.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500">
                          +{template.metadata.tags.length - 2} more
                        </span>
                      )}
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="p-1 bg-blue-500 rounded-full">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Preview Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPreview(isPreview ? null : template.id);
                    }}
                    className="absolute bottom-2 right-2 p-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    title="Preview full metadata"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                  </button>

                  {/* Expanded Preview */}
                  {isPreview && (
                    <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Full Metadata Preview
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPreview(null);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                        >
                          <X className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                      {renderPreview(template)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {allTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No templates available
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedTemplate ? (
              <span>
                Selected: <span className="font-medium text-gray-900 dark:text-white">{selectedTemplate.name}</span>
              </span>
            ) : (
              <span>Select a template to continue</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate}
              className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Apply Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}