/**
 * TIPOS DE DOCUMENTACIÓN - Sistema de Auto-Discovery
 * Tipos TypeScript para el sistema de gestión de documentos
 */

export type DocumentCategory = 
  | 'roadmap' 
  | 'guide' 
  | 'api' 
  | 'tutorial' 
  | 'best-practices' 
  | 'other';

export type DocumentStatus = 
  | 'draft' 
  | 'review' 
  | 'published' 
  | 'archived';

/**
 * Metadata extraída del frontmatter YAML
 */
export interface DocumentMetadata {
  title: string;
  description?: string;
  category?: DocumentCategory;
  tags?: string[];
  author?: string;
  date?: string;
  version?: string;
  status?: DocumentStatus;
  lastModified?: string;
}

/**
 * Documento descubierto por el scanner
 */
export interface DiscoveredDocument {
  id: string;
  path: string;
  filename: string;
  metadata: DocumentMetadata;
  lastModified: Date;
  size: number;
  content?: string; // Contenido completo (opcional, lazy load)
}

/**
 * Resultado del escaneo de documentos
 */
export interface DocumentScanResult {
  documents: DiscoveredDocument[];
  totalCount: number;
  categoryCounts: Record<DocumentCategory, number>;
  scanTime: number;
  timestamp: Date;
}

/**
 * Entrada en el caché de documentos
 */
export interface CachedDocument {
  content: string;
  metadata: DocumentMetadata;
  timestamp: number;
  hits: number;
}

/**
 * Estadísticas del caché
 */
export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number; // en bytes
}
