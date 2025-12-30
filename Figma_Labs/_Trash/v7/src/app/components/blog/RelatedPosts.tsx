import { Link2, Eye, Clock, ArrowRight, Tag, Layers } from 'lucide-react';

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  image?: string;
  category: string;
  tags: string[];
  readTime: number;
  views: number;
  similarityScore: number; // 0-100
  commonTags: string[]; // Tags in common with current post
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  onPostClick?: (postId: string) => void;
  currentPostId?: string;
  variant?: 'cards' | 'list' | 'minimal';
  title?: string;
  maxPosts?: number;
}

export function RelatedPosts({
  posts,
  onPostClick,
  currentPostId,
  variant = 'cards',
  title = 'Artículos Relacionados',
  maxPosts = 3
}: RelatedPostsProps) {
  const displayPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, maxPosts);

  if (displayPosts.length === 0) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Link2 className="w-5 h-5 text-[#98CA3F]" />
          {title}
        </h3>
        <div className="space-y-3">
          {displayPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => onPostClick?.(post.id)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-left group"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-[#98CA3F] transition-colors mb-2">
                {post.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime} min
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}k` : post.views}
                </span>
                {post.commonTags.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {post.commonTags.length} en común
                  </span>
                )}
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
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#98CA3F]" />
            {title}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {displayPosts.length} artículos
          </span>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {displayPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => onPostClick?.(post.id)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all group text-left"
            >
              <div className="flex gap-4">
                {/* Image */}
                {post.image && (
                  <div className="relative flex-shrink-0">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    {post.similarityScore >= 70 && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xs font-bold text-white">
                          {post.similarityScore}%
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Category */}
                  <span className="inline-block px-2.5 py-1 bg-[#98CA3F]/10 text-[#98CA3F] rounded-full text-xs font-semibold mb-2">
                    {post.category}
                  </span>

                  {/* Title */}
                  <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#98CA3F] transition-colors mb-2">
                    {post.title}
                  </h4>

                  {/* Common Tags */}
                  {post.commonTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {post.commonTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                      {post.commonTags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                          +{post.commonTags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-4 h-4 rounded-full"
                      />
                      <span>{post.author.name}</span>
                    </div>
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

                {/* Arrow */}
                <div className="flex-shrink-0 flex items-center">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#98CA3F] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Cards variant (default)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Layers className="w-7 h-7 text-[#98CA3F]" />
          {title}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {displayPosts.length} recomendaciones
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPosts.map((post) => (
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
              {/* Similarity Badge */}
              {post.similarityScore >= 70 && (
                <div className="absolute top-3 right-3">
                  <div className="px-3 py-1.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Link2 className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-bold text-white">
                      {post.similarityScore}% similar
                    </span>
                  </div>
                </div>
              )}
              {/* Common Tags Badge */}
              {post.commonTags.length > 0 && (
                <div className="absolute bottom-3 left-3">
                  <div className="px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-semibold text-white">
                      {post.commonTags.length} tags en común
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
              <h4 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 group-hover:text-[#98CA3F] transition-colors mb-2">
                {post.title}
              </h4>

              {/* Excerpt */}
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                {post.excerpt}
              </p>

              {/* Common Tags */}
              {post.commonTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.commonTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
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
                <div className="flex items-center gap-3 text-xs text-gray-500">
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
