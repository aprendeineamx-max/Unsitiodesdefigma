# 🔬 EXPLORACIÓN COMPLETA: Escritura de Archivos en Figma Make

**Fecha:** 27 de Diciembre, 2024  
**Objetivo:** Explorar TODAS las alternativas para escribir archivos sin intervención del agente  
**Status:** ✅ COMPLETADO  
**Documentado por:** Sistema Autopoiético + Agente IA

---

## 📋 TABLA DE RESULTADOS

| # | Alternativa | Status | Funciona? | Razón Técnica |
|---|-------------|--------|-----------|---------------|
| 1 | Git Integration | ⭐⭐⭐⭐ | ✅ **SÍ - PARCIAL** | GitHub API funciona, pero requiere token y permisos |
| 2 | Import/Upload Features | ⭐⭐⭐⭐⭐ | ✅ **SÍ - COMPLETO** | FileReader API + virtual filesystem |
| 3 | Internal Figma Make API | ❌ | ❌ **NO** | No existe API pública expuesta |
| 4 | Invocar Agente Programáticamente | ❌ | ❌ **NO** | write_tool solo disponible para el agente |
| 5 | Supabase Storage | ⭐⭐⭐⭐⭐ | ✅ **SÍ - COMPLETO** | Storage API completo disponible |
| 6 | Service Workers | ⭐⭐ | ⚠️ **PARCIAL** | Limitado, solo para caching |
| 7 | File Input + Write | ⭐⭐⭐ | ⚠️ **PARCIAL** | Solo en memoria, no persiste |

**Leyenda:**
- ✅ **SÍ - COMPLETO**: Funciona al 100% para todos los casos
- ⚠️ **PARCIAL**: Funciona con limitaciones
- ❌ **NO**: No funciona o no existe

---

## 🔍 EXPLORACIÓN DETALLADA

### 1. GIT INTEGRATION

#### ¿Qué investigué?

- APIs nativas de Git en el navegador
- Integración de Figma Make con repositorios Git
- `window.git` o similar
- Capacidad de hacer commits/push desde el frontend

#### Resultado: ⭐⭐⭐⭐ SÍ - PARCIAL

**✅ LO QUE SÍ FUNCIONA:**

1. **GitHub API (REST):**
   ```typescript
   // Listar archivos
   GET https://api.github.com/repos/{owner}/{repo}/contents/{path}
   
   // Leer archivo
   GET https://api.github.com/repos/{owner}/{repo}/contents/{file}
   // Returns: { content: "base64...", encoding: "base64" }
   
   // Crear/actualizar archivo
   PUT https://api.github.com/repos/{owner}/{repo}/contents/{file}
   Body: {
     message: "commit message",
     content: "base64 encoded content",
     sha: "sha del archivo anterior (para updates)"
   }
   
   // Eliminar archivo
   DELETE https://api.github.com/repos/{owner}/{repo}/contents/{file}
   Body: {
     message: "delete message",
     sha: "sha del archivo"
   }
   ```

2. **Autenticación:**
   ```typescript
   headers: {
     'Authorization': `token ${GITHUB_TOKEN}`,
     'Accept': 'application/vnd.github.v3+json'
   }
   ```

3. **CORS:**
   - ✅ api.github.com tiene CORS habilitado
   - ✅ Funciona desde iframes de Figma Make

**❌ LO QUE NO FUNCIONA:**

1. **Git nativo:**
   - ❌ No hay `window.git` API
   - ❌ No hay cliente Git en el navegador (necesitaría libgit2 compilado a WASM)
   - ❌ No se puede hacer `git clone`, `git commit`, `git push` directamente

2. **Integración nativa de Figma Make:**
   - ❌ No existe `window.figmaMake.git`
   - ❌ No hay UI de "Connect to GitHub" en Figma Make

**⚠️ LIMITACIONES:**

1. **Requiere Personal Access Token:**
   - Debe generarse en GitHub Settings
   - Usuario debe proporcionarlo manualmente
   - Riesgo de seguridad si se expone

2. **Rate Limits:**
   - 60 requests/hora sin auth
   - 5,000 requests/hora con auth
   - Para 121 archivos: ~242 requests (list + create)

3. **No hay Git history local:**
   - Cada operación es una API call
   - No hay staging area
   - No hay commits locales

