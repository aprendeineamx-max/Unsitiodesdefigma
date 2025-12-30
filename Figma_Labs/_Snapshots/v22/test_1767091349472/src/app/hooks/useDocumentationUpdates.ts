/**
 * HOOK: useDocumentationUpdates
 * 
 * Hook React para suscribirse a actualizaciones en tiempo real del Centro de Documentación
 * 
 * FEATURES:
 * - ✅ Auto-suscripción y cleanup automático
 * - ✅ Callbacks tipados para cada tipo de evento
 * - ✅ Performance optimizado con useCallback
 * - ✅ Compatible con Vite HMR
 * 
 * EJEMPLO DE USO:
 * ```tsx
 * useDocumentationUpdates({
 *   onDocumentAdded: (path) => console.log('Nuevo doc:', path),
 *   onDocumentChanged: (path) => handleRefresh(path),
 *   onDocumentDeleted: (path) => handleRemove(path),
 * });
 * ```
 */

import { useEffect, useCallback, useRef } from 'react';
import { documentationUpdateService, type UpdateEvent } from '../services/documentationUpdateService';

interface UseDocumentationUpdatesOptions {
  /**
   * Callback cuando se agrega un nuevo documento
   */
  onDocumentAdded?: (path: string) => void;

  /**
   * Callback cuando se modifica un documento existente
   */
  onDocumentChanged?: (path: string) => void;

  /**
   * Callback cuando se elimina un documento
   */
  onDocumentDeleted?: (path: string) => void;

  /**
   * Callback cuando se actualiza el manifest completo
   */
  onManifestUpdated?: () => void;

  /**
   * Habilitar/deshabilitar el hook
   * @default true
   */
  enabled?: boolean;

  /**
   * Logging de eventos (útil para debugging)
   * @default false
   */
  debug?: boolean;
}

/**
 * Hook para escuchar actualizaciones en tiempo real del Centro de Documentación
 */
export function useDocumentationUpdates(options: UseDocumentationUpdatesOptions = {}) {
  const {
    onDocumentAdded,
    onDocumentChanged,
    onDocumentDeleted,
    onManifestUpdated,
    enabled = true,
    debug = false,
  } = options;

  // Referencias estables para callbacks
  const callbacksRef = useRef({
    onDocumentAdded,
    onDocumentChanged,
    onDocumentDeleted,
    onManifestUpdated,
  });

  // Actualizar referencias cuando cambien callbacks
  useEffect(() => {
    callbacksRef.current = {
      onDocumentAdded,
      onDocumentChanged,
      onDocumentDeleted,
      onManifestUpdated,
    };
  }, [onDocumentAdded, onDocumentChanged, onDocumentDeleted, onManifestUpdated]);

  // Suscribirse a eventos
  useEffect(() => {
    if (!enabled) return;

    const cleanupFunctions: Array<() => void> = [];

    // Handler para document:added
    if (callbacksRef.current.onDocumentAdded) {
      const cleanup = documentationUpdateService.on('document:added', (event: UpdateEvent) => {
        if (debug) {
          console.log('📥 useDocumentationUpdates: document:added', event);
        }
        if (event.path) {
          callbacksRef.current.onDocumentAdded?.(event.path);
        }
      });
      cleanupFunctions.push(cleanup);
    }

    // Handler para document:changed
    if (callbacksRef.current.onDocumentChanged) {
      const cleanup = documentationUpdateService.on('document:changed', (event: UpdateEvent) => {
        if (debug) {
          console.log('📝 useDocumentationUpdates: document:changed', event);
        }
        if (event.path) {
          callbacksRef.current.onDocumentChanged?.(event.path);
        }
      });
      cleanupFunctions.push(cleanup);
    }

    // Handler para document:deleted
    if (callbacksRef.current.onDocumentDeleted) {
      const cleanup = documentationUpdateService.on('document:deleted', (event: UpdateEvent) => {
        if (debug) {
          console.log('🗑️ useDocumentationUpdates: document:deleted', event);
        }
        if (event.path) {
          callbacksRef.current.onDocumentDeleted?.(event.path);
        }
      });
      cleanupFunctions.push(cleanup);
    }

    // Handler para manifest:updated
    if (callbacksRef.current.onManifestUpdated) {
      const cleanup = documentationUpdateService.on('manifest:updated', (event: UpdateEvent) => {
        if (debug) {
          console.log('🔄 useDocumentationUpdates: manifest:updated', event);
        }
        callbacksRef.current.onManifestUpdated?.();
      });
      cleanupFunctions.push(cleanup);
    }

    if (debug) {
      const stats = documentationUpdateService.getStats();
      console.log('🎣 useDocumentationUpdates: Suscrito', stats);
    }

    // Cleanup al desmontar
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      if (debug) {
        console.log('🧹 useDocumentationUpdates: Limpiado');
      }
    };
  }, [enabled, debug]);

  // Función para trigger manual refresh
  const triggerManualRefresh = useCallback(() => {
    documentationUpdateService.triggerManualRefresh();
  }, []);

  // Obtener estadísticas del servicio
  const getServiceStats = useCallback(() => {
    return documentationUpdateService.getStats();
  }, []);

  return {
    /**
     * Trigger manual refresh de documentos
     */
    triggerManualRefresh,

    /**
     * Obtener estadísticas del servicio de updates
     */
    getServiceStats,

    /**
     * Verificar si HMR está habilitado
     */
    isHMREnabled: documentationUpdateService.isHMREnabled(),
  };
}
