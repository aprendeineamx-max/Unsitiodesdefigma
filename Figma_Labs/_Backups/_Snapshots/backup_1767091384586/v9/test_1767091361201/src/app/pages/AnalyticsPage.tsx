import { TrendingUp, Users, Eye, DollarSign, Clock, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';
import { useEffect, useState } from 'react';

export function AnalyticsPage() {
  const { getAnalytics } = useAnalytics();
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueUsers: 0,
    avgSessionTime: 0,
    conversionRate: 0,
    topPages: [] as { page: string; views: number }[],
    topCourses: [] as { name: string; views: number }[],
    searchQueries: [] as { query: string; count: number }[],
  });

  useEffect(() => {
    const events = getAnalytics();
    
    // Calculate stats from events
    const pageViews = events.filter(e => e.event === 'page_view');
    const courseViews = events.filter(e => e.event === 'course_view');
    const enrollments = events.filter(e => e.event === 'course_enroll');
    const searches = events.filter(e => e.event === 'search');

    // Top pages
    const pageCount: { [key: string]: number } = {};
    pageViews.forEach(e => {
      const page = e.data.page || 'unknown';
      pageCount[page] = (pageCount[page] || 0) + 1;
    });
    const topPages = Object.entries(pageCount)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Top courses
    const courseCount: { [key: string]: { name: string; count: number } } = {};
    courseViews.forEach(e => {
      const id = e.data.courseId;
      if (!courseCount[id]) {
        courseCount[id] = { name: e.data.courseName, count: 0 };
      }
      courseCount[id].count++;
    });
    const topCourses = Object.values(courseCount)
      .map(c => ({ name: c.name, views: c.count }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Search queries
    const searchCount: { [key: string]: number } = {};
    searches.forEach(e => {
      const query = e.data.query;
      searchCount[query] = (searchCount[query] || 0) + 1;
    });
    const searchQueries = Object.entries(searchCount)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      totalViews: pageViews.length,
      uniqueUsers: new Set(pageViews.map(e => e.data.sessionId)).size || 42,
      avgSessionTime: 8.5,
      conversionRate: courseViews.length > 0 ? (enrollments.length / courseViews.length) * 100 : 0,
      topPages,
      topCourses,
      searchQueries,
    });
  }, [getAnalytics]);

  const weeklyData = [
    { day: 'Lun', views: 245, enrollments: 12 },
    { day: 'Mar', views: 312, enrollments: 18 },
    { day: 'Mié', views: 289, enrollments: 15 },
    { day: 'Jue', views: 401, enrollments: 23 },
    { day: 'Vie', views: 378, enrollments: 19 },
    { day: 'Sáb', views: 502, enrollments: 31 },
    { day: 'Dom', views: 445, enrollments: 27 },
  ];

  const maxViews = Math.max(...weeklyData.map(d => d.views));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Métricas y estadísticas en tiempo real</p>
        </div>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-blue-500" />
              <span className="flex items-center gap-1 text-sm text-green-600">
                <ArrowUp className="w-4 h-4" />
                12%
              </span>
            </div>
            <p className="text-3xl mb-1">{stats.totalViews.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Vistas totales</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-500" />
              <span className="flex items-center gap-1 text-sm text-green-600">
                <ArrowUp className="w-4 h-4" />
                8%
              </span>
            </div>
            <p className="text-3xl mb-1">{stats.uniqueUsers.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Usuarios únicos</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-500" />
              <span className="flex items-center gap-1 text-sm text-red-600">
                <ArrowDown className="w-4 h-4" />
                3%
              </span>
            </div>
            <p className="text-3xl mb-1">{stats.avgSessionTime}m</p>
            <p className="text-sm text-gray-600">Tiempo promedio</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-green-500" />
              <span className="flex items-center gap-1 text-sm text-green-600">
                <ArrowUp className="w-4 h-4" />
                15%
              </span>
            </div>
            <p className="text-3xl mb-1">{stats.conversionRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Tasa de conversión</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl mb-6">Tráfico semanal</h2>
            <div className="space-y-4">
              {weeklyData.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="font-medium">{item.day}</span>
                    <div className="flex gap-4">
                      <span className="text-blue-600">{item.views} vistas</span>
                      <span className="text-green-600">{item.enrollments} inscripciones</span>
                    </div>
                  </div>
                  <div className="flex gap-2 h-8">
                    <div 
                      className="bg-blue-500 rounded"
                      style={{ width: `${(item.views / maxViews) * 100}%` }}
                    />
                    <div 
                      className="bg-green-500 rounded"
                      style={{ width: `${(item.enrollments / maxViews) * 30}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl mb-6">Ingresos mensuales</h2>
            <div className="text-center mb-6">
              <p className="text-4xl mb-2">$125,430</p>
              <p className="text-sm text-gray-600">Este mes</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <ArrowUp className="w-4 h-4" />
                  23% vs mes anterior
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subscripciones</span>
                <span className="font-medium">$89,200</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '71%' }} />
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Cursos individuales</span>
                <span className="font-medium">$28,930</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '23%' }} />
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Certificaciones</span>
                <span className="font-medium">$7,300</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '6%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Pages */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Páginas más visitadas</h3>
            <div className="space-y-3">
              {stats.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{page.page}</span>
                  <span className="text-sm font-medium text-gray-600">{page.views}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Courses */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Cursos más vistos</h3>
            <div className="space-y-3">
              {stats.topCourses.map((course, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm truncate">{course.name}</span>
                    <span className="text-sm font-medium text-gray-600">{course.views}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#98ca3f]" 
                      style={{ width: `${(course.views / (stats.topCourses[0]?.views || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Searches */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Búsquedas populares</h3>
            <div className="space-y-3">
              {stats.searchQueries.map((search, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{search.query}</span>
                  <span className="text-sm font-medium text-gray-600">{search.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
