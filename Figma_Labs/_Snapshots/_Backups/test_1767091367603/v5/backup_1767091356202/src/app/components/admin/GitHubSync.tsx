import { useState, useEffect } from 'react';
import { Github, Download, FileText, Check, AlertCircle, RefreshCw, FolderOpen, Database, Lock, Unlock, Globe, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  download_url: string;
  type: 'file' | 'dir';
}

interface SupabaseFile {
  filename: string;
  filepath: string;
  content: string;
  sha: string | null;
  size: number | null;
  download_url: string | null;
}

export function GitHubSync() {
  const [token, setToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('https://github.com/aprendeineamx-max/Unsitiodesdefigma');
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingToSupabase, setSyncingToSupabase] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, file: '' });
  const [showToken, setShowToken] = useState(false);
  const [supabaseFilesCount, setSupabaseFilesCount] = useState<{total: number, pending: number, written: number}>({ total: 0, pending: 0, written: 0 });
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  // Load token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('github_pat');
    if (savedToken) setToken(savedToken);
    
    // Load stats on mount
    loadSupabaseStats();
    
    // Test Supabase connection on mount
    testSupabaseConnection();
  }, []);
  
  const testSupabaseConnection = async () => {
    try {
      console.log('🔍 Testing Supabase connection...');
      const { data, error } = await supabase
        .from('github_sync_cache')
        .select('count');
      
      if (error) {
        console.error('❌ Supabase connection test failed:', error);
        toast.error(`⚠️ Problema de conexión con Supabase: ${error.message}`);
      } else {
        console.log('✅ Supabase connection OK');
      }
    } catch (err: any) {
      console.error('❌ Supabase connection error:', err);
      toast.error(`⚠️ Error al conectar con Supabase: ${err.message}`);
    }
  };

  const saveToken = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('github_pat', newToken);
    toast.success('Token guardado localmente');
  };

  const loadSupabaseStats = async () => {
    setLoadingStats(true);
    try {
      // Count total files
      const { count: totalCount, error: totalError } = await supabase
        .from('github_sync_cache')
        .select('*', { count: 'exact', head: true });

      // Count pending files
      const { count: pendingCount, error: pendingError } = await supabase
        .from('github_sync_cache')
        .select('*', { count: 'exact', head: true })
        .eq('written_to_disk', false);

      // Count written files  
      const { count: writtenCount, error: writtenError } = await supabase
        .from('github_sync_cache')
        .select('*', { count: 'exact', head: true })
        .eq('written_to_disk', true);

      if (totalError || pendingError || writtenError) {
        console.error('Error loading stats:', { totalError, pendingError, writtenError });
      } else {
        setSupabaseFilesCount({
          total: totalCount || 0,
          pending: pendingCount || 0,
          written: writtenCount || 0
        });
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchFiles = async () => {
    if (!token) {
      toast.error('Por favor ingresa un Token de GitHub');
      return;
    }

    setLoading(true);
    try {
      // Parse repo URL
      const urlParts = repoUrl.replace('https://github.com/', '').split('/');
      const owner = urlParts[0];
      const repo = urlParts[1];
      const path = 'src/docs'; // Target directory

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filter for markdown files
      const mdFiles = Array.isArray(data) 
        ? data.filter((item: GitHubFile) => item.name.endsWith('.md'))
        : [];
      
      setFiles(mdFiles);
      toast.success(`✅ ${mdFiles.length} archivos encontrados en /src/docs`);
    } catch (error: any) {
      toast.error(`❌ Error al listar archivos: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const syncFilesToSupabase = async () => {
    if (files.length === 0) {
      toast.error('❌ No hay archivos para sincronizar. Lista los archivos primero.');
      return;
    }

    setSyncingToSupabase(true);
    setProgress({ current: 0, total: files.length, file: '' });

    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({ current: i + 1, total: files.length, file: file.name });
        
        try {
          // Fetch raw content
          const response = await fetch(file.download_url, {
            headers: {
              'Authorization': `token ${token}`
            }
          });
          
          if (!response.ok) throw new Error(`Failed to download ${file.name}`);
          
          const content = await response.text();
          
          // Prepare data for Supabase
          const supabaseFile: SupabaseFile = {
            filename: file.name,
            filepath: `src/docs/${file.name}`,
            content: content,
            sha: file.sha,
            size: file.size,
            download_url: file.download_url
          };

          console.log(`📤 Insertando ${file.name} en Supabase...`, {
            filename: supabaseFile.filename,
            filepath: supabaseFile.filepath,
            contentLength: supabaseFile.content.length,
            sha: supabaseFile.sha
          });

          // Insert or update in Supabase
          const { data, error } = await supabase
            .from('github_sync_cache')
            .upsert(supabaseFile, { 
              onConflict: 'filepath',
              ignoreDuplicates: false 
            })
            .select();

          if (error) {
            console.error(`❌ Error inserting ${file.name}:`, error);
            toast.error(`Error: ${file.name} - ${error.message}`);
            errorCount++;
            setErrorLogs(prev => [...prev, `Error inserting ${file.name}: ${error.message} (${error.code})`]);
          } else {
            console.log(`✅ ${file.name} insertado exitosamente`, data);
            successCount++;
          }

          // Small delay to prevent rate limiting
          await new Promise(r => setTimeout(r, 50));

        } catch (fileError: any) {
          console.error(`Error processing ${file.name}:`, fileError);
          errorCount++;
          errorLogs.push(`Error processing ${file.name}: ${fileError.message}`);
        }
      }

      // Show final toast
      if (errorCount === 0) {
        toast.success(`✅ Sincronización completada: ${successCount}/${files.length} archivos guardados en Supabase`);
      } else {
        toast.warning(`⚠️ Sincronización parcial: ${successCount} exitosos, ${errorCount} con errores`);
      }

      // Reload stats
      await loadSupabaseStats();
      
    } catch (error: any) {
      toast.error(`❌ Error durante la sincronización: ${error.message}`);
    } finally {
      setSyncingToSupabase(false);
    }
  };

  const notifyAgent = () => {
    const message = `
🤖 **NOTIFICACIÓN AL AGENTE**

✅ Archivos listos en Supabase para escritura

**Estadísticas:**
- Total de archivos: ${supabaseFilesCount.total}
- Archivos pendientes de escritura: ${supabaseFilesCount.pending}
- Archivos ya escritos: ${supabaseFilesCount.written}

**Próximo paso:**
El agente debe ejecutar el proceso de lectura desde Supabase y escritura a /src/docs/

**Query SQL para el agente:**
\`\`\`sql
SELECT * FROM github_sync_cache WHERE written_to_disk = false ORDER BY synced_at DESC;
\`\`\`

**Acción requerida:**
Por favor, agente, lee los archivos de la tabla \`github_sync_cache\` y escríbelos a \`/src/docs/\` usando write_tool.
    `.trim();

    // Copy to clipboard
    navigator.clipboard.writeText(message);
    toast.success('📋 Mensaje copiado al portapapeles. Pégalo en el chat para notificar al agente.');
  };

  const downloadZip = () => {
    window.open(`${repoUrl}/archive/refs/heads/main.zip`, '_blank');
    toast.success('📦 Descargando ZIP del repositorio...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 p-6 rounded-2xl border border-indigo-700 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Github className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">GitHub ➜ Supabase Bridge</h2>
            <p className="text-indigo-200">Sincroniza documentación desde GitHub hacia Supabase para que el agente la escriba</p>
          </div>
        </div>
      </div>

      {/* Supabase Stats Card */}
      <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 p-6 rounded-2xl border border-emerald-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            Estado de Supabase
          </h3>
          <button
            onClick={loadSupabaseStats}
            disabled={loadingStats}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
            <div className="text-3xl font-bold text-white mb-1">{supabaseFilesCount.total}</div>
            <div className="text-sm text-slate-300">Archivos en cache</div>
          </div>

          <div className="bg-yellow-900/30 p-4 rounded-xl border border-yellow-700/50">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{supabaseFilesCount.pending}</div>
            <div className="text-sm text-yellow-200">Pendientes de escritura</div>
          </div>

          <div className="bg-emerald-900/30 p-4 rounded-xl border border-emerald-700/50">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{supabaseFilesCount.written}</div>
            <div className="text-sm text-emerald-200">Ya escritos a disco</div>
          </div>
        </div>

        {supabaseFilesCount.pending > 0 && (
          <button
            onClick={notifyAgent}
            className="w-full mt-4 flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all shadow-lg"
          >
            <Zap className="w-5 h-5" />
            Notificar al Agente ({supabaseFilesCount.pending} archivos listos)
          </button>
        )}
      </div>

      {/* Configuration */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-400" />
          Configuración de Acceso
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Repositorio URL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              GitHub Personal Access Token
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => saveToken(e.target.value)}
                placeholder="ghp_..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-4 pr-12 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white transition-colors"
              >
                {showToken ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              El token se guarda localmente en tu navegador. Se requiere permiso 'repo'.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={fetchFiles}
          disabled={loading || syncingToSupabase}
          className="flex items-center justify-center gap-2 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/25"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <FolderOpen className="w-5 h-5" />
          )}
          {loading ? 'Listando...' : '1️⃣ Listar Archivos de GitHub'}
        </button>

        <button
          onClick={syncFilesToSupabase}
          disabled={files.length === 0 || syncingToSupabase}
          className="flex items-center justify-center gap-2 p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/25"
        >
          {syncingToSupabase ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Database className="w-5 h-5" />
          )}
          {syncingToSupabase ? 'Sincronizando...' : '2️⃣ Sincronizar a Supabase'}
        </button>
      </div>

      {/* Progress */}
      {syncingToSupabase && (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 animate-pulse">
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span>📥 Descargando y guardando {progress.file}...</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Archivos Detectados ({files.length})
            </h3>
            <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-1 rounded-md">
              src/docs/
            </span>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {files.map((file) => (
              <div key={file.path} className="flex items-center justify-between p-3 hover:bg-slate-800 rounded-lg transition-colors group">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                  <span className="text-slate-300 text-sm font-mono">{file.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                  <a 
                    href={file.html_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-2xl p-6">
          <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Flujo de Trabajo
          </h4>
          <ol className="text-sm text-blue-200/80 space-y-2 list-decimal list-inside">
            <li>Lista archivos de GitHub (botón 1️⃣)</li>
            <li>Sincroniza a Supabase (botón 2️⃣)</li>
            <li>Notifica al agente (botón morado)</li>
            <li>El agente lee de Supabase y escribe a /src/docs/</li>
          </ol>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-2xl p-6">
          <h4 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Alternativa Manual
          </h4>
          <p className="text-sm text-yellow-200/80 mb-4">
            Si prefieres trabajar localmente con Git:
          </p>
          <button 
            onClick={downloadZip}
            className="text-sm text-yellow-400 hover:text-yellow-300 underline font-medium"
          >
            📦 Descargar repositorio como ZIP
          </button>
        </div>
      </div>

      {/* Error Details */}
      {errorLogs.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-2xl p-6">
          <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Detalles de Errores
          </h4>
          <button
            onClick={() => setShowErrorDetails(!showErrorDetails)}
            className="text-sm text-red-400 hover:text-red-300 underline font-medium"
          >
            {showErrorDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
          </button>
          {showErrorDetails && (
            <ul className="text-sm text-red-200/80 space-y-2 list-disc list-inside mt-2">
              {errorLogs.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}