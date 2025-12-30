import { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Video,
  Smile,
  MapPin,
  Users,
  Calendar,
  BarChart,
  Music,
  FileText,
  X,
  Plus,
  Globe,
  Lock,
  Send,
  Sparkles,
  Tag,
  AtSign,
  Link as LinkIcon,
  Mic,
  Film
} from 'lucide-react';

interface PostCreatorProps {
  onPublish?: (post: PostData) => void;
  onSaveDraft?: (post: PostData) => void;
  currentUser?: {
    id: string;
    name: string;
    avatar: string;
  };
  defaultVisibility?: 'public' | 'friends' | 'private';
  enabledFeatures?: {
    media?: boolean;
    polls?: boolean;
    location?: boolean;
    feelings?: boolean;
    schedule?: boolean;
    tags?: boolean;
    mentions?: boolean;
  };
}

interface PostData {
  text: string;
  media: Array<{ type: 'image' | 'video'; url: string; file?: File }>;
  visibility: 'public' | 'friends' | 'private';
  location?: { name: string; coordinates?: { lat: number; lng: number } };
  feeling?: { emoji: string; text: string };
  tags?: string[];
  mentions?: string[];
  poll?: {
    question: string;
    options: string[];
    duration: number; // hours
    multipleChoice: boolean;
  };
  scheduledFor?: string;
}

