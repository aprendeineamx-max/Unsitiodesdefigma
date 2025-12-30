import { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Eye,
  Clock,
  Star,
  Award,
  ShoppingCart,
  UserPlus,
  Activity,
  Download,
  Filter,
  Calendar,
  Globe,
  Zap,
  Target,
  ThumbsUp,
  MessageSquare,
  Video,
  FileText,
  TrendingDown,
  Percent,
  CreditCard,
  UserMinus,
  AlertCircle,
  CheckCircle,
  XCircle,
  PlayCircle,
  Settings,
  Database,
  Wrench,
  Wifi
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState('7days');
  const [activeMetric, setActiveMetric] = useState('all');

  // Enhanced Stats Cards Data
  const stats = [
    {
      label: 'Usuarios Totales',
      value: '12,845',
      change: '+12.5%',
      changeValue: '+1,425',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      lightBg: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      detail: 'Nuevos esta semana'
    },
    {
      label: 'Cursos Activos',
      value: '156',
      change: '+8.2%',
      changeValue: '+12',
      trend: 'up',
      icon: BookOpen,
      color: 'from-green-500 to-emerald-500',
      lightBg: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      detail: 'Publicados este mes'
    },
    {
      label: 'Ingresos del Mes',
      value: '$48,350',
      change: '+23.1%',
      changeValue: '+$9,075',
      trend: 'up',
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500',
      lightBg: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      detail: 'vs mes anterior'
    },
    {
      label: 'Tasa Conversión',
      value: '3.2%',
      change: '-0.5%',
      changeValue: '-0.5%',
      trend: 'down',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      lightBg: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      detail: 'Último mes'
    },
    {
      label: 'Engagement Rate',
      value: '68.4%',
      change: '+5.3%',
      changeValue: '+5.3%',
      trend: 'up',
      icon: Activity,
      color: 'from-indigo-500 to-purple-500',
      lightBg: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      detail: 'Usuarios activos'
    },
    {
      label: 'Cursos Completados',
      value: '2,847',
      change: '+18.7%',
      changeValue: '+449',
      trend: 'up',
      icon: Award,
      color: 'from-yellow-500 to-orange-500',
      lightBg: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      detail: 'Este mes'
    },
    {
      label: 'Tiempo Promedio',
      value: '42min',
      change: '+12.3%',
      changeValue: '+5min',
      trend: 'up',
      icon: Clock,
      color: 'from-pink-500 to-rose-500',
      lightBg: 'bg-pink-50 dark:bg-pink-900/20',
      textColor: 'text-pink-600 dark:text-pink-400',
      detail: 'Por sesión'
    },
    {
      label: 'Rating Promedio',
      value: '4.8',
      change: '+0.2',
      changeValue: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'from-amber-500 to-yellow-500',
      lightBg: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
      detail: 'De 5 estrellas'
    }
  ];

  // Real-time metrics
  const realTimeMetrics = [
    { label: 'Usuarios Online', value: '1,234', icon: Eye, color: 'text-green-500' },
    { label: 'Viendo Videos', value: '456', icon: PlayCircle, color: 'text-purple-500' },
    { label: 'En Quiz', value: '89', icon: FileText, color: 'text-blue-500' },
    { label: 'Comprando', value: '23', icon: ShoppingCart, color: 'text-orange-500' }
  ];

  // Revenue Chart Data - Extended
  const revenueData = [
    { month: 'Ene', revenue: 28500, users: 450, courses: 125 },
    { month: 'Feb', revenue: 32000, users: 520, courses: 132 },
    { month: 'Mar', revenue: 35400, users: 580, courses: 138 },
    { month: 'Abr', revenue: 38200, users: 640, courses: 145 },
    { month: 'May', revenue: 42100, users: 720, courses: 151 },
    { month: 'Jun', revenue: 48350, users: 850, courses: 156 }
  ];

  // User Growth Data
  const userGrowthData = [
    { day: 'Lun', active: 2340, new: 145, returning: 2195 },
    { day: 'Mar', active: 2580, new: 168, returning: 2412 },
    { day: 'Mié', active: 2456, new: 152, returning: 2304 },
    { day: 'Jue', active: 2890, new: 198, returning: 2692 },
    { day: 'Vie', active: 2765, new: 178, returning: 2587 },
    { day: 'Sáb', active: 2120, new: 134, returning: 1986 },
    { day: 'Dom', active: 1980, new: 112, returning: 1868 }
  ];

  // Course Completion Data
  const completionData = [
    { day: 'Lun', completed: 45, started: 78, abandoned: 12 },
    { day: 'Mar', completed: 52, started: 85, abandoned: 15 },
    { day: 'Mié', completed: 48, started: 72, abandoned: 10 },
    { day: 'Jue', completed: 61, started: 92, abandoned: 18 },
    { day: 'Vie', completed: 55, started: 88, abandoned: 14 },
    { day: 'Sáb', completed: 38, started: 65, abandoned: 11 },
    { day: 'Dom', completed: 42, started: 68, abandoned: 9 }
  ];

  // Category Distribution
  const categoryData = [
    { name: 'Desarrollo', value: 35, color: '#3b82f6', students: 4500 },
    { name: 'Diseño', value: 25, color: '#8b5cf6', students: 3200 },
    { name: 'Marketing', value: 20, color: '#10b981', students: 2580 },
    { name: 'Data Science', value: 12, color: '#f59e0b', students: 1545 },
    { name: 'Otros', value: 8, color: '#6b7280', students: 1020 }
  ];

  // Performance Metrics Radar
  const performanceData = [
    { metric: 'Engagement', value: 85, fullMark: 100 },
    { metric: 'Satisfacción', value: 92, fullMark: 100 },
    { metric: 'Retención', value: 78, fullMark: 100 },
    { metric: 'Conversión', value: 68, fullMark: 100 },
    { metric: 'Completación', value: 74, fullMark: 100 },
    { metric: 'Recomendación', value: 88, fullMark: 100 }
  ];

  // Recent Activity - Enhanced
  const recentActivity = [
    {
      id: 1,
      user: 'María García',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      action: 'completó el curso',
      item: 'React Avanzado 2024',
      time: 'Hace 2 minutos',
      type: 'completion',
      icon: Award,
      color: 'text-green-600'
    },
    {
      id: 2,
      user: 'Carlos Rodríguez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      action: 'publicó en el blog',
      item: '10 Tips para Aprender JavaScript',
      time: 'Hace 8 minutos',
      type: 'blog',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      id: 3,
      user: 'Ana Martínez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      action: 'compró el plan',
      item: 'Premium Anual - $499',
      time: 'Hace 15 minutos',
      type: 'purchase',
      icon: ShoppingCart,
      color: 'text-purple-600'
    },
    {
      id: 4,
      user: 'Juan López',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
      action: 'dejó una reseña 5⭐',
      item: 'TypeScript Fundamentals',
      time: 'Hace 22 minutos',
      type: 'review',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      id: 5,
      user: 'Laura Sánchez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
      action: 'se registró como nuevo usuario',
      item: 'Plan Free',
      time: 'Hace 35 minutos',
      type: 'signup',
      icon: UserPlus,
      color: 'text-indigo-600'
    }
  ];

  // Top Courses - Enhanced
  const topCourses = [
    {
      title: 'Complete JavaScript Course 2024',
      instructor: 'Jonas Schmedtmann',
      students: 2845,
      revenue: '$12,450',
      rating: 4.9,
      growth: '+15%',
      completion: 78,
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=100&h=100&fit=crop'
    },
    {
      title: 'React - The Complete Guide',
      instructor: 'Maximilian Schwarzmüller',
      students: 2340,
      revenue: '$10,200',
      rating: 4.8,
      growth: '+12%',
      completion: 82,
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop'
    },
    {
      title: 'Python for Data Science',
      instructor: 'Dr. Anna Smith',
      students: 1980,
      revenue: '$8,900',
      rating: 4.7,
      growth: '+18%',
      completion: 71,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop'
    },
    {
      title: 'UI/UX Design Masterclass',
      instructor: 'Mike Chen',
      students: 1650,
      revenue: '$7,250',
      rating: 4.9,
      growth: '+10%',
      completion: 85,
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&h=100&fit=crop'
    }
  ];

  // Quick Actions
  const quickActions = [
    { label: 'Nuevo Curso', icon: BookOpen, color: 'from-green-500 to-emerald-500' },
    { label: 'Nuevo Usuario', icon: UserPlus, color: 'from-blue-500 to-cyan-500' },
    { label: 'Ver Reportes', icon: BarChart, color: 'from-purple-500 to-pink-500' },
    { label: 'Configuración', icon: Settings, color: 'from-orange-500 to-red-500' }
  ];

  // Alerts & Notifications
  const alerts = [
    { type: 'warning', message: '3 cursos pendientes de revisión', icon: AlertCircle, count: 3 },
    { type: 'success', message: '12 nuevas reseñas positivas', icon: CheckCircle, count: 12 },
    { type: 'info', message: '5 usuarios reportaron problemas', icon: MessageSquare, count: 5 }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bienvenido de vuelta, aquí está tu resumen en tiempo real
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <option value="today">Hoy</option>
            <option value="7days">Últimos 7 días</option>
            <option value="30days">Últimos 30 días</option>
            <option value="90days">Últimos 3 meses</option>
            <option value="year">Este año</option>
          </select>
          <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar Reporte</span>
          </button>
        </div>
      </div>

      {/* Real-time Metrics Bar */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-bold">Métricas en Tiempo Real</span>
          </div>
          <span className="text-white/80 text-sm">Actualizado hace 30 seg</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {realTimeMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{metric.value}</p>
                    <p className="text-xs text-white/80 font-medium">{metric.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert, index) => (
          <div 
            key={index}
            className={`p-4 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all hover:scale-105 ${
              alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' :
              alert.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
            }`}
          >
            <div className={`p-2 rounded-lg ${
              alert.type === 'warning' ? 'bg-yellow-200 dark:bg-yellow-800' :
              alert.type === 'success' ? 'bg-green-200 dark:bg-green-800' :
              'bg-blue-200 dark:bg-blue-800'
            }`}>
              <alert.icon className={`w-5 h-5 ${
                alert.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                alert.type === 'success' ? 'text-green-700 dark:text-green-300' :
                'text-blue-700 dark:text-blue-300'
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{alert.message}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              alert.type === 'warning' ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
              alert.type === 'success' ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' :
              'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
            }`}>
              {alert.count}
            </span>
          </div>
        ))}
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUp : ArrowDown;
          
          return (
            <div 
              key={index} 
              className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-bold ${
                  stat.trend === 'up' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                {stat.label}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-500">{stat.detail}</span>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{stat.changeValue}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Growth Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ingresos y Crecimiento</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Evolución mensual</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                Ingresos
              </button>
              <button className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                Usuarios
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: '#fff',
                  padding: '12px'
                }} 
              />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Activity Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Actividad de Usuarios</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Última semana</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: '#fff',
                  padding: '12px'
                }} 
              />
              <Legend />
              <Bar dataKey="new" fill="#10b981" radius={[8, 8, 0, 0]} name="Nuevos" />
              <Bar dataKey="returning" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Recurrentes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Radar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Métricas de Rendimiento</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" stroke="#9ca3af" style={{ fontSize: '11px' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar name="Rendimiento" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Categorías Populares</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: '#fff'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 dark:text-gray-500 text-xs">{category.students} estudiantes</span>
                  <span className="font-bold text-gray-900 dark:text-white">{category.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Completion Trend */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tendencia de Completación</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '11px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: '#fff'
                }} 
              />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
              <Line type="monotone" dataKey="started" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
              <Line type="monotone" dataKey="abandoned" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Courses */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cursos Más Vendidos</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Top 4 este mes</p>
            </div>
            <button className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">
              Ver todos →
            </button>
          </div>
          <div className="space-y-4">
            {topCourses.map((course, index) => (
              <div key={index} className="group flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-xl hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg">
                      #{index + 1}
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {course.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Por {course.instructor}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-semibold">
                      <Users className="w-3 h-3" />
                      {course.students.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full font-semibold">
                      <Star className="w-3 h-3" />
                      {course.rating}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-semibold">
                      <TrendingUp className="w-3 h-3" />
                      {course.growth}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-xl font-black text-gray-900 dark:text-white">{course.revenue}</p>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Completación</p>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: `${course.completion}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{course.completion}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Actividad Reciente</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Últimas acciones</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  <img 
                    src={activity.avatar} 
                    alt={activity.user}
                    className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-gray-200 dark:border-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white mb-1">
                      <span className="font-bold">{activity.user}</span>{' '}
                      <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {activity.item}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    activity.type === 'completion' ? 'bg-green-100 dark:bg-green-900/30' :
                    activity.type === 'purchase' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    activity.type === 'review' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    activity.type === 'signup' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <Icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}