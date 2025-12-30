import { useEffect, useState } from 'react';

interface ReadingProgressBarProps {
  target?: string; // CSS selector for content container (default: 'article')
  color?: string;
  height?: number;
  showPercentage?: boolean;
  position?: 'top' | 'bottom';
}

export function ReadingProgressBar({
  target = 'article',
  color = '#98CA3F',
  height = 4,
  showPercentage = false,
  position = 'top'
}: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const article = document.querySelector(target);
      if (!article) return;

      const articleRect = article.getBoundingClientRect();
      const articleTop = articleRect.top + window.pageYOffset;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.pageYOffset;

      // Calculate visible content
      const visibleStart = Math.max(0, scrollTop - articleTop);
      const visibleEnd = Math.min(articleHeight, scrollTop + windowHeight - articleTop);
      const visibleHeight = visibleEnd - visibleStart;
      
      // Calculate progress percentage
      const scrollableHeight = articleHeight - windowHeight;
      const scrolledPercentage = scrollableHeight > 0 
        ? Math.min(100, Math.max(0, (visibleStart / scrollableHeight) * 100))
        : 0;

      setProgress(scrolledPercentage);
    };

    // Update on scroll and resize
    window.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    
    // Initial update
    updateProgress();

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [target]);

  return (
    <div
      className={`fixed left-0 right-0 z-50 ${
        position === 'top' ? 'top-0' : 'bottom-0'
      }`}
      style={{ height: `${height}px` }}
    >
      {/* Background */}
      <div className="w-full h-full bg-gray-200 dark:bg-gray-800" />
      
      {/* Progress bar */}
      <div
        className="absolute top-0 left-0 h-full transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
          backgroundColor: color
        }}
      />

      {/* Percentage indicator (optional) */}
      {showPercentage && progress > 5 && (
        <div
          className="absolute top-1/2 -translate-y-1/2 px-3 py-1 bg-white dark:bg-gray-800 rounded-full shadow-lg text-xs font-bold transition-all duration-150"
          style={{
            left: `${progress}%`,
            transform: `translate(-50%, -50%)`,
            color: color
          }}
        >
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}