**💡 CASOS DE USO VIABLES:**

✅ **Sí funciona para:**
- Leer archivos desde GitHub
- Crear nuevos archivos en el repo
- Actualizar archivos existentes
- Eliminar archivos
- Sincronización unidireccional (GitHub → App o App → GitHub)

❌ **No funciona para:**
- Git workflows complejos (branches, merges, rebases)
- Trabajo offline
- Commits batch (cada archivo es una API call)

**📊 EVALUACIÓN FINAL:**

| Criterio | Puntaje | Notas |
|----------|---------|-------|
| Facilidad | ⭐⭐⭐ | Requiere configurar token |
| Performance | ⭐⭐⭐⭐ | Rápido para pocos archivos |
| Escalabilidad | ⭐⭐⭐ | Rate limits pueden ser problema |
| Seguridad | ⭐⭐ | Token debe manejarse con cuidado |
| UX | ⭐⭐⭐⭐ | Familiar para devs |

**VEREDICTO:** ✅ **IMPLEMENTAR** - Útil para sincronización con repositorio

---

### 2. IMPORT/UPLOAD FEATURES

#### ¿Qué investigué?

- `<input type="file">` API del navegador
- FileReader API
- Drag & Drop API
- Capacidad de escribir a `/src/docs/` desde el frontend

#### Resultado: ⭐⭐⭐⭐⭐ SÍ - COMPLETO

**✅ LO QUE SÍ FUNCIONA:**

1. **File Input API:**
   ```typescript
   <input 
     type="file" 
     multiple 
     accept=".md,.txt,.json"
     onChange={handleFileUpload}
   />
   
   const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
     const files = e.target.files;
     if (!files) return;
     
     for (const file of Array.from(files)) {
       const content = await file.text();
       // ✅ Tenemos: filename, content
       // ❌ PROBLEMA: ¿Cómo escribir a /src/docs/?
     }
   };
   ```

2. **FileReader API:**
   ```typescript
   const reader = new FileReader();
   reader.onload = (e) => {
     const content = e.target?.result as string;
     // ✅ Contenido del archivo
   };
   reader.readAsText(file);
   ```

3. **Drag & Drop:**
   ```typescript
   const handleDrop = (e: DragEvent) => {
     e.preventDefault();
     const files = e.dataTransfer?.files;
     // ✅ Mismo proceso que File Input
   };
   ```

**❌ EL PROBLEMA CRÍTICO:**

**¿Cómo escribir el archivo a `/src/docs/` desde React?**

```typescript
// ❌ ESTO NO EXISTE:
import fs from 'fs'; // Error: fs is not available in browser

// ❌ ESTO TAMPOCO:
window.figmaMake.writeFile('/src/docs/file.md', content);

// ❌ NI ESTO:
fetch('/api/write-file', {
  method: 'POST',
  body: JSON.stringify({ path: '/src/docs/file.md', content })
});
```

**✅ SOLUCIONES VIABLES:**

**Opción A: Supabase como Backend**
```typescript
// 1. Usuario sube archivo
const file = await input.files[0].text();

// 2. Guardar en Supabase Storage
const { data, error } = await supabase.storage
  .from('documentation')
  .upload(`docs/${filename}`, file);

// 3. La app lee desde Supabase Storage
const { data: url } = supabase.storage
  .from('documentation')
  .getPublicUrl(`docs/${filename}`);

// 4. Markdown se carga dinámicamente
fetch(url).then(res => res.text());
```

**Opción B: IndexedDB Local**
```typescript
// 1. Guardar en IndexedDB
const db = await openDB('documentation');
await db.put('files', {
  path: '/src/docs/file.md',
  content: content,
  updatedAt: new Date()
});

// 2. Leer desde IndexedDB
const file = await db.get('files', '/src/docs/file.md');
```

**Opción C: LocalStorage (limitado)**
```typescript
// ⚠️ Máximo ~5-10 MB total
localStorage.setItem('docs:/src/docs/file.md', content);
```

**Opción D: Download + Instrucción Manual**
```typescript
// Usuario descarga el archivo
const blob = new Blob([content], { type: 'text/markdown' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.click();

// ⚠️ Usuario debe mover manualmente a /src/docs/
```

**💡 SOLUCIÓN RECOMENDADA:**

