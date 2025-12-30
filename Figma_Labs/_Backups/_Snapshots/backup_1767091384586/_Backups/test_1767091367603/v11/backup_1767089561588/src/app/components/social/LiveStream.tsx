import { useState, useRef, useEffect } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Square,
  Send,
  Heart,
  Gift,
  Users,
  Eye,
  Settings,
  Share2,
  X,
  Sparkles,
  TrendingUp,
  DollarSign,
  MessageCircle,
  MoreVertical,
  Pin,
  Ban,
  Shield
} from 'lucide-react';

interface LiveStreamProps {
  streamId?: string;
  isHost?: boolean;
  streamData?: {
    id: string;
    title: string;
    description?: string;
    category?: string;
    host: {
      id: string;
      name: string;
      avatar: string;
      verified?: boolean;
      followers: number;
    };
    viewers: number;
    likes: number;
    duration: number; // seconds
    startedAt: string;
  };
  onStart?: (config: StreamConfig) => void;
  onEnd?: () => void;
  onSendMessage?: (message: string) => void;
  onSendGift?: (giftId: string) => void;
  onLike?: () => void;
  onShare?: () => void;
  messages?: LiveMessage[];
}

interface StreamConfig {
  title: string;
  description: string;
  category: string;
  quality: 'auto' | '720p' | '1080p';
  enableChat: boolean;
  enableGifts: boolean;
  ageRestriction: boolean;
}

interface LiveMessage {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    badge?: string;
  };
  message: string;
  timestamp: string;
  type: 'message' | 'gift' | 'join' | 'follow' | 'like';
  gift?: {
    id: string;
    name: string;
    icon: string;
    value: number;
  };
}

