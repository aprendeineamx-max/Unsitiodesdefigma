/**
 * AUTO-DISCOVERY SYSTEM v8.2.1 - PRODUCTION-READY INFRASTRUCTURE
 * Sistema de auto-descubrimiento de documentos Markdown usando import.meta.glob
 * 
 * CAMBIOS EN v8.2.1 (MIGRACIÓN A /src/docs/ COMPLETADA):
 * ✅ Ruta actualizada a /src/docs/ para seguridad y estándares Vite
 * ✅ Migración física de 119 archivos .md ejecutada
 * ✅ Estructura de carpetas optimizada para producción
 * ✅ Sistema seguro y compatible con Linux/Windows/macOS
 * 
 * CAMBIOS EN v8.2.0:
 * ✅ ReferenceError corregido en DocumentationViewer.tsx (TDZ fix)
 * ✅ api.ts actualizado para usar import.meta.env (Vite Standards)
 * 
 * ESTADO ACTUAL:
 * ✅ PRODUCCIÓN: Usando /src/docs/ como ruta principal
 * ✅ Todos los documentos .md migrados a /src/docs/
 * ✅ Carpeta guidelines/ movida a /src/docs/guidelines/
 * ✅ Sistema seguro y compatible con Linux/Windows/macOS
 * 
 * CAMBIOS EN v4.0:
 * ✅ Usa import.meta.glob de Vite para importar TODOS los .md automáticamente
 * ✅ No depende de fetch() que falla con archivos fuera de /public/
 * ✅ Carga archivos desde /src/docs/ y subdirectorios
 * ✅ Sistema 100% automático sin necesidad de scripts externos
 * ✅ Incluye TODOS los documentos críticos automáticamente
 */

import type {
  DiscoveredDocument,
  DocumentMetadata,
  DocumentCategory,
  DocumentScanResult,
} from '../types/documentation';

// 🚀 IMPORTACIÓN AUTOMÁTICA DE TODOS LOS ARCHIVOS .MD
// Vite procesa esto en build-time y crea imports dinámicos
// ✅ PRODUCCIÓN: Usando /src/docs/ como ruta principal (v8.2.1)
const markdownModules = import.meta.glob<string>('/src/docs/**/*.md', { 
  query: '?raw',
  eager: false  // Lazy loading para mejor performance
});

// Combinar todos los módulos
const allMarkdownModules = { ...markdownModules };

console.log('📦 Sistema de Auto-Discovery v8.2.1 iniciado');
console.log(`📂 Módulos Markdown detectados: ${Object.keys(allMarkdownModules).length}`);

/**
 * Parsear frontmatter manualmente para evitar dependencias de Buffer
 */
function parseFrontmatter(content: string): { data: Record<string, any>; content: string } {
  try {
    // ✅ VALIDAR QUE SEA MARKDOWN VÁLIDO
    if (!content || content.trim().length === 0) {
      return { data: {}, content: '' };
    }
    
    // Intentar parsear frontmatter YAML
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      // No hay frontmatter, retornar contenido completo
      return { data: {}, content };
    }
    
    const [, frontmatterStr, markdown] = match;
    
    // Parse YAML simple (sin dependencias)
    const data: Record<string, any> = {};
    const lines = frontmatterStr.split('\n');
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value: any = line.substring(colonIndex + 1).trim();
        
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        
        // Parse arrays (simple)
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value
            .substring(1, value.length - 1)
            .split(',')
            .map((v: string) => v.trim().replace(/['"]/g, ''));
        }
        
        data[key] = value;
      }
    }
    
    return { data, content: markdown };
  } catch (error) {
    // ⚠️ Fallar silenciosamente - retornar contenido sin frontmatter
    return { data: {}, content };
  }
}

/**
 * Generar ID único desde el path
 */
function generateIdFromPath(filepath: string): string {
  return filepath.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}

/**
 * Extraer título del markdown (primer h1)
 */