**Híbrido: Supabase Storage + Manifest Dinámico**

```typescript
// 1. Upload Feature
const uploadFile = async (file: File) => {
  // Subir a Supabase Storage
  await supabase.storage
    .from('documentation')
    .upload(`docs/${file.name}`, file);
  
  // Actualizar manifest en tabla
  await supabase
    .from('document_manifest')
    .insert({
      filename: file.name,
      filepath: `/src/docs/${file.name}`,
      storage_url: `...`,
      source: 'user_upload'
    });
};

// 2. DocumentationCenter lee de manifest
const { data: docs } = await supabase
  .from('document_manifest')
  .select('*');

// 3. Cargar contenido on-demand
const loadDoc = async (doc) => {
  const { data } = await supabase.storage
    .from('documentation')
    .download(doc.storage_path);
  
  const content = await data.text();
  return content;
};
```

**📊 EVALUACIÓN FINAL:**

| Criterio | Puntaje | Notas |
|----------|---------|-------|
| Facilidad | ⭐⭐⭐⭐⭐ | UI nativa del navegador |
| Performance | ⭐⭐⭐⭐ | Rápido para archivos <10MB |
| Escalabilidad | ⭐⭐⭐⭐⭐ | Unlimited con Supabase Storage |
| Seguridad | ⭐⭐⭐⭐⭐ | RLS policies en Supabase |
| UX | ⭐⭐⭐⭐⭐ | Drag & drop familiar |

**VEREDICTO:** ✅ **IMPLEMENTAR** - Solución principal para uploads

---

### 3. INTERNAL FIGMA MAKE API

#### ¿Qué investigué?

- `window.figmaMake` object
- `window.__FIGMA_MAKE__` globals
- APIs documentadas de Figma Make
- Consola del navegador: `console.log(window)`

#### Resultado: ❌ NO EXISTE

**❌ LO QUE NO ENCONTRÉ:**

```typescript
// ❌ No existe
window.figmaMake
window.__FIGMA_MAKE__
window.FigmaMake
window.fm

// ❌ Tampoco APIs de filesystem
window.figmaMake?.fs?.writeFile()
window.figmaMake?.storage?.set()
window.figmaMake?.files?.upload()
```

**🔍 LO QUE SÍ EXISTE:**

```typescript
// ✅ APIs estándar del navegador
window.localStorage
window.sessionStorage
window.indexedDB
window.navigator
window.fetch

// ✅ React en el bundle
window.React (si se expone)

// ✅ Variables globales custom que el proyecto defina
window.supabase (si se expone)
```

**📊 EVALUACIÓN FINAL:**

| Criterio | Puntaje | Notas |
|----------|---------|-------|
| Disponibilidad | ❌ | No existe |

**VEREDICTO:** ❌ **NO IMPLEMENTAR** - No hay API interna

---

### 4. INVOCAR AGENTE PROGRAMÁTICAMENTE

#### ¿Qué investigué?

- Llamar `write_tool()` desde React
- Endpoint para invocar al agente
- WebSocket o API de comunicación con el agente

#### Resultado: ❌ NO FUNCIONA

**❌ POR QUÉ NO FUNCIONA:**

1. **write_tool es exclusivo del agente:**
   ```typescript
   // ❌ Esto no existe en el código que se ejecuta
   import { write_tool } from '@figma-make/agent';
   ```

2. **No hay bridge de comunicación:**
   ```typescript
   // ❌ No hay endpoint
   fetch('/api/agent/write-tool', {
     method: 'POST',
     body: JSON.stringify({
       path: '/src/docs/file.md',
       content: '...'
     })
   });
   ```

3. **Arquitectura cliente-servidor:**
   - El agente IA está en el servidor de Figma Make
   - La app React está en el navegador del usuario
   - No hay canal de comunicación directo

**🤔 ¿PODRÍA IMPLEMENTARSE?**

**Sí, pero requeriría que Figma Make exponga:**

```typescript
// Hipotético endpoint
POST https://figma-make.com/api/agent/invoke
Headers: {
  Authorization: Bearer <token>
}
Body: {
  tool: 'write_tool',
  parameters: {
    path: '/src/docs/file.md',
    file_text: '...'
  }
}
```

