import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  BlogPost,
  BlogComment,
  BlogAuthor,
  BlogCategory,
  BlogTag,
  BlogLike,
  BlogBookmark,
  BlogFollow,
  BlogReaction,
  BlogNewsletterSubscription,
  SearchFilters,
  SearchResult,
  SearchSuggestion
} from '../types/blog.types';

interface BlogContextType {
  // Posts
  posts: BlogPost[];
  featuredPosts: BlogPost[];
  trendingPosts: BlogPost[];
  getPostById: (id: string) => BlogPost | undefined;
  getPostsByCategory: (categoryId: string) => BlogPost[];
  getPostsByTag: (tagId: string) => BlogPost[];
  searchPosts: (query: string) => BlogPost[];
  
  // Advanced Search & Discovery (PHASE 3)
  advancedSearch: (query: string, filters: SearchFilters) => SearchResult[];
  getSearchSuggestions: (query: string) => SearchSuggestion[];
  getTrendingPosts: (limit?: number) => BlogPost[];
  getRecommendedPosts: (limit?: number) => BlogPost[];
  getRelatedPosts: (postId: string, limit?: number) => BlogPost[];
  getPopularTags: (limit?: number) => BlogTag[];
  getTrendingSearches: () => string[];
  
  // Comments
  comments: BlogComment[];
  getCommentsByPostId: (postId: string) => BlogComment[];
  addComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  
  // Likes
  likes: BlogLike[];
  isPostLikedByUser: (postId: string) => boolean;
  isCommentLikedByUser: (commentId: string) => boolean;
  togglePostLike: (postId: string) => Promise<void>;
  toggleCommentLike: (commentId: string) => Promise<void>;
  
  // Bookmarks
  bookmarks: BlogBookmark[];
  isPostBookmarkedByUser: (postId: string) => boolean;
  toggleBookmark: (postId: string) => Promise<void>;
  getBookmarkedPosts: () => BlogPost[];
  
  // Reactions
  reactions: BlogReaction[];
  getPostReactions: (postId: string) => BlogReaction[];
  addReaction: (postId: string, type: BlogReaction['type']) => Promise<void>;
  removeReaction: (postId: string, type: BlogReaction['type']) => Promise<void>;
  
  // Authors
  authors: BlogAuthor[];
  getAuthorById: (id: string) => BlogAuthor | undefined;
  followAuthor: (authorId: string) => Promise<void>;
  unfollowAuthor: (authorId: string) => Promise<void>;
  isFollowingAuthor: (authorId: string) => boolean;
  getFollowedAuthors: () => BlogAuthor[];
  
  // Categories & Tags
  categories: BlogCategory[];
  tags: BlogTag[];
  
  // Newsletter
  newsletterSubscription: BlogNewsletterSubscription | null;
  subscribeNewsletter: (email: string, frequency: BlogNewsletterSubscription['frequency'], categories: string[]) => Promise<void>;
  unsubscribeNewsletter: () => Promise<void>;
  
  // Share
  sharePost: (postId: string, platform: 'twitter' | 'linkedin' | 'facebook' | 'whatsapp' | 'email' | 'copy') => Promise<void>;
  
