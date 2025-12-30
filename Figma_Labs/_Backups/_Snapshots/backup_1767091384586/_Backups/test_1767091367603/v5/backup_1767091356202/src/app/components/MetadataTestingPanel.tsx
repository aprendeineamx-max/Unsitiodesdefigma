/**
 * METADATA TESTING PANEL
 * Panel UI para ejecutar y visualizar tests del sistema de metadata
 */

import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Database,
  Settings,
  Download,
  Copy,
  RotateCcw,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { metadataTestSuite } from '../services/metadataTestSuite';

interface TestResult {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration: number;
  success: boolean;
}

export function MetadataTestingPanel({ onClose }: { onClose: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  /**
   * Ejecutar tests
   */
  const runTests = async () => {
    setIsRunning(true);
    setLogs([]);
    setTestResult(null);

    // Capturar console.log temporalmente
    const originalLog = console.log;
    const capturedLogs: string[] = [];

    console.log = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      capturedLogs.push(message);
      originalLog(...args);
    };

    try {
      const result = await metadataTestSuite.runAll();
      setTestResult(result.summary);
      setLogs(capturedLogs);

      if (result.success) {
        toast.success('All tests passed! 🎉');
      } else {
        toast.error(`${result.summary.failed} tests failed`);
      }
    } catch (error) {
      toast.error('Critical error during testing');
      console.error(error);
    } finally {
      console.log = originalLog;
      setIsRunning(false);
    }
  };

  /**
   * Copiar logs al clipboard
   */
  const copyLogs = async () => {
    try {
      await navigator.clipboard.writeText(logs.join('\n'));
      toast.success('Logs copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy logs');
    }
  };

  /**
   * Descargar logs como archivo
   */
  const downloadLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Logs downloaded');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Metadata Testing Suite
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automated testing for metadata management system
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Test Controls */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run All Tests
                </>
              )}
            </button>

            {logs.length > 0 && (
              <>
                <button
                  onClick={copyLogs}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Logs
                </button>

                <button
                  onClick={downloadLogs}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </>
            )}
          </div>

          {/* Test Results Summary */}
          {testResult && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Total */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Tests</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {testResult.total}
                </div>
              </div>

              {/* Passed */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600 dark:text-green-400">Passed</span>
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {testResult.passed}
                </div>
              </div>

              {/* Failed */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-600 dark:text-red-400">Failed</span>
                </div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {testResult.failed}
                </div>
              </div>

              {/* Duration */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-600 dark:text-blue-400">Duration</span>
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {(testResult.duration / 1000).toFixed(2)}s
                </div>
              </div>
            </div>
          )}

          {/* Test Categories Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Test Categories
              </h3>
              <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                <li>✓ Backend API (Mock)</li>
                <li>✓ Metadata Validation</li>
                <li>✓ Templates</li>
                <li>✓ Bulk Operations</li>
                <li>✓ Persistence (localStorage)</li>
                <li>✓ Copy/Download</li>
                <li>✓ Error Handling</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Testing Features
              </h3>
              <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <li>• Mock Backend with versioning</li>
                <li>• Automated validation checks</li>
                <li>• Template application testing</li>
                <li>• Bulk save operations</li>
                <li>• LocalStorage backup verification</li>
                <li>• Error simulation & handling</li>
                <li>• Performance metrics</li>
              </ul>
            </div>
          </div>

          {/* Test Logs */}
          {logs.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-100">Test Output</h3>
                <span className="text-xs text-gray-400">{logs.length} lines</span>
              </div>
              <pre className="text-xs text-gray-300 overflow-x-auto max-h-96 overflow-y-auto font-mono whitespace-pre-wrap">
                {logs.join('\n')}
              </pre>
            </div>
          )}

          {/* Empty State */}
          {!isRunning && logs.length === 0 && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Ready to Run Tests
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Click "Run All Tests" to execute the complete testing suite
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <AlertCircle className="w-4 h-4" />
                <span>Tests will execute 30+ automated checks</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {testResult ? (
              testResult.success ? (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  ✓ All tests passed successfully
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400 font-medium">
                  ✗ Some tests failed - review logs
                </span>
              )
            ) : (
              <span>No tests run yet</span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
