import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FeedPost } from '../data/socialFeed';
import { Comment, CommentsState, initialComments } from '../data/comments';

interface InteractionContextType {
  // Likes
  toggleLike: (postId: string) => void;
  getLikes: (postId: string) => number;
  isLiked: (postId: string) => boolean;
  
  // Comments
  comments: CommentsState;
  addComment: (postId: string, content: string, replyTo?: string) => void;
  getComments: (postId: string) => Comment[];
  toggleCommentLike: (postId: string, commentId: string) => void;
  
  // Shares
  sharePost: (postId: string) => void;
  getShares: (postId: string) => number;
  
  // Bookmarks
  toggleBookmark: (postId: string) => void;
  isBookmarked: (postId: string) => boolean;
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

export function InteractionProvider({ children }: { children: ReactNode }) {
  const [likes, setLikes] = useState<{ [key: string]: { count: number; isLiked: boolean } }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('platzi-likes');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const [comments, setComments] = useState<CommentsState>(initialComments);
  
  const [shares, setShares] = useState<{ [key: string]: number }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('platzi-shares');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('platzi-bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('platzi-likes', JSON.stringify(likes));
  }, [likes]);

  useEffect(() => {
    localStorage.setItem('platzi-shares', JSON.stringify(shares));
  }, [shares]);

  useEffect(() => {
    localStorage.setItem('platzi-bookmarks', JSON.stringify([...bookmarks]));
  }, [bookmarks]);

  const toggleLike = (postId: string) => {
    setLikes(prev => {
      const current = prev[postId] || { count: 0, isLiked: false };
      return {
        ...prev,
        [postId]: {
          count: current.isLiked ? current.count - 1 : current.count + 1,
          isLiked: !current.isLiked
        }
      };
    });
  };

  const getLikes = (postId: string) => {
    return likes[postId]?.count || 0;
  };

  const isLiked = (postId: string) => {
    return likes[postId]?.isLiked || false;
  };

  const addComment = (postId: string, content: string, replyTo?: string) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      postId,
      author: {
        name: 'Usuario Actual',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Current'
      },
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    setComments(prev => {
      if (replyTo) {
        // Add as reply
        const postComments = prev[postId] || [];
        const updatedComments = postComments.map(comment => {
          if (comment.id === replyTo) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment]
            };
          }
          return comment;
        });
        return { ...prev, [postId]: updatedComments };
      } else {
        // Add as top-level comment
        return {
          ...prev,
          [postId]: [...(prev[postId] || []), newComment]
        };
      }
    });
  };

  const getComments = (postId: string) => {
    return comments[postId] || [];
  };

  const toggleCommentLike = (postId: string, commentId: string) => {
    setComments(prev => {
      const postComments = prev[postId] || [];
      const updatedComments = postComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked
          };
        }
        // Check replies
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                isLiked: !reply.isLiked
              };
            }
            return reply;
          });
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      });
      return { ...prev, [postId]: updatedComments };
    });
  };

  const sharePost = (postId: string) => {
    setShares(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1
    }));
  };

  const getShares = (postId: string) => {
    return shares[postId] || 0;
  };

  const toggleBookmark = (postId: string) => {
    setBookmarks(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(postId)) {
        newBookmarks.delete(postId);
      } else {
        newBookmarks.add(postId);
      }
      return newBookmarks;
    });
  };

  const isBookmarked = (postId: string) => {
    return bookmarks.has(postId);
  };

  return (
    <InteractionContext.Provider value={{
      toggleLike,
      getLikes,
      isLiked,
      comments,
      addComment,
      getComments,
      toggleCommentLike,
      sharePost,
      getShares,
      toggleBookmark,
      isBookmarked
    }}>
      {children}
    </InteractionContext.Provider>
  );
}

export function useInteraction() {
  const context = useContext(InteractionContext);
  if (context === undefined) {
    throw new Error('useInteraction must be used within an InteractionProvider');
  }
  return context;
}
