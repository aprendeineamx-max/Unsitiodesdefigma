/**
 * KEYBOARD SHORTCUTS SERVICE
 * Sistema completo de atajos de teclado para el Documentation Center
 * 
 * Inspirado en:
 * - VSCode (Cmd+P, Cmd+K, Cmd+S)
 * - Notion (Cmd+E, Cmd+/)
 * - Obsidian (Cmd+O, Cmd+P)
 * - GitHub (G H, G I, ?)
 */

type KeyboardShortcutHandler = (event: KeyboardEvent) => void;

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  handler: KeyboardShortcutHandler;
  category: 'navigation' | 'editing' | 'search' | 'view' | 'testing';
}

interface ShortcutRegistration {
  id: string;
  shortcut: KeyboardShortcut;
}

class KeyboardShortcutsService {
  private shortcuts: Map<string, ShortcutRegistration> = new Map();
  private enabled = true;
  private helpVisible = false;
  private helpCallback: (() => void) | null = null;

  /**
   * Inicializar servicio
   */
  init(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', this.handleKeyDown);
    console.log('⌨️ [Keyboard] Shortcuts service initialized');
  }

  /**
   * Destruir servicio
   */
  destroy(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('keydown', this.handleKeyDown);
    this.shortcuts.clear();
    console.log('⌨️ [Keyboard] Shortcuts service destroyed');
  }

  /**
   * Handler global de eventos de teclado
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.enabled) return;

    // Ignorar si está escribiendo en un input/textarea (excepto combinaciones con Cmd/Ctrl)
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    const isModifierCombo = event.metaKey || event.ctrlKey;

    if (isInput && !isModifierCombo) {
      return;
    }

    // Buscar shortcut matching
    for (const [_, registration] of this.shortcuts) {
      const shortcut = registration.shortcut;

      // Check key match
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      
      // Check modifiers
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
      const cmdMatch = shortcut.cmd ? event.metaKey : !event.metaKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

      if (keyMatch && ctrlMatch && cmdMatch && altMatch && shiftMatch) {
        event.preventDefault();
        event.stopPropagation();
        
        try {
          shortcut.handler(event);
          console.log(`⌨️ [Keyboard] Executed: ${this.getShortcutLabel(shortcut)}`);
        } catch (error) {
          console.error(`⌨️ [Keyboard] Error executing shortcut:`, error);
        }
        
        break;
      }
    }
  };

  /**
   * Registrar shortcut
   */
  register(id: string, shortcut: KeyboardShortcut): void {
    this.shortcuts.set(id, { id, shortcut });
    console.log(`⌨️ [Keyboard] Registered: ${id} - ${this.getShortcutLabel(shortcut)}`);
  }

  /**
   * Desregistrar shortcut
   */
  unregister(id: string): void {
    this.shortcuts.delete(id);
    console.log(`⌨️ [Keyboard] Unregistered: ${id}`);
  }

  /**
   * Obtener label legible del shortcut
   */
  getShortcutLabel(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.cmd) parts.push(isMac ? '⌘' : 'Cmd');
    if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
    if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
    parts.push(shortcut.key.toUpperCase());
    
    return parts.join('+');
  }

  /**
   * Habilitar/deshabilitar shortcuts
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`⌨️ [Keyboard] Shortcuts ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Obtener todos los shortcuts
   */
  getAll(): ShortcutRegistration[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Obtener shortcuts por categoría
   */
  getByCategory(category: KeyboardShortcut['category']): ShortcutRegistration[] {
    return Array.from(this.shortcuts.values()).filter(r => r.shortcut.category === category);
  }

  /**
   * Mostrar help overlay
   */
  showHelp(): void {
    this.helpVisible = true;
    if (this.helpCallback) {
      this.helpCallback();
    }
    console.log('⌨️ [Keyboard] Help overlay shown');
  }

  /**
   * Ocultar help overlay
   */
  hideHelp(): void {
    this.helpVisible = false;
    console.log('⌨️ [Keyboard] Help overlay hidden');
  }

  /**
   * Registrar callback para mostrar help
   */
  onShowHelp(callback: () => void): void {
    this.helpCallback = callback;
  }

  /**
   * Check si help está visible
   */
  isHelpVisible(): boolean {
    return this.helpVisible;
  }
}

