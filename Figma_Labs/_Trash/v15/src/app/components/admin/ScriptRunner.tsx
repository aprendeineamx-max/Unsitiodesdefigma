import { useState, useRef, useEffect } from 'react';
import { Play, Square, CheckCircle, XCircle, Clock, FileCode, Terminal, Trash2, Download, Copy, AlertCircle, Zap } from 'lucide-react';

/**
 * SCRIPT RUNNER v2.0.0 - EJECUCIÓN REAL
 * 
 * Centro de ejecución REAL de scripts usando Vite middleware + SSE.
 * 
 * CAMBIOS EN v2.0.0:
 * ✅ NO MÁS SIMULACIONES - Ejecución real con child_process
 * ✅ Server-Sent Events para output en tiempo real
 * ✅ API endpoints: /api/execute-script y /api/script-output/:jobId
 * ✅ Streaming de stdout/stderr en tiempo real
 * 
 * Características:
 * - Ejecución REAL de scripts Node.js desde /scripts/
 * - Terminal visual con output en tiempo real (SSE)
 * - Estado de ejecución real (running, success, error)
 * - Exit codes reales del proceso
 * - Historial de ejecuciones
 * - Copy/Download de output
 */

interface Script {
  id: string;
  name: string;
  filename: string;
  description: string;
  language: 'node' | 'python' | 'php' | 'go' | 'bash' | 'unknown';
  icon: any;
  color: string;
  category: 'migration' | 'maintenance' | 'utility' | 'test';
  estimatedTime: string;
  command: string;
  dangerous: boolean;
}

type ExecutionStatus = 'idle' | 'running' | 'success' | 'error';

interface ExecutionLog {
  timestamp: Date;
  scriptId: string;
  status: ExecutionStatus;
  output: string;
  duration: number;
}

const availableScripts: Script[] = [
  {
    id: 'migrate-docs',
    name: 'Migración de Documentación a src/docs',
    filename: 'migrate-docs-to-src.cjs',
    description: 'Mueve todos los archivos .md de la raíz del proyecto a /src/docs/ para cumplir con estándares de Vite en producción. Preserva README.md en raíz. Incluye carpeta guidelines/. EJECUCIÓN REAL con child_process.',
    language: 'node',
    icon: FileCode,
    color: 'from-blue-500 to-cyan-500',
    category: 'migration',
    estimatedTime: '5-10 segundos',
    command: 'node scripts/migrate-docs-to-src.cjs',
    dangerous: false,
  },
  // Más scripts se pueden agregar aquí en el futuro
];

