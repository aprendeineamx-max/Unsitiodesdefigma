/**
 * CUSTOM TEMPLATE CREATOR
 * Componente para crear, editar y gestionar templates personalizados
 * 
 * Features:
 * - Crear templates desde cero
 * - Duplicar templates existentes
 * - Importar/Exportar templates (JSON)
 * - Preview en tiempo real
 * - Guardar en localStorage
 * - Validación completa
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Save,
  Download,
  Upload,
  Copy,
  Trash2,
  Eye,
  Edit,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { metadataService } from '../services/metadataService';
import type { DocumentMetadata } from '../types/documentation';

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

interface CustomTemplateCreatorProps {
  onClose: () => void;
  onSelectTemplate: (metadata: Partial<DocumentMetadata>) => void;
  initialTemplate?: CustomTemplate;
}

const STORAGE_KEY = 'custom-metadata-templates';

/**
 * Servicio de templates personalizados
 */
class CustomTemplateService {
  /**
   * Obtener todos los templates custom
   */
  getAll(): CustomTemplate[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading custom templates:', error);
      return [];
    }
  }

  /**
   * Guardar template
   */
  save(template: CustomTemplate): void {
    const templates = this.getAll();
    const index = templates.findIndex(t => t.id === template.id);
    
    if (index >= 0) {
      templates[index] = {
        ...template,
        updatedAt: new Date().toISOString(),
      };
    } else {
      templates.push(template);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }

  /**
   * Eliminar template
   */
  delete(id: string): boolean {
    const templates = this.getAll();
    const filtered = templates.filter(t => t.id !== id);
    
    if (filtered.length === templates.length) {
      return false; // No se encontró
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  /**
   * Exportar template a JSON
   */
  export(template: CustomTemplate): string {
    return JSON.stringify(template, null, 2);
  }

  /**
   * Importar template desde JSON
   */
  import(json: string): CustomTemplate {
    const template = JSON.parse(json);
    
    // Validar estructura
    if (!template.name || !template.metadata) {
      throw new Error('Invalid template format');
    }

    // Generar nuevo ID
    return {
      ...template,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      isCustom: true as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Duplicar template
   */
  duplicate(template: CustomTemplate): CustomTemplate {
    return {
      ...template,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

const customTemplateService = new CustomTemplateService();

export function CustomTemplateCreator({ onClose, onSelectTemplate, initialTemplate }: CustomTemplateCreatorProps) {
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [isCreating, setIsCreating] = useState(!!initialTemplate);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(initialTemplate || null);
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [name, setName] = useState(initialTemplate?.name || '');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [icon, setIcon] = useState(initialTemplate?.icon || '📄');
  const [title, setTitle] = useState(initialTemplate?.metadata.title || '');
  const [metaDescription, setMetaDescription] = useState(initialTemplate?.metadata.description || '');
  const [category, setCategory] = useState<DocumentMetadata['category']>(initialTemplate?.metadata.category || 'guide');
  const [status, setStatus] = useState<DocumentMetadata['status']>(initialTemplate?.metadata.status || 'draft');
  const [tags, setTags] = useState<string>(initialTemplate?.metadata.tags?.join(', ') || '');
  const [author, setAuthor] = useState(initialTemplate?.metadata.author || '');
  const [version, setVersion] = useState(initialTemplate?.metadata.version || '1.0.0');

  /**
   * Cargar templates al montar
   */
  useEffect(() => {
    loadTemplates();
  }, []);

  /**
   * Cargar templates desde localStorage
   */
  const loadTemplates = () => {
    const loaded = customTemplateService.getAll();
    setTemplates(loaded);
  };

  /**
   * Crear nuevo template
   */
  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingTemplate(null);
    
    // Reset form
    setName('');
    setDescription('');
    setIcon('📄');
    setTitle('');
    setMetaDescription('');
    setCategory('guide');
    setStatus('draft');
    setTags('');
    setAuthor('');
    setVersion('1.0.0');
  };

  /**
   * Guardar template
   */
  const handleSave = () => {
    // Validar
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (!title.trim()) {
      toast.error('Document title is required');
      return;
    }

    // Construir metadata
    const metadata: Partial<DocumentMetadata> = {
      title,
      description: metaDescription,
      category,
      status,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      author,
      version,
      date: new Date().toISOString().split('T')[0],
    };

    // Construir template
    const template: CustomTemplate = {
      id: editingTemplate?.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      description,
      icon,
      metadata,
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true,
    };

    // Guardar
    customTemplateService.save(template);
    loadTemplates();
    
    toast.success(editingTemplate ? 'Template updated!' : 'Template created!');
    
    // Volver a la lista
    setIsCreating(false);
    setEditingTemplate(null);
  };

  /**
   * Editar template
   */
  const handleEdit = (template: CustomTemplate) => {
    setEditingTemplate(template);
    setIsCreating(true);
    
    // Cargar datos en el form
    setName(template.name);
    setDescription(template.description);
    setIcon(template.icon);
    setTitle(template.metadata.title || '');
    setMetaDescription(template.metadata.description || '');
    setCategory(template.metadata.category || 'guide');
    setStatus(template.metadata.status || 'draft');
    setTags(template.metadata.tags?.join(', ') || '');
    setAuthor(template.metadata.author || '');
    setVersion(template.metadata.version || '1.0.0');
  };

  /**
   * Eliminar template
   */
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const deleted = customTemplateService.delete(id);
      
      if (deleted) {
        toast.success('Template deleted');
        loadTemplates();
      } else {
        toast.error('Template not found');
      }
    }
  };

  /**
   * Duplicar template
   */
  const handleDuplicate = (template: CustomTemplate) => {
    const duplicated = customTemplateService.duplicate(template);
    customTemplateService.save(duplicated);
    loadTemplates();
    toast.success('Template duplicated');
  };

  /**
   * Exportar template
   */
  const handleExport = (template: CustomTemplate) => {
    const json = customTemplateService.export(template);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-${template.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Template exported');
  };

  /**
   * Importar template
   */
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const template = customTemplateService.import(text);
        customTemplateService.save(template);
        loadTemplates();
        toast.success('Template imported successfully');
      } catch (error) {
        toast.error('Failed to import template: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    };

    input.click();
  };

  /**
   * Aplicar template (usar)
   */
  const handleUse = (template: CustomTemplate) => {
    onSelectTemplate(template.metadata);
    onClose();
  };

  /**
   * Preview del template
   */
  const getPreviewContent = () => {
    const metadata: Partial<DocumentMetadata> = {
      title,
      description: metaDescription,
      category,
      status,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      author,
      version,
      date: new Date().toISOString().split('T')[0],
    };

    return metadataService.stringify(metadata, '# Your content here\n\nWrite your documentation...');
  };

  // Vista de creación/edición
  if (isCreating) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingTemplate ? 'Edit Template' : 'Create Custom Template'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Design your own metadata template
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Preview"
              >
                <Eye className="w-5 h-5 text-gray-500" />
              </button>

              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingTemplate(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {showPreview ? (
              /* Preview Mode */
              <div>
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Preview</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This is how your metadata frontmatter will look
                  </p>
                </div>

                <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto font-mono text-sm">
                  {getPreviewContent()}
                </pre>
              </div>
            ) : (
              /* Form Mode */
              <div className="space-y-6">
                {/* Template Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My Custom Template"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      placeholder="📄"
                      maxLength={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-2xl text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe when to use this template..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Document Metadata
                  </h3>
                </div>

                {/* Document Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Document Title"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as DocumentMetadata['category'])}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="roadmap">Roadmap</option>
                      <option value="guide">Guide</option>
                      <option value="tutorial">Tutorial</option>
                      <option value="api">API</option>
                      <option value="best-practices">Best Practices</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Brief description of the document..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as DocumentMetadata['status'])}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Version
                    </label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="1.0.0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="documentation, tutorial, api"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingTemplate(null);
              }}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista de lista
  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Custom Templates
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {templates.length} custom templates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleImport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>

            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {templates.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No custom templates yet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create your first template to get started
              </p>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Template
              </button>
            </div>
          ) : (
            /* Templates Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{template.icon}</div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUse(template)}
                          className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded transition-colors"
                          title="Use template"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleEdit(template)}
                          className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDuplicate(template)}
                          className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleExport(template)}
                          className="p-1.5 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded transition-colors"
                          title="Export"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h3>
                    
                    {template.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {template.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {template.metadata.category && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded">
                          {template.metadata.category}
                        </span>
                      )}
                      {template.metadata.status && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                          {template.metadata.status}
                        </span>
                      )}
                      {template.metadata.tags && template.metadata.tags.length > 0 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded">
                          {template.metadata.tags.length} tags
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                      Updated {new Date(template.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {templates.length} custom template{templates.length !== 1 ? 's' : ''}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
