/**
 * METADATA SERVICE - Gestión de Metadata de Documentos
 * Servicio centralizado para validación, templates y gestión de metadata
 */

import matter from 'gray-matter';
import type { DocumentMetadata, DocumentCategory, DocumentStatus } from '../types/documentation';

/**
 * Schema de validación para metadata
 */
export interface MetadataSchema {
  title: {
    required: boolean;
    type: 'string';
    minLength?: number;
    maxLength?: number;
  };
  description: {
    required: boolean;
    type: 'string';
    maxLength?: number;
  };
  category: {
    required: boolean;
    type: 'enum';
    values: DocumentCategory[];
  };
  tags: {
    required: boolean;
    type: 'array';
    maxItems?: number;
  };
  status: {
    required: boolean;
    type: 'enum';
    values: DocumentStatus[];
  };
  author: {
    required: boolean;
    type: 'string';
  };
  date: {
    required: boolean;
    type: 'date';
  };
  version: {
    required: boolean;
    type: 'string';
    pattern?: RegExp;
  };
}

/**
 * Error de validación
 */
export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'type' | 'format' | 'range';
}

/**
 * Resultado de validación
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Template de metadata predefinido
 */
export interface MetadataTemplate {
  id: string;
  name: string;
  description: string;
  category: DocumentCategory;
  metadata: Partial<DocumentMetadata>;
}

/**
 * Configuración del servicio
 */
interface MetadataServiceConfig {
  strictMode?: boolean;
  autofix?: boolean;
  validateOnSave?: boolean;
}

/**
 * Servicio de gestión de metadata
 */
export class MetadataService {
  private config: MetadataServiceConfig;
  private templates: Map<string, MetadataTemplate>;

