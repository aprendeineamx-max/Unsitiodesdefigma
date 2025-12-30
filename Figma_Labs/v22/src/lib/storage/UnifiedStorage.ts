/**
 * Unified Storage API - Main Implementation
 * 
 * Sistema centralizado para gestionar múltiples proveedores de almacenamiento
 * de forma transparente y uniforme.
 * 
 * @module storage/UnifiedStorage
 * @version 1.0.0
 */

import type {
  StorageProviderType,
  IStorageProvider,
  FileItem,
  StorageOperationResult,
  ListOptions,
  ReadOptions,
  WriteOptions,
  DeleteOptions
} from './types';

// ==============================================
// UNIFIED STORAGE API CLASS
// ==============================================

/**
 * Clase principal del sistema Unified Storage
 * 
 * Implementa el patrón Singleton para garantizar una única instancia global.
 * Gestiona múltiples proveedores de storage y expone una API unificada.
 * 
 * @example
 * ```typescript
 * import { unifiedStorage } from '@/lib/storage/UnifiedStorage';
 * 
 * // Registrar provider
 * unifiedStorage.registerProvider(githubProvider);
 * 
 * // Usar API unificada
 * const result = await unifiedStorage.list('github', '/docs');
 * if (result.success) {
 *   console.log('Files:', result.data);
 * }
 * ```
 */
export class UnifiedStorageAPI {
  /** Mapa de proveedores registrados */
  private providers = new Map<StorageProviderType, IStorageProvider>();
  
  /** Provider por defecto (si se especifica) */
  private defaultProvider?: StorageProviderType;
  
  /** Modo debug para logging detallado */
  private debugMode = false;
  
  /**
   * Constructor privado (Singleton pattern)
   */
  constructor() {
    this.log('🏗️ UnifiedStorageAPI instance created');
  }
  
  // ==============================================
  // PROVIDER MANAGEMENT
  // ==============================================
  
  /**
   * Registra un nuevo proveedor de storage
   * 
   * @param provider - Instancia del provider que implementa IStorageProvider
   * @throws Error si ya existe un provider con ese nombre
   * 
   * @example
   * ```typescript
   * const githubProvider = new GitHubStorageProvider(config);
   * unifiedStorage.registerProvider(githubProvider);
   * ```
   */
  registerProvider(provider: IStorageProvider): void {
    if (this.providers.has(provider.name)) {
      this.warn(`⚠️ Provider "${provider.name}" ya está registrado. Se sobrescribirá.`);
    }
    
    this.providers.set(provider.name, provider);
    this.log(`✅ Provider registrado: ${provider.name} (ready: ${provider.isReady})`);
    
    // Si es el primer provider, hacerlo default
    if (this.providers.size === 1 && !this.defaultProvider) {
      this.setDefaultProvider(provider.name);
    }
  }
  
  /**
   * Obtiene un provider registrado
   * 
   * @param name - Nombre del provider
   * @returns Provider o undefined si no existe
   * 
   * @example
   * ```typescript
   * const github = unifiedStorage.getProvider('github');
   * if (github) {
   *   // Usar provider directamente
   *   const result = await github.list('/docs');
   * }
   * ```
   */
  getProvider(name: StorageProviderType): IStorageProvider | undefined {
    return this.providers.get(name);
  }
  
