import { useEffect, useState, useRef } from 'react';
import { List, ChevronRight, BookOpen, X } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

interface TableOfContentsProps {
  contentSelector?: string; // CSS selector for content (default: 'article')
  variant?: 'sidebar' | 'floating' | 'inline';
  position?: 'left' | 'right';
  showNumbers?: boolean;
  minItems?: number; // Minimum headings to show TOC (default: 3)
}

export function TableOfContents({
  contentSelector = 'article',
  variant = 'sidebar',
  position = 'right',
  showNumbers = true,
  minItems = 3
}: TableOfContentsProps) {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate TOC from headings
  useEffect(() => {
    const content = document.querySelector(contentSelector);
    if (!content) return;

    const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const tocItems: TOCItem[] = [];

    headings.forEach((heading, index) => {
      const element = heading as HTMLElement;
      const level = parseInt(element.tagName.substring(1));
      const text = element.textContent || '';
      
      // Generate or use existing ID
      let id = element.id;
      if (!id) {
        id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        element.id = id;
      }

      tocItems.push({ id, text, level, element });
    });

    setItems(tocItems);

    // Set up Intersection Observer for active heading
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 1.0
      }
    );

    headings.forEach((heading) => {
      observerRef.current?.observe(heading);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [contentSelector]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Fixed header offset
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  // Don't render if not enough items
  if (items.length < minItems) {
    return null;
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-200 dark:border-gray-600 p-6 my-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-gray-900 dark:text-white">Tabla de Contenidos</h3>
        </div>
        <nav>
          <ol className="space-y-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                style={{ marginLeft: `${(item.level - 1) * 1}rem` }}
              >
                <button
                  onClick={() => scrollToHeading(item.id)}
                  className={`flex items-start gap-2 text-left hover:text-[#98CA3F] dark:hover:text-[#98CA3F] transition-colors group ${
                    activeId === item.id
                      ? 'text-[#98CA3F] font-semibold'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {showNumbers && (
                    <span className="text-xs font-mono mt-0.5 text-gray-400">
                      {index + 1}.
                    </span>
                  )}
                  <span className="flex-1">{item.text}</span>
                  <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                    activeId === item.id ? 'opacity-100' : ''
                  }`} />
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    );
  }

  // Floating variant (mobile-friendly)
  if (variant === 'floating') {
    return (
      <>
        {/* Toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 z-40 p-4 bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform"
          aria-label="Toggle table of contents"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          ) : (
            <List className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          )}
        </button>

        {/* Floating panel */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <div className="fixed bottom-24 right-6 z-50 w-80 max-h-[60vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#0A2540] to-[#0F3554]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#98CA3F]" />
                  <h3 className="font-bold text-white">Tabla de Contenidos</h3>
                </div>
                <p className="text-xs text-white/70 mt-1">
                  {items.length} secciones
                </p>
              </div>
              <nav className="p-4 overflow-y-auto max-h-[calc(60vh-80px)]">
                <ol className="space-y-2">
                  {items.map((item, index) => (
                    <li
                      key={item.id}
                      style={{ marginLeft: `${(item.level - 1) * 0.75}rem` }}
                    >
                      <button
                        onClick={() => {
                          scrollToHeading(item.id);
                          setIsOpen(false);
                        }}
                        className={`flex items-start gap-2 text-left text-sm hover:text-[#98CA3F] transition-colors w-full group ${
                          activeId === item.id
                            ? 'text-[#98CA3F] font-semibold'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {showNumbers && (
                          <span className="text-xs font-mono mt-0.5 text-gray-400">
                            {index + 1}.
                          </span>
                        )}
                        <span className="flex-1 line-clamp-2">{item.text}</span>
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                          activeId === item.id ? 'opacity-100' : ''
                        }`} />
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </>
        )}
      </>
    );
  }

  // Sidebar variant (default)
  return (
    <div
      className={`sticky top-24 ${
        position === 'left' ? 'order-first' : 'order-last'
      } hidden lg:block`}
    >
      <div className="w-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#0A2540] to-[#0F3554]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#98CA3F]" />
            <h3 className="font-bold text-white">Tabla de Contenidos</h3>
          </div>
        </div>
        <nav className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <ol className="space-y-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                style={{ marginLeft: `${(item.level - 1) * 0.75}rem` }}
              >
                <button
                  onClick={() => scrollToHeading(item.id)}
                  className={`flex items-start gap-2 text-left text-sm hover:text-[#98CA3F] transition-colors w-full group ${
                    activeId === item.id
                      ? 'text-[#98CA3F] font-semibold'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {showNumbers && (
                    <span className="text-xs font-mono mt-0.5 text-gray-400">
                      {index + 1}.
                    </span>
                  )}
                  <span className="flex-1 line-clamp-2">{item.text}</span>
                  {activeId === item.id && (
                    <div className="w-1 h-1 rounded-full bg-[#98CA3F] flex-shrink-0 mt-2 animate-pulse" />
                  )}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Navegación rápida
          </p>
        </div>
      </div>
    </div>
  );
}
