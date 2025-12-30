import { useState } from 'react';
import { MessageCircle, ThumbsUp, CornerDownRight, MoreVertical, Trash2, Edit3, Flag, CheckCircle } from 'lucide-react';
import { BlogComment } from '../../types/blog.types';
import { useBlog } from '../../context/BlogContext';
import { useAuth } from '../../context/AuthContext';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { comments, getCommentsByPostId, addComment } = useBlog();
  const postComments = getCommentsByPostId(postId);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await addComment(postId, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-[#98ca3f]" />
          Comentarios ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Comparte tu opinión sobre este artículo..."
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#98ca3f] resize-none"
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-500 dark:text-gray-500">
                  {newComment.length}/1000
                </span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Publicando...' : 'Publicar Comentario'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            <button className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
              Inicia sesión
            </button>{' '}
            para comentar
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {postComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-500">
              Sé el primero en comentar este artículo
            </p>
          </div>
        ) : (
          postComments.map(comment => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: BlogComment;
  postId: string;
  isReply?: boolean;
}

function CommentItem({ comment, postId, isReply = false }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  
  const { addComment, toggleCommentLike, isCommentLikedByUser, updateComment, deleteComment } = useBlog();
  const { user } = useAuth();
  const isLiked = isCommentLikedByUser(comment.id);
  const isOwner = user?.id === comment.user_id;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await addComment(postId, replyText, comment.id);
      setReplyText('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    
    try {
      await updateComment(comment.id, editText);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;
    
    try {
      await deleteComment(comment.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (comment.deleted) {
    return (
      <div className={`p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 ${isReply ? 'ml-12' : ''}`}>
        <p className="text-gray-500 dark:text-gray-500 italic">[Comentario eliminado]</p>
      </div>
    );
  }

  return (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
        <img
          src={comment.user?.avatar}
          alt={comment.user?.name}
          className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-gray-900 dark:text-white">
                  {comment.user?.name}
                </h4>
                {comment.user?.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500 fill-current" />
                )}
                {comment.user?.role && (
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    • {comment.user.role}
                  </span>
                )}
                {comment.edited && (
                  <span className="text-xs text-gray-400 dark:text-gray-600">
                    (editado)
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-500">
                {new Date(comment.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-10">
                  {isOwner ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </>
                  ) : (
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Flag className="w-4 h-4" />
                      Reportar
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="mb-4">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#98ca3f]"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-[#98ca3f] text-white rounded-lg hover:bg-[#7ba832] transition-colors font-semibold text-sm"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.content);
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => toggleCommentLike(comment.id)}
              className={`flex items-center gap-1 transition-colors ${
                isLiked
                  ? 'text-red-600 dark:text-red-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-[#98ca3f] dark:hover:text-[#98ca3f]'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {comment.likes_count > 0 && comment.likes_count}
              <span className="ml-1">{isLiked ? 'Te gusta' : 'Me gusta'}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-[#98ca3f] dark:hover:text-[#98ca3f] transition-colors"
              >
                <CornerDownRight className="w-4 h-4" />
                Responder
                {comment.replies_count > 0 && ` (${comment.replies_count})`}
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && user && (
            <form onSubmit={handleReply} className="mt-4 pl-4 border-l-2 border-[#98ca3f]">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Responder a ${comment.user?.name}...`}
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#98ca3f] resize-none mb-2"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSubmitting}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Responder'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText('');
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} postId={postId} isReply />
          ))}
        </div>
      )}
    </div>
  );
}
