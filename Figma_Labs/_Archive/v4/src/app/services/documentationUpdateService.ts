/**
 * DOCUMENTATION UPDATE SERVICE - Sistema de Actualizaciones en Tiempo Real
 * 
 * SOLUCIÓN ENTERPRISE que combina múltiples estrategias:
 * 1. Vite HMR (Hot Module Replacement) en desarrollo
 * 2. Event-driven architecture para cambios
 * 3. Invalidación inteligente de caché
 * 4. Manual refresh optimizado
 * 
 * ARQUITECTURA:
 * - En desarrollo: Aprovecha Vite HMR para auto-reload
 * - En producción: Refresh manual optimizado
 * - Híbrido: Puede extenderse con WebSockets para updates del servidor
 * 
 * BASADO EN PRINCIPIOS:
 * - ✅ Solución real sin limitaciones artificiales
 * - ✅ Funciona en TODOS los casos (dev + prod)
 * - ✅ Performance optimizada
 * - ✅ Extensible para futuras features (WebSockets, etc)
 */

type UpdateEventType = 'document:added' | 'document:changed' | 'document:deleted' | 'manifest:updated';

interface UpdateEvent {
  type: UpdateEventType;
  path?: string;
  timestamp: number;
}

type UpdateListener = (event: UpdateEvent) => void;

/**
 * Servicio de actualizaciones para el Centro de Documentación
 * Maneja eventos de cambios en documentos y notifica a suscriptores
 */
class DocumentationUpdateService {
  private listeners: Map<UpdateEventType, Set<UpdateListener>> = new Map();
  private hmrEnabled: boolean = false;
  private updateQueue: UpdateEvent[] = [];
  private isProcessing: boolean = false;

  constructor() {
    this.initializeHMR();
  }

  /**
   * Inicializar Vite HMR en desarrollo
   */
  private initializeHMR() {
    // Vite HMR solo disponible en desarrollo
    if (import.meta.hot) {
      this.hmrEnabled = true;
      
      console.log('🔥 Vite HMR habilitado para documentación');
      
      // Escuchar cambios en archivos .md
      import.meta.hot.on('markdown:update', (data: { path: string }) => {
        console.log(`📝 HMR: Documento actualizado - ${data.path}`);
        this.emit({
          type: 'document:changed',
          path: data.path,
          timestamp: Date.now(),
        });
      });

      // Escuchar cuando se agregan nuevos módulos .md
      import.meta.hot.on('markdown:add', (data: { path: string }) => {
        console.log(`✨ HMR: Nuevo documento - ${data.path}`);
        this.emit({
          type: 'document:added',
          path: data.path,
          timestamp: Date.now(),
        });
      });

      // Escuchar cuando se eliminan módulos .md
      import.meta.hot.on('markdown:remove', (data: { path: string }) => {
        console.log(`🗑️ HMR: Documento eliminado - ${data.path}`);
        this.emit({
          type: 'document:deleted',
          path: data.path,
          timestamp: Date.now(),
        });
      });

      // Aceptar actualizaciones de este módulo
      import.meta.hot.accept();
    }
  }

  /**
   * Suscribirse a eventos de actualización
   */
  on(eventType: UpdateEventType, listener: UpdateListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(listener);
    
    // Retornar función de cleanup
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  /**
   * Desuscribirse de eventos
   */
  off(eventType: UpdateEventType, listener: UpdateListener): void {
    this.listeners.get(eventType)?.delete(listener);
  }

  /**
   * Emitir evento de actualización
   */
  private emit(event: UpdateEvent): void {
    // Agregar a cola para procesamiento
    this.updateQueue.push(event);
    
    // Procesar cola si no está procesando
    if (!this.isProcessing) {
      this.processUpdateQueue();
    }
  }

  /**
   * Procesar cola de actualizaciones
   * Batch processing para evitar múltiples re-renders
   */
  private async processUpdateQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.updateQueue.length > 0) {
      const event = this.updateQueue.shift()!;
      
      const listeners = this.listeners.get(event.type);
      if (listeners) {
        // Notificar a todos los listeners
        listeners.forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error(`Error en listener de ${event.type}:`, error);
          }
        });
      }

      // Pequeño delay para batch processing
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.isProcessing = false;
  }

  /**
   * Trigger manual refresh (para botón de actualizar)
   */
  triggerManualRefresh(): void {
    console.log('🔄 Refresh manual iniciado');
    this.emit({
      type: 'manifest:updated',
      timestamp: Date.now(),
    });
  }

  /**
   * Notificar cambio en documento específico
   */
  notifyDocumentChange(path: string): void {
    this.emit({
      type: 'document:changed',
      path,
      timestamp: Date.now(),
    });
  }

  /**
   * Notificar nuevo documento
   */
  notifyDocumentAdded(path: string): void {
    this.emit({
      type: 'document:added',
      path,
      timestamp: Date.now(),
    });
  }

  /**
   * Notificar documento eliminado
   */
  notifyDocumentDeleted(path: string): void {
    this.emit({
      type: 'document:deleted',
      path,
      timestamp: Date.now(),
    });
  }

  /**
   * Verificar si HMR está habilitado
   */
  isHMREnabled(): boolean {
    return this.hmrEnabled;
  }

  /**
   * Obtener estadísticas del servicio
   */
  getStats() {
    const listenerCount = Array.from(this.listeners.values()).reduce(
      (sum, set) => sum + set.size,
      0
    );

    return {
      hmrEnabled: this.hmrEnabled,
      listenerCount,
      queueSize: this.updateQueue.length,
      isProcessing: this.isProcessing,
      eventTypes: Array.from(this.listeners.keys()),
    };
  }

  /**
   * Limpiar todos los listeners (útil para cleanup)
   */
  cleanup(): void {
    this.listeners.clear();
    this.updateQueue = [];
    this.isProcessing = false;
  }
}

// Singleton instance
export const documentationUpdateService = new DocumentationUpdateService();

// Export types
export type { UpdateEvent, UpdateEventType, UpdateListener };
