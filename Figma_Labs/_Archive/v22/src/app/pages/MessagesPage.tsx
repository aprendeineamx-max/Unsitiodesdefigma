import { useState, useRef, useEffect } from 'react';
import {
  Search,
  MoreVertical,
  Phone,
  Video,
  Send,
  Paperclip,
  Smile,
  Image as ImageIcon,
  File,
  MapPin,
  Mic,
  X,
  Check,
  CheckCheck,
  Edit2,
  Reply,
  Trash2,
  Copy,
  Star,
  Archive,
  VolumeX,
  Lock,
  Clock,
  Link as LinkIcon,
  Download,
  Play,
  Pause,
  Users,
  UserPlus,
  Settings,
  Info,
  AtSign,
  Hash,
  ChevronDown,
  FileText,
  Shield,
  MessageCircle
} from 'lucide-react';
import { allConversations, extendedMessages, Message, Conversation } from '../data/extendedMessaging';

export function MessagesPage() {
  const [conversations] = useState<Conversation[]>(allConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [messages, setMessages] = useState<Message[]>(extendedMessages);

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [showSlashCommands, setShowSlashCommands] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() && !isRecording) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: '1',
      senderName: 'You',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      content: messageInput,
      timestamp: new Date(),
      status: 'sent',
      ...(replyingTo && {
        replyTo: {
          id: replyingTo.id,
          senderName: replyingTo.senderName,
          content: replyingTo.content
        }
      }),
      ...(editingMessage && { edited: true })
    };

    if (editingMessage) {
      setMessages(messages.map(msg => msg.id === editingMessage.id ? { ...msg, content: messageInput, edited: true } : msg));
      setEditingMessage(null);
    } else {
      setMessages([...messages, newMessage]);
    }

    setMessageInput('');
    setReplyingTo(null);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    const audioMessage: Message = {
      id: Date.now().toString(),
      senderId: '1',
      senderName: 'You',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
      content: 'Voice message',
      timestamp: new Date(),
      status: 'sent',
      attachment: {
        type: 'audio',
        url: '#',
        duration: recordingDuration
      }
    };

    setMessages([...messages, audioMessage]);
    setRecordingDuration(0);
  };

  const handleFileUpload = (type: 'image' | 'video' | 'file') => {
    fileInputRef.current?.click();
    setShowAttachmentMenu(false);
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨', '🚀', '💪', '👏', '🙌'];

  const slashCommands = [
    { command: '/giphy', description: 'Buscar GIF', icon: ImageIcon },
    { command: '/poll', description: 'Crear encuesta', icon: Hash },
    { command: '/remind', description: 'Crear recordatorio', icon: Clock },
    { command: '/code', description: 'Compartir código', icon: FileText }
  ];

  const handleInputChange = (value: string) => {
    setMessageInput(value);
    if (value.startsWith('/')) {
      setShowSlashCommands(true);
    } else {
      setShowSlashCommands(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-[#0f172a]">
      {/* Sidebar - Conversations List */}
      <div className="w-full md:w-96 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e293b] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mensajes</h1>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <UserPlus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conversaciones..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[#98ca3f] outline-none"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations
            .filter(conv => conv.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l-4 ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-gray-50 dark:bg-gray-800 border-[#98ca3f]'
                    : 'border-transparent'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="w-12 h-12 rounded-full"
                  />
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                  )}
                  {conversation.type === 'group' && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {conversation.name}
                      </h3>
                      {conversation.encrypted && (
                        <Lock className="w-3 h-3 text-gray-400" />
                      )}
                      {conversation.pinned && (
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      )}
                      {conversation.muted && (
                        <VolumeX className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(conversation.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conversation.typing ? (
                        <span className="text-[#98ca3f] flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-[#98ca3f] rounded-full animate-bounce" />
                          <span className="inline-block w-2 h-2 bg-[#98ca3f] rounded-full animate-bounce delay-100" />
                          <span className="inline-block w-2 h-2 bg-[#98ca3f] rounded-full animate-bounce delay-200" />
                          Escribiendo...
                        </span>
                      ) : (
                        conversation.lastMessage
                      )}
                    </p>
                    {conversation.unread > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-[#98ca3f] text-white text-xs font-semibold rounded-full">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-[#0f172a]">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e293b]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedConversation.avatar}
                    alt={selectedConversation.name}
                    className="w-10 h-10 rounded-full"
                  />
                  {selectedConversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {selectedConversation.name}
                    {selectedConversation.encrypted && (
                      <Shield className="w-4 h-4 text-green-500" title="Cifrado de extremo a extremo" />
                    )}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedConversation.type === 'group' 
                      ? `${selectedConversation.participants?.length} participantes`
                      : selectedConversation.online 
                        ? 'En línea' 
                        : 'Última vez hace 1h'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button 
                  onClick={() => setShowUserInfo(!showUserInfo)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0f172a]">
            {/* Encryption Notice */}
            <div className="flex items-center justify-center">
              <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-full flex items-center gap-2">
                <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-xs text-yellow-700 dark:text-yellow-300">
                  Mensajes cifrados de extremo a extremo
                </span>
              </div>
            </div>

            {messages.map((message) => {
              const isOwn = message.senderId === '1';
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwn && (
                    <img
                      src={message.senderAvatar}
                      alt={message.senderName}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  )}

                  <div className={`max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {!isOwn && selectedConversation.type === 'group' && (
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2">
                        {message.senderName}
                      </span>
                    )}

                    {/* Reply Preview */}
                    {message.replyTo && (
                      <div className={`px-3 py-2 rounded-lg border-l-4 border-[#98ca3f] bg-gray-100 dark:bg-gray-800 ${
                        isOwn ? 'rounded-br-none' : 'rounded-bl-none'
                      }`}>
                        <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                          {message.replyTo.senderName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {message.replyTo.content}
                        </p>
                      </div>
                    )}

                    <div
                      onClick={() => setSelectedMessage(selectedMessage === message.id ? null : message.id)}
                      className={`relative px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-[#98ca3f] text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-700'
                      } ${selectedMessage === message.id ? 'ring-2 ring-[#98ca3f]' : ''}`}
                    >
                      {/* Attachment Rendering */}
                      {message.attachment && (
                        <div className="mb-2">
                          {/* Image */}
                          {message.attachment.type === 'image' && (
                            <img
                              src={message.attachment.url}
                              alt="Attachment"
                              className="rounded-lg max-w-xs"
                            />
                          )}

                          {/* File */}
                          {message.attachment.type === 'file' && (
                            <div className="flex items-center gap-3 p-3 bg-white/10 dark:bg-black/10 rounded-lg">
                              <div className="w-10 h-10 bg-white/20 dark:bg-black/20 rounded-lg flex items-center justify-center">
                                <File className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{message.attachment.name}</p>
                                <p className="text-xs opacity-70">
                                  {message.attachment.size && formatFileSize(message.attachment.size)}
                                </p>
                              </div>
                              <button className="p-2 hover:bg-white/10 dark:hover:bg-black/10 rounded-lg">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {/* Audio */}
                          {message.attachment.type === 'audio' && (
                            <div className="flex items-center gap-3 p-2 bg-white/10 dark:bg-black/10 rounded-lg min-w-[200px]">
                              <button
                                onClick={() => setPlayingAudio(playingAudio === message.id ? null : message.id)}
                                className="w-8 h-8 bg-white/20 dark:bg-black/20 rounded-full flex items-center justify-center hover:bg-white/30 dark:hover:bg-black/30 transition-colors"
                              >
                                {playingAudio === message.id ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </button>
                              <div className="flex-1">
                                <div className="h-1 bg-white/20 dark:bg-black/20 rounded-full overflow-hidden">
                                  <div className="h-full bg-white dark:bg-[#98ca3f] rounded-full w-1/3" />
                                </div>
                              </div>
                              <span className="text-xs opacity-70">
                                {message.attachment.duration && formatDuration(message.attachment.duration)}
                              </span>
                            </div>
                          )}

                          {/* Location */}
                          {message.attachment.type === 'location' && (
                            <div className="flex items-center gap-3 p-3 bg-white/10 dark:bg-black/10 rounded-lg">
                              <MapPin className="w-5 h-5" />
                              <div>
                                <p className="text-sm font-medium">{message.attachment.name}</p>
                                <p className="text-xs opacity-70">Ver ubicación</p>
                              </div>
                            </div>
                          )}

                          {/* Link Preview */}
                          {message.attachment.type === 'link' && message.attachment.metadata && (
                            <div className="bg-white/10 dark:bg-black/10 rounded-lg overflow-hidden mb-2">
                              {message.attachment.metadata.image && (
                                <img
                                  src={message.attachment.metadata.image}
                                  alt="Link preview"
                                  className="w-full h-32 object-cover"
                                />
                              )}
                              <div className="p-3">
                                <p className="text-sm font-medium mb-1">{message.attachment.metadata.title}</p>
                                <p className="text-xs opacity-70 line-clamp-2">{message.attachment.metadata.description}</p>
                                <a href={message.attachment.url} className="text-xs opacity-70 flex items-center gap-1 mt-2 hover:underline">
                                  <LinkIcon className="w-3 h-3" />
                                  {message.attachment.url}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message Content */}
                      <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>

                      {/* Message Footer */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                          {formatTime(message.timestamp)}
                        </span>
                        {message.edited && (
                          <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                            (editado)
                          </span>
                        )}
                        {isOwn && (
                          <div className="ml-1">
                            {message.status === 'sent' && <Check className="w-4 h-4" />}
                            {message.status === 'delivered' && <CheckCheck className="w-4 h-4" />}
                            {message.status === 'read' && <CheckCheck className="w-4 h-4 text-blue-400" />}
                          </div>
                        )}
                      </div>

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="absolute -bottom-2 right-4 flex gap-1">
                          {message.reactions.map((reaction, idx) => (
                            <div
                              key={idx}
                              className="px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full flex items-center gap-1 shadow-sm"
                            >
                              <span className="text-xs">{reaction.emoji}</span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">{reaction.users.length}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message Actions Menu */}
                      {selectedMessage === message.id && (
                        <div className={`absolute top-full mt-2 ${isOwn ? 'right-0' : 'left-0'} bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10 min-w-[180px]`}>
                          <button
                            onClick={() => {
                              setReplyingTo(message);
                              setSelectedMessage(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-900 dark:text-white"
                          >
                            <Reply className="w-4 h-4" />
                            Responder
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-900 dark:text-white">
                            <Copy className="w-4 h-4" />
                            Copiar
                          </button>
                          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-900 dark:text-white">
                            <Star className="w-4 h-4" />
                            Destacar
                          </button>
                          {isOwn && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingMessage(message);
                                  setMessageInput(message.content);
                                  setSelectedMessage(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-900 dark:text-white"
                              >
                                <Edit2 className="w-4 h-4" />
                                Editar
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-red-600">
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Temporary Message Indicator */}
                    {message.isTemporary && (
                      <div className="flex items-center gap-1 px-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Mensaje temporal
                        </span>
                      </div>
                    )}
                  </div>

                  {isOwn && (
                    <img
                      src={message.senderAvatar}
                      alt={message.senderName}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e293b]">
            {/* Reply Preview */}
            {replyingTo && (
              <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Respondiendo a {replyingTo.senderName}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    {replyingTo.content}
                  </p>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            )}

            {/* Editing Preview */}
            {editingMessage && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                    Editando mensaje
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    {editingMessage.content}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingMessage(null);
                    setMessageInput('');
                  }}
                  className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
                >
                  <X className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </button>
              </div>
            )}

            {/* Slash Commands Dropdown */}
            {showSlashCommands && (
              <div className="mb-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                {slashCommands
                  .filter(cmd => cmd.command.toLowerCase().includes(messageInput.toLowerCase()))
                  .map((cmd) => {
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.command}
                        onClick={() => {
                          setMessageInput(cmd.command + ' ');
                          setShowSlashCommands(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                      >
                        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{cmd.command}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{cmd.description}</p>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
              <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Grabando... {formatDuration(recordingDuration)}
                  </span>
                </div>
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Enviar
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* Attachment Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                {showAttachmentMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2 min-w-[200px]">
                    <button
                      onClick={() => handleFileUpload('image')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3 text-gray-900 dark:text-white"
                    >
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                      Imagen
                    </button>
                    <button
                      onClick={() => handleFileUpload('video')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3 text-gray-900 dark:text-white"
                    >
                      <Video className="w-4 h-4 text-purple-500" />
                      Video
                    </button>
                    <button
                      onClick={() => handleFileUpload('file')}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3 text-gray-900 dark:text-white"
                    >
                      <File className="w-4 h-4 text-gray-500" />
                      Archivo
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3 text-gray-900 dark:text-white">
                      <MapPin className="w-4 h-4 text-red-500" />
                      Ubicación
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                />
              </div>

              {/* Message Input */}
              <div className="flex-1 relative">
                <textarea
                  value={messageInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Escribe un mensaje... (usa / para comandos)"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[#98ca3f] outline-none resize-none max-h-32"
                  rows={1}
                />
              </div>

              {/* Emoji Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 grid grid-cols-6 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setMessageInput(messageInput + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Send/Record Button */}
              {messageInput.trim() ? (
                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-[#98ca3f] hover:bg-[#87b935] text-white rounded-xl transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-3 rounded-xl transition-colors ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#0f172a]">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Selecciona una conversación
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Elige un chat de la lista para comenzar a conversar
            </p>
          </div>
        </div>
      )}

      {/* User Info Sidebar */}
      {showUserInfo && selectedConversation && (
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e293b] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información</h3>
              <button
                onClick={() => setShowUserInfo(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Profile */}
            <div className="text-center mb-6">
              <img
                src={selectedConversation.avatar}
                alt={selectedConversation.name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {selectedConversation.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedConversation.type === 'group' ? 'Grupo' : 'En línea'}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <button className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3">
                <VolumeX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">Silenciar</span>
              </button>
              <button className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3">
                <Star className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">Mensajes destacados</span>
              </button>
              <button className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">Mensajes temporales</span>
              </button>
              <button className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white">Cifrado E2E</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Activado</p>
                </div>
              </button>
              <button className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3">
                <Archive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">Archivar chat</span>
              </button>
              <button className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center gap-3 text-red-600">
                <Trash2 className="w-5 h-5" />
                <span>Eliminar chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}