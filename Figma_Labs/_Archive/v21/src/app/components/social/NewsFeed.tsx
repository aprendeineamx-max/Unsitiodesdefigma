import { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Send,
  Smile,
  Image as ImageIcon,
  Video,
  Music,
  MapPin,
  Users,
  Globe,
  Lock,
  Eye,
  TrendingUp,
  Zap,
  Award,
  CheckCircle,
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  Flag
} from 'lucide-react';

interface FeedPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    username: string;
    verified?: boolean;
    badges?: string[];
  };
  content: {
    text?: string;
    media?: Array<{
      type: 'image' | 'video' | 'gif';
      url: string;
      thumbnail?: string;
      aspectRatio?: number;
    }>;
    location?: {
      name: string;
      coordinates?: { lat: number; lng: number };
    };
    tags?: string[];
    mentions?: string[];
    feeling?: {
      emoji: string;
      text: string;
    };
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
    reactions: Array<{
      type: string;
      count: number;
      userReacted: boolean;
    }>;
  };
  metadata: {
    createdAt: string;
    editedAt?: string;
    visibility: 'public' | 'friends' | 'private';
    isAd?: boolean;
    isPinned?: boolean;
    isPromoted?: boolean;
  };
  userInteraction?: {
    liked: boolean;
    bookmarked: boolean;
    commented: boolean;
    shared: boolean;
  };
}

interface NewsFeedProps {
  posts: FeedPost[];
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, comment: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onPostClick?: (postId: string) => void;
  onAuthorClick?: (authorId: string) => void;
  onLoadMore?: () => void;
  variant?: 'timeline' | 'compact' | 'grid';
  showStories?: boolean;
}