export function ScriptRunner() {
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>('idle');
  const [output, setOutput] = useState<string[]>([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal cuando hay nuevo output
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Cleanup EventSource al desmontar
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  /**
   * Detectar icono por lenguaje
   */
  const getLanguageIcon = (language: Script['language']) => {
    switch (language) {
      case 'node':
        return '🟢'; // Node.js
      case 'python':
        return '🐍'; // Python
      case 'php':
        return '🐘'; // PHP
      case 'go':
        return '🔷'; // Go
      case 'bash':
        return '📜'; // Bash
      default:
        return '📄'; // Unknown
    }
  };

  /**
   * EJECUCIÓN REAL DE SCRIPT
   * 
   * Usa endpoints de Vite middleware:
   * 1. POST /api/execute-script - Inicia ejecución
   * 2. GET /api/script-output/:jobId - Stream SSE de output
   */
  const executeScript = async (script: Script) => {
    setSelectedScript(script);
    setExecutionStatus('running');
    setOutput([]);
    setStartTime(new Date());

    // Cerrar EventSource anterior si existe
    if (eventSource) {
      eventSource.close();
    }

    // Log inicial
    addOutput(`[${new Date().toLocaleTimeString()}] ⚡ EJECUCIÓN REAL iniciada`);
    addOutput(`[${new Date().toLocaleTimeString()}] 🚀 Script: ${script.name}`);
    addOutput(`[${new Date().toLocaleTimeString()}] 📂 Archivo: ${script.filename}`);
    addOutput(`[${new Date().toLocaleTimeString()}] 💻 Comando: ${script.command}`);
    addOutput(`[${new Date().toLocaleTimeString()}] 🔥 Modo: REAL (child_process + SSE)`);
    addOutput('');

    try {
      // Paso 1: Iniciar ejecución
      addOutput(`[${new Date().toLocaleTimeString()}] 📡 Conectando a API...`);
      
      const response = await fetch('/api/execute-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptId: script.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const { jobId } = data;

      setCurrentJobId(jobId);
      addOutput(`[${new Date().toLocaleTimeString()}] ✅ Job iniciado: ${jobId}`);
      addOutput(`[${new Date().toLocaleTimeString()}] 🔌 Conectando a stream SSE...`);
      addOutput('');

      // Paso 2: Conectar a SSE para recibir output en tiempo real
      const es = new EventSource(`/api/script-output/${jobId}`);
      setEventSource(es);

      es.addEventListener('start', (event) => {
        const eventData = JSON.parse(event.data);
        addOutput(`[${new Date().toLocaleTimeString()}] 🎬 Stream conectado`);
        addOutput(`[${new Date().toLocaleTimeString()}] ⏱️  Inicio: ${new Date(eventData.startTime).toLocaleTimeString()}`);
        addOutput('');
        addOutput('═══════════════════════════════════════════════════════════');
        addOutput('  📦 OUTPUT DEL SCRIPT (TIEMPO REAL)');
        addOutput('═══════════════════════════════════════════════════════════');
        addOutput('');
      });

      es.addEventListener('output', (event) => {
        const eventData = JSON.parse(event.data);
        addOutput(eventData.line);
      });

      es.addEventListener('end', (event) => {
        const eventData = JSON.parse(event.data);
        const { status, exitCode, duration } = eventData;

        addOutput('');
        addOutput('═══════════════════════════════════════════════════════════');
        addOutput('  📊 RESULTADO DE EJECUCIÓN');
        addOutput('═══════════════════════════════════════════════════════════');
        addOutput('');
        addOutput(`  Estado:      ${status === 'success' ? '✅ ÉXITO' : '❌ ERROR'}`);
        addOutput(`  Exit Code:   ${exitCode}`);
        addOutput(`  Duración:    ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
        addOutput('');
        addOutput('═══════════════════════════════════════════════════════════');

        // Actualizar estado
        setExecutionStatus(status as ExecutionStatus);
        es.close();
        setEventSource(null);

        // Guardar en historial
        if (startTime) {
          const log: ExecutionLog = {
            timestamp: new Date(),
            scriptId: script.id,
            status: status as ExecutionStatus,
            output: output.join('\n'),
            duration,
          };
          setExecutionLogs(prev => [log, ...prev].slice(0, 10));
        }
      });

      es.onerror = (error) => {
        addOutput('');
        addOutput(`[${new Date().toLocaleTimeString()}] ❌ Error en stream SSE`);
        setExecutionStatus('error');
        es.close();
        setEventSource(null);
      };

    } catch (error: any) {
      addOutput('');
      addOutput(`[${new Date().toLocaleTimeString()}] ❌ Error al iniciar ejecución: ${error.message}`);
      setExecutionStatus('error');
    }
  };

  /**
   * Agregar línea al output
   */
  const addOutput = (line: string) => {
    setOutput(prev => [...prev, line]);
  };

  /**
   * Limpiar terminal
   */
  const clearTerminal = () => {
    setOutput([]);
    setExecutionStatus('idle');
    setSelectedScript(null);
    setCurrentJobId(null);
    
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
  };

  /**
   * Copiar output al portapapeles
   */
  const copyOutput = () => {
    navigator.clipboard.writeText(output.join('\n'));
    // TODO: Mostrar toast de confirmación
  };

  /**
   * Descargar output como archivo
   */
  const downloadOutput = () => {
    const blob = new Blob([output.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-output-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Obtener color de estado
   */
  const getStatusColor = (status: ExecutionStatus) => {
    switch (status) {
      case 'running':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  /**
   * Obtener icono de estado
   */
  const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case 'running':
        return <Clock className="w-5 h-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Terminal className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-8 h-8" />
          <h2 className="text-2xl font-black">Script Runner v2.0 - EJECUCIÓN REAL</h2>
        </div>
        <p className="text-purple-100">
          Ejecuta scripts Node.js REALES usando child_process + Server-Sent Events
        </p>
      </div>

      {/* Real Execution Badge */}
      <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-4">
        <div className="flex gap-3">
          <Zap className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-green-900 dark:text-green-200 mb-1">
              ⚡ Ejecución REAL Activada - v2.0
            </h4>
            <p className="text-sm text-green-800 dark:text-green-300">
              Los scripts se ejecutan REALMENTE usando child_process.spawn() en el servidor Vite.
              El output se transmite en tiempo real mediante Server-Sent Events (SSE).
            </p>
            <p className="text-sm text-green-800 dark:text-green-300 mt-2">
              <strong>Tecnologías:</strong> Vite Middleware + Node.js child_process + SSE streaming
            </p>
          </div>
        </div>
      </div>

      {/* Available Scripts */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Scripts Disponibles
        </h3>

        <div className="grid gap-4">
          {availableScripts.map(script => (
            <div
              key={script.id}
              className={`
                bg-white dark:bg-slate-800 rounded-xl p-6 border-2 transition-all
                ${selectedScript?.id === script.id 
                  ? 'border-purple-500 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getLanguageIcon(script.language)}</span>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {script.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {script.filename}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {script.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                      {script.language.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                      ⏱️ {script.estimatedTime}
                    </span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      ⚡ EJECUCIÓN REAL
                    </span>
                    {script.dangerous && (
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                        ⚠️ Precaución
                      </span>
                    )}
                  </div>

                  {/* Command */}
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 font-mono text-sm text-gray-700 dark:text-gray-300">
                    $ {script.command}
                  </div>
                </div>

                {/* Execute Button */}
                <button
                  onClick={() => executeScript(script)}
                  disabled={executionStatus === 'running'}
                  className={`
                    ml-4 px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2
                    ${executionStatus === 'running'
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                    }
                  `}
                >
                  {executionStatus === 'running' && selectedScript?.id === script.id ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      Ejecutando...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Ejecutar REAL
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Output */}
      {output.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-6 h-6" />
              Terminal (Output Real)
              {currentJobId && (
                <span className="text-sm font-mono text-gray-500">
                  Job: {currentJobId}
                </span>
              )}
            </h3>

            {/* Terminal Actions */}
            <div className="flex gap-2">
              <button
                onClick={copyOutput}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar
              </button>
              <button
                onClick={downloadOutput}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
              <button
                onClick={clearTerminal}
                className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar
              </button>
            </div>
          </div>

          {/* Terminal Window */}
          <div className="bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-700">
            {/* Terminal Header */}
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="ml-4 text-gray-400 text-sm font-mono">
                  {selectedScript?.filename || 'terminal'} [REAL EXECUTION]
                </span>
              </div>

              {/* Status Indicator */}
              <div className={`flex items-center gap-2 ${getStatusColor(executionStatus)}`}>
                {getStatusIcon(executionStatus)}
                <span className="text-sm font-bold uppercase">
                  {executionStatus}
                </span>
              </div>
            </div>

            {/* Terminal Body */}
            <div
              ref={terminalRef}
              className="p-4 font-mono text-sm text-gray-100 h-96 overflow-y-auto custom-scrollbar"
            >
              {output.map((line, index) => (
                <div key={index} className="leading-relaxed">
                  {line}
                </div>
              ))}
              {executionStatus === 'running' && (
                <div className="mt-2 text-yellow-400 animate-pulse">
                  ▋ Ejecutando...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
