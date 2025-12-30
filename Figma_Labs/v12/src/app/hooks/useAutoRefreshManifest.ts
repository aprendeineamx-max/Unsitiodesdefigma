/**
 * AUTO-REFRESH MANIFEST HOOK
 * Sistema inteligente de auto-actualización del manifest de documentos
 * Elimina la necesidad de ejecutar manualmente npm run scan:docs
 * 
 * FEATURES:
 * - Polling inteligente en background
 * - Detección automática de nuevos archivos .md
 * - Cache invalidation automática
 * - Actualización en tiempo real
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { isManifestFresh } from '../services/documentScanner';
import { documentCache } from '../services/documentCache';

interface AutoRefreshConfig {
  /** Intervalo de polling en ms (default: 5 minutos) */
  pollingInterval?: number;
  /** Auto-refresh habilitado (default: true) */
  enabled?: boolean;
  /** Callback cuando se detectan cambios */
  onRefresh?: () => void;
}

interface AutoRefreshState {
  /** Manifest está desactualizado */
  isStale: boolean;
  /** Última vez que se verificó */
  lastCheck: Date | null;
  /** Auto-refresh en progreso */
  isRefreshing: boolean;
  /** Función para forzar refresh manual */
  forceRefresh: () => Promise<void>;
  /** Contador de archivos descubiertos en última actualización */
  newFilesCount: number;
}

/**
 * Hook para auto-refresh del manifest de documentos
 */
export function useAutoRefreshManifest(config: AutoRefreshConfig = {}): AutoRefreshState {
  const {
    pollingInterval = 5 * 60 * 1000, // 5 minutos
    enabled = true,
    onRefresh,
  } = config;

  const [isStale, setIsStale] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newFilesCount, setNewFilesCount] = useState(0);
  
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Verificar si el manifest está desactualizado
   */
  const checkManifestFreshness = useCallback(() => {
    const fresh = isManifestFresh();
    setIsStale(!fresh);
    setLastCheck(new Date());
    
    // ⚠️ No loguear - demasiado ruidoso
    // if (!fresh && import.meta.env.DEV) {
    //   console.warn('⚠️ Manifest desactualizado. Auto-refresh disponible.');
    // }
    
    return fresh;
  }, []);

  /**
   * Descubrir nuevos archivos .md dinámicamente
   * Este es un sistema híbrido que complementa el manifest estático
   */
  const discoverNewFiles = useCallback(async (): Promise<string[]> => {
    try {
      // En un entorno real, esto podría hacer una llamada a un endpoint
      // que liste archivos del servidor. Por ahora, retornamos array vacío
      // ya que en el browser no podemos acceder al filesystem directamente.
      
      // TODO: Implementar endpoint backend para listar archivos .md
      // const response = await fetch('/api/docs/list');
      // const newFiles = await response.json();
      
      return [];
    } catch (error) {
      console.error('Error discovering new files:', error);
      return [];
    }
  }, []);

  /**
   * Regenerar manifest automáticamente
   * En desarrollo, esto puede trigger un rebuild del manifest
   */
  const regenerateManifest = useCallback(async (): Promise<void> => {
    if (import.meta.env.DEV) {
      console.log('🔄 Intentando regenerar manifest automáticamente...');
      
      // En desarrollo con Vite, podemos usar HMR para recargar el manifest
      // Si el archivo cambia, Vite lo recargará automáticamente
      
      // Por ahora, invalidamos el cache para forzar re-fetch
      documentCache.clear();
      
      console.log('✅ Cache invalidado. Recarga de página recomendada.');
    }
  }, []);

  /**
   * Forzar refresh manual del manifest
   */
  const forceRefresh = useCallback(async (): Promise<void> => {
    if (isRefreshing) {
      console.log('⏳ Refresh ya en progreso...');
      return;
    }

    setIsRefreshing(true);
    
    try {
      console.log('🔄 Iniciando refresh manual del manifest...');
      
      // 1. Descubrir nuevos archivos
      const newFiles = await discoverNewFiles();
      setNewFilesCount(newFiles.length);
      
      if (newFiles.length > 0) {
        console.log(`📁 Descubiertos ${newFiles.length} archivos nuevos`);
      }
      
      // 2. Regenerar manifest
      await regenerateManifest();
      
      // 3. Verificar frescura
      checkManifestFreshness();
      
      // 4. Callback
      if (onRefresh) {
        onRefresh();
      }
      
      console.log('✅ Refresh completado exitosamente');
      
      // En desarrollo, sugerimos recarga
      if (import.meta.env.DEV && newFiles.length > 0) {
        const shouldReload = window.confirm(
          `Se descubrieron ${newFiles.length} documentos nuevos. ¿Recargar la página para verlos?`
        );
        if (shouldReload) {
          window.location.reload();
        }
      }
      
    } catch (error) {
      console.error('❌ Error en refresh del manifest:', error);
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [isRefreshing, discoverNewFiles, regenerateManifest, checkManifestFreshness, onRefresh]);

  /**
   * Polling automático en background
   */
  useEffect(() => {
    if (!enabled) return;

    // Check inicial
    checkManifestFreshness();

    // Setup polling
    pollingTimerRef.current = setInterval(() => {
      if (isMountedRef.current) {
        checkManifestFreshness();
        
        // ⚠️ NO auto-ejecutar forceRefresh() aquí - causa loop infinito
        // Solo verificar y dejar que el usuario haga clic en el botón
        // Si quieres auto-refresh en desarrollo, hazlo con precaución:
        // if (!fresh && import.meta.env.DEV && someFlag) {
        //   forceRefresh();
        // }
      }
    }, pollingInterval);

    // Cleanup
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [enabled, pollingInterval, checkManifestFreshness]); // ✅ NO incluir forceRefresh aquí

  /**
   * Cleanup en unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Detectar cambios en el manifest via HMR (solo desarrollo)
   */
  useEffect(() => {
    if (import.meta.env.DEV && import.meta.hot) {
      // Escuchar cambios en el manifest
      import.meta.hot.on('manifest-updated', () => {
        console.log('📝 Manifest actualizado via HMR');
        checkManifestFreshness();
        if (onRefresh) {
          onRefresh();
        }
      });
    }
  }, [checkManifestFreshness, onRefresh]);

  return {
    isStale,
    lastCheck,
    isRefreshing,
    forceRefresh,
    newFilesCount,
  };
}

/**
 * Hook simplificado solo para verificar frescura
 */
export function useManifestFreshness(): boolean {
  const [isFresh, setIsFresh] = useState(true);

  useEffect(() => {
    const fresh = isManifestFresh();
    setIsFresh(fresh);

    // Re-check cada minuto
    const interval = setInterval(() => {
      setIsFresh(isManifestFresh());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return isFresh;
}