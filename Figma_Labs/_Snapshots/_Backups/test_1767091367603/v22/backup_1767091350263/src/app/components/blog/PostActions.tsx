import { useState, useEffect } from 'react';
import {
  Heart,
  Bookmark,
  Share2,
  MessageCircle,
  ThumbsUp,
  MoreVertical,
  Flag,
  Link2,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  Copy,
  Check
} from 'lucide-react';

interface PostActionsProps {
  postId: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  onLike?: () => void;
  onBookmark?: () => void;
  onComment?: () => void;
  onShare?: (platform: string) => void;
  onReport?: () => void;
  variant?: 'floating' | 'inline' | 'sticky';
  position?: 'left' | 'right';
}

export function PostActions({
  postId,
  isLiked = false,
  isBookmarked = false,
  likesCount,
  commentsCount,
  sharesCount,
  onLike,
  onBookmark,
  onComment,
  onShare,
  onReport,
  variant = 'floating',
  position = 'left'
}: PostActionsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(likesCount);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);

  useEffect(() => {
    setLocalLikesCount(likesCount);
    setLocalIsLiked(isLiked);
  }, [likesCount, isLiked]);

  const handleLike = () => {
    // Optimistic update
    setLocalIsLiked(!localIsLiked);
    setLocalLikesCount(prev => localIsLiked ? prev - 1 : prev + 1);
    onLike?.();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareOptions = [
    { id: 'twitter', icon: Twitter, label: 'Twitter', color: 'hover:bg-blue-500' },
    { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-blue-700' },
    { id: 'facebook', icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-600' },
    { id: 'email', icon: Mail, label: 'Email', color: 'hover:bg-gray-600' },
    { id: 'copy', icon: copied ? Check : Copy, label: copied ? '¡Copiado!' : 'Copiar link', color: 'hover:bg-gray-600' }
  ];

  const actionButton = (
    icon: React.ReactNode,
    label: string,
    count?: number,
    isActive?: boolean,
    onClick?: () => void,
    className?: string
  ) => (
    <button
      onClick={onClick}
      className={`group flex items-center gap-2 transition-all ${className || ''}`}
      title={label}
    >
      <div
        className={`p-3 rounded-full transition-all ${
          isActive
            ? 'bg-[#98CA3F] text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-[#98CA3F] hover:text-white'
        }`}
      >
        {icon}
      </div>
      {count !== undefined && (
        <span className={`text-sm font-semibold ${isActive ? 'text-[#98CA3F]' : 'text-gray-600 dark:text-gray-400'}`}>
          {count}
        </span>
      )}
    </button>
  );

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-700">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            localIsLiked
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400'
          }`}
        >
          <Heart className={`w-5 h-5 ${localIsLiked ? 'fill-current' : ''}`} />
          <span>{localLikesCount}</span>
        </button>

        {/* Comment */}
        <button
          onClick={onComment}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{commentsCount}</span>
        </button>

        {/* Bookmark */}
        <button
          onClick={onBookmark}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isBookmarked
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:text-yellow-600 dark:hover:text-yellow-400'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>

        {/* Share */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-all"
          >
            <Share2 className="w-5 h-5" />
            <span>{sharesCount}</span>
          </button>

          {showShareMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowShareMenu(false)}
              />
              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 min-w-[200px]">
                {shareOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (option.id === 'copy') {
                          handleCopyLink();
                        } else {
                          onShare?.(option.id);
                        }
                        setShowShareMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 ${option.color} hover:text-white transition-colors text-left`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* More */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMoreMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMoreMenu(false)}
              />
              <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 min-w-[180px]">
                <button
                  onClick={() => {
                    handleCopyLink();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <Link2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Copiar enlace
                  </span>
                </button>
                <button
                  onClick={() => {
                    onReport?.();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                >
                  <Flag className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Reportar
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'sticky') {
    return (
      <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {actionButton(
              <Heart className={`w-5 h-5 ${localIsLiked ? 'fill-current' : ''}`} />,
              'Me gusta',
              localLikesCount,
              localIsLiked,
              handleLike
            )}
            {actionButton(
              <MessageCircle className="w-5 h-5" />,
              'Comentarios',
              commentsCount,
              false,
              onComment
            )}
          </div>
          <div className="flex items-center gap-4">
            {actionButton(
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />,
              'Guardar',
              undefined,
              isBookmarked,
              onBookmark
            )}
            {actionButton(
              <Share2 className="w-5 h-5" />,
              'Compartir',
              undefined,
              false,
              () => setShowShareMenu(!showShareMenu)
            )}
          </div>
        </div>
      </div>
    );
  }

  // Floating variant (default)
  return (
    <div
      className={`fixed top-1/2 -translate-y-1/2 z-30 ${
        position === 'left' ? 'left-6' : 'right-6'
      } hidden lg:block`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-3 space-y-3">
        {/* Like */}
        {actionButton(
          <Heart className={`w-5 h-5 ${localIsLiked ? 'fill-current' : ''}`} />,
          'Me gusta',
          localLikesCount,
          localIsLiked,
          handleLike,
          'flex-col'
        )}

        {/* Comment */}
        {actionButton(
          <MessageCircle className="w-5 h-5" />,
          'Comentarios',
          commentsCount,
          false,
          onComment,
          'flex-col'
        )}

        {/* Bookmark */}
        {actionButton(
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />,
          'Guardar',
          undefined,
          isBookmarked,
          onBookmark,
          'flex-col'
        )}

        {/* Share */}
        <div className="relative">
          {actionButton(
            <Share2 className="w-5 h-5" />,
            'Compartir',
            sharesCount,
            false,
            () => setShowShareMenu(!showShareMenu),
            'flex-col'
          )}

          {showShareMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowShareMenu(false)}
              />
              <div className={`absolute top-0 ${position === 'left' ? 'left-full ml-2' : 'right-full mr-2'} bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 min-w-[200px]`}>
                {shareOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (option.id === 'copy') {
                          handleCopyLink();
                        } else {
                          onShare?.(option.id);
                        }
                        setShowShareMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 ${option.color} hover:text-white transition-colors text-left text-gray-700 dark:text-gray-300`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* More */}
        <div className="relative">
          {actionButton(
            <MoreVertical className="w-5 h-5" />,
            'Más opciones',
            undefined,
            false,
            () => setShowMoreMenu(!showMoreMenu),
            'flex-col'
          )}

          {showMoreMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMoreMenu(false)}
              />
              <div className={`absolute top-0 ${position === 'left' ? 'left-full ml-2' : 'right-full mr-2'} bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 min-w-[180px]`}>
                <button
                  onClick={() => {
                    handleCopyLink();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <Link2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Copiar enlace
                  </span>
                </button>
                <button
                  onClick={() => {
                    onReport?.();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                >
                  <Flag className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Reportar
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
