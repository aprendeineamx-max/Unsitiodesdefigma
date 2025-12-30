import { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music,
  MoreVertical,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Check,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Flag
} from 'lucide-react';

interface Reel {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    username: string;
    verified?: boolean;
    isFollowing?: boolean;
  };
  video: {
    url: string;
    thumbnail: string;
    duration: number;
    aspectRatio?: number;
  };
  audio?: {
    name: string;
    artist: string;
    coverImage?: string;
  };
  description: string;
  hashtags: string[];
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    views: number;
  };
  userInteraction?: {
    liked: boolean;
    bookmarked: boolean;
    following: boolean;
  };
  timestamp: string;
}

interface ReelsViewerProps {
  reels: Reel[];
  initialIndex?: number;
  currentUserId?: string;
  onLike?: (reelId: string) => void;
  onComment?: (reelId: string) => void;
  onShare?: (reelId: string) => void;
  onBookmark?: (reelId: string) => void;
  onFollow?: (userId: string) => void;
  onLoadMore?: () => void;
  onClose?: () => void;
}

export function ReelsViewer({
  reels,
  initialIndex = 0,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onFollow,
  onLoadMore,
  onClose
}: ReelsViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [showDescription, setShowDescription] = useState(true);

  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const currentReel = reels[currentIndex];

  // Auto-play current video
  useEffect(() => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.play();
      } else {
        currentVideo.pause();
      }
    }

    // Pause other videos
    Object.entries(videoRefs.current).forEach(([index, video]) => {
      if (video && parseInt(index) !== currentIndex) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentIndex, isPlaying]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (currentIndex >= reels.length - 3) {
      onLoadMore?.();
    }
  }, [currentIndex, reels.length, onLoadMore]);

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleDoubleTap = () => {
    if (!currentReel.userInteraction?.liked) {
      setLikeAnimation(true);
      onLike?.(currentReel.id);
      setTimeout(() => setLikeAnimation(false), 1000);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        handlePrevious();
        break;
      case 'ArrowDown':
        handleNext();
        break;
      case ' ':
        e.preventDefault();
        setIsPlaying(!isPlaying);
        break;
      case 'm':
      case 'M':
        setIsMuted(!isMuted);
        break;
      case 'Escape':
        onClose?.();
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-md h-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Video */}
        <div className="relative w-full h-full">
          <video
            ref={(el) => (videoRefs.current[currentIndex] = el)}
            src={currentReel.video.url}
            poster={currentReel.video.thumbnail}
            className="w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
            onDoubleClick={handleDoubleTap}
            onClick={() => setIsPlaying(!isPlaying)}
          />

          {/* Like Animation */}
          {likeAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="w-32 h-32 text-white fill-current animate-ping" />
            </div>
          )}

          {/* Gradient Overlays */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        </div>

        {/* Top Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button className="text-white font-semibold text-lg">
              Para ti
            </button>
            <button
              onClick={() => {}}
              className="text-white/70 font-semibold text-lg hover:text-white transition-colors"
            >
              Siguiendo
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Search className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <MoreVertical className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Left Side - Author Info & Description */}
        <div className="absolute bottom-0 left-0 right-20 p-4 z-10">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img
                src={currentReel.author.avatar}
                alt={currentReel.author.name}
                className="w-12 h-12 rounded-full ring-2 ring-white/30"
              />
              {!currentReel.userInteraction?.following && (
                <button
                  onClick={() => onFollow?.(currentReel.author.id)}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#98CA3F] rounded-full flex items-center justify-center ring-2 ring-black"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold">
                  {currentReel.author.username}
                </h3>
                {currentReel.author.verified && (
                  <Check className="w-4 h-4 text-blue-500 fill-current" />
                )}
              </div>
              <p className="text-white/70 text-sm">
                {new Date(currentReel.timestamp).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
            </div>
          </div>

          {/* Description */}
          {showDescription && (
            <div className="mb-3">
              <p className="text-white text-sm mb-2 line-clamp-3">
                {currentReel.description}
              </p>
              {currentReel.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentReel.hashtags.slice(0, 3).map((tag) => (
                    <button
                      key={tag}
                      className="text-white font-semibold text-sm hover:underline"
                    >
                      #{tag}
                    </button>
                  ))}
                  {currentReel.hashtags.length > 3 && (
                    <button className="text-white/70 text-sm">
                      +{currentReel.hashtags.length - 3}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Audio Info */}
          {currentReel.audio && (
            <button className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
              <Music className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium truncate max-w-[200px]">
                {currentReel.audio.name} • {currentReel.audio.artist}
              </span>
            </button>
          )}
        </div>

        {/* Right Side - Actions */}
        <div className="absolute bottom-0 right-0 p-4 z-10 flex flex-col items-center gap-6">
          {/* Like */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => onLike?.(currentReel.id)}
              className={`p-3 rounded-full transition-all ${
                currentReel.userInteraction?.liked
                  ? 'bg-red-500 scale-110'
                  : 'bg-black/30 hover:bg-black/50 backdrop-blur-sm'
              }`}
            >
              <Heart className={`w-7 h-7 ${
                currentReel.userInteraction?.liked ? 'fill-white text-white' : 'text-white'
              }`} />
            </button>
            <span className="text-white text-xs font-semibold mt-1">
              {currentReel.engagement.likes >= 1000
                ? `${(currentReel.engagement.likes / 1000).toFixed(1)}k`
                : currentReel.engagement.likes}
            </span>
          </div>

          {/* Comment */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => onComment?.(currentReel.id)}
              className="p-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full transition-colors"
            >
              <MessageCircle className="w-7 h-7 text-white" />
            </button>
            <span className="text-white text-xs font-semibold mt-1">
              {currentReel.engagement.comments >= 1000
                ? `${(currentReel.engagement.comments / 1000).toFixed(1)}k`
                : currentReel.engagement.comments}
            </span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => onShare?.(currentReel.id)}
              className="p-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full transition-colors"
            >
              <Share2 className="w-7 h-7 text-white" />
            </button>
            <span className="text-white text-xs font-semibold mt-1">
              {currentReel.engagement.shares >= 1000
                ? `${(currentReel.engagement.shares / 1000).toFixed(1)}k`
                : currentReel.engagement.shares}
            </span>
          </div>

          {/* Bookmark */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => onBookmark?.(currentReel.id)}
              className={`p-3 rounded-full transition-all ${
                currentReel.userInteraction?.bookmarked
                  ? 'bg-yellow-500 scale-110'
                  : 'bg-black/30 hover:bg-black/50 backdrop-blur-sm'
              }`}
            >
              <Bookmark className={`w-7 h-7 ${
                currentReel.userInteraction?.bookmarked ? 'fill-white text-white' : 'text-white'
              }`} />
            </button>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full transition-colors"
            >
              <MoreVertical className="w-7 h-7 text-white" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 bottom-full mb-2 z-50 bg-gray-900 rounded-lg shadow-2xl py-1 min-w-[200px]">
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left">
                    <Flag className="w-4 h-4 text-white" />
                    <span className="text-sm text-white">Reportar</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left">
                    <Users className="w-4 h-4 text-white" />
                    <span className="text-sm text-white">No me interesa</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mute/Unmute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-7 h-7 text-white" />
            ) : (
              <Volume2 className="w-7 h-7 text-white" />
            )}
          </button>

          {/* Audio Disc (rotating) */}
          {currentReel.audio?.coverImage && (
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white animate-spin-slow">
                <img
                  src={currentReel.audio.coverImage}
                  alt={currentReel.audio.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute top-1/2 left-4 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full transition-colors z-10"
          >
            <ChevronUp className="w-6 h-6 text-white" />
          </button>
        )}

        {currentIndex < reels.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-4 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full transition-colors z-10"
          >
            <ChevronDown className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Progress Indicator */}
        <div className="absolute top-20 right-4 z-10">
          <div className="flex flex-col gap-1">
            {reels.slice(Math.max(0, currentIndex - 2), Math.min(reels.length, currentIndex + 3)).map((_, i) => {
              const actualIndex = Math.max(0, currentIndex - 2) + i;
              return (
                <div
                  key={actualIndex}
                  className={`h-1 rounded-full transition-all ${
                    actualIndex === currentIndex
                      ? 'w-8 bg-white'
                      : 'w-4 bg-white/50'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Views Counter */}
        <div className="absolute top-16 left-4 z-10 flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <TrendingUp className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-semibold">
            {currentReel.engagement.views >= 1000000
              ? `${(currentReel.engagement.views / 1000000).toFixed(1)}M`
              : currentReel.engagement.views >= 1000
              ? `${(currentReel.engagement.views / 1000).toFixed(1)}k`
              : currentReel.engagement.views} vistas
          </span>
        </div>

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="p-6 bg-black/50 rounded-full">
              <Play className="w-16 h-16 text-white fill-white" />
            </div>
          </div>
        )}
      </div>

      {/* Loading indicator at bottom */}
      {currentIndex >= reels.length - 3 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
