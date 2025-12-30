import { Sparkles, Eye, Clock, Bookmark, ArrowRight, Target } from 'lucide-react';

interface RecommendedPost {
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
  matchScore: number; // 0-100, how well it matches user preferences
  matchReasons: string[]; // e.g., ["Similar category", "Authors you follow", "Topics you like"]
}

interface RecommendedPostsProps {
  posts: RecommendedPost[];
  onPostClick?: (postId: string) => void;
  variant?: 'grid' | 'list' | 'compact';
  showMatchScore?: boolean;
  title?: string;
  subtitle?: string;
}

export function RecommendedPosts({
  posts,
  onPostClick,
  variant = 'grid',
  showMatchScore = true,
  title = 'Recomendado para ti',
  subtitle = 'Basado en tus intereses y lecturas previas'
}: RecommendedPostsProps) {
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    return 'from-purple-500 to-pink-500';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Muy Relevante';
    if (score >= 60) return 'Relevante';
    return 'Puede Interesarte';
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white">{title}</h3>
          </div>
          <p className="text-xs text-white/80 mt-1">{subtitle}</p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => onPostClick?.(post.id)}
              className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
            >
              <div className="flex gap-3">
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-[#98CA3F] transition-colors mb-2">
                    {post.title}
                  </h4>
                  {showMatchScore && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`h-1.5 w-16 bg-gradient-to-r ${getMatchScoreColor(post.matchScore)} rounded-full`} />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {post.matchScore}% match
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}k` : post.views}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Posts */}
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => onPostClick?.(post.id)}
            className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all group text-left"
          >
            <div className="flex gap-4">
              {post.image && (
                <div className="relative flex-shrink-0">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                  {showMatchScore && (
                    <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-full">
                      <span className="text-xs font-bold text-white">
                        {post.matchScore}% match
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 min-w-0">
                {/* Match Score Bar */}
                {showMatchScore && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {getMatchScoreLabel(post.matchScore)}
                      </span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {post.matchScore}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getMatchScoreColor(post.matchScore)} rounded-full transition-all duration-500`}
                        style={{ width: `${post.matchScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Category */}
                <span className="inline-block px-3 py-1 bg-[#98CA3F]/10 text-[#98CA3F] rounded-full text-xs font-semibold mb-2">
                  {post.category}
                </span>

                {/* Title */}
                <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 group-hover:text-[#98CA3F] transition-colors mb-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {post.excerpt}
                </p>

                {/* Match Reasons */}
                {post.matchReasons && post.matchReasons.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.matchReasons.slice(0, 3).map((reason, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs"
                      >
                        <Sparkles className="w-3 h-3" />
                        {reason}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
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
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.readTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}k` : post.views}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => onPostClick?.(post.id)}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group text-left"
          >
            {/* Image */}
            <div className="relative">
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              {showMatchScore && (
                <div className="absolute top-3 right-3">
                  <div className={`px-3 py-1.5 bg-gradient-to-r ${getMatchScoreColor(post.matchScore)} rounded-full flex items-center gap-1.5 shadow-lg`}>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-bold text-white">
                      {post.matchScore}% match
                    </span>
                  </div>
                </div>
              )}
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

              {/* Match Reasons */}
              {post.matchReasons && post.matchReasons.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.matchReasons.slice(0, 2).map((reason, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      {reason}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
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
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime} min
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
