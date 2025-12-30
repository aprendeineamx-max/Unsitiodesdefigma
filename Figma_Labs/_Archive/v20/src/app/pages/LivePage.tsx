import { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Gift,
  MoreVertical,
  Volume2,
  VolumeX,
  Maximize,
  Award,
  TrendingUp,
  Flame,
  Sparkles,
  Send,
  Eye,
  Clock,
  Radio
} from 'lucide-react';

interface LiveStream {
  id: string;
  streamer: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    level: number;
    followers: number;
  };
  title: string;
  category: string;
  thumbnail: string;
  viewers: number;
  duration: string;
  tags: string[];
  isLive: boolean;
}

interface Message {
  id: string;
  user: {
    name: string;
    avatar: string;
    level?: number;
    badge?: string;
  };
  message: string;
  timestamp: string;
  isGift?: boolean;
  giftType?: string;
}

const MOCK_LIVE_STREAM: LiveStream = {
  id: '1',
  streamer: {
    name: 'Miguel Santos',
    username: '@miguelsantos',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel',
    verified: true,
    level: 50,
    followers: 23400
  },
  title: '🔥 Construyendo una App Full-Stack con Next.js 14 y Supabase - Session #5',
  category: 'Desarrollo Web',
  thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&h=1080&fit=crop',
  viewers: 1247,
  duration: '2:34:15',
  tags: ['Next.js', 'React', 'Supabase', 'TypeScript', 'FullStack'],
  isLive: true
};

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    user: {
      name: 'Ana García',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      level: 42,
      badge: 'VIP'
    },
    message: '¡Excelente explicación! 🚀',
    timestamp: '2:34:10'
  },
  {
    id: '2',
    user: {
      name: 'Carlos Méndez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      level: 38
    },
    message: '¿Podrías mostrar cómo manejar la autenticación?',
    timestamp: '2:34:12'
  },
  {
    id: '3',
    user: {
      name: 'Laura Torres',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
      level: 25,
      badge: 'SUB'
    },
    message: 'Gracias por el stream! Aprendiendo mucho 💪',
    timestamp: '2:34:15'
  }
];

const GIFTS = [
  { id: '1', name: 'Corazón', emoji: '❤️', coins: 10 },
  { id: '2', name: 'Fuego', emoji: '🔥', coins: 25 },
  { id: '3', name: 'Estrella', emoji: '⭐', coins: 50 },
  { id: '4', name: 'Cohete', emoji: '🚀', coins: 100 },
  { id: '5', name: 'Corona', emoji: '👑', coins: 250 },
  { id: '6', name: 'Trofeo', emoji: '🏆', coins: 500 }
];

interface LivePageProps {
  onNavigate?: (page: string) => void;
}

