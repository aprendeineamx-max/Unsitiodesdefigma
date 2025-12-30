export interface StudyGroupMember {
  id: string;
  name: string;
  avatar: string;
  role: 'student' | 'tutor' | 'admin';
  joinedAt: string;
  contributions: number;
}

export interface StudyGroupSession {
  id: string;
  title: string;
  date: string;
  duration: number;
  type: 'video_call' | 'chat' | 'workshop';
  tutor: string;
  attendees: number;
  maxAttendees: number;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  members: StudyGroupMember[];
  tutors: StudyGroupMember[];
  maxMembers: number;
  isPrivate: boolean;
  createdAt: string;
  nextSession?: StudyGroupSession;
  sessions: StudyGroupSession[];
  activities: {
    id: string;
    type: 'message' | 'resource' | 'achievement';
    user: string;
    content: string;
    timestamp: string;
  }[];
}

export const studyGroups: StudyGroup[] = [
  {
    id: '1',
    name: 'React Masters 2024',
    description: 'Grupo de estudio intensivo para dominar React desde fundamentos hasta patrones avanzados. Sesiones semanales con proyectos prácticos.',
    category: 'Desarrollo Web',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    members: [
      {
        id: '1',
        name: 'María González',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
        role: 'student',
        joinedAt: '2024-01-15',
        contributions: 45
      },
      {
        id: '2',
        name: 'Carlos Méndez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
        role: 'student',
        joinedAt: '2024-01-20',
        contributions: 32
      },
      {
        id: '3',
        name: 'Ana Rodríguez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
        role: 'student',
        joinedAt: '2024-01-18',
        contributions: 28
      }
    ],
    tutors: [
      {
        id: 't1',
        name: 'Roberto Silva',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto',
        role: 'tutor',
        joinedAt: '2024-01-10',
        contributions: 89
      }
    ],
    maxMembers: 20,
    isPrivate: false,
    createdAt: '2024-01-10',
    nextSession: {
      id: 's1',
      title: 'Hooks Avanzados y Custom Hooks',
      date: '2024-12-23T18:00:00',
      duration: 120,
      type: 'video_call',
      tutor: 'Roberto Silva',
      attendees: 12,
      maxAttendees: 20,
      status: 'scheduled'
    },
    sessions: [
      {
        id: 's1',
        title: 'Hooks Avanzados y Custom Hooks',
        date: '2024-12-23T18:00:00',
        duration: 120,
        type: 'video_call',
        tutor: 'Roberto Silva',
        attendees: 12,
        maxAttendees: 20,
        status: 'scheduled'
      },
      {
        id: 's2',
        title: 'Context API y State Management',
        date: '2024-12-16T18:00:00',
        duration: 120,
        type: 'video_call',
        tutor: 'Roberto Silva',
        attendees: 15,
        maxAttendees: 20,
        status: 'completed'
      }
    ],
    activities: [
      {
        id: '1',
        type: 'message',
        user: 'María González',
        content: 'Acabo de terminar el proyecto de la semana. ¿Alguien puede revisar mi código?',
        timestamp: '2024-12-21T10:30:00'
      },
      {
        id: '2',
        type: 'resource',
        user: 'Roberto Silva',
        content: 'Compartió: "Guía completa de React Hooks"',
        timestamp: '2024-12-21T09:15:00'
      }
    ]
  },
  {
    id: '2',
    name: 'Data Science con Python',
    description: 'Aprende análisis de datos, visualización y machine learning con Python. Proyectos reales cada semana.',
    category: 'Data Science',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    members: [
      {
        id: '4',
        name: 'Pedro Sánchez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
        role: 'student',
        joinedAt: '2024-02-01',
        contributions: 38
      }
    ],
    tutors: [
      {
        id: 't2',
        name: 'Laura Gómez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
        role: 'tutor',
        joinedAt: '2024-01-25',
        contributions: 76
      }
    ],
    maxMembers: 15,
    isPrivate: false,
    createdAt: '2024-01-25',
    sessions: [],
    activities: []
  }
];
