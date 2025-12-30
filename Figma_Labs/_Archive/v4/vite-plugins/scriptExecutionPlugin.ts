/**
 * VITE PLUGIN: SCRIPT EXECUTION MIDDLEWARE
 * 
 * Permite ejecutar scripts Node.js REALES desde DevTools
 * usando child_process.spawn() y streaming de output con SSE.
 * 
 * Endpoints:
 * - POST /api/execute-script - Ejecutar script
 * - GET /api/script-output/:id - Stream SSE de output
 * 
 * Seguridad:
 * - Solo en modo desarrollo
 * - Lista blanca de scripts permitidos
 * - Validación de entrada
 */

import { spawn } from 'child_process';
import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

interface ExecutionJob {
  id: string;
  scriptName: string;
  process: ReturnType<typeof spawn> | null;
  output: string[];
  status: 'running' | 'success' | 'error';
  exitCode: number | null;
  startTime: Date;
  endTime: Date | null;
}

// Almacenar jobs en memoria
const activeJobs = new Map<string, ExecutionJob>();

/**
 * Lista blanca de scripts permitidos
 */
const ALLOWED_SCRIPTS: Record<string, { command: string; args: string[] }> = {
  'migrate-docs': {
    command: 'node',
    args: ['scripts/migrate-docs-to-src.cjs'],
  },
  // Agregar más scripts aquí en el futuro
};

/**
 * Generar ID único para job
 */
function generateJobId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parsear el body de una request POST
 */
function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Enviar respuesta JSON
 */