export function NewsFeed({
  posts,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onPostClick,
  onAuthorClick,
  onLoadMore,
  variant = 'timeline',
  showStories = true
}: NewsFeedProps) {
  const [activePost, setActivePost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore?.();
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [onLoadMore]);

  const toggleMute = (postId: string) => {
    setMutedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleComment = (postId: string) => {
    const text = commentText[postId];
    if (text?.trim()) {
      onComment?.(postId, text);
      setCommentText({ ...commentText, [postId]: '' });
    }
  };

  const visibilityIcons = {
    public: Globe,
    friends: Users,
    private: Lock
  };

  const renderPost = (post: FeedPost) => {
    const VisibilityIcon = visibilityIcons[post.metadata.visibility];
    const totalReactions = post.engagement.reactions.reduce((sum, r) => sum + r.count, 0);

    return (
      <div
        key={post.id}
        className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all ${
          post.metadata.isPinned ? 'ring-2 ring-[#98CA3F]' : ''
        } ${
          post.metadata.isPromoted ? 'shadow-lg shadow-blue-500/20' : ''
        }`}
      >
        {/* Pinned/Promoted Badge */}
        {(post.metadata.isPinned || post.metadata.isPromoted) && (
          <div className={`px-4 py-2 ${
            post.metadata.isPinned ? 'bg-[#98CA3F]/10' : 'bg-blue-50 dark:bg-blue-900/20'
          } border-b border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center gap-2 text-sm">
              {post.metadata.isPinned ? (
                <>
                  <Award className="w-4 h-4 text-[#98CA3F]" />
                  <span className="font-semibold text-[#98CA3F]">Publicación destacada</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Promocionado</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <button
                onClick={() => onAuthorClick?.(post.author.id)}
                className="relative flex-shrink-0"
              >
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-gray-800"
                />
                {post.author.verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>

              {/* Author info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onAuthorClick?.(post.author.id)}
                    className="font-bold text-gray-900 dark:text-white hover:underline"
                  >
                    {post.author.name}
                  </button>
                  {post.author.badges && post.author.badges.length > 0 && (
                    <div className="flex items-center gap-1">
                      {post.author.badges.map((badge, i) => (
                        <span key={i} className="text-lg" title={badge}>
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                  <span>@{post.author.username}</span>
                  <span>•</span>
                  <span>{new Date(post.metadata.createdAt).toLocaleString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <VisibilityIcon className="w-3.5 h-3.5" />
                    <span className="capitalize">{post.metadata.visibility === 'public' ? 'Público' : post.metadata.visibility === 'friends' ? 'Amigos' : 'Privado'}</span>
                  </div>
                </div>
                {post.content.feeling && (
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    está {post.content.feeling.emoji} {post.content.feeling.text}
                  </div>
                )}
              </div>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(showMenu === post.id ? null : post.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {showMenu === post.id && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(null)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-1 min-w-[200px]">
                    <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
                      <Bookmark className="w-4 h-4" />
                      <span className="text-sm">Guardar</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Ocultar</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                      <Flag className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-600 dark:text-red-400">Reportar</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content Text */}
          {post.content.text && (
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap mb-3">
              {post.content.text}
            </p>
          )}

          {/* Location */}
          {post.content.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{post.content.location.name}</span>
            </div>
          )}

          {/* Tags */}
          {post.content.tags && post.content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.content.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[#98CA3F] hover:underline cursor-pointer text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Media */}
        {post.content.media && post.content.media.length > 0 && (
          <div className={`relative ${
            post.content.media.length === 1 ? '' : 
            post.content.media.length === 2 ? 'grid grid-cols-2 gap-0.5' :
            post.content.media.length === 3 ? 'grid grid-cols-2 gap-0.5' :
            'grid grid-cols-2 gap-0.5'
          }`}>
            {post.content.media.slice(0, 4).map((media, index) => (
              <div
                key={index}
                className={`relative bg-gray-900 ${
                  post.content.media!.length === 3 && index === 0 ? 'row-span-2' : ''
                } ${
                  index === 3 && post.content.media!.length > 4 ? 'relative' : ''
                }`}
                style={{
                  aspectRatio: media.aspectRatio || (post.content.media!.length === 1 ? '16/9' : '1/1')
                }}
              >
                {media.type === 'video' ? (
                  <>
                    <video
                      src={media.url}
                      poster={media.thumbnail}
                      className="w-full h-full object-cover cursor-pointer"
                      muted={mutedVideos.has(post.id)}
                      loop
                      onClick={() => onPostClick?.(post.id)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute(post.id);
                      }}
                      className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                    >
                      {mutedVideos.has(post.id) ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <div className="absolute top-4 left-4 px-2 py-1 bg-black/50 rounded text-white text-xs font-semibold flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      VIDEO
                    </div>
                  </>
                ) : (
                  <img
                    src={media.url}
                    alt=""
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => onPostClick?.(post.id)}
                  />
                )}

                {/* More media overlay */}
                {index === 3 && post.content.media!.length > 4 && (
                  <div
                    onClick={() => onPostClick?.(post.id)}
                    className="absolute inset-0 bg-black/70 flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors"
                  >
                    <span className="text-white text-4xl font-bold">
                      +{post.content.media!.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Engagement Stats */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              {/* Reactions */}
              {totalReactions > 0 && (
                <button className="flex items-center gap-1 hover:underline">
                  <div className="flex items-center -space-x-1">
                    {post.engagement.reactions.filter(r => r.count > 0).slice(0, 3).map((reaction, i) => (
                      <span
                        key={i}
                        className="w-5 h-5 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-xs ring-1 ring-white dark:ring-gray-800"
                      >
                        {reaction.type === 'like' && '❤️'}
                        {reaction.type === 'love' && '😍'}
                        {reaction.type === 'haha' && '😂'}
                        {reaction.type === 'wow' && '😮'}
                        {reaction.type === 'sad' && '😢'}
                        {reaction.type === 'angry' && '😡'}
                      </span>
                    ))}
                  </div>
                  <span>{totalReactions.toLocaleString()}</span>
                </button>
              )}

              {/* Views */}
              {post.engagement.views && (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.engagement.views.toLocaleString()} vistas
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {post.engagement.comments > 0 && (
                <button className="hover:underline">
                  {post.engagement.comments.toLocaleString()} comentarios
                </button>
              )}
              {post.engagement.shares > 0 && (
                <button className="hover:underline">
                  {post.engagement.shares.toLocaleString()} compartidos
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-around">
            <button
              onClick={() => onLike?.(post.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                post.userInteraction?.liked
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Heart className={`w-5 h-5 ${post.userInteraction?.liked ? 'fill-current' : ''}`} />
              <span>Me gusta</span>
            </button>

            <button
              onClick={() => setActivePost(activePost === post.id ? null : post.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Comentar</span>
            </button>

            <button
              onClick={() => onShare?.(post.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <Share2 className="w-5 h-5" />
              <span>Compartir</span>
            </button>

            <button
              onClick={() => onBookmark?.(post.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                post.userInteraction?.bookmarked
                  ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${post.userInteraction?.bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Comment Input */}
        {activePost === post.id && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex gap-3">
              {currentUserId && (
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserId}`}
                  alt="Tu avatar"
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <textarea
                  value={commentText[post.id] || ''}
                  onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                  placeholder="Escribe un comentario..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleComment(post.id);
                    }
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleComment(post.id)}
                    disabled={!commentText[post.id]?.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Comentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {posts.map(renderPost)}
      
      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#98CA3F] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
