import { createContext, useContext, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'dark';
  effectiveTheme: 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Always apply dark theme
    const root = document.documentElement;
    
    // Remove light theme if exists
    root.classList.remove('light');
    
    // Add dark theme
    root.classList.add('dark');
    
    // Also apply to body
    document.body.classList.remove('light');
    document.body.classList.add('dark');
    
    // Set data attribute
    root.setAttribute('data-theme', 'dark');
    
    // Update background color immediately
    document.body.style.backgroundColor = '#0f172a';
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#0f172a');
    }
  }, []);

  const value: ThemeContextType = {
    theme: 'dark',
    effectiveTheme: 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
