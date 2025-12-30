import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Eye,
  ChevronRight,
  Tag,
  Code,
  AlertCircle,
  Bookmark,
  ThumbsUp,
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon,
  MessageCircle,
  Share2,
  Copy,
  Check,
  TrendingUp,
  Award,
  Sparkles,
  ZapIcon,
  BookmarkCheck,
  Download,
  Printer,
  Mail,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useBlog } from '../context/BlogContext';
import { CommentSection } from '../components/blog/CommentSection';
import { ReactionPicker } from '../components/blog/ReactionPicker';
import { ShareButton, ShareBar } from '../components/blog/ShareButton';
import { AuthorCard } from '../components/blog/AuthorCard';
import { NewsletterCTA } from '../components/blog/NewsletterForm';
import { useBlogPost, useBlogPosts } from '../hooks/useSupabaseData';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

interface BlogPostPageProps {
  onNavigate?: (page: string) => void;
  postId?: string;
}

export function BlogPostPage({ onNavigate, postId }: BlogPostPageProps) {
  // Use real data from Supabase - postId is used as slug in the database
  const { post, loading, error } = useBlogPost(postId);
  const { posts: relatedPostsData } = useBlogPosts({ limit: 3 });
  
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Initialize likes count from post data
  useEffect(() => {
    if (post) {
      setLikes(post.likes_count || 0);
    }
  }, [post]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      setReadingProgress(progress);
      setShowScrollTop(scrolled > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Table of Contents
  const tableOfContents = [
    { id: 'que-son', title: '¿Qué son los Server Components?', level: 2 },
    { id: 'beneficios', title: 'Beneficios Principales', level: 3 },
    { id: 'arquitectura', title: 'Arquitectura', level: 2 },
    { id: 'client-components', title: 'Client Components', level: 3 },
    { id: 'patrones', title: 'Patrones Comunes', level: 2 },
    { id: 'mejores-practicas', title: 'Mejores Prácticas', level: 2 },
    { id: 'limitaciones', title: 'Limitaciones', level: 2 },
    { id: 'conclusion', title: 'Conclusión', level: 2 }
  ];

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = (content: string) => {
    const sections = content.split('\n\n');
    
    return sections.map((section, index) => {
      // Headers
      if (section.startsWith('## ')) {
        return (
          <h2 key={index} className="group text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mt-16 mb-6 scroll-mt-24 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-gradient-to-b from-[#98ca3f] to-[#7ab02f] rounded-full"></span>
            {section.replace('## ', '')}
          </h2>
        );
      }
      if (section.startsWith('### ')) {
        return (
          <h3 key={index} className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 mt-12 mb-5 scroll-mt-24">
            {section.replace('### ', '')}
          </h3>
        );
      }
      
      // Code blocks
      if (section.startsWith('```')) {
        const code = section.replace(/```\w*\n?/g, '').trim();
        const [copied, setCopied] = useState(false);
        
        return (
          <div key={index} className="my-8 group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 dark:from-black dark:via-gray-950 dark:to-black rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl">
              <div className="flex items-center justify-between px-6 py-3 bg-gray-800/50 border-b border-gray-700/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Code className="w-4 h-4 text-[#98ca3f]" />
                    <span className="text-xs text-gray-400 font-mono font-semibold">React TSX</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <div className="relative overflow-x-auto">
                <pre className="p-6 text-sm leading-relaxed">
                  <code className="text-gray-300 font-mono">{code}</code>
                </pre>
              </div>
            </div>
          </div>
        );
      }
      
      // Blockquotes
      if (section.startsWith('> ')) {
        return (
          <div key={index} className="my-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#98ca3f]/10 to-transparent rounded-2xl"></div>
            <div className="relative pl-6 pr-6 py-6 border-l-4 border-[#98ca3f] bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/10 rounded-r-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#98ca3f] flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-base lg:text-lg text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                    {section.replace('> ', '').replace('**Tip:** ', '')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      // Numbered Lists
      if (section.match(/^\d+\./m)) {
        const items = section.split('\n').filter(line => line.trim());
        return (
          <ol key={index} className="my-8 space-y-4">
            {items.map((item, i) => {
              const text = item.replace(/^\d+\.\s*/, '');
              const [boldText, regularText] = text.split('**:');
              
              return (
                <li key={i} className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <p className="flex-1 text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed pt-1">
                    {boldText && <strong className="text-gray-900 dark:text-white font-bold">{boldText.replace('**', '')}</strong>}
                    {regularText && `: ${regularText}`}
                  </p>
                </li>
              );
            })}
          </ol>
        );
      }
      
      // Bullet Lists
      if (section.startsWith('- ')) {
        const items = section.split('\n').filter(line => line.trim());
        return (
          <ul key={index} className="my-8 space-y-3">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 group">
                <div className="flex-shrink-0 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#98ca3f] to-[#7ab02f] group-hover:scale-125 transition-transform"></div>
                </div>
                <span className="flex-1 text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed">
                  {item.replace(/^-\s*/, '')}
                </span>
              </li>
            ))}
          </ul>
        );
      }
      
      // Paragraphs
      return (
        <p key={index} className="text-gray-700 dark:text-gray-300 text-base lg:text-lg leading-relaxed my-6">
          {section}
        </p>
      );
    });
  };

  // Handle loading and error states
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error.message} />;
  if (!post) return <ErrorState error="Post no encontrado" />;

  // Map Supabase data to component format
  const mappedPost = {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    tags: Array.isArray(post.tags) ? post.tags : [],
    image: post.image_url || post.thumbnail_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop',
    publishedAt: post.published_at,
    readTime: post.read_time || 5,
    views: post.views_count || 0,
    comments: 0, // TODO: get from comments table
    author: {
      name: post.author?.full_name || post.author?.username || 'Autor Desconocido',
      avatar: post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username || 'user'}`,
      role: post.author?.bio || 'Instructor Platzi',
      bio: post.author?.bio,
      social: {
        twitter: post.author?.twitter,
        linkedin: post.author?.linkedin
      }
    }
  };

  // Map related posts
  const mappedRelatedPosts = relatedPostsData
    .filter((p) => p.id !== post.id)
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      title: p.title,
      image: p.image_url || p.thumbnail_url || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=300&h=200&fit=crop',
      readTime: p.read_time || 5,
      author: p.author?.full_name || p.author?.username || 'Autor',
      date: p.published_at
    }));

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-[100]">
        <div 
          className="h-full bg-gradient-to-r from-[#98ca3f] via-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed top-20 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate?.('blog')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all font-medium group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Volver</span>
            </button>
            
            <div className="flex items-center gap-2">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  liked
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline text-sm">{likes}</span>
              </button>
              
              {/* Bookmark Button */}
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`p-2 rounded-xl transition-all transform hover:scale-105 ${
                  bookmarked
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg shadow-yellow-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
              </button>

              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all transform hover:scale-105"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2">
                      {[
                        { icon: Twitter, label: 'Twitter', color: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600' },
                        { icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700' },
                        { icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600' },
                        { icon: Mail, label: 'Email', color: 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900' }
                      ].map((social) => {
                        const Icon = social.icon;
                        return (
                          <button
                            key={social.label}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-xl transition-all ${social.color}`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{social.label}</span>
                          </button>
                        );
                      })}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                      <button 
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all"
                      >
                        {copied ? <Check className="w-5 h-5 text-green-500" /> : <LinkIcon className="w-5 h-5" />}
                        <span className="text-sm font-medium">{copied ? '¡Copiado!' : 'Copiar enlace'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Sidebar - Stats & Actions */}
            <aside className="hidden lg:block lg:col-span-2">
              <div className="sticky top-36 space-y-6">
                {/* Engagement Stats */}
                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all group ${
                      liked
                        ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30'
                        : 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-700'
                    }`}
                  >
                    <ThumbsUp className={`w-6 h-6 ${liked ? 'fill-current' : 'group-hover:scale-110'} transition-transform`} />
                    <span className="text-2xl font-black">{likes}</span>
                    <span className="text-xs font-medium opacity-80">Me gusta</span>
                  </button>

                  <div className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl">
                    <MessageCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{post?.comments}</span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Comentarios</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl">
                    <Eye className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{(post?.views / 1000).toFixed(1)}K</span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Vistas</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setBookmarked(!bookmarked)}
                    className={`p-3 rounded-xl transition-all ${
                      bookmarked
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-yellow-400'
                    }`}
                    title="Guardar"
                  >
                    <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-purple-400 rounded-xl transition-all" title="Imprimir">
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Article */}
            <main className="lg:col-span-7">
              <article className="bg-white dark:bg-gray-950">
                {/* Article Header */}
                <header className="mb-12">
                  {/* Category Badge */}
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold shadow-lg shadow-purple-500/30">
                      <Sparkles className="w-4 h-4" />
                      {mappedPost.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight bg-clip-text">
                    {mappedPost.title}
                  </h1>
                  
                  {/* Subtitle */}
                  <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-8">
                    {mappedPost.excerpt}
                  </p>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-gray-200 dark:border-gray-800">
                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <img
                        src={mappedPost.author.avatar}
                        alt={mappedPost.author.name}
                        className="w-12 h-12 rounded-full ring-4 ring-[#98ca3f]/20"
                      />
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{mappedPost.author.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{mappedPost.author.role}</div>
                      </div>
                    </div>

                    <div className="hidden sm:block w-px h-8 bg-gray-300 dark:bg-gray-700"></div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(mappedPost.publishedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {mappedPost.readTime} min
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-6">
                    {mappedPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-sm font-semibold transition-all cursor-pointer border border-gray-200 dark:border-gray-800"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </header>

                {/* Featured Image */}
                <div className="relative rounded-3xl overflow-hidden mb-12 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                  <img
                    src={mappedPost.image}
                    alt={mappedPost.title}
                    className="w-full h-[400px] lg:h-[500px] object-cover"
                  />
                </div>

                {/* Article Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {renderContent(mappedPost.content || '')}
                </div>

                {/* Call to Action */}
                <div className="mt-16 p-8 lg:p-10 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-3xl shadow-2xl">
                  <div className="text-center text-white">
                    <Award className="w-16 h-16 mx-auto mb-4 opacity-90" />
                    <h3 className="text-2xl lg:text-3xl font-black mb-4">¿Te gustó este artículo?</h3>
                    <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                      Únete a miles de developers que reciben contenido exclusivo sobre desarrollo web, React y las últimas tecnologías.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
                        Suscribirme gratis
                      </button>
                      <button 
                        onClick={handleLike}
                        className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 rounded-xl font-bold text-lg hover:bg-white/30 transition-all transform hover:scale-105"
                      >
                        Dale Me Gusta
                      </button>
                    </div>
                  </div>
                </div>

                {/* Author Bio */}
                <div className="mt-16 p-8 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-950 rounded-3xl border-2 border-gray-200 dark:border-gray-800">
                  <AuthorCard author={mappedPost.author} />
                </div>

                {/* Reaction Picker */}
                <div className="mt-12">
                  <ReactionPicker postId={mappedPost.id} />
                </div>

                {/* Comments Section */}
                <div className="mt-16">
                  <div className="flex items-center gap-3 mb-8">
                    <MessageCircle className="w-7 h-7 text-[#98ca3f]" />
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                      Comentarios ({post?.comments})
                    </h2>
                  </div>
                  <CommentSection postId={mappedPost.id} />
                </div>
              </article>
            </main>

            {/* Right Sidebar - TOC & Related */}
            <aside className="lg:col-span-3">
              <div className="sticky top-36 space-y-6">
                {/* Table of Contents */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#98ca3f]" />
                    Contenidos
                  </h3>
                  <nav className="space-y-2">
                    {tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-sm text-gray-600 dark:text-gray-400 hover:text-[#98ca3f] dark:hover:text-[#98ca3f] hover:translate-x-1 transition-all py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          item.level === 3 ? 'pl-6 text-xs' : 'font-medium'
                        }`}
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Related Posts */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-800 shadow-lg">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <ZapIcon className="w-5 h-5 text-purple-500" />
                    Artículos Relacionados
                  </h3>
                  <div className="space-y-5">
                    {mappedRelatedPosts.map((relatedPost) => (
                      <article
                        key={relatedPost.id}
                        onClick={() => onNavigate?.('blogPost')}
                        className="group cursor-pointer"
                      >
                        <div className="relative h-32 rounded-xl overflow-hidden mb-3 shadow-md">
                          <img
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 mb-2 leading-snug">
                          {relatedPost.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {relatedPost.readTime} min
                          </div>
                          <span>•</span>
                          <span>{relatedPost.author}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                {/* Newsletter CTA */}
                <div className="bg-gradient-to-br from-[#98ca3f] to-[#7ab02f] rounded-2xl p-6 text-white shadow-2xl shadow-green-500/30">
                  <Sparkles className="w-10 h-10 mb-4" />
                  <h3 className="text-xl font-black mb-3">Newsletter Semanal</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Recibe los mejores artículos directamente en tu correo cada semana.
                  </p>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 rounded-xl mb-3 text-gray-900 font-medium placeholder:text-gray-500"
                  />
                  <button className="w-full px-4 py-3 bg-white text-[#98ca3f] rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105">
                    Suscribirme
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:scale-110 transition-all z-50 flex items-center justify-center group"
        >
          <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
        </button>
      )}
    </div>
  );
}