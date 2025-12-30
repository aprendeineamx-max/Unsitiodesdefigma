import { TrendingUp, Eye, ThumbsUp, MessageCircle, Clock, Flame, ArrowUp } from 'lucide-react';

interface TrendingPost {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  image?: string;
  category: string;
  readTime: number;
  views: number;
  likes: number;
  comments: number;
  trendingScore: number;
  trendingChange: number; // percentage change
  publishedAt: string;
}

interface TrendingPostsProps {
  posts: TrendingPost[];
  onPostClick?: (postId: string) => void;
  variant?: 'sidebar' | 'grid' | 'list';
  limit?: number;
  showMetrics?: boolean;
}

export function TrendingPosts({
  posts,
  onPostClick,
  variant = 'sidebar',
  limit,
  showMetrics = true
}: TrendingPostsProps) {
  const displayPosts = limit ? posts.slice(0, limit) : posts;

  if (variant === 'sidebar') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-red-500">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white">Trending Ahora</h3>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {displayPosts.map((post, index) => (
            <button
              key={post.id}
              onClick={() => onPostClick?.(post.id)}
              className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
            >
              <div className="flex gap-3">
                {/* Ranking Number */}
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                      : index === 1
                      ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                      : index === 2
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-[#98CA3F] transition-colors mb-2">
                    {post.title}
                  </h4>

                  {/* Author */}
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {post.author.name}
                    </span>
                  </div>

                  {/* Metrics */}
                  {showMetrics && (
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}k` : post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {post.likes}
                      </span>
                      {post.trendingChange > 0 && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                          <ArrowUp className="w-3 h-3" />
                          {post.trendingChange}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Actualizado cada hora • Algoritmo basado en engagement
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Trending Posts
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Los artículos más populares del momento
              </p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosts.map((post, index) => (
            <button
              key={post.id}
              onClick={() => onPostClick?.(post.id)}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group text-left"
            >
              {/* Trending Badge */}
              <div className="relative">
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                      : 'bg-black/70 backdrop-blur-sm text-white'
                  }`}>
                    <Flame className="w-3.5 h-3.5" />
                    #{index + 1} Trending
                  </div>
                  {post.trendingChange > 0 && (
                    <div className="px-2.5 py-1 bg-green-500 rounded-full flex items-center gap-1 text-xs font-semibold text-white">
                      <ArrowUp className="w-3 h-3" />
                      {post.trendingChange}%
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5">
                {/* Category */}
                <span className="inline-block px-3 py-1 bg-[#98CA3F]/10 text-[#98CA3F] rounded-full text-xs font-semibold mb-3">
                  {post.category}
                </span>

                {/* Title */}
                <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 group-hover:text-[#98CA3F] transition-colors mb-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                  {post.excerpt}
                </p>

                {/* Author & Metrics */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {post.author.name}
                    </span>
                  </div>
                  {showMetrics && (
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}k` : post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {post.likes}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // List variant
  return (
    <div className="space-y-4">
      {displayPosts.map((post, index) => (
        <button
          key={post.id}
          onClick={() => onPostClick?.(post.id)}
          className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all group text-left"
        >
          <div className="flex gap-4">
            {/* Ranking */}
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                index === 0
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                  : index === 1
                  ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                  : index === 2
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {index + 1}
              </div>
            </div>

            {/* Image */}
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
              />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                <span className="inline-block px-2.5 py-1 bg-[#98CA3F]/10 text-[#98CA3F] rounded-full text-xs font-semibold">
                  {post.category}
                </span>
                {post.trendingChange > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                    <ArrowUp className="w-3 h-3" />
                    {post.trendingChange}%
                  </span>
                )}
              </div>

              <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 group-hover:text-[#98CA3F] transition-colors mb-2">
                {post.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {post.author.name}
                  </span>
                </div>
                {showMetrics && (
                  <>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      {post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}k` : post.views}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <ThumbsUp className="w-4 h-4" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
