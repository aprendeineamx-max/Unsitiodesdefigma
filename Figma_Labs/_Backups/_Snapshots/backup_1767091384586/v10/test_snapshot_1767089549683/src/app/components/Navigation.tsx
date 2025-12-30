import { Home, BookOpen, MessageSquare, Users as UsersIcon, GraduationCap, Trophy, MessageCircle, Newspaper, Sparkles, DollarSign, FileText, Rss, Video, Image as ImageIcon, Radio, Share2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export type PageType = 'home' | 'courses' | 'feed' | 'forum' | 'wiki' | 'blog' | 'blogPost' | 'profile' | 'learning' | 'shop' | 'groups' | 'admin' | 'certificates' | 'calendar' | 'messages' | 'analytics' | 'gamification' | 'pricing' | 'social' | 'stories' | 'reels' | 'live';

interface NavigationProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (openDropdown && buttonRefs.current[openDropdown]) {
      const button = buttonRefs.current[openDropdown];
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap below button
        left: rect.left
      });
    }
  }, [openDropdown]);

  const navItems = [
    { 
      id: 'home' as PageType, 
      label: 'Inicio', 
      icon: Home,
      description: 'Descubre cursos'
    },
    { 
      id: 'learning' as PageType, 
      label: 'Mi Aprendizaje', 
      icon: GraduationCap,
      description: 'Tus cursos activos',
      badge: 3
    },
    { 
      id: 'gamification' as PageType, 
      label: 'Logros', 
      icon: Trophy,
      description: 'XP y badges',
      isNew: true
    },
    { 
      id: 'blog' as PageType, 
      label: 'Blog', 
      icon: FileText,
      description: 'Artículos y tutoriales',
      hasDropdown: true,
      dropdownItems: [
        { id: 'blog' as PageType, label: 'Todos los artículos', icon: Rss, description: 'Ver todos' },
        { id: 'blogPost' as PageType, label: 'Artículo destacado', icon: Sparkles, description: 'Lo más leído' },
      ]
    },
    { 
      id: 'social' as PageType, 
      label: 'Social', 
      icon: Share2,
      description: 'Red social',
      isNew: true,
      hasDropdown: true,
      dropdownItems: [
        { id: 'feed' as PageType, label: 'Feed', icon: Newspaper, description: 'Publicaciones' },
        { id: 'stories' as PageType, label: 'Stories', icon: ImageIcon, description: 'Historias 24h' },
        { id: 'reels' as PageType, label: 'Reels', icon: Video, description: 'Videos cortos' },
        { id: 'live' as PageType, label: 'En Vivo', icon: Radio, description: 'Transmisiones', badge: 'LIVE' },
      ]
    },
    { 
      id: 'groups' as PageType, 
      label: 'Grupos', 
      icon: UsersIcon,
      description: 'Grupos de estudio'
    },
    { 
      id: 'messages' as PageType, 
      label: 'Mensajes', 
      icon: MessageCircle,
      description: 'Chat privado',
      badge: 2
    },
    { 
      id: 'pricing' as PageType, 
      label: 'Precios', 
      icon: DollarSign,
      description: 'Planes y precios'
    },
  ];

  return (
    <nav className="relative">
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.hasDropdown && item.dropdownItems?.some(d => d.id === currentPage));
          const isOpen = openDropdown === item.id;
          
          return (
            <div key={item.id} className="relative">
              <button
                ref={(el) => (buttonRefs.current[item.id] = el)}
                onClick={() => {
                  if (item.hasDropdown) {
                    setOpenDropdown(isOpen ? null : item.id);
                  } else {
                    onNavigate(item.id);
                    setOpenDropdown(null);
                  }
                }}
                onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.id)}
                className={`
                  group relative flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-[#98ca3f] text-white shadow-md' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                  {typeof item.badge === 'number' && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-white' : ''}`}>
                  {item.label}
                </span>
                {item.isNew && (
                  <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                    NUEVO
                  </span>
                )}
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
                )}
              </button>

              {/* Dropdown Menu */}
              {item.hasDropdown && isOpen && dropdownPosition && (
                <div 
                  className="fixed w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[200] animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`
                  }}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <div className="p-2">
                    {item.dropdownItems?.map((dropdownItem) => {
                      const DropdownIcon = dropdownItem.icon;
                      const isDropdownActive = currentPage === dropdownItem.id;
                      
                      return (
                        <button
                          key={dropdownItem.id}
                          onClick={() => {
                            onNavigate(dropdownItem.id);
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg transition-all ${
                            isDropdownActive
                              ? 'bg-[#98ca3f]/10 border-l-2 border-[#98ca3f]'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <DropdownIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            isDropdownActive ? 'text-[#98ca3f]' : 'text-gray-600 dark:text-gray-400'
                          }`} />
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium text-sm ${
                                isDropdownActive ? 'text-[#98ca3f]' : 'text-gray-900 dark:text-white'
                              }`}>
                                {dropdownItem.label}
                              </span>
                              {dropdownItem.badge === 'LIVE' && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                  LIVE
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {dropdownItem.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.hasDropdown && item.dropdownItems?.some(d => d.id === currentPage));
          const isOpen = openDropdown === item.id;
          
          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.hasDropdown) {
                    setOpenDropdown(isOpen ? null : item.id);
                  } else {
                    onNavigate(item.id);
                  }
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-[#98ca3f] text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                  {typeof item.badge === 'number' && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isActive ? 'text-white' : ''}`}>
                      {item.label}
                    </span>
                    {item.isNew && (
                      <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                        NUEVO
                      </span>
                    )}
                  </div>
                  <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {item.description}
                  </p>
                </div>
              </button>

              {/* Mobile Dropdown */}
              {item.hasDropdown && isOpen && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.dropdownItems?.map((dropdownItem) => {
                    const DropdownIcon = dropdownItem.icon;
                    const isDropdownActive = currentPage === dropdownItem.id;
                    
                    return (
                      <button
                        key={dropdownItem.id}
                        onClick={() => {
                          onNavigate(dropdownItem.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                          isDropdownActive
                            ? 'bg-[#98ca3f]/20 border-l-2 border-[#98ca3f]'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <DropdownIcon className={`w-4 h-4 ${
                          isDropdownActive ? 'text-[#98ca3f]' : 'text-gray-500 dark:text-gray-400'
                        }`} />
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              isDropdownActive ? 'text-[#98ca3f]' : 'text-gray-900 dark:text-white'
                            }`}>
                              {dropdownItem.label}
                            </span>
                            {dropdownItem.badge === 'LIVE' && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                LIVE
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}