export function PostCreator({
  onPublish,
  onSaveDraft,
  currentUser,
  defaultVisibility = 'public',
  enabledFeatures = {
    media: true,
    polls: true,
    location: true,
    feelings: true,
    schedule: true,
    tags: true,
    mentions: true
  }
}: PostCreatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [postData, setPostData] = useState<PostData>({
    text: '',
    media: [],
    visibility: defaultVisibility,
    tags: [],
    mentions: []
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const feelings = [
    { emoji: '😊', text: 'feliz' },
    { emoji: '😍', text: 'enamorado/a' },
    { emoji: '🎉', text: 'celebrando' },
    { emoji: '😎', text: 'genial' },
    { emoji: '🤔', text: 'pensativo/a' },
    { emoji: '😴', text: 'cansado/a' },
    { emoji: '🔥', text: 'motivado/a' },
    { emoji: '💪', text: 'fuerte' },
    { emoji: '🚀', text: 'productivo/a' },
    { emoji: '🎯', text: 'enfocado/a' }
  ];

  const handleMediaUpload = (files: FileList | null, type: 'image' | 'video') => {
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      
      reader.onloadstart = () => {
        setUploadProgress(prev => ({ ...prev, [Date.now() + index]: 0 }));
      };

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(prev => ({ ...prev, [Date.now() + index]: progress }));
        }
      };

      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPostData(prev => ({
          ...prev,
          media: [...prev.media, { type, url, file }]
        }));
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[Date.now() + index];
          return newProgress;
        });
      };

      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setPostData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handlePublish = () => {
    if (!postData.text.trim() && postData.media.length === 0) {
      alert('Escribe algo o añade contenido multimedia');
      return;
    }

    onPublish?.(postData);
    resetForm();
  };

  const handleSaveDraft = () => {
    onSaveDraft?.(postData);
    resetForm();
  };

  const resetForm = () => {
    setPostData({
      text: '',
      media: [],
      visibility: defaultVisibility,
      tags: [],
      mentions: []
    });
    setIsExpanded(false);
    setShowPollCreator(false);
    setShowScheduler(false);
  };

  const visibilityOptions = [
    { value: 'public', label: 'Público', icon: Globe, description: 'Cualquiera puede ver' },
    { value: 'friends', label: 'Amigos', icon: Users, description: 'Solo tus amigos' },
    { value: 'private', label: 'Privado', icon: Lock, description: 'Solo tú' }
  ];

  const characterCount = postData.text.length;
  const maxCharacters = 5000;
  const characterPercentage = (characterCount / maxCharacters) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt={currentUser?.name || 'Usuario'}
            className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-gray-800"
          />
          <button
            onClick={() => setIsExpanded(true)}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full text-left text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            ¿Qué estás pensando, {currentUser?.name || 'amigo'}?
          </button>
        </div>
      </div>

      {/* Expanded Creator */}
      {isExpanded && (
        <div className="p-4">
          {/* Visibility Selector */}
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {visibilityOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setPostData({ ...postData, visibility: option.value as any })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      postData.visibility === option.value
                        ? 'border-[#98CA3F] bg-[#98CA3F]/10 text-[#98CA3F]'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#98CA3F]/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feeling/Activity */}
          {postData.feeling && (
            <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <span className="text-lg">{postData.feeling.emoji}</span>
              <span className="text-sm text-blue-900 dark:text-blue-300">
                está {postData.feeling.text}
              </span>
              <button
                onClick={() => setPostData({ ...postData, feeling: undefined })}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Location */}
          {postData.location && (
            <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full ml-2">
              <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-900 dark:text-green-300">
                en {postData.location.name}
              </span>
              <button
                onClick={() => setPostData({ ...postData, location: undefined })}
                className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Text Input */}
          <textarea
            value={postData.text}
            onChange={(e) => setPostData({ ...postData, text: e.target.value })}
            placeholder={`¿Qué estás pensando, ${currentUser?.name || 'amigo'}?`}
            className="w-full px-4 py-3 border-0 bg-transparent text-gray-900 dark:text-white resize-none focus:ring-0 text-lg"
            rows={4}
            maxLength={maxCharacters}
            autoFocus
          />

          {/* Character Counter */}
          {characterCount > 0 && (
            <div className="flex items-center justify-end gap-3 mb-3">
              <div className="relative w-8 h-8">
                <svg className="transform -rotate-90 w-8 h-8">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 14}`}
                    strokeDashoffset={`${2 * Math.PI * 14 * (1 - characterPercentage / 100)}`}
                    className={
                      characterPercentage > 90
                        ? 'text-red-500'
                        : characterPercentage > 75
                        ? 'text-yellow-500'
                        : 'text-[#98CA3F]'
                    }
                  />
                </svg>
                {characterPercentage > 75 && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {maxCharacters - characterCount}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Media Preview */}
          {postData.media.length > 0 && (
            <div className={`mb-4 grid gap-2 ${
              postData.media.length === 1 ? 'grid-cols-1' :
              postData.media.length === 2 ? 'grid-cols-2' :
              'grid-cols-3'
            }`}>
              {postData.media.map((item, index) => (
                <div key={index} className="relative group">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-48 object-cover rounded-xl"
                      controls
                    />
                  )}
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mb-4 space-y-2">
              {Object.entries(uploadProgress).map(([key, progress]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subiendo...</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#98CA3F] rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Poll Creator */}
          {showPollCreator && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-[#98CA3F]" />
                  Crear Encuesta
                </h4>
                <button
                  onClick={() => setShowPollCreator(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Pregunta de la encuesta"
                className="w-full px-4 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  placeholder="Opción 1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Opción 2"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button className="flex items-center gap-2 text-sm text-[#98CA3F] hover:text-[#7fb32f] font-medium">
                  <Plus className="w-4 h-4" />
                  Añadir opción
                </button>
              </div>
              <div className="flex items-center gap-4">
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
                  <option value="24">24 horas</option>
                  <option value="48">2 días</option>
                  <option value="168">1 semana</option>
                  <option value="336">2 semanas</option>
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#98CA3F]" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Opción múltiple</span>
                </label>
              </div>
            </div>
          )}

          {/* Feelings Picker */}
          {showEmojiPicker && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  ¿Cómo te sientes?
                </h4>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {feelings.map((feeling) => (
                  <button
                    key={feeling.text}
                    onClick={() => {
                      setPostData({ ...postData, feeling });
                      setShowEmojiPicker(false);
                    }}
                    className="flex flex-col items-center gap-1 p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">{feeling.emoji}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      {feeling.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 flex-wrap">
            {enabledFeatures.media && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleMediaUpload(e.target.files, 'image')}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                  title="Foto/Imagen"
                >
                  <ImageIcon className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
                </button>

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleMediaUpload(e.target.files, 'video')}
                  className="hidden"
                />
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                  title="Video"
                >
                  <Video className="w-5 h-5 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
                </button>
              </>
            )}

            {enabledFeatures.feelings && (
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                title="Sentimiento/Actividad"
              >
                <Smile className="w-5 h-5 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {enabledFeatures.polls && (
              <button
                onClick={() => setShowPollCreator(!showPollCreator)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                title="Encuesta"
              >
                <BarChart className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {enabledFeatures.location && (
              <button
                onClick={() => setPostData({
                  ...postData,
                  location: { name: 'Tu ubicación' }
                })}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                title="Ubicación"
              >
                <MapPin className="w-5 h-5 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {enabledFeatures.tags && (
              <button
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                title="Etiquetas"
              >
                <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {enabledFeatures.mentions && (
              <button
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                title="Etiquetar personas"
              >
                <AtSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {enabledFeatures.schedule && (
              <button
                onClick={() => setShowScheduler(!showScheduler)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                title="Programar"
              >
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>

          {isExpanded && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
              >
                Guardar borrador
              </button>
              <button
                onClick={handlePublish}
                disabled={!postData.text.trim() && postData.media.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <Send className="w-4 h-4" />
                Publicar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
