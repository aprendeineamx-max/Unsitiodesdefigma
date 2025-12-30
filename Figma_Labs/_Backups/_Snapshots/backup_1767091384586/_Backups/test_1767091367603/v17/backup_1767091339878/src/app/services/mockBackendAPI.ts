/**
 * MOCK BACKEND API - TESTING & DEVELOPMENT
 * Simula un backend real para testing del sistema de metadata
 * 
 * Features:
 * - Guardar documentos al filesystem (simulado)
 * - Historial de versiones
 * - Validaciones server-side
 * - Respuestas realistas con delays
 * - Error handling completo
 * - Logging profesional
 */

import type { DocumentMetadata } from '../types/documentation';

/**
 * Configuración del Mock API
 */
const MOCK_API_CONFIG = {
  baseDelay: 100, // ms - simular latencia de red
  errorRate: 0.05, // 5% de errores aleatorios para testing
  maxFileSize: 10 * 1024 * 1024, // 10MB
  enableLogging: true,
  enableVersioning: true,
};

/**
 * Tipos de respuesta
 */
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  duration: number;
}

interface DocumentVersion {
  version: number;
  content: string;
  metadata: Partial<DocumentMetadata>;
  savedAt: string;
  savedBy: string;
  changeDescription?: string;
}

interface SaveDocumentRequest {
  path: string;
  content: string;
  metadata: Partial<DocumentMetadata>;
  changeDescription?: string;
}

interface BulkSaveRequest {
  documents: Array<{
    path: string;
    content: string;
    metadata: Partial<DocumentMetadata>;
  }>;
}

/**
 * Storage simulado (en memoria)
 */
class MockStorage {
  private documents = new Map<string, string>();
  private versions = new Map<string, DocumentVersion[]>();
  private metadata = new Map<string, Partial<DocumentMetadata>>();

  /**
   * Guardar documento
   */
  saveDocument(path: string, content: string, metadata: Partial<DocumentMetadata>): void {
    this.documents.set(path, content);
    this.metadata.set(path, metadata);
    
    // Versioning
    if (MOCK_API_CONFIG.enableVersioning) {
      const versions = this.versions.get(path) || [];
      const newVersion: DocumentVersion = {
        version: versions.length + 1,
        content,
        metadata,
        savedAt: new Date().toISOString(),
        savedBy: metadata.author || 'Unknown',
      };
      versions.push(newVersion);
      this.versions.set(path, versions);
    }

    if (MOCK_API_CONFIG.enableLogging) {
      console.log(`💾 [Mock API] Document saved: ${path} (v${this.getVersionCount(path)})`);
    }
  }

  /**
   * Obtener documento
   */
  getDocument(path: string): { content: string; metadata: Partial<DocumentMetadata> } | null {
    const content = this.documents.get(path);
    const metadata = this.metadata.get(path);
    
    if (!content) return null;
    
    return { content, metadata: metadata || {} };
  }

  /**
   * Obtener versiones de un documento
   */
  getVersions(path: string): DocumentVersion[] {
    return this.versions.get(path) || [];
  }

  /**
   * Obtener versión específica
   */
  getVersion(path: string, version: number): DocumentVersion | null {
    const versions = this.versions.get(path) || [];
    return versions.find(v => v.version === version) || null;
  }

  /**
   * Contar versiones
   */
  getVersionCount(path: string): number {
    return (this.versions.get(path) || []).length;
  }

  /**
   * Eliminar documento
   */
  deleteDocument(path: string): boolean {
    const existed = this.documents.has(path);
    this.documents.delete(path);
    this.metadata.delete(path);
    this.versions.delete(path);
    
    if (MOCK_API_CONFIG.enableLogging && existed) {
      console.log(`🗑️ [Mock API] Document deleted: ${path}`);
    }
    
    return existed;
  }

  /**
   * Listar todos los documentos
   */
  listDocuments(): string[] {
    return Array.from(this.documents.keys());
  }

  /**
   * Estadísticas
   */
  getStats() {
    return {
      totalDocuments: this.documents.size,
      totalVersions: Array.from(this.versions.values()).reduce((acc, v) => acc + v.length, 0),
      averageVersionsPerDoc: this.documents.size > 0 
        ? Array.from(this.versions.values()).reduce((acc, v) => acc + v.length, 0) / this.documents.size 
        : 0,
    };
  }

  /**
   * Limpiar todo (para testing)
   */
  clear(): void {
    this.documents.clear();
    this.metadata.clear();
    this.versions.clear();
    if (MOCK_API_CONFIG.enableLogging) {
      console.log('🧹 [Mock API] Storage cleared');
    }
  }
}

/**
 * Mock Backend API Service
 */
class MockBackendAPIService {
  private storage = new MockStorage();

