/**
 * USE METADATA TEMPLATES HOOK
 * Hook para gestión de templates de metadata
 */

import { useState, useCallback, useMemo } from 'react';
import { metadataService, type MetadataTemplate } from '../services/metadataService';
import type { DocumentMetadata, DocumentCategory } from '../types/documentation';

interface UseMetadataTemplatesOptions {
  /**
   * Categoría para filtrar templates (opcional)
   */
  category?: DocumentCategory;
  
  /**
   * Callback cuando se aplica un template
   */
  onTemplateApplied?: (template: MetadataTemplate, metadata: Partial<DocumentMetadata>) => void;
}

interface UseMetadataTemplatesReturn {
  /**
   * Todos los templates disponibles
   */
  templates: MetadataTemplate[];
  
  /**
   * Templates filtrados por categoría actual
   */
  filteredTemplates: MetadataTemplate[];
  
  /**
   * Template seleccionado actualmente
   */
  selectedTemplate: MetadataTemplate | null;
  
  /**
   * Seleccionar un template
   */
  selectTemplate: (templateId: string) => void;
  
  /**
   * Aplicar template seleccionado
   */
  applyTemplate: (overrides?: Partial<DocumentMetadata>) => Partial<DocumentMetadata>;
  
  /**
   * Crear documento desde template
   */
  createFromTemplate: (templateId: string, overrides?: Partial<DocumentMetadata>) => string;
  
  /**
   * Obtener template por ID
   */
  getTemplate: (templateId: string) => MetadataTemplate | undefined;
  
  /**
   * Limpiar selección
   */
  clearSelection: () => void;
}

/**
 * Hook para gestión de templates de metadata
 */
export function useMetadataTemplates(
  options: UseMetadataTemplatesOptions = {}
): UseMetadataTemplatesReturn {
  const { category, onTemplateApplied } = options;

  const [selectedTemplate, setSelectedTemplate] = useState<MetadataTemplate | null>(null);

  /**
   * Obtener todos los templates
   */
  const templates = useMemo(() => {
    return metadataService.getAllTemplates();
  }, []);

  /**
   * Templates filtrados por categoría
   */
  const filteredTemplates = useMemo(() => {
    if (!category) return templates;
    return metadataService.getTemplatesByCategory(category);
  }, [templates, category]);

  /**
   * Seleccionar template por ID
   */
  const selectTemplate = useCallback((templateId: string) => {
    const template = metadataService.getTemplate(templateId);
    setSelectedTemplate(template || null);
  }, []);

  /**
   * Aplicar template seleccionado
   */
  const applyTemplate = useCallback((overrides?: Partial<DocumentMetadata>): Partial<DocumentMetadata> => {
    if (!selectedTemplate) {
      throw new Error('No template selected');
    }

    const metadata = {
      ...selectedTemplate.metadata,
      ...overrides,
      date: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString(),
    };

    onTemplateApplied?.(selectedTemplate, metadata);

    return metadata;
  }, [selectedTemplate, onTemplateApplied]);

  /**
   * Crear documento desde template
   */
  const createFromTemplate = useCallback((
    templateId: string,
    overrides?: Partial<DocumentMetadata>
  ): string => {
    return metadataService.createFromTemplate(templateId, overrides);
  }, []);

  /**
   * Obtener template por ID
   */
  const getTemplate = useCallback((templateId: string) => {
    return metadataService.getTemplate(templateId);
  }, []);

  /**
   * Limpiar selección
   */
  const clearSelection = useCallback(() => {
    setSelectedTemplate(null);
  }, []);

  return {
    templates,
    filteredTemplates,
    selectedTemplate,
    selectTemplate,
    applyTemplate,
    createFromTemplate,
    getTemplate,
    clearSelection,
  };
}
