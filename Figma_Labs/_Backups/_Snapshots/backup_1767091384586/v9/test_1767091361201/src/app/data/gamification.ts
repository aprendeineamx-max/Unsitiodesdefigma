export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'learning' | 'social' | 'achievement' | 'special';
  earnedAt?: string;
  progress?: number;
  requirement: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  badge?: Badge;
  completedAt?: string;
  isCompleted: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  reward: {
    xp: number;
    coins?: number;
    badge?: string;
  };
  progress: number;
  goal: number;
  expiresAt: string;
  isCompleted: boolean;
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  coins: number;
  streak: number;
  longestStreak: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  totalStudyTime: number; // in minutes
  rank: number;
  badges: Badge[];
  achievements: Achievement[];
}

export const badges: Badge[] = [
  {
    id: 'first-course',
    name: 'Primer Paso',
    description: 'Completa tu primer curso',
    icon: '🎓',
    rarity: 'common',
    category: 'learning',
    requirement: 1,
    earnedAt: '2025-12-01',
    progress: 1
  },
  {
    id: 'five-courses',
    name: 'Estudiante Dedicado',
    description: 'Completa 5 cursos',
    icon: '📚',
    rarity: 'rare',
    category: 'learning',
    requirement: 5,
    progress: 3
  },
  {
    id: 'ten-courses',
    name: 'Maestro del Aprendizaje',
    description: 'Completa 10 cursos',
    icon: '🏆',
    rarity: 'epic',
    category: 'learning',
    requirement: 10,
    progress: 3
  },
  {
    id: 'early-bird',
    name: 'Madrugador',
    description: 'Estudia antes de las 7 AM',
    icon: '🌅',
    rarity: 'rare',
    category: 'achievement',
    requirement: 1,
    earnedAt: '2025-12-15',
    progress: 1
  },
  {
    id: 'night-owl',
    name: 'Búho Nocturno',
    description: 'Estudia después de las 11 PM',
    icon: '🦉',
    rarity: 'rare',
    category: 'achievement',
    requirement: 1,
    progress: 0
  },
  {
    id: 'week-streak',
    name: 'Racha Semanal',
    description: 'Mantén una racha de 7 días',
    icon: '🔥',
    rarity: 'epic',
    category: 'achievement',
    requirement: 7,
    earnedAt: '2025-12-20',
    progress: 7
  },
  {
    id: 'month-streak',
    name: 'Imparable',
    description: 'Mantén una racha de 30 días',
    icon: '⚡',
    rarity: 'legendary',
    category: 'achievement',
    requirement: 30,
    progress: 12
  },
  {
    id: 'helpful',
    name: 'Compañero Útil',
    description: 'Ayuda a 10 estudiantes en el foro',
    icon: '🤝',
    rarity: 'rare',
    category: 'social',
    requirement: 10,
    progress: 5
  },
  {
    id: 'influencer',
    name: 'Influencer Educativo',
    description: 'Consigue 100 seguidores',
    icon: '⭐',
    rarity: 'epic',
    category: 'social',
    requirement: 100,
    progress: 42
  },
  {
    id: 'speedrunner',
    name: 'Velocista',
    description: 'Completa un curso en 24 horas',
    icon: '⚡',
    rarity: 'legendary',
    category: 'achievement',
    requirement: 1,
    progress: 0
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Obtén 100% en 5 exámenes',
    icon: '💯',
    rarity: 'epic',
    category: 'achievement',
    requirement: 5,
    progress: 2
  },
  {
    id: 'polyglot',
    name: 'Políglota Digital',
    description: 'Completa cursos en 3 categorías diferentes',
    icon: '🌐',
    rarity: 'rare',
    category: 'learning',
    requirement: 3,
    earnedAt: '2025-12-10',
    progress: 3
  }
];

export const dailyChallenges: Challenge[] = [
  {
    id: 'dc1',
    title: 'Estudia 30 minutos',
    description: 'Completa al menos 30 minutos de estudio hoy',
    type: 'daily',
    reward: { xp: 50, coins: 10 },
    progress: 25,
    goal: 30,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isCompleted: false
  },
  {
    id: 'dc2',
    title: 'Completa una lección',
    description: 'Termina cualquier lección de tus cursos activos',
    type: 'daily',
    reward: { xp: 25, coins: 5 },
    progress: 1,
    goal: 1,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isCompleted: true
  },
  {
    id: 'dc3',
    title: 'Participa en el foro',
    description: 'Publica o responde en el foro comunitario',
    type: 'daily',
    reward: { xp: 30, coins: 8 },
    progress: 0,
    goal: 1,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isCompleted: false
  }
];

export const weeklyChallenges: Challenge[] = [
  {
    id: 'wc1',
    title: 'Maratón de Aprendizaje',
    description: 'Estudia 5 horas esta semana',
    type: 'weekly',
    reward: { xp: 300, coins: 50, badge: 'marathon-badge' },
    progress: 180,
    goal: 300,
    expiresAt: new Date(Date.now() + 604800000).toISOString(),
    isCompleted: false
  },
  {
    id: 'wc2',
    title: 'Racha Perfecta',
    description: 'Mantén tu racha todos los días de la semana',
    type: 'weekly',
    reward: { xp: 200, coins: 40 },
    progress: 5,
    goal: 7,
    expiresAt: new Date(Date.now() + 604800000).toISOString(),
    isCompleted: false
  },
  {
    id: 'wc3',
    title: 'Maestro Social',
    description: 'Ayuda a 5 compañeros esta semana',
    type: 'weekly',
    reward: { xp: 150, coins: 30 },
    progress: 2,
    goal: 5,
    expiresAt: new Date(Date.now() + 604800000).toISOString(),
    isCompleted: false
  }
];

export const userStats: UserStats = {
  level: 12,
  xp: 2450,
  xpToNextLevel: 3000,
  totalXP: 14450,
  coins: 450,
  streak: 12,
  longestStreak: 28,
  coursesCompleted: 8,
  lessonsCompleted: 124,
  totalStudyTime: 2340, // 39 hours
  rank: 156,
  badges: badges.filter(b => b.earnedAt),
  achievements: []
};

export const leaderboard = [
  {
    rank: 1,
    name: 'Carlos Méndez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos1',
    level: 24,
    xp: 28500,
    streak: 45,
    badges: 28
  },
  {
    rank: 2,
    name: 'Ana López',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana1',
    level: 22,
    xp: 26100,
    streak: 38,
    badges: 24
  },
  {
    rank: 3,
    name: 'Roberto Silva',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto1',
    level: 21,
    xp: 24800,
    streak: 52,
    badges: 26
  },
  {
    rank: 4,
    name: 'Laura Gómez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura1',
    level: 19,
    xp: 22400,
    streak: 31,
    badges: 22
  },
  {
    rank: 5,
    name: 'Miguel Torres',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel1',
    level: 18,
    xp: 21200,
    streak: 27,
    badges: 20
  }
];