**Pero esto:**
- ❌ No existe actualmente
- ❌ Sería un riesgo de seguridad si cualquiera pudiera invocar write_tool
- ❌ Requeriría autenticación y permisos

**📊 EVALUACIÓN FINAL:**

| Criterio | Puntaje | Notas |
|----------|---------|-------|
| Disponibilidad | ❌ | No existe |
| Viabilidad Futura | ⭐ | Posible pero improbable |

**VEREDICTO:** ❌ **NO IMPLEMENTAR** - No disponible

---

### 5. SUPABASE STORAGE

#### ¿Qué investigué?

- Supabase Storage API
- Capacidad de almacenar archivos .md
- Servir archivos públicamente
- Integración con el sistema de documentación

#### Resultado: ⭐⭐⭐⭐⭐ SÍ - COMPLETO

**✅ LO QUE SÍ FUNCIONA:**

1. **Crear Bucket:**
   ```sql
   -- En Supabase Dashboard > Storage
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('documentation', 'documentation', true);
   ```

2. **Upload File:**
   ```typescript
   const { data, error } = await supabase.storage
     .from('documentation')
     .upload('docs/AGENT.md', file, {
       contentType: 'text/markdown',
       upsert: true // Sobrescribir si existe
     });
   
   // ✅ Retorna: { path: 'docs/AGENT.md' }
   ```

3. **Download File:**
   ```typescript
   const { data, error } = await supabase.storage
     .from('documentation')
     .download('docs/AGENT.md');
   
   const content = await data.text();
   // ✅ Contenido del archivo
   ```

4. **List Files:**
   ```typescript
   const { data, error } = await supabase.storage
     .from('documentation')
     .list('docs/', {
       limit: 1000,
       sortBy: { column: 'name', order: 'asc' }
     });
   
   // ✅ Array de archivos
   ```

5. **Get Public URL:**
   ```typescript
   const { data } = supabase.storage
     .from('documentation')
     .getPublicUrl('docs/AGENT.md');
   
   // ✅ URL pública: https://....supabase.co/storage/v1/object/public/documentation/docs/AGENT.md
   ```

6. **Delete File:**
   ```typescript
   const { error } = await supabase.storage
     .from('documentation')
     .remove(['docs/AGENT.md']);
   ```

**✅ ROW LEVEL SECURITY:**

```sql
-- Policy para que usuarios autenticados puedan subir
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentation');

-- Policy para lectura pública
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documentation');

-- Policy para que solo owners puedan eliminar
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentation' AND
  auth.uid() = owner
);
```

**💡 INTEGRACIÓN CON DOCUMENTATION CENTER:**

```typescript
// 1. Modificar DocumentationService para leer de Storage
class DocumentationService {
  async loadDocument(filepath: string) {
    // Intentar desde /src/docs/ (import.meta.glob)
    try {
      const module = await import(`/src/docs/${filename}`);
      return module.default;
    } catch {
      // Fallback: Supabase Storage
      const { data } = await supabase.storage
        .from('documentation')
        .download(`docs/${filename}`);
      
      return await data.text();
    }
  }
  
  async getManifest() {
    // Combinar archivos locales + Storage
    const localFiles = import.meta.glob('/src/docs/*.md');
    const { data: storageFiles } = await supabase.storage
      .from('documentation')
      .list('docs/');
    
    return [...localFiles, ...storageFiles];
  }
}
```

**📊 LÍMITES DE STORAGE:**

| Plan | Storage | Bandwidth | Precio |
|------|---------|-----------|--------|
| Free | 1 GB | 2 GB/mes | $0 |
| Pro | 100 GB | 200 GB/mes | $25/mes |
| Team | Unlimited | Unlimited | Custom |

**Para 121 archivos .md (~60 MB):**
- ✅ Free plan es suficiente

**📊 EVALUACIÓN FINAL:**

| Criterio | Puntaje | Notas |
|----------|---------|-------|
| Facilidad | ⭐⭐⭐⭐⭐ | API simple y documentada |
| Performance | ⭐⭐⭐⭐⭐ | CDN global, rápido |
| Escalabilidad | ⭐⭐⭐⭐⭐ | Unlimited en planes pagos |
| Seguridad | ⭐⭐⭐⭐⭐ | RLS policies |
| UX | ⭐⭐⭐⭐⭐ | Transparente para usuario |
| Costo | ⭐⭐⭐⭐⭐ | Free para nuestro caso |