export function LiveStream({
  streamId,
  isHost = false,
  streamData,
  onStart,
  onEnd,
  onSendMessage,
  onSendGift,
  onLike,
  onShare,
  messages = []
}: LiveStreamProps) {
  const [isStreaming, setIsStreaming] = useState(!!streamId);
  const [showSetup, setShowSetup] = useState(!isStreaming && isHost);
  const [streamConfig, setStreamConfig] = useState<StreamConfig>({
    title: '',
    description: '',
    category: 'general',
    quality: 'auto',
    enableChat: true,
    enableGifts: true,
    ageRestriction: false
  });

  const [messageInput, setMessageInput] = useState('');
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [likePulse, setLikePulse] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<number[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const gifts = [
    { id: '1', name: 'Corazón', icon: '❤️', value: 1 },
    { id: '2', name: 'Rosa', icon: '🌹', value: 5 },
    { id: '3', name: 'Estrella', icon: '⭐', value: 10 },
    { id: '4', name: 'Diamante', icon: '💎', value: 50 },
    { id: '5', name: 'Corona', icon: '👑', value: 100 },
    { id: '6', name: 'Cohete', icon: '🚀', value: 500 },
    { id: '7', name: 'Unicornio', icon: '🦄', value: 1000 }
  ];

  const categories = [
    'General', 'Tecnología', 'Gaming', 'Música', 'Arte', 'Educación',
    'Deportes', 'Cocina', 'Fitness', 'Charla', 'IRL'
  ];

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartStream = async () => {
    if (!streamConfig.title.trim()) {
      alert('Por favor ingresa un título para tu transmisión');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      onStart?.(streamConfig);
      setIsStreaming(true);
      setShowSetup(false);
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      alert('No se pudo acceder a la cámara/micrófono');
    }
  };

  const handleEndStream = () => {
    if (confirm('¿Estás seguro de que quieres terminar la transmisión?')) {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      onEnd?.();
      setIsStreaming(false);
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      onSendMessage?.(messageInput);
      setMessageInput('');
    }
  };

  const handleLike = () => {
    setLikePulse(true);
    setTimeout(() => setLikePulse(false), 300);
    
    // Add floating heart
    const newHeart = Date.now();
    setFloatingHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h !== newHeart));
    }, 2000);
    
    onLike?.();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Setup Screen (Host)
  if (showSetup && isHost) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl max-w-2xl w-full overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-2">
              Configurar Transmisión en Vivo
            </h2>
            <p className="text-gray-400">
              Prepara tu transmisión antes de ir en vivo
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Título de la transmisión
              </label>
              <input
                type="text"
                value={streamConfig.title}
                onChange={(e) => setStreamConfig({ ...streamConfig, title: e.target.value })}
                placeholder="¿De qué tratará tu stream?"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {streamConfig.title.length}/100 caracteres
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={streamConfig.description}
                onChange={(e) => setStreamConfig({ ...streamConfig, description: e.target.value })}
                placeholder="Dale más detalles a tu audiencia..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 resize-none focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Categoría
              </label>
              <select
                value={streamConfig.category}
                onChange={(e) => setStreamConfig({ ...streamConfig, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Calidad de video
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['auto', '720p', '1080p'].map((quality) => (
                  <button
                    key={quality}
                    onClick={() => setStreamConfig({ ...streamConfig, quality: quality as any })}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      streamConfig.quality === quality
                        ? 'bg-[#98CA3F] text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {quality === 'auto' ? 'Auto' : quality}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-[#98CA3F]" />
                  <div>
                    <div className="text-white font-medium">Habilitar chat</div>
                    <div className="text-sm text-gray-400">Permite que los espectadores comenten</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={streamConfig.enableChat}
                  onChange={(e) => setStreamConfig({ ...streamConfig, enableChat: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 text-[#98CA3F] focus:ring-[#98CA3F]"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-white font-medium">Habilitar regalos</div>
                    <div className="text-sm text-gray-400">Recibe regalos virtuales de tus fans</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={streamConfig.enableGifts}
                  onChange={(e) => setStreamConfig({ ...streamConfig, enableGifts: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 text-[#98CA3F] focus:ring-[#98CA3F]"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-white font-medium">Contenido para adultos</div>
                    <div className="text-sm text-gray-400">Marca si tu contenido es +18</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={streamConfig.ageRestriction}
                  onChange={(e) => setStreamConfig({ ...streamConfig, ageRestriction: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-600 text-[#98CA3F] focus:ring-[#98CA3F]"
                />
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 flex items-center justify-between">
            <button
              onClick={() => setShowSetup(false)}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleStartStream}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all font-semibold shadow-lg"
            >
              <Video className="w-5 h-5" />
              Ir en Vivo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Live Stream Screen
  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative w-full h-full flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            autoPlay
            muted={isHost}
            playsInline
            className="w-full h-full object-contain"
          />

          {/* Live Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white font-bold text-sm">EN VIVO</span>
            </div>
            {streamData && (
              <div className="px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full">
                <span className="text-white font-semibold text-sm">
                  {formatDuration(streamData.duration)}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full">
              <Eye className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">
                {streamData?.viewers.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-white font-semibold text-sm">
                {streamData?.likes.toLocaleString() || 0}
              </span>
            </div>
          </div>

          {/* Host Info */}
          {streamData && (
            <div className="absolute bottom-20 left-4 flex items-center gap-3 bg-black/70 backdrop-blur-sm px-4 py-3 rounded-2xl">
              <img
                src={streamData.host.avatar}
                alt={streamData.host.name}
                className="w-12 h-12 rounded-full ring-2 ring-white/30"
              />
              <div>
                <h3 className="text-white font-bold">{streamData.host.name}</h3>
                <p className="text-white/70 text-sm">
                  {streamData.host.followers.toLocaleString()} seguidores
                </p>
              </div>
            </div>
          )}

          {/* Controls (Host) */}
          {isHost && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-sm px-6 py-4 rounded-full">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full transition-all ${
                  isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3 rounded-full transition-all ${
                  isVideoOff ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isVideoOff ? (
                  <VideoOff className="w-6 h-6 text-white" />
                ) : (
                  <Video className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={handleEndStream}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5 text-white fill-white" />
                  <span className="text-white font-semibold">Finalizar</span>
                </div>
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <Settings className="w-6 h-6 text-white" />
              </button>
            </div>
          )}

          {/* Floating Hearts */}
          <div className="absolute bottom-4 right-4 pointer-events-none">
            {floatingHearts.map((heart) => (
              <div
                key={heart}
                className="absolute bottom-0 right-0 animate-float-up"
                style={{
                  animationDelay: `${Math.random() * 0.5}s`,
                  left: `${Math.random() * 40 - 20}px`
                }}
              >
                <Heart className="w-8 h-8 text-red-500 fill-current" />
              </div>
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-96 bg-gray-900 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#98CA3F]" />
                <h3 className="text-white font-bold">Chat en vivo</h3>
              </div>
              <button
                onClick={onShare}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {messages.map((msg) => (
              <div key={msg.id} className="animate-slide-in-right">
                {msg.type === 'message' ? (
                  <div className="flex items-start gap-2">
                    <img
                      src={msg.user.avatar}
                      alt={msg.user.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {msg.user.name}
                        </span>
                        {msg.user.badge && (
                          <span className="text-xs">{msg.user.badge}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 break-words">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ) : msg.type === 'gift' && msg.gift ? (
                  <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{msg.gift.icon}</span>
                      <div className="flex-1">
                        <p className="text-white font-semibold">
                          {msg.user.name} envió {msg.gift.name}
                        </p>
                        <p className="text-yellow-400 text-sm">
                          +{msg.gift.value} monedas
                        </p>
                      </div>
                    </div>
                  </div>
                ) : msg.type === 'join' ? (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      {msg.user.name} se unió a la transmisión
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={handleLike}
                className={`p-3 rounded-full transition-all ${
                  likePulse ? 'scale-125 bg-red-500' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${likePulse ? 'text-white fill-white' : 'text-gray-400'}`} />
              </button>
              {streamConfig.enableGifts && (
                <button
                  onClick={() => setShowGiftPanel(!showGiftPanel)}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <Gift className="w-5 h-5 text-purple-400" />
                </button>
              )}
            </div>

            {streamConfig.enableChat && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="px-4 py-2 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Gift Panel */}
          {showGiftPanel && (
            <div className="absolute bottom-24 right-4 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 p-4 w-80">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-bold">Enviar regalo</h4>
                <button
                  onClick={() => setShowGiftPanel(false)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {gifts.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => {
                      onSendGift?.(gift.id);
                      setShowGiftPanel(false);
                    }}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <span className="text-3xl">{gift.icon}</span>
                    <span className="text-xs text-white font-medium">{gift.name}</span>
                    <span className="text-xs text-yellow-400 font-bold">
                      {gift.value} 💰
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
