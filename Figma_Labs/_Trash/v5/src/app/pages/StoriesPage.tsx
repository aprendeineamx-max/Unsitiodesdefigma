import { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Send,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Share2,
  Bookmark,
  MessageCircle,
  Eye,
  Sparkles,
  Award,
  Flame
} from 'lucide-react';

interface Story {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    level?: number;
  };
  media: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
  timestamp: string;
  views: number;
  reactions: number;
  content?: {
    text?: string;
    link?: string;
    poll?: {
      question: string;
      options: { text: string; votes: number }[];
    };
  };
  seen: boolean;
}

const MOCK_STORIES: Story[] = [
  {
    id: '1',
    user: {
      name: 'Ana García',
      username: '@anagarcia',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      verified: true,
      level: 42
    },
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1080&h=1920&fit=crop'
    },
    timestamp: '2h',
    views: 1247,
    reactions: 89,
    content: {
      text: '🚀 Nuevo tutorial de React Server Components!',
      link: 'Ver curso completo'
    },
    seen: false
  },
  {
    id: '2',
    user: {
      name: 'Carlos Méndez',
      username: '@carlosmendez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      verified: true,
      level: 38
    },
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1080&h=1920&fit=crop'
    },
    timestamp: '4h',
    views: 2341,
    reactions: 156,
    content: {
      text: '💡 Tips para TypeScript 5.0',
      poll: {
        question: '¿Ya usas TypeScript 5.0?',
        options: [
          { text: 'Sí, lo uso diario', votes: 234 },
          { text: 'Estoy aprendiendo', votes: 156 },
          { text: 'Aún no', votes: 45 }
        ]
      }
    },
    seen: false
  },
  {
    id: '3',
    user: {
      name: 'Laura Torres',
      username: '@lauratorres',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
      verified: false,
      level: 25
    },
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1080&h=1920&fit=crop'
    },
    timestamp: '6h',
    views: 892,
    reactions: 67,
    content: {
      text: '🎯 ¡Completé el curso de Next.js!',
      link: 'Ver mi certificado'
    },
    seen: true
  },
  {
    id: '4',
    user: {
      name: 'Miguel Santos',
      username: '@miguelsantos',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel',
      verified: true,
      level: 50
    },
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1080&h=1920&fit=crop'
    },
    timestamp: '8h',
    views: 3456,
    reactions: 234,
    content: {
      text: '🔥 Testing con Vitest vs Jest',
      link: 'Leer artículo completo'
    },
    seen: true
  },
  {
    id: '5',
    user: {
      name: 'Sofia Ramirez',
      username: '@sofiaramirez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
      verified: true,
      level: 35
    },
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1080&h=1920&fit=crop'
    },
    timestamp: '10h',
    views: 1876,
    reactions: 145,
    content: {
      text: '✨ Mi setup de desarrollo 2024',
      poll: {
        question: '¿Qué editor usas?',
        options: [
          { text: 'VS Code', votes: 456 },
          { text: 'WebStorm', votes: 89 },
          { text: 'Vim/Neovim', votes: 67 },
          { text: 'Otro', votes: 23 }
        ]
      }
    },
    seen: false
  }
];

interface StoriesPageProps {
  onNavigate?: (page: string) => void;
}

export function StoriesPage({ onNavigate }: StoriesPageProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [hasReacted, setHasReacted] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);

  const currentStory = MOCK_STORIES[currentStoryIndex];
  const STORY_DURATION = 5000; // 5 seconds

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story
          if (currentStoryIndex < MOCK_STORIES.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
            setSelectedPollOption(null);
            return 0;
          } else {
            // End of stories
            onNavigate?.('feed');
            return 100;
          }
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStoryIndex, isPaused, onNavigate]);

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
      setSelectedPollOption(null);
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < MOCK_STORIES.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
      setSelectedPollOption(null);
    } else {
      onNavigate?.('feed');
    }
  };

  const handleReact = () => {
    setHasReacted(!hasReacted);
    setShowReactions(true);
    setTimeout(() => setShowReactions(false), 2000);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log('Message sent:', message);
      setMessage('');
    }
  };

  const handlePollVote = (optionIndex: number) => {
    setSelectedPollOption(optionIndex);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Story Container */}
      <div className="relative w-full max-w-md h-full bg-black">
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
          {MOCK_STORIES.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: index < currentStoryIndex ? '100%' : index === currentStoryIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 z-20 px-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentStory.user.avatar}
                  alt={currentStory.user.name}
                  className="w-10 h-10 rounded-full ring-2 ring-white"
                />
                {currentStory.user.level && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {currentStory.user.level}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-sm">{currentStory.user.name}</span>
                  {currentStory.user.verified && (
                    <Award className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <span className="text-white/70 text-xs">{currentStory.timestamp}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="w-8 h-8 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-all"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-8 h-8 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-all"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-all">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate?.('feed')}
                className="w-8 h-8 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Story Media */}
        <div className="relative h-full flex items-center justify-center">
          <img
            src={currentStory.media.url}
            alt="Story"
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlays */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Navigation Areas */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
            disabled={currentStoryIndex === 0}
          />
          <button
            onClick={handleNext}
            className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
          />
        </div>

        {/* Story Content */}
        {currentStory.content && (
          <div className="absolute bottom-32 left-0 right-0 z-10 px-6">
            {currentStory.content.text && (
              <div className="mb-4">
                <p className="text-white text-xl font-bold drop-shadow-lg">
                  {currentStory.content.text}
                </p>
              </div>
            )}

            {currentStory.content.link && !currentStory.content.poll && (
              <button className="w-full px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full font-bold hover:bg-white transition-all transform hover:scale-105">
                {currentStory.content.link}
              </button>
            )}

            {/* Poll */}
            {currentStory.content.poll && (
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4">
                <p className="text-white font-bold mb-3">{currentStory.content.poll.question}</p>
                <div className="space-y-2">
                  {currentStory.content.poll.options.map((option, index) => {
                    const totalVotes = currentStory.content.poll!.options.reduce((sum, opt) => sum + opt.votes, 0);
                    const percentage = ((option.votes / totalVotes) * 100).toFixed(0);
                    const isSelected = selectedPollOption === index;

                    return (
                      <button
                        key={index}
                        onClick={() => handlePollVote(index)}
                        className={`w-full relative overflow-hidden rounded-xl transition-all ${
                          isSelected
                            ? 'ring-2 ring-white'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <div
                          className="absolute inset-y-0 left-0 bg-white/20 transition-all"
                          style={{ width: selectedPollOption !== null ? `${percentage}%` : '0%' }}
                        />
                        <div className="relative px-4 py-3 flex items-center justify-between">
                          <span className="text-white font-medium">{option.text}</span>
                          {selectedPollOption !== null && (
                            <span className="text-white font-bold">{percentage}%</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="absolute bottom-20 left-6 z-10 flex items-center gap-4 text-white">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-bold">{currentStory.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className={`w-4 h-4 ${hasReacted ? 'fill-current text-red-500' : ''}`} />
            <span className="text-sm font-bold">{currentStory.reactions + (hasReacted ? 1 : 0)}</span>
          </div>
        </div>

        {/* Reaction Animation */}
        {showReactions && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
            <Heart className="w-32 h-32 text-red-500 fill-current animate-ping" />
          </div>
        )}

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Enviar mensaje..."
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              onClick={handleReact}
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
                hasReacted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
              }`}
            >
              <Heart className={`w-5 h-5 ${hasReacted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleSendMessage}
              className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Arrows (Desktop) */}
        <div className="hidden md:flex">
          {currentStoryIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-all z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {currentStoryIndex < MOCK_STORIES.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-all z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
