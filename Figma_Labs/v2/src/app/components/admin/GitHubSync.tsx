import { useState, useEffect } from 'react';
import { Github, Download, FileText, Check, AlertCircle, RefreshCw, FolderOpen, Database, Lock, Unlock, Globe } from 'lucide-react';
import { toast } from 'sonner';

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

export function GitHubSync() {
  const [token, setToken] = useState('');
  const [repoUrl, setRepoUrl] = useState('https://github.com/aprendeineamx-max/Unsitiodesdefigma');
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, file: '' });
  const [showToken, setShowToken] = useState(false);
  const [syncMode, setSyncMode] = useState<'memory' | 'download'>('memory');

  // Load token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('github_pat');
    if (savedToken) setToken(savedToken);
  }, []);

  const saveToken = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('github_pat', newToken);
    toast.success('Token guardado localmente');
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
      toast.success(`${mdFiles.length} archivos encontrados en /src/docs`);
    } catch (error: any) {
      toast.error(`Error al listar archivos: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const syncFiles = async () => {
    if (files.length === 0) {
      toast.error('No hay archivos para sincronizar. Lista los archivos primero.');
      return;
    }

    setSyncing(true);
    setProgress({ current: 0, total: files.length, file: '' });

    try {
      const syncedDocs: any[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({ current: i + 1, total: files.length, file: file.name });
        
        // Fetch raw content
        const response = await fetch(file.download_url, {
            headers: {
                'Authorization': `token ${token}` // Use token for raw fetch too to avoid rate limits
            }
        });
        
        if (!response.ok) throw new Error(`Failed to download ${file.name}`);
        
        const content = await response.text();
        
        // Store in memory / localStorage for now
        // This simulates the sync. In a real environment with backend, we would POST this.
        // For this demo, we'll store in localStorage to be used by a custom provider if we build one.
        syncedDocs.push({
            filename: file.name,
            content: content,
            path: file.path,
            lastSynced: new Date().toISOString()
        });

        // Artificial delay for UI feel and to prevent rate limiting
        await new Promise(r => setTimeout(r, 100));
      }

      // Save to localStorage as a cache
      try {
        localStorage.setItem('docs_cache', JSON.stringify(syncedDocs));
        toast.success(`Sincronización completada: ${files.length} archivos`);
      } catch (e) {
        toast.warning(`Sincronización completada pero localStorage lleno. ${files.length} archivos descargados en memoria.`);
      }

      // If we had a backend API to write files:
      // await fetch('/api/sync-docs', { method: 'POST', body: JSON.stringify(syncedDocs) });
      
    } catch (error: any) {
      toast.error(`Error durante la sincronización: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const downloadZip = () => {
    window.open(`${repoUrl}/archive/refs/heads/main.zip`, '_blank');
    toast.success('Descargando ZIP del repositorio...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Github className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">GitHub Sync Tool</h2>
            <p className="text-gray-400">Sincroniza documentación desde GitHub directamente al entorno</p>
          </div>
        </div>
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
                El token se guarda localmente en tu navegador. Se requiere permiso 'repo' para repositorios privados.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={fetchFiles}
          disabled={loading || syncing}
          className="flex items-center justify-center gap-2 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/25"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <FolderOpen className="w-5 h-5" />
          )}
          {loading ? 'Listando...' : '1. Listar Archivos'}
        </button>

        <button
          onClick={syncFiles}
          disabled={files.length === 0 || syncing}
          className="flex items-center justify-center gap-2 p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/25"
        >
          {syncing ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {syncing ? 'Sincronizando...' : '2. Descargar Contenido'}
        </button>
      </div>

      {/* Progress */}
      {syncing && (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 animate-pulse">
            <div className="flex justify-between text-sm text-slate-300 mb-2">
                <span>Descargando {progress.file}...</span>
                <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
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
      
      {/* Manual Sync Instructions */}
      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-2xl p-6">
        <h4 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Nota Importante sobre Persistencia
        </h4>
        <p className="text-sm text-yellow-200/80 mb-4">
            Debido a las restricciones de seguridad del navegador, esta herramienta descarga los archivos a la memoria de la aplicación (o localStorage).
            Para actualizar permanentemente el código fuente (/src/docs), debes usar un entorno de desarrollo local con acceso al sistema de archivos.
        </p>
        <button 
            onClick={downloadZip}
            className="text-sm text-yellow-400 hover:text-yellow-300 underline font-medium"
        >
            Descargar todo el repositorio como ZIP
        </button>
      </div>
    </div>
  );
}

function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    )
}
