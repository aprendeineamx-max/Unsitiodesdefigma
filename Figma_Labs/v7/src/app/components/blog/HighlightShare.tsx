import { useEffect, useState, useRef } from 'react';
import { Twitter, Linkedin, Facebook, Copy, Quote, Check } from 'lucide-react';

interface HighlightShareProps {
  contentSelector?: string; // CSS selector for content container
  onShare?: (text: string, platform: string) => void;
  enabledPlatforms?: ('twitter' | 'linkedin' | 'facebook' | 'copy' | 'quote')[];
  minLength?: number; // Minimum text length to show tooltip
  maxLength?: number; // Maximum text length for sharing
}

export function HighlightShare({
  contentSelector = 'article',
  onShare,
  enabledPlatforms = ['twitter', 'linkedin', 'copy', 'quote'],
  minLength = 10,
  maxLength = 280
}: HighlightShareProps) {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      
      // Check if selection is within content area
      if (contentSelector) {
        const content = document.querySelector(contentSelector);
        if (!content || !selection?.anchorNode || !content.contains(selection.anchorNode)) {
          setPosition(null);
          setSelectedText('');
          return;
        }
      }

      if (text.length >= minLength && text.length <= maxLength) {
        setSelectedText(text);
        
        // Calculate tooltip position
        const range = selection?.getRangeAt(0);
        if (range) {
          const rect = range.getBoundingClientRect();
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 60 // Position above selection
          });
        }
      } else {
        setPosition(null);
        setSelectedText('');
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setPosition(null);
        setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchend', handleSelection);
    };
  }, [contentSelector, minLength, maxLength]);

  const handleShare = async (platform: string) => {
    if (!selectedText) return;

    const url = window.location.href;
    const text = `"${selectedText}"`;

    onShare?.(selectedText, platform);

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(`${text}\n\n${url}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        break;
      case 'quote':
        // Create highlighted quote in the article
        createHighlightedQuote(selectedText);
        break;
    }
  };

  const createHighlightedQuote = (text: string) => {
    // This could be implemented to save highlights to the database
    // For now, we'll just show a visual indication
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('mark');
    span.className = 'bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded';
    span.setAttribute('data-highlight', 'true');
    
    try {
      range.surroundContents(span);
    } catch (e) {
      // If surroundContents fails, fallback to wrapping
      console.error('Failed to highlight:', e);
    }

    // Clear selection
    selection.removeAllRanges();
    setPosition(null);
    setSelectedText('');
  };

  if (!position || !selectedText) {
    return null;
  }

  const platforms = [
    { id: 'twitter', icon: Twitter, label: 'Twitter', color: 'hover:bg-blue-500' },
    { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-blue-700' },
    { id: 'facebook', icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-600' },
    { id: 'copy', icon: copied ? Check : Copy, label: copied ? 'Copiado!' : 'Copiar', color: 'hover:bg-gray-600' },
    { id: 'quote', icon: Quote, label: 'Resaltar', color: 'hover:bg-yellow-600' }
  ].filter(p => enabledPlatforms.includes(p.id as any));

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="bg-gray-900 dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="flex items-center divide-x divide-gray-700">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <button
                key={platform.id}
                onClick={() => handleShare(platform.id)}
                className={`p-3 ${platform.color} hover:text-white transition-all group relative`}
                title={platform.label}
              >
                <Icon className="w-5 h-5 text-white" />
                
                {/* Tooltip */}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {platform.label}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Selected text preview */}
        <div className="px-3 py-2 bg-gray-800 dark:bg-gray-900 border-t border-gray-700">
          <p className="text-xs text-gray-300 line-clamp-2 italic">
            "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
          </p>
        </div>

        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-gray-800" />
      </div>
    </div>
  );
}
