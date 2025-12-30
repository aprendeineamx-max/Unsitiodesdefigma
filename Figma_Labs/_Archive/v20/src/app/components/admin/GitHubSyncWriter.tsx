import { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

interface FileToWrite {
  filename: string;
  filepath: string;
  content: string;
}

export function GitHubSyncWriter() {
  const [files, setFiles] = useState<FileToWrite[]>([]);
  const [loading, setLoading] = useState(false);
  const [writing, setWriting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{success: number; failed: number; errors: string[]}>({
    success: 0,
    failed: 0,
    errors: []
  });

  const loadPendingFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('github_sync_cache')
        .select('filename, filepath, content')
        .eq('written_to_disk', false)
        .order('filepath');

      if (error) throw error;

      setFiles(data || []);
      toast.success(`📁 ${data?.length || 0} archivos pendientes de escritura`);
    } catch (err: any) {
      toast.error(`❌ Error al cargar archivos: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingFiles();
  }, []);

  const writeFilesToDisk = async () => {
    if (files.length === 0) {
      toast.error('No hay archivos para escribir');
      return;
    }

    setWriting(true);
    setProgress({ current: 0, total: files.length });
    
    const successPaths: string[] = [];
    const errors: string[] = [];
    
    try {
      // Esta función muestra la data para que el AGENTE la copie y escriba
      console.log('🚀 DATOS PARA EL AGENTE:');
      console.log('Total de archivos:', files.length);
      console.log('JSON completo a continuación:');
      console.log(JSON.stringify(files, null, 2));

      toast.info(`📋 Datos exportados a consola. Copia el JSON y úsalo con el agente.`, {
        duration: 10000
      });

      // Generar el código de write_tool que el agente debe ejecutar
      let writeToolCode = '// CÓDIGO PARA EL AGENTE - Ejecutar en batches de 20\n\n';
      
      const batchSize = 20;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        writeToolCode += `// BATCH ${Math.floor(i / batchSize) + 1} (archivos ${i + 1}-${Math.min(i + batchSize, files.length)})\n`;
        writeToolCode += '<function_calls>\n';
        
        batch.forEach(file => {
          writeToolCode += `  <invoke name="write_tool">\n`;
          writeToolCode += `    <parameter name="path">${file.filepath}</parameter>\n`;
          writeToolCode += `    <parameter name="file_text">${file.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</parameter>\n`;
          writeToolCode += `  </invoke>\n`;
        });
        
        writeToolCode += '</function_calls>\n\n';
      }

      console.log(writeToolCode);
      
      toast.success('✅ Código generado. Revisa la consola del navegador.', {
        duration: 15000
      });

      // Mostrar en UI para copiar
      const blob = new Blob([writeToolCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'agent_write_code.txt';
      a.click();
      URL.revokeObjectURL(url);

      toast.success('📥 Archivo descargado: agent_write_code.txt');

    } catch (err: any) {
      toast.error(`❌ Error: ${err.message}`);
      console.error(err);
    } finally {
      setWriting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 p-6 rounded-2xl border border-purple-700 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Download className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Supabase ➜ Filesystem Writer</h2>
            <p className="text-purple-200">Lee archivos de Supabase y genera código para que el agente los escriba</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="text-3xl font-bold text-white mb-1">{files.length}</div>
          <div className="text-sm text-slate-300">Archivos pendientes</div>
        </div>

        <div className="bg-emerald-900/30 p-6 rounded-xl border border-emerald-700/50">
          <div className="text-3xl font-bold text-emerald-400 mb-1">{results.success}</div>
          <div className="text-sm text-emerald-200">Código generado</div>
        </div>

        <div className="bg-red-900/30 p-6 rounded-xl border border-red-700/50">
          <div className="text-3xl font-bold text-red-400 mb-1">{results.failed}</div>
          <div className="text-sm text-red-200">Errores</div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={loadPendingFiles}
          disabled={loading}
          className="flex items-center justify-center gap-2 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          {loading ? 'Cargando...' : 'Recargar desde Supabase'}
        </button>

        <button
          onClick={writeFilesToDisk}
          disabled={files.length === 0 || writing}
          className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg"
        >
          {writing ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Zap className="w-5 h-5" />
          )}
          {writing ? 'Generando...' : 'Generar Código para Agente'}
        </button>
      </div>

      {/* Progress */}
      {writing && (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span>Generando código...</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Archivos Pendientes ({files.length})
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-800 rounded-lg transition-colors group">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-500 group-hover:text-purple-400" />
                  <span className="text-slate-300 text-sm font-mono">{file.filename}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">{(file.content.length / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-2xl p-6">
        <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Instrucciones para el Agente
        </h4>
        <ol className="text-sm text-blue-200/80 space-y-2 list-decimal list-inside">
          <li>Haz click en "Generar Código para Agente"</li>
          <li>Se descargará un archivo `agent_write_code.txt`</li>
          <li>Abre la consola del navegador (F12)</li>
          <li>Copia el código XML que se muestra</li>
          <li>El agente debe ejecutar ese código en batches de 20 archivos</li>
          <li>Cada batch escribirá 20 archivos en paralelo a /src/docs/</li>
        </ol>
      </div>

      {/* Errors */}
      {results.errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-2xl p-6">
          <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Errores ({results.errors.length})
          </h4>
          <ul className="text-sm text-red-200/80 space-y-1 list-disc list-inside">
            {results.errors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
