/**
 * KEYBOARD SHORTCUTS HELP OVERLAY
 * Panel que muestra todos los atajos de teclado disponibles
 */

import React from 'react';
import { X, Command, Search, Edit, Eye, TestTube } from 'lucide-react';
import { keyboardShortcuts } from '../services/keyboardShortcuts';
import type { KeyboardShortcut } from '../services/keyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ onClose }: KeyboardShortcutsHelpProps) {
  const allShortcuts = keyboardShortcuts.getAll();

  // Agrupar por categoría
  const categories = {
    navigation: {
      title: 'Navigation',
      icon: Command,
      color: 'blue',
    },
    search: {
      title: 'Search',
      icon: Search,
      color: 'purple',
    },
    editing: {
      title: 'Editing',
      icon: Edit,
      color: 'green',
    },
    view: {
      title: 'View',
      icon: Eye,
      color: 'orange',
    },
    testing: {
      title: 'Testing',
      icon: TestTube,
      color: 'pink',
    },
  };

  const shortcutsByCategory = allShortcuts.reduce((acc, registration) => {
    const category = registration.shortcut.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(registration);
    return acc;
  }, {} as Record<KeyboardShortcut['category'], typeof allShortcuts>);

  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Command className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Master shortcuts to boost your productivity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {Object.entries(categories).map(([categoryKey, categoryConfig]) => {
              const shortcuts = shortcutsByCategory[categoryKey as KeyboardShortcut['category']] || [];
              
              if (shortcuts.length === 0) return null;

              const Icon = categoryConfig.icon;
              const colorClass = {
                blue: 'from-blue-500 to-cyan-500',
                purple: 'from-purple-500 to-pink-500',
                green: 'from-green-500 to-emerald-500',
                orange: 'from-orange-500 to-red-500',
                pink: 'from-pink-500 to-rose-500',
              }[categoryConfig.color];

              return (
                <div key={categoryKey}>
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 bg-gradient-to-r ${colorClass} rounded-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {categoryConfig.title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({shortcuts.length})
                    </span>
                  </div>

                  {/* Shortcuts List */}
                  <div className="space-y-2">
                    {shortcuts.map((registration) => {
                      const shortcut = registration.shortcut;
                      const label = keyboardShortcuts.getShortcutLabel(shortcut);

                      return (
                        <div
                          key={registration.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {shortcut.description}
                          </span>
                          
                          <kbd className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono text-gray-900 dark:text-gray-100 shadow-sm">
                            {label}
                          </kbd>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips Section */}
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
              💡 Pro Tips
            </h3>
            <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
              <li>• Use <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 rounded text-xs">?</kbd> to quickly access this help</li>
              <li>• Most shortcuts work with <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 rounded text-xs">Cmd</kbd> on Mac, <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 rounded text-xs">Ctrl</kbd> on Windows/Linux</li>
              <li>• Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 rounded text-xs">Esc</kbd> to close any modal or go back</li>
              <li>• Command palette (<kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 rounded text-xs">⌘K</kbd>) is your best friend for fuzzy search</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {allShortcuts.length} shortcuts available
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
