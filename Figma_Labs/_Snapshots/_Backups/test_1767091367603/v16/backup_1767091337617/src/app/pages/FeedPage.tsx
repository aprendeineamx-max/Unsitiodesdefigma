import { useState, useEffect, useMemo } from 'react';
import { Heart, MessageCircle, Share2, Award, BookOpen, Radio, Bookmark, Send, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useInteraction } from '../context/InteractionContext';
import { useSupabaseData } from '../context/SupabaseDataContext';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export function FeedPage() {
  // Get real posts from Supabase
  const { posts: supabasePosts, loading, errors, profile, refreshPosts } = useSupabaseData();
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const { 
    toggleLike, 
    getLikes, 
    isLiked, 
    getComments, 
    addComment,
    toggleCommentLike,
    sharePost,
    getShares,
    toggleBookmark,
    isBookmarked
  } = useInteraction();

  const posts = useMemo(() => {
    return supabasePosts.map(p => ({
      id: p.id,
      content: p.content,
      image: p.image_url,
      createdAt: p.created_at,
      likes: p.likes_count,
      comments: p.comments_count || 0,
      shares: p.shares_count || 0,
      type: p.type,
      author: {
        name: p.user?.full_name || 'Usuario Platzi',
        avatar: p.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user_id}`,
        title: p.user?.role || 'Estudiante'
      },
      // Optional fields not currently in Supabase schema
      achievement: null as any,
      course: null as any
    }));
  }, [supabasePosts]);

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'course_completion':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'live_class':
        return <Radio className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    return `Hace ${Math.floor(diffInHours / 24)} días`;
  };

  const handleAddComment = (postId: string) => {
    if (commentText.trim()) {
      addComment(postId, commentText);
      setCommentText('');
    }
  };

  const handleShare = (postId: string) => {
    sharePost(postId);
    // Show share dialog or copy link
    alert('Enlace copiado al portapapeles!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl mb-2 text-gray-900 dark:text-white">Feed de la Comunidad</h1>
          <p className="text-gray-600 dark:text-gray-400">Descubre qué está pasando en Platzi</p>
        </div>

        {/* Create Post */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Current"
              alt="Tu avatar"
              className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700"
            />
            <input 
              type="text"
              placeholder="¿Qué estás aprendiendo hoy?"
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#98ca3f]"
            />
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#98ca3f] transition-colors">
              <BookOpen className="w-4 h-4" />
              Curso completado
            </button>
            <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#98ca3f] transition-colors">
              <Award className="w-4 h-4" />
              Logro obtenido
            </button>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-4">
          {loading.posts ? (
            <LoadingState />
          ) : errors.posts ? (
            <ErrorState error={errors.posts.message} onRetry={refreshPosts} />
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Post Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <img 
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{post.author.name}</h3>
                        {post.author.title && (
                          <span className="text-xs bg-[#98ca3f]/20 dark:bg-[#98ca3f]/30 text-[#98ca3f] px-2 py-1 rounded-full">
                            {post.author.title}
                          </span>
                        )}
                        {getPostIcon(post.type)}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-gray-800 dark:text-gray-200">{post.content}</p>

                  {/* Achievement Badge */}
                  {post.achievement && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{post.achievement.badge}</div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Logro desbloqueado</p>
                          <p className="font-semibold text-lg text-gray-900 dark:text-white">{post.achievement.title}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Course Card */}
                  {post.course && (
                    <div className="mt-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-700 rounded-lg overflow-hidden flex">
                      <img 
                        src={post.course.image}
                        alt={post.course.title}
                        className="w-32 h-24 object-cover"
                      />
                      <div className="p-3 flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Curso completado</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{post.course.title}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Image */}
                {post.image && (
                  <div className="w-full">
                    <ImageWithFallback 
                      src={post.image}
                      alt="Post"
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span>{post.likes + getLikes(post.id)} me gusta</span>
                    <div className="flex gap-4">
                      <span>{getComments(post.id).length} comentarios</span>
                      <span>{post.shares + getShares(post.id)} compartidos</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleLike(post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                        isLiked(post.id) ? 'text-[#98ca3f]' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked(post.id) ? 'fill-[#98ca3f]' : ''}`} />
                      <span>Me gusta</span>
                    </button>
                    <button 
                      onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-gray-400"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Comentar</span>
                    </button>
                    <button 
                      onClick={() => handleShare(post.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-gray-400"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Compartir</span>
                    </button>
                    <button 
                      onClick={() => toggleBookmark(post.id)}
                      className={`p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                        isBookmarked(post.id) ? 'text-[#98ca3f]' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${isBookmarked(post.id) ? 'fill-[#98ca3f]' : ''}`} />
                    </button>
                  </div>

                  {/* Comments Section */}
                  {selectedPost === post.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      {/* Comment Input */}
                      <div className="flex items-start gap-3 mb-4">
                        <img 
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Current"
                          alt="Tu avatar"
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-700"
                        />
                        <div className="flex-1 flex gap-2">
                          <input 
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            placeholder="Escribe un comentario..."
                            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#98ca3f]"
                          />
                          <button 
                            onClick={() => handleAddComment(post.id)}
                            className="p-2 bg-[#98ca3f] text-[#121f3d] rounded-full hover:bg-[#87b935] transition-colors"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-3">
                        {getComments(post.id).map((comment) => (
                          <div key={comment.id} className="flex items-start gap-3">
                            <img 
                              src={comment.author.avatar}
                              alt={comment.author.name}
                              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-700"
                            />
                            <div className="flex-1">
                              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                                <p className="font-medium text-sm text-gray-900 dark:text-white">{comment.author.name}</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                              </div>
                              <div className="flex items-center gap-4 mt-1 px-4 text-xs text-gray-500 dark:text-gray-400">
                                <button 
                                  onClick={() => toggleCommentLike(post.id, comment.id)}
                                  className={comment.isLiked ? 'text-[#98ca3f] font-medium' : 'hover:underline'}
                                >
                                  Me gusta ({comment.likes})
                                </button>
                                <button className="hover:underline">Responder</button>
                                <span>{formatTimeAgo(comment.createdAt)}</span>
                              </div>

                              {/* Replies */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="ml-8 mt-3 space-y-3">
                                  {comment.replies.map((reply) => (
                                    <div key={reply.id} className="flex items-start gap-3">
                                      <img 
                                        src={reply.author.avatar}
                                        alt={reply.author.name}
                                        className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-700"
                                      />
                                      <div className="flex-1">
                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                                          <p className="font-medium text-sm text-gray-900 dark:text-white">{reply.author.name}</p>
                                          <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 px-4 text-xs text-gray-500 dark:text-gray-400">
                                          <button 
                                            onClick={() => toggleCommentLike(post.id, reply.id)}
                                            className={reply.isLiked ? 'text-[#98ca3f] font-medium' : 'hover:underline'}
                                          >
                                            Me gusta ({reply.likes})
                                          </button>
                                          <span>{formatTimeAgo(reply.createdAt)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}