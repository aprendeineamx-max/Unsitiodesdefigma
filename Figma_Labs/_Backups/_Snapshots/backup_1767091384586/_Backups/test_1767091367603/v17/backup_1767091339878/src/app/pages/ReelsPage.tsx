import { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreVertical,
  Volume2,
  VolumeX,
  Share2,
  Award,
  Flame,
  TrendingUp,
  Music,
  Sparkles,
  Play,
  Pause
} from 'lucide-react';

interface Reel {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    level?: number;
    followers: number;
  };
  video: {
    url: string;
    thumbnail: string;
    duration: number;
  };
  audio: {
    name: string;
    artist: string;
  };
  description: string;
  hashtags: string[];
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
  isTrending?: boolean;
}

const MOCK_REELS: Reel[] = [
  {
    id: '1',
    user: {
      name: 'Ana García',
      username: '@anagarcia',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      verified: true,
      level: 42,
      followers: 12500
    },
    video: {
      url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1080&h=1920&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=600&fit=crop',
      duration: 45
    },
    audio: {
      name: 'Code Vibes',
      artist: 'Dev Beats'
    },
    description: '🚀 Así es como estructuro mis proyectos de React en 2024! Tips y mejores prácticas que uso en producción. ¿Qué opinas?',
    hashtags: ['React', 'WebDev', 'Programming', 'JavaScript', 'Frontend'],
    stats: {
      likes: 8934,
      comments: 234,
      shares: 156,
      views: 45600
    },
    isLiked: false,
    isBookmarked: false,
    isTrending: true
  },
  {
    id: '2',
    user: {
      name: 'Carlos Méndez',
      username: '@carlosmendez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      verified: true,
      level: 38,
      followers: 8900
    },
    video: {
      url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1080&h=1920&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=600&fit=crop',
      duration: 60
    },
    audio: {
      name: 'TypeScript Flow',
      artist: 'Code Music'
    },
    description: '💡 5 tips de TypeScript que cambiarán tu forma de programar! #1 te va a sorprender 🤯',
    hashtags: ['TypeScript', 'Tips', 'Coding', 'Tutorial', 'WebDev'],
    stats: {
      likes: 12450,
      comments: 456,
      shares: 289,
      views: 67800
    },
    isLiked: false,
    isBookmarked: false,
    isTrending: true
  },
  {
    id: '3',
    user: {
      name: 'Laura Torres',
      username: '@lauratorres',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
      verified: false,
      level: 25,
      followers: 3400
    },
    video: {
      url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1080&h=1920&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=600&fit=crop',
      duration: 30
    },
    audio: {
      name: 'Study Mode',
      artist: 'Lo-Fi Coders'
    },
    description: '🎯 Mi rutina de estudio para aprender programación! Así logré pasar de 0 a developer en 6 meses 💪',
    hashtags: ['StudyTips', 'Learning', 'Developer', 'Motivation'],
    stats: {
      likes: 5670,
      comments: 189,
      shares: 234,
      views: 34500
    },
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '4',
    user: {
      name: 'Miguel Santos',
      username: '@miguelsantos',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel',
      verified: true,
      level: 50,
      followers: 23400
    },
    video: {
      url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1080&h=1920&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=600&fit=crop',
      duration: 55
    },
    audio: {
      name: 'Testing Anthem',
      artist: 'QA Squad'
    },
    description: '🔥 Testing con Vitest vs Jest - La comparativa definitiva! Spoiler: los resultados te van a sorprender',
    hashtags: ['Testing', 'Vitest', 'Jest', 'QA', 'DevTools'],
    stats: {
      likes: 15230,
      comments: 567,
      shares: 445,
      views: 89400
    },
    isLiked: false,
    isBookmarked: false,
    isTrending: true
  },
  {
    id: '5',
    user: {
      name: 'Sofia Ramirez',
      username: '@sofiaramirez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
      verified: true,
      level: 35,
      followers: 11200
    },
    video: {
      url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1080&h=1920&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=600&fit=crop',
      duration: 40
    },
    audio: {
      name: 'Setup Dreams',
      artist: 'Workspace Beats'
    },
    description: '✨ Mi setup de desarrollo 2024! Todo lo que necesitas saber sobre mi estación de trabajo ideal 🖥️',
    hashtags: ['Setup', 'Workspace', 'DevLife', 'Productivity'],
    stats: {
      likes: 9845,
      comments: 345,
      shares: 267,
      views: 52300
    },
    isLiked: false,
    isBookmarked: false
  }
];

interface ReelsPageProps {
  onNavigate?: (page: string) => void;
}