  // Schema de validación por defecto
  private schema: MetadataSchema = {
    title: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 100,
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 500,
    },
    category: {
      required: true,
      type: 'enum',
      values: ['roadmap', 'guide', 'api', 'tutorial', 'best-practices', 'other'],
    },
    tags: {
      required: false,
      type: 'array',
      maxItems: 10,
    },
    status: {
      required: false,
      type: 'enum',
      values: ['draft', 'review', 'published', 'archived'],
    },
    author: {
      required: false,
      type: 'string',
    },
    date: {
      required: false,
      type: 'date',
    },
    version: {
      required: false,
      type: 'string',
      pattern: /^\d+\.\d+\.\d+$/,
    },
  };

  constructor(config: MetadataServiceConfig = {}) {
    this.config = {
      strictMode: false,
      autofix: true,
      validateOnSave: true,
      ...config,
    };
    this.templates = new Map();
    this.loadDefaultTemplates();
  }

  /**
   * Valida metadata contra el schema
   */
  validate(metadata: Partial<DocumentMetadata>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validar título (required)
    if (!metadata.title || metadata.title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'El título es obligatorio',
        type: 'required',
      });
    } else {
      if (metadata.title.length < (this.schema.title.minLength || 0)) {
        errors.push({
          field: 'title',
          message: `El título debe tener al menos ${this.schema.title.minLength} caracteres`,
          type: 'range',
        });
      }
      if (metadata.title.length > (this.schema.title.maxLength || Infinity)) {
        errors.push({
          field: 'title',
          message: `El título no debe exceder ${this.schema.title.maxLength} caracteres`,
          type: 'range',
        });
      }
    }

    // Validar categoría
    if (metadata.category && !this.schema.category.values.includes(metadata.category)) {
      errors.push({
        field: 'category',
        message: `Categoría inválida. Debe ser una de: ${this.schema.category.values.join(', ')}`,
        type: 'format',
      });
    }

    // Validar descripción
    if (metadata.description && metadata.description.length > (this.schema.description.maxLength || Infinity)) {
      errors.push({
        field: 'description',
        message: `La descripción no debe exceder ${this.schema.description.maxLength} caracteres`,
        type: 'range',
      });
    }

    // Validar tags
    if (metadata.tags) {
      if (!Array.isArray(metadata.tags)) {
        errors.push({
          field: 'tags',
          message: 'Tags debe ser un array',
          type: 'type',
        });
      } else if (metadata.tags.length > (this.schema.tags.maxItems || Infinity)) {
        errors.push({
          field: 'tags',
          message: `No puede haber más de ${this.schema.tags.maxItems} tags`,
          type: 'range',
        });
      }
    }

    // Validar status
    if (metadata.status && !this.schema.status.values.includes(metadata.status)) {
      errors.push({
        field: 'status',
        message: `Status inválido. Debe ser uno de: ${this.schema.status.values.join(', ')}`,
        type: 'format',
      });
    }

    // Validar versión (formato semver)
    if (metadata.version && !this.schema.version.pattern?.test(metadata.version)) {
      errors.push({
        field: 'version',
        message: 'Versión debe seguir formato semver (ej: 1.0.0)',
        type: 'format',
      });
    }

    // Validar fecha
    if (metadata.date) {
      const date = new Date(metadata.date);
      if (isNaN(date.getTime())) {
        errors.push({
          field: 'date',
          message: 'Fecha inválida. Use formato ISO (YYYY-MM-DD)',
          type: 'format',
        });
      }
    }

    // Warnings (no críticos)
    if (!metadata.description) {
      warnings.push({
        field: 'description',
        message: 'Se recomienda agregar una descripción',
        type: 'required',
      });
    }

    if (!metadata.tags || metadata.tags.length === 0) {
      warnings.push({
        field: 'tags',
        message: 'Se recomienda agregar tags para mejor búsqueda',
        type: 'required',
      });
    }

    if (!metadata.author) {
      warnings.push({
        field: 'author',
        message: 'Se recomienda especificar el autor',
        type: 'required',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Auto-corrige metadata común
   */
  autofix(metadata: Partial<DocumentMetadata>): Partial<DocumentMetadata> {
    if (!this.config.autofix) {
      return metadata;
    }

    const fixed = { ...metadata };

    // Trim strings
    if (fixed.title) fixed.title = fixed.title.trim();
    if (fixed.description) fixed.description = fixed.description.trim();
    if (fixed.author) fixed.author = fixed.author.trim();

    // Capitalizar título
    if (fixed.title) {
      fixed.title = fixed.title.charAt(0).toUpperCase() + fixed.title.slice(1);
    }

    // Normalizar tags (lowercase, trim, dedup)
    if (fixed.tags && Array.isArray(fixed.tags)) {
      fixed.tags = [...new Set(
        fixed.tags.map(tag => tag.toLowerCase().trim()).filter(Boolean)
      )];
    }

    // Fecha por defecto (hoy)
    if (!fixed.date) {
      fixed.date = new Date().toISOString().split('T')[0];
    }

    // Status por defecto
    if (!fixed.status) {
      fixed.status = 'draft';
    }

    // LastModified siempre actualizado
    fixed.lastModified = new Date().toISOString();

    return fixed;
  }

  /**
   * Parsea frontmatter de contenido markdown
   */
  parse(content: string): { data: Partial<DocumentMetadata>; content: string } {
    try {
      const parsed = matter(content);
      return {
        data: parsed.data as Partial<DocumentMetadata>,
        content: parsed.content,
      };
    } catch (error) {
      console.error('Error parsing frontmatter:', error);
      return {
        data: {},
        content,
      };
    }
  }

  /**
   * Serializa metadata a frontmatter YAML
   */
  stringify(metadata: Partial<DocumentMetadata>, content: string): string {
    try {
      return matter.stringify(content, metadata);
    } catch (error) {
      console.error('Error stringifying frontmatter:', error);
      return content;
    }
  }

  /**
   * Actualiza metadata de un documento
   */
  updateMetadata(
    originalContent: string,
    newMetadata: Partial<DocumentMetadata>
  ): { content: string; validation: ValidationResult } {
    // Parsear contenido actual
    const { data: currentMetadata, content: markdownContent } = this.parse(originalContent);

    // Merge metadata
    const mergedMetadata = {
      ...currentMetadata,
      ...newMetadata,
    };

    // Auto-fix
    const fixedMetadata = this.autofix(mergedMetadata);

    // Validar
    const validation = this.validate(fixedMetadata);

    // Si hay errores y strict mode está activado, no actualizar
    if (validation.errors.length > 0 && this.config.strictMode) {
      return {
        content: originalContent,
        validation,
      };
    }

    // Serializar nuevo contenido
    const newContent = this.stringify(fixedMetadata, markdownContent);

    return {
      content: newContent,
      validation,
    };
  }

  /**
   * Carga templates predefinidos
   */
  private loadDefaultTemplates(): void {
    const templates: MetadataTemplate[] = [
      {
        id: 'roadmap',
        name: 'Roadmap Document',
        description: 'Template para documentos de roadmap',
        category: 'roadmap',
        metadata: {
          title: 'Nuevo Roadmap',
          description: 'Descripción del roadmap',
          category: 'roadmap',
          tags: ['roadmap', 'planning'],
          status: 'draft',
          version: '1.0.0',
        },
      },
      {
        id: 'guide',
        name: 'Guide Document',
        description: 'Template para guías',
        category: 'guide',
        metadata: {
          title: 'Nueva Guía',
          description: 'Descripción de la guía',
          category: 'guide',
          tags: ['guide', 'tutorial'],
          status: 'draft',
          version: '1.0.0',
        },
      },
      {
        id: 'api',
        name: 'API Documentation',
        description: 'Template para documentación de API',
        category: 'api',
        metadata: {
          title: 'API Documentation',
          description: 'Documentación de la API',
          category: 'api',
          tags: ['api', 'reference'],
          status: 'draft',
          version: '1.0.0',
        },
      },
      {
        id: 'tutorial',
        name: 'Tutorial',
        description: 'Template para tutoriales paso a paso',
        category: 'tutorial',
        metadata: {
          title: 'Nuevo Tutorial',
          description: 'Tutorial paso a paso',
          category: 'tutorial',
          tags: ['tutorial', 'learning'],
          status: 'draft',
          version: '1.0.0',
        },
      },
      {
        id: 'best-practices',
        name: 'Best Practices',
        description: 'Template para documentos de mejores prácticas',
        category: 'best-practices',
        metadata: {
          title: 'Best Practices',
          description: 'Mejores prácticas y recomendaciones',
          category: 'best-practices',
          tags: ['best-practices', 'standards'],
          status: 'draft',
          version: '1.0.0',
        },
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Obtiene template por ID
   */
  getTemplate(id: string): MetadataTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Obtiene todos los templates
   */
  getAllTemplates(): MetadataTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Obtiene templates por categoría
   */
  getTemplatesByCategory(category: DocumentCategory): MetadataTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  /**
   * Crea nuevo documento desde template
   */
  createFromTemplate(templateId: string, overrides?: Partial<DocumentMetadata>): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template "${templateId}" not found`);
    }

    const metadata = {
      ...template.metadata,
      ...overrides,
      date: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString(),
    };

    const content = `# ${metadata.title}\n\n${metadata.description || ''}\n\n<!-- Escribe tu contenido aquí -->`;

    return this.stringify(metadata, content);
  }

  /**
   * Obtiene sugerencias de tags basadas en contenido
   */
  suggestTags(content: string, existingTags: string[] = []): string[] {
    // Lista de keywords comunes
    const keywords = [
      'react', 'typescript', 'javascript', 'node', 'api', 'frontend', 'backend',
      'database', 'testing', 'deployment', 'optimization', 'security', 'performance',
      'tutorial', 'guide', 'documentation', 'roadmap', 'planning', 'architecture',
      'design', 'ux', 'ui', 'components', 'hooks', 'state', 'routing', 'authentication',
    ];

    const lowerContent = content.toLowerCase();
    const suggested = keywords.filter(keyword => 
      lowerContent.includes(keyword) && !existingTags.includes(keyword)
    );

    // Limitar a 5 sugerencias
    return suggested.slice(0, 5);
  }

  /**
   * Obtiene statistics de metadata del proyecto
   */
  getMetadataStats(documents: Array<{ metadata: DocumentMetadata }>): {
    totalDocuments: number;
    byCategory: Record<DocumentCategory, number>;
    byStatus: Record<DocumentStatus, number>;
    byAuthor: Record<string, number>;
    topTags: Array<{ tag: string; count: number }>;
    missingMetadata: {
      description: number;
      tags: number;
      author: number;
      date: number;
      status: number;
    };
  } {
    const stats = {
      totalDocuments: documents.length,
      byCategory: {} as Record<DocumentCategory, number>,
      byStatus: {} as Record<DocumentStatus, number>,
      byAuthor: {} as Record<string, number>,
      topTags: [] as Array<{ tag: string; count: number }>,
      missingMetadata: {
        description: 0,
        tags: 0,
        author: 0,
        date: 0,
        status: 0,
      },
    };

    const tagCounts = new Map<string, number>();

    documents.forEach(doc => {
      const { metadata } = doc;

      // By category
      if (metadata.category) {
        stats.byCategory[metadata.category] = (stats.byCategory[metadata.category] || 0) + 1;
      }

      // By status
      if (metadata.status) {
        stats.byStatus[metadata.status] = (stats.byStatus[metadata.status] || 0) + 1;
      }

      // By author
      if (metadata.author) {
        stats.byAuthor[metadata.author] = (stats.byAuthor[metadata.author] || 0) + 1;
      }

      // Tags
      if (metadata.tags && metadata.tags.length > 0) {
        metadata.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }

      // Missing metadata
      if (!metadata.description) stats.missingMetadata.description++;
      if (!metadata.tags || metadata.tags.length === 0) stats.missingMetadata.tags++;
      if (!metadata.author) stats.missingMetadata.author++;
      if (!metadata.date) stats.missingMetadata.date++;
      if (!metadata.status) stats.missingMetadata.status++;
    });

    // Top tags
    stats.topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  /**
   * Bulk update de metadata
   */
  bulkUpdateMetadata(
    documents: Array<{ path: string; content: string }>,
    updates: Partial<DocumentMetadata>
  ): Array<{
    path: string;
    content: string;
    validation: ValidationResult;
    success: boolean;
  }> {
    return documents.map(doc => {
      const result = this.updateMetadata(doc.content, updates);
      return {
        path: doc.path,
        content: result.content,
        validation: result.validation,
        success: result.validation.valid,
      };
    });
  }
}

// Instancia singleton
export const metadataService = new MetadataService({
  strictMode: false,
  autofix: true,
  validateOnSave: true,
});

// Export types
export type { DocumentMetadata, DocumentCategory, DocumentStatus };
