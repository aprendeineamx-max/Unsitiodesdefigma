export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  image: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  likes: number;
  comments: number;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Tendencias de Desarrollo Web para 2025',
    excerpt: 'Descubre las tecnologías y frameworks que están revolucionando el desarrollo web este año.',
    content: 'El desarrollo web evoluciona constantemente...',
    author: {
      name: 'Carlos Fernández',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      role: 'Senior Developer'
    },
    category: 'Desarrollo Web',
    image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjYyMzUyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    publishedAt: '2025-12-15',
    readTime: 8,
    tags: ['Web Development', 'Trends', 'Technology'],
    likes: 342,
    comments: 28
  },
  {
    id: '2',
    title: 'Cómo el Machine Learning está Cambiando las Empresas',
    excerpt: 'Explora casos de uso reales de ML en diferentes industrias y cómo puedes aplicarlo.',
    content: 'El machine learning ha dejado de ser ciencia ficción...',
    author: {
      name: 'Roberto González',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto',
      role: 'Data Scientist'
    },
    category: 'Data Science',
    image: 'https://images.unsplash.com/photo-1662638600476-d563fffbb072?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMHByb2dyYW1taW5nfGVufDF8fHx8MTc2NjI4MjQ2NHww&ixlib=rb-4.1.0&q=80&w=1080',
    publishedAt: '2025-12-18',
    readTime: 12,
    tags: ['Machine Learning', 'AI', 'Business'],
    likes: 521,
    comments: 45
  },
  {
    id: '3',
    title: 'Diseño UX: Principios que Todo Developer Debería Conocer',
    excerpt: 'Mejora tus aplicaciones entendiendo los fundamentos del diseño centrado en el usuario.',
    content: 'El diseño UX no es solo para diseñadores...',
    author: {
      name: 'Ana Martínez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      role: 'UX Designer'
    },
    category: 'Diseño',
    image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ258ZW58MXx8fHwxNzY2Mjc3ODQ0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    publishedAt: '2025-12-20',
    readTime: 6,
    tags: ['UX', 'Design', 'UI'],
    likes: 289,
    comments: 19
  }
];