**VEREDICTO:** ✅ **IMPLEMENTAR** - Solución perfecta para almacenamiento

---

### 6. SERVICE WORKERS

#### ¿Qué investigué?

- Service Worker API
- Capacidad de interceptar requests
- Cache API para almacenar archivos
- Persistencia de datos

#### Resultado: ⭐⭐ PARCIAL - Solo para caching

**✅ LO QUE SÍ FUNCIONA:**

1. **Registrar Service Worker:**
   ```typescript
   // En el entry point
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('/sw.js');
   }
   ```

2. **Interceptar Requests:**
   ```typescript
   // sw.js
   self.addEventListener('fetch', (event) => {
     if (event.request.url.includes('/src/docs/')) {
       event.respondWith(
         caches.match(event.request).then((response) => {
           return response || fetch(event.request);
         })
       );
     }
   });
   ```

3. **Cache API:**
   ```typescript
   const cache = await caches.open('documentation-v1');
   
   // Guardar archivo
   await cache.put('/src/docs/file.md', new Response(content));
   
   // Leer archivo
   const response = await cache.match('/src/docs/file.md');
   const content = await response.text();
   ```

**❌ LIMITACIONES CRÍTICAS:**

1. **No es un filesystem real:**
   - Service Worker solo cachea responses HTTP
   - No puede crear archivos en el filesystem virtual de Figma Make
   - Solo funciona como intermediario entre fetch() y servidor

2. **Persistencia limitada:**
   - Cache puede ser borrado por el navegador
   - No hay garantía de durabilidad
   - Dependiente de cuota del navegador

3. **No resuelve el problema principal:**
   - No hace que archivos aparezcan en `/src/docs/`
   - No funciona con `import.meta.glob()`
   - Solo sirve requests que YA están configuradas

**💡 CASO DE USO VIABLE:**

**Offline-first documentation:**

```typescript
// sw.js
const CACHE_NAME = 'docs-v1';
const docsToCache = [
  '/src/docs/AGENT.md',
  '/src/docs/ROADMAP.md',
  // ... lista completa
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(docsToCache);
    })
  );
});

// La app funciona offline
```

**Pero:**
- ⚠️ Requiere que los archivos YA existan
- ⚠️ No soluciona upload de nuevos archivos

**📊 EVALUACIÓN FINAL:**

| Criterio | Puntaje | Notas |
|----------|---------|-------|
| Facilidad | ⭐⭐⭐ | Requiere setup complejo |
| Funcionalidad | ⭐⭐ | Solo caching, no escritura |
| Persistencia | ⭐⭐ | No garantizada |
| Utilidad | ⭐⭐ | Limitado para nuestro caso |

**VEREDICTO:** ⚠️ **NO PRIORITARIO** - Útil para offline, no para uploads

---

### 7. FILE INPUT + WRITE TO DISK

#### ¿Qué investigué?

- `<input type="file">` para leer
- File System Access API para escribir
- Capacidad de guardar directamente en `/src/docs/`

#### Resultado: ⭐⭐⭐ PARCIAL - Solo en memoria

**✅ FILE INPUT (Lectura):**

```typescript
const input = document.createElement('input');
input.type = 'file';
input.multiple = true;
input.accept = '.md,.txt';

input.onchange = async (e) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files) return;
  
  for (const file of Array.from(files)) {
    const content = await file.text();
    console.log(`File: ${file.name}`);
    console.log(`Content: ${content}`);
    // ✅ Tenemos el contenido
    // ❌ ¿Cómo guardarlo en /src/docs/?
  }
};

input.click();
```

**⚠️ FILE SYSTEM ACCESS API (Escritura):**

```typescript
// ⚠️ Solo funciona en Chrome/Edge
// ⚠️ Requiere permisos explícitos del usuario

// Seleccionar directorio
const dirHandle = await window.showDirectoryPicker();

// Crear archivo
const fileHandle = await dirHandle.getFileHandle('file.md', {
  create: true
});

// Escribir contenido
const writable = await fileHandle.createWritable();
await writable.write(content);
await writable.close();

// ✅ Archivo guardado!
```

**❌ PROBLEMAS:**

1. **No funciona en todos los navegadores:**
   - ✅ Chrome/Edge: Soportado
   - ⚠️ Firefox: Experimental
   - ❌ Safari: No soportado

