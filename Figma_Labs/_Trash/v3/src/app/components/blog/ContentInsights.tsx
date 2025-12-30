import { useState } from 'react';
import {
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Users,
  Globe,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface ContentInsightsProps {
  postId: string;
  stats: {
    views: number;
    viewsChange: number; // percentage
    likes: number;
    likesChange: number;
    comments: number;
    commentsChange: number;
    shares: number;
    sharesChange: number;
    readTime: number;
    avgReadTime: number;
    completionRate: number; // percentage
    bookmarks: number;
    bookmarksChange: number;
  };
  demographics?: {
    topCountries: Array<{ country: string; percentage: number; flag: string }>;
    topReferrers: Array<{ source: string; percentage: number; visits: number }>;
    deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  };
  timeStats?: {
    viewsByDay: Array<{ day: string; views: number }>;
    peakHours: Array<{ hour: number; views: number }>;
  };
  variant?: 'dashboard' | 'detailed' | 'compact';
}

export function ContentInsights({
  postId,
  stats,
  demographics,
  timeStats,
  variant = 'dashboard'
}: ContentInsightsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'engagement'>('views');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4" />;
    if (change < 0) return <ArrowDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const engagementRate = ((stats.likes + stats.comments + stats.shares) / stats.views * 100).toFixed(2);
  const totalInteractions = stats.likes + stats.comments + stats.shares + stats.bookmarks;

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Estadísticas</h3>
          <Activity className="w-5 h-5 text-[#98CA3F]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.views.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Vistas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {engagementRate}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Engagement</div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A2540] to-[#0F3554] rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-6 h-6 text-[#98CA3F]" />
                <h2 className="text-2xl font-bold">Análisis de Contenido</h2>
              </div>
              <p className="text-white/80">Estadísticas detalladas de rendimiento</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-[#98CA3F]"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="all">Todo el tiempo</option>
            </select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold mb-1">{stats.views.toLocaleString()}</div>
              <div className="text-sm text-white/80 mb-2">Vistas Totales</div>
              <div className={`flex items-center gap-1 text-sm ${getChangeColor(stats.viewsChange)}`}>
                {getChangeIcon(stats.viewsChange)}
                <span>{Math.abs(stats.viewsChange)}%</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold mb-1">{engagementRate}%</div>
              <div className="text-sm text-white/80 mb-2">Tasa de Engagement</div>
              <div className="text-sm text-white/60">
                {totalInteractions} interacciones
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold mb-1">{stats.completionRate}%</div>
              <div className="text-sm text-white/80 mb-2">Tasa de Lectura</div>
              <div className="text-sm text-white/60">
                {stats.avgReadTime} min promedio
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold mb-1">{stats.bookmarks}</div>
              <div className="text-sm text-white/80 mb-2">Guardados</div>
              <div className={`flex items-center gap-1 text-sm ${getChangeColor(stats.bookmarksChange)}`}>
                {getChangeIcon(stats.bookmarksChange)}
                <span>{Math.abs(stats.bookmarksChange)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interaction Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Desglose de Interacciones
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.likes.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Likes</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${getChangeColor(stats.likesChange)}`}>
                  {getChangeIcon(stats.likesChange)}
                  {Math.abs(stats.likesChange)}%
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.comments.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Comentarios</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${getChangeColor(stats.commentsChange)}`}>
                  {getChangeIcon(stats.commentsChange)}
                  {Math.abs(stats.commentsChange)}%
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.shares.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Compartidos</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${getChangeColor(stats.sharesChange)}`}>
                  {getChangeIcon(stats.sharesChange)}
                  {Math.abs(stats.sharesChange)}%
                </div>
              </div>
            </div>

            {/* Right: Distribution */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Distribución de Interacciones
              </h4>
              <div className="space-y-3">
                {[
                  { label: 'Likes', value: stats.likes, color: '#EF4444', icon: Heart },
                  { label: 'Comentarios', value: stats.comments, color: '#3B82F6', icon: MessageCircle },
                  { label: 'Compartidos', value: stats.shares, color: '#10B981', icon: Share2 },
                  { label: 'Guardados', value: stats.bookmarks, color: '#F59E0B', icon: Target }
                ].map((item) => {
                  const percentage = (item.value / totalInteractions * 100).toFixed(1);
                  const Icon = item.icon;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" style={{ color: item.color }} />
                          <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {item.value} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Demographics */}
        {demographics && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Countries */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-[#98CA3F]" />
                <h3 className="font-bold text-gray-900 dark:text-white">Top Países</h3>
              </div>
              <div className="space-y-3">
                {demographics.topCountries.map((country, index) => (
                  <div key={country.country} className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {country.country}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {country.percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#98CA3F] to-[#7fb32f] rounded-full"
                          style={{ width: `${country.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Referrers */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#98CA3F]" />
                <h3 className="font-bold text-gray-900 dark:text-white">Fuentes de Tráfico</h3>
              </div>
              <div className="space-y-3">
                {demographics.topReferrers.map((referrer) => (
                  <div key={referrer.source} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {referrer.source}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {referrer.visits.toLocaleString()} visitas
                      </div>
                    </div>
                    <div className="text-lg font-bold text-[#98CA3F]">
                      {referrer.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Device Breakdown */}
        {demographics && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-[#98CA3F]" />
              <h3 className="font-bold text-gray-900 dark:text-white">Dispositivos</h3>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Desktop', value: demographics.deviceBreakdown.desktop, color: '#3B82F6', icon: '💻' },
                { label: 'Mobile', value: demographics.deviceBreakdown.mobile, color: '#10B981', icon: '📱' },
                { label: 'Tablet', value: demographics.deviceBreakdown.tablet, color: '#F59E0B', icon: '📱' }
              ].map((device) => (
                <div key={device.label} className="text-center">
                  <div className="text-4xl mb-3">{device.icon}</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {device.value}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{device.label}</div>
                  <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${device.value}%`,
                        backgroundColor: device.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reading Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-[#98CA3F]" />
            <h3 className="font-bold text-gray-900 dark:text-white">Estadísticas de Lectura</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.readTime} min
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tiempo estimado de lectura
              </div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.avgReadTime} min
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tiempo promedio real
              </div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.completionRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tasa de finalización
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard variant (default)
  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Estadísticas de Rendimiento
        </h2>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setSelectedMetric('views')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              selectedMetric === 'views'
                ? 'bg-white dark:bg-gray-800 text-[#98CA3F] shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Vistas
          </button>
          <button
            onClick={() => setSelectedMetric('engagement')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              selectedMetric === 'engagement'
                ? 'bg-white dark:bg-gray-800 text-[#98CA3F] shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Engagement
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vistas</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {stats.views.toLocaleString()}
          </div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${getChangeColor(stats.viewsChange)}`}>
            {getChangeIcon(stats.viewsChange)}
            {Math.abs(stats.viewsChange)}% vs período anterior
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Likes</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {stats.likes.toLocaleString()}
          </div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${getChangeColor(stats.likesChange)}`}>
            {getChangeIcon(stats.likesChange)}
            {Math.abs(stats.likesChange)}% vs período anterior
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Comentarios</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {stats.comments.toLocaleString()}
          </div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${getChangeColor(stats.commentsChange)}`}>
            {getChangeIcon(stats.commentsChange)}
            {Math.abs(stats.commentsChange)}% vs período anterior
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {engagementRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Tasa de interacción
          </div>
        </div>
      </div>
    </div>
  );
}
