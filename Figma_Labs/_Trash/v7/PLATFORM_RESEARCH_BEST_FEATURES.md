# 🔬 PLATFORM RESEARCH - BEST FEATURES

**Propósito:** Investigación exhaustiva de las mejores features de plataformas líderes  
**Objetivo:** Implementar features competitivas de clase mundial  
**Fecha:** 25 de Diciembre, 2024  
**Versión:** 1.0.0

---

## 📋 ÍNDICE

1. [Metodología de Research](#metodología-de-research)
2. [Notion - Database & AI Features](#notion---database--ai-features)
3. [Obsidian - Graph & Linking](#obsidian---graph--linking)
4. [VSCode - Editor & Extensions](#vscode---editor--extensions)
5. [GitHub - Collaboration & Review](#github---collaboration--review)
6. [Google Docs - Real-time Collaboration](#google-docs---real-time-collaboration)
7. [Confluence - Knowledge Management](#confluence---knowledge-management)
8. [Roam Research - Bidirectional Links](#roam-research---bidirectional-links)
9. [Linear - Project Management](#linear---project-management)
10. [Coda - Interactive Docs](#coda---interactive-docs)
11. [Features Matrix](#features-matrix)
12. [Implementation Priorities](#implementation-priorities)

---

## 🎯 METODOLOGÍA DE RESEARCH

### Criterios de Evaluación

Evaluamos cada feature con estos criterios:

| Criterio | Descripción | Peso |
|----------|-------------|------|
| **Impact** | Cuánto mejora UX | 40% |
| **Feasibility** | Facilidad de implementación | 25% |
| **Differentiation** | Ventaja competitiva | 20% |
| **User Demand** | Qué tan pedido es | 15% |

### Scoring System

- 🟢 **Alta prioridad** (Score >80): Implementar AHORA
- 🟡 **Media prioridad** (Score 50-80): Implementar en 1-2 meses
- 🔴 **Baja prioridad** (Score <50): Implementar eventualmente

---

## 🗂️ NOTION - DATABASE & AI FEATURES

### 1. Database Views

**Score: 95/100** 🟢

**Qué es:**
- Convertir colecciones de documentos en "bases de datos"
- Múltiples vistas: Table, Board (Kanban), Calendar, Gallery, List, Timeline
- Filtros, sorts, grouping avanzados
- Propiedades custom por documento
- Formulas (sum, count, rollup, etc.)

**Por qué es killer:**
- ✅ Transforma documentación en herramienta de gestión
- ✅ Flexibilidad extrema (mismos datos, múltiples vistas)
- ✅ Diferenciador clave vs. competencia

**Cómo lo usan:**
```
Documentos = Rows en tabla
Metadata = Columns (propiedades)
Views = Diferentes formas de visualizar mismos datos

Ejemplo:
- Table View: Ver todos los roadmaps como spreadsheet
- Board View: Roadmaps organizados por status (draft, review, published)
- Calendar View: Roadmaps por fecha de publicación
```

**Implementation Plan:**

**Tech Stack:**
- **ag-grid** - Enterprise data grid (usado por Bloomberg, JP Morgan)
- **react-beautiful-dnd** - Drag & drop para Kanban
- **react-big-calendar** - Calendar view component
- **formula.js** - Excel-like formulas

**Estimated effort:** ~2,000 líneas, 1-2 semanas

```typescript
// Estructura propuesta
interface DatabaseView {
  id: string;
  type: 'table' | 'board' | 'calendar' | 'gallery' | 'list' | 'timeline';
  name: string;
  filters: Filter[];
  sorts: Sort[];
  groupBy?: string;
  properties: PropertyConfig[];
}

interface PropertyConfig {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multi-select' | 'date' | 'checkbox' | 'url' | 'email' | 'phone' | 'formula';
  formula?: string; // Para formulas
  options?: string[]; // Para select/multi-select
}
```

**Features específicas a implementar:**
- ✅ Table View con sorting, filtering, grouping
- ✅ Board View (Kanban) con drag & drop
- ✅ Calendar View con eventos de documentos
- ✅ Gallery View (cards con preview)
- ✅ List View (simple list con metadata)
- ✅ Filtros avanzados (AND/OR logic)
- ✅ Formulas: sum, count, rollup, if, etc.
- ✅ Export views to CSV/Excel

---

### 2. AI Assistant (Notion AI)

**Score: 88/100** 🟢

**Qué es:**
- AI integrado para generar, editar y resumir contenido
- Commands inline tipo `/ai generate outline`
- Auto-completion inteligente
- Traducción automática
- Mejora de escritura (grammar, clarity)

**Por qué es killer:**
- ✅ Reduce tiempo de escritura 50%+
- ✅ Mejora calidad de documentación
- ✅ Feature moderna que usuarios esperan

**Cómo lo usan:**
```
/ai - Abre AI command palette
  → Continue writing
  → Summarize
  → Improve writing
  → Fix spelling & grammar
  → Translate to [language]
  → Generate outline
  → Make longer
  → Make shorter
  → Change tone (professional, casual, etc.)
```

**Implementation Plan:**

**Tech Stack:**
- **OpenAI API** (GPT-4 Turbo) - Modelo principal
- **Vercel AI SDK** - Framework para streaming responses
- **@anthropic-ai/sdk** (Claude 3) - Alternative/backup

**Estimated effort:** ~1,500 líneas, 1 semana

```typescript
// Estructura propuesta
interface AICommand {
  id: string;
  name: string;
  description: string;
  icon: string;
  handler: (context: AIContext) => Promise<string>;
}

interface AIContext {
  selectedText: string;
  fullDocument: string;
  metadata: DocumentMetadata;
  language: string;
}

const AI_COMMANDS: AICommand[] = [
  {
    id: 'continue',
    name: 'Continue writing',
    description: 'Generate next paragraph',
    handler: async (ctx) => {
      const prompt = `Continue writing this document:\n\n${ctx.fullDocument}`;
      return await callOpenAI(prompt);
    },
  },
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Create a summary',
    handler: async (ctx) => {
      const prompt = `Summarize this in 2-3 sentences:\n\n${ctx.selectedText || ctx.fullDocument}`;
      return await callOpenAI(prompt);
    },
  },
  // ... más comandos
];
```

**Features específicas a implementar:**
- ✅ AI command palette con `/ai`
- ✅ Continue writing (next paragraph)
- ✅ Summarize (TL;DR)
- ✅ Improve writing (clarity, grammar)
- ✅ Translate to multiple languages
- ✅ Generate outline from content
- ✅ Make longer/shorter
- ✅ Change tone (professional/casual/friendly)
- ✅ Generate metadata automáticamente
- ✅ Suggest tags based on content
- ✅ Auto-categorization

---

### 3. Templates with Variables

**Score: 75/100** 🟡

**Qué es:**
- Templates con variables dinámicas
- Variables: `{{date}}`, `{{author}}`, `{{title}}`, custom
- Template gallery con categorías
- Duplicate template to create new doc

**Cómo lo usan:**
```markdown
---
title: {{title}}
author: {{author}}
date: {{date}}
project: {{project}}
---

# {{title}}

## Overview
{{overview}}

## Next Steps
- [ ] {{step1}}
- [ ] {{step2}}
```

**Implementation Plan:**

**Tech Stack:**
- **handlebars** - Template engine (más flexible que mustache)
- **date-fns** - Date formatting para {{date}}

**Estimated effort:** ~500 líneas, 3-4 días

**NOTA:** Custom Templates ya implementado en v8.0, solo falta agregar variables.

---

### 4. Inline Databases

**Score: 82/100** 🟢

**Qué es:**
- Insertar databases inline dentro de documentos
- Ejemplo: Tabla de features dentro de roadmap
- Editable in-place
- Linked to master database (changes sync)

**Implementation Plan:**

**Tech Stack:**
- **Prosemirror** o **TipTap** - Rich text editor con node system
- Custom node type: `database-embed`

**Estimated effort:** ~800 líneas, 1 semana

---

## 🕸️ OBSIDIAN - GRAPH & LINKING

### 1. Graph View

**Score: 92/100** 🟢

**Qué es:**
- Visualización de red de todos los documentos
- Nodos = documentos
- Enlaces = links entre documentos ([[link]] o [markdown](link))
- Interactive (click node → abre documento)
- Zoom, pan, drag nodes
- Filters (por tag, folder, etc.)
- Highlighting de clusters
- Orphaned docs detection

**Por qué es killer:**
- ✅ Visualiza estructura de conocimiento
- ✅ Descubre conexiones inesperadas
- ✅ Identifica gaps (orphaned docs, missing links)
- ✅ "Wow factor" impresionante

**Cómo lo usan:**
```
Graph muestra:
- Central nodes (documentos muy linkead os)
- Clusters (grupos de docs relacionados)
- Orphans (docs sin links)

Interacciones:
- Hover node → highlight connections
- Click node → open document
- Right-click → menu (focus, expand, etc.)
- Filters sidebar (tags, folders, orphans only)
```

**Implementation Plan:**

**Tech Stack:**
- **react-force-graph** - Librería de grafos con physics simulation
  * Usa D3.js bajo el capó
  * Soporta 2D y 3D
  * Performance optimizada (>10,000 nodos)
- **d3-force** - Force-directed graph layout
- **@react-three/fiber** - Para 3D mode (opcional)

**Estimated effort:** ~1,200 líneas, 1 semana

```typescript
// Estructura propuesta
interface GraphNode {
  id: string;
  name: string;
  val: number; // Node size (basado en # de links)
  color: string; // Por categoría
  metadata: DocumentMetadata;
}

interface GraphLink {
  source: string;
  target: string;
  type: 'wikilink' | 'markdown' | 'backlink';
}

// Config
const GRAPH_CONFIG = {
  nodeSize: (node) => Math.sqrt(node.val) * 4,
  nodeColor: (node) => CATEGORY_COLORS[node.metadata.category],
  linkDistance: 100,
  linkStrength: 0.5,
  charge: -300, // Repulsion entre nodos
};
```

**Features específicas a implementar:**
- ✅ 2D force-directed graph
- ✅ Node sizing por # de links
- ✅ Color coding por categoría/tag
- ✅ Interactive (hover, click, drag)
- ✅ Zoom & pan
- ✅ Filter sidebar:
  * Por tag
  * Por categoría
  * Por folder
  * Orphans only
  * Search by name
- ✅ Highlight clusters automáticamente
- ✅ Orphaned docs detection con badge
- ✅ Link type indicators (wikilink vs markdown)
- ✅ Minimap para navegación
- ✅ Export graph como imagen (PNG/SVG)
- 🔄 3D mode (fase 2 - opcional)

---

### 2. Backlinks Panel

**Score: 85/100** 🟢

**Qué es:**
- Panel lateral mostrando qué documentos linkan al actual
- Bidirectional linking automático
- Unlinked mentions (documentos que mencionan término pero no linkan)
- Click backlink → abre documento

**Por qué es killer:**
- ✅ Navegar conocimiento bidireccionalmentente
- ✅ Descubrir relaciones ocultas
- ✅ Context switching rápido

**Cómo lo usan:**
```
Document: "ROADMAP.md"

Backlinks Panel:
┌─────────────────────────────┐
│ 📎 Linked Mentions (5)      │
├─────────────────────────────┤
│ → SUCCESS_LOG.md            │
│   "...ver ROADMAP para..."  │
│                             │
│ → GUIDE.md                  │
│   "...según el [[ROADMAP]]" │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 🔗 Unlinked Mentions (3)    │
├─────────────────────────────┤
│ → NOTES.md                  │
│   "...en el roadmap..."     │
│   [Link it]                 │
└─────────────────────────────┘
```

**Implementation Plan:**

**Tech Stack:**
- **Regex** para detectar `[[wikilinks]]` y `[markdown](links)`
- **Fuse.js** para fuzzy matching en unlinked mentions
- **mark.js** para highlighting de mentions

**Estimated effort:** ~800 líneas, 5-6 días

```typescript
// Servicio de backlinks
class BacklinkService {
  /**
   * Encontrar todos los documentos que linkan a un documento
   */
  findBacklinks(targetDocumentPath: string): Backlink[] {
    const backlinks: Backlink[] = [];
    
    for (const doc of allDocuments) {
      // Buscar [[wikilinks]]
      const wikilinks = doc.content.match(/\[\[([^\]]+)\]\]/g) || [];
      
      // Buscar [markdown](links)
      const mdlinks = doc.content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
      
      // Check si apuntan al target
      for (const link of [...wikilinks, ...mdlinks]) {
        if (resolveLink(link) === targetDocumentPath) {
          backlinks.push({
            sourceDocument: doc,
            linkText: extractLinkText(link),
            context: extractContext(doc.content, link),
          });
        }
      }
    }
    
    return backlinks;
  }
  
  /**
   * Encontrar unlinked mentions (menciones sin link)
   */
  findUnlinkedMentions(targetDocument: Document): UnlinkedMention[] {
    const titleWords = targetDocument.metadata.title.toLowerCase().split(' ');
    const mentions: UnlinkedMention[] = [];
    
    for (const doc of allDocuments) {
      if (doc.path === targetDocument.path) continue; // Skip self
      
      // Buscar menciones del título en contenido
      const lowerContent = doc.content.toLowerCase();
      
      for (const word of titleWords) {
        if (word.length < 4) continue; // Skip palabras cortas
        
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = doc.content.match(regex);
        
        if (matches && matches.length > 0) {
          mentions.push({
            sourceDocument: doc,
            mentionedTerm: word,
            context: extractContext(doc.content, matches[0]),
            confidence: calculateConfidence(word, titleWords),
          });
        }
      }
    }
    
    return mentions;
  }
}
```

**Features específicas a implementar:**
- ✅ Backlinks panel sidebar
- ✅ Linked mentions con preview de contexto
- ✅ Unlinked mentions con fuzzy matching
- ✅ "Link it" button para convertir mention → link
- ✅ Count badges (5 linked, 3 unlinked)
- ✅ Click mention → jump to source document
- ✅ Highlight mention en source
- ✅ Filter backlinks (linked only, unlinked only, all)
- ✅ Sort by document name, date, relevance

---

### 3. Canvas Mode

**Score: 78/100** 🟡

**Qué es:**
- Infinite canvas para organizar documentos visualmente
- Drag & drop documentos
- Connect con flechas
- Notas inline (stickies)
- Grupos/folders visuales
- Zoom infinito

**Por qué es interesante:**
- ✅ Brainstorming visual
- ✅ Organización espacial de ideas
- ✅ Alternativa a estructura jerárquica

**Tech Stack:**
- **react-konva** - Canvas rendering (alternativa: fabric.js)
- **excalidraw** - Open source whiteboard (puede ser base)

**Estimated effort:** ~2,000 líneas, 2 semanas

**NOTA:** Prioridad media - implementar después de Graph View

---

### 4. Daily Notes

**Score: 70/100** 🟡

**Qué es:**
- Auto-crear nota diaria con fecha
- Template para daily notes
- Calendar view de daily notes
- Quick capture con hotkey

**Tech Stack:**
- Extensión de sistema de templates existente
- Calendar component (react-big-calendar)

**Estimated effort:** ~400 líneas, 3-4 días

---

## 💻 VSCODE - EDITOR & EXTENSIONS

### 1. Command Palette Avanzado

**Score: 90/100** 🟢

**Qué es:**
- Fuzzy search de TODOS los comandos disponibles
- Recent commands prioritized
- Keyboard shortcuts visible
- Categories (File, Edit, Selection, View, etc.)
- Extensible (plugins pueden agregar comandos)

**NOTA:** Ya implementado en v6.0 con `cmdk`, solo falta expandir comandos.

**Comandos a agregar:**
```typescript
const COMMANDS = [
  // File
  { id: 'file.new', name: 'New Document', shortcut: 'Cmd+N' },
  { id: 'file.open', name: 'Open Document', shortcut: 'Cmd+O' },
  { id: 'file.save', name: 'Save Document', shortcut: 'Cmd+S' },
  { id: 'file.export', name: 'Export as...', shortcut: '' },
  
  // Edit
  { id: 'edit.undo', name: 'Undo', shortcut: 'Cmd+Z' },
  { id: 'edit.redo', name: 'Redo', shortcut: 'Cmd+Shift+Z' },
  { id: 'edit.find', name: 'Find', shortcut: 'Cmd+F' },
  { id: 'edit.replace', name: 'Find and Replace', shortcut: 'Cmd+H' },
  
  // View
  { id: 'view.sidebar', name: 'Toggle Sidebar', shortcut: 'Cmd+B' },
  { id: 'view.fullscreen', name: 'Toggle Fullscreen', shortcut: 'Cmd+Shift+F' },
  { id: 'view.zen', name: 'Zen Mode', shortcut: 'Cmd+K Z' },
  
  // Tools
  { id: 'tools.graph', name: 'Open Graph View', shortcut: 'Cmd+G' },
  { id: 'tools.backlinks', name: 'Show Backlinks', shortcut: 'Cmd+L' },
  
  // ... más
];
```

---

### 2. Multi-cursor Editing

**Score: 72/100** 🟡

**Qué es:**
- Editar múltiples lugares simultáneamente
- Alt+Click para agregar cursor
- Cmd+D para seleccionar siguiente ocurrencia
- Column selection con Alt+Shift+Drag

**Tech Stack:**
- Requiere editor avanzado (CodeMirror 6 o Monaco Editor)

**Estimated effort:** ~1,000 líneas, 1 semana

**NOTA:** Requiere migrar de react-markdown a editor completo. Prioridad media.

---

### 3. Integrated Terminal

**Score: 60/100** 🔴

**Qué es:**
- Terminal integrado dentro de la app
- Ejecutar scripts, git commands, etc.
- Split terminal

**NOTA:** Baja prioridad para app de documentación. Más útil en IDE.

---

## 🐙 GITHUB - COLLABORATION & REVIEW

### 1. Pull Request Style Review

**Score: 88/100** 🟢

**Qué es:**
- Proponer cambios a documento sin modificar original
- Reviewers pueden comentar line-by-line
- Approve/Request changes
- Merge cuando aprobado
- Diff viewer

**Por qué es killer:**
- ✅ Colaboración sin sobrescribir
- ✅ Review process formal
- ✅ Historial de decisiones

**Cómo lo usan:**
```
User A: Propone cambio a ROADMAP.md
  → Creates "PR #42: Add Graph View to roadmap"
  
User B (reviewer): Ve diff
  → Line 145: "¿Por qué 2 semanas? Parece mucho"
  → Requests changes
  
User A: Responde y ajusta
  → "Reducido a 1 semana basado en research"
  
User B: Aprueba
  → PR merged
  
ROADMAP.md actualizado con cambios aprobados
```

**Implementation Plan:**

**Tech Stack:**
- **diff-match-patch** (Google) - Diff algorithm
- **react-diff-view** - Diff UI component
- Existing MetadataVersionDiff component (ya implementado)

**Estimated effort:** ~1,500 líneas, 1-2 semanas

```typescript
// Estructura
interface PullRequest {
  id: string;
  title: string;
  description: string;
  author: User;
  targetDocument: string;
  status: 'open' | 'merged' | 'closed';
  changes: Diff[];
  comments: Comment[];
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: string;
  reviewer: User;
  status: 'approved' | 'changes_requested' | 'commented';
  body: string;
  submittedAt: string;
}

interface Comment {
  id: string;
  author: User;
  body: string;
  line: number; // Línea comentada
  path: string; // Archivo
  createdAt: string;
  replies: Comment[];
}
```

---

### 2. GitHub Actions Style Automation

**Score: 75/100** 🟡

**Qué es:**
- Workflows automáticos triggered por eventos
- Ejemplo: Auto-generate TOC al actualizar doc
- Auto-format markdown
- Auto-deploy docs a GitHub Pages
- Notify Slack cuando se publica roadmap

**Tech Stack:**
- **Event-driven architecture**
- **Webhook system**

**Estimated effort:** ~800 líneas, 1 semana

---

### 3. Issues & Discussions

**Score: 82/100** 🟢

**Qué es:**
- Issues: Track bugs, tareas, features
- Discussions: Q&A, ideas, announcements
- Labels, assignees, milestones
- Link issues to documents

**Implementation Plan:**

**Tech Stack:**
- Similar a PR system
- **react-markdown** para body
- **@dnd-kit** para Kanban board

**Estimated effort:** ~1,200 líneas, 1-2 semanas

---

## 📄 GOOGLE DOCS - REAL-TIME COLLABORATION

### 1. Real-time Collaborative Editing

**Score: 95/100** 🟢

**Qué es:**
- Múltiples usuarios editan simultáneamente
- Ver cursors de otros usuarios en tiempo real
- Selection highlights
- Changes sync instantáneamente
- Conflict resolution automático

**Por qué es killer:**
- ✅ El #1 feature de Google Docs
- ✅ Diferenciador clave
- ✅ Fundamental para equipos

**Cómo lo usan:**
```
User A en New York edita párrafo 1
User B en London edita párrafo 3
  → Ambos ven cambios del otro en tiempo real
  → No conflicts (diferentes párrafos)

User A cursor position: Line 10, Column 5
  → User B ve cursor de User A con label "Alice"
  
User A selecciona líneas 10-15
  → User B ve highlight azul con "Alice is selecting"
```

**Implementation Plan:**

**Tech Stack:**
- **Yjs** - CRDT (Conflict-free Replicated Data Type) library
  * Gold standard para collaborative editing
  * Usado por: Figma, Linear, Pitch
  * Automatic conflict resolution
  * Offline-first architecture
- **y-websocket** - WebSocket provider para Yjs
- **Socket.io** - WebSocket server
- **@tiptap/extension-collaboration** - Tiptap + Yjs integration

**Estimated effort:** ~2,500 líneas, 2-3 semanas

```typescript
// Setup Yjs
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// Documento compartido
const ydoc = new Y.Doc();

// Conectar a WebSocket server
const provider = new WebsocketProvider(
  'ws://localhost:1234', // WebSocket server
  'document-room-123',   // Room ID (por documento)
  ydoc
);

// Text type para contenido
const ytext = ydoc.getText('content');

// Awareness para cursors
const awareness = provider.awareness;
awareness.setLocalState({
  user: {
    name: 'Alice',
    color: '#FF6B6B',
    cursor: { line: 10, column: 5 },
  },
});

// Escuchar cambios
ytext.observe((event) => {
  // Actualizar editor con cambios remotos
  console.log('Changes:', event.changes.delta);
});
```

**Features específicas a implementar:**
- ✅ Real-time text synchronization
- ✅ User cursors con nombres
- ✅ Selection highlights
- ✅ Presence indicators (quién está viendo)
- ✅ Avatar stack ("3 people viewing")
- ✅ Conflict resolution automático (CRDT)
- ✅ Offline mode con sync cuando reconnect
- ✅ History preservado (Yjs tiene undo/redo built-in)
- ✅ Performance: >100 concurrent users por documento

---

### 2. Suggestions Mode

**Score: 85/100** 🟢

**Qué es:**
- Editar documento en "suggestion mode"
- Cambios aparecen como sugerencias (no finales)
- Owner puede accept/reject suggestions
- Similar a "Track Changes" en Word

**Cómo lo usan:**
```
User A (owner): Escribe "The roadmap includes 5 phases"

User B (editor): Suggestion mode
  → Sugiere: "The roadmap includes 6 phases" (cambio de 5 → 6)
  
Owner ve:
  "The roadmap includes [5→6] phases"
  [Accept] [Reject]
  
Owner acepta → cambio aplicado
Owner rechaza → reverted
```

**Tech Stack:**
- **Prosemirror** track-changes plugin
- **Tiptap** + extension

**Estimated effort:** ~1,000 líneas, 1 semana

---

### 3. Comments System

**Score: 90/100** 🟢

**Qué es:**
- Comentarios inline en documento
- Thread de discusión
- @ menciones
- Resolve/Reopen comments
- Notifications

**Cómo lo usan:**
```
User A selecciona texto: "implement in 2 weeks"
  → Add comment: "@bob ¿Es realista 2 semanas?"
  
User B (Bob) recibe notificación
  → Responde: "Sí, si priorizamos esto"
  
User A:
  → Reply: "Ok, vamos!"
  → Resolve comment
  
Comment archivado pero visible en history
```

**Implementation Plan:**

**Tech Stack:**
- **Prosemirror comments plugin**
- **@tiptap/extension-collaboration-cursor** para menciones
- **WebSocket** para notificaciones en tiempo real

**Estimated effort:** ~1,500 líneas, 1-2 semanas

```typescript
// Estructura
interface Comment {
  id: string;
  author: User;
  text: string;
  position: {
    from: number; // Character position start
    to: number;   // Character position end
  };
  thread: CommentReply[];
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: User;
}

interface CommentReply {
  id: string;
  author: User;
  text: string;
  mentions: User[];
  createdAt: string;
}
```

---

## 📚 CONFLUENCE - KNOWLEDGE MANAGEMENT

### 1. Page Tree Navigation

**Score: 80/100** 🟢

**Qué es:**
- Sidebar tree de todos los documentos
- Jerárquico (parent/child pages)
- Drag & drop para reorganizar
- Expand/collapse folders
- Breadcrumbs en header

**Implementation Plan:**

**Tech Stack:**
- **react-arborist** - Tree view component (mejor que react-dnd-tree)
- **@dnd-kit** - Drag & drop

**Estimated effort:** ~800 líneas, 5-6 días

---

### 2. Templates Library

**Score: 75/100** 🟡

**Qué es:**
- Gallery de templates pre-built
- Categorías: Meeting Notes, Project Plan, Roadmap, etc.
- Preview antes de usar
- Share templates entre espacios

**NOTA:** Custom Templates ya implementado en v8.0. Solo falta template gallery y sharing.

---

### 3. Page Labels & Smart Filters

**Score: 78/100** 🟡

**Qué es:**
- Tags visuales en páginas
- Smart searches con labels
- Auto-generate collections por label
- Ejemplo: Ver todas las páginas con label "roadmap"

**NOTA:** Tags ya implementados. Falta smart collections y UI mejorada.

---

## 🔗 ROAM RESEARCH - BIDIRECTIONAL LINKS

### 1. Block References

**Score: 83/100** 🟢

**Qué es:**
- Referenciar bloques individuales de otros documentos
- Syntax: `((block-id))` o `[[document#heading]]`
- Embed block en otro documento
- Changes sync bidireccionally

**Por qué es interesante:**
- ✅ Granularidad a nivel de párrafo/heading
- ✅ Reusabilidad de contenido
- ✅ Single source of truth

**Cómo lo usan:**
```markdown
# Document A: Features.md

## Graph View
- Visualiza connections entre docs
- Interactive zoom & pan
- ^block-graph-view

# Document B: Roadmap.md

## Fase 10: Advanced Features
Vamos a implementar:
- ((block-graph-view))  ← Embedded from Features.md
```

**Tech Stack:**
- Custom markdown syntax parser
- **remark** plugin custom

**Estimated effort:** ~600 líneas, 5-6 días

---

### 2. Daily Notes with Auto-linking

**Score: 72/100** 🟡

**Qué es:**
- Auto-crear nota diaria
- Auto-link mentions de otras páginas
- Calendar view
- Journal mode

**NOTA:** Similar a Obsidian Daily Notes. Implementar junto.

---

## 🎯 LINEAR - PROJECT MANAGEMENT

### 1. Keyboard-first Design

**Score: 88/100** 🟢

**Qué es:**
- TODOS los actions tienen keyboard shortcut
- Command palette para descubrir shortcuts
- Minimal mouse usage required
- Vim-style navigation (j/k para up/down)

**NOTA:** Keyboard shortcuts ya iniciado en v7.5. Expandir para cubrir TODO.

**Shortcuts adicionales a implementar:**
```
Navigation:
- j/k - Up/Down en listas
- h/l - Collapse/Expand sidebar
- g+d - Go to Dashboard
- g+g - Go to top
- G - Go to bottom

Selection:
- x - Select/deselect item
- a - Select all
- Shift+j/k - Multi-select

Actions:
- c - Create new
- e - Edit
- d - Delete
- / - Focus search
- ? - Show shortcuts
```

---

### 2. Command Menu con Actions

**Score: 86/100** 🟢

**Qué es:**
- Command palette type Cmd+K
- Pero con ACTIONS contextuales
- Ejemplo: Con documento seleccionado:
  * "Archive document"
  * "Duplicate document"
  * "Move to folder"
  * etc.

**Implementation Plan:**

**Tech Stack:**
- Extender `cmdk` existente
- Context-aware commands

**Estimated effort:** ~400 líneas, 3-4 días

```typescript
// Comandos contextuales
const getContextualCommands = (context: AppContext): Command[] => {
  const commands: Command[] = [];
  
  // Si hay documento seleccionado
  if (context.selectedDocument) {
    commands.push(
      { id: 'archive', name: 'Archive Document', icon: Archive },
      { id: 'duplicate', name: 'Duplicate Document', icon: Copy },
      { id: 'export', name: 'Export as PDF', icon: Download },
      // ...
    );
  }
  
  // Si hay texto seleccionado
  if (context.selectedText) {
    commands.push(
      { id: 'ai-improve', name: 'AI: Improve Writing', icon: Sparkles },
      { id: 'ai-summarize', name: 'AI: Summarize', icon: FileText },
      // ...
    );
  }
  
  return commands;
};
```

---

### 3. Cycle/Sprint Planning

**Score: 70/100** 🟡

**Qué es:**
- Organizar trabajo en cycles (sprints de 1-2 semanas)
- Roadmap visual de cycles
- Auto-move issues al siguiente cycle

**NOTA:** Más útil para project management que documentación. Baja prioridad.

---

## 📊 CODA - INTERACTIVE DOCS

### 1. Interactive Tables

**Score: 80/100** 🟢

**Qué es:**
- Tablas con formulas tipo Excel
- Buttons dentro de celdas
- Dropdown selectors
- Progress bars
- Checkboxes interactivos

**Ejemplo:**
```
| Task          | Status   | Progress | Action  |
|---------------|----------|----------|---------|
| Graph View    | In Progress | [====    ] 75% | [Complete] |
| Backlinks     | Todo     | [        ]  0% | [Start]    |
```

**Tech Stack:**
- **ag-grid** con custom cell renderers
- **react-select** para dropdowns
- Custom button cells

**Estimated effort:** ~1,000 líneas, 1 semana

---

### 2. Embeddable Docs

**Score: 75/100** 🟡

**Qué es:**
- Documentos embeddables en otros sitios
- iframe con API
- Public/private toggle
- Customizable theme

**Tech Stack:**
- **iframe-resizer** para responsive embeds
- Public API endpoint

**Estimated effort:** ~600 líneas, 5 días

---

## 📊 FEATURES MATRIX

### Comparación por Plataforma

| Feature | Notion | Obsidian | VSCode | GitHub | Google Docs | Score | Prioridad |
|---------|--------|----------|--------|--------|-------------|-------|-----------|
| **Database Views** | ✅ | ❌ | ❌ | ❌ | ❌ | 95 | 🟢 |
| **AI Assistant** | ✅ | ❌ | ✅ | ❌ | ❌ | 88 | 🟢 |
| **Graph View** | ❌ | ✅ | ❌ | ❌ | ❌ | 92 | 🟢 |
| **Backlinks** | ✅ | ✅ | ❌ | ❌ | ❌ | 85 | 🟢 |
| **Real-time Collab** | ✅ | ❌ | ✅ | ❌ | ✅ | 95 | 🟢 |
| **Comments** | ✅ | ❌ | ❌ | ✅ | ✅ | 90 | 🟢 |
| **PR/Review** | ❌ | ❌ | ❌ | ✅ | ✅ | 88 | 🟢 |
| **Command Palette** | ✅ | ✅ | ✅ | ✅ | ❌ | 90 | ✅ Implemented |
| **Keyboard Shortcuts** | ✅ | ✅ | ✅ | ✅ | ✅ | 88 | ✅ Implemented |
| **Canvas Mode** | ❌ | ✅ | ❌ | ❌ | ❌ | 78 | 🟡 |
| **Templates** | ✅ | ✅ | ✅ | ❌ | ✅ | 75 | ✅ Implemented |
| **Block References** | ✅ | ❌ | ❌ | ❌ | ❌ | 83 | 🟢 |
| **Interactive Tables** | ✅ | ❌ | ❌ | ❌ | ✅ | 80 | 🟢 |

---

## 🎯 IMPLEMENTATION PRIORITIES

### Fase 10 (PRÓXIMA) - High Impact Features

**Duración estimada:** 2-3 meses  
**Esfuerzo total:** ~10,000 líneas

#### 10.1 Graph View (1-2 semanas)
- **Priority:** 🟢 Alta
- **Score:** 92/100
- **Tech:** react-force-graph, d3-force
- **Lines:** ~1,200

**Justificación:**
- Visual "wow factor"
- Diferenciador clave vs. competencia
- Descubre conexiones ocultas
- Relativamente rápido de implementar

---

#### 10.2 Backlinks Panel (1 semana)
- **Priority:** 🟢 Alta
- **Score:** 85/100
- **Tech:** Regex, Fuse.js, mark.js
- **Lines:** ~800

**Justificación:**
- Complementa Graph View perfecto
- Bidirectional navigation
- Fácil de implementar (parsing de links)
- Alto impacto en UX

---

#### 10.3 Real-time Collaboration (2-3 semanas)
- **Priority:** 🟢 Alta
- **Score:** 95/100
- **Tech:** Yjs, Socket.io, WebSocket
- **Lines:** ~2,500

**Justificación:**
- #1 feature request esperado
- Diferenciador masivo
- Fundamental para equipos
- Complejo pero libraries robustas disponibles (Yjs)

---

#### 10.4 Comments System (1-2 semanas)
- **Priority:** 🟢 Alta
- **Score:** 90/100
- **Tech:** Prosemirror, WebSocket
- **Lines:** ~1,500

**Justificación:**
- Colaboración asíncrona
- Complementa real-time editing
- @ menciones útiles
- Resolve/reopen workflow probado

---

#### 10.5 Database Views (2 semanas)
- **Priority:** 🟢 Alta
- **Score:** 95/100
- **Tech:** ag-grid, react-beautiful-dnd, react-big-calendar
- **Lines:** ~2,000

**Justificación:**
- Transforma docs en herramienta de gestión
- Múltiples vistas útiles (table, board, calendar)
- Diferenciador clave vs. Obsidian
- Formulas agregan poder

---

#### 10.6 AI Assistant (1 semana)
- **Priority:** 🟢 Alta
- **Score:** 88/100
- **Tech:** OpenAI API, Vercel AI SDK
- **Lines:** ~1,500

**Justificación:**
- Moderna y esperada
- Reduce tiempo de escritura
- Auto-metadata muy útil
- API sencilla de integrar

---

### Fase 11 (Medium Priority) - Polish & Advanced

**Duración estimada:** 1-2 meses

#### 11.1 PR/Review System
- **Score:** 88/100
- **Lines:** ~1,500

#### 11.2 Block References
- **Score:** 83/100
- **Lines:** ~600

#### 11.3 Interactive Tables
- **Score:** 80/100
- **Lines:** ~1,000

#### 11.4 Canvas Mode
- **Score:** 78/100
- **Lines:** ~2,000

---

### Fase 12 (Lower Priority) - Nice to Have

**Duración estimada:** 1 mes

#### 12.1 Template Variables
- **Score:** 75/100
- **Lines:** ~500

#### 12.2 Suggestions Mode
- **Score:** 85/100
- **Lines:** ~1,000

#### 12.3 Multi-cursor Editing
- **Score:** 72/100
- **Lines:** ~1,000

---

## 📈 ROADMAP VISUAL

```
┌──────────────────────────────────────────────────────────┐
│ FASE 10: HIGH IMPACT FEATURES (2-3 meses)                │
├──────────────────────────────────────────────────────────┤
│ ✅ Metadata History       [DONE - v8.0]                  │
│ ✅ Custom Templates        [DONE - v8.0]                  │
│ ✅ Undo/Redo              [DONE - v8.0]                  │
│                                                          │
│ 🔄 Graph View             [IN PROGRESS]                  │
│ ⏳ Backlinks Panel        [NEXT]                         │
│ ⏳ Real-time Collab       [AFTER]                        │
│ ⏳ Comments System        [AFTER]                        │
│ ⏳ Database Views         [AFTER]                        │
│ ⏳ AI Assistant           [AFTER]                        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ FASE 11: POLISH & ADVANCED (1-2 meses)                   │
├──────────────────────────────────────────────────────────┤
│ ⏳ PR/Review System                                      │
│ ⏳ Block References                                       │
│ ⏳ Interactive Tables                                     │
│ ⏳ Canvas Mode                                            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ FASE 12: NICE TO HAVE (1 mes)                            │
├──────────────────────────────────────────────────────────┤
│ ⏳ Template Variables                                     │
│ ⏳ Suggestions Mode                                       │
│ ⏳ Multi-cursor Editing                                   │
└──────────────────────────────────────────────────────────┘
```

---

## 🎓 CONCLUSIÓN

**Total features investigadas:** 30+  
**High priority (Score >80):** 12 features  
**Already implemented:** 3 features (Keyboard Shortcuts, Command Palette, Custom Templates)  
**To implement (Fase 10):** 6 features  

**Estimated total effort Fase 10:** ~10,000 líneas, 2-3 meses

**Competitive advantage después de Fase 10:**
- ✅ Graph View (Obsidian-level)
- ✅ Real-time Collab (Google Docs-level)
- ✅ Database Views (Notion-level)
- ✅ AI Assistant (Notion AI-level)
- ✅ Comments (GitHub-level)
- ✅ Backlinks (Roam-level)

**Resultado:** Sistema **WORLD-CLASS** que compite con los mejores.

---

**Última actualización:** 25 de Diciembre, 2024  
**Autor:** Sistema Autopoiético Platzi Clone  
**Versión:** 1.0.0  
**Status:** ✅ RESEARCH COMPLETADO
