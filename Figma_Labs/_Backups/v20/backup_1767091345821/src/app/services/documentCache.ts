/**
 * DOCUMENT CACHE SERVICE - Sistema de Caché Inteligente
 * Caché en memoria con invalidación automática y LRU
 * Basado en: /DOCUMENTATION_CENTER_BEST_PRACTICES.md
 */

import { LRUCache } from 'lru-cache';
import type { CachedDocument, CacheStats, DiscoveredDocument } from '../types/documentation';

/**
 * Configuración del caché
 */
const CACHE_CONFIG = {
  max: 100, // Máximo 100 documentos
  maxSize: 50 * 1024 * 1024, // 50MB máximo
  ttl: 1000 * 60 * 5, // 5 minutos TTL
  updateAgeOnGet: true, // Actualizar edad al obtener
  updateAgeOnHas: false,
};

/**
 * Clase de gestión de caché de documentos
 */
class DocumentCache {
  private cache: LRUCache<string, CachedDocument>;
  private hits: number = 0;
  private misses: number = 0;

  constructor() {
    this.cache = new LRUCache<string, CachedDocument>({
      max: CACHE_CONFIG.max,
      maxSize: CACHE_CONFIG.maxSize,
      ttl: CACHE_CONFIG.ttl,
      updateAgeOnGet: CACHE_CONFIG.updateAgeOnGet,
      updateAgeOnHas: CACHE_CONFIG.updateAgeOnHas,
      
      // Función para calcular el tamaño de cada entrada
      sizeCalculation: (value) => {
        return value.content.length;
      },
      
      // Callback cuando se elimina una entrada
      dispose: (value, key) => {
        console.log(`🗑️ Cache evicted: ${key} (${value.hits} hits)`);
      },
    });
    
    console.log('💾 Document cache initialized');
    console.log(`   Max entries: ${CACHE_CONFIG.max}`);
    console.log(`   Max size: ${(CACHE_CONFIG.maxSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   TTL: ${CACHE_CONFIG.ttl / 1000}s`);
  }

  /**
   * Obtener documento del caché
   */
  get(path: string): CachedDocument | null {
    const cached = this.cache.get(path);
    
    if (cached) {
      this.hits++;
      cached.hits++;
      console.log(`📦 Cache HIT: ${path} (${cached.hits} hits)`);
      return cached;
    }
    
    this.misses++;
    console.log(`📭 Cache MISS: ${path}`);
    return null;
  }

  /**
   * Verificar si existe en caché
   */
  has(path: string): boolean {
    return this.cache.has(path);
  }

  /**
   * Guardar documento en caché
   */
  set(path: string, content: string, metadata: any): void {
    const cached: CachedDocument = {
      content,
      metadata,
      timestamp: Date.now(),
      hits: 0,
    };
    
    this.cache.set(path, cached);
    console.log(`💾 Cached: ${path} (${(content.length / 1024).toFixed(1)}KB)`);
  }

  /**
   * Invalidar entrada de caché
   */
  invalidate(path: string): void {
    const existed = this.cache.delete(path);
    if (existed) {
      console.log(`🗑️ Invalidated: ${path}`);
    }
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    const previousSize = this.cache.size;
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    console.log(`🧹 Cache cleared (${previousSize} entries removed)`);
  }

  /**
   * Pre-cargar documentos en caché
   */
  preload(documents: DiscoveredDocument[]): void {
    console.log(`🔄 Pre-loading ${documents.length} documents into cache...`);
    
    let loaded = 0;
    documents.forEach(doc => {
      if (doc.content) {
        this.set(doc.path, doc.content, doc.metadata);
        loaded++;
      }
    });
    
    console.log(`✅ Pre-loaded ${loaded} documents`);
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;
    
    // Calcular tamaño total
    let totalSize = 0;
    this.cache.forEach((value) => {
      totalSize += value.content.length;
    });
    
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      totalSize,
    };
  }

  /**
   * Imprimir estadísticas en consola
   */
  printStats(): void {
    const stats = this.getStats();
    
    console.log('📊 Cache Statistics:');
    console.log(`   Entries: ${stats.size}/${CACHE_CONFIG.max}`);
    console.log(`   Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB / ${(CACHE_CONFIG.maxSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Hits: ${stats.hits}`);
    console.log(`   Misses: ${stats.misses}`);
    console.log(`   Hit Rate: ${stats.hitRate.toFixed(1)}%`);
  }

  /**
   * Obtener entradas más accedidas
   */
  getTopHits(limit: number = 10): Array<{ path: string; hits: number }> {
    const entries: Array<{ path: string; hits: number }> = [];
    
    this.cache.forEach((value, key) => {
      entries.push({ path: key, hits: value.hits });
    });
    
    return entries
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);
  }

  /**
   * Obtener información de memoria
   */
  getMemoryInfo(): {
    usedBytes: number;
    usedMB: number;
    maxBytes: number;
    maxMB: number;
    usagePercent: number;
  } {
    const stats = this.getStats();
    
    return {
      usedBytes: stats.totalSize,
      usedMB: stats.totalSize / 1024 / 1024,
      maxBytes: CACHE_CONFIG.maxSize,
      maxMB: CACHE_CONFIG.maxSize / 1024 / 1024,
      usagePercent: (stats.totalSize / CACHE_CONFIG.maxSize) * 100,
    };
  }
}

// Exportar instancia singleton
export const documentCache = new DocumentCache();

// Exportar clase para testing
export { DocumentCache };
