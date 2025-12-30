export interface FeedPost {
  id: string;
  type: 'achievement' | 'announcement' | 'course_completion' | 'discussion' | 'live_class';
  author: {
    name: string;
    avatar: string;
    title?: string;
  };
  content: string;
  image?: string;
  achievement?: {
    badge: string;
    title: string;
  };
  course?: {
    title: string;
    image: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

export const feedPosts: FeedPost[] = [
  {
    id: '1',
    type: 'achievement',
    author: {
      name: 'Sofía Ramírez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    },
    content: '¡Acabo de completar la Ruta de Desarrollo Web Full Stack! 🎉 Fueron 180 horas de aprendizaje intenso pero totalmente valió la pena.',
    achievement: {
      badge: '🏆',
      title: 'Full Stack Developer'
    },
    createdAt: '2025-12-21T14:30:00',
    likes: 156,
    comments: 23,
    shares: 8,
    isLiked: false
  },
  {
    id: '2',
    type: 'announcement',
    author: {
      name: 'Platzi Team',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Platzi',
      title: 'Equipo Platzi'
    },
    content: '🚀 Nuevo curso disponible: "Inteligencia Artificial Generativa con GPT-4". Aprende a crear aplicaciones potenciadas con IA.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    createdAt: '2025-12-21T12:00:00',
    likes: 342,
    comments: 67,
    shares: 45,
    isLiked: true
  },
  {
    id: '3',
    type: 'course_completion',
    author: {
      name: 'Pablo Méndez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pablo',
    },
    content: '¡Terminé el curso de Data Science con Python! Los proyectos prácticos fueron increíbles 📊',
    course: {
      title: 'Data Science con Python',
      image: 'https://images.unsplash.com/photo-1662638600476-d563fffbb072?w=400'
    },
    createdAt: '2025-12-21T10:15:00',
    likes: 89,
    comments: 12,
    shares: 3,
    isLiked: false
  },
  {
    id: '4',
    type: 'live_class',
    author: {
      name: 'Carlos Fernández',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      title: 'Instructor'
    },
    content: '🔴 LIVE en 1 hora: "Patrones de diseño en React". Nos vemos en el stream! 👨‍💻',
    createdAt: '2025-12-21T09:00:00',
    likes: 234,
    comments: 45,
    shares: 28,
    isLiked: true
  }
];