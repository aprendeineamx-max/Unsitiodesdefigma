/**
 * Unified Storage API - Public Exports
 * 
 * @module storage
 * @version 1.0.0
 */

// Export singleton instance
export { unifiedStorage, UnifiedStorageAPI } from './UnifiedStorage';

// Export all types
export type {
  StorageProviderType,
  FileType,
  FileItem,
  StorageOperationResult,
  IStorageProvider,
  ListOptions,
  ReadOptions,
  WriteOptions,
  DeleteOptions,
  ProviderConfig,
  GitHubProviderConfig,
  SupabaseProviderConfig,
  FigmaProviderConfig,
  LocalProviderConfig,
  AnyProviderConfig
} from './types';
