import { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Send,
  MoreVertical,
  Eye,
  Share2,
  Download,
  Flag,
  Smile,
  Plus
} from 'lucide-react';

interface Story {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  media: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    duration?: number; // seconds
  };
  caption?: string;
  timestamp: string;
  views: number;
  reactions: number;
  userReacted: boolean;
}

interface StoryGroup {
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  stories: Story[];
  hasUnviewed: boolean;
}

interface StoryViewerProps {
  storyGroups: StoryGroup[];
  currentGroupIndex?: number;
  currentUserId?: string;
  onClose?: () => void;
  onStoryView?: (storyId: string) => void;
  onReact?: (storyId: string) => void;
  onReply?: (storyId: string, message: string) => void;
  onShare?: (storyId: string) => void;
  onCreateStory?: () => void;
}

export function StoryViewer({
  storyGroups,
  currentGroupIndex: initialGroupIndex = 0,
  currentUserId,
  onClose,
  onStoryView,
  onReact,
  onReply,
  onShare,
  onCreateStory
}: StoryViewerProps) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];
  const isVideo = currentStory?.media.type === 'video';
  const duration = isVideo ? (currentStory.media.duration || 15) : 5; // Default 5s for images

  useEffect(() => {
    if (!currentStory) return;

    // Mark as viewed
    onStoryView?.(currentStory.id);

    // Reset progress
    setProgress(0);

    // Start progress timer
    if (!isPaused) {
      startProgress();
    }

    return () => {
      stopProgress();
    };
  }, [currentStory, isPaused]);

  const startProgress = () => {
    stopProgress();
    
    const interval = 50; // Update every 50ms
    const increment = (interval / (duration * 1000)) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          nextStory();
          return 0;
        }
        return newProgress;
      });
    }, interval);
  };

  const stopProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      nextGroup();
    }
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else {
      previousGroup();
    }
  };

  const nextGroup = () => {
    if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose?.();
    }
  };

  const previousGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
      setCurrentStoryIndex(0);
    }
  };

  const handleReact = () => {
    if (currentStory) {
      onReact?.(currentStory.id);
    }
  };

  const handleSendReply = () => {
    if (currentStory && replyText.trim()) {
      onReply?.(currentStory.id, replyText);
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Background blur */}
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* Story groups thumbnails (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {/* Create Story Button */}
          {currentUserId && (
            <button
              onClick={onCreateStory}
              className="flex-shrink-0 flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#98CA3F] to-[#7fb32f] flex items-center justify-center ring-4 ring-white/20">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-white font-medium">Crear</span>
            </button>
          )}

          {storyGroups.map((group, index) => (
            <button
              key={group.userId}
              onClick={() => {
                setCurrentGroupIndex(index);
                setCurrentStoryIndex(0);
              }}
              className="flex-shrink-0 flex flex-col items-center gap-2"
            >
              <div
                className={`w-14 h-14 rounded-full p-0.5 ${
                  index === currentGroupIndex
                    ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500'
                    : group.hasUnviewed
                    ? 'bg-gradient-to-tr from-blue-500 to-cyan-500'
                    : 'bg-gray-600'
                } ring-2 ring-black`}
              >
                <img
                  src={group.user.avatar}
                  alt={group.user.name}
                  className="w-full h-full rounded-full object-cover ring-2 ring-black"
                />
              </div>
              <span className="text-xs text-white font-medium truncate max-w-[60px]">
                {group.user.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Story Container */}
      <div className="relative w-full max-w-lg h-full max-h-[90vh] bg-black rounded-lg overflow-hidden">
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-20 p-2 flex gap-1">
          {currentGroup.stories.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{
                  width: index < currentStoryIndex ? '100%' : index === currentStoryIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentStory.author.avatar}
                alt={currentStory.author.name}
                className="w-10 h-10 rounded-full ring-2 ring-white/30"
              />
              <div>
                <h3 className="text-white font-semibold text-sm">
                  {currentStory.author.name}
                </h3>
                <p className="text-white/70 text-xs">
                  {new Date(currentStory.timestamp).toLocaleString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isVideo && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
              )}

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
              >
                {isPaused ? (
                  <Play className="w-5 h-5 text-white" />
                ) : (
                  <Pause className="w-5 h-5 text-white" />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 bg-gray-900 rounded-lg shadow-2xl py-1 min-w-[200px]">
                      <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-800 transition-colors text-left">
                        <Download className="w-4 h-4 text-white" />
                        <span className="text-sm text-white">Descargar</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-800 transition-colors text-left">
                        <Flag className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400">Reportar</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Story Media */}
        <div
          className="w-full h-full flex items-center justify-center bg-black"
          onClick={handleVideoPlay}
        >
          {isVideo ? (
            <video
              ref={videoRef}
              src={currentStory.media.url}
              className="w-full h-full object-contain"
              muted={isMuted}
              autoPlay
              playsInline
              onEnded={nextStory}
            />
          ) : (
            <img
              src={currentStory.media.url}
              alt=""
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-24 left-0 right-0 px-4">
            <p className="text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Navigation Areas */}
        <button
          onClick={previousStory}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-full flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity group"
        >
          <ChevronLeft className="w-8 h-8 text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button
          onClick={nextStory}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity group"
        >
          <ChevronRight className="w-8 h-8 text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          {showReplyInput ? (
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Enviar mensaje..."
                className="flex-1 bg-transparent border-0 text-white placeholder:text-white/70 focus:ring-0 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendReply();
                  }
                }}
              />
              <button
                onClick={handleSendReply}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowReplyInput(true)}
                className="flex-1 flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
              >
                <Smile className="w-5 h-5 text-white" />
                <span className="text-white text-sm">Enviar mensaje</span>
              </button>

              <button
                onClick={handleReact}
                className={`p-3 rounded-full transition-all ${
                  currentStory.userReacted
                    ? 'bg-red-500 scale-110'
                    : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                <Heart className={`w-6 h-6 ${currentStory.userReacted ? 'fill-white text-white' : 'text-white'}`} />
              </button>

              <button
                onClick={() => onShare?.(currentStory.id)}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
              >
                <Share2 className="w-6 h-6 text-white" />
              </button>
            </div>
          )}

          {/* Views */}
          <div className="mt-3 flex items-center gap-2 text-white/70 text-xs">
            <Eye className="w-4 h-4" />
            <span>{currentStory.views.toLocaleString()} visualizaciones</span>
            {currentStory.reactions > 0 && (
              <>
                <span>•</span>
                <Heart className="w-4 h-4" />
                <span>{currentStory.reactions.toLocaleString()}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