  /**
   * Simular delay de red
   */
  private async simulateNetworkDelay(): Promise<void> {
    const delay = MOCK_API_CONFIG.baseDelay + Math.random() * 100;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Simular error aleatorio (para testing de error handling)
   */
  private shouldSimulateError(): boolean {
    return Math.random() < MOCK_API_CONFIG.errorRate;
  }

  /**
   * Validar request
   */
  private validateSaveRequest(request: SaveDocumentRequest): { valid: boolean; error?: string } {
    if (!request.path) {
      return { valid: false, error: 'Path is required' };
    }

    if (!request.path.endsWith('.md')) {
      return { valid: false, error: 'Only .md files are allowed' };
    }

    if (!request.content) {
      return { valid: false, error: 'Content is required' };
    }

    if (request.content.length > MOCK_API_CONFIG.maxFileSize) {
      return { 
        valid: false, 
        error: `File too large: ${(request.content.length / 1024 / 1024).toFixed(2)}MB (max: ${MOCK_API_CONFIG.maxFileSize / 1024 / 1024}MB)` 
      };
    }

    if (request.path.includes('..')) {
      return { valid: false, error: 'Invalid path: contains ..' };
    }

    return { valid: true };
  }

  /**
   * Guardar documento (simula POST /api/documents/save)
   */
  async saveDocument(request: SaveDocumentRequest): Promise<APIResponse<{ version: number }>> {
    const startTime = Date.now();

    // Validar request
    const validation = this.validateSaveRequest(request);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }

    // Simular delay
    await this.simulateNetworkDelay();

    // Simular error aleatorio
    if (this.shouldSimulateError()) {
      return {
        success: false,
        error: 'Internal server error (simulated)',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }

    // Guardar
    this.storage.saveDocument(request.path, request.content, request.metadata);
    const version = this.storage.getVersionCount(request.path);

    return {
      success: true,
      data: { version },
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }

  /**
   * Guardar múltiples documentos (bulk)
   */
  async bulkSaveDocuments(request: BulkSaveRequest): Promise<APIResponse<{
    totalCount: number;
    successCount: number;
    failedCount: number;
    results: Array<{ path: string; success: boolean; error?: string; version?: number }>;
  }>> {
    const startTime = Date.now();

    // Validar cada documento
    const results: Array<{ path: string; success: boolean; error?: string; version?: number }> = [];
    let successCount = 0;
    let failedCount = 0;

    for (const doc of request.documents) {
      const validation = this.validateSaveRequest({
        path: doc.path,
        content: doc.content,
        metadata: doc.metadata,
      });

      if (!validation.valid) {
        results.push({
          path: doc.path,
          success: false,
          error: validation.error,
        });
        failedCount++;
        continue;
      }

      try {
        // Simular delay proporcional
        await this.simulateNetworkDelay();

        this.storage.saveDocument(doc.path, doc.content, doc.metadata);
        const version = this.storage.getVersionCount(doc.path);

        results.push({
          path: doc.path,
          success: true,
          version,
        });
        successCount++;
      } catch (error) {
        results.push({
          path: doc.path,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        failedCount++;
      }
    }

    return {
      success: true,
      data: {
        totalCount: request.documents.length,
        successCount,
        failedCount,
        results,
      },
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }

  /**
   * Obtener documento
   */
  async getDocument(path: string): Promise<APIResponse<{
    content: string;
    metadata: Partial<DocumentMetadata>;
    version: number;
  }>> {
    const startTime = Date.now();
    await this.simulateNetworkDelay();

    const doc = this.storage.getDocument(path);
    if (!doc) {
      return {
        success: false,
        error: 'Document not found',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }

    const version = this.storage.getVersionCount(path);

    return {
      success: true,
      data: { ...doc, version },
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }

  /**
   * Obtener historial de versiones
   */
  async getVersionHistory(path: string): Promise<APIResponse<{ versions: DocumentVersion[] }>> {
    const startTime = Date.now();
    await this.simulateNetworkDelay();

    const versions = this.storage.getVersions(path);

    return {
      success: true,
      data: { versions },
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }

  /**
   * Restaurar versión específica
   */
  async restoreVersion(path: string, version: number): Promise<APIResponse<{
    content: string;
    metadata: Partial<DocumentMetadata>;
  }>> {
    const startTime = Date.now();
    await this.simulateNetworkDelay();

    const versionData = this.storage.getVersion(path, version);
    if (!versionData) {
      return {
        success: false,
        error: `Version ${version} not found`,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }

    // Restaurar creando una nueva versión
    this.storage.saveDocument(path, versionData.content, {
      ...versionData.metadata,
      version: `${versionData.metadata.version || '1.0.0'} (restored from v${version})`,
    });

    return {
      success: true,
      data: {
        content: versionData.content,
        metadata: versionData.metadata,
      },
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }

  /**
   * Eliminar documento
   */
  async deleteDocument(path: string): Promise<APIResponse<{ deleted: boolean }>> {
    const startTime = Date.now();
    await this.simulateNetworkDelay();

    const deleted = this.storage.deleteDocument(path);

    return {
      success: true,
      data: { deleted },
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }

  /**
   * Obtener estadísticas del storage
   */
  async getStorageStats(): Promise<APIResponse<{
    totalDocuments: number;
    totalVersions: number;
    averageVersionsPerDoc: number;
  }>> {
    const startTime = Date.now();
    await this.simulateNetworkDelay();

    const stats = this.storage.getStats();

    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<APIResponse<{ status: string; uptime: number }>> {
    return {
      success: true,
      data: {
        status: 'healthy',
        uptime: process?.uptime?.() || 0,
      },
      timestamp: new Date().toISOString(),
      duration: 0,
    };
  }

  /**
   * Limpiar storage (solo para testing)
   */
  clearStorage(): void {
    this.storage.clear();
  }

  /**
   * Obtener storage directo (solo para debugging)
   */
  getStorageInstance(): MockStorage {
    return this.storage;
  }
}

/**
 * Singleton instance
 */
export const mockBackendAPI = new MockBackendAPIService();

/**
 * Exports de tipos
 */
export type {
  APIResponse,
  DocumentVersion,
  SaveDocumentRequest,
  BulkSaveRequest,
};