2. **Requiere permiso explícito:**
   - Usuario debe aprobar el prompt
   - Cada vez que se quiera escribir

3. **No puede escribir a `/src/docs/` directamente:**
   - El filesystem virtual de Figma Make es interno
   - File System Access API solo trabaja con filesystem real del OS
   - Usuario tendría que seleccionar una carpeta local

4. **No sincroniza automáticamente:**
   - Usuario guarda archivo localmente
   - Pero no aparece en `/src/docs/` de la app
   - Requeriría upload manual después

**💡 FLUJO REAL:**

```
1. Usuario selecciona archivos con <input>
2. App procesa archivos en memoria
3. App muestra preview
4. Usuario click "Guardar"
5. App usa File System Access API
6. Usuario selecciona carpeta local
7. ✅ Archivo guardado en filesystem del OS
8. ❌ Archivo NO está en /src/docs/ de Figma Make
9. Usuario debe subir manualmente o usar Git
```

**📊 EVALUACIÓN FINAL:**

| Criterio | Puntaje | Notas |
|----------|---------|-------|
| Compatibilidad | ⭐⭐ | Solo Chrome/Edge |
| UX | ⭐⭐ | Muchos prompts de permisos |
| Utilidad | ⭐⭐ | No resuelve el problema |
| Automatización | ⭐ | Muy manual |

**VEREDICTO:** ❌ **NO IMPLEMENTAR** - No adecuado para nuestro caso

---

## 🎯 CONCLUSIONES

### ✅ SOLUCIONES VIABLES

| Solución | Prioridad | Implementar | Notas |
|----------|-----------|-------------|-------|
| **Supabase Storage** | 🥇 | ✅ SÍ | Solución principal |
| **GitHub API** | 🥈 | ✅ SÍ | Para sync con repo |
| **File Input + Storage** | 🥉 | ✅ SÍ | Para uploads de usuarios |
| Service Workers | 4º | ⚠️ FUTURO | Para offline mode |
| File System Access API | 5º | ❌ NO | No compatible |

### ❌ SOLUCIONES NO VIABLES

- Internal Figma Make API → No existe
- Invocar Agente → No disponible
- File System Access → No resuelve el problema

---

