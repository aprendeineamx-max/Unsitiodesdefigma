import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import { 
  FileText, 
  Download, 
  Search, 
  List, 
  ZoomIn, 
  ZoomOut, 
  Copy, 
  Check, 
  X,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
  Replace,
  CaseSensitive,
  WholeWord,
  Regex
} from 'lucide-react';
import { getDocumentContent } from '../data/markdownDocs';
import GithubSlugger from 'github-slugger';

interface MarkdownViewerProps {
  filePath?: string;
  content?: string;
  title?: string;
  showToc?: boolean;
  enableSearch?: boolean;
  onClose?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
  children?: TocItem[];
}

export function MarkdownViewer({
  filePath,
  content: initialContent,
  title,
  showToc = true,
  enableSearch = true,
  onClose,
  isFullscreen = false,
  onToggleFullscreen
}: MarkdownViewerProps) {
  // Estados básicos
  const [content, setContent] = useState<string>(initialContent || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const [showTableOfContents, setShowTableOfContents] = useState(showToc);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [scrollPosition, setScrollPosition] = useState<'top' | 'middle' | 'bottom'>('top');
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  
  // Estados de búsqueda profesional tipo VS Code
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [searchResults, setSearchResults] = useState<number>(0);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [highlightedContent, setHighlightedContent] = useState<string>('');
  
  const contentRef = useRef<HTMLDivElement>(null);
  const markdownContentRef = useRef<HTMLDivElement>(null);

  // Load markdown file if filePath is provided
  useEffect(() => {
    if (filePath && !initialContent) {
      loadMarkdownFile(filePath);
    }
  }, [filePath, initialContent]);

  // Extract table of contents from markdown
  useEffect(() => {
    if (content) {
      extractTableOfContents(content);
    }
  }, [content]);

  // ✅ PROCESAR CONTENIDO CON HIGHLIGHTS ANTES DE RENDERIZAR
  useEffect(() => {
    if (searchTerm.trim()) {
      const processedContent = highlightSearchTermInMarkdown(content, searchTerm, caseSensitive, wholeWord, useRegex);
      setHighlightedContent(processedContent.content);
      setSearchResults(processedContent.matchCount);
      setCurrentSearchIndex(processedContent.matchCount > 0 ? 0 : -1);
    } else {
      setHighlightedContent(content);
      setSearchResults(0);
      setCurrentSearchIndex(-1);
    }
  }, [content, searchTerm, caseSensitive, wholeWord, useRegex]);

  // ✅ SCROLL TO ACTIVE RESULT
  useEffect(() => {
    if (currentSearchIndex >= 0 && searchResults > 0) {
      scrollToActiveHighlight();
    }
  }, [currentSearchIndex]);

  // Monitor scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      
      if (scrollPercentage < 10) {
        setScrollPosition('top');
      } else if (scrollPercentage > 90) {
        setScrollPosition('bottom');
      } else {
        setScrollPosition('middle');
      }

      // Update active heading
      updateActiveHeading();
    };

    const container = contentRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial call
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [toc]);

  const loadMarkdownFile = async (path: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // First, try to get inline content based on file path
      const docId = path.replace('/','').replace('.md', '').toLowerCase().replace(/_/g, '-');
      const inlineContent = getDocumentContent(docId);
      
      if (inlineContent) {
        setContent(inlineContent);
        setLoading(false);
        return;
      }
      
      // 🚀 v4.0: Intentar cargar usando import.meta.glob
      // Los archivos .md ahora se cargan usando importación dinámica de Vite
      try {
        const modules = import.meta.glob<string>('/**.md', { query: '?raw', eager: false });
        const guidelinesModules = import.meta.glob<string>('/guidelines/**.md', { query: '?raw', eager: false });
        const allModules = { ...modules, ...guidelinesModules };
        
        const importFn = allModules[path];
        if (importFn) {
          const module = await importFn();
          const fileContent = typeof module === 'string' ? module : module.default;
          setContent(fileContent);
          setLoading(false);
          return;
        }
      } catch (viteError) {
        console.warn('Error cargando con import.meta.glob:', viteError);
      }
      
      // Fallback: try to fetch the file (solo funcionará para archivos en /public/)
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`No se pudo cargar el documento. El archivo no está disponible actualmente.`);
      }
      const text = await response.text();
      setContent(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el documento. Este documento aún no está disponible en el visor.');
      console.error('Error loading markdown:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractTableOfContents = (markdownContent: string) => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const flatHeadings: Array<{ id: string; text: string; level: number }> = [];
    let match;

    while ((match = headingRegex.exec(markdownContent)) !== null) {
      const level = match[1].length;
      let text = match[2].trim();
      
      // Store original text for display
      const displayText = text
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
        .replace(/[*_~`]/g, '') // Remove emphasis
        .replace(/[📋🎯👥📍🎓✅❌🔴🟠🟡🟢⚫]/g, '').trim(); // Remove emojis
      
      // Generate ID EXACTLY as rehype-slug does using github-slugger
      const slugger = new GithubSlugger();
      const id = slugger.slug(text);
      
      flatHeadings.push({ id, text: displayText, level });
    }

    // Build hierarchical structure
    const hierarchical = buildHierarchy(flatHeadings);
    setToc(hierarchical);
  };

  const buildHierarchy = (flatHeadings: Array<{ id: string; text: string; level: number }>): TocItem[] => {
    const result: TocItem[] = [];
    const stack: TocItem[] = [];

    flatHeadings.forEach(heading => {
      const item: TocItem = {
        id: heading.id,
        text: heading.text,
        level: heading.level,
        children: []
      };

      // Find the correct parent
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        result.push(item);
      } else {
        const parent = stack[stack.length - 1];
        if (!parent.children) parent.children = [];
        parent.children.push(item);
      }

      stack.push(item);
    });

    return result;
  };

  const updateActiveHeading = () => {
    if (!contentRef.current) return;

    const headings = Array.from(contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const containerTop = contentRef.current.scrollTop;
    const offset = 100;

    let activeId = '';
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i] as HTMLElement;
      const headingTop = heading.offsetTop - contentRef.current.offsetTop;
      
      if (headingTop <= containerTop + offset) {
        activeId = heading.id;
        break;
      }
    }

    setActiveHeadingId(activeId);
  };

  const scrollToHeading = (id: string) => {
    if (!contentRef.current) return;
    
    const element = contentRef.current.querySelector(`#${CSS.escape(id)}`) as HTMLElement;
    
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
      
      setTimeout(() => {
        if (contentRef.current) {
          const currentScroll = contentRef.current.scrollTop;
          contentRef.current.scrollTop = currentScroll - 100;
        }
      }, 100);
      
      setTimeout(() => {
        element.classList.add('highlight-flash');
        setTimeout(() => {
          element.classList.remove('highlight-flash');
        }, 2000);
      }, 500);
    }
  };

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // ✅ NUEVA FUNCIÓN: PROCESAR MARKDOWN CON HIGHLIGHTS
  const highlightSearchTermInMarkdown = (
    markdown: string,
    term: string,
    caseSensitive: boolean,
    wholeWord: boolean,
    useRegex: boolean
  ): { content: string; matchCount: number } => {
    if (!term.trim()) {
      return { content: markdown, matchCount: 0 };
    }

    let matchCount = 0;
    let processedContent = markdown;

    try {
      let searchPattern: RegExp;

      if (useRegex) {
        // Modo Regex
        const flags = caseSensitive ? 'g' : 'gi';
        searchPattern = new RegExp(term, flags);
      } else if (wholeWord) {
        // Modo Whole Word
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = caseSensitive ? 'g' : 'gi';
        searchPattern = new RegExp(`\\b${escapedTerm}\\b`, flags);
      } else {
        // Modo normal
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = caseSensitive ? 'g' : 'gi';
        searchPattern = new RegExp(escapedTerm, flags);
      }

      // Reemplazar coincidencias con marks HTML
      processedContent = markdown.replace(searchPattern, (match) => {
        const id = matchCount;
        matchCount++;
        return `<mark class="search-highlight" data-search-id="${id}" style="background: linear-gradient(135deg, #fef08a 0%, #fde047 100%); color: #1e293b; padding: 3px 6px; border-radius: 4px; font-weight: 600; box-shadow: 0 2px 8px rgba(250, 204, 21, 0.4); border: 2px solid #facc15; display: inline-block; line-height: 1.4; margin: 0 1px;">${match}</mark>`;
      });

    } catch (e) {
      console.error('❌ Error en búsqueda:', e);
      return { content: markdown, matchCount: 0 };
    }

    console.log(`🔍 Procesado: ${matchCount} coincidencias encontradas`);
    return { content: processedContent, matchCount };
  };

  // ✅ NUEVA FUNCIÓN: SCROLL AL HIGHLIGHT ACTIVO
  const scrollToActiveHighlight = () => {
    if (!markdownContentRef.current) return;

    // Buscar todos los highlights
    const highlights = Array.from(
      markdownContentRef.current.querySelectorAll('mark.search-highlight')
    ) as HTMLElement[];

    console.log(`📍 Total highlights en DOM: ${highlights.length}`);
    console.log(`📍 Índice actual: ${currentSearchIndex}`);

    if (highlights.length === 0 || currentSearchIndex < 0 || currentSearchIndex >= highlights.length) {
      return;
    }

    // Resetear estilos de todos los highlights
    highlights.forEach((mark, index) => {
      if (index === currentSearchIndex) {
        // Estilo activo - Naranja brillante
        mark.style.cssText = `
          background: linear-gradient(135deg, #fb923c 0%, #f97316 100%) !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          border: 2px solid #ea580c !important;
          box-shadow: 
            0 0 0 3px rgba(249, 115, 22, 0.3),
            0 4px 12px rgba(249, 115, 22, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
          transform: scale(1.08) !important;
          z-index: 10 !important;
          position: relative !important;
          display: inline-block !important;
          line-height: 1.4 !important;
          margin: 0 1px !important;
          padding: 3px 6px !important;
          border-radius: 4px !important;
        `;
        mark.classList.add('search-active');
      } else {
        // Estilo base - Amarillo
        mark.style.cssText = `
          background: linear-gradient(135deg, #fef08a 0%, #fde047 100%) !important;
          color: #1e293b !important;
          padding: 3px 6px !important;
          border-radius: 4px !important;
          font-weight: 600 !important;
          box-shadow: 0 2px 8px rgba(250, 204, 21, 0.4) !important;
          border: 2px solid #facc15 !important;
          display: inline-block !important;
          line-height: 1.4 !important;
          margin: 0 1px !important;
        `;
        mark.classList.remove('search-active');
      }
    });

    // Scroll al elemento activo
    const activeElement = highlights[currentSearchIndex];
    if (activeElement) {
      console.log(`✅ Scrolling to highlight ${currentSearchIndex + 1}/${highlights.length}`);
      requestAnimationFrame(() => {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      });
    }
  };

  const nextSearchResult = () => {
    if (searchResults === 0) return;
    const nextIndex = (currentSearchIndex + 1) % searchResults;
    setCurrentSearchIndex(nextIndex);
  };

  const prevSearchResult = () => {
    if (searchResults === 0) return;
    const prevIndex = currentSearchIndex <= 0 ? searchResults - 1 : currentSearchIndex - 1;
    setCurrentSearchIndex(prevIndex);
  };

  // ✅ FUNCIONES DE REEMPLAZO TIPO VS CODE
  const replaceCurrentMatch = () => {
    if (!markdownContentRef.current || currentSearchIndex < 0 || currentSearchIndex >= searchResults) {
      return;
    }

    // Obtener el elemento actual
    const highlights = Array.from(
      markdownContentRef.current.querySelectorAll('mark.search-highlight')
    ) as HTMLElement[];
    
    if (highlights[currentSearchIndex]) {
      const currentElement = highlights[currentSearchIndex];
      const textNode = document.createTextNode(replaceTerm);
      currentElement.parentNode?.replaceChild(textNode, currentElement);

      // Obtener el contenido actualizado y actualizar el estado
      const newContent = markdownContentRef.current.textContent || '';
      setContent(newContent);
    }
  };

  const replaceAllMatches = () => {
    if (!markdownContentRef.current || searchResults === 0) {
      return;
    }

    // Obtener todos los highlights
    const highlights = Array.from(
      markdownContentRef.current.querySelectorAll('mark.search-highlight')
    ) as HTMLElement[];

    // Reemplazar de atrás hacia adelante para evitar problemas de índices
    for (let i = highlights.length - 1; i >= 0; i--) {
      const element = highlights[i];
      const textNode = document.createTextNode(replaceTerm);
      element.parentNode?.replaceChild(textNode, element);
    }

    // Actualizar contenido y limpiar búsqueda
    const newContent = markdownContentRef.current.textContent || '';
    setContent(newContent);
    setSearchTerm('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title ? `${title}.md` : 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 24));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  const toggleFullscreen = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    }
  };

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    if (!contentRef.current) return;
    const { scrollHeight } = contentRef.current;
    contentRef.current.scrollTo({ top: scrollHeight, behavior: 'smooth' });
  };

  const renderTocItem = (item: TocItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isCollapsed = collapsedSections.has(item.id);
    const isActive = activeHeadingId === item.id;

    return (
      <div key={item.id} className="toc-item">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer group ${
            isActive
              ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold'
              : 'hover:bg-purple-50 dark:hover:bg-purple-900/20 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400'
          }`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSection(item.id);
              }}
              className="flex-shrink-0 p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          <button
            onClick={() => scrollToHeading(item.id)}
            className="flex-1 text-left truncate"
          >
            {item.text}
          </button>
        </div>
        
        {hasChildren && !isCollapsed && (
          <div className="toc-children">
            {item.children!.map(child => renderTocItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-slate-50 dark:bg-slate-900 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-slate-50 dark:bg-slate-900 rounded-xl">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Error al cargar documento</h3>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden">
      {/* Header / Toolbar */}
      {!isFullscreen && (
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 border-b border-purple-700">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {title || 'Documento'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Font Size Controls */}
            <div className="flex items-center gap-0.5 bg-white/10 rounded-lg p-0.5">
              <button
                onClick={decreaseFontSize}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Disminuir tamaño"
              >
                <ZoomOut className="w-3.5 h-3.5 text-white" />
              </button>
              <span className="text-xs text-white font-mono px-1.5">{fontSize}px</span>
              <button
                onClick={increaseFontSize}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Aumentar tamaño"
              >
                <ZoomIn className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* TOC Toggle */}
            {showToc && toc.length > 0 && (
              <button
                onClick={() => setShowTableOfContents(!showTableOfContents)}
                className={`p-1.5 rounded transition-colors ${
                  showTableOfContents
                    ? 'bg-white text-purple-600'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={showTableOfContents ? "Ocultar TOC" : "Mostrar TOC"}
              >
                <List className="w-4 h-4" />
              </button>
            )}

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
              title="Copiar"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-300" />
              ) : (
                <Copy className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
              title="Descargar"
            >
              <Download className="w-4 h-4 text-white" />
            </button>

            {/* Fullscreen Toggle Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
              title="Modo pantalla completa"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>

            {/* Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Botón para salir de Fullscreen */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 z-50 p-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg shadow-lg transition-all backdrop-blur-sm"
          title="Salir de pantalla completa"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      )}

      {/* 🔥 SEARCH BAR PROFESIONAL TIPO VS CODE */}
      <div className={`sticky ${isFullscreen ? 'top-0' : 'top-[52px]'} z-20 bg-slate-800 dark:bg-slate-900 border-b border-slate-700 shadow-lg`}>
        {/* Barra de búsqueda principal */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex-1 flex flex-col gap-2">
            {/* Input de búsqueda con opciones */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-32 py-1.5 bg-slate-700 dark:bg-slate-800 border border-slate-600 dark:border-slate-700 rounded text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.shiftKey ? prevSearchResult() : nextSearchResult();
                    }
                    if (e.key === 'Escape') {
                      setSearchTerm('');
                    }
                  }}
                />
                
                {/* Contador de resultados */}
                {searchResults > 0 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="text-xs font-mono text-slate-300 bg-slate-600 px-2 py-0.5 rounded">
                      {currentSearchIndex + 1}/{searchResults}
                    </span>
                  </div>
                )}

                {/* Botón limpiar */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-20 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-600 rounded transition-colors"
                    title="Limpiar (Esc)"
                  >
                    <X className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Botones de navegación */}
              <div className="flex gap-1 bg-slate-700 dark:bg-slate-800 rounded p-0.5">
                <button
                  onClick={prevSearchResult}
                  disabled={searchResults === 0}
                  className="p-1.5 hover:bg-slate-600 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Anterior (Shift+Enter)"
                >
                  <ArrowUp className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={nextSearchResult}
                  disabled={searchResults === 0}
                  className="p-1.5 hover:bg-slate-600 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Siguiente (Enter)"
                >
                  <ArrowDown className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Opciones de búsqueda tipo VS Code */}
              <div className="flex gap-1 bg-slate-700 dark:bg-slate-800 rounded p-0.5">
                <button
                  onClick={() => setCaseSensitive(!caseSensitive)}
                  className={`p-1.5 rounded transition-colors ${
                    caseSensitive 
                      ? 'bg-purple-600 text-white' 
                      : 'hover:bg-slate-600 dark:hover:bg-slate-700 text-slate-300'
                  }`}
                  title="Coincidir mayúsculas/minúsculas (Alt+C)"
                >
                  <CaseSensitive className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setWholeWord(!wholeWord)}
                  className={`p-1.5 rounded transition-colors ${
                    wholeWord 
                      ? 'bg-purple-600 text-white' 
                      : 'hover:bg-slate-600 dark:hover:bg-slate-700 text-slate-300'
                  }`}
                  title="Solo palabras completas (Alt+W)"
                >
                  <WholeWord className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setUseRegex(!useRegex)}
                  className={`p-1.5 rounded transition-colors ${
                    useRegex 
                      ? 'bg-purple-600 text-white' 
                      : 'hover:bg-slate-600 dark:hover:bg-slate-700 text-slate-300'
                  }`}
                  title="Usar expresiones regulares (Alt+R)"
                >
                  <Regex className="w-4 h-4" />
                </button>
              </div>

              {/* Toggle Replace */}
              <button
                onClick={() => setShowReplace(!showReplace)}
                className={`p-1.5 rounded transition-colors ${
                  showReplace 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 dark:bg-slate-800 hover:bg-slate-600 dark:hover:bg-slate-700 text-slate-300'
                }`}
                title="Mostrar reemplazar (Ctrl+H)"
              >
                <Replace className="w-4 h-4" />
              </button>
            </div>

            {/* Input de reemplazo */}
            {showReplace && (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Replace className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={replaceTerm}
                    onChange={(e) => setReplaceTerm(e.target.value)}
                    placeholder="Reemplazar..."
                    className="w-full pl-10 pr-4 py-1.5 bg-slate-700 dark:bg-slate-800 border border-slate-600 dark:border-slate-700 rounded text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Botones de reemplazo */}
                <button
                  onClick={replaceCurrentMatch}
                  disabled={currentSearchIndex < 0}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  title="Reemplazar (Ctrl+Shift+1)"
                >
                  Reemplazar
                </button>
                <button
                  onClick={replaceAllMatches}
                  disabled={searchResults === 0}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  title="Reemplazar todo (Ctrl+Alt+Enter)"
                >
                  Reemplazar todo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Table of Contents Sidebar */}
        {showToc && showTableOfContents && toc.length > 0 && (
          <div className="w-80 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0">
            <div className="flex-shrink-0 p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <List className="w-4 h-4" />
                Tabla de Contenido
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3">
              <nav className="space-y-1">
                {toc.map(item => renderTocItem(item))}
              </nav>
            </div>
          </div>
        )}

        {/* Markdown Content */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto scroll-smooth"
        >
          <div 
            ref={markdownContentRef}
            className="markdown-body p-8 max-w-4xl mx-auto"
            style={{ fontSize: `${fontSize}px` }}
          >
            <style>{`
              .highlight-flash {
                animation: highlightFlash 2s ease-in-out;
              }
              
              @keyframes highlightFlash {
                0%, 100% { background-color: transparent; }
                50% { background-color: rgba(168, 85, 247, 0.2); }
              }

              /* 🎨 ESTILOS DE BÚSQUEDA PROFESIONALES - MEJORADOS */
              
              /* Resaltado activo - Naranja brillante con efecto neón */
              mark.search-highlight.search-active {
                background: linear-gradient(135deg, #fb923c 0%, #f97316 100%) !important;
                color: #ffffff !important;
                font-weight: 700 !important;
                border: 2px solid #ea580c !important;
                box-shadow: 
                  0 0 0 3px rgba(249, 115, 22, 0.3),
                  0 4px 12px rgba(249, 115, 22, 0.5),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
                transform: scale(1.08) !important;
                z-index: 10 !important;
                position: relative !important;
                animation: activeHighlightGlow 1.5s ease-in-out infinite !important;
              }

              @keyframes activeHighlightGlow {
                0%, 100% {
                  box-shadow: 
                    0 0 0 3px rgba(249, 115, 22, 0.3),
                    0 4px 12px rgba(249, 115, 22, 0.5),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
                }
                50% {
                  box-shadow: 
                    0 0 0 5px rgba(249, 115, 22, 0.4),
                    0 6px 16px rgba(249, 115, 22, 0.6),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
                }
              }

              /* Dark mode - Ajustes mejorados */
              .dark mark.search-highlight.search-active {
                background: linear-gradient(135deg, #fb923c 0%, #f97316 100%) !important;
                color: #ffffff !important;
                border-color: #ea580c !important;
                box-shadow: 
                  0 0 0 3px rgba(249, 115, 22, 0.4),
                  0 4px 16px rgba(249, 115, 22, 0.6),
                  0 0 12px rgba(249, 115, 22, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
              }

              /* Mejora de accesibilidad - Mayor contraste */
              @media (prefers-contrast: high) {
                mark.search-highlight.search-active {
                  background: #f97316 !important;
                  color: #ffffff !important;
                  border: 3px solid #000000 !important;
                }
              }

              /* Prevenir que otros estilos sobrescriban */
              mark.search-highlight,
              mark.search-highlight * {
                pointer-events: auto !important;
              }
            `}</style>
            
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[
                rehypeRaw,
                rehypeHighlight,
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: 'wrap' }]
              ]}
              components={{
                h1: ({ node, children, ...props }) => (
                  <h1 
                    className="text-4xl font-bold mt-8 mb-4 text-slate-900 dark:text-white border-b-2 border-purple-200 dark:border-purple-800 pb-2 scroll-mt-24"
                    {...props}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ node, children, ...props }) => (
                  <h2 
                    className="text-3xl font-bold mt-6 mb-3 text-slate-900 dark:text-white scroll-mt-24"
                    {...props}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ node, children, ...props }) => (
                  <h3 
                    className="text-2xl font-bold mt-5 mb-2 text-slate-900 dark:text-white scroll-mt-24"
                    {...props}
                  >
                    {children}
                  </h3>
                ),
                h4: ({ node, children, ...props }) => (
                  <h4 
                    className="text-xl font-bold mt-4 mb-2 text-slate-900 dark:text-white scroll-mt-24"
                    {...props}
                  >
                    {children}
                  </h4>
                ),
                h5: ({ node, children, ...props }) => (
                  <h5 
                    className="text-lg font-bold mt-3 mb-2 text-slate-900 dark:text-white scroll-mt-24"
                    {...props}
                  >
                    {children}
                  </h5>
                ),
                h6: ({ node, children, ...props }) => (
                  <h6 
                    className="text-base font-bold mt-2 mb-2 text-slate-900 dark:text-white scroll-mt-24"
                    {...props}
                  >
                    {children}
                  </h6>
                ),
                blockquote: ({ node, children, ...props }) => (
                  <blockquote 
                    className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 pl-4 py-2 my-4 italic text-slate-700 dark:text-slate-300"
                    {...props}
                  >
                    {children}
                  </blockquote>
                ),
                code: ({ node, inline, className, children, ...props }: any) => {
                  return !inline ? (
                    <code 
                      className={`${className} block bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm my-4`}
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code 
                      className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                table: ({ node, children, ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table 
                      className="min-w-full border-collapse border border-slate-300 dark:border-slate-700"
                      {...props}
                    >
                      {children}
                    </table>
                  </div>
                ),
                th: ({ node, children, ...props }) => (
                  <th 
                    className="border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-left font-bold text-slate-900 dark:text-white"
                    {...props}
                  >
                    {children}
                  </th>
                ),
                td: ({ node, children, ...props }) => (
                  <td 
                    className="border border-slate-300 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-300"
                    {...props}
                  >
                    {children}
                  </td>
                ),
                a: ({ node, children, ...props }) => (
                  <a 
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline"
                    {...props}
                  >
                    {children}
                  </a>
                ),
                ul: ({ node, children, ...props }) => (
                  <ul 
                    className="list-disc list-inside my-4 space-y-2 text-slate-700 dark:text-slate-300"
                    {...props}
                  >
                    {children}
                  </ul>
                ),
                ol: ({ node, children, ...props }) => (
                  <ol 
                    className="list-decimal list-inside my-4 space-y-2 text-slate-700 dark:text-slate-300"
                    {...props}
                  >
                    {children}
                  </ol>
                ),
                p: ({ node, children, ...props }) => (
                  <p 
                    className="my-4 text-slate-700 dark:text-slate-300 leading-relaxed"
                    {...props}
                  >
                    {children}
                  </p>
                ),
                hr: ({ node, ...props }) => (
                  <hr 
                    className="my-8 border-t-2 border-slate-200 dark:border-slate-700"
                    {...props}
                  />
                ),
                img: ({ node, ...props }) => (
                  <img 
                    className="max-w-full h-auto rounded-lg shadow-lg my-4"
                    {...props}
                  />
                ),
              }}
            >
              {highlightedContent}
            </ReactMarkdown>
          </div>
        </div>

        {/* Floating Navigation Buttons */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
          {scrollPosition !== 'top' && (
            <button
              onClick={scrollToTop}
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all hover:scale-110"
              title="Ir al inicio"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          )}

          {scrollPosition === 'middle' && (
            <button
              onClick={scrollToBottom}
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all hover:scale-110"
              title="Ir al final"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}