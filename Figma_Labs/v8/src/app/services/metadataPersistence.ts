/**
 * METADATA PERSISTENCE SERVICE
 * Servicio para persistir cambios de metadata en el filesystem
 */

import { metadataService } from './metadataService';
import type { DocumentMetadata } from '../types/documentation';

/**
 * Resultado de operación de guardado
 */
export interface SaveResult {
  success: boolean;
  error?: string;
  updatedContent?: string;
}

/**
 * Resultado de operación bulk
 */
export interface BulkSaveResult {
  totalCount: number;
  successCount: number;
  failedCount: number;
  results: Array<{
    path: string;
    success: boolean;
    error?: string;
  }>;
}

class MetadataPersistenceService {
  /**
   * Guardar metadata de un documento
   * NOTA: En un entorno browser, esto requiere una API backend para escribir al filesystem
   * Por ahora, generamos el contenido actualizado que puede ser copiado/descargado
   */
  async saveMetadata(
    filePath: string,
    originalContent: string,
    newMetadata: Partial<DocumentMetadata>
  ): Promise<SaveResult> {
    try {
      console.log(`💾 Guardando metadata para: ${filePath}`);

      // Generar nuevo contenido con metadata actualizada
      const updatedContent = metadataService.stringify(newMetadata, originalContent);

      // En producción, aquí haríamos una llamada al backend:
      // await fetch('/api/documents/save', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ path: filePath, content: updatedContent }),
      // });

      // Por ahora, solo logeamos y retornamos el contenido
      console.log(`✅ Metadata generada exitosamente para ${filePath}`);
      console.log('📋 Nuevo contenido:', updatedContent.substring(0, 200) + '...');

      return {
        success: true,
        updatedContent,
      };
    } catch (error) {
      console.error(`❌ Error guardando metadata para ${filePath}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Guardar metadata de múltiples documentos (bulk)
   */
  async bulkSaveMetadata(
    updates: Array<{
      filePath: string;
      originalContent: string;
      newMetadata: Partial<DocumentMetadata>;
    }>
  ): Promise<BulkSaveResult> {
    console.log(`💾 Guardando metadata en bulk: ${updates.length} documentos`);

    const results: BulkSaveResult['results'] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const update of updates) {
      const result = await this.saveMetadata(
        update.filePath,
        update.originalContent,
        update.newMetadata
      );

      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }

      results.push({
        path: update.filePath,
        success: result.success,
        error: result.error,
      });
    }

    console.log(`✅ Bulk save completado: ${successCount} éxitos, ${failedCount} fallos`);

    return {
      totalCount: updates.length,
      successCount,
      failedCount,
      results,
    };
  }

  /**
   * Descargar archivo con metadata actualizada
   * Utilidad para permitir al usuario descargar el archivo actualizado
   */
  downloadUpdatedFile(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`📥 Descargando archivo actualizado: ${filename}`);
  }

  /**
   * Copiar contenido actualizado al clipboard
   */
  async copyToClipboard(content: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(content);
      console.log('📋 Contenido copiado al clipboard');
      return true;
    } catch (error) {
      console.error('❌ Error copiando al clipboard:', error);
      return false;
    }
  }

  /**
   * Crear preview del diff entre contenido original y actualizado
   */
  createDiffPreview(original: string, updated: string): {
    originalLines: string[];
    updatedLines: string[];
    changes: Array<{ type: 'added' | 'removed' | 'unchanged'; line: string }>;
  } {
    const originalLines = original.split('\n');
    const updatedLines = updated.split('\n');

    // Simple diff (esto se puede mejorar con una librería como diff o diff-match-patch)
    const changes: Array<{ type: 'added' | 'removed' | 'unchanged'; line: string }> = [];
    
    const maxLines = Math.max(originalLines.length, updatedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i];
      const updatedLine = updatedLines[i];

      if (originalLine === updatedLine) {
        if (originalLine !== undefined) {
          changes.push({ type: 'unchanged', line: originalLine });
        }
      } else {
        if (originalLine !== undefined) {
          changes.push({ type: 'removed', line: originalLine });
        }
        if (updatedLine !== undefined) {
          changes.push({ type: 'added', line: updatedLine });
        }
      }
    }

    return {
      originalLines,
      updatedLines,
      changes,
    };
  }

  /**
   * Validar que el archivo puede ser escrito
   * (checks de permisos, tamaño, etc.)
   */
  validateWritePermissions(filePath: string, content: string): {
    canWrite: boolean;
    reason?: string;
  } {
    // Check 1: Tamaño del archivo
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (content.length > maxSize) {
      return {
        canWrite: false,
        reason: `Archivo demasiado grande: ${(content.length / 1024 / 1024).toFixed(2)}MB (máx: 10MB)`,
      };
    }

    // Check 2: Path válido
    if (!filePath || filePath.includes('..')) {
      return {
        canWrite: false,
        reason: 'Path inválido o inseguro',
      };
    }

    // Check 3: Extensión .md
    if (!filePath.endsWith('.md')) {
      return {
        canWrite: false,
        reason: 'Solo se pueden editar archivos .md',
      };
    }

    return { canWrite: true };
  }

  /**
   * Crear backup del contenido original antes de guardar
   * (en localStorage para recuperación rápida)
   */
  createBackup(filePath: string, content: string): void {
    try {
      const backupKey = `backup_${filePath}_${Date.now()}`;
      const backup = {
        path: filePath,
        content,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(backupKey, JSON.stringify(backup));
      
      // Limpiar backups antiguos (más de 24 horas)
      this.cleanOldBackups();

      console.log(`💾 Backup creado: ${backupKey}`);
    } catch (error) {
      console.warn('⚠️ No se pudo crear backup en localStorage:', error);
    }
  }

  /**
   * Limpiar backups antiguos (más de 24 horas)
   */
  private cleanOldBackups(): void {
    try {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('backup_')) {
          const item = localStorage.getItem(key);
          if (item) {
            const backup = JSON.parse(item);
            const backupTime = new Date(backup.timestamp).getTime();
            
            if (now - backupTime > maxAge) {
              localStorage.removeItem(key);
              console.log(`🧹 Backup antiguo eliminado: ${key}`);
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error limpiando backups:', error);
    }
  }

  /**
   * Recuperar backups disponibles para un archivo
   */
  getBackups(filePath: string): Array<{
    key: string;
    timestamp: string;
    content: string;
  }> {
    const backups: Array<{ key: string; timestamp: string; content: string }> = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`backup_${filePath}_`)) {
          const item = localStorage.getItem(key);
          if (item) {
            const backup = JSON.parse(item);
            backups.push({
              key,
              timestamp: backup.timestamp,
              content: backup.content,
            });
          }
        }
      }

      // Ordenar por timestamp (más reciente primero)
      backups.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.warn('⚠️ Error recuperando backups:', error);
    }

    return backups;
  }
}

export const metadataPersistence = new MetadataPersistenceService();
