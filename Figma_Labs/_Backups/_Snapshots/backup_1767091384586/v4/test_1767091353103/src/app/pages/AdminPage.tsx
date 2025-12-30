import { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  Settings,
  TrendingUp,
  FileText,
  Image,
  Video,
  Award,
  DollarSign,
  Bell,
  Shield,
  Database,
  Globe,
  Zap,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Check,
  X,
  AlertCircle,
  Download,
  Upload,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  UserX,
  Mail,
  Lock,
  Unlock,
  RefreshCw,
  Save,
  Copy,
  ExternalLink
} from 'lucide-react';

type AdminSection = 
  | 'dashboard'
  | 'courses'
  | 'blog'
  | 'forum'
  | 'groups'
  | 'social'
  | 'messages'
  | 'users'
  | 'subscriptions'
  | 'settings'
  | 'analytics';

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
}

export function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const menuItems = [
    {
      id: 'dashboard' as AdminSection,
      label: 'Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-600'
    },
    {
      id: 'courses' as AdminSection,
      label: 'Cursos',
      icon: BookOpen,
      color: 'text-green-600',
      badge: 52
    },
    {
      id: 'blog' as AdminSection,
      label: 'Blog',
      icon: FileText,
      color: 'text-purple-600',
      badge: 145
    },
    {
      id: 'forum' as AdminSection,
      label: 'Foro',
      icon: MessageSquare,
      color: 'text-orange-600',
      badge: 1243
    },
    {
      id: 'groups' as AdminSection,
      label: 'Grupos',
      icon: Users,
      color: 'text-cyan-600',
      badge: 87
    },
    {
      id: 'social' as AdminSection,
      label: 'Red Social',
      icon: Image,
      color: 'text-pink-600',
      badge: 3421
    },
    {
      id: 'messages' as AdminSection,
      label: 'Mensajería',
      icon: Mail,
      color: 'text-indigo-600'
    },
    {
      id: 'users' as AdminSection,
      label: 'Usuarios',
      icon: UserCheck,
      color: 'text-red-600',
      badge: 50234
    },
    {
      id: 'subscriptions' as AdminSection,
      label: 'Suscripciones',
      icon: DollarSign,
      color: 'text-yellow-600'
    },
    {
      id: 'analytics' as AdminSection,
      label: 'Analytics',
      icon: BarChart3,
      color: 'text-emerald-600'
    },
    {
      id: 'settings' as AdminSection,
      label: 'Configuración',
      icon: Settings,
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Panel de Administración
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gestiona todos los aspectos de tu plataforma
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#98ca3f] focus:border-transparent"
                />
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-[#98ca3f] hover:bg-[#87b935] text-white rounded-lg font-medium transition-colors">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo</span>
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* Sidebar */}
        <div className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#98ca3f] text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Sidebar (Dropdown) */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value as AdminSection)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-medium shadow-lg"
          >
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} {item.badge ? `(${item.badge})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
          {activeSection === 'dashboard' && <DashboardSection />}
          {activeSection === 'courses' && <CoursesSection />}
          {activeSection === 'blog' && <BlogSection />}
          {activeSection === 'forum' && <ForumSection />}
          {activeSection === 'groups' && <GroupsSection />}
          {activeSection === 'social' && <SocialSection />}
          {activeSection === 'messages' && <MessagesSection />}
          {activeSection === 'users' && <UsersSection />}
          {activeSection === 'subscriptions' && <SubscriptionsSection />}
          {activeSection === 'analytics' && <AnalyticsSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </div>
      </div>
    </div>
  );
}

// Dashboard Section
function DashboardSection() {
  const stats: StatCard[] = [
    {
      title: 'Total Usuarios',
      value: '50,234',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Cursos Activos',
      value: '52',
      change: '+3 nuevos',
      trend: 'up',
      icon: BookOpen,
      color: 'bg-green-500'
    },
    {
      title: 'Ingresos del Mes',
      value: '$127,543',
      change: '+23.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      title: 'Posts Activos',
      value: '3,421',
      change: '+156 hoy',
      trend: 'up',
      icon: FileText,
      color: 'bg-purple-500'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'María García',
      action: 'creó un nuevo curso',
      item: 'React Avanzado 2024',
      time: 'Hace 5 minutos',
      type: 'course'
    },
    {
      id: 2,
      user: 'Carlos Rodríguez',
      action: 'publicó en el blog',
      item: '10 Tips para Aprender JavaScript',
      time: 'Hace 15 minutos',
      type: 'blog'
    },
    {
      id: 3,
      user: 'Ana Martínez',
      action: 'creó un grupo',
      item: 'Python para Data Science',
      time: 'Hace 1 hora',
      type: 'group'
    },
    {
      id: 4,
      user: 'Juan López',
      action: 'reportó un post',
      item: 'Post inapropiado #1234',
      time: 'Hace 2 horas',
      type: 'report'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Growth */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Crecimiento de Usuarios
            </h3>
            <select className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
              <option>Últimos 7 días</option>
              <option>Últimos 30 días</option>
              <option>Últimos 3 meses</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 65, 45, 80, 55, 90, 75].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-[#98ca3f] to-[#87b935] rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Distribución de Ingresos
          </h3>
          <div className="space-y-4">
            {[
              { plan: 'Premium', amount: '$67,234', percentage: 53, color: 'bg-yellow-500' },
              { plan: 'Pro', amount: '$45,123', percentage: 35, color: 'bg-[#98ca3f]' },
              { plan: 'Cursos Individuales', amount: '$15,186', percentage: 12, color: 'bg-blue-500' }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.plan}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.amount}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Actividad Reciente
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.user}</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">
                      {activity.action}
                    </span>{' '}
                    <span className="font-medium">{activity.item}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.time}
                  </p>
                </div>
                <button className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Courses Section
function CoursesSection() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const courses = [
    {
      id: 1,
      title: 'Full Stack Web Development',
      instructor: 'Carlos Fernández',
      students: 15420,
      rating: 4.9,
      price: 299,
      tier: 'Pro',
      status: 'published',
      updated: '2024-01-15'
    },
    {
      id: 2,
      title: 'React Avanzado 2024',
      instructor: 'María García',
      students: 12340,
      rating: 4.8,
      price: 249,
      tier: 'Pro',
      status: 'published',
      updated: '2024-01-14'
    },
    {
      id: 3,
      title: 'Python para Data Science',
      instructor: 'Ana Martínez',
      students: 18900,
      rating: 4.9,
      price: 349,
      tier: 'Premium',
      status: 'published',
      updated: '2024-01-13'
    },
    {
      id: 4,
      title: 'JavaScript Desde Cero',
      instructor: 'Luis Torres',
      students: 25000,
      rating: 4.7,
      price: 0,
      tier: 'Free',
      status: 'published',
      updated: '2024-01-12'
    },
    {
      id: 5,
      title: 'TypeScript Advanced',
      instructor: 'Sofia Ruiz',
      students: 8900,
      rating: 4.8,
      price: 299,
      tier: 'Pro',
      status: 'draft',
      updated: '2024-01-11'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Cursos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {courses.length} cursos totales
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#98ca3f] hover:bg-[#87b935] text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Nuevo Curso
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button className="px-4 py-2 bg-[#98ca3f] text-white rounded-lg text-sm font-medium">
          Todos (52)
        </button>
        <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          Publicados (47)
        </button>
        <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          Borradores (5)
        </button>
        <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          Free (15)
        </button>
        <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          Pro (25)
        </button>
        <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          Premium (12)
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estudiantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {course.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Actualizado {course.updated}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {course.instructor}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {course.students.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {course.rating}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {course.price === 0 ? 'Gratis' : `$${course.price}`}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.tier === 'Free'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        : course.tier === 'Pro'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                    }`}>
                      {course.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.status === 'published'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                    }`}>
                      {course.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {courses.map((course) => (
            <div key={course.id} className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {course.instructor}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  <Users className="w-3 h-3" />
                  {course.students.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  <Award className="w-3 h-3 text-yellow-500" />
                  {course.rating}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  course.tier === 'Free'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    : course.tier === 'Pro'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                }`}>
                  {course.tier}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {course.price === 0 ? 'Gratis' : `$${course.price}`}
                </span>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Blog Section