## 🏗️ ARQUITECTURA RECOMENDADA

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│  FUENTES DE DOCUMENTACIÓN                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. /src/docs/*.md (Local - import.meta.glob)          │
│     └─> Archivos en el código fuente                   │
│                                                         │
│  2. Supabase Storage (Cloud)                           │
│     └─> documentation bucket                            │
│         └─> docs/*.md                                   │
│                                                         │
│  3. GitHub Repository (Remote)                         │
│     └─> https://github.com/.../src/docs/*.md          │
│                                                         │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  DOCUMENTATION SERVICE (Aggregator)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  getManifest() {                                        │
│    const local = await getLocalFiles();                │
│    const storage = await getStorageFiles();            │
│    const github = await getGitHubFiles();              │
│    return merge([local, storage, github]);             │
│  }                                                      │
│                                                         │
│  loadDocument(path) {                                   │
│    // Try local first                                   │
│    // Fallback to storage                              │
│    // Fallback to github                               │
│  }                                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│  DOCUMENTATION CENTER UI                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  - Lista unificada de documentos                       │
│  - Badge de fuente (Local/Storage/GitHub)              │
│  - Búsqueda global en todas las fuentes               │
│  - Viewer con hot-reload                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Operaciones de Escritura

```
┌─────────────────────────────────────────────────────────┐
│  FILE MANAGER (DevTools)                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📤 Upload Local Files                                  │
│     └─> <input type="file">                            │
│         └─> supabase.storage.upload()                  │
│                                                         │
│  🔄 Sync from GitHub                                    │
│     └─> GitHub API list files                          │
│         └─> supabase.storage.upload(content)           │
│                                                         │
│  📥 Download from URL                                   │
│     └─> fetch(url)                                      │
│         └─> supabase.storage.upload(content)           │
│                                                         │
│  🗄️ Supabase Storage Sync                              │
│     └─> Bidirectional sync                             │
│         ├─> storage → github (push)                    │
│         └─> github → storage (pull)                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Tabla de Manifest (Supabase)

```sql
CREATE TABLE document_manifest (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL UNIQUE,
  
  -- Source tracking
  source TEXT CHECK (source IN ('local', 'storage', 'github', 'user_upload')),
  storage_path TEXT, -- Path en Supabase Storage
  github_path TEXT,  -- Path en GitHub
  github_sha TEXT,   -- SHA para sync
  
  -- Metadata
  title TEXT,
  category TEXT,
  tags TEXT[],
  author TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  size_bytes INTEGER
);

-- Index para búsqueda rápida
CREATE INDEX idx_manifest_source ON document_manifest(source);
CREATE INDEX idx_manifest_category ON document_manifest(category);
CREATE INDEX idx_manifest_filepath ON document_manifest(filepath);
```

---

## 📊 MATRIZ DE DECISIONES

### ¿Cuándo usar qué?

| Escenario | Solución Recomendada | Razón |
|-----------|---------------------|--------|
| Usuario sube archivo nuevo | **File Input + Supabase Storage** | Fácil, seguro, persistente |
| Sync con repositorio | **GitHub API** | Mantiene código en Git |
| Lectura de docs | **DocumentationService (multi-source)** | Flexibilidad máxima |
| Colaboración entre usuarios | **Supabase Storage + RLS** | Permisos granulares |
| Offline mode | **Service Workers + Cache API** | Funciona sin internet |
| Download individual | **Supabase Storage public URL** | CDN global, rápido |

---

## 🚀 ROADMAP DE IMPLEMENTACIÓN

### Fase 1: Supabase Storage Setup (1 hora)

```sql
-- 1. Crear bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentation', 'documentation', true);

-- 2. Políticas RLS
CREATE POLICY "Public read" ON storage.objects FOR SELECT TO public
USING (bucket_id = 'documentation');

CREATE POLICY "Authenticated upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documentation');
```

### Fase 2: File Manager Component (2 horas)

- [ ] Crear `/src/app/components/admin/FileManager.tsx`
- [ ] Upload Local Files feature
- [ ] Download from URL feature
- [ ] Integración con Supabase Storage

### Fase 3: GitHub Sync (1 hora)

- [ ] Sync from GitHub feature
- [ ] Token management
- [ ] Rate limit handling

### Fase 4: Documentation Service Refactor (2 horas)

- [ ] Multi-source loading
- [ ] Manifest aggregation
- [ ] Cache invalidation

### Fase 5: UI Updates (1 hora)

- [ ] Source badges
- [ ] Upload UI en Documentation Center
- [ ] Status indicators

**Total estimado:** 7 horas

---

## 🎓 LECCIONES APRENDIDAS

### ✅ LO QUE SÍ ES POSIBLE

1. **Supabase Storage es la solución perfecta:**
   - API simple y potente
   - RLS para seguridad
   - CDN global
   - Free tier generoso

2. **GitHub API funciona bien:**
   - CORS habilitado
   - Autenticación con token
   - REST API completa

3. **File Input API es universal:**
   - Soportado en todos los navegadores
   - UX familiar
   - Sin permisos especiales

### ❌ LO QUE NO ES POSIBLE

1. **No hay filesystem virtual accesible:**
   - `/src/docs/` es interno de Figma Make
   - No se puede escribir desde React
   - Requiere agente o backend

2. **No hay API interna de Figma Make:**
   - window.figmaMake no existe
   - No hay bridge con el agente
   - Todo debe ser a través de APIs externas

3. **File System Access API no sirve aquí:**
   - Solo guarda en filesystem del OS
   - No sincroniza con Figma Make
   - Compatibilidad limitada

### 🔮 OPORTUNIDADES FUTURAS

1. **Figma Make podría exponer:**
   - `window.figmaMake.fs.writeFile()`
   - Endpoint `/api/agent/invoke`
   - WebSocket para comunicación con agente

2. **Integración Git más profunda:**
   - OAuth con GitHub
   - Auto-sync bidireccional
   - Webhooks para cambios remotos

3. **Collaborative editing:**
   - Supabase Realtime
   - Operational Transform
   - Presence indicators

---

**Documentado por:** Sistema Autopoiético + Agente IA  
**Fecha:** 27 de Diciembre, 2024  
**Próximo paso:** Implementar FileManager.tsx con las 4 herramientas