export function ReelsPage({ onNavigate }: ReelsPageProps) {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [reels, setReels] = useState(MOCK_REELS);
  const [isMuted, setIsMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [comment, setComment] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentReel = reels[currentReelIndex];

  // Handle scroll to change reels
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const reelHeight = window.innerHeight;
      const newIndex = Math.round(scrollPosition / reelHeight);
      if (newIndex !== currentReelIndex && newIndex < reels.length) {
        setCurrentReelIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentReelIndex, reels.length]);

  const handleLike = () => {
    setReels(reels.map((reel, index) => {
      if (index === currentReelIndex) {
        return {
          ...reel,
          isLiked: !reel.isLiked,
          stats: {
            ...reel.stats,
            likes: reel.isLiked ? reel.stats.likes - 1 : reel.stats.likes + 1
          }
        };
      }
      return reel;
    }));
  };

  const handleBookmark = () => {
    setReels(reels.map((reel, index) => {
      if (index === currentReelIndex) {
        return {
          ...reel,
          isBookmarked: !reel.isBookmarked
        };
      }
      return reel;
    }));
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      console.log('Comment submitted:', comment);
      setComment('');
      setShowComments(false);
      // Update comment count
      setReels(reels.map((reel, index) => {
        if (index === currentReelIndex) {
          return {
            ...reel,
            stats: {
              ...reel.stats,
              comments: reel.stats.comments + 1
            }
          };
        }
        return reel;
      }));
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Reels Container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className="relative h-screen w-full snap-start snap-always flex items-center justify-center bg-black"
          >
            {/* Video/Image */}
            <div className="relative w-full h-full max-w-md mx-auto">
              <img
                src={reel.video.url}
                alt={reel.description}
                className="w-full h-full object-cover"
              />

              {/* Gradient Overlays */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />

              {/* Trending Badge */}
              {reel.isTrending && (
                <div className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg">
                  <Flame className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-bold">Trending</span>
                </div>
              )}

              {/* User Info & Content */}
              <div className="absolute bottom-20 left-0 right-0 px-6 z-10">
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative">
                    <img
                      src={reel.user.avatar}
                      alt={reel.user.name}
                      className="w-12 h-12 rounded-full ring-2 ring-white"
                    />
                    {reel.user.level && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {reel.user.level}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold">{reel.user.name}</span>
                      {reel.user.verified && (
                        <Award className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <span className="text-white/70 text-sm">@{reel.user.username.replace('@', '')}</span>
                    <span className="text-white/70 text-sm mx-2">•</span>
                    <span className="text-white/70 text-sm">{formatNumber(reel.user.followers)} seguidores</span>
                  </div>
                  {!isFollowing && (
                    <button
                      onClick={() => setIsFollowing(true)}
                      className="px-6 py-2 bg-[#98ca3f] text-white rounded-full font-bold hover:bg-[#7ab02f] transition-all transform hover:scale-105"
                    >
                      Seguir
                    </button>
                  )}
                </div>

                {/* Description */}
                <p className="text-white text-sm mb-3 leading-relaxed">
                  {reel.description}
                </p>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {reel.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[#98ca3f] text-sm font-medium hover:underline cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Audio Info */}
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
                  <Music className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">
                    {reel.audio.name} - {reel.audio.artist}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute right-4 bottom-32 z-10 flex flex-col gap-6">
                {/* Like */}
                <button
                  onClick={handleLike}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`w-14 h-14 flex items-center justify-center rounded-full transition-all transform group-hover:scale-110 ${
                    reel.isLiked
                      ? 'bg-gradient-to-r from-red-500 to-pink-500'
                      : 'bg-white/20 backdrop-blur-sm'
                  }`}>
                    <Heart className={`w-7 h-7 text-white ${reel.isLiked ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-white text-xs font-bold">{formatNumber(reel.stats.likes)}</span>
                </button>

                {/* Comments */}
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-14 h-14 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full transition-all transform group-hover:scale-110">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-white text-xs font-bold">{formatNumber(reel.stats.comments)}</span>
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-14 h-14 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full transition-all transform group-hover:scale-110">
                    <Send className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-white text-xs font-bold">{formatNumber(reel.stats.shares)}</span>
                </button>

                {/* Bookmark */}
                <button
                  onClick={handleBookmark}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`w-14 h-14 flex items-center justify-center rounded-full transition-all transform group-hover:scale-110 ${
                    reel.isBookmarked
                      ? 'bg-yellow-500'
                      : 'bg-white/20 backdrop-blur-sm'
                  }`}>
                    <Bookmark className={`w-7 h-7 text-white ${reel.isBookmarked ? 'fill-current' : ''}`} />
                  </div>
                </button>

                {/* More */}
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-14 h-14 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full transition-all transform group-hover:scale-110">
                    <MoreVertical className="w-7 h-7 text-white" />
                  </div>
                </button>
              </div>

              {/* Mute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-all"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Play/Pause Overlay */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10"
              >
                {!isPlaying && (
                  <div className="w-20 h-20 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Comentarios ({currentReel.stats.comments})
              </h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Sé el primero en comentar
              </p>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                  placeholder="Agrega un comentario..."
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#98ca3f]"
                />
                <button
                  onClick={handleCommentSubmit}
                  disabled={!comment.trim()}
                  className="px-6 py-3 bg-[#98ca3f] text-white rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7ab02f] transition-all"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Menu */}
      {showShareMenu && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl p-6 animate-in slide-in-from-bottom">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Compartir</h3>
            <div className="space-y-2">
              {['WhatsApp', 'Twitter', 'Facebook', 'Copiar enlace'].map((option) => (
                <button
                  key={option}
                  className="w-full px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowShareMenu(false)}
              className="w-full mt-4 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={() => onNavigate?.('feed')}
          className="text-white font-bold text-lg"
        >
          ← Reels
        </button>
        <div className="flex items-center gap-2 text-white text-sm">
          <TrendingUp className="w-4 h-4" />
          <span>{formatNumber(currentReel.stats.views)} vistas</span>
        </div>
      </div>
    </div>
  );
}