function extractTitleFromMarkdown(content: string, filename: string): string {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.substring(2).trim();
    }
  }
  
  // Fallback: usar filename sin extensión
  return filename.replace(/\.md$/i, '').replace(/[_-]/g, ' ');
}

/**
 * Extraer descripción del markdown (primer párrafo después del título)
 */
function extractDescriptionFromMarkdown(content: string): string {
  const lines = content.split('\n');
  let foundTitle = false;
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      foundTitle = true;
      continue;
    }
    if (foundTitle && line.trim().length > 0 && !line.startsWith('#')) {
      return line.trim().substring(0, 200);
    }
  }
  
  return '';
}

/**
 * Detectar categoría desde el nombre de archivo
 */
function detectCategoryFromFilename(filename: string): DocumentCategory {
  const lower = filename.toLowerCase();
  
  if (lower.includes('roadmap') || lower.includes('plan')) return 'roadmap';
  if (lower.includes('guide') || lower.includes('setup') || lower.includes('instrucciones') || lower.includes('guia')) return 'guide';
  if (lower.includes('api') || lower.includes('schema')) return 'api';
  if (lower.includes('tutorial') || lower.includes('how-to')) return 'tutorial';
  if (lower.includes('best-practice') || lower.includes('best_practice') || lower.includes('guidelines')) return 'best-practices';
  
  return 'other';
}

/**
 * Procesar un archivo markdown usando import dinámico
 */
async function processMarkdownFile(filepath: string, importFn: () => Promise<any>): Promise<DiscoveredDocument | null> {
  try {
    // Importar el contenido usando Vite
    // IMPORTANTE: import.meta.glob con query: '?raw' retorna un módulo con propiedad 'default'
    const module = await importFn();
    const content = typeof module === 'string' ? module : module.default;
    
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return null;
    }
    
    // Parsear frontmatter
    const { data, content: markdown } = parseFrontmatter(content);
    
    // ✅ Si el parsing falló, descartar este documento
    if (!markdown || markdown.trim().length === 0) {
      return null;
    }
    
    // Extraer metadata
    const filename = filepath.split('/').pop() || '';
    const detectedCategory = detectCategoryFromFilename(filename);
    
    const metadata: DocumentMetadata = {
      title: data.title || extractTitleFromMarkdown(markdown, filename),
      description: data.description || extractDescriptionFromMarkdown(markdown),
      category: (data.category as DocumentCategory) || detectedCategory,
      tags: Array.isArray(data.tags) ? data.tags : [],
      author: data.author || 'Unknown',
      date: data.date || new Date().toISOString(),
      version: data.version || '1.0.0',
      status: data.status || 'published',
      lastModified: data.lastModified || new Date().toISOString(),
    };
    
    const document: DiscoveredDocument = {
      id: generateIdFromPath(filepath),
      path: filepath,
      filename,
      metadata,
      lastModified: new Date(),
      size: content.length,
      content: markdown, // Guardamos el contenido sin frontmatter
    };
    
    return document;
  } catch (error) {
    console.warn(`⚠️ Error procesando ${filepath}:`, error);
    return null;
  }
}

/**
 * Escanear todos los documentos usando import.meta.glob
 * 🚀 ESTE ES EL CORAZÓN DEL SISTEMA V4.0
 */
