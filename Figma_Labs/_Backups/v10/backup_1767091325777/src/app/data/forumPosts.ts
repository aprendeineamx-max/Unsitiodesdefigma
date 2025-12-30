export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    level: number;
  };
  category: string;
  tags: string[];
  createdAt: string;
  replies: number;
  views: number;
  likes: number;
  solved: boolean;
  pinned: boolean;
}

export const forumPosts: ForumPost[] = [
  {
    id: '1',
    title: '¿Cómo optimizar el rendimiento de React en aplicaciones grandes?',
    content: 'Estoy trabajando en una aplicación con muchos componentes y noto que se vuelve lenta. ¿Qué técnicas recomiendan?',
    author: {
      name: 'Diego López',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
      level: 5
    },
    category: 'Desarrollo Web',
    tags: ['React', 'Performance', 'Optimization'],
    createdAt: '2025-12-21T10:30:00',
    replies: 15,
    views: 342,
    likes: 28,
    solved: true,
    pinned: false
  },
  {
    id: '2',
    title: 'Diferencia entre supervised y unsupervised learning',
    content: '¿Alguien puede explicar con ejemplos prácticos la diferencia entre estos dos tipos de ML?',
    author: {
      name: 'María Silva',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      level: 3
    },
    category: 'Data Science',
    tags: ['Machine Learning', 'AI', 'Concepts'],
    createdAt: '2025-12-21T09:15:00',
    replies: 8,
    views: 156,
    likes: 12,
    solved: false,
    pinned: false
  },
  {
    id: '3',
    title: '📌 Recursos gratuitos para aprender diseño UI/UX',
    content: 'Hola comunidad! Comparto una lista curada de recursos gratuitos que me han ayudado mucho...',
    author: {
      name: 'Laura Gómez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
      level: 8
    },
    category: 'Diseño',
    tags: ['UX', 'UI', 'Resources', 'Free'],
    createdAt: '2025-12-20T16:45:00',
    replies: 42,
    views: 892,
    likes: 156,
    solved: false,
    pinned: true
  }
];