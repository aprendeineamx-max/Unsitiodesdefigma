import { useState } from 'react';
import { Trophy, Star, Zap, Target, Award, TrendingUp, Flame, Coins, Clock, Users } from 'lucide-react';
import { userStats, badges, dailyChallenges, weeklyChallenges, leaderboard } from '../data/gamification';

export function GamificationPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'challenges' | 'leaderboard'>('overview');

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600';
      case 'rare': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'epic': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700';
      case 'legendary': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const xpPercentage = (userStats.xp / userStats.xpToNextLevel) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2 text-gray-900 dark:text-white">Gamificación</h1>
          <p className="text-gray-600 dark:text-gray-400">Tu progreso, logros y recompensas</p>
        </div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Level Card */}
          <div className="bg-gradient-to-br from-[#98ca3f] to-[#7ab32f] text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8" />
              <span className="text-3xl">Nivel {userStats.level}</span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progreso</span>
                <span>{userStats.xp}/{userStats.xpToNextLevel} XP</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>
            <p className="text-sm opacity-90">{userStats.xpToNextLevel - userStats.xp} XP para subir de nivel</p>
          </div>

          {/* Streak Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border-2 border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-orange-500" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.streak}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Racha actual</p>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-4 h-4" />
              Máxima: {userStats.longestStreak} días
            </div>
          </div>

          {/* Coins Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border-2 border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center justify-between mb-4">
              <Coins className="w-8 h-8 text-yellow-500" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.coins}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Monedas</p>
            <button className="text-sm text-[#98ca3f] hover:underline">
              Ver tienda →
            </button>
          </div>

          {/* Rank Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border-2 border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">#{userStats.rank}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Posición global</p>
            <button className="text-sm text-[#98ca3f] hover:underline">
              Ver ranking →
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.coursesCompleted}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cursos completados</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.lessonsCompleted}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lecciones completadas</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.floor(userStats.totalStudyTime / 60)}h</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo de estudio</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-1 p-2">
              {[
                { id: 'overview', label: 'Resumen', icon: Star },
                { id: 'badges', label: 'Insignias', icon: Award },
                { id: 'challenges', label: 'Retos', icon: Target },
                { id: 'leaderboard', label: 'Clasificación', icon: Trophy }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#98ca3f] text-[#121f3d]'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl mb-4 text-gray-900 dark:text-white">Últimos logros</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {badges.filter(b => b.earnedAt).slice(0, 4).map((badge) => (
                      <div key={badge.id} className={`border-2 rounded-lg p-4 ${getRarityColor(badge.rarity)}`}>
                        <div className="flex items-start gap-3">
                          <div className="text-4xl">{badge.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{badge.name}</h4>
                            <p className="text-sm opacity-80 mb-2">{badge.description}</p>
                            <span className="text-xs font-medium uppercase">{badge.rarity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl mb-4 text-gray-900 dark:text-white">Retos diarios</h3>
                  <div className="space-y-3">
                    {dailyChallenges.map((challenge) => (
                      <div key={challenge.id} className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">{challenge.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{challenge.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Zap className="w-4 h-4 text-[#98ca3f]" />
                            <span className="font-medium text-gray-900 dark:text-white">+{challenge.reward.xp} XP</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                            <span className="font-medium text-gray-900 dark:text-white">{challenge.progress}/{challenge.goal}</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                challenge.isCompleted ? 'bg-green-500' : 'bg-[#98ca3f]'
                              }`}
                              style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'badges' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl text-gray-900 dark:text-white">
                    Insignias ({badges.filter(b => b.earnedAt).length}/{badges.length})
                  </h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Todas
                    </button>
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Obtenidas
                    </button>
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Bloqueadas
                    </button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge) => (
                    <div 
                      key={badge.id} 
                      className={`border-2 rounded-lg p-4 transition-all ${
                        badge.earnedAt 
                          ? getRarityColor(badge.rarity)
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                      }`}
                    >
                      <div className="text-center mb-3">
                        <div className="text-5xl mb-2 grayscale-0">{badge.icon}</div>
                        <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">{badge.name}</h4>
                        <p className="text-xs opacity-80 mb-2">{badge.description}</p>
                        <span className="text-xs font-medium uppercase px-2 py-1 bg-white/50 dark:bg-black/30 rounded">
                          {badge.rarity}
                        </span>
                      </div>
                      {!badge.earnedAt && badge.progress !== undefined && (
                        <div className="mt-3">
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#98ca3f] rounded-full"
                              style={{ width: `${(badge.progress / badge.requirement) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400">
                            {badge.progress}/{badge.requirement}
                          </p>
                        </div>
                      )}
                      {badge.earnedAt && (
                        <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-2">
                          Obtenida: {new Date(badge.earnedAt).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'challenges' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl mb-4 text-gray-900 dark:text-white">Retos Diarios</h3>
                  <div className="space-y-3">
                    {dailyChallenges.map((challenge) => (
                      <div key={challenge.id} className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-[#98ca3f] transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{challenge.title}</h4>
                              {challenge.isCompleted && (
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded">
                                  ✓ Completado
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{challenge.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm font-medium text-[#98ca3f]">
                              <Zap className="w-4 h-4" />
                              {challenge.reward.xp} XP
                            </div>
                            {challenge.reward.coins && (
                              <div className="flex items-center gap-1 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                <Coins className="w-4 h-4" />
                                {challenge.reward.coins}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                            <span className="font-medium text-gray-900 dark:text-white">{challenge.progress}/{challenge.goal}</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                challenge.isCompleted ? 'bg-green-500' : 'bg-[#98ca3f]'
                              }`}
                              style={{ width: `${Math.min((challenge.progress / challenge.goal) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl mb-4 text-gray-900 dark:text-white">Retos Semanales</h3>
                  <div className="space-y-3">
                    {weeklyChallenges.map((challenge) => (
                      <div key={challenge.id} className="border-2 border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{challenge.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{challenge.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm font-medium text-[#98ca3f]">
                              <Zap className="w-4 h-4" />
                              {challenge.reward.xp} XP
                            </div>
                            {challenge.reward.coins && (
                              <div className="flex items-center gap-1 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                <Coins className="w-4 h-4" />
                                {challenge.reward.coins}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                            <span className="font-medium text-gray-900 dark:text-white">{challenge.progress}/{challenge.goal}</span>
                          </div>
                          <div className="h-2.5 bg-white dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all"
                              style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl text-gray-900 dark:text-white">Clasificación Global</h3>
                  <select className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-[#98ca3f]">
                    <option>Esta semana</option>
                    <option>Este mes</option>
                    <option>Todo el tiempo</option>
                  </select>
                </div>

                <div className="space-y-3">
                  {/* Top 3 Podium */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {leaderboard.slice(0, 3).map((user, index) => (
                      <div 
                        key={user.rank}
                        className={`text-center p-4 rounded-xl ${
                          index === 0 ? 'bg-gradient-to-b from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 border-2 border-yellow-300 dark:border-yellow-700' :
                          index === 1 ? 'bg-gradient-to-b from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-300 dark:border-gray-600' :
                          'bg-gradient-to-b from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 border-2 border-orange-300 dark:border-orange-700'
                        }`}
                      >
                        <div className="text-3xl mb-2">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <img 
                          src={user.avatar}
                          alt={user.name}
                          className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-white dark:border-gray-700"
                        />
                        <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">{user.name}</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>Nivel {user.level}</p>
                          <p className="font-medium text-[#98ca3f]">{user.xp.toLocaleString()} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Rest of leaderboard */}
                  {leaderboard.slice(3).map((user) => (
                    <div key={user.rank} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-4 hover:border-[#98ca3f] transition-colors">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                        #{user.rank}
                      </div>
                      <img 
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{user.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Nivel {user.level}</span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            {user.streak}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-purple-500" />
                            {user.badges}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-[#98ca3f]">{user.xp.toLocaleString()}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">XP Total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