/**
 * Singleton instance
 */
export const keyboardShortcuts = new KeyboardShortcutsService();

/**
 * Hook de React para usar shortcuts
 */
export function useKeyboardShortcuts(shortcuts: Array<{
  id: string;
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  handler: KeyboardShortcutHandler;
  category: KeyboardShortcut['category'];
}>) {
  if (typeof window === 'undefined') return;

  // Register shortcuts on mount
  React.useEffect(() => {
    shortcuts.forEach(shortcut => {
      keyboardShortcuts.register(shortcut.id, {
        key: shortcut.key,
        ctrl: shortcut.ctrl,
        cmd: shortcut.cmd,
        alt: shortcut.alt,
        shift: shortcut.shift,
        description: shortcut.description,
        handler: shortcut.handler,
        category: shortcut.category,
      });
    });

    // Cleanup on unmount
    return () => {
      shortcuts.forEach(shortcut => {
        keyboardShortcuts.unregister(shortcut.id);
      });
    };
  }, []); // Empty deps = register once
}

/**
 * Necesitamos importar React para el hook
 */
import React from 'react';

/**
 * Default shortcuts for Documentation Center
 */
export const defaultShortcuts = {
  // Navigation
  OPEN_COMMAND_PALETTE: {
    id: 'open-command-palette',
    key: 'k',
    cmd: true,
    description: 'Open command palette (search)',
    category: 'search' as const,
  },
  
  OPEN_DOCUMENT: {
    id: 'open-document',
    key: 'o',
    cmd: true,
    description: 'Quick open document',
    category: 'navigation' as const,
  },

  GO_BACK: {
    id: 'go-back',
    key: 'Escape',
    description: 'Go back / Close modal',
    category: 'navigation' as const,
  },

  // Editing
  EDIT_METADATA: {
    id: 'edit-metadata',
    key: 'e',
    cmd: true,
    description: 'Edit document metadata',
    category: 'editing' as const,
  },

  SAVE_DOCUMENT: {
    id: 'save-document',
    key: 's',
    cmd: true,
    description: 'Save document',
    category: 'editing' as const,
  },

  BULK_EDIT: {
    id: 'bulk-edit',
    key: 'b',
    cmd: true,
    shift: true,
    description: 'Open bulk editor',
    category: 'editing' as const,
  },

  // Search
  FIND_IN_DOCUMENT: {
    id: 'find-in-document',
    key: 'f',
    cmd: true,
    description: 'Find in document',
    category: 'search' as const,
  },

  GLOBAL_SEARCH: {
    id: 'global-search',
    key: 'p',
    cmd: true,
    description: 'Search all documents',
    category: 'search' as const,
  },

  // View
  TOGGLE_SIDEBAR: {
    id: 'toggle-sidebar',
    key: 'b',
    cmd: true,
    description: 'Toggle sidebar',
    category: 'view' as const,
  },

  TOGGLE_TOC: {
    id: 'toggle-toc',
    key: 't',
    cmd: true,
    description: 'Toggle table of contents',
    category: 'view' as const,
  },

  TOGGLE_FULLSCREEN: {
    id: 'toggle-fullscreen',
    key: 'Enter',
    cmd: true,
    shift: true,
    description: 'Toggle fullscreen',
    category: 'view' as const,
  },

  TOGGLE_THEME: {
    id: 'toggle-theme',
    key: 'd',
    cmd: true,
    shift: true,
    description: 'Toggle dark mode',
    category: 'view' as const,
  },

  // Testing
  RUN_TESTS: {
    id: 'run-tests',
    key: 'j',
    cmd: true,
    shift: true,
    description: 'Run metadata tests',
    category: 'testing' as const,
  },

  // Help
  SHOW_SHORTCUTS: {
    id: 'show-shortcuts',
    key: '?',
    shift: true,
    description: 'Show keyboard shortcuts',
    category: 'view' as const,
  },
};

/**
 * Export types
 */
export type { KeyboardShortcut, KeyboardShortcutHandler };
