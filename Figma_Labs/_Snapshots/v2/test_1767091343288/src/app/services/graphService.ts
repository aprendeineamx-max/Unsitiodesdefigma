/**
 * GRAPH SERVICE v1.0
 * 
 * Servicio para construir y analizar grafos de documentos
 * Inspirado en Obsidian Graph View
 * 
 * Features:
 * - Detección de links [[wikilinks]] y [markdown](links)
 * - Construcción de nodos y enlaces
 * - Métricas de centralidad y clustering
 * - Detección de documentos huérfanos
 * - Análisis de comunidades (clusters)
 */

import type { DiscoveredDocument } from '../types/documentation';

export interface GraphNode {
  id: string;
  name: string;
  path: string;
  val: number; // Node size (basado en # de connections)
  color: string; // Color por categoría
  category: string;
  tags: string[];
  metadata: any;
  isOrphan: boolean; // Sin conexiones
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'wikilink' | 'markdown' | 'tag';
  strength: number; // Link weight
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface GraphMetrics {
  totalNodes: number;
  totalLinks: number;
  orphanedDocs: number;
  clusters: number;
  avgConnections: number;
  mostConnected: { id: string; name: string; connections: number }[];
}

// Colores por categoría
const CATEGORY_COLORS: Record<string, string> = {
  roadmap: '#3b82f6', // blue
  guide: '#10b981', // green
  api: '#f59e0b', // amber
  tutorial: '#8b5cf6', // purple
  'best-practices': '#ec4899', // pink
  documentation: '#06b6d4', // cyan
  architecture: '#ef4444', // red
  reference: '#14b8a6', // teal
  default: '#6b7280', // gray
};

/**
 * Extraer todos los links de un documento
 */
export function extractLinks(content: string): {
  wikilinks: string[];
  markdownLinks: string[];
} {
  const wikilinks: string[] = [];
  const markdownLinks: string[] = [];

  // Regex para [[wikilinks]]
  const wikilinkRegex = /\[\[([^\]]+)\]\]/g;
  let match;

  while ((match = wikilinkRegex.exec(content)) !== null) {
    wikilinks.push(match[1].trim());
  }

  // Regex para [text](link.md)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/gi;

  while ((match = markdownLinkRegex.exec(content)) !== null) {
    markdownLinks.push(match[2].trim());
  }

  return { wikilinks, markdownLinks };
}

/**
 * Resolver path de un link
 * 
 * Ejemplos:
 * - [[ROADMAP]] → /ROADMAP.md
 * - [[docs/GUIDE]] → /docs/GUIDE.md
 * - [link](./ROADMAP.md) → /ROADMAP.md
 * - [link](ROADMAP.md) → /ROADMAP.md
 */
