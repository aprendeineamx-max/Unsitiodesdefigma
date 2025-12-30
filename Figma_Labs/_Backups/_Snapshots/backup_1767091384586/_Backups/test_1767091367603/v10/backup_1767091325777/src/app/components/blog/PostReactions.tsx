import { useState, useEffect } from 'react';
import {
  Heart,
  ThumbsUp,
  Lightbulb,
  Flame,
  Rocket,
  Star,
  Trophy,
  Zap,
  Smile,
  PartyPopper
} from 'lucide-react';

interface Reaction {
  id: string;
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  count: number;
  userReacted: boolean;
}

interface PostReactionsProps {
  postId: string;
  reactions: Array<{
    type: string;
    count: number;
    userReacted: boolean;
  }>;
  onReact?: (reactionType: string) => void;
  variant?: 'compact' | 'expanded' | 'floating';
  showLabels?: boolean;
  showCounts?: boolean;
  maxVisible?: number;
}

export function PostReactions({
  postId,
  reactions: initialReactions,
  onReact,
  variant = 'expanded',
  showLabels = true,
  showCounts = true,
  maxVisible = 6
}: PostReactionsProps) {
  const [showAll, setShowAll] = useState(false);
  const [animatingReaction, setAnimatingReaction] = useState<string | null>(null);
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);

  const allReactionTypes = [
    { type: 'like', label: 'Me gusta', icon: Heart, color: '#EF4444' },
    { type: 'love', label: 'Me encanta', icon: Heart, color: '#EC4899' },
    { type: 'thumbsup', label: 'Útil', icon: ThumbsUp, color: '#3B82F6' },
    { type: 'insightful', label: 'Interesante', icon: Lightbulb, color: '#F59E0B' },
    { type: 'fire', label: 'Increíble', icon: Flame, color: '#F97316' },
    { type: 'rocket', label: 'Wow', icon: Rocket, color: '#8B5CF6' },
    { type: 'star', label: 'Favorito', icon: Star, color: '#FBBF24' },
    { type: 'trophy', label: 'Excelente', icon: Trophy, color: '#10B981' },
    { type: 'zap', label: 'Rápido', icon: Zap, color: '#EAB308' },
    { type: 'celebrate', label: 'Celebrar', icon: PartyPopper, color: '#EC4899' }
  ];

  const reactions: Reaction[] = allReactionTypes.map(rt => {
    const found = initialReactions.find(r => r.type === rt.type);
    const Icon = rt.icon;
    return {
      id: rt.type,
      type: rt.type,
      label: rt.label,
      icon: <Icon className="w-full h-full" />,
      color: rt.color,
      count: found?.count || 0,
      userReacted: found?.userReacted || false
    };
  });

  const handleReact = (reactionType: string) => {
    setAnimatingReaction(reactionType);
    onReact?.(reactionType);
    
    // Remove animation after 600ms
    setTimeout(() => {
      setAnimatingReaction(null);
    }, 600);
  };

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);
  const userReactions = reactions.filter(r => r.userReacted);
  const topReactions = [...reactions].sort((a, b) => b.count - a.count).slice(0, 3);

  const visibleReactions = showAll ? reactions : reactions.slice(0, maxVisible);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        {/* Top 3 reactions with counts */}
        <div className="flex items-center -space-x-2">
          {topReactions.filter(r => r.count > 0).map((reaction) => (
            <div
              key={reaction.id}
              className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm"
              style={{ backgroundColor: `${reaction.color}20` }}
              title={reaction.label}
            >
              <div className="w-5 h-5" style={{ color: reaction.color }}>
                {reaction.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Total count */}
        {totalReactions > 0 && (
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {totalReactions}
          </span>
        )}

        {/* Add reaction button */}
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
          title="Reaccionar"
        >
          <Smile className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
        </button>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            Reacciones
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {totalReactions} {totalReactions === 1 ? 'reacción' : 'reacciones'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {visibleReactions.map((reaction) => (
            <button
              key={reaction.id}
              onClick={() => handleReact(reaction.type)}
              onMouseEnter={() => setHoveredReaction(reaction.id)}
              onMouseLeave={() => setHoveredReaction(null)}
              className={`flex items-center gap-2 p-2.5 rounded-lg transition-all ${
                reaction.userReacted
                  ? 'ring-2 shadow-sm'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${
                animatingReaction === reaction.id ? 'animate-bounce' : ''
              }`}
              style={{
                backgroundColor: reaction.userReacted ? `${reaction.color}10` : 'transparent',
                ringColor: reaction.userReacted ? reaction.color : 'transparent'
              }}
            >
              <div
                className={`w-6 h-6 transition-transform ${
                  hoveredReaction === reaction.id ? 'scale-125' : 'scale-100'
                }`}
                style={{ color: reaction.color }}
              >
                {reaction.icon}
              </div>
              {showCounts && reaction.count > 0 && (
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {reaction.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {reactions.length > maxVisible && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-2 px-3 py-2 text-sm font-medium text-[#98CA3F] hover:bg-[#98CA3F]/10 rounded-lg transition-colors"
          >
            {showAll ? 'Ver menos' : `Ver más (${reactions.length - maxVisible})`}
          </button>
        )}
      </div>
    );
  }

  // Expanded variant (default)
  return (
    <div className="space-y-4">
      {/* Summary */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800 dark:to-transparent rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center -space-x-2">
            {topReactions.filter(r => r.count > 0).slice(0, 5).map((reaction) => (
              <div
                key={reaction.id}
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-md transition-transform hover:scale-110 hover:z-10"
                style={{ backgroundColor: reaction.color }}
              >
                <div className="w-6 h-6 text-white">
                  {reaction.icon}
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {totalReactions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {totalReactions === 1 ? 'reacción' : 'reacciones'}
            </div>
          </div>
        </div>
      )}

      {/* Reaction grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          ¿Cómo te hace sentir este artículo?
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {visibleReactions.map((reaction) => (
            <button
              key={reaction.id}
              onClick={() => handleReact(reaction.type)}
              onMouseEnter={() => setHoveredReaction(reaction.id)}
              onMouseLeave={() => setHoveredReaction(null)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                reaction.userReacted
                  ? 'ring-2 shadow-lg scale-105'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105'
              } ${
                animatingReaction === reaction.id ? 'animate-bounce' : ''
              }`}
              style={{
                backgroundColor: reaction.userReacted ? `${reaction.color}15` : 'transparent',
                ringColor: reaction.userReacted ? reaction.color : 'transparent'
              }}
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 transition-all ${
                  hoveredReaction === reaction.id ? 'scale-125' : 'scale-100'
                }`}
                style={{ color: reaction.color }}
              >
                {reaction.icon}
              </div>

              {/* Label */}
              {showLabels && (
                <span className={`text-xs font-medium text-center ${
                  reaction.userReacted
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {reaction.label}
                </span>
              )}

              {/* Count */}
              {showCounts && reaction.count > 0 && (
                <span
                  className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-md"
                  style={{ backgroundColor: reaction.color }}
                >
                  {reaction.count > 99 ? '99+' : reaction.count}
                </span>
              )}

              {/* User reacted indicator */}
              {reaction.userReacted && (
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: reaction.color }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Show more/less */}
        {reactions.length > maxVisible && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
            >
              {showAll ? 'Ver menos reacciones' : `Ver ${reactions.length - maxVisible} más reacciones`}
            </button>
          </div>
        )}
      </div>

      {/* User's reactions summary */}
      {userReactions.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            <span className="font-semibold">Tus reacciones: </span>
            {userReactions.map((r, i) => (
              <span key={r.id}>
                {i > 0 && ', '}
                {r.label}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Breakdown */}
      {totalReactions > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Desglose de reacciones
          </h4>
          {reactions
            .filter(r => r.count > 0)
            .sort((a, b) => b.count - a.count)
            .map((reaction) => {
              const percentage = (reaction.count / totalReactions) * 100;
              return (
                <div key={reaction.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5" style={{ color: reaction.color }}>
                        {reaction.icon}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{reaction.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {reaction.count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: reaction.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
