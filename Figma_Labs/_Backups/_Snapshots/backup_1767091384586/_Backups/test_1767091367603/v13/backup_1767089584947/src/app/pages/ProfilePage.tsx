import { useState } from 'react';
import { 
  Settings, 
  Camera, 
  MapPin, 
  Link as LinkIcon, 
  Calendar,
  Trophy,
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  Users,
  Star,
  Target,
  Zap,
  Share2,
  MessageCircle,
  UserPlus,
  Check,
  Briefcase,
  GraduationCap,
  Code,
  Palette,
  Database,
  Brain,
  Heart,
  Bookmark,
  Edit3,
  Globe,
  Shield,
  ChevronRight,
  ArrowUp,
  Mail,
  Phone,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Sparkles,
  Flame,
  ChevronDown
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate?: (page: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps = {}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'activity' | 'achievements' | 'reviews'>('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);

  const user = {
    name: 'Carlos Méndez',
    username: '@carlosdev',
    title: 'Full Stack Developer & UX Designer',
    company: 'Tech Innovators Inc.',
    location: 'Madrid, España',
    website: 'carlosdev.com',
    email: 'carlos@example.com',
    phone: '+34 612 345 678',
    joinDate: 'Enero 2023',
    bio: 'Apasionado por crear experiencias digitales increíbles. Especializado en React, Node.js y diseño de interfaces. Siempre aprendiendo algo nuevo 🚀',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop',
    role: 'admin',
    verified: true,
    stats: {
      followers: 2845,
      following: 456,
      level: 24,
      xp: 28500,
      xpToNextLevel: 30000,
      rank: 156,
      coursesCompleted: 42,
      hoursLearned: 380,
      streak: 45,
      longestStreak: 67,
      badges: 28,
      projects: 15,
      postsCount: 145,
      reviewsGiven: 89,
      helpfulVotes: 234
    },
    social: {
      github: 'carlosdev',
      linkedin: 'carlos-mendez',
      twitter: 'carlosdev',
      instagram: 'carlosdev',
      youtube: 'carlosdev'
    },
    skills: [
      { name: 'React', level: 95, color: 'bg-blue-500', category: 'Frontend' },
      { name: 'TypeScript', level: 90, color: 'bg-blue-600', category: 'Frontend' },
      { name: 'Node.js', level: 88, color: 'bg-green-500', category: 'Backend' },
      { name: 'UI/UX Design', level: 85, color: 'bg-purple-500', category: 'Design' },
      { name: 'Python', level: 75, color: 'bg-yellow-500', category: 'Backend' },
      { name: 'GraphQL', level: 70, color: 'bg-pink-500', category: 'Backend' },
      { name: 'Docker', level: 80, color: 'bg-cyan-500', category: 'DevOps' },
      { name: 'AWS', level: 72, color: 'bg-orange-500', category: 'Cloud' }
    ],
    interests: ['Web Development', 'Machine Learning', 'Design Systems', 'DevOps', 'Mobile Development', 'Blockchain'],
    certifications: [
      {
        title: 'Full Stack Developer',
        issuer: 'Platzi',
        date: 'Nov 2024',
        icon: '🎓',
        credentialId: 'CERT-2024-001'
      },
      {
        title: 'Advanced React',
        issuer: 'Meta',
        date: 'Sep 2024',
        icon: '⚛️',
        credentialId: 'META-REACT-2024'
      },
      {
        title: 'AWS Solutions Architect',
        issuer: 'Amazon',
        date: 'Jul 2024',
        icon: '☁️',
        credentialId: 'AWS-SA-2024'
      },
      {
        title: 'Google UX Design',
        issuer: 'Google',
        date: 'May 2024',
        icon: '🎨',
        credentialId: 'GOOGLE-UX-2024'
      }
    ],
    recentActivity: [
      {
        type: 'course_complete',
        title: 'Completó "Machine Learning Fundamentals"',
        time: '2 horas',
        icon: '🎓',
        xpGained: 250
      },
      {
        type: 'badge',
        title: 'Desbloqueó la insignia "Code Master"',
        time: '5 horas',
        icon: '🏆',
        rarity: 'epic'
      },
      {
        type: 'post',
        title: 'Publicó sobre "Best practices in React"',
        time: '1 día',
        icon: '📝',
        likes: 45
      },
      {
        type: 'project',
        title: 'Completó proyecto "E-commerce Platform"',
        time: '2 días',
        icon: '💻',
        xpGained: 500
      }
    ],
    currentCourses: [
      {
        id: '1',
        title: 'Advanced TypeScript Patterns',
        progress: 68,
        image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=300&h=200&fit=crop',
        category: 'Desarrollo',
        instructor: 'Sarah Johnson',
        nextLesson: 'Generic Constraints',
        timeLeft: '4h 30min'
      },
      {
        id: '2',
        title: 'UI/UX Design Masterclass',
        progress: 45,
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop',
        category: 'Diseño',
        instructor: 'Mike Chen',
        nextLesson: 'Color Theory',
        timeLeft: '8h 15min'
      },
      {
        id: '3',
        title: 'Data Science with Python',
        progress: 30,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
        category: 'Data Science',
        instructor: 'Dr. Anna Smith',
        nextLesson: 'Pandas DataFrames',
        timeLeft: '12h 45min'
      }
    ],
    completedCourses: [
      {
        title: 'Complete JavaScript Course',
        instructor: 'Jonas Schmedtmann',
        rating: 5,
        completedDate: 'Dic 2024',
        image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=300&h=200&fit=crop',
        certificate: true
      },
      {
        title: 'React - The Complete Guide',
        instructor: 'Maximilian Schwarzmüller',
        rating: 5,
        completedDate: 'Nov 2024',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop',
        certificate: true
      },
      {
        title: 'Node.js Bootcamp',
        instructor: 'Brad Traversy',
        rating: 5,
        completedDate: 'Oct 2024',
        image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=200&fit=crop',
        certificate: true
      }
    ]
  };

  const topBadges = [
    { icon: '🏆', name: 'Top Contributor', rarity: 'legendary', description: 'Top 1% de la comunidad' },
    { icon: '🔥', name: '45 Day Streak', rarity: 'epic', description: '45 días consecutivos' },
    { icon: '⚡', name: 'Speed Learner', rarity: 'epic', description: '100 lecciones en 1 semana' },
    { icon: '🎯', name: 'Goal Crusher', rarity: 'rare', description: '50 metas completadas' },
    { icon: '💡', name: 'Innovator', rarity: 'rare', description: '10 proyectos publicados' },
    { icon: '🌟', name: 'Community Hero', rarity: 'rare', description: '500+ ayudas a otros' },
    { icon: '📚', name: 'Book Worm', rarity: 'common', description: '25 cursos completados' },
    { icon: '💻', name: 'Code Ninja', rarity: 'epic', description: '1000+ commits' }
  ];

  const xpProgress = (user.stats.xp / user.stats.xpToNextLevel) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950">
      {/* Modern Cover with Gradient Overlay */}
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#121f3d] via-[#1a2d5a] to-[#98ca3f]">
          <img 
            src={user.cover} 
            alt="Cover"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
        </div>
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-transparent to-transparent"></div>
        
        {/* Cover actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 shadow-lg">
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Cambiar portada</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header Card - Floating */}
        <div className="relative -mt-32 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-2 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600"></div>
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                {/* Avatar Section */}
                <div className="relative flex-shrink-0 mx-auto lg:mx-0">
                  <div className="relative group">
                    <img 
                      src={user.avatar}
                      alt={user.name}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white dark:border-gray-800 shadow-xl bg-white dark:bg-gray-800 group-hover:scale-105 transition-transform duration-300"
                    />
                    <button className="absolute bottom-2 right-2 p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg transform hover:scale-110">
                      <Camera className="w-4 h-4" />
                    </button>
                    
                    {/* Level Badge - Redesigned */}
                    <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white w-16 h-16 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center shadow-xl border-4 border-white dark:border-gray-900 transform rotate-12 hover:rotate-0 transition-transform">
                      <span className="text-xs font-bold opacity-90">NIVEL</span>
                      <span className="text-2xl md:text-3xl font-black leading-none">{user.stats.level}</span>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                          {user.name}
                        </h1>
                        {user.verified && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-bold shadow-lg">
                            <Check className="w-4 h-4" />
                            Verificado
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 font-medium">{user.username}</p>
                      <p className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">{user.title}</p>
                      
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                          <Briefcase className="w-4 h-4 text-purple-500" />
                          <span>{user.company}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span>{user.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>Desde {user.joinDate}</span>
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="flex items-center justify-center lg:justify-start gap-2 pt-2">
                        <a href={`https://github.com/${user.social.github}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <Github className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </a>
                        <a href={`https://linkedin.com/in/${user.social.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <Linkedin className="w-4 h-4 text-blue-600" />
                        </a>
                        <a href={`https://twitter.com/${user.social.twitter}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <Twitter className="w-4 h-4 text-sky-500" />
                        </a>
                        <a href={`https://instagram.com/${user.social.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <Instagram className="w-4 h-4 text-pink-500" />
                        </a>
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-[#98ca3f] font-medium">
                          <Globe className="w-4 h-4" />
                          <span className="text-sm hidden sm:inline">{user.website}</span>
                        </a>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 flex-shrink-0">
                      <button 
                        onClick={() => setIsFollowing(!isFollowing)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
                          isFollowing 
                            ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white' 
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <Check className="w-5 h-5" />
                            Siguiendo
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5" />
                            Seguir
                          </>
                        )}
                      </button>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 sm:flex-initial px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-semibold text-gray-900 dark:text-white">
                          <MessageCircle className="w-5 h-5" />
                          <span className="hidden sm:inline">Mensaje</span>
                        </button>
                        <button className="p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white">
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white">
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed mb-6 max-w-3xl mx-auto lg:mx-0">
                    {user.bio}
                  </p>

                  {/* Admin Panel Button - Destacado */}
                  {(user.role === 'admin' || user.role === 'super_admin') && (
                    <div className="mb-6">
                      <button 
                        onClick={() => onNavigate?.('admin')}
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl hover:shadow-purple-500/50 transform hover:-translate-y-1 font-bold text-lg group"
                      >
                        <Shield className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        <span>Panel de Administración</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                      </button>
                    </div>
                  )}

                  {/* Level Progress */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          Nivel {user.stats.level} → Nivel {user.stats.level + 1}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        {user.stats.xp.toLocaleString()} / {user.stats.xpToNextLevel.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500 relative overflow-hidden"
                        style={{ width: `${xpProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                      ¡Solo {(user.stats.xpToNextLevel - user.stats.xp).toLocaleString()} XP para subir de nivel! 🎯
                    </p>
                  </div>

                  {/* Enhanced Quick Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-6">
                    {[
                      { icon: Users, label: 'Seguidores', value: user.stats.followers.toLocaleString(), color: 'blue' },
                      { icon: Trophy, label: 'Ranking', value: `#${user.stats.rank}`, color: 'yellow' },
                      { icon: Flame, label: 'Racha', value: `${user.stats.streak}d`, color: 'orange' },
                      { icon: BookOpen, label: 'Cursos', value: user.stats.coursesCompleted, color: 'green' },
                      { icon: Clock, label: 'Horas', value: `${user.stats.hoursLearned}h`, color: 'purple' },
                      { icon: Award, label: 'Insignias', value: user.stats.badges, color: 'pink' },
                      { icon: Target, label: 'Proyectos', value: user.stats.projects, color: 'red' },
                      { icon: Star, label: 'XP Total', value: `${(user.stats.xp / 1000).toFixed(1)}K`, color: 'indigo' }
                    ].map((stat, index) => {
                      const Icon = stat.icon;
                      const colors = {
                        blue: 'from-blue-500 to-cyan-500',
                        yellow: 'from-yellow-500 to-orange-500',
                        orange: 'from-orange-500 to-red-500',
                        green: 'from-green-500 to-emerald-500',
                        purple: 'from-purple-500 to-pink-500',
                        pink: 'from-pink-500 to-rose-500',
                        red: 'from-red-500 to-pink-500',
                        indigo: 'from-indigo-500 to-purple-500'
                      };
                      
                      return (
                        <div key={index} className="relative group">
                          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[stat.color as keyof typeof colors]} flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white text-center mb-1">
                              {stat.value}
                            </p>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 text-center uppercase tracking-wide">
                              {stat.label}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: 'Vista General', icon: GraduationCap },
                { id: 'courses', label: 'Cursos', icon: BookOpen },
                { id: 'activity', label: 'Actividad', icon: TrendingUp },
                { id: 'achievements', label: 'Logros', icon: Trophy },
                { id: 'reviews', label: 'Reseñas', icon: Star }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 pb-12">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {activeTab === 'overview' && (
              <>
                {/* Currently Learning - Enhanced */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Aprendiendo Ahora</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.currentCourses.length} cursos activos</p>
                      </div>
                    </div>
                    <button className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                      Ver todos →
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {user.currentCourses.map((course) => (
                      <div key={course.id} className="group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl overflow-hidden hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative sm:w-48 h-32 flex-shrink-0 overflow-hidden">
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-2 left-2">
                              <span className="px-3 py-1 bg-[#98ca3f] text-white rounded-full text-xs font-bold shadow-lg">
                                {course.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 p-4">
                            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              Por {course.instructor}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {course.timeLeft} restantes
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                Siguiente: {course.nextLesson}
                              </span>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold text-gray-900 dark:text-white">Progreso</span>
                                <span className="font-bold text-purple-600 dark:text-purple-400">{course.progress}%</span>
                              </div>
                              <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500 relative overflow-hidden"
                                  style={{ width: `${course.progress}%` }}
                                >
                                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity - Enhanced */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Actividad Reciente</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tus últimos logros y acciones</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {user.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                        <div className="text-4xl flex-shrink-0">{activity.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white mb-1">{activity.title}</p>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Hace {activity.time}</span>
                            {activity.xpGained && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-bold text-xs">
                                <Zap className="w-3 h-3" />
                                +{activity.xpGained} XP
                              </span>
                            )}
                            {activity.rarity && (
                              <span className={`px-2 py-1 rounded-full font-bold text-xs ${
                                activity.rarity === 'epic' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                activity.rarity === 'rare' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                {activity.rarity.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'courses' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cursos Completados</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.completedCourses.length} certificados obtenidos</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {user.completedCourses.map((course, index) => (
                    <div key={index} className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-700">
                      <div className="relative h-40 overflow-hidden">
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        {course.certificate && (
                          <div className="absolute top-2 right-2">
                            <div className="p-2 bg-yellow-500 rounded-full shadow-lg">
                              <Award className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Por {course.instructor}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[...Array(course.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {course.completedDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Logros Destacados</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{topBadges.length} insignias desbloqueadas</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAllBadges(!showAllBadges)}
                    className="flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {showAllBadges ? 'Ver menos' : 'Ver todas'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAllBadges ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(showAllBadges ? topBadges : topBadges.slice(0, 6)).map((badge, index) => (
                    <div 
                      key={index}
                      className={`group relative p-6 rounded-2xl text-center border-2 transition-all hover:scale-105 hover:shadow-2xl cursor-pointer ${
                        badge.rarity === 'legendary' 
                          ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/30 dark:via-orange-950/30 dark:to-red-950/30 border-yellow-400 dark:border-yellow-600' :
                        badge.rarity === 'epic' 
                          ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-fuchsia-950/30 border-purple-400 dark:border-purple-600' :
                        badge.rarity === 'rare'
                          ? 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-teal-950/30 border-blue-400 dark:border-blue-600' :
                          'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {badge.rarity === 'legendary' && (
                        <div className="absolute -top-2 -right-2">
                          <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                        </div>
                      )}
                      <div className="text-6xl mb-3 group-hover:scale-125 transition-transform">{badge.icon}</div>
                      <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{badge.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{badge.description}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        badge.rarity === 'legendary' ? 'bg-yellow-500 text-white' :
                        badge.rarity === 'epic' ? 'bg-purple-500 text-white' :
                        badge.rarity === 'rare' ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {badge.rarity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Skills - Enhanced */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-[#98ca3f]" />
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Habilidades</h3>
                </div>
                <button 
                  onClick={() => setShowAllSkills(!showAllSkills)}
                  className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {showAllSkills ? 'Ver menos' : `+${user.skills.length - 4}`}
                </button>
              </div>
              
              <div className="space-y-4">
                {(showAllSkills ? user.skills : user.skills.slice(0, 4)).map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white">{skill.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                          {skill.category}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{skill.level}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${skill.color} rounded-full transition-all duration-500 relative overflow-hidden`}
                        style={{ width: `${skill.level}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="mt-6 w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-2">
                <Edit3 className="w-4 h-4" />
                Editar habilidades
              </button>
            </div>

            {/* Certifications - Enhanced */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-5 h-5 text-[#98ca3f]" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Certificaciones</h3>
              </div>
              
              <div className="space-y-3">
                {user.certifications.map((cert, index) => (
                  <div key={index} className="group flex gap-3 p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-xl hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 cursor-pointer">
                    <div className="text-3xl group-hover:scale-125 transition-transform">{cert.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {cert.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{cert.issuer}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-500">{cert.date}</p>
                        <span className="text-xs font-mono text-gray-400 dark:text-gray-600">
                          {cert.credentialId}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests - Enhanced */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <Heart className="w-5 h-5 text-[#98ca3f]" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Intereses</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 hover:from-purple-200 hover:to-indigo-200 dark:hover:from-purple-800/40 dark:hover:to-indigo-800/40 border border-purple-200 dark:border-purple-700 rounded-full text-sm font-semibold text-purple-700 dark:text-purple-300 transition-all cursor-pointer hover:scale-105 hover:shadow-md"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Learning Stats - Enhanced */}
            <div className="bg-gradient-to-br from-[#121f3d] via-[#1a2d5a] to-[#2a3d6a] text-white rounded-2xl shadow-2xl p-6 border-2 border-purple-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">Estadísticas de Aprendizaje</h3>
                </div>
                
                <div className="space-y-5">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-300" />
                      <span className="text-sm font-medium opacity-90">Tiempo total</span>
                    </div>
                    <span className="text-2xl font-black">{user.stats.hoursLearned}h</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-400" />
                      <span className="text-sm font-medium opacity-90">Racha actual</span>
                    </div>
                    <span className="text-2xl font-black flex items-center gap-1">
                      🔥 {user.stats.streak}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm font-medium opacity-90">Racha más larga</span>
                    </div>
                    <span className="text-2xl font-black">{user.stats.longestStreak} días</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-medium opacity-90">Nivel actual</span>
                    </div>
                    <span className="text-2xl font-black">Nivel {user.stats.level}</span>
                  </div>
                  
                  <div className="pt-5 border-t border-white/20">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="font-medium opacity-90">Progreso a Nivel {user.stats.level + 1}</span>
                      <span className="font-bold">{Math.round(xpProgress)}%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                      <div 
                        className="h-full bg-gradient-to-r from-[#98ca3f] to-[#7ab32e] rounded-full relative overflow-hidden" 
                        style={{ width: `${xpProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}