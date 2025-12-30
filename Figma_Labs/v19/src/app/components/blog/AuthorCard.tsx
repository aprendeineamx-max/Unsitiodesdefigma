import { useState } from 'react';
import {
  User,
  MapPin,
  Link as LinkIcon,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Check,
  Users,
  FileText,
  Award,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AuthorStats {
  postsCount: number;
  followersCount: number;
  totalViews: number;
  totalLikes: number;
  joinedDate: string;
  specialties?: string[];
  achievements?: Array<{
    id: string;
    title: string;
    icon: string;
    description: string;
  }>;
}

interface AuthorCardProps {
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    bio: string;
    location?: string;
    website?: string;
    social?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
      email?: string;
    };
    verified?: boolean;
  };
  stats?: AuthorStats;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onViewProfile?: () => void;
  variant?: 'compact' | 'full' | 'sidebar';
  showStats?: boolean;
}

export function AuthorCard({
  author,
  stats,
  isFollowing = false,
  onFollow,
  onUnfollow,
  onViewProfile,
  variant = 'full',
  showStats = true
}: AuthorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <img
          src={author.avatar}
          alt={author.name}
          className="w-12 h-12 rounded-full ring-2 ring-white dark:ring-gray-700"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {author.name}
            </h4>
            {author.verified && (
              <Check className="w-4 h-4 text-blue-500 bg-white dark:bg-gray-800 rounded-full p-0.5" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{author.role}</p>
        </div>
        <button
          onClick={isFollowing ? onUnfollow : onFollow}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isFollowing
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              : 'bg-[#98CA3F] text-white hover:bg-[#7fb32f]'
          }`}
        >
          {isFollowing ? 'Siguiendo' : 'Seguir'}
        </button>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-[#0A2540] to-[#0F3554]">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-20 h-20 rounded-full ring-4 ring-white/20"
              />
              {author.verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
            <h3 className="font-bold text-white text-lg mb-1">{author.name}</h3>
            <p className="text-sm text-white/80">{author.role}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {author.bio}
          </p>
        </div>

        {/* Stats */}
        {showStats && stats && (
          <div className="p-4 grid grid-cols-2 gap-4 border-b border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.postsCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Artículos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.followersCount >= 1000
                  ? `${(stats.followersCount / 1000).toFixed(1)}k`
                  : stats.followersCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Seguidores</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 space-y-2">
          <button
            onClick={isFollowing ? onUnfollow : onFollow}
            className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all ${
              isFollowing
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                : 'bg-[#98CA3F] text-white hover:bg-[#7fb32f]'
            }`}
          >
            {isFollowing ? 'Siguiendo' : 'Seguir'}
          </button>
          <button
            onClick={onViewProfile}
            className="w-full px-4 py-2.5 rounded-lg font-medium border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Ver Perfil
          </button>
        </div>

        {/* Social */}
        {author.social && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2">
              {author.social.twitter && (
                <a
                  href={`https://twitter.com/${author.social.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Twitter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </a>
              )}
              {author.social.linkedin && (
                <a
                  href={author.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Linkedin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </a>
              )}
              {author.social.github && (
                <a
                  href={`https://github.com/${author.social.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Github className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </a>
              )}
              {author.social.email && (
                <a
                  href={`mailto:${author.social.email}`}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </a>
              )}
              {author.website && (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <LinkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Cover gradient */}
      <div className="h-32 bg-gradient-to-r from-[#0A2540] via-[#0F3554] to-[#98CA3F]" />

      {/* Profile section */}
      <div className="px-8 pb-8 -mt-16">
        {/* Avatar */}
        <div className="flex items-end justify-between mb-6">
          <div className="relative">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-32 h-32 rounded-2xl ring-4 ring-white dark:ring-gray-900 shadow-xl"
            />
            {author.verified && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-900 shadow-lg">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Follow button */}
          <button
            onClick={isFollowing ? onUnfollow : onFollow}
            className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
              isFollowing
                ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                : 'bg-[#98CA3F] text-white hover:bg-[#7fb32f] hover:shadow-xl'
            }`}
          >
            {isFollowing ? (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Siguiendo
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Seguir
              </span>
            )}
          </button>
        </div>

        {/* Name & role */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {author.name}
            </h2>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">{author.role}</p>
        </div>

        {/* Bio */}
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          {author.bio}
        </p>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
          {author.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{author.location}</span>
            </div>
          )}
          {author.website && (
            <a
              href={author.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#98CA3F] transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Website</span>
            </a>
          )}
          {stats?.joinedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Desde {new Date(stats.joinedDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Stats grid */}
        {showStats && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-[#98CA3F]" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Artículos</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.postsCount}
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Seguidores</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.followersCount >= 1000
                  ? `${(stats.followersCount / 1000).toFixed(1)}k`
                  : stats.followersCount}
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Vistas</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalViews >= 1000
                  ? `${(stats.totalViews / 1000).toFixed(1)}k`
                  : stats.totalViews}
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Likes</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalLikes >= 1000
                  ? `${(stats.totalLikes / 1000).toFixed(1)}k`
                  : stats.totalLikes}
              </div>
            </div>
          </div>
        )}

        {/* Specialties */}
        {stats?.specialties && stats.specialties.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Especialidades</h3>
            <div className="flex flex-wrap gap-2">
              {stats.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="px-3 py-1.5 bg-[#98CA3F]/10 text-[#98CA3F] rounded-full text-sm font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {stats?.achievements && stats.achievements.length > 0 && (
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between py-3 font-semibold text-gray-900 dark:text-white hover:text-[#98CA3F] transition-colors"
            >
              <span>Logros ({stats.achievements.length})</span>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            
            {isExpanded && (
              <div className="space-y-3 pb-4">
                {stats.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{achievement.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Social links */}
        {author.social && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {author.social.twitter && (
                <a
                  href={`https://twitter.com/${author.social.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <Twitter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </a>
              )}
              {author.social.linkedin && (
                <a
                  href={author.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </a>
              )}
              {author.social.github && (
                <a
                  href={`https://github.com/${author.social.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </a>
              )}
              {author.social.email && (
                <a
                  href={`mailto:${author.social.email}`}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-[#98CA3F] dark:hover:border-[#98CA3F] hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                >
                  <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </a>
              )}
              {author.website && (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                >
                  <LinkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
