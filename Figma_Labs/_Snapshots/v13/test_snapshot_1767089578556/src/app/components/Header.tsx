import { Search, Menu, Bell, User, ShoppingCart, X, Zap, BookOpen, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationsContext';
import { Navigation, PageType } from './Navigation';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  onCartClick?: () => void;
  onNotificationsClick?: () => void;
  currentPage?: PageType;
  onNavigate?: (page: PageType) => void;
}

export function Header({ onSearchChange, onCartClick, onNotificationsClick, currentPage = 'home', onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();
  const { unreadCount } = useNotifications();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const quickSearchSuggestions = [
    { icon: '⚛️', text: 'React', category: 'Desarrollo' },
    { icon: '🎨', text: 'UI/UX Design', category: 'Diseño' },
    { icon: '🤖', text: 'Machine Learning', category: 'IA' },
    { icon: '📊', text: 'Data Science', category: 'Datos' }
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-[100] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8 flex-shrink-0">
            <button 
              onClick={() => onNavigate?.('home')}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#98ca3f] to-[#7ab32f] rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-md">
                <span className="text-white text-xl font-bold">P</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white hidden sm:block">
                Platzi
              </span>
            </button>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <div className={`flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl transition-all ${
                searchFocused ? 'ring-2 ring-[#98ca3f] bg-white dark:bg-gray-900 shadow-md' : ''
              }`}>
                <Search className="w-5 h-5 text-gray-400 ml-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  placeholder="Buscar cursos, instructores, temas..."
                  className="flex-1 bg-transparent px-4 py-3 outline-none text-sm text-gray-900 dark:text-white"
                />
                {searchQuery && (
                  <button 
                    onClick={() => handleSearch('')}
                    className="mr-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
                <button className="mr-2 px-4 py-2 bg-[#98ca3f] text-white rounded-lg hover:bg-[#87b935] transition-colors text-sm font-medium hidden lg:block">
                  Buscar
                </button>
              </div>

              {/* Search Suggestions Dropdown */}
              {searchFocused && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Búsquedas populares</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {quickSearchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                      >
                        <span className="text-2xl">{suggestion.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{suggestion.text}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{suggestion.category}</p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Presiona Enter para buscar</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-xs">↵</kbd>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Explore Button - Desktop */}
            <button className="hidden lg:flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">Explorar</span>
            </button>

            {/* XP Display - Desktop */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">2,450 XP</span>
            </div>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Notifications */}
            <button 
              onClick={onNotificationsClick}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button 
              onClick={onCartClick}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#98ca3f] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Profile */}
            <button 
              onClick={() => onNavigate?.('profile')}
              className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium hidden xl:block text-gray-900 dark:text-white">Mi Perfil</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-gray-100 dark:bg-gray-800 pl-10 pr-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#98ca3f] text-sm text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Navigation - Desktop */}
        <div className="hidden lg:block">
          <Navigation currentPage={currentPage} onNavigate={onNavigate || (() => {})} />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f172a]">
          <div className="p-4">
            <Navigation currentPage={currentPage} onNavigate={(page) => {
              onNavigate?.(page);
              setIsMenuOpen(false);
            }} />
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">Explorar Cursos</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">Tu XP</p>
                  <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">2,450 XP</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}