/**
 * BACKLINK SERVICE v1.0
 * 
 * Servicio para detectar y gestionar backlinks bidireccionales
 * Inspirado en Obsidian Backlinks Panel
 * 
 * Features:
 * - Linked mentions (documentos que explícitamente linkan)
 * - Unlinked mentions (documentos que mencionan término pero no linkan)
 * - Contexto de preview alrededor del link/mention
 * - Fuzzy matching para unlinked mentions
 * - Scoring de relevancia
 */

import type { DiscoveredDocument } from '../types/documentation';
import Fuse from 'fuse.js';
import { extractLinks, resolveLinkPath } from './graphService';

export interface LinkedMention {
  sourceDocument: {
    path: string;
    title: string;
    category: string;
  };
  linkText: string;
  linkType: 'wikilink' | 'markdown';
  context: string; // Preview del texto alrededor del link
  position: number; // Posición en el documento
}

export interface UnlinkedMention {
  sourceDocument: {
    path: string;
    title: string;
    category: string;
  };
  mentionedTerm: string;
  context: string;
  position: number;
  confidence: number; // 0-1, qué tan seguro estamos que es relevante
}

export interface BacklinkData {
  linkedMentions: LinkedMention[];
  unlinkedMentions: UnlinkedMention[];
  totalCount: number;
}

/**
 * Extraer contexto alrededor de una posición
 */
function extractContext(
  content: string,
  position: number,
  contextLength: number = 150
): string {
  const start = Math.max(0, position - contextLength / 2);
  const end = Math.min(content.length, position + contextLength / 2);

  let context = content.substring(start, end).trim();

  // Agregar elipsis si es necesario
  if (start > 0) context = '...' + context;
  if (end < content.length) context = context + '...';

  // Limpiar saltos de línea múltiples
  context = context.replace(/\n{2,}/g, ' ');

  return context;
}

/**
 * Encontrar todas las linked mentions (links explícitos) a un documento
 */
export function findLinkedMentions(
  targetDocument: DiscoveredDocument,
  allDocuments: DiscoveredDocument[]
): LinkedMention[] {
  const mentions: LinkedMention[] = [];
  const targetPath = targetDocument.path;
  const targetTitle = targetDocument.metadata.title;

  for (const doc of allDocuments) {
    // Skip el mismo documento
    if (doc.path === targetPath) continue;

    const content = doc.content || '';
    const { wikilinks, markdownLinks } = extractLinks(content);

    // Procesar wikilinks [[...]]
    const wikilinkRegex = /\[\[([^\]]+)\]\]/g;
    let match;

    while ((match = wikilinkRegex.exec(content)) !== null) {
      const linkText = match[1].trim();
      const resolvedPath = resolveLinkPath(linkText, doc.path, allDocuments);

      if (resolvedPath === targetPath) {
        mentions.push({
          sourceDocument: {
            path: doc.path,
            title: doc.metadata.title,
            category: doc.metadata.category,
          },
          linkText,
          linkType: 'wikilink',
          context: extractContext(content, match.index),
          position: match.index,
        });
      }
    }

    // Procesar markdown links [text](link.md)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/gi;

    while ((match = markdownLinkRegex.exec(content)) !== null) {
      const linkText = match[1].trim();
      const linkPath = match[2].trim();
      const resolvedPath = resolveLinkPath(linkPath, doc.path, allDocuments);

      if (resolvedPath === targetPath) {
        mentions.push({
          sourceDocument: {
            path: doc.path,
            title: doc.metadata.title,
            category: doc.metadata.category,
          },
          linkText,
          linkType: 'markdown',
          context: extractContext(content, match.index),
          position: match.index,
        });
      }
    }
  }

  // Ordenar por documento
  mentions.sort((a, b) =>
    a.sourceDocument.title.localeCompare(b.sourceDocument.title)
  );

  return mentions;
}

/**
 * Calcular confianza de una unlinked mention
 */
function calculateConfidence(
  mentionedTerm: string,
  targetTitle: string,
  context: string
): number {
  let confidence = 0;

  const lowerTerm = mentionedTerm.toLowerCase();
  const lowerTitle = targetTitle.toLowerCase();

  // Coincidencia exacta del título = 100%
  if (lowerTerm === lowerTitle) {
    confidence = 1.0;
  }
  // Palabra del título = 70%
  else if (lowerTitle.split(' ').includes(lowerTerm)) {
    confidence = 0.7;
  }
  // Substring del título = 50%
  else if (lowerTitle.includes(lowerTerm)) {
    confidence = 0.5;
  }
  // Palabras similares = 30%
  else {
    confidence = 0.3;
  }

  // Bonus si el contexto tiene palabras relacionadas
  const contextLower = context.toLowerCase();
  const relatedTerms = ['ver', 'según', 'como', 'en', 'documento', 'referencia', 'check'];
  
  for (const term of relatedTerms) {
    if (contextLower.includes(term)) {
      confidence += 0.1;
      break;
    }
  }

  // Cap at 1.0
  return Math.min(confidence, 1.0);
}

/**
 * Encontrar unlinked mentions (menciones sin link) a un documento
 */
