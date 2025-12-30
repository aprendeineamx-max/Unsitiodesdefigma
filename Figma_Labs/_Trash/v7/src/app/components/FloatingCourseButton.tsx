import { Play, X } from 'lucide-react';
import { useState } from 'react';

interface FloatingCourseButtonProps {
  onOpenPlayer: () => void;
}

export function FloatingCourseButton({ onOpenPlayer }: FloatingCourseButtonProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-5">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-4 max-w-sm border-2 border-[#98ca3f]">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Continúa aprendiendo</p>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">React Avanzado y Patrones</h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-[#98ca3f]" style={{ width: '75%' }} />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">75%</span>
            </div>
            <button 
              onClick={onOpenPlayer}
              className="w-full bg-[#98ca3f] text-[#121f3d] py-2 rounded-lg hover:bg-[#87b935] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Play className="w-4 h-4" />
              Continuar lección
            </button>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