  // Views
  incrementPostViews: (postId: string) => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Mock data (will be replaced with Supabase queries)
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [likes, setLikes] = useState<BlogLike[]>([]);
  const [bookmarks, setBookmarks] = useState<BlogBookmark[]>([]);
  const [reactions, setReactions] = useState<BlogReaction[]>([]);
  const [follows, setFollows] = useState<BlogFollow[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [newsletterSubscription, setNewsletterSubscription] = useState<BlogNewsletterSubscription | null>(null);

  // Load initial data from localStorage (temporary, will use Supabase)
  useEffect(() => {
    const savedLikes = localStorage.getItem('blogLikes');
    if (savedLikes) setLikes(JSON.parse(savedLikes));
    
    const savedBookmarks = localStorage.getItem('blogBookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    
    const savedFollows = localStorage.getItem('blogFollows');
    if (savedFollows) setFollows(JSON.parse(savedFollows));
    
    const savedNewsletter = localStorage.getItem('blogNewsletter');
    if (savedNewsletter) setNewsletterSubscription(JSON.parse(savedNewsletter));
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('blogLikes', JSON.stringify(likes));
  }, [likes]);

  useEffect(() => {
    localStorage.setItem('blogBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('blogFollows', JSON.stringify(follows));
  }, [follows]);

  // ============================================================================
  // POSTS
  // ============================================================================

  const getPostById = (id: string) => {
    return posts.find(post => post.id === id);
  };

  const getPostsByCategory = (categoryId: string) => {
    return posts.filter(post => post.category_id === categoryId);
  };

  const getPostsByTag = (tagId: string) => {
    return posts.filter(post => post.tags.some(tag => tag.id === tagId));
  };

  const searchPosts = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return posts.filter(
      post =>
        post.title.toLowerCase().includes(lowercaseQuery) ||
        post.excerpt.toLowerCase().includes(lowercaseQuery) ||
        post.content.toLowerCase().includes(lowercaseQuery)
    );
  };

  const featuredPosts = posts.filter(post => post.featured);
  const trendingPosts = posts.filter(post => post.trending);

  const incrementPostViews = async (postId: string) => {
    // TODO: Implement Supabase mutation
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, views_count: post.views_count + 1 } : post
      )
    );
  };

  // ============================================================================
  // COMMENTS
  // ============================================================================

  const getCommentsByPostId = (postId: string) => {
    return comments.filter(comment => comment.post_id === postId && !comment.parent_id);
  };

  const addComment = async (postId: string, content: string, parentId?: string) => {
    if (!user) return;

    const newComment: BlogComment = {
      id: Date.now().toString(),
      post_id: postId,
      user_id: user.id,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        verified: true
      },
      parent_id: parentId,
      content,
      likes_count: 0,
      replies_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      edited: false,
      deleted: false
    };

    // TODO: Implement Supabase insert
    setComments(prev => [...prev, newComment]);

    // Update post comment count
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, comments_count: post.comments_count + 1 } : post
      )
    );
  };

  const updateComment = async (commentId: string, content: string) => {
    if (!user) return;

    // TODO: Implement Supabase update
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId
          ? { ...comment, content, edited: true, updated_at: new Date().toISOString() }
          : comment
      )
    );
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    // TODO: Implement Supabase soft delete
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId
          ? { ...comment, deleted: true, content: '[Comentario eliminado]' }
          : comment
      )
    );
  };

  // ============================================================================
  // LIKES
  // ============================================================================

  const isPostLikedByUser = (postId: string) => {
    if (!user) return false;
    return likes.some(like => like.post_id === postId && like.user_id === user.id);
  };

  const isCommentLikedByUser = (commentId: string) => {
    if (!user) return false;
    return likes.some(like => like.comment_id === commentId && like.user_id === user.id);
  };

  const togglePostLike = async (postId: string) => {
    if (!user) return;

    const existingLike = likes.find(
      like => like.post_id === postId && like.user_id === user.id
    );

    if (existingLike) {
      // Unlike
      // TODO: Implement Supabase delete
      setLikes(prev => prev.filter(like => like.id !== existingLike.id));
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, likes_count: post.likes_count - 1 } : post
        )
      );
    } else {
      // Like
      const newLike: BlogLike = {
        id: Date.now().toString(),
        post_id: postId,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      // TODO: Implement Supabase insert
      setLikes(prev => [...prev, newLike]);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, likes_count: post.likes_count + 1 } : post
        )
      );
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    if (!user) return;

    const existingLike = likes.find(
      like => like.comment_id === commentId && like.user_id === user.id
    );

    if (existingLike) {
      // Unlike
      setLikes(prev => prev.filter(like => like.id !== existingLike.id));
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId ? { ...comment, likes_count: comment.likes_count - 1 } : comment
        )
      );
    } else {
      // Like
      const newLike: BlogLike = {
        id: Date.now().toString(),
        comment_id: commentId,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      setLikes(prev => [...prev, newLike]);
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId ? { ...comment, likes_count: comment.likes_count + 1 } : comment
        )
      );
    }
  };

  // ============================================================================
  // BOOKMARKS
  // ============================================================================

  const isPostBookmarkedByUser = (postId: string) => {
    if (!user) return false;
    return bookmarks.some(bookmark => bookmark.post_id === postId && bookmark.user_id === user.id);
  };

  const toggleBookmark = async (postId: string) => {
    if (!user) return;

    const existingBookmark = bookmarks.find(
      bookmark => bookmark.post_id === postId && bookmark.user_id === user.id
    );

    if (existingBookmark) {
      // Remove bookmark
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== existingBookmark.id));
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, bookmarks_count: post.bookmarks_count - 1 } : post
        )
      );
    } else {
      // Add bookmark
      const newBookmark: BlogBookmark = {
        id: Date.now().toString(),
        post_id: postId,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      setBookmarks(prev => [...prev, newBookmark]);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, bookmarks_count: post.bookmarks_count + 1 } : post
        )
      );
    }
  };

  const getBookmarkedPosts = () => {
    if (!user) return [];
    const userBookmarks = bookmarks.filter(bookmark => bookmark.user_id === user.id);
    return posts.filter(post => userBookmarks.some(bookmark => bookmark.post_id === post.id));
  };

  // ============================================================================
  // REACTIONS
  // ============================================================================

  const getPostReactions = (postId: string) => {
    return reactions.filter(reaction => reaction.post_id === postId);
  };

  const addReaction = async (postId: string, type: BlogReaction['type']) => {
    if (!user) return;

    const newReaction: BlogReaction = {
      id: Date.now().toString(),
      post_id: postId,
      user_id: user.id,
      type,
      created_at: new Date().toISOString()
    };

    // TODO: Implement Supabase insert
    setReactions(prev => [...prev, newReaction]);
  };

  const removeReaction = async (postId: string, type: BlogReaction['type']) => {
    if (!user) return;

    // TODO: Implement Supabase delete
    setReactions(prev =>
      prev.filter(
        reaction =>
          !(reaction.post_id === postId && reaction.user_id === user.id && reaction.type === type)
      )
    );
  };

  // ============================================================================
  // AUTHORS
  // ============================================================================

  const getAuthorById = (id: string) => {
    return authors.find(author => author.id === id);
  };

  const isFollowingAuthor = (authorId: string) => {
    if (!user) return false;
    return follows.some(follow => follow.following_id === authorId && follow.follower_id === user.id);
  };

  const followAuthor = async (authorId: string) => {
    if (!user) return;

    const newFollow: BlogFollow = {
      id: Date.now().toString(),
      follower_id: user.id,
      following_id: authorId,
      created_at: new Date().toISOString()
    };

    // TODO: Implement Supabase insert
    setFollows(prev => [...prev, newFollow]);

    // Update author followers count
    setAuthors(prevAuthors =>
      prevAuthors.map(author =>
        author.id === authorId ? { ...author, followers_count: author.followers_count + 1 } : author
      )
    );
  };

  const unfollowAuthor = async (authorId: string) => {
    if (!user) return;

    const existingFollow = follows.find(
      follow => follow.following_id === authorId && follow.follower_id === user.id
    );

    if (existingFollow) {
      // TODO: Implement Supabase delete
      setFollows(prev => prev.filter(follow => follow.id !== existingFollow.id));

      // Update author followers count
      setAuthors(prevAuthors =>
        prevAuthors.map(author =>
          author.id === authorId ? { ...author, followers_count: author.followers_count - 1 } : author
        )
      );
    }
  };

  const getFollowedAuthors = () => {
    if (!user) return [];
    const userFollows = follows.filter(follow => follow.follower_id === user.id);
    return authors.filter(author => userFollows.some(follow => follow.following_id === author.id));
  };

  // ============================================================================
  // ADVANCED SEARCH & DISCOVERY (PHASE 3)
  // ============================================================================

  const advancedSearch = (query: string, filters: SearchFilters): SearchResult[] => {
    let filteredPosts = posts;

    // Apply category filter
    if (filters.categories.length > 0) {
      filteredPosts = filteredPosts.filter(post => filters.categories.includes(post.category_id));
    }

    // Apply tag filter
    if (filters.tags.length > 0) {
      filteredPosts = filteredPosts.filter(post =>
        post.tags.some(tag => filters.tags.includes(tag.id))
      );
    }

    // Apply author filter
    if (filters.authors.length > 0) {
      filteredPosts = filteredPosts.filter(post => filters.authors.includes(post.author_id));
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          filterDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filteredPosts = filteredPosts.filter(
        post => new Date(post.published_at) >= filterDate
      );
    }

    // Apply read time filter
    if (filters.readTime !== 'all') {
      filteredPosts = filteredPosts.filter(post => {
        if (filters.readTime === 'short') return post.read_time < 5;
        if (filters.readTime === 'medium') return post.read_time >= 5 && post.read_time <= 15;
        if (filters.readTime === 'long') return post.read_time > 15;
        return true;
      });
    }

    // Apply text search
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filteredPosts = filteredPosts.filter(
        post =>
          post.title.toLowerCase().includes(lowercaseQuery) ||
          post.excerpt.toLowerCase().includes(lowercaseQuery) ||
          post.content.toLowerCase().includes(lowercaseQuery) ||
          post.tags.some(tag => tag.name.toLowerCase().includes(lowercaseQuery))
      );
    }

    // Apply sorting
    const sortedPosts = [...filteredPosts].sort((a, b) => {
      switch (filters.sortBy) {
        case 'latest':
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        case 'popular':
          return (b.likes_count + b.comments_count + b.shares_count) -
                 (a.likes_count + a.comments_count + a.shares_count);
        case 'trending':
          return (b.views_count * 0.5 + b.likes_count * 2 + b.comments_count * 3) -
                 (a.views_count * 0.5 + a.likes_count * 2 + a.comments_count * 3);
        case 'mostViewed':
          return b.views_count - a.views_count;
        case 'mostLiked':
          return b.likes_count - a.likes_count;
        default:
          return 0;
      }
    });

    // Convert to SearchResult format with match scores
    return sortedPosts.map(post => {
      let matchScore = 50; // Base score

      // Increase score based on query match
      if (query) {
        const lowerQuery = query.toLowerCase();
        if (post.title.toLowerCase().includes(lowerQuery)) matchScore += 30;
        if (post.excerpt.toLowerCase().includes(lowerQuery)) matchScore += 15;
        if (post.tags.some(tag => tag.name.toLowerCase().includes(lowerQuery))) matchScore += 10;
      }

      // Increase score for trending/featured
      if (post.trending) matchScore += 10;
      if (post.featured) matchScore += 5;

      return {
        id: post.id,
        type: 'post' as const,
        title: post.title,
        excerpt: post.excerpt,
        author: post.author ? {
          name: post.author.name,
          avatar: post.author.avatar
        } : undefined,
        image: post.featured_image,
        category: post.category?.name,
        tags: post.tags.map(t => t.name),
        readTime: post.read_time,
        views: post.views_count,
        likes: post.likes_count,
        matchScore: Math.min(matchScore, 100)
      };
    });
  };

  const getSearchSuggestions = (query: string): SearchSuggestion[] => {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    // Search in posts
    const matchingPosts = posts
      .filter(post => post.title.toLowerCase().includes(lowerQuery))
      .slice(0, 5);

    matchingPosts.forEach(post => {
      suggestions.push({
        id: post.id,
        type: 'post',
        title: post.title,
        subtitle: post.category?.name,
        trending: post.trending
      });
    });

    // Search in tags
    const matchingTags = tags
      .filter(tag => tag.name.toLowerCase().includes(lowerQuery))
      .slice(0, 3);

    matchingTags.forEach(tag => {
      suggestions.push({
        id: tag.id,
        type: 'tag',
        title: tag.name,
        subtitle: `${tag.posts_count} artículos`
      });
    });

    // Search in authors
    const matchingAuthors = authors
      .filter(author => author.name.toLowerCase().includes(lowerQuery))
      .slice(0, 3);

    matchingAuthors.forEach(author => {
      suggestions.push({
        id: author.id,
        type: 'author',
        title: author.name,
        subtitle: author.role
      });
    });

    // Search in categories
    const matchingCategories = categories
      .filter(cat => cat.name.toLowerCase().includes(lowerQuery))
      .slice(0, 3);

    matchingCategories.forEach(cat => {
      suggestions.push({
        id: cat.id,
        type: 'category',
        title: cat.name,
        subtitle: `${cat.posts_count} artículos`
      });
    });

    return suggestions;
  };

  const getTrendingPosts = (limit: number = 10): BlogPost[] => {
    // Calculate trending score: views * 0.5 + likes * 2 + comments * 3 + recent boost
    const now = new Date().getTime();

    const postsWithScore = posts.map(post => {
      const publishedTime = new Date(post.published_at).getTime();
      const ageInDays = (now - publishedTime) / (1000 * 60 * 60 * 24);
      const recencyBoost = Math.max(0, 10 - ageInDays); // Boost for recent posts

      const score =
        post.views_count * 0.5 +
        post.likes_count * 2 +
        post.comments_count * 3 +
        post.shares_count * 1.5 +
        recencyBoost * 5;

      return { post, score };
    });

    return postsWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.post);
  };

  const getRecommendedPosts = (limit: number = 10): BlogPost[] => {
    if (!user) {
      // If no user, return trending posts
      return getTrendingPosts(limit);
    }

    // Get user's reading history (bookmarks + liked posts)
    const userBookmarkedPosts = bookmarks
      .filter(b => b.user_id === user.id)
      .map(b => posts.find(p => p.id === b.post_id))
      .filter((p): p is BlogPost => p !== undefined);

    const userLikedPosts = likes
      .filter(l => l.user_id === user.id && l.post_id)
      .map(l => posts.find(p => p.id === l.post_id))
      .filter((p): p is BlogPost => p !== undefined);

    const userInteractedPosts = [...userBookmarkedPosts, ...userLikedPosts];

    if (userInteractedPosts.length === 0) {
      return getTrendingPosts(limit);
    }

    // Extract categories and tags from user's interacted posts
    const userCategories = new Set(userInteractedPosts.map(p => p.category_id));
    const userTags = new Set(
      userInteractedPosts.flatMap(p => p.tags.map(t => t.id))
    );

    // Score posts based on similarity
    const postsWithScore = posts
      .filter(post => !userInteractedPosts.some(p => p.id === post.id)) // Exclude already interacted posts
      .map(post => {
        let score = 0;

        // Category match
        if (userCategories.has(post.category_id)) score += 30;

        // Tag matches
        const matchingTags = post.tags.filter(t => userTags.has(t.id)).length;
        score += matchingTags * 15;

        // Popularity boost
        score += Math.log(post.views_count + 1) * 2;
        score += post.likes_count * 1.5;

        // Recency boost
        const daysOld = (Date.now() - new Date(post.published_at).getTime()) / (1000 * 60 * 60 * 24);
        score += Math.max(0, 10 - daysOld);

        return { post, score };
      });

    return postsWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.post);
  };

  const getRelatedPosts = (postId: string, limit: number = 3): BlogPost[] => {
    const currentPost = getPostById(postId);
    if (!currentPost) return [];

    const postsWithScore = posts
      .filter(post => post.id !== postId)
      .map(post => {
        let score = 0;

        // Same category
        if (post.category_id === currentPost.category_id) score += 40;

        // Common tags
        const commonTags = post.tags.filter(t =>
          currentPost.tags.some(ct => ct.id === t.id)
        );
        score += commonTags.length * 20;

        // Same author
        if (post.author_id === currentPost.author_id) score += 15;

        return { post, score, commonTags: commonTags.length };
      })
      .filter(item => item.score > 0); // Only include posts with some relation

    return postsWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.post);
  };

  const getPopularTags = (limit: number = 20): BlogTag[] => {
    return [...tags]
      .sort((a, b) => b.posts_count - a.posts_count)
      .slice(0, limit);
  };

  const getTrendingSearches = (): string[] => {
    // Mock data - in production this would come from analytics
    return [
      'React Server Components',
      'TypeScript 5.0',
      'Inteligencia Artificial',
      'UI/UX Design',
      'Node.js Performance',
      'Next.js 14',
      'Machine Learning',
      'DevOps',
      'CSS Grid',
      'Web Accessibility'
    ];
  };

  // ============================================================================
  // NEWSLETTER
  // ============================================================================

  const subscribeNewsletter = async (
    email: string,
    frequency: BlogNewsletterSubscription['frequency'],
    categories: string[]
  ) => {
    const subscription: BlogNewsletterSubscription = {
      id: Date.now().toString(),
      email,
      user_id: user?.id,
      frequency,
      categories,
      active: true,
      confirmed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // TODO: Implement Supabase insert
    setNewsletterSubscription(subscription);
    localStorage.setItem('blogNewsletter', JSON.stringify(subscription));
  };

  const unsubscribeNewsletter = async () => {
    // TODO: Implement Supabase update/delete
    setNewsletterSubscription(null);
    localStorage.removeItem('blogNewsletter');
  };

  // ============================================================================
  // SHARE
  // ============================================================================

  const sharePost = async (
    postId: string,
    platform: 'twitter' | 'linkedin' | 'facebook' | 'whatsapp' | 'email' | 'copy'
  ) => {
    const post = getPostById(postId);
    if (!post) return;

    const url = `${window.location.origin}/blog/${post.slug}`;
    const text = `${post.title} - ${post.excerpt}`;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'whatsapp':
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`,
          '_blank'
        );
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        alert('¡Link copiado al portapapeles!');
        break;
    }

    // Track share
    // TODO: Implement Supabase insert for analytics
    setPosts(prevPosts =>
      prevPosts.map(p => (p.id === postId ? { ...p, shares_count: p.shares_count + 1 } : p))
    );
  };

  const value: BlogContextType = {
    posts,
    featuredPosts,
    trendingPosts,
    getPostById,
    getPostsByCategory,
    getPostsByTag,
    searchPosts,
    comments,
    getCommentsByPostId,
    addComment,
    updateComment,
    deleteComment,
    likes,
    isPostLikedByUser,
    isCommentLikedByUser,
    togglePostLike,
    toggleCommentLike,
    bookmarks,
    isPostBookmarkedByUser,
    toggleBookmark,
    getBookmarkedPosts,
    reactions,
    getPostReactions,
    addReaction,
    removeReaction,
    authors,
    getAuthorById,
    followAuthor,
    unfollowAuthor,
    isFollowingAuthor,
    getFollowedAuthors,
    categories,
    tags,
    newsletterSubscription,
    subscribeNewsletter,
    unsubscribeNewsletter,
    sharePost,
    incrementPostViews,
    advancedSearch,
    getSearchSuggestions,
    getTrendingPosts,
    getRecommendedPosts,
    getRelatedPosts,
    getPopularTags,
    getTrendingSearches
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}