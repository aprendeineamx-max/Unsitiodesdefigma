import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Upload, Github, Download, Database, FileText, CheckCircle2, AlertCircle, RefreshCw, Trash2, FolderOpen, Link, CloudUpload } from 'lucide-react';
import { toast } from 'sonner';
import { supabaseAdmin } from '../../../lib/supabase';

type FileSource = 'local' | 'storage' | 'github' | 'url';

interface UploadedFile {
  name: string;
  size: number;
  source: FileSource;
  path: string;
  url?: string;
}

export function FileManager() {
  const [activeTab, setActiveTab] = useState<'upload' | 'github' | 'url' | 'storage'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState('aprendeineamx-max/Unsitiodesdefigma');
  const [githubPath, setGithubPath] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [targetFolder, setTargetFolder] = useState('docs');
  const [storageFiles, setStorageFiles] = useState<any[]>([]);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [pushToGitHubEnabled, setPushToGitHubEnabled] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GitHub Configuration
  const GITHUB_CONFIG = {
    owner: 'aprendeineamx-max',
    repo: 'Unsitiodesdefigma',
    token: 'ghp_qlWHUM9o1rsVWaT1V23TdBiK',
    branch: 'main'
  };

  // ==============================================
  // UTILITY: SANITIZE FILENAMES FOR SUPABASE
  // ==============================================
  
  /**
   * Sanitiza nombres de archivos para Supabase Storage
   * 
   * Supabase Storage rechaza archivos con:
   * - Espacios
   * - Acentos (á, é, í, ó, ú, ñ)
   * - Caracteres especiales
   * 
   * Esta función convierte:
   * "RoadMap - Gestión de Cursos (1).md" → "RoadMap_Gestion_de_Cursos_1.md"
   * 
   * @param filename - Nombre original del archivo
   * @returns Nombre sanitizado seguro para Supabase
   */
  const sanitizeFilename = (filename: string): string => {
    // Separar nombre y extensión
    const lastDotIndex = filename.lastIndexOf('.');
    const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
    const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';
    
    // Sanitizar el nombre
    const sanitizedName = name
      .normalize('NFD') // Descomponer caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Reemplazar espacios y especiales con _
      .replace(/_+/g, '_') // Colapsar múltiples _ en uno solo
      .replace(/^_|_$/g, ''); // Quitar _ al inicio/final
    
    // Sanitizar extensión (quitar espacios)
    const sanitizedExtension = extension.replace(/\s+/g, '');
    
    return sanitizedName + sanitizedExtension;
  };

  // ==============================================
  // UTILITY: PUSH TO GITHUB REPOSITORY
  // ==============================================
  
  /**
   * Pushea un archivo a GitHub Repository
   * 
   * Crea o actualiza un archivo en /src/docs/ del repositorio
   * usando GitHub Contents API
   * 
   * @param filename - Nombre del archivo
   * @param content - Contenido del archivo (texto)
   * @returns Promise con resultado del push
   */
  const pushToGitHub = async (filename: string, content: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { owner, repo, token } = GITHUB_CONFIG;
      const path = `src/docs/${filename}`;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

      // Step 1: Verificar si el archivo ya existe (para obtener SHA)
      let sha: string | undefined;
      try {
        const checkResponse = await fetch(apiUrl, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (checkResponse.ok) {
          const existingFile = await checkResponse.json();
          sha = existingFile.sha;
          console.log(`📝 Archivo ${filename} ya existe en GitHub (SHA: ${sha})`);
        }
      } catch (err) {
        // Archivo no existe, está OK
        console.log(`📄 Archivo ${filename} es nuevo en GitHub`);
      }

      // Step 2: Codificar contenido en base64
      const base64Content = btoa(unescape(encodeURIComponent(content)));

      // Step 3: Crear/Actualizar archivo
      const commitMessage = sha 
        ? `📝 Update ${filename} via FileManager`
        : `📄 Add ${filename} via FileManager`;

      const body: any = {
        message: commitMessage,
        content: base64Content,
        branch: GITHUB_CONFIG.branch
      };

      // Si el archivo existe, incluir SHA para actualizar
      if (sha) {
        body.sha = sha;
      }

      const pushResponse = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!pushResponse.ok) {
        const errorData = await pushResponse.json();
        throw new Error(errorData.message || `HTTP ${pushResponse.status}`);
      }

      const result = await pushResponse.json();
      console.log(`✅ GitHub push exitoso:`, result);

      return { success: true };

    } catch (err: any) {
      console.error(`❌ Error pushing to GitHub:`, err);
      return { success: false, error: err.message };
    }
  };

  // ==============================================
  // HERRAMIENTA 1: UPLOAD LOCAL FILES
  // ==============================================
  
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploaded: UploadedFile[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const originalFilename = file.name;
        const sanitizedFilename = sanitizeFilename(originalFilename);
        const filePath = `${targetFolder}/${sanitizedFilename}`;

        // Mostrar advertencia si el nombre cambió
        if (originalFilename !== sanitizedFilename) {
          toast.info(`🔄 \"${originalFilename}\" → \"${sanitizedFilename}\"`);
        }

        toast.info(`📤 Subiendo ${sanitizedFilename}...`);

        // Step 1: Upload a Supabase Storage
        const { data, error } = await supabaseAdmin.storage
          .from('documentation')
          .upload(filePath, file, {
            contentType: file.type || 'text/plain',
            upsert: true // Sobrescribir si existe
          });

        if (error) {
          console.error(`Error uploading ${sanitizedFilename}:`, error);
          toast.error(`❌ Error: ${sanitizedFilename} - ${error.message}`);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('documentation')
          .getPublicUrl(filePath);

        // Guardar en manifest con nombre sanitizado
        await supabaseAdmin.from('document_manifest').upsert({
          filename: sanitizedFilename, // Nombre sanitizado
          filepath: `/${targetFolder}/${sanitizedFilename}`,
          source: 'user_upload',
          storage_path: filePath,
          size_bytes: file.size,
          updated_at: new Date().toISOString()
        });

        // Step 2: Push to GitHub (si está habilitado)
        if (pushToGitHubEnabled && (file.type === 'text/markdown' || file.name.endsWith('.md'))) {
          toast.info(`🔄 Pusheando ${sanitizedFilename} a GitHub...`);
          
          // Leer contenido del archivo
          const fileContent = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
          });

          // Push a GitHub
          const githubResult = await pushToGitHub(sanitizedFilename, fileContent);
          
          if (githubResult.success) {
            toast.success(`✅ ${sanitizedFilename} pusheado a GitHub`);
          } else {
            toast.error(`⚠️ Error en GitHub: ${githubResult.error}`, { duration: 5000 });
            console.error('GitHub push error:', githubResult.error);
          }
        }

        uploaded.push({
          name: sanitizedFilename, // Mostrar nombre sanitizado
          size: file.size,
          source: 'local',
          path: filePath,
          url: urlData.publicUrl
        });

        // Toast final según si se pusheó o no a GitHub
        if (pushToGitHubEnabled && (file.type === 'text/markdown' || file.name.endsWith('.md'))) {
          toast.success(`✅ ${sanitizedFilename} → Storage + GitHub`);
        } else {
          toast.success(`✅ ${sanitizedFilename} → Storage`);
        }
      }

      setUploadedFiles(prev => [...prev, ...uploaded]);
      
      // Toast final de resumen
      if (pushToGitHubEnabled) {
        toast.success(`🎉 ${uploaded.length} archivos subidos a Storage + GitHub`);
      } else {
        toast.success(`🎉 ${uploaded.length} archivos subidos a Storage`);
      }

    } catch (err: any) {
      toast.error(`❌ Error: ${err.message}`);
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // ==============================================
  // HERRAMIENTA 2: SYNC FROM GITHUB
  // ==============================================

  const syncFromGitHub = async () => {
    if (!githubToken) {
      toast.error('❌ GitHub token es requerido');
      return;
    }

    setUploading(true);
    setSyncProgress({ current: 0, total: 0 });

    try {
      const [owner, repo] = githubRepo.split('/');
      const path = githubPath || '';

      // 1. Listar archivos en GitHub
      toast.info('📡 Conectando a GitHub...');
      const listUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      const listResponse = await fetch(listUrl, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!listResponse.ok) {
        throw new Error(`GitHub API error: ${listResponse.status}`);
      }

      const files = await listResponse.json();
      
      if (!Array.isArray(files)) {
        throw new Error('Path no es un directorio');
      }

      // Filtrar solo .md files
      const mdFiles = files.filter((f: any) => 
        f.type === 'file' && f.name.endsWith('.md')
      );

      toast.success(`📁 Encontrados ${mdFiles.length} archivos .md`);
      setSyncProgress({ current: 0, total: mdFiles.length });

      // 2. Descargar y subir cada archivo
      for (let i = 0; i < mdFiles.length; i++) {
        const file = mdFiles[i];
        setSyncProgress({ current: i + 1, total: mdFiles.length });
        toast.info(`📥 Sincronizando ${file.name} (${i + 1}/${mdFiles.length})`);

        // Descargar de GitHub
        const contentResponse = await fetch(file.url, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        const fileData = await contentResponse.json();
        const content = atob(fileData.content.replace(/\n/g, ''));

        // Crear Blob
        const blob = new Blob([content], { type: 'text/markdown' });

        // Upload a Supabase Storage
        const storagePath = `${targetFolder}/${file.name}`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from('documentation')
          .upload(storagePath, blob, {
            contentType: 'text/markdown',
            upsert: true
          });

        if (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          continue;
        }

        // Actualizar manifest
        await supabaseAdmin.from('document_manifest').upsert({
          filename: file.name,
          filepath: `/${targetFolder}/${file.name}`,
          source: 'github',
          storage_path: storagePath,
          github_path: file.path,
          github_sha: file.sha,
          size_bytes: file.size,
          updated_at: new Date().toISOString()
        });
      }

      toast.success(`✅ ${mdFiles.length} archivos sincronizados desde GitHub`);
      await loadStorageFiles();

    } catch (err: any) {
      toast.error(`❌ Error: ${err.message}`);
      console.error(err);
    } finally {
      setUploading(false);
      setSyncProgress({ current: 0, total: 0 });
    }
  };

  // ==============================================
  // HERRAMIENTA 3: DOWNLOAD FROM URL
  // ==============================================

  const downloadFromUrl = async () => {
    if (!downloadUrl) {
      toast.error('❌ URL es requerida');
      return;
    }

    setUploading(true);

    try {
      toast.info('📡 Descargando archivo...');

      // Descargar archivo
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      
      // Extraer filename de URL
      const urlParts = downloadUrl.split('/');
      const filename = urlParts[urlParts.length - 1] || 'downloaded-file.md';

      // Crear Blob
      const blob = new Blob([content], { type: 'text/markdown' });

      // Upload a Supabase Storage
      const storagePath = `${targetFolder}/${filename}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('documentation')
        .upload(storagePath, blob, {
          contentType: 'text/markdown',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Actualizar manifest
      await supabaseAdmin.from('document_manifest').upsert({
        filename,
        filepath: `/${targetFolder}/${filename}`,
        source: 'url',
        storage_path: storagePath,
        size_bytes: content.length,
        updated_at: new Date().toISOString()
      });

      toast.success(`✅ ${filename} descargado y guardado`);
      setDownloadUrl('');
      await loadStorageFiles();

    } catch (err: any) {
      toast.error(`❌ Error: ${err.message}`);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // ==============================================
  // HERRAMIENTA 4: SUPABASE STORAGE SYNC
  // ==============================================

  const loadStorageFiles = async () => {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from('documentation')
        .list(targetFolder, {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) throw error;

      setStorageFiles(data || []);
    } catch (err: any) {
      console.error('Error loading storage files:', err);
      toast.error(`❌ Error cargando archivos: ${err.message}`);
    }
  };

  const deleteStorageFile = async (filename: string) => {
    if (!confirm(`¿Eliminar ${filename}?`)) return;

    try {
      const filePath = `${targetFolder}/${filename}`;

      // Delete from storage
      const { error } = await supabaseAdmin.storage
        .from('documentation')
        .remove([filePath]);

      if (error) throw error;

      // Delete from manifest
      await supabaseAdmin
        .from('document_manifest')
        .delete()
        .eq('storage_path', filePath);

      toast.success(`✅ ${filename} eliminado`);
      await loadStorageFiles();

    } catch (err: any) {
      toast.error(`❌ Error: ${err.message}`);
      console.error(err);
    }
  };

  const downloadStorageFile = async (filename: string) => {
    try {
      const filePath = `${targetFolder}/${filename}`;
      
      const { data, error } = await supabaseAdmin.storage
        .from('documentation')
        .download(filePath);

      if (error) throw error;

      // Trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`✅ ${filename} descargado`);

    } catch (err: any) {
      toast.error(`❌ Error: ${err.message}`);
      console.error(err);
    }
  };

  const createStorageBucket = async () => {
    try {
      toast.info('🔨 Creando bucket documentation...');

      // Intentar crear bucket (esto fallará si ya existe, pero es OK)
      const { error } = await supabaseAdmin.storage.createBucket('documentation', {
        public: true,
        fileSizeLimit: 52428800 // 50 MB
      });

      if (error && !error.message.includes('already exists')) {
        throw error;
      }

      toast.success('✅ Bucket documentation listo');

    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        toast.success('✅ Bucket documentation ya existe');
      } else {
        toast.error(`❌ Error: ${err.message}`);
        console.error(err);
      }
    }
  };

  // Load storage files on mount
  useEffect(() => {
    loadStorageFiles();
    createStorageBucket();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 p-6 rounded-2xl border border-blue-700 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <FolderOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">📁 File Manager</h2>
            <p className="text-blue-200">Gestión de archivos sin intervención del agente</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
        {[
          { id: 'upload' as const, label: '📤 Upload Local', icon: Upload },
          { id: 'github' as const, label: '🔄 GitHub Sync', icon: Github },
          { id: 'url' as const, label: '📥 From URL', icon: Link },
          { id: 'storage' as const, label: '🗄️ Storage Manager', icon: Database }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Target Folder Selector */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          📂 Carpeta de destino:
        </label>
        <select
          value={targetFolder}
          onChange={(e) => setTargetFolder(e.target.value)}
          className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
        >
          <option value="docs">docs/</option>
          <option value="assets">assets/</option>
          <option value="guides">guides/</option>
          <option value="tutorials">tutorials/</option>
          <option value="api-docs">api-docs/</option>
        </select>
      </div>

      {/* TAB 1: UPLOAD LOCAL FILES */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-2xl p-6">
            <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
              <CloudUpload className="w-5 h-5" />
              Subir Archivos Locales
            </h3>
            <p className="text-sm text-blue-200/80 mb-4">
              Selecciona archivos de tu computadora y súbelos a Supabase Storage.
              Los archivos quedarán disponibles automáticamente en el Documentation Center.
            </p>

            {/* GitHub Push Toggle */}
            <div className="mb-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={pushToGitHubEnabled}
                  onChange={(e) => setPushToGitHubEnabled(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-900 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-colors"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-slate-300" />
                    <span className="font-semibold text-white">
                      También subir a GitHub (/src/docs/)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {pushToGitHubEnabled 
                      ? '✅ Los archivos .md se subirán a Storage + GitHub automáticamente'
                      : '⚠️ Los archivos solo se subirán a Supabase Storage'
                    }
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${\n                  pushToGitHubEnabled \n                    ? 'bg-green-600 text-white' \n                    : 'bg-slate-700 text-slate-400'\n                }`}>
                  {pushToGitHubEnabled ? 'ON' : 'OFF'}
                </div>
              </label>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".md,.txt,.json,.yaml,.yml"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={triggerFileSelect}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Seleccionar Archivos
                </>
              )}
            </button>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="p-4 bg-slate-800 border-b border-slate-700">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Archivos Subidos ({uploadedFiles.length})
                </h4>
              </div>
              <div className="p-2 max-h-64 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-white text-sm font-semibold">{file.name}</p>
                        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB • {file.path}</p>
                      </div>
                    </div>
                    {file.url && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Ver
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GITHUB SYNC */}
      {activeTab === 'github' && (
        <div className="space-y-4">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                🔑 GitHub Personal Access Token:
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                Genera un token en: Settings → Developer settings → Personal access tokens
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                📦 Repositorio (owner/repo):
              </label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="username/repository"
                className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                📂 Path (opcional):
              </label>
              <input
                type="text"
                value={githubPath}
                onChange={(e) => setGithubPath(e.target.value)}
                placeholder="src/docs"
                className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                Dejar vacío para raíz del repositorio
              </p>
            </div>

            <button
              onClick={syncFromGitHub}
              disabled={uploading || !githubToken}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-bold hover:from-gray-800 hover:to-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Sincronizando... {syncProgress.current}/{syncProgress.total}
                </>
              ) : (
                <>
                  <Github className="w-5 h-5" />
                  Sincronizar desde GitHub
                </>
              )}
            </button>
          </div>

          {/* Progress */}
          {uploading && syncProgress.total > 0 && (
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between text-sm text-slate-300 mb-2">
                <span>Sincronizando archivos...</span>
                <span>{syncProgress.current} / {syncProgress.total}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOWNLOAD FROM URL */}
      {activeTab === 'url' && (
        <div className="space-y-4">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                🔗 URL del archivo:
              </label>
              <input
                type="url"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://example.com/document.md"
                className="w-full px-4 py-2 bg-slate-900 border-2 border-slate-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                Cualquier URL pública que retorne texto plano o markdown
              </p>
            </div>

            <button
              onClick={downloadFromUrl}
              disabled={uploading || !downloadUrl}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Descargando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Descargar y Guardar
                </>
              )}
            </button>
          </div>

          <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-4">
            <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Ejemplos de URLs válidas
            </h4>
            <ul className="text-sm text-green-200/80 space-y-1 list-disc list-inside">
              <li>https://raw.githubusercontent.com/user/repo/main/file.md</li>
              <li>https://gist.githubusercontent.com/user/gist-id/raw/file.md</li>
              <li>https://pastebin.com/raw/paste-id</li>
              <li>Cualquier URL que retorne texto sin CORS restrictions</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 4: STORAGE MANAGER */}
      {activeTab === 'storage' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Archivos en Supabase Storage</h3>
            <button
              onClick={loadStorageFiles}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar
            </button>
          </div>

          {storageFiles.length === 0 ? (
            <div className="bg-slate-800 p-12 rounded-xl border border-slate-700 text-center">
              <Database className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No hay archivos en esta carpeta</p>
              <p className="text-sm text-slate-500 mt-2">Sube archivos usando las otras pestañas</p>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="p-4 bg-slate-800 border-b border-slate-700">
                <h4 className="font-bold text-white">
                  {storageFiles.length} archivo{storageFiles.length !== 1 ? 's' : ''} en /{targetFolder}/
                </h4>
              </div>
              <div className="p-2 max-h-96 overflow-y-auto">
                {storageFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-800 rounded-lg group">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-white text-sm font-semibold">{file.name}</p>
                        <p className="text-xs text-slate-400">
                          {(file.metadata?.size / 1024).toFixed(1)} KB • 
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => downloadStorageFile(file.name)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        title="Descargar"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => deleteStorageFile(file.name)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-indigo-900/20 border border-indigo-700/50 rounded-xl p-4">
        <h4 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Información Importante
        </h4>
        <ul className="text-sm text-indigo-200/80 space-y-1 list-disc list-inside">
          <li>Los archivos se guardan en <strong>Supabase Storage</strong>, no en el filesystem local</li>
          <li>El Documentation Center lee automáticamente de Storage</li>
          <li>Los archivos están disponibles inmediatamente después de subirlos</li>
          <li>Free tier: 1 GB de storage, 2 GB/mes de bandwidth</li>
          <li>Todos los archivos son públicamente accesibles vía URL</li>
        </ul>
      </div>
    </div>
  );
}