export async function discoverDocuments(): Promise<DocumentScanResult> {
  const startTime = performance.now();
  
  console.log('🔍 Iniciando auto-discovery de documentos v4.0...');
  console.log(`📂 Archivos a procesar: ${Object.keys(allMarkdownModules).length}`);
  
  // Procesar todos los archivos en paralelo
  const results = await Promise.all(
    Object.entries(allMarkdownModules).map(([filepath, importFn]) => 
      processMarkdownFile(filepath, importFn)
    )
  );
  
  // Filtrar nulls (documentos que no se pudieron cargar)
  const documents = results.filter((doc): doc is DiscoveredDocument => doc !== null);
  
  // Ordenar por fecha (más recientes primero)
  documents.sort((a, b) => {
    const dateA = new Date(a.metadata.date || 0).getTime();
    const dateB = new Date(b.metadata.date || 0).getTime();
    return dateB - dateA;
  });
  
  // Contar por categorías
  const categoryCounts: Record<DocumentCategory, number> = {
    'roadmap': 0,
    'guide': 0,
    'api': 0,
    'tutorial': 0,
    'best-practices': 0,
    'other': 0,
  };
  
  documents.forEach(doc => {
    const category = doc.metadata.category || 'other';
    categoryCounts[category]++;
  });
  
  const endTime = performance.now();
  const scanTime = endTime - startTime;
  
  const result: DocumentScanResult = {
    documents,
    totalCount: documents.length,
    categoryCounts,
    scanTime,
    timestamp: new Date(),
  };
  
  console.log('✅ Auto-discovery v4.0 completado:');
  console.log(`   📊 Total documentos: ${result.totalCount}/${Object.keys(allMarkdownModules).length}`);
  console.log(`   ⏱️ Tiempo: ${scanTime.toFixed(2)}ms`);
  console.log(`   📂 Por categoría:`, categoryCounts);
  
  // Verificar documentos críticos
  const hasDocCenterBP = documents.some(d => d.filename === 'DOCUMENTATION_CENTER_BEST_PRACTICES.md');
  const hasRoadmapDC = documents.some(d => d.filename === 'ROADMAP_DOCUMENTATION_CENTER.md');
  
  if (hasDocCenterBP && hasRoadmapDC) {
    console.log('   ✅ Todos los documentos críticos presentes');
  } else {
    console.warn('   ⚠️ Documentos críticos faltantes:');
    if (!hasDocCenterBP) console.warn('      - DOCUMENTATION_CENTER_BEST_PRACTICES.md');
    if (!hasRoadmapDC) console.warn('      - ROADMAP_DOCUMENTATION_CENTER.md');
  }
  
  return result;
}

/**
 * Buscar documentos por query
 */
export function searchDocuments(documents: DiscoveredDocument[], query: string): DiscoveredDocument[] {
  if (!query || query.trim().length === 0) {
    return documents;
  }
  
  const lowerQuery = query.toLowerCase();
  
  return documents.filter(doc => {
    const titleMatch = doc.metadata.title.toLowerCase().includes(lowerQuery);
    const descriptionMatch = doc.metadata.description?.toLowerCase().includes(lowerQuery);
    const tagMatch = doc.metadata.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
    const contentMatch = doc.content?.toLowerCase().includes(lowerQuery);
    
    return titleMatch || descriptionMatch || tagMatch || contentMatch;
  });
}

/**
 * Filtrar documentos por categoría
 */
export function filterByCategory(
  documents: DiscoveredDocument[],
  category: DocumentCategory | 'all'
): DiscoveredDocument[] {
  if (category === 'all') return documents;
  return documents.filter(doc => doc.metadata.category === category);
}

/**
 * Obtener estadísticas del sistema
 */
export function getManifestStats() {
  const allPaths = Object.keys(allMarkdownModules);
  
  return {
    generatedAt: new Date().toISOString(),
    totalFiles: allPaths.length,
    files: allPaths,
    version: '4.0',
    system: 'import.meta.glob (Vite native)',
  };
}

/**
 * Verificar si hay documentos críticos
 */
export function hasControlDocuments(): boolean {
  const allPaths = Object.keys(allMarkdownModules);
  
  const hasDocCenterBP = allPaths.some(p => p.includes('DOCUMENTATION_CENTER_BEST_PRACTICES.md'));
  const hasRoadmapDC = allPaths.some(p => p.includes('ROADMAP_DOCUMENTATION_CENTER.md'));
  
  return hasDocCenterBP && hasRoadmapDC;
}

/**
 * El manifest siempre está "fresco" porque usa import.meta.glob en tiempo real
 */
export function isManifestFresh(): boolean {
  return true; // Siempre fresh en v4.0 ✨
}