import { useState } from 'react';
import {
  Award,
  Trophy,
  Star,
  Crown,
  Zap,
  Heart,
  MessageCircle,
  BookOpen,
  Users,
  TrendingUp,
  Flame,
  Target,
  CheckCircle,
  Lock,
  Info,
  Sparkles
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconComponent: React.ReactNode;
  color: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  category: 'author' | 'reader' | 'community' | 'achievement';
  requirement: string;
  progress?: number; // 0-100
  earned: boolean;
  earnedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface CommunityBadgesProps {
  badges: Badge[];
  userLevel?: number;
  userPoints?: number;
  variant?: 'profile' | 'showcase' | 'progress';
  showLocked?: boolean;
  onBadgeClick?: (badgeId: string) => void;
}

export function CommunityBadges({
  badges,
  userLevel = 1,
  userPoints = 0,
  variant = 'showcase',
  showLocked = true,
  onBadgeClick
}: CommunityBadgesProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'author' | 'reader' | 'community' | 'achievement'>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const tierColors = {
    bronze: { bg: 'from-amber-700 to-orange-800', text: 'text-amber-700 dark:text-amber-400' },
    silver: { bg: 'from-gray-400 to-gray-600', text: 'text-gray-600 dark:text-gray-400' },
    gold: { bg: 'from-yellow-400 to-yellow-600', text: 'text-yellow-600 dark:text-yellow-400' },
    platinum: { bg: 'from-cyan-400 to-blue-600', text: 'text-cyan-600 dark:text-cyan-400' },
    diamond: { bg: 'from-purple-500 to-pink-600', text: 'text-purple-600 dark:text-purple-400' }
  };

  const rarityConfig = {
    common: { label: 'Común', color: 'gray', glow: false },
    rare: { label: 'Raro', color: 'blue', glow: false },
    epic: { label: 'Épico', color: 'purple', glow: true },
    legendary: { label: 'Legendario', color: 'orange', glow: true }
  };

  const categoryIcons = {
    author: BookOpen,
    reader: Star,
    community: Users,
    achievement: Trophy
  };

  const filteredBadges = selectedCategory === 'all'
    ? badges
    : badges.filter(b => b.category === selectedCategory);

  const earnedBadges = badges.filter(b => b.earned);
  const inProgressBadges = badges.filter(b => !b.earned && b.progress && b.progress > 0);
  const lockedBadges = badges.filter(b => !b.earned && (!b.progress || b.progress === 0));

  const stats = {
    total: badges.length,
    earned: earnedBadges.length,
    inProgress: inProgressBadges.length,
    completion: Math.round((earnedBadges.length / badges.length) * 100)
  };

  if (variant === 'profile') {
    // Compact view for profile pages
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">Insignias</h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {stats.earned} / {stats.total}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {earnedBadges.slice(0, 6).map((badge) => {
            const tierColor = tierColors[badge.tier];
            return (
              <button
                key={badge.id}
                onClick={() => onBadgeClick?.(badge.id)}
                className="group relative"
                title={badge.name}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${tierColor.bg} shadow-lg hover:scale-110 transition-transform`}
                >
                  {badge.icon}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {badge.name}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
                </div>
              </button>
            );
          })}
          {earnedBadges.length > 6 && (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-bold text-sm">
              +{earnedBadges.length - 6}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'progress') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A2540] to-[#0F3554] rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-[#98CA3F]" />
                <h2 className="text-2xl font-bold">Progreso de Insignias</h2>
              </div>
              <p className="text-white/80">Completa desafíos para desbloquear insignias</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{stats.completion}%</div>
              <div className="text-sm text-white/80">Completado</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#98CA3F] to-[#7fb32f] rounded-full transition-all duration-500"
              style={{ width: `${stats.completion}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {stats.earned}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Desbloqueadas</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {stats.inProgress}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">En Progreso</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-1">
              {lockedBadges.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bloqueadas</div>
          </div>
        </div>

        {/* In Progress Badges */}
        {inProgressBadges.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">En Progreso</h3>
            <div className="space-y-3">
              {inProgressBadges.map((badge) => {
                const tierColor = tierColors[badge.tier];
                return (
                  <div
                    key={badge.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br ${tierColor.bg} flex-shrink-0`}
                      >
                        {badge.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {badge.name}
                          </h4>
                          <span className={`text-xs font-semibold ${tierColor.text}`}>
                            {badge.tier.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {badge.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {badge.progress}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#98CA3F] rounded-full transition-all duration-500"
                              style={{ width: `${badge.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {badge.requirement}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Showcase variant (default)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-6 h-6 text-[#98CA3F]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Insignias de la Comunidad
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {stats.earned} de {stats.total} insignias desbloqueadas
          </p>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#98CA3F] text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Todas ({badges.length})
        </button>
        {(['author', 'reader', 'community', 'achievement'] as const).map((category) => {
          const Icon = categoryIcons[category];
          const count = badges.filter(b => b.category === category).length;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-[#98CA3F] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="capitalize">{category === 'author' ? 'Autor' : category === 'reader' ? 'Lector' : category === 'community' ? 'Comunidad' : 'Logros'}</span>
              <span className="text-xs">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredBadges
          .filter(badge => badge.earned || showLocked)
          .map((badge) => {
            const tierColor = tierColors[badge.tier];
            const rarityInfo = rarityConfig[badge.rarity];

            return (
              <div
                key={badge.id}
                className={`group relative ${
                  badge.earned
                    ? 'cursor-pointer'
                    : 'opacity-60'
                }`}
                onClick={() => badge.earned && onBadgeClick?.(badge.id)}
              >
                <div
                  className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-4 transition-all ${
                    badge.earned
                      ? `border-transparent hover:border-[#98CA3F] hover:shadow-xl ${
                          rarityInfo.glow ? 'hover:shadow-[#98CA3F]/50' : ''
                        }`
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Icon */}
                  <div className="relative mb-3">
                    <div
                      className={`w-20 h-20 mx-auto rounded-xl flex items-center justify-center text-4xl bg-gradient-to-br ${tierColor.bg} shadow-lg ${
                        badge.earned ? 'group-hover:scale-110' : 'grayscale'
                      } transition-all`}
                    >
                      {badge.earned ? badge.icon : <Lock className="w-8 h-8 text-white" />}
                    </div>

                    {/* Rarity indicator */}
                    {badge.earned && rarityInfo.glow && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h4 className={`font-bold text-center mb-1 ${
                    badge.earned ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {badge.name}
                  </h4>

                  {/* Tier badge */}
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className={`text-xs font-semibold ${tierColor.text}`}>
                      {badge.tier.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {badge.points} pts
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center line-clamp-2 mb-2">
                    {badge.description}
                  </p>

                  {/* Earned date or progress */}
                  {badge.earned && badge.earnedAt ? (
                    <p className="text-xs text-center text-[#98CA3F] font-semibold">
                      Desbloqueado {new Date(badge.earnedAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  ) : badge.progress !== undefined && badge.progress > 0 ? (
                    <div className="space-y-1">
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#98CA3F] rounded-full"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-center text-gray-500">
                        {badge.progress}% completado
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-center text-gray-500">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Bloqueado
                    </p>
                  )}

                  {/* Hover details */}
                  {badge.earned && (
                    <div className="absolute inset-0 bg-black/90 rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <h4 className="font-bold text-center mb-2">{badge.name}</h4>
                      <p className="text-xs text-center text-white/80 mb-3">
                        {badge.description}
                      </p>
                      <div className="text-xs text-white/60 text-center">
                        {badge.requirement}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Niveles de Insignias
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(tierColors).map(([tier, colors]) => (
            <div key={tier} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.bg}`} />
              <span className={`text-sm font-medium capitalize ${colors.text}`}>
                {tier === 'bronze' ? 'Bronce' : tier === 'silver' ? 'Plata' : tier === 'gold' ? 'Oro' : tier === 'platinum' ? 'Platino' : 'Diamante'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
