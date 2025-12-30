import { useState, useMemo } from 'react';
import { useSupabaseData } from '../context/SupabaseDataContext';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  TrendingUp,
  Bookmark,
  Share2,
  ChevronRight,
  Star,
  Eye,
  MessageCircle,
  ThumbsUp,
  Sparkles,
  Flame,
  Trophy,
  Code,
  Palette,
  Database,
  Brain,
  Rocket
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  image: string;
  publishedAt: string;
  readTime: number;
  views: number;
  likes: number;
  comments: number;
  featured?: boolean;
  trending?: boolean;
}

interface BlogPageProps {
  onNavigate?: (page: string, postId?: string) => void;
}

export function BlogPage({ onNavigate }: BlogPageProps = {}) {
  const { blogPosts: supabasePosts, loading, errors, refreshBlogPosts } = useSupabaseData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  // Convert Supabase posts to local format
  const allPosts: BlogPost[] = useMemo(() => {
    return supabasePosts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      author: {
        name: post.author?.full_name || 'Autor Platzi',
        avatar: post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`,
        role: post.author?.role || 'Contributor'
      },
      category: post.category,
      tags: post.tags || [],
      image: post.cover_image_url || 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop',
      publishedAt: post.published_at || post.created_at,
      readTime: post.reading_time || 5,
      views: post.views_count || 0,
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      featured: (post.views_count || 0) > 1000, // Simple logic for featured
      trending: (post.likes_count || 0) > 50
    }));
  }, [supabasePosts]);

  // Derived lists
  const featuredPosts = useMemo(() => 
    allPosts
      .sort((a, b) => b.views - a.views)
      .slice(0, 3)
      .map(p => ({ ...p, featured: true, trending: true })),
  [allPosts]);
  
  const recentPosts = useMemo(() => 
    allPosts
      .filter(p => !featuredPosts.find(fp => fp.id === p.id))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
  [allPosts, featuredPosts]);

  // Categories
  const categories = [
    { id: 'all', name: 'Todos', icon: Sparkles, color: 'from-purple-500 to-indigo-500', count: allPosts.length },
    { id: 'desarrollo', name: 'Desarrollo', icon: Code, color: 'from-blue-500 to-cyan-500', count: allPosts.filter(p => p.category === 'Desarrollo Web' || p.category === 'desarrollo').length },
    { id: 'diseno', name: 'Diseño', icon: Palette, color: 'from-pink-500 to-rose-500', count: allPosts.filter(p => p.category === 'Diseño' || p.category === 'diseno').length },
    { id: 'data', name: 'Data Science', icon: Database, color: 'from-green-500 to-emerald-500', count: allPosts.filter(p => p.category === 'Data Science' || p.category === 'data').length },
    { id: 'ia', name: 'Inteligencia Artificial', icon: Brain, color: 'from-purple-500 to-pink-500', count: allPosts.filter(p => p.category === 'AI/ML' || p.category === 'ia').length }
  ];

  // Popular Tags
  const popularTags = [
    'JavaScript', 'React', 'TypeScript', 'Node.js', 'Python',
    'UI/UX', 'Figma', 'CSS', 'Machine Learning', 'DevOps',
    'APIs', 'Testing', 'Performance', 'Accessibility', 'Security'
  ];

  // Trending Sidebar Posts
  const trendingSidebarPosts = useMemo(() => [
    { title: 'React 19: Lo que viene en la próxima versión', views: 25340, icon: '🔥' },
    { title: 'Construyendo APIs con tRPC y Next.js', views: 18920, icon: '⚡' },
    { title: '10 Tips de Performance para React Apps', views: 16780, icon: '🚀' },
    { title: 'Tailwind CSS v4: Primeras impresiones', views: 14230, icon: '✨' },
    { title: 'Guía de Accesibilidad Web A11Y', views: 12560, icon: '♿' }
  ], []);

  const filteredPosts = useMemo(() => {
    let posts = [...featuredPosts, ...recentPosts];
    // Deduplicate in case
    posts = Array.from(new Map(posts.map(p => [p.id, p])).values());

    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
      const normalizedCategory = selectedCategory.toLowerCase();
      const postCategory = post.category.toLowerCase();
      
      const matchesCategory = selectedCategory === 'all' || 
        postCategory === normalizedCategory ||
        (normalizedCategory === 'desarrollo' && postCategory.includes('desarrollo')) ||
        (normalizedCategory === 'diseno' && postCategory.includes('diseño')) ||
        (normalizedCategory === 'data' && postCategory.includes('data')) ||
        (normalizedCategory === 'ia' && (postCategory.includes('ai') || postCategory.includes('intelligence')));

      const matchesTag = selectedTag === 'all' || post.tags.includes(selectedTag);
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [featuredPosts, recentPosts, searchQuery, selectedCategory, selectedTag]);

  const handlePostClick = (postId: string) => {
    onNavigate?.('blogPost', postId);
  };

  if (loading.blogPosts) return <LoadingState />;
  if (errors.blogPosts) return <ErrorState error={errors.blogPosts.message} onRetry={refreshBlogPosts} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#121f3d] via-[#1a2d5a] to-[#2a3d6a] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-[#98ca3f]" />
              <span className="text-sm font-semibold">Blog de Platzi</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Aprende con los Mejores
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Artículos, tutoriales y guías escritas por expertos de la industria tech
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar artículos, tutoriales, guías..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#98ca3f] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Artículos', value: '128+', icon: BookOpen },
              { label: 'Autores', value: '45+', icon: Users },
              { label: 'Lectores', value: '250K+', icon: Eye },
              { label: 'Categorías', value: '12', icon: Grid }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <Icon className="w-8 h-8 mx-auto mb-3 text-[#98ca3f]" />
                  <p className="text-3xl font-black mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-300">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categorías</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border-2 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{category.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Featured Posts */}
            {selectedCategory === 'all' && !searchQuery && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Destacados</h2>
                  </div>
                </div>
                
                <div className="grid gap-6">
                  {featuredPosts.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => handlePostClick(post.id)}
                      className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="relative h-64 md:h-full overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {post.trending && (
                            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold shadow-lg">
                              <TrendingUp className="w-4 h-4" />
                              Trending
                            </div>
                          )}
                          <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1.5 bg-[#98ca3f] text-white rounded-full text-sm font-bold shadow-lg">
                              {categories.find(c => c.id === post.category)?.name}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6 flex flex-col justify-between">
                          <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                              {post.excerpt}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-semibold">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700"
                              />
                              <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{post.author.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">{post.author.role}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {post.readTime} min
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Recent/Filtered Posts */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                  {searchQuery ? 'Resultados de Búsqueda' : selectedCategory !== 'all' ? 'En esta Categoría' : 'Artículos Recientes'}
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredPosts.length} artículos
                </span>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {filteredPosts.filter(p => !p.featured || searchQuery || selectedCategory !== 'all').map((post) => (
                  <article
                    key={post.id}
                    onClick={() => handlePostClick(post.id)}
                    className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all cursor-pointer border-2 border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 hover:-translate-y-1"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-[#98ca3f] text-white rounded-full text-xs font-bold shadow-lg">
                          {categories.find(c => c.id === post.category)?.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{post.author.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {post.readTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {(post.views / 1000).toFixed(1)}K
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {post.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Trending Posts */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Más Populares</h3>
              </div>
              <div className="space-y-4">
                {trendingSidebarPosts.map((post, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer">
                    <div className="text-3xl flex-shrink-0">{post.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                        <Eye className="w-3 h-3" />
                        {(post.views / 1000).toFixed(1)}K vistas
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tags Populares</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      selectedTag === tag
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 rounded-2xl p-6 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <Rocket className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-black mb-2">Newsletter</h3>
                <p className="text-white/90 mb-4 text-sm">
                  Recibe los mejores artículos y tutoriales directamente en tu inbox
                </p>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 mb-3"
                />
                <button className="w-full px-4 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                  Suscribirse
                </button>
                <p className="text-xs text-white/70 mt-3 text-center">
                  Sin spam. Cancela cuando quieras.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for icons
function Grid({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function BookOpen({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}