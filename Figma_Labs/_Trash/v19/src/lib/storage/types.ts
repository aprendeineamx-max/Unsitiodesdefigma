/**
 * Unified Storage API - Type Definitions
 * 
 * Sistema de tipos para la abstracción de múltiples proveedores de almacenamiento
 * (GitHub, Supabase Storage, Figma, Local FileSystem)
 * 
 * @module storage/types
 * @version 1.0.0
 */

// ==============================================
// STORAGE PROVIDER TYPES
// ==============================================

/**
 * Tipos de proveedores de almacenamiento soportados
 */
export type StorageProviderType = 'github' | 'supabase' | 'figma' | 'local';

/**
 * Tipos de archivos/entradas en el sistema
 */
export type FileType = 'file' | 'directory';

// ==============================================
// FILE ITEM INTERFACE
// ==============================================

/**
 * Representa un archivo o directorio en el sistema unificado
 */
export interface FileItem {
  /** ID único del archivo (puede ser path, SHA, UUID según provider) */
  id: string;
  
  /** Nombre del archivo (sin path) */
  name: string;
  
  /** Path completo del archivo */
  path: string;
  
  /** Tipo de entrada */
  type: FileType;
  
  /** Tamaño en bytes (undefined para directorios) */
  size?: number;
  
  /** Fecha de última actualización */
  updatedAt: Date;
  
  /** URL pública del archivo (si disponible) */
  url?: string;
  
  /** Proveedor de origen */
  provider: StorageProviderType;
  
  /** Metadata adicional específica del provider */
  metadata?: Record<string, any>;
}

// ==============================================
// OPERATION RESULT INTERFACE
// ==============================================

/**
 * Resultado estándar de operaciones de storage
 * 
 * @template T Tipo de dato retornado en caso de éxito
 */
export interface StorageOperationResult<T = any> {
  /** Indica si la operación fue exitosa */
  success: boolean;
  
  /** Datos retornados (solo si success = true) */
  data?: T;
  
  /** Mensaje de error (solo si success = false) */
  error?: string;
  
  /** Detalles adicionales del error */
  errorDetails?: any;
}

// ==============================================
// STORAGE PROVIDER INTERFACE
// ==============================================

/**
 * Interfaz que deben implementar todos los proveedores de storage
 * 
 * Define el contrato común para operaciones de almacenamiento
 */
export interface IStorageProvider {
  /** Nombre identificador del provider */
  readonly name: StorageProviderType;
  
  /** Indica si el provider está inicializado y listo para usar */
  readonly isReady: boolean;
  
  /**
   * Lista archivos en un directorio
   * 
   * @param path - Path del directorio a listar
   * @param options - Opciones adicionales (recursivo, filtros, etc.)
   * @returns Lista de archivos encontrados
   */
  list(path: string, options?: ListOptions): Promise<StorageOperationResult<FileItem[]>>;
  
  /**
   * Lee el contenido de un archivo
   * 
   * @param path - Path del archivo a leer
   * @param options - Opciones de lectura (encoding, etc.)
   * @returns Contenido del archivo
   */
  read(path: string, options?: ReadOptions): Promise<StorageOperationResult<string>>;
  
  /**
   * Escribe contenido a un archivo (crea o actualiza)
   * 
   * @param path - Path del archivo a escribir
   * @param content - Contenido a escribir
   * @param options - Opciones de escritura (overwrite, encoding, etc.)
   * @returns Metadata del archivo escrito
   */
  write(path: string, content: string, options?: WriteOptions): Promise<StorageOperationResult<FileItem>>;
  
  /**
   * Elimina un archivo o directorio
   * 
   * @param path - Path del archivo/directorio a eliminar
   * @param options - Opciones de eliminación (recursive, etc.)
   * @returns Confirmación de eliminación
   */
  delete(path: string, options?: DeleteOptions): Promise<StorageOperationResult<void>>;
  
  /**
   * Verifica si un archivo existe (opcional)
   * 
   * @param path - Path del archivo a verificar
   * @returns true si existe, false si no
   */
  exists?(path: string): Promise<StorageOperationResult<boolean>>;
  
  /**
   * Obtiene metadata de un archivo sin leer su contenido (opcional)
   * 
   * @param path - Path del archivo
   * @returns Metadata del archivo
   */
  getMetadata?(path: string): Promise<StorageOperationResult<FileItem>>;
}

// ==============================================
// OPERATION OPTIONS INTERFACES
// ==============================================

/**
 * Opciones para operación list()
 */
export interface ListOptions {
  /** Listar recursivamente subdirectorios */
  recursive?: boolean;
  
  /** Filtrar por extensión (ej: ['.md', '.txt']) */
  extensions?: string[];
  
  /** Límite de resultados */
  limit?: number;
  
  /** Ordenar resultados */
  sortBy?: 'name' | 'date' | 'size';
  
  /** Dirección de ordenamiento */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Opciones para operación read()
 */
export interface ReadOptions {
  /** Encoding del archivo (default: 'utf-8') */
  encoding?: 'utf-8' | 'base64' | 'binary';
  
  /** Cachear el resultado */
  cache?: boolean;
}

/**
 * Opciones para operación write()
 */
export interface WriteOptions {
  /** Sobrescribir si ya existe */
  overwrite?: boolean;
  
  /** Encoding del contenido (default: 'utf-8') */
  encoding?: 'utf-8' | 'base64' | 'binary';
  
  /** Mensaje de commit (para providers que lo soporten como GitHub) */
  commitMessage?: string;
  
  /** Metadata adicional a guardar */
  metadata?: Record<string, any>;
}

/**
 * Opciones para operación delete()
 */
export interface DeleteOptions {
  /** Eliminar recursivamente si es directorio */
  recursive?: boolean;
  
  /** Mensaje de commit (para providers que lo soporten) */
  commitMessage?: string;
}

// ==============================================
// PROVIDER CONFIGURATION
// ==============================================

/**
 * Configuración base para providers
 */
export interface ProviderConfig {
  /** Nombre del provider */
  name: StorageProviderType;
  
  /** Habilitar/deshabilitar provider */
  enabled?: boolean;
  
  /** Configuración específica del provider */
  config?: Record<string, any>;
}

/**
 * Configuración específica para GitHub provider
 */
export interface GitHubProviderConfig extends ProviderConfig {
  name: 'github';
  config: {
    owner: string;
    repo: string;
    token: string;
    branch?: string;
    basePath?: string;
  };
}

/**
 * Configuración específica para Supabase provider
 */
export interface SupabaseProviderConfig extends ProviderConfig {
  name: 'supabase';
  config: {
    bucketName: string;
    basePath?: string;
  };
}

/**
 * Configuración específica para Figma provider
 */
export interface FigmaProviderConfig extends ProviderConfig {
  name: 'figma';
  config: {
    // Configuración futura para Figma plugin storage
    projectId?: string;
  };
}

/**
 * Configuración específica para Local provider
 */
export interface LocalProviderConfig extends ProviderConfig {
  name: 'local';
  config: {
    // Para entorno web, usaríamos IndexedDB o similar
    storageName?: string;
  };
}

/**
 * Union type de todas las configuraciones de providers
 */
export type AnyProviderConfig = 
  | GitHubProviderConfig 
  | SupabaseProviderConfig 
  | FigmaProviderConfig 
  | LocalProviderConfig;
