import { useState } from 'react';
import {
  MessageCircle,
  Send,
  MoreVertical,
  ThumbsUp,
  Heart,
  Smile,
  Flag,
  Edit,
  Trash2,
  Reply,
  ChevronDown,
  ChevronUp,
  Pin,
  Award,
  CheckCircle,
  Image as ImageIcon,
  AtSign
} from 'lucide-react';

interface CommentReaction {
  type: 'like' | 'heart' | 'thumbsup' | 'smile';
  count: number;
  userReacted: boolean;
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role?: string;
    verified?: boolean;
    isAuthor?: boolean;
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
  reactions: CommentReaction[];
  replies?: Comment[];
  isPinned?: boolean;
  isEdited?: boolean;
  mentions?: string[];
}

interface CommentSystemProps {
  postId: string;
  comments: Comment[];
  currentUserId?: string;
  onAddComment?: (content: string, parentId?: string) => void;
  onEditComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onReactToComment?: (commentId: string, reactionType: string) => void;
  onPinComment?: (commentId: string) => void;
  onReportComment?: (commentId: string) => void;
  sortBy?: 'newest' | 'oldest' | 'popular';
  allowImages?: boolean;
  maxDepth?: number;
}

export function CommentSystem({
  postId,
  comments,
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onReactToComment,
  onPinComment,
  onReportComment,
  sortBy = 'popular',
  allowImages = true,
  maxDepth = 3
}: CommentSystemProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);

  const reactionIcons = {
    like: ThumbsUp,
    heart: Heart,
    thumbsup: ThumbsUp,
    smile: Smile
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment?.(newComment);
      setNewComment('');
    }
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim()) {
      onAddComment?.(replyContent, parentId);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleSaveEdit = (commentId: string) => {
    if (editContent.trim()) {
      onEditComment?.(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
    }
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isExpanded = expandedReplies.has(comment.id);
    const isEditing = editingComment === comment.id;
    const isReplying = replyingTo === comment.id;
    const canReply = depth < maxDepth;

    return (
      <div key={comment.id} className="group">
        <div
          className={`flex gap-3 p-4 rounded-xl transition-all ${
            comment.isPinned
              ? 'bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          {/* Avatar */}
          <img
            src={comment.author.avatar}
            alt={comment.author.name}
            className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-gray-800"
          />

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {comment.author.name}
                </span>
                
                {comment.author.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
                
                {comment.author.isAuthor && (
                  <span className="px-2 py-0.5 bg-[#98CA3F] text-white text-xs font-semibold rounded">
                    Autor
                  </span>
                )}
                
                {comment.author.role && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {comment.author.role}
                  </span>
                )}

                {comment.isPinned && (
                  <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <Pin className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">Fijado</span>
                  </div>
                )}

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>

                {comment.isEdited && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                    (editado)
                  </span>
                )}
              </div>

              {/* Actions menu */}
              <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  onClick={() => setShowEmojiPicker(showEmojiPicker === comment.id ? null : comment.id)}
                >
                  <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>

                {showEmojiPicker === comment.id && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowEmojiPicker(null)}
                    />
                    <div className="absolute right-0 top-8 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-1 min-w-[150px]">
                      {comment.author.id === currentUserId && (
                        <>
                          <button
                            onClick={() => {
                              setEditingComment(comment.id);
                              setEditContent(comment.content);
                              setShowEmojiPicker(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                          >
                            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Editar</span>
                          </button>
                          <button
                            onClick={() => {
                              onDeleteComment?.(comment.id);
                              setShowEmojiPicker(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-sm text-red-600 dark:text-red-400">Eliminar</span>
                          </button>
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                        </>
                      )}
                      {currentUserId === comment.author.id && (
                        <button
                          onClick={() => {
                            onPinComment?.(comment.id);
                            setShowEmojiPicker(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <Pin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {comment.isPinned ? 'Desfijar' : 'Fijar'}
                          </span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onReportComment?.(comment.id);
                          setShowEmojiPicker(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                      >
                        <Flag className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm text-red-600 dark:text-red-400">Reportar</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            {isEditing ? (
              <div className="mb-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
                  rows={3}
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleSaveEdit(comment.id)}
                    className="px-4 py-1.5 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors text-sm font-medium"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                    className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}

            {/* Reactions bar */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Reactions */}
              <div className="flex items-center gap-1">
                {comment.reactions.map((reaction) => {
                  const Icon = reactionIcons[reaction.type];
                  return (
                    <button
                      key={reaction.type}
                      onClick={() => onReactToComment?.(comment.id, reaction.type)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        reaction.userReacted
                          ? 'bg-[#98CA3F]/20 text-[#98CA3F] border border-[#98CA3F]'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{reaction.count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Reply button */}
              {canReply && (
                <button
                  onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#98CA3F] dark:hover:text-[#98CA3F] transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  <span>Responder</span>
                </button>
              )}

              {/* Show replies button */}
              {comment.replies && comment.replies.length > 0 && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span>
                    {comment.replies.length} {comment.replies.length === 1 ? 'respuesta' : 'respuestas'}
                  </span>
                </button>
              )}
            </div>

            {/* Reply input */}
            {isReplying && (
              <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
                  rows={2}
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleSubmitReply(comment.id)}
                    className="px-4 py-1.5 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors text-sm font-medium"
                  >
                    Responder
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nested replies */}
        {isExpanded && comment.replies && comment.replies.length > 0 && (
          <div className="ml-8 mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-2">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalComments = comments.reduce((acc, comment) => {
    return acc + 1 + (comment.replies?.length || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-[#98CA3F]" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Comentarios
          </h2>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
            {totalComments}
          </span>
        </div>

        {/* Sort options */}
        <select
          value={sortBy}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium focus:ring-2 focus:ring-[#98CA3F]"
        >
          <option value="popular">Más populares</option>
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
        </select>
      </div>

      {/* New comment input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-3">
          {currentUserId && (
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=current"
              alt="Tu avatar"
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Comparte tus pensamientos..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {allowImages && (
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <AtSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>Comentar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No hay comentarios aún
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sé el primero en compartir tus pensamientos
            </p>
          </div>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
}
