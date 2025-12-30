import { ReactNode } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  BarChart3, 
  Image as ImageIcon, 
  FileText,
  ShoppingBag,
  MessageSquare,
  Award,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
  Shield,
  LogOut,
  Sun,
  Moon,
  Zap,
  Wrench,
  Wifi,
  Activity,
  FolderOpen,
  Edit3
} from 'lucide-react';
import { useState } from 'react';

export type AdminPage = 
  | 'dashboard' 
  | 'courses' 
  | 'documentation'
  | 'documents'
  | 'users' 
  | 'analytics' 
  | 'media' 
  | 'blog' 
  | 'settings'
  | 'orders'
  | 'reviews'
  | 'gamification'
  | 'performance'
  | 'monitoring'
  | 'security'
  | 'devtools'
  | 'sync';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onExitAdmin: () => void;
}

export function AdminLayout({ children, currentPage, onNavigate, onExitAdmin }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'courses', label: 'Cursos', icon: BookOpen, color: 'text-green-500' },
    { id: 'documentation', label: 'Documentación', icon: FolderOpen, color: 'text-gray-500' },
    { id: 'documents', label: 'Documentos', icon: Edit3, color: 'text-gray-500' },
    { id: 'users', label: 'Usuarios', icon: Users, color: 'text-purple-500' },
    { id: 'blog', label: 'Blog', icon: FileText, color: 'text-indigo-500' },
    { id: 'reviews', label: 'Reseñas', icon: MessageSquare, color: 'text-yellow-500' },
    { id: 'orders', label: 'Órdenes', icon: ShoppingBag, color: 'text-pink-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-orange-500' },
    { id: 'gamification', label: 'Gamificación', icon: Award, color: 'text-red-500' },
    { id: 'media', label: 'Biblioteca', icon: ImageIcon, color: 'text-cyan-500' },
    { id: 'performance', label: 'Rendimiento', icon: Zap, color: 'text-teal-500' },
    { id: 'monitoring', label: 'Monitoring', icon: Activity, color: 'text-violet-500' },
    { id: 'security', label: 'Seguridad', icon: Shield, color: 'text-gray-500' },
    { id: 'devtools', label: 'Dev Tools', icon: Wrench, color: 'text-slate-500' },
    { id: 'sync', label: 'Sincronización', icon: Wifi, color: 'text-emerald-500' },
    { id: 'settings', label: 'Configuración', icon: Settings, color: 'text-gray-500' },
  ] as const;

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-50 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Logo Header */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
          {isSidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Platzi Clone</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors mx-auto"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as AdminPage)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : item.color}`} />
                {isSidebarOpen && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-slate-900">
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title={!isSidebarOpen ? 'Salir del Panel' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Salir del Panel</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cursos, usuarios, configuración..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white placeholder-gray-500"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 ml-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Admin Profile */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Carlos Méndez</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
                </div>
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos"
                  alt="Admin"
                  className="w-10 h-10 rounded-full border-2 border-purple-500"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}