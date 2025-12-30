import { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Target, 
  Calendar,
  Zap,
  Award,
  Play,
  CheckCircle2,
  ArrowRight,
  Flame,
  Star
} from 'lucide-react';
import { useSupabaseData } from '../context/SupabaseDataContext';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useCourses, useActivityLogs, useDeadlines } from '../hooks/useSupabaseData';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const { 
    profile, 
    enrollments, 
    courses: allCourses,
    loading: contextLoading,
    errors 
  } = useSupabaseData();
  
  // Fetch activity logs and deadlines with real data
  const { activities, loading: activitiesLoading } = useActivityLogs(user?.id, 7);
  const { deadlines, loading: deadlinesLoading } = useDeadlines(user?.id, { status: 'pending', limit: 5 });
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Calculate stats from real data
  const stats = useMemo(() => ({
    coursesInProgress: enrollments.filter(e => e.progress < 100).length,
    coursesCompleted: enrollments.filter(e => e.progress === 100).length,
    totalHours: Math.floor((profile?.xp || 0) / 100), // Estimate hours from XP
    currentStreak: profile?.streak || 0,
    totalXP: profile?.xp || 0,
    level: profile?.level || 1,
    nextLevelXP: (profile?.level || 1) * 1000 + 500
  }), [enrollments, profile]);

  const activeCourses = useMemo(() => {
    return enrollments
      .filter(e => e.progress < 100)
      .map(e => ({
        id: e.course_id,
        title: e.course?.title || 'Curso sin título',
        progress: e.progress,
        nextLesson: 'Continuar aprendiendo', // Placeholder
        timeLeft: e.course ? `${Math.floor(e.course.duration * (1 - e.progress/100) / 60)}h` : '1h',
        image: e.course?.thumbnail_url || e.course?.image || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=300&h=200&fit=crop',
        instructor: e.course?.instructor?.full_name || 'Instructor Platzi',
        lastAccessed: e.updated_at ? new Date(e.updated_at).toLocaleDateString() : 'Recientemente'
      }))
      .slice(0, 3);
  }, [enrollments]);

  // Intelligent recommendation system based on enrolled course categories
  const recommendations = useMemo(() => {
    const enrolledIds = new Set(enrollments.map(e => e.course_id));
    
    // Extract categories from enrolled courses
    const enrolledCategories = enrollments
      .map(e => e.course?.category)
      .filter((cat): cat is string => !!cat);
    
    // Count category frequency
    const categoryFrequency: Record<string, number> = {};
    enrolledCategories.forEach(cat => {
      categoryFrequency[cat] = (categoryFrequency[cat] || 0) + 1;
    });
    
    // Get top categories
    const topCategories = Object.entries(categoryFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);
    
    // Score and rank courses
    const scoredCourses = allCourses
      .filter(c => !enrolledIds.has(c.id))
      .map(course => {
        let score = 0;
        
        // Boost score if course is in a category user is already studying
        if (topCategories.includes(course.category)) {
          const categoryRank = topCategories.indexOf(course.category);
          score += (3 - categoryRank) * 100; // Higher score for more frequent categories
        }
        
        // Boost for highly rated courses
        score += (course.rating || 0) * 20;
        
        // Boost for popular courses (normalized)
        score += Math.min((course.students_count || 0) / 100, 50);
        
        // Slight boost for beginner courses if user is at low level
        if ((profile?.level || 1) < 5 && course.difficulty === 'beginner') {
          score += 30;
        }
        
        // Boost for intermediate/advanced if user is experienced
        if ((profile?.level || 1) >= 10 && course.difficulty === 'advanced') {
          score += 40;
        }
        
        return {
          ...course,
          score
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
    
    // Generate personalized reasons
    return scoredCourses.map(c => {
      let reason = '';
      
      if (topCategories.includes(c.category)) {
        reason = `Basado en tus cursos de ${c.category}`;
      } else if (c.rating >= 4.5) {
        reason = 'Altamente valorado por la comunidad';
      } else if (c.students_count > 10000) {
        reason = 'Popular entre estudiantes';
      } else {
        reason = `Recomendado por tu nivel ${profile?.level || 1}`;
      }
      
      return {
        id: c.id,
        title: c.title,
        reason,
        rating: c.rating,
        students: c.students_count,
        category: c.category
      };
    });
  }, [allCourses, enrollments, profile]);

  // Transform real activity data for weekly chart
  const weeklyProgress = useMemo(() => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const last7Days = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split('T')[0];
      
      // Find activity for this date
      const activity = activities.find(a => a.date === dateStr);
      
      last7Days.push({
        day: dayNames[dayOfWeek],
        hours: activity ? (activity.study_time / 60) : 0, // Convert minutes to hours
        xp: activity ? activity.xp_earned : 0
      });
    }
    
    return last7Days;
  }, [activities]);

  // Transform real deadlines data
  const upcomingDeadlines = useMemo(() => {
    return deadlines.map(deadline => {
      const dueDate = new Date(deadline.due_date);
      const now = new Date();
      const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: deadline.id,
        title: deadline.title,
        daysLeft: Math.max(0, daysLeft),
        type: deadline.type,
        priority: deadline.priority,
        courseTitle: deadline.course?.title
      };
    }).slice(0, 5); // Show only top 5
  }, [deadlines]);

  const maxHours = Math.max(...weeklyProgress.map(d => d.hours), 1); // Minimum 1 to avoid division by zero
  const xpPercentage = Math.min(100, (stats.totalXP / stats.nextLevelXP) * 100);

  if (contextLoading.profile || contextLoading.enrollments || activitiesLoading || deadlinesLoading) return <LoadingState />;
  if (errors.profile) return <ErrorState error={errors.profile.message} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2 text-gray-900 dark:text-white">Mi Panel de Aprendizaje</h1>
          <p className="text-gray-600 dark:text-gray-400">Sigue tu progreso y alcanza tus metas</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Streak Card */}
          <div className="card p-6 relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl">🔥</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.currentStreak}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Días de racha</p>
              <div className="mt-4 pt-4 border-t border-gray-900 dark:border-gray-500">
                <p className="text-xs text-gray-600 dark:text-gray-400">Récord personal: 28 días</p>
              </div>
            </div>
          </div>

          {/* Level Card */}
          <div className="card p-6 relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <Zap className="w-6 h-6 text-brand" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Nivel {stats.level}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{stats.totalXP} / {stats.nextLevelXP} XP</p>
              <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hours Card */}
          <div className="card p-6 relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-6 h-6 text-brand" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalHours}h</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Esta semana</p>
              <div className="mt-4 pt-4 border-t border-gray-900 dark:border-gray-500">
                <p className="text-xs text-brand">+12% vs semana pasada</p>
              </div>
            </div>
          </div>

          {/* Courses Card */}
          <div className="card p-6 relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <Award className="w-6 h-6 text-brand" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.coursesCompleted}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cursos completados</p>
              <div className="mt-4 pt-4 border-t border-gray-900 dark:border-gray-500">
                <p className="text-xs text-gray-600 dark:text-gray-400">{stats.coursesInProgress} en progreso</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Activity Chart */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Actividad Semanal</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Horas de estudio diarias</p>
                </div>
                <div className="flex gap-2">
                  {(['week', 'month', 'year'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedPeriod === period
                          ? 'bg-brand text-[#121f3d]'
                          : 'bg-tertiary text-gray-600 dark:text-gray-400 hover:bg-hover'
                      }`}
                    >
                      {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Año'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Bar Chart */}
              <div className="space-y-4">
                {weeklyProgress.map((day, index) => (
                  <div key={day.day} className="group">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-10">{day.day}</span>
                      <div className="flex-1 h-10 bg-tertiary rounded-lg overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-[#98ca3f] to-[#7ab32f] rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-3"
                          style={{ 
                            width: `${(day.hours / maxHours) * 100}%`,
                            transitionDelay: `${index * 100}ms`
                          }}
                        >
                          <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            {day.hours}h
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 w-20">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{day.xp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-6 border-t border-gray-900 dark:border-gray-500 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {weeklyProgress.reduce((acc, d) => acc + d.hours, 0).toFixed(1)}h
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(weeklyProgress.reduce((acc, d) => acc + d.hours, 0) / 7).toFixed(1)}h
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Promedio</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand">
                    {weeklyProgress.reduce((acc, d) => acc + d.xp, 0)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">XP ganado</p>
                </div>
              </div>
            </div>

            {/* Active Courses */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Cursos Activos</h2>
                <button className="text-sm text-brand hover:underline">Ver todos</button>
              </div>

              <div className="space-y-4">
                {activeCourses.map((course) => (
                  <div key={course.id} className="group border border-gray-900 dark:border-gray-500 rounded-xl p-4 hover:shadow-lg transition-all hover:border-brand">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <button className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-8 h-8 text-white" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-brand transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Por {course.instructor}</p>
                        
                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{course.progress}%</span>
                          </div>
                          <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#98ca3f] to-[#7ab32f] rounded-full transition-all duration-500"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <p>Próxima: {course.nextLesson}</p>
                            <p className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {course.timeLeft} restante
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-brand text-[#121f3d] rounded-lg text-sm font-medium hover:bg-[#87b935] transition-colors flex items-center gap-2">
                            Continuar
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Goals */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Target className="w-5 h-5 text-brand" />
                Metas de la Semana
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Estudiar 10 horas</span>
                    <span className="font-semibold text-gray-900 dark:text-white">8.5/10h</span>
                  </div>
                  <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Completar 3 lecciones</span>
                    <span className="font-semibold text-gray-900 dark:text-white">2/3</span>
                  </div>
                  <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '66%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Ganar 500 XP</span>
                    <span className="font-semibold text-gray-900 dark:text-white">450/500</span>
                  </div>
                  <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Deadlines */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Calendar className="w-5 h-5 text-brand" />
                Próximos Vencimientos
              </h3>
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-tertiary rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-1 ${
                      deadline.daysLeft <= 3 ? 'bg-red-500' :
                      deadline.daysLeft <= 5 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{deadline.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {deadline.daysLeft} días restantes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Star className="w-5 h-5 text-brand" />
                Recomendado para ti
              </h3>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-3 border border-gray-900 dark:border-gray-500 rounded-lg hover:border-brand transition-colors cursor-pointer">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">{rec.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{rec.reason}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{rec.rating}</span>
                      </div>
                      <span>•</span>
                      <span>{rec.students.toLocaleString()} estudiantes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}