import { useState } from 'react';
import { Copy, Check, Download, Maximize2 } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
  maxHeight?: number;
  onCopy?: () => void;
}

export function CodeBlock({
  code,
  language = 'javascript',
  filename,
  highlightLines = [],
  showLineNumbers = true,
  maxHeight = 500,
  onCopy
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const lines = code.split('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const languageColors: Record<string, string> = {
    javascript: 'from-yellow-400 to-orange-500',
    typescript: 'from-blue-400 to-blue-600',
    python: 'from-blue-500 to-green-500',
    java: 'from-red-500 to-orange-600',
    csharp: 'from-purple-500 to-purple-700',
    go: 'from-cyan-400 to-blue-500',
    rust: 'from-orange-600 to-red-600',
    html: 'from-orange-500 to-red-500',
    css: 'from-blue-400 to-purple-500',
    sql: 'from-blue-600 to-indigo-600',
    bash: 'from-gray-600 to-gray-800',
    json: 'from-green-400 to-emerald-500',
    yaml: 'from-red-400 to-pink-500',
    markdown: 'from-gray-700 to-gray-900',
    php: 'from-indigo-500 to-purple-600',
    ruby: 'from-red-600 to-red-700',
    swift: 'from-orange-500 to-red-600',
    kotlin: 'from-purple-500 to-pink-500'
  };

  const languageLabels: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    html: 'HTML',
    css: 'CSS',
    sql: 'SQL',
    bash: 'Bash',
    json: 'JSON',
    yaml: 'YAML',
    markdown: 'Markdown',
    php: 'PHP',
    ruby: 'Ruby',
    swift: 'Swift',
    kotlin: 'Kotlin'
  };

  const gradient = languageColors[language.toLowerCase()] || 'from-gray-600 to-gray-800';
  const label = languageLabels[language.toLowerCase()] || language.toUpperCase();

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradient} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>

          {/* Language or filename */}
          {filename ? (
            <span className="text-sm font-medium text-white">{filename}</span>
          ) : (
            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-semibold text-white uppercase tracking-wider">
              {label}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors group"
            title="Copiar código"
          >
            {copied ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Copy className="w-4 h-4 text-white/80 group-hover:text-white" />
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors group"
            title="Descargar"
          >
            <Download className="w-4 h-4 text-white/80 group-hover:text-white" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors group"
            title={isExpanded ? 'Contraer' : 'Expandir'}
          >
            <Maximize2 className="w-4 h-4 text-white/80 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Code */}
      <div
        className="bg-[#1e1e1e] dark:bg-[#0d1117] overflow-auto"
        style={{ maxHeight: isExpanded ? 'none' : `${maxHeight}px` }}
      >
        <pre className="p-4">
          <code className="text-sm font-mono">
            {lines.map((line, index) => {
              const lineNumber = index + 1;
              const isHighlighted = highlightLines.includes(lineNumber);

              return (
                <div
                  key={index}
                  className={`flex ${
                    isHighlighted ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''
                  }`}
                >
                  {showLineNumbers && (
                    <span className="inline-block w-12 select-none text-gray-500 dark:text-gray-600 text-right pr-4 flex-shrink-0">
                      {lineNumber}
                    </span>
                  )}
                  <span className={`flex-1 ${isHighlighted ? 'pl-2' : ''}`}>
                    <span className="text-gray-300 dark:text-gray-400">{line}</span>
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {lines.length} líneas
        </span>
        {copied && (
          <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" />
            ¡Copiado!
          </span>
        )}
      </div>
    </div>
  );
}
