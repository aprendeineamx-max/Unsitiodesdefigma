/**
 * METADATA VERSION DIFF VIEWER
 * Visualizador side-by-side de diferencias entre versiones
 * 
 * Features:
 * - Diff side-by-side (before/after)
 * - Color coding (added/removed/modified)
 * - Line-by-line comparison
 * - Syntax highlighting para YAML
 * - Restore functionality
 * - Copy before/after
 * - Full-screen mode
 */

import React, { useMemo } from 'react';
import {
  X,
  RotateCcw,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { metadataService } from '../services/metadataService';
import type { DocumentMetadata } from '../types/documentation';

interface MetadataVersionDiffProps {
  before: Partial<DocumentMetadata> | null;
  after: Partial<DocumentMetadata>;
  documentTitle: string;
  timestamp: string;
  onClose: () => void;
  onRestore: () => void;
}

interface DiffLine {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  key: string;
  beforeValue: string | null;
  afterValue: string | null;
  beforeFormatted: string;
  afterFormatted: string;
}

export function MetadataVersionDiff({
  before,
  after,
  documentTitle,
  timestamp,
  onClose,
  onRestore,
}: MetadataVersionDiffProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  /**
   * Generar diff lines
   */
  const diffLines = useMemo(() => {
    const lines: DiffLine[] = [];
    const allKeys = new Set<string>();

    // Recopilar todas las keys
    if (before) {
      Object.keys(before).forEach(key => allKeys.add(key));
    }
    Object.keys(after).forEach(key => allKeys.add(key));

    // Ordenar keys alfabéticamente
    const sortedKeys = Array.from(allKeys).sort();

    // Generar diff para cada key
    sortedKeys.forEach(key => {
      const beforeVal = before?.[key as keyof DocumentMetadata];
      const afterVal = after[key as keyof DocumentMetadata];

      const beforeStr = formatValue(beforeVal);
      const afterStr = formatValue(afterVal);

      let type: DiffLine['type'] = 'unchanged';

      if (beforeVal === undefined && afterVal !== undefined) {
        type = 'added';
      } else if (beforeVal !== undefined && afterVal === undefined) {
        type = 'removed';
      } else if (beforeStr !== afterStr) {
        type = 'modified';
      }

      lines.push({
        type,
        key,
        beforeValue: beforeStr,
        afterValue: afterStr,
        beforeFormatted: formatYAMLLine(key, beforeVal),
        afterFormatted: formatYAMLLine(key, afterVal),
      });
    });

    return lines;
  }, [before, after]);

  /**
   * Formatear valor para comparación
   */
  function formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  /**
   * Formatear línea YAML
   */
  function formatYAMLLine(key: string, value: any): string {
    if (value === undefined) {
      return '';
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return `${key}: []`;
      }
      return `${key}:\n  - ${value.join('\n  - ')}`;
    }

    if (typeof value === 'string') {
      // Si tiene saltos de línea o caracteres especiales, usar "|"
      if (value.includes('\n') || value.includes(':') || value.includes('#')) {
        return `${key}: |\n  ${value.split('\n').join('\n  ')}`;
      }
      return `${key}: "${value}"`;
    }

    return `${key}: ${value}`;
  }

  /**
   * Generar contenido completo (before/after)
   */
  const beforeContent = useMemo(() => {
    if (!before) return null;
    return metadataService.stringify(before, '');
  }, [before]);

  const afterContent = useMemo(() => {
    return metadataService.stringify(after, '');
  }, [after]);

  /**
   * Estadísticas del diff
   */
  const stats = useMemo(() => {
    const added = diffLines.filter(l => l.type === 'added').length;
    const removed = diffLines.filter(l => l.type === 'removed').length;
    const modified = diffLines.filter(l => l.type === 'modified').length;
    const unchanged = diffLines.filter(l => l.type === 'unchanged').length;

    return { added, removed, modified, unchanged, total: diffLines.length };
  }, [diffLines]);

  /**
   * Copiar before/after
   */
  const handleCopy = (content: string | null, label: string) => {
    if (!content) {
      toast.error('No content to copy');
      return;
    }
    navigator.clipboard.writeText(content);
    toast.success(`${label} copied to clipboard`);
  };

  /**
   * Descargar before/after
   */
  const handleDownload = (content: string | null, label: string) => {
    if (!content) {
      toast.error('No content to download');
      return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${label.toLowerCase().replace(' ', '-')}-${timestamp}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`${label} downloaded`);
  };

  return (
    <div
      className={`fixed ${
        isFullscreen ? 'inset-0' : 'inset-0'
      } bg-black/50 z-[80] flex items-center justify-center p-4`}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl ${
          isFullscreen ? 'w-full h-full' : 'max-w-7xl w-full max-h-[90vh]'
        } overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Comparing Versions
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {documentTitle} • {new Date(timestamp).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-xs">
              {stats.added > 0 && (
                <span className="text-green-600 dark:text-green-400">
                  +{stats.added} added
                </span>
              )}
              {stats.removed > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  -{stats.removed} removed
                </span>
              )}
              {stats.modified > 0 && (
                <span className="text-blue-600 dark:text-blue-400">
                  ~{stats.modified} modified
                </span>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-gray-500" />
              ) : (
                <Maximize2 className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* Restore */}
            <button
              onClick={onRestore}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Restore
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 h-full">
            {/* Before (Left) */}
            <div className="border-r border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="font-medium text-red-600 dark:text-red-400">
                    Before
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(beforeContent, 'Before version')}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                  <button
                    onClick={() => handleDownload(beforeContent, 'Before version')}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/30">
                {beforeContent === null ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <AlertTriangle className="w-12 h-12 mb-2" />
                    <p className="text-sm">No previous version</p>
                  </div>
                ) : (
                  <pre className="font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                    {diffLines.map((line, idx) => (
                      <div
                        key={idx}
                        className={`px-2 py-1 ${
                          line.type === 'removed'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200'
                            : line.type === 'modified'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200'
                            : ''
                        }`}
                      >
                        {line.beforeFormatted || (
                          <span className="text-gray-400 italic">
                            (not present)
                          </span>
                        )}
                      </div>
                    ))}
                  </pre>
                )}
              </div>
            </div>

            {/* After (Right) */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-green-600 dark:text-green-400">
                    After
                  </span>
                  <ChevronRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(afterContent, 'After version')}
                    className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/40 rounded transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </button>
                  <button
                    onClick={() => handleDownload(afterContent, 'After version')}
                    className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/40 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/30">
                <pre className="font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                  {diffLines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`px-2 py-1 ${
                        line.type === 'added'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200'
                          : line.type === 'modified'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200'
                          : ''
                      }`}
                    >
                      {line.afterFormatted || (
                        <span className="text-gray-400 italic">
                          (not present)
                        </span>
                      )}
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total: {stats.total} field{stats.total !== 1 ? 's' : ''} •{' '}
            {stats.added + stats.removed + stats.modified} change
            {stats.added + stats.removed + stats.modified !== 1 ? 's' : ''}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