export function findUnlinkedMentions(
  targetDocument: DiscoveredDocument,
  allDocuments: DiscoveredDocument[],
  minConfidence: number = 0.4
): UnlinkedMention[] {
  const mentions: UnlinkedMention[] = [];
  const targetPath = targetDocument.path;
  const targetTitle = targetDocument.metadata.title;

  // Generar términos de búsqueda del título
  const searchTerms = generateSearchTerms(targetTitle);

  for (const doc of allDocuments) {
    // Skip el mismo documento
    if (doc.path === targetPath) continue;

    const content = doc.content || '';
    const lowerContent = content.toLowerCase();

    // Buscar cada término
    for (const term of searchTerms) {
      const lowerTerm = term.toLowerCase();
      const regex = new RegExp(`\\b${escapeRegex(lowerTerm)}\\b`, 'gi');
      let match;

      while ((match = regex.exec(content)) !== null) {
        const position = match.index;
        const context = extractContext(content, position);

        // Verificar que no sea parte de un link existente
        const isInLink = isPositionInsideLink(content, position);
        if (isInLink) continue;

        // Calcular confianza
        const confidence = calculateConfidence(term, targetTitle, context);

        if (confidence >= minConfidence) {
          mentions.push({
            sourceDocument: {
              path: doc.path,
              title: doc.metadata.title,
              category: doc.metadata.category,
            },
            mentionedTerm: match[0], // Preservar mayúsculas originales
            context,
            position,
            confidence,
          });
        }
      }
    }
  }

  // Deduplicar (mismo documento puede tener múltiples menciones)
  const deduped: UnlinkedMention[] = [];
  const seen = new Set<string>();

  for (const mention of mentions) {
    const key = `${mention.sourceDocument.path}-${mention.position}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(mention);
    }
  }

  // Ordenar por confianza descendente
  deduped.sort((a, b) => b.confidence - a.confidence);

  return deduped;
}

/**
 * Generar términos de búsqueda desde el título
 */
function generateSearchTerms(title: string): string[] {
  const terms: string[] = [];

  // El título completo
  terms.push(title);

  // Palabras individuales (filtrar palabras comunes cortas)
  const words = title.split(/\s+/).filter((w) => w.length >= 4);
  terms.push(...words);

  // Combinaciones de 2 palabras consecutivas
  for (let i = 0; i < words.length - 1; i++) {
    terms.push(`${words[i]} ${words[i + 1]}`);
  }

  // Remover duplicados
  return Array.from(new Set(terms));
}

/**
 * Verificar si una posición está dentro de un link
 */
function isPositionInsideLink(content: string, position: number): boolean {
  // Buscar links antes de la posición
  const beforeContent = content.substring(0, position + 50);
  
  // Check [[wikilinks]]
  const wikilinkStart = beforeContent.lastIndexOf('[[');
  const wikilinkEnd = beforeContent.lastIndexOf(']]');
  if (wikilinkStart > wikilinkEnd && wikilinkStart !== -1) {
    return true;
  }

  // Check [markdown](links)
  const mdLinkStart = beforeContent.lastIndexOf('[');
  const mdLinkEnd = beforeContent.lastIndexOf(')');
  if (mdLinkStart > mdLinkEnd && mdLinkStart !== -1) {
    // Verify it's a link by checking for ]( pattern
    const linkPattern = beforeContent.substring(mdLinkStart);
    if (linkPattern.includes('](')) {
      return true;
    }
  }

  return false;
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Obtener todos los backlinks de un documento
 */
export function getBacklinks(
  targetDocument: DiscoveredDocument,
  allDocuments: DiscoveredDocument[],
  options: {
    includeUnlinked?: boolean;
    minConfidence?: number;
    maxUnlinked?: number;
  } = {}
): BacklinkData {
  const {
    includeUnlinked = true,
    minConfidence = 0.4,
    maxUnlinked = 20,
  } = options;

  // Linked mentions (siempre incluir)
  const linkedMentions = findLinkedMentions(targetDocument, allDocuments);

  // Unlinked mentions (opcional)
  let unlinkedMentions: UnlinkedMention[] = [];
  
  if (includeUnlinked) {
    unlinkedMentions = findUnlinkedMentions(
      targetDocument,
      allDocuments,
      minConfidence
    ).slice(0, maxUnlinked); // Limitar para performance
  }

  return {
    linkedMentions,
    unlinkedMentions,
    totalCount: linkedMentions.length + unlinkedMentions.length,
  };
}

/**
 * Generar texto de link para convertir unlinked mention en link
 */
export function generateLinkText(
  mention: UnlinkedMention,
  targetDocument: DiscoveredDocument,
  linkStyle: 'wikilink' | 'markdown' = 'wikilink'
): string {
  const targetTitle = targetDocument.metadata.title;
  const targetPath = targetDocument.path;

  if (linkStyle === 'wikilink') {
    // [[Title]]
    return `[[${targetTitle}]]`;
  } else {
    // [Title](path.md)
    return `[${targetTitle}](${targetPath})`;
  }
}

/**
 * Logging profesional
 */
export function logBacklinkStats(backlinkData: BacklinkData, targetTitle: string): void {
  console.log(`🔗 Backlinks for "${targetTitle}":`);
  console.log(`  → Linked: ${backlinkData.linkedMentions.length}`);
  console.log(`  → Unlinked: ${backlinkData.unlinkedMentions.length}`);
  console.log(`  → Total: ${backlinkData.totalCount}`);
}
