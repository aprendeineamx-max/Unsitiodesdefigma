import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';
import { useState } from 'react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { id: 'light' as Theme, label: 'Claro', icon: Sun, description: 'Tema luminoso' },
    { id: 'dark' as Theme, label: 'Oscuro', icon: Moon, description: 'Suave para los ojos' },
    { id: 'auto' as Theme, label: 'Auto', icon: Monitor, description: 'Según sistema' }
  ];

  const currentTheme = themes.find(t => t.id === theme);
  const Icon = currentTheme?.icon || Sun;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
        title="Cambiar tema"
      >
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Tema: {currentTheme?.label}
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Seleccionar Tema</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Personaliza tu experiencia</p>
            </div>
            <div className="p-2">
              {themes.map((t) => {
                const ThemeIcon = t.icon;
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${ 
                      isActive 
                        ? 'bg-[#98ca3f] text-white shadow-sm' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ 
                      isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <ThemeIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {t.label}
                      </p>
                      <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                        {t.description}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                💡 El tema se guarda automáticamente
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
