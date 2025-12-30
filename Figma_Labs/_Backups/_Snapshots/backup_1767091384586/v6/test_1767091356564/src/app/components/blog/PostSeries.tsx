import { BookOpen, ChevronRight, Check, Lock, Clock } from 'lucide-react';

interface SeriesPost {
  id: string;
  title: string;
  excerpt: string;
  order: number;
  readTime: number;
  isCompleted?: boolean;
  isLocked?: boolean;
  isCurrent?: boolean;
}

interface PostSeriesData {
  id: string;
  title: string;
  description: string;
  posts: SeriesPost[];
  totalReadTime: number;
  completedCount: number;
  coverImage?: string;
}

interface PostSeriesProps {
  series: PostSeriesData;
  onPostClick?: (postId: string) => void;
  variant?: 'full' | 'compact' | 'minimal';
  showProgress?: boolean;
}

export function PostSeries({
  series,
  onPostClick,
  variant = 'full',
  showProgress = true
}: PostSeriesProps) {
  const progress = (series.completedCount / series.posts.length) * 100;

  if (variant === 'minimal') {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-purple-200 dark:border-gray-600 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-500 rounded-lg flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
              Parte de una serie
            </p>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">
              {series.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {series.posts.length} artículos • {Math.round(series.totalReadTime)} min total
            </p>
            <button
              onClick={() => onPostClick?.(series.id)}
              className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 group"
            >
              Ver serie completa
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-500">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white">Serie de Artículos</h3>
          </div>
          <h4 className="text-lg font-bold text-white mb-1">{series.title}</h4>
          <p className="text-sm text-white/80">{series.description}</p>
        </div>

        {/* Progress */}
        {showProgress && (
          <div className="px-4 py-3 bg-purple-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progreso
              </span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {series.completedCount} / {series.posts.length}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Posts list */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {series.posts.map((post, index) => (
            <button
              key={post.id}
              onClick={() => !post.isLocked && onPostClick?.(post.id)}
              disabled={post.isLocked}
              className={`w-full p-4 text-left transition-all ${
                post.isLocked
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              } ${post.isCurrent ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
            >
              <div className="flex items-start gap-3">
                {/* Order number or status icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                  post.isCompleted
                    ? 'bg-green-500 text-white'
                    : post.isCurrent
                    ? 'bg-purple-500 text-white'
                    : post.isLocked
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {post.isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : post.isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    post.order
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h5 className={`font-semibold mb-1 ${
                    post.isCurrent
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {post.title}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime} min
                    </span>
                    {post.isCompleted && (
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        ✓ Completado
                      </span>
                    )}
                    {post.isCurrent && (
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">
                        ← Estás aquí
                      </span>
                    )}
                  </div>
                </div>

                {!post.isLocked && (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Tiempo total de lectura
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {Math.round(series.totalReadTime)} minutos
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-2xl overflow-hidden">
        {series.coverImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${series.coverImage})` }}
          />
        )}
        <div className="relative p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/90 uppercase tracking-wider">
              Serie de Artículos
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            {series.title}
          </h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl">
            {series.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="font-bold">{series.posts.length}</span>
              </div>
              <span className="text-sm">Artículos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-sm">{Math.round(series.totalReadTime)} min total</span>
            </div>
            {showProgress && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="font-bold">{Math.round(progress)}%</span>
                </div>
                <span className="text-sm">Completado</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Tu Progreso
            </h3>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {series.completedCount} de {series.posts.length} completados
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.posts.map((post, index) => (
          <button
            key={post.id}
            onClick={() => !post.isLocked && onPostClick?.(post.id)}
            disabled={post.isLocked}
            className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all text-left group ${
              post.isCurrent
                ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                : post.isCompleted
                ? 'border-green-500'
                : post.isLocked
                ? 'border-gray-200 dark:border-gray-700 opacity-60 cursor-not-allowed'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg'
            }`}
          >
            <div className="p-6">
              {/* Order badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                  post.isCompleted
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : post.isCurrent
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {post.isCompleted ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Completado
                    </span>
                  ) : post.isCurrent ? (
                    'En progreso'
                  ) : (
                    `Parte ${post.order}`
                  )}
                </div>
                {post.isLocked && (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Title */}
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {post.title}
              </h4>

              {/* Excerpt */}
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                {post.excerpt}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime} min
                </span>
                {!post.isLocked && (
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