function sendJSON(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * Enviar Server-Sent Event
 */
function sendSSE(res: ServerResponse, event: string, data: any) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * Manejar ejecución de script
 */
async function handleExecuteScript(req: IncomingMessage, res: ServerResponse) {
  try {
    const body = await parseBody(req);
    const { scriptId } = body;

    // Validar script
    if (!scriptId || !ALLOWED_SCRIPTS[scriptId]) {
      sendJSON(res, 400, {
        error: 'Invalid or disallowed script',
        allowedScripts: Object.keys(ALLOWED_SCRIPTS),
      });
      return;
    }

    const scriptConfig = ALLOWED_SCRIPTS[scriptId];
    const jobId = generateJobId();

    // Crear job
    const job: ExecutionJob = {
      id: jobId,
      scriptName: scriptId,
      process: null,
      output: [],
      status: 'running',
      exitCode: null,
      startTime: new Date(),
      endTime: null,
    };

    activeJobs.set(jobId, job);

    // Ejecutar script
    console.log(`🚀 Ejecutando script: ${scriptId}`);
    console.log(`   Comando: ${scriptConfig.command} ${scriptConfig.args.join(' ')}`);

    const childProcess = spawn(scriptConfig.command, scriptConfig.args, {
      cwd: process.cwd(),
      env: process.env,
      shell: true,
    });

    job.process = childProcess;

    // Capturar stdout
    childProcess.stdout?.on('data', (data) => {
      const line = data.toString();
      job.output.push(line);
      console.log(`[${jobId}] ${line.trim()}`);
    });

    // Capturar stderr
    childProcess.stderr?.on('data', (data) => {
      const line = data.toString();
      job.output.push(`ERROR: ${line}`);
      console.error(`[${jobId}] ERROR: ${line.trim()}`);
    });

    // Manejar cierre del proceso
    childProcess.on('close', (code) => {
      job.status = code === 0 ? 'success' : 'error';
      job.exitCode = code;
      job.endTime = new Date();
      
      const duration = job.endTime.getTime() - job.startTime.getTime();
      
      console.log(`✅ Script completado: ${scriptId}`);
      console.log(`   Exit code: ${code}`);
      console.log(`   Duración: ${duration}ms`);

      // Limpiar después de 5 minutos
      setTimeout(() => {
        activeJobs.delete(jobId);
      }, 5 * 60 * 1000);
    });

    // Manejar errores del proceso
    childProcess.on('error', (error) => {
      job.status = 'error';
      job.output.push(`PROCESS ERROR: ${error.message}`);
      job.endTime = new Date();
      console.error(`[${jobId}] Process error:`, error);
    });

    // Retornar job ID
    sendJSON(res, 200, {
      jobId,
      scriptId,
      status: 'started',
      message: 'Script execution started',
    });
  } catch (error: any) {
    console.error('Error executing script:', error);
    sendJSON(res, 500, {
      error: 'Internal server error',
      message: error.message,
    });
  }
}

/**
 * Manejar stream de output con SSE
 */
function handleScriptOutput(req: IncomingMessage, res: ServerResponse, jobId: string) {
  const job = activeJobs.get(jobId);

  if (!job) {
    sendJSON(res, 404, {
      error: 'Job not found',
      jobId,
    });
    return;
  }

  // Configurar SSE headers
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Enviar output acumulado hasta ahora
  sendSSE(res, 'start', {
    jobId: job.id,
    scriptName: job.scriptName,
    startTime: job.startTime,
  });

  job.output.forEach((line) => {
    sendSSE(res, 'output', { line });
  });

  // Si el job ya terminó, enviar evento final y cerrar
  if (job.status !== 'running') {
    sendSSE(res, 'end', {
      status: job.status,
      exitCode: job.exitCode,
      endTime: job.endTime,
      duration: job.endTime ? job.endTime.getTime() - job.startTime.getTime() : 0,
    });
    res.end();
    return;
  }

  // Para jobs en ejecución, seguir enviando output en tiempo real
  let lastOutputIndex = job.output.length;

  const interval = setInterval(() => {
    // Enviar nuevo output
    if (job.output.length > lastOutputIndex) {
      for (let i = lastOutputIndex; i < job.output.length; i++) {
        sendSSE(res, 'output', { line: job.output[i] });
      }
      lastOutputIndex = job.output.length;
    }

    // Si el job terminó, enviar evento final y cerrar
    if (job.status !== 'running') {
      sendSSE(res, 'end', {
        status: job.status,
        exitCode: job.exitCode,
        endTime: job.endTime,
        duration: job.endTime ? job.endTime.getTime() - job.startTime.getTime() : 0,
      });
      clearInterval(interval);
      res.end();
    }
  }, 100); // Poll cada 100ms

  // Limpiar si el cliente se desconecta
  req.on('close', () => {
    clearInterval(interval);
  });
}

/**
 * Plugin de Vite para ejecución de scripts
 */
export function scriptExecutionPlugin(): Plugin {
  return {
    name: 'vite-plugin-script-execution',
    
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        // POST /api/execute-script
        if (req.method === 'POST' && url === '/api/execute-script') {
          handleExecuteScript(req, res);
          return;
        }

        // GET /api/script-output/:jobId
        if (req.method === 'GET' && url.startsWith('/api/script-output/')) {
          const jobId = url.replace('/api/script-output/', '').split('?')[0];
          handleScriptOutput(req, res, jobId);
          return;
        }

        // GET /api/active-jobs
        if (req.method === 'GET' && url === '/api/active-jobs') {
          const jobs = Array.from(activeJobs.values()).map(job => ({
            id: job.id,
            scriptName: job.scriptName,
            status: job.status,
            startTime: job.startTime,
            endTime: job.endTime,
            outputLines: job.output.length,
          }));
          
          sendJSON(res, 200, { jobs });
          return;
        }

        next();
      });

      console.log('✅ Script Execution Plugin iniciado');
      console.log('   Endpoints disponibles:');
      console.log('   - POST /api/execute-script');
      console.log('   - GET /api/script-output/:jobId');
      console.log('   - GET /api/active-jobs');
      console.log('   Scripts permitidos:', Object.keys(ALLOWED_SCRIPTS));
    },
  };
}
