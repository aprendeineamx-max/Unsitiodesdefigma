import { useState, useRef, useEffect } from 'react';
import { Play, Square, CheckCircle, XCircle, Clock, FileCode, Terminal, Trash2, Download, Copy, AlertCircle } from 'lucide-react';

/**
 * SCRIPT RUNNER v1.0.0
 * 
 * Centro de ejecución de scripts de mantenimiento y utilidades.
 * Soporta scripts de Node.js, Python, PHP, Go, etc.
 * 
 * Características:
 * - Ejecución de scripts desde /scripts/
 * - Terminal visual con output en tiempo real
 * - Estado de ejecución (running, success, error)
 * - Detección automática de lenguaje por extensión
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
    description: 'Mueve todos los archivos .md de la raíz del proyecto a /src/docs/ para cumplir con estándares de Vite en producción. Preserva README.md en raíz. Incluye carpeta guidelines/.',
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
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal cuando hay nuevo output
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

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
   * Ejecutar script simulado
   * 
   * NOTA: En producción, esto debería llamar a un endpoint del servidor
   * que ejecute el script real. Por seguridad, no se puede ejecutar
   * comandos del sistema directamente desde el navegador.
   * 
   * Este es un simulador educativo que muestra cómo sería la UI.
   */
  const executeScript = async (script: Script) => {
    setSelectedScript(script);
    setExecutionStatus('running');
    setOutput([]);
    setStartTime(new Date());

    // Agregar log inicial
    addOutput(`[${new Date().toLocaleTimeString()}] 🚀 Iniciando: ${script.name}`);
    addOutput(`[${new Date().toLocaleTimeString()}] 📂 Script: ${script.filename}`);
    addOutput(`[${new Date().toLocaleTimeString()}] 💻 Comando: ${script.command}`);
    addOutput('');

    try {
      // Simular ejecución del script migrate-docs-to-src.cjs
      if (script.id === 'migrate-docs') {
        await simulateMigrationScript();
      } else {
        // Placeholder para otros scripts
        addOutput('⚠️ Script no implementado aún');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Éxito
      setExecutionStatus('success');
      addOutput('');
      addOutput(`[${new Date().toLocaleTimeString()}] ✅ Script completado exitosamente`);

      // Guardar en historial
      const duration = startTime ? Date.now() - startTime.getTime() : 0;
      const log: ExecutionLog = {
        timestamp: new Date(),
        scriptId: script.id,
        status: 'success',
        output: output.join('\n'),
        duration,
      };
      setExecutionLogs(prev => [log, ...prev].slice(0, 10)); // Mantener últimos 10

    } catch (error: any) {
      setExecutionStatus('error');
      addOutput('');
      addOutput(`[${new Date().toLocaleTimeString()}] ❌ Error: ${error.message}`);

      // Guardar error en historial
      const duration = startTime ? Date.now() - startTime.getTime() : 0;
      const log: ExecutionLog = {
        timestamp: new Date(),
        scriptId: script.id,
        status: 'error',
        output: output.join('\n'),
        duration,
      };
      setExecutionLogs(prev => [log, ...prev].slice(0, 10));
    }
  };

  /**
   * Simular ejecución del script de migración
   * 
   * IMPORTANTE: Este es un simulador para mostrar la UI.
   * En producción, el script real se ejecutaría en el servidor.
   */
  const simulateMigrationScript = async () => {
    // Header
    addOutput('═══════════════════════════════════════════════════════════');
    addOutput('  📦 MIGRACIÓN DE DOCUMENTACIÓN A /src/docs/');
    addOutput('═══════════════════════════════════════════════════════════');
    addOutput('');

    await delay(500);

    // Paso 1: Crear directorio
    addOutput('📁 Creando directorio /src/docs/...');
    await delay(300);
    addOutput('   ✅ Directorio creado');
    addOutput('');

    await delay(500);

    // Paso 2: Escanear archivos
    addOutput('🔍 Escaneando archivos .md en raíz...');
    await delay(500);
    addOutput('   ⏭️  Excluyendo: README.md');
    await delay(200);
    addOutput('   ✅ Encontrados 113 archivos .md');
    addOutput('');

    await delay(500);

    // Paso 3: Migrar archivos (simular algunos)
    addOutput('📦 Iniciando migración de archivos...');
    addOutput('');

    const sampleFiles = [
      'ROADMAP_DOCUMENTATION_CENTER.md',
      'SUCCESS_LOG_DOCUMENTATION_CENTER.md',
      'ERROR_LOG_DOCUMENTATION_CENTER.md',
      'AGENT.md',
      'GRAPH_AND_LINKING_ARCHITECTURE.md',
      'DOCUMENTATION_CENTER_BEST_PRACTICES.md',
      'V82_EXECUTION_STATUS.md',
      'MIGRATION_INSTRUCTIONS.md',
    ];

    for (const file of sampleFiles) {
      addOutput(`   ✅ Copiado: ${file}`);
      await delay(100);
      addOutput(`   🗑️  Eliminado: ${file}`);
      await delay(100);
    }

    addOutput('   ... (105 archivos más)');
    await delay(300);

    addOutput('');
    addOutput('✅ Migración de archivos completada');
    addOutput('');

    await delay(500);

    // Paso 4: Mover guidelines
    addOutput('📁 Moviendo carpeta /guidelines/...');
    await delay(500);
    addOutput('   ✅ Carpeta /guidelines/ movida exitosamente');
    addOutput('');

    await delay(500);

    // Reporte final
    addOutput('═══════════════════════════════════════════════════════════');
    addOutput('  📊 REPORTE DE MIGRACIÓN');
    addOutput('═══════════════════════════════════════════════════════════');
    addOutput('');
    addOutput('  ✅ Archivos encontrados:  113');
    addOutput('  ✅ Archivos copiados:     113');
    addOutput('  ✅ Archivos eliminados:   113');
    addOutput('  ✅ Carpeta guidelines:    MOVIDA');
    addOutput('');
    addOutput('  🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
    addOutput('');
    addOutput('═══════════════════════════════════════════════════════════');

    await delay(500);
  };

  /**
   * Agregar línea al output
   */
  const addOutput = (line: string) => {
    setOutput(prev => [...prev, line]);
  };

  /**
   * Helper para delays
   */
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Limpiar terminal
   */
  const clearTerminal = () => {
    setOutput([]);
    setExecutionStatus('idle');
    setSelectedScript(null);
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
          <Terminal className="w-8 h-8" />
          <h2 className="text-2xl font-black">Script Runner</h2>
        </div>
        <p className="text-purple-100">
          Centro de ejecución de scripts de mantenimiento, migración y utilidades del sistema
        </p>
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
                      Ejecutar
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
              Terminal
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
                  {selectedScript?.filename || 'terminal'}
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
            </div>
          </div>
        </div>
      )}

      {/* Warning Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-yellow-900 dark:text-yellow-200 mb-1">
              Importante: Scripts Simulados
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Por razones de seguridad, los scripts se ejecutan en un entorno simulado en el navegador.
              Para ejecutar scripts reales, utiliza la terminal de tu sistema operativo con los comandos mostrados arriba.
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-2">
              En producción, estos scripts se ejecutarían en el servidor mediante endpoints seguros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