export function LivePage({ onNavigate }: LivePageProps) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likes, setLikes] = useState(8934);
  const [viewers, setViewers] = useState(MOCK_LIVE_STREAM.viewers);
  const [showFloatingGift, setShowFloatingGift] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate viewer count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers((prev) => prev + Math.floor(Math.random() * 10) - 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate incoming messages
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMessages = [
        'Increíble contenido! 🎉',
        '¿Podrías explicar esa parte de nuevo?',
        'Siguiendo desde México 🇲🇽',
        'Gran stream! 👏',
        'Esto es oro puro 💎'
      ];
      const randomUser = {
        name: `Usuario ${Math.floor(Math.random() * 1000)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${Math.random()}`,
        level: Math.floor(Math.random() * 50) + 1
      };
      const newMsg: Message = {
        id: Date.now().toString(),
        user: randomUser,
        message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, newMsg]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        user: {
          name: 'Tú',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
          level: 30,
          badge: 'YOU'
        },
        message: newMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleSendGift = (gift: typeof GIFTS[0]) => {
    setShowFloatingGift(gift.emoji);
    setTimeout(() => setShowFloatingGift(null), 3000);
    
    const giftMessage: Message = {
      id: Date.now().toString(),
      user: {
        name: 'Tú',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
        badge: 'GIFT'
      },
      message: `Envió ${gift.name} ${gift.emoji}`,
      timestamp: new Date().toLocaleTimeString(),
      isGift: true,
      giftType: gift.name
    };
    setMessages([...messages, giftMessage]);
    setShowGifts(false);
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
      setTimeout(() => setHasLiked(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Main Content */}
      <div className="h-full flex flex-col lg:flex-row">
        
        {/* Video Container */}
        <div className="relative flex-1 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          {/* Video/Stream Thumbnail */}
          <img
            src={MOCK_LIVE_STREAM.thumbnail}
            alt={MOCK_LIVE_STREAM.title}
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlays */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent lg:hidden" />

          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => onNavigate?.('feed')}
                className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {/* Live Badge */}
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500 rounded-full shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-sm font-bold">EN VIVO</span>
                </div>

                {/* Viewers Count */}
                <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full">
                  <Eye className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-bold">{viewers.toLocaleString()}</span>
                </div>

                {/* Duration */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full">
                  <Clock className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-bold">{MOCK_LIVE_STREAM.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-all"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button className="hidden lg:flex w-10 h-10 items-center justify-center bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-all">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Streamer Info (Mobile) */}
          <div className="absolute bottom-4 left-0 right-0 z-20 px-4 lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={MOCK_LIVE_STREAM.streamer.avatar}
                    alt={MOCK_LIVE_STREAM.streamer.name}
                    className="w-12 h-12 rounded-full ring-2 ring-white"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {MOCK_LIVE_STREAM.streamer.level}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold">{MOCK_LIVE_STREAM.streamer.name}</span>
                    {MOCK_LIVE_STREAM.streamer.verified && (
                      <Award className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <span className="text-white/70 text-sm">{MOCK_LIVE_STREAM.streamer.followers.toLocaleString()} seguidores</span>
                </div>
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
          </div>

          {/* Floating Gifts Animation */}
          {showFloatingGift && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
              <div className="text-9xl animate-ping opacity-75">
                {showFloatingGift}
              </div>
            </div>
          )}

          {/* Quick Actions (Desktop Only) */}
          <div className="hidden lg:flex absolute right-6 bottom-6 z-20 flex-col gap-4">
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={`w-14 h-14 flex items-center justify-center rounded-full transition-all transform group-hover:scale-110 ${
                hasLiked
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 scale-110'
                  : 'bg-white/20 backdrop-blur-sm'
              }`}>
                <Heart className={`w-7 h-7 text-white ${hasLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-white text-xs font-bold">{likes.toLocaleString()}</span>
            </button>

            <button
              onClick={() => setShowShare(true)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full transition-all transform group-hover:scale-110">
                <Share2 className="w-7 h-7 text-white" />
              </div>
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="lg:w-96 bg-white dark:bg-gray-900 flex flex-col max-h-[40vh] lg:max-h-full">
          {/* Chat Header (Desktop) */}
          <div className="hidden lg:block border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <img
                  src={MOCK_LIVE_STREAM.streamer.avatar}
                  alt={MOCK_LIVE_STREAM.streamer.name}
                  className="w-12 h-12 rounded-full ring-2 ring-[#98ca3f]"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {MOCK_LIVE_STREAM.streamer.level}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-900 dark:text-white">{MOCK_LIVE_STREAM.streamer.name}</span>
                  {MOCK_LIVE_STREAM.streamer.verified && (
                    <Award className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{MOCK_LIVE_STREAM.streamer.followers.toLocaleString()} seguidores</span>
              </div>
              {!isFollowing && (
                <button
                  onClick={() => setIsFollowing(true)}
                  className="px-4 py-2 bg-[#98ca3f] text-white rounded-lg font-bold hover:bg-[#7ab02f] transition-all text-sm"
                >
                  Seguir
                </button>
              )}
            </div>

            <h2 className="font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              {MOCK_LIVE_STREAM.title}
            </h2>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-bold">
                {MOCK_LIVE_STREAM.category}
              </span>
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold">#Trending</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {MOCK_LIVE_STREAM.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${
                  msg.isGift ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-xl -mx-2' : ''
                }`}
              >
                <img
                  src={msg.user.avatar}
                  alt={msg.user.name}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {msg.user.name}
                    </span>
                    {msg.user.level && (
                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded font-bold">
                        {msg.user.level}
                      </span>
                    )}
                    {msg.user.badge && (
                      <span className={`px-2 py-0.5 text-xs rounded font-bold ${
                        msg.user.badge === 'VIP'
                          ? 'bg-yellow-400 text-yellow-900'
                          : msg.user.badge === 'SUB'
                          ? 'bg-purple-500 text-white'
                          : msg.user.badge === 'GIFT'
                          ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}>
                        {msg.user.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-0.5 ${
                    msg.isGift
                      ? 'font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Envía un mensaje..."
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#98ca3f]"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="w-12 h-12 flex items-center justify-center bg-[#98ca3f] text-white rounded-full hover:bg-[#7ab02f] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGifts(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
              >
                <Gift className="w-4 h-4" />
                Enviar regalo
              </button>
              <button
                onClick={handleLike}
                className={`px-4 py-2 rounded-lg font-bold transition-all transform hover:scale-105 ${
                  hasLiked
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gifts Modal */}
      {showGifts && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl overflow-hidden animate-in slide-in-from-bottom lg:slide-in-from-bottom-0">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Gift className="w-6 h-6 text-purple-500" />
                Enviar Regalo
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Apoya al streamer con un regalo
              </p>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              {GIFTS.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => handleSendGift(gift)}
                  className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all transform hover:scale-105 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-700"
                >
                  <span className="text-4xl">{gift.emoji}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{gift.name}</span>
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    {gift.coins} coins
                  </span>
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowGifts(false)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 animate-in slide-in-from-bottom">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Compartir Stream</h3>
            <div className="space-y-2">
              {['WhatsApp', 'Twitter', 'Facebook', 'Copiar enlace'].map((option) => (
                <button
                  key={option}
                  className="w-full px-4 py-3 text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all font-medium"
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowShare(false)}
              className="w-full mt-4 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