export function resolveLinkPath(
  link: string,
  sourcePath: string,
  allDocs: DiscoveredDocument[]
): string | null {
  // Limpiar el link
  let cleanLink = link.trim();

  // Remover ./ y ../
  cleanLink = cleanLink.replace(/^\.\//, '');
  cleanLink = cleanLink.replace(/^\.\.\//g, '');

  // Si no tiene extensión, agregar .md
  if (!cleanLink.endsWith('.md')) {
    cleanLink += '.md';
  }

  // Si no empieza con /, agregarlo
  if (!cleanLink.startsWith('/')) {
    cleanLink = '/' + cleanLink;
  }

  // Buscar documento que coincida
  const found = allDocs.find((doc) => {
    // Match exacto
    if (doc.path === cleanLink) return true;

    // Match por nombre de archivo
    const linkFilename = cleanLink.split('/').pop();
    const docFilename = doc.path.split('/').pop();
    if (linkFilename === docFilename) return true;

    // Match por título (fuzzy)
    const linkName = linkFilename?.replace('.md', '').toLowerCase();
    const docName = doc.metadata.title.toLowerCase();
    if (linkName && docName.includes(linkName)) return true;

    return false;
  });

  return found ? found.path : null;
}

/**
 * Construir grafo desde documentos
 */
export function buildGraph(documents: DiscoveredDocument[]): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const connectionCounts = new Map<string, number>();

  // Crear nodos
  for (const doc of documents) {
    const nodeId = doc.path;
    connectionCounts.set(nodeId, 0);

    nodes.push({
      id: nodeId,
      name: doc.metadata.title,
      path: doc.path,
      val: 1, // Se actualizará después según conexiones
      color: CATEGORY_COLORS[doc.metadata.category] || CATEGORY_COLORS.default,
      category: doc.metadata.category,
      tags: doc.metadata.tags || [],
      metadata: doc.metadata,
      isOrphan: false, // Se actualizará después
    });
  }

  // Crear enlaces analizando contenido
  for (const doc of documents) {
    const sourceId = doc.path;
    
    // Extraer links del contenido
    const { wikilinks, markdownLinks } = extractLinks(doc.content || '');

    // Procesar wikilinks
    for (const wikilink of wikilinks) {
      const targetPath = resolveLinkPath(wikilink, sourceId, documents);
      
      if (targetPath && targetPath !== sourceId) {
        links.push({
          source: sourceId,
          target: targetPath,
          type: 'wikilink',
          strength: 1,
        });

        // Incrementar contadores
        connectionCounts.set(sourceId, (connectionCounts.get(sourceId) || 0) + 1);
        connectionCounts.set(targetPath, (connectionCounts.get(targetPath) || 0) + 1);
      }
    }

    // Procesar markdown links
    for (const mdLink of markdownLinks) {
      const targetPath = resolveLinkPath(mdLink, sourceId, documents);
      
      if (targetPath && targetPath !== sourceId) {
        // Evitar duplicados
        const exists = links.some(
          (l) => l.source === sourceId && l.target === targetPath
        );

        if (!exists) {
          links.push({
            source: sourceId,
            target: targetPath,
            type: 'markdown',
            strength: 1,
          });

          connectionCounts.set(sourceId, (connectionCounts.get(sourceId) || 0) + 1);
          connectionCounts.set(targetPath, (connectionCounts.get(targetPath) || 0) + 1);
        }
      }
    }

    // Crear enlaces por tags compartidos (más débiles)
    if (doc.metadata.tags && doc.metadata.tags.length > 0) {
      for (const otherDoc of documents) {
        if (otherDoc.path === sourceId) continue;
        
        const sharedTags = (doc.metadata.tags || []).filter((tag: string) =>
          (otherDoc.metadata.tags || []).includes(tag)
        );

        if (sharedTags.length > 0) {
          // Solo crear link si no existe uno explícito
          const hasExplicitLink = links.some(
            (l) =>
              (l.source === sourceId && l.target === otherDoc.path) ||
              (l.source === otherDoc.path && l.target === sourceId)
          );

          if (!hasExplicitLink) {
            links.push({
              source: sourceId,
              target: otherDoc.path,
              type: 'tag',
              strength: 0.3, // Más débil que links explícitos
            });

            connectionCounts.set(sourceId, (connectionCounts.get(sourceId) || 0) + 0.3);
            connectionCounts.set(otherDoc.path, (connectionCounts.get(otherDoc.path) || 0) + 0.3);
          }
        }
      }
    }
  }

  // Actualizar node sizes y detectar orphans
  for (const node of nodes) {
    const connections = connectionCounts.get(node.id) || 0;
    node.val = Math.max(1, Math.sqrt(connections) * 3); // Scale for visibility
    node.isOrphan = connections === 0;
  }

  return { nodes, links };
}

/**
 * Calcular métricas del grafo
 */
export function calculateGraphMetrics(graphData: GraphData): GraphMetrics {
  const { nodes, links } = graphData;

  // Contar conexiones por nodo
  const connectionCounts = new Map<string, number>();
  
  for (const link of links) {
    connectionCounts.set(
      link.source,
      (connectionCounts.get(link.source) || 0) + 1
    );
    connectionCounts.set(
      link.target,
      (connectionCounts.get(link.target) || 0) + 1
    );
  }

  // Orphaned docs (sin conexiones)
  const orphans = nodes.filter((n) => n.isOrphan);

  // Documentos más conectados
  const mostConnected = Array.from(connectionCounts.entries())
    .map(([id, count]) => {
      const node = nodes.find((n) => n.id === id);
      return {
        id,
        name: node?.name || id,
        connections: count,
      };
    })
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 10);

  // Promedio de conexiones
  const totalConnections = Array.from(connectionCounts.values()).reduce(
    (sum, count) => sum + count,
    0
  );
  const avgConnections = nodes.length > 0 ? totalConnections / nodes.length : 0;

  // Detectar clusters (simple heurística por categorías)
  const categories = new Set(nodes.map((n) => n.category));

  return {
    totalNodes: nodes.length,
    totalLinks: links.length,
    orphanedDocs: orphans.length,
    clusters: categories.size,
    avgConnections: Math.round(avgConnections * 10) / 10,
    mostConnected,
  };
}

/**
 * Filtrar grafo
 */
export function filterGraph(
  graphData: GraphData,
  filters: {
    categories?: string[];
    tags?: string[];
    orphansOnly?: boolean;
    searchTerm?: string;
  }
): GraphData {
  let filteredNodes = [...graphData.nodes];
  let filteredLinks = [...graphData.links];

  // Filtrar por categoría
  if (filters.categories && filters.categories.length > 0) {
    filteredNodes = filteredNodes.filter((node) =>
      filters.categories!.includes(node.category)
    );
  }

  // Filtrar por tags
  if (filters.tags && filters.tags.length > 0) {
    filteredNodes = filteredNodes.filter((node) =>
      filters.tags!.some((tag) => node.tags.includes(tag))
    );
  }

  // Filtrar orphans only
  if (filters.orphansOnly) {
    filteredNodes = filteredNodes.filter((node) => node.isOrphan);
  }

  // Filtrar por búsqueda
  if (filters.searchTerm && filters.searchTerm.trim().length > 0) {
    const searchLower = filters.searchTerm.toLowerCase();
    filteredNodes = filteredNodes.filter(
      (node) =>
        node.name.toLowerCase().includes(searchLower) ||
        node.path.toLowerCase().includes(searchLower) ||
        node.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }

  // Filtrar links para solo incluir nodos que quedaron
  const nodeIds = new Set(filteredNodes.map((n) => n.id));
  filteredLinks = filteredLinks.filter(
    (link) => nodeIds.has(link.source) && nodeIds.has(link.target)
  );

  return {
    nodes: filteredNodes,
    links: filteredLinks,
  };
}

/**
 * Exportar grafo a formato compatible con react-force-graph
 */
export function toForceGraphData(graphData: GraphData): any {
  return {
    nodes: graphData.nodes.map((node) => ({
      ...node,
      // react-force-graph usa estas propiedades
      id: node.id,
      name: node.name,
      val: node.val,
      color: node.color,
    })),
    links: graphData.links.map((link) => ({
      source: link.source,
      target: link.target,
      value: link.strength,
      type: link.type,
    })),
  };
}

/**
 * Logging profesional
 */
export function logGraphStats(graphData: GraphData): void {
  const metrics = calculateGraphMetrics(graphData);

  console.log('📊 Graph View Statistics:');
  console.log(`  → Nodes: ${metrics.totalNodes}`);
  console.log(`  → Links: ${metrics.totalLinks}`);
  console.log(`  → Orphans: ${metrics.orphanedDocs}`);
  console.log(`  → Avg Connections: ${metrics.avgConnections}`);
  
  if (metrics.mostConnected.length > 0) {
    console.log(`  → Most Connected: ${metrics.mostConnected[0].name} (${metrics.mostConnected[0].connections} links)`);
  }
}