  /**
   * Establece el provider por defecto
   * 
   * @param name - Nombre del provider a usar por defecto
   * @throws Error si el provider no existe
   */
  setDefaultProvider(name: StorageProviderType): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider "${name}" no está registrado`);
    }
    
    this.defaultProvider = name;
    this.log(`🎯 Provider por defecto: ${name}`);
  }
  
  /**
   * Desregistra un provider
   * 
   * @param name - Nombre del provider a eliminar
   * @returns true si se eliminó, false si no existía
   */
  unregisterProvider(name: StorageProviderType): boolean {
    const existed = this.providers.delete(name);
    
    if (existed) {
      this.log(`🗑️ Provider desregistrado: ${name}`);
      
      // Si era el default, limpiar default
      if (this.defaultProvider === name) {
        this.defaultProvider = undefined;
        this.log('⚠️ Default provider cleared');
      }
    }
    
    return existed;
  }
  
  /**
   * Lista todos los providers registrados
   * 
   * @returns Array con nombres de providers
   */
  getRegisteredProviders(): StorageProviderType[] {
    return Array.from(this.providers.keys());
  }
  
  /**
   * Verifica si un provider está registrado
   * 
   * @param name - Nombre del provider
   * @returns true si existe y está listo
   */
  isProviderReady(name: StorageProviderType): boolean {
    const provider = this.providers.get(name);
    return provider?.isReady ?? false;
  }
  
  // ==============================================
  // UNIFIED STORAGE OPERATIONS
  // ==============================================
  
  /**
   * Lista archivos de un provider
   * 
   * @param provider - Nombre del provider (o usar default si no se especifica)
   * @param path - Path del directorio a listar
   * @param options - Opciones de listado
   * @returns Lista de archivos
   * 
   * @example
   * ```typescript
   * const result = await unifiedStorage.list('github', '/docs', {
   *   recursive: true,
   *   extensions: ['.md']
   * });
   * ```
   */
  async list(
    provider: StorageProviderType,
    path: string,
    options?: ListOptions
  ): Promise<StorageOperationResult<FileItem[]>> {
    return this.executeOperation(provider, 'list', path, options);
  }
  
  /**
   * Lee el contenido de un archivo
   * 
   * @param provider - Nombre del provider
   * @param path - Path del archivo
   * @param options - Opciones de lectura
   * @returns Contenido del archivo
   * 
   * @example
   * ```typescript
   * const result = await unifiedStorage.read('supabase', '/docs/README.md');
   * if (result.success) {
   *   console.log('Content:', result.data);
   * }
   * ```
   */
  async read(
    provider: StorageProviderType,
    path: string,
    options?: ReadOptions
  ): Promise<StorageOperationResult<string>> {
    return this.executeOperation(provider, 'read', path, options);
  }
  
  /**
   * Escribe contenido a un archivo
   * 
   * @param provider - Nombre del provider
   * @param path - Path del archivo
   * @param content - Contenido a escribir
   * @param options - Opciones de escritura
   * @returns Metadata del archivo escrito
   * 
   * @example
   * ```typescript
   * const result = await unifiedStorage.write(
   *   'github',
   *   '/docs/new-doc.md',
   *   '# Hello World',
   *   { commitMessage: 'Add new doc' }
   * );
   * ```
   */
  async write(
    provider: StorageProviderType,
    path: string,
    content: string,
    options?: WriteOptions
  ): Promise<StorageOperationResult<FileItem>> {
    return this.executeOperation(provider, 'write', path, content, options);
  }
  
  /**
   * Elimina un archivo o directorio
   * 
   * @param provider - Nombre del provider
   * @param path - Path del archivo/directorio
   * @param options - Opciones de eliminación
   * @returns Confirmación de eliminación
   * 
   * @example
   * ```typescript
   * const result = await unifiedStorage.delete('supabase', '/docs/old-doc.md');
   * if (result.success) {
   *   console.log('File deleted successfully');
   * }
   * ```
   */
  async delete(
    provider: StorageProviderType,
    path: string,
    options?: DeleteOptions
  ): Promise<StorageOperationResult<void>> {
    return this.executeOperation(provider, 'delete', path, options);
  }
  
  /**
   * Verifica si un archivo existe
   * 
   * @param provider - Nombre del provider
   * @param path - Path del archivo
   * @returns true si existe, false si no
   * 
   * @example
   * ```typescript
   * const result = await unifiedStorage.exists('github', '/docs/README.md');
   * if (result.success && result.data) {
   *   console.log('File exists');
   * }
   * ```
   */
  async exists(
    provider: StorageProviderType,
    path: string
  ): Promise<StorageOperationResult<boolean>> {
    const providerInstance = this.providers.get(provider);
    
    if (!providerInstance) {
      return this.createErrorResult(`Provider "${provider}" no está registrado`);
    }
    
    if (!providerInstance.isReady) {
      return this.createErrorResult(`Provider "${provider}" no está listo`);
    }
    
    // Si el provider tiene método exists, usarlo
    if (providerInstance.exists) {
      return providerInstance.exists(path);
    }
    
    // Fallback: intentar read y ver si falla
    const readResult = await providerInstance.read(path);
    return {
      success: true,
      data: readResult.success
    };
  }
  
  /**
   * Obtiene metadata de un archivo sin leer su contenido
   * 
   * @param provider - Nombre del provider
   * @param path - Path del archivo
   * @returns Metadata del archivo
   */
  async getMetadata(
    provider: StorageProviderType,
    path: string
  ): Promise<StorageOperationResult<FileItem>> {
    const providerInstance = this.providers.get(provider);
    
    if (!providerInstance) {
      return this.createErrorResult(`Provider "${provider}" no está registrado`);
    }
    
    if (!providerInstance.isReady) {
      return this.createErrorResult(`Provider "${provider}" no está listo`);
    }
    
    // Si el provider tiene método getMetadata, usarlo
    if (providerInstance.getMetadata) {
      return providerInstance.getMetadata(path);
    }
    
    // Fallback: list en el parent directory y buscar el archivo
    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
    const fileName = path.substring(path.lastIndexOf('/') + 1);
    
    const listResult = await providerInstance.list(parentPath);
    
    if (!listResult.success || !listResult.data) {
      return this.createErrorResult('No se pudo obtener metadata');
    }
    
    const fileItem = listResult.data.find(item => item.name === fileName);
    
    if (!fileItem) {
      return this.createErrorResult('Archivo no encontrado');
    }
    
    return {
      success: true,
      data: fileItem
    };
  }
  
  // ==============================================
  // UTILITY METHODS
  // ==============================================
  
  /**
   * Habilita/deshabilita modo debug
   * 
   * @param enabled - true para habilitar, false para deshabilitar
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.log(`🐛 Debug mode: ${enabled ? 'ON' : 'OFF'}`);
  }
  
  /**
   * Obtiene estadísticas del sistema
   * 
   * @returns Información sobre providers y su estado
   */
  getStats(): {
    totalProviders: number;
    readyProviders: number;
    defaultProvider?: StorageProviderType;
    providers: Array<{ name: StorageProviderType; ready: boolean }>;
  } {
    const providers = Array.from(this.providers.entries()).map(([name, provider]) => ({
      name,
      ready: provider.isReady
    }));
    
    return {
      totalProviders: this.providers.size,
      readyProviders: providers.filter(p => p.ready).length,
      defaultProvider: this.defaultProvider,
      providers
    };
  }
  
  // ==============================================
  // PRIVATE HELPERS
  // ==============================================
  
  /**
   * Ejecuta una operación en un provider de forma segura
   */
  private async executeOperation(
    providerName: StorageProviderType,
    operation: string,
    ...args: any[]
  ): Promise<StorageOperationResult<any>> {
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      return this.createErrorResult(`Provider "${providerName}" no está registrado`);
    }
    
    if (!provider.isReady) {
      return this.createErrorResult(`Provider "${providerName}" no está listo`);
    }
    
    try {
      this.log(`▶️ ${providerName}.${operation}(${args[0] || ''})`);
      
      // @ts-ignore - Dynamic method call
      const result = await provider[operation](...args);
      
      this.log(`✅ ${providerName}.${operation} completed`);
      
      return result;
    } catch (err: any) {
      this.error(`❌ ${providerName}.${operation} failed:`, err);
      
      return this.createErrorResult(err.message || 'Operation failed', err);
    }
  }
  
  /**
   * Crea un resultado de error estandarizado
   */
  private createErrorResult<T = any>(error: string, details?: any): StorageOperationResult<T> {
    return {
      success: false,
      error,
      errorDetails: details
    };
  }
  
  /**
   * Log interno (solo si debug mode está habilitado)
   */
  private log(...args: any[]): void {
    if (this.debugMode) {
      console.log('[UnifiedStorage]', ...args);
    }
  }
  
  /**
   * Warning log (siempre se muestra)
   */
  private warn(...args: any[]): void {
    console.warn('[UnifiedStorage]', ...args);
  }
  
  /**
   * Error log (siempre se muestra)
   */
  private error(...args: any[]): void {
    console.error('[UnifiedStorage]', ...args);
  }
}

// ==============================================
// SINGLETON EXPORT
// ==============================================

/**
 * Instancia global singleton del Unified Storage API
 * 
 * Esta es la instancia que debes importar en tu aplicación.
 * 
 * @example
 * ```typescript
 * import { unifiedStorage } from '@/lib/storage/UnifiedStorage';
 * 
 * // Usar en tu aplicación
 * const files = await unifiedStorage.list('github', '/docs');
 * ```
 */
export const unifiedStorage = new UnifiedStorageAPI();

// Habilitar debug en desarrollo
if (import.meta.env.DEV) {
  unifiedStorage.setDebugMode(true);
}