function BlogSection() {
  const posts = [
    {
      id: 1,
      title: '10 Tips para Aprender JavaScript Rápidamente',
      author: 'Carlos Fernández',
      views: 15420,
      likes: 892,
      comments: 234,
      status: 'published',
      date: '2024-01-15',
      category: 'Tutoriales'
    },
    {
      id: 2,
      title: 'El Futuro del Desarrollo Web en 2024',
      author: 'María García',
      views: 23400,
      likes: 1234,
      comments: 456,
      status: 'published',
      date: '2024-01-14',
      category: 'Tendencias'
    },
    {
      id: 3,
      title: 'Cómo Prepararte para una Entrevista Técnica',
      author: 'Ana Martínez',
      views: 18900,
      likes: 945,
      comments: 321,
      status: 'published',
      date: '2024-01-13',
      category: 'Carrera'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Blog
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            145 publicaciones totales
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-[#98ca3f] hover:bg-[#87b935] text-white rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Nueva Publicación
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Autor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Estadísticas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {post.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {post.date}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {post.author}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        {post.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-4 h-4 text-gray-400" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        {post.comments}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      Publicado
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {posts.map((post) => (
            <div key={post.id} className="p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {post.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span>{post.author}</span>
                <span>•</span>
                <span>{post.date}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="flex items-center gap-1 text-sm">
                  <Eye className="w-4 h-4" />
                  {post.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <Activity className="w-4 h-4" />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <MessageSquare className="w-4 h-4" />
                  {post.comments}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                  {post.category}
                </span>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Forum Section  
function ForumSection() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Foro
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            1,243 discusiones activas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1,243</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Discusiones</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">45,234</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Participantes</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">23</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Reportes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configuración del Foro
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Permitir posts anónimos</span>
            <input type="checkbox" className="toggle" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Moderación automática</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Notificaciones push</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </label>
        </div>
      </div>
    </div>
  );
}

// Groups Section
function GroupsSection() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Grupos de Estudio
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            87 grupos activos
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-[#98ca3f] hover:bg-[#87b935] text-white rounded-lg font-medium">
          <Plus className="w-4 h-4" />
          Crear Grupo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: 'React Developers', members: 1234, posts: 456, status: 'active' },
          { name: 'Python para Data Science', members: 890, posts: 234, status: 'active' },
          { name: 'JavaScript Avanzado', members: 567, posts: 123, status: 'active' }
        ].map((group, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              {group.name}
            </h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Miembros</span>
                <span className="font-medium text-gray-900 dark:text-white">{group.members}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Posts</span>
                <span className="font-medium text-gray-900 dark:text-white">{group.posts}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium">
                Ver
              </button>
              <button className="flex-1 px-3 py-2 bg-[#98ca3f] hover:bg-[#87b935] text-white rounded-lg text-sm font-medium">
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Social Section
function SocialSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Red Social
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          3,421 publicaciones activas
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Posts Totales', value: '3,421', icon: FileText, color: 'bg-blue-500' },
          { label: 'Likes Hoy', value: '12,543', icon: Activity, color: 'bg-red-500' },
          { label: 'Comentarios', value: '8,234', icon: MessageSquare, color: 'bg-green-500' },
          { label: 'Compartidos', value: '2,145', icon: TrendingUp, color: 'bg-purple-500' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className={`${stat.color} p-3 rounded-lg inline-flex mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configuración de Red Social
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Permitir posts públicos</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Moderación de contenido</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Filtro de palabras</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </label>
        </div>
      </div>
    </div>
  );
}

// Messages Section
function MessagesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sistema de Mensajería
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configuración y moderación de chats
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Mensajes Hoy', value: '45,234', icon: Mail },
          { label: 'Conversaciones', value: '12,543', icon: MessageSquare },
          { label: 'Reportes', value: '23', icon: AlertCircle }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <Icon className="w-8 h-8 text-[#98ca3f] mb-3" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configuración de Mensajería
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Cifrado E2E</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Grabación de audio</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Videollamadas</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Archivos adjuntos</span>
            <input type="checkbox" className="toggle" defaultChecked />
          </label>
        </div>
      </div>
    </div>
  );
}

// Users Section
function UsersSection() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Usuarios
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            50,234 usuarios registrados
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-[#98ca3f] hover:bg-[#87b935] text-white rounded-lg font-medium">
          <UserCheck className="w-4 h-4" />
          Agregar Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Usuarios', value: '50,234', color: 'bg-blue-500' },
          { label: 'Activos Hoy', value: '12,543', color: 'bg-green-500' },
          { label: 'Plan Premium', value: '2,145', color: 'bg-yellow-500' },
          { label: 'Plan Pro', value: '8,234', color: 'bg-purple-500' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Usuarios Recientes
          </h3>
          <button className="text-sm text-[#98ca3f] hover:underline">
            Ver todos
          </button>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Juan Pérez', email: 'juan@example.com', plan: 'Premium', status: 'active' },
            { name: 'María García', email: 'maria@example.com', plan: 'Pro', status: 'active' },
            { name: 'Carlos López', email: 'carlos@example.com', plan: 'Free', status: 'active' }
          ].map((user, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#98ca3f] rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name[0]}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-semibold rounded">
                  {user.plan}
                </span>
                <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Subscriptions Section
function SubscriptionsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Suscripciones
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Administra planes y pagos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { plan: 'Free', users: 38234, revenue: '$0', color: 'bg-gray-500' },
          { plan: 'Pro', users: 8234, revenue: '$238,782', color: 'bg-green-500' },
          { plan: 'Premium', users: 2145, revenue: '$126,555', color: 'bg-yellow-500' }
        ].map((sub, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className={`${sub.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Plan {sub.plan}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Usuarios</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {sub.users.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Ingresos</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {sub.revenue}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Analytics Section
function AnalyticsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Métricas y estadísticas de la plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Páginas vistas', value: '1.2M', change: '+12%', icon: Eye },
          { label: 'Usuarios activos', value: '45K', change: '+8%', icon: Users },
          { label: 'Tasa conversión', value: '3.2%', change: '+0.5%', icon: TrendingUp },
          { label: 'Tiempo promedio', value: '18m', change: '+3m', icon: Clock }
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-8 h-8 text-[#98ca3f]" />
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                  {metric.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {metric.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tráfico por Fuente
        </h3>
        <div className="space-y-3">
          {[
            { source: 'Búsqueda Orgánica', percentage: 45, color: 'bg-blue-500' },
            { source: 'Redes Sociales', percentage: 30, color: 'bg-purple-500' },
            { source: 'Directo', percentage: 15, color: 'bg-green-500' },
            { source: 'Referidos', percentage: 10, color: 'bg-yellow-500' }
          ].map((traffic, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {traffic.source}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {traffic.percentage}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${traffic.color} rounded-full`}
                  style={{ width: `${traffic.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Settings Section
function SettingsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuración General
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Ajustes globales de la plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configuración General
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Sitio
              </label>
              <input
                type="text"
                defaultValue="Platzi Clone"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email de Contacto
              </label>
              <input
                type="email"
                defaultValue="contact@platzi-clone.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zona Horaria
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>UTC-5 (Lima, Bogotá)</option>
                <option>UTC-6 (Ciudad de México)</option>
                <option>UTC-3 (Buenos Aires)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Seguridad
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">2FA Obligatorio</span>
              <input type="checkbox" className="toggle" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">SSL/HTTPS</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Backup Automático</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Rate Limiting</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configuración de Email
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Emails de Bienvenida</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Newsletter Semanal</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Notificaciones Sistema</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Rendimiento
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Caché CDN</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Compresión Gzip</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Lazy Loading</span>
              <input type="checkbox" className="toggle" defaultChecked />
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#98ca3f] hover:bg-[#87b935] text-white rounded-lg font-medium transition-colors">
          <Save className="w-4 h-4" />
          Guardar Cambios
        </button>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
          <RefreshCw className="w-4 h-4" />
          Restaurar Valores
        </button>
      </div>
    </div>
  );
}
