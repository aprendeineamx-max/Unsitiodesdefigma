/**
 * METADATA SAVE DIALOG
 * Dialog para confirmar y previsualizar cambios antes de guardar
 */

import React, { useState } from 'react';
import {
  Download,
  Copy,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  FileText,
  Eye,
  Code,
} from 'lucide-react';
import { toast } from 'sonner';
import { metadataPersistence } from '../services/metadataPersistence';

interface MetadataSaveDialogProps {
  /**
   * Path del archivo
   */
  filePath: string;
  
  /**
   * Contenido original
   */
  originalContent: string;
  
  /**
   * Contenido actualizado
   */
  updatedContent: string;
  
  /**
   * Callback cuando se cierra
   */
  onClose: () => void;
  
  /**
   * Callback cuando se confirma el guardado
   */
  onConfirm?: () => void;
}

type ViewMode = 'preview' | 'diff' | 'yaml';

export function MetadataSaveDialog({
  filePath,
  originalContent,
  updatedContent,
  onClose,
  onConfirm,
}: MetadataSaveDialogProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [isCopying, setIsCopying] = useState(false);

  const filename = filePath.split('/').pop() || 'document.md';

  /**
   * Copiar al clipboard
   */
  const handleCopy = async () => {
    setIsCopying(true);
    const success = await metadataPersistence.copyToClipboard(updatedContent);
    
    if (success) {
      toast.success('Contenido copiado al clipboard');
    } else {
      toast.error('Error copiando al clipboard');
    }
    
    setTimeout(() => setIsCopying(false), 1000);
  };

  /**
   * Descargar archivo
   */
  const handleDownload = () => {
    metadataPersistence.downloadUpdatedFile(filename, updatedContent);
    toast.success(`Archivo descargado: ${filename}`);
  };

  /**
   * Confirmar cambios
   */
  const handleConfirm = () => {
    // Crear backup antes de confirmar
    metadataPersistence.createBackup(filePath, originalContent);
    
    toast.success('Metadata actualizada exitosamente');
    onConfirm?.();
    onClose();
  };

  /**
   * Extraer frontmatter YAML
   */
  const extractYAML = (content: string): string => {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    return match ? match[1] : '';
  };

  const originalYAML = extractYAML(originalContent);
  const updatedYAML = extractYAML(updatedContent);

  /**
   * Crear diff simple
   */
  const createDiff = () => {
    const diff = metadataPersistence.createDiffPreview(originalYAML, updatedYAML);
    return diff.changes;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Confirmar Cambios de Metadata
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filename}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* View Mode Selector */}
        <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setViewMode('preview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'preview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Preview
          </button>
          
          <button
            onClick={() => setViewMode('diff')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'diff'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Code className="w-4 h-4 inline mr-2" />
            Diff
          </button>
          
          <button
            onClick={() => setViewMode('yaml')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'yaml'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            YAML
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Preview Mode */}
          {viewMode === 'preview' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Original */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Original
                </h3>
                <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-sm overflow-x-auto">
                  {originalYAML}
                </pre>
              </div>

              {/* Updated */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                  Actualizado
                </h3>
                <pre className="p-4 bg-gray-900 text-green-100 rounded-lg text-sm overflow-x-auto">
                  {updatedYAML}
                </pre>
              </div>
            </div>
          )}

          {/* Diff Mode */}
          {viewMode === 'diff' && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Cambios Detectados
              </h3>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                {createDiff().map((change, i) => (
                  <div
                    key={i}
                    className={`font-mono text-sm ${
                      change.type === 'added'
                        ? 'bg-green-900/30 text-green-300'
                        : change.type === 'removed'
                        ? 'bg-red-900/30 text-red-300'
                        : 'text-gray-400'
                    }`}
                  >
                    <span className="inline-block w-6">
                      {change.type === 'added' ? '+' : change.type === 'removed' ? '-' : ' '}
                    </span>
                    {change.line}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YAML Mode */}
          {viewMode === 'yaml' && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Frontmatter YAML Completo
              </h3>
              <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-sm overflow-x-auto">
                {updatedContent.substring(0, 1000)}
                {updatedContent.length > 1000 && '\n...\n(contenido truncado)'}
              </pre>
            </div>
          )}

          {/* Warning */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 text-sm mb-1">
                  Nota Importante
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  En un entorno browser, los cambios no se pueden guardar directamente al filesystem. 
                  Puedes <strong>copiar</strong> el contenido al clipboard o <strong>descargar</strong> el archivo actualizado.
                  Se creará un backup automático en localStorage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Backup automático habilitado
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              disabled={isCopying}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              {isCopying ? 'Copiado!' : 'Copiar'}
            </button>
            
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Confirmar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
