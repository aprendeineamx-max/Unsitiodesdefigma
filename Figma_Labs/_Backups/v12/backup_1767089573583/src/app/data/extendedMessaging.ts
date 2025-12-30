// Extended messaging data for production-like experience

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  edited?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  attachment?: {
    type: 'image' | 'video' | 'audio' | 'file' | 'location' | 'link';
    url: string;
    name?: string;
    size?: number;
    duration?: number;
    thumbnail?: string;
    metadata?: {
      title?: string;
      description?: string;
      image?: string;
    };
  };
  reactions?: {
    emoji: string;
    users: string[];
  }[];
  isTemporary?: boolean;
  expiresAt?: Date;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  online?: boolean;
  typing?: boolean;
  pinned?: boolean;
  muted?: boolean;
  encrypted?: boolean;
  participants?: string[];
}

// 30+ Conversaciones activas
export const allConversations: Conversation[] = [
  {
    id: '1',
    type: 'direct',
    name: 'Sarah Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    lastMessage: 'That sounds great! When can we start?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    unread: 2,
    online: true,
    encrypted: true,
    pinned: true
  },
  {
    id: '2',
    type: 'group',
    name: 'React Study Group 🚀',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=React',
    lastMessage: 'Alex: Check out this new component pattern',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    unread: 5,
    pinned: true,
    participants: ['Alex', 'Maria', 'John', 'Emma', 'You'],
    encrypted: true
  },
  {
    id: '3',
    type: 'direct',
    name: 'Max Schmidt',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
    lastMessage: 'Perfect! See you tomorrow 👍',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    unread: 0,
    online: false,
    encrypted: true
  },
  {
    id: '4',
    type: 'group',
    name: 'UI/UX Designers 🎨',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Design',
    lastMessage: 'Emma: New mockups are ready!',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    unread: 0,
    muted: true,
    participants: ['Emma', 'Chris', 'Sophie', 'You'],
    encrypted: true
  },
  {
    id: '5',
    type: 'direct',
    name: 'Dr. Maria González',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    lastMessage: 'Great question! Let me explain...',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    unread: 1,
    online: true,
    encrypted: true
  },
  {
    id: '6',
    type: 'group',
    name: 'Python Developers 🐍',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Python',
    lastMessage: 'Robert: Anyone familiar with asyncio?',
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    unread: 3,
    participants: ['Robert', 'Lisa', 'Tom', 'Anna', 'You'],
    encrypted: true
  },
  {
    id: '7',
    type: 'direct',
    name: 'Carlos Fernández',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    lastMessage: 'Thanks for your feedback!',
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    unread: 0,
    online: false,
    encrypted: true
  },
  {
    id: '8',
    type: 'group',
    name: 'DevOps Masters ⚙️',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=DevOps',
    lastMessage: 'James: Kubernetes deployment successful!',
    timestamp: new Date(Date.now() - 1000 * 60 * 400),
    unread: 0,
    participants: ['James', 'Michael', 'Kevin', 'You'],
    encrypted: true
  },
  {
    id: '9',
    type: 'direct',
    name: 'Emma Davis',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    lastMessage: 'Love the new design! 😍',
    timestamp: new Date(Date.now() - 1000 * 60 * 500),
    unread: 0,
    online: true,
    encrypted: true
  },
  {
    id: '10',
    type: 'group',
    name: 'Mobile App Developers 📱',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Mobile',
    lastMessage: 'Daniel: Flutter 3.0 is amazing!',
    timestamp: new Date(Date.now() - 1000 * 60 * 600),
    unread: 7,
    participants: ['Daniel', 'Jennifer', 'Mark', 'Anna', 'Chris', 'You'],
    encrypted: true
  },
  {
    id: '11',
    type: 'direct',
    name: 'Alex Thompson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    lastMessage: 'TypeScript 5.0 features are 🔥',
    timestamp: new Date(Date.now() - 1000 * 60 * 700),
    unread: 0,
    online: false,
    encrypted: true
  },
  {
    id: '12',
    type: 'group',
    name: 'Data Science Club 📊',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=DataScience',
    lastMessage: 'Dr. Maria: New dataset available!',
    timestamp: new Date(Date.now() - 1000 * 60 * 800),
    unread: 2,
    participants: ['Dr. Maria', 'Robert', 'Lisa', 'You'],
    encrypted: true
  },
  {
    id: '13',
    type: 'direct',
    name: 'Sophie Martin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    lastMessage: 'Design system updated ✨',
    timestamp: new Date(Date.now() - 1000 * 60 * 900),
    unread: 0,
    online: true,
    encrypted: true
  },
  {
    id: '14',
    type: 'group',
    name: 'Cloud Architecture ☁️',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Cloud',
    lastMessage: 'Michael: AWS certification tips?',
    timestamp: new Date(Date.now() - 1000 * 60 * 1000),
    unread: 4,
    participants: ['Michael', 'James', 'Kevin', 'Tom', 'You'],
    encrypted: true
  },
  {
    id: '15',
    type: 'direct',
    name: 'Lucas Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
    lastMessage: 'Figma prototype looks awesome!',
    timestamp: new Date(Date.now() - 1000 * 60 * 1200),
    unread: 0,
    online: false,
    encrypted: true
  },
  {
    id: '16',
    type: 'group',
    name: 'Game Dev Community 🎮',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=GameDev',
    lastMessage: 'Ryan: Unity 2023 is out!',
    timestamp: new Date(Date.now() - 1000 * 60 * 1400),
    unread: 0,
    muted: true,
    participants: ['Ryan', 'Lisa', 'Carlos', 'You'],
    encrypted: true
  },
  {
    id: '17',
    type: 'direct',
    name: 'Jennifer Taylor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
    lastMessage: 'SwiftUI question... 🤔',
    timestamp: new Date(Date.now() - 1000 * 60 * 1600),
    unread: 1,
    online: true,
    encrypted: true
  },
  {
    id: '18',
    type: 'group',
    name: 'Blockchain & Web3 ₿',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Blockchain',
    lastMessage: 'Chris: Smart contract deployed!',
    timestamp: new Date(Date.now() - 1000 * 60 * 1800),
    unread: 6,
    participants: ['Chris', 'Alex', 'David', 'Elena', 'You'],
    encrypted: true
  },
  {
    id: '19',
    type: 'direct',
    name: 'Tom Roberts',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
    lastMessage: 'GraphQL resolver help needed',
    timestamp: new Date(Date.now() - 1000 * 60 * 2000),
    unread: 0,
    online: false,
    encrypted: true
  },
  {
    id: '20',
    type: 'group',
    name: 'AI & Machine Learning 🤖',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=AI',
    lastMessage: 'Dr. Sarah: New model trained! 95% accuracy',
    timestamp: new Date(Date.now() - 1000 * 60 * 2200),
    unread: 8,
    participants: ['Dr. Sarah', 'Marcus', 'Lisa', 'Robert', 'You'],
    encrypted: true,
    pinned: true
  },
  {
    id: '21',
    type: 'direct',
    name: 'David Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    lastMessage: 'Go microservices looking good!',
    timestamp: new Date(Date.now() - 1000 * 60 * 2400),
    unread: 0,
    online: true,
    encrypted: true
  },
  {
    id: '22',
    type: 'group',
    name: 'Cybersecurity 🔒',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Security',
    lastMessage: 'Kevin: Security patch released',
    timestamp: new Date(Date.now() - 1000 * 60 * 2600),
    unread: 3,
    participants: ['Kevin', 'Alex', 'Michael', 'You'],
    encrypted: true
  },
  {
    id: '23',
    type: 'direct',
    name: 'Elena Petrova',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    lastMessage: 'Rust is so fast! 🚀',
    timestamp: new Date(Date.now() - 1000 * 60 * 2800),
    unread: 0,
    online: false,
    encrypted: true
  },
  {
    id: '24',
    type: 'group',
    name: 'Marketing & Growth 📈',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Marketing',
    lastMessage: 'Steve: Conversion rate up 40%!',
    timestamp: new Date(Date.now() - 1000 * 60 * 3000),
    unread: 0,
    muted: true,
    participants: ['Steve', 'Laura', 'Andrew', 'You'],
    encrypted: true
  },
  {
    id: '25',
    type: 'direct',
    name: 'Patricia Ruiz',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia',
    lastMessage: 'Angular signals are great!',
    timestamp: new Date(Date.now() - 1000 * 60 * 3200),
    unread: 0,
    online: true,
    encrypted: true
  }
];

// Mensajes históricos extendidos para la conversación activa
export const extendedMessages: Message[] = [
  // Mensajes antiguos (hace 1 semana)
  {
    id: 'msg_100',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Hey! How are you doing? 😊',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    status: 'read'
  },
  {
    id: 'msg_101',
    senderId: '1',
    senderName: 'You',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    content: 'Hi Sarah! I\'m great, thanks! Working on some exciting projects',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 300000),
    status: 'read'
  },
  {
    id: 'msg_102',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'That\'s awesome! I\'ve been learning React hooks lately',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 600000),
    status: 'read'
  },

  // Hace 5 días
  {
    id: 'msg_103',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Have you seen the new TypeScript course?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    status: 'read',
    attachment: {
      type: 'link',
      url: 'https://platzi.com/typescript-advanced',
      metadata: {
        title: 'Advanced TypeScript Patterns',
        description: 'Learn advanced TypeScript patterns including generics, utility types, and decorators',
        image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200&fit=crop'
      }
    }
  },
  {
    id: 'msg_104',
    senderId: '1',
    senderName: 'You',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    content: 'Yes! It looks incredible. I\'m planning to enroll soon',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 120000),
    status: 'read',
    reactions: [
      { emoji: '👍', users: ['Sarah Johnson'] }
    ]
  },

  // Hace 3 días
  {
    id: 'msg_105',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'I just finished the first module. Mind = blown 🤯',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    status: 'read'
  },
  {
    id: 'msg_106',
    senderId: '1',
    senderName: 'You',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    content: 'Really? What did you learn?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 60000),
    status: 'read',
    replyTo: {
      id: 'msg_105',
      senderName: 'Sarah Johnson',
      content: 'I just finished the first module. Mind = blown 🤯'
    }
  },
  {
    id: 'msg_107',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Advanced generics, conditional types, mapped types... so powerful!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 180000),
    status: 'read'
  },
  {
    id: 'msg_108',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Check out my notes!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 200000),
    status: 'read',
    attachment: {
      type: 'file',
      url: '#',
      name: 'TypeScript-Advanced-Module1-Notes.pdf',
      size: 3456789
    }
  },

  // Hace 2 días
  {
    id: 'msg_109',
    senderId: '1',
    senderName: 'You',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    content: 'These notes are amazing! Thank you!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    status: 'read',
    reactions: [
      { emoji: '❤️', users: ['Sarah Johnson'] },
      { emoji: '🙏', users: ['Sarah Johnson'] }
    ]
  },
  {
    id: 'msg_110',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'You\'re welcome! Want to study together?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 120000),
    status: 'read'
  },
  {
    id: 'msg_111',
    senderId: '1',
    senderName: 'You',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    content: 'Absolutely! That would be great 🎉',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 180000),
    status: 'read'
  },

  // Ayer
  {
    id: 'msg_112',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Good morning! ☀️ Ready for today\'s study session?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
    status: 'read'
  },
  {
    id: 'msg_113',
    senderId: '1',
    senderName: 'You',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    content: 'Good morning! Yes, let\'s do this! 💪',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 19),
    status: 'read'
  },
  {
    id: 'msg_114',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Here\'s the location for our study session',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18),
    status: 'read',
    attachment: {
      type: 'location',
      url: '#',
      name: 'Central Library - Study Room 3'
    }
  },
  {
    id: 'msg_115',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Quick voice note about what to prepare',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 17),
    status: 'read',
    attachment: {
      type: 'audio',
      url: '#',
      duration: 67
    }
  },

  // Hoy - mañana
  {
    id: 'msg_116',
    senderId: '1',
    senderName: 'You',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    content: 'Perfect! I\'ll bring my laptop and the textbook',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    status: 'read'
  },
  {
    id: 'msg_117',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Great! I found this awesome resource',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    status: 'read',
    attachment: {
      type: 'link',
      url: 'https://typescript-exercises.com',
      metadata: {
        title: 'TypeScript Exercises',
        description: 'Practice your TypeScript skills with interactive exercises',
        image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=200&fit=crop'
      }
    }
  },

  // Hace unas horas
  {
    id: 'msg_118',
    senderId: '1',
    senderName: 'You',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    content: 'This website is incredible! 😍',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    status: 'read',
    reactions: [
      { emoji: '🔥', users: ['Sarah Johnson'] }
    ]
  },
  {
    id: 'msg_119',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Right? I\'ve been practicing all morning',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    status: 'read'
  },
  {
    id: 'msg_120',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'BTW, did you see the new course on Advanced TypeScript?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'read'
  },

  // Hace 1 hora
  {
    id: 'msg_121',
    senderId: '1',
    senderName: 'You',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    content: 'Yes! It looks amazing. I\'m planning to enroll this week.',
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
    status: 'read'
  },
  {
    id: 'msg_122',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'We could study together! I found some great resources.',
    timestamp: new Date(Date.now() - 1000 * 60 * 50),
    status: 'read',
    attachment: {
      type: 'file',
      url: '#',
      name: 'TypeScript-Advanced-Resources.pdf',
      size: 2456789
    }
  },
  {
    id: 'msg_123',
    senderId: '1',
    senderName: 'You',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    content: 'That sounds great! When can we start?',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: 'read',
    replyTo: {
      id: 'msg_122',
      senderName: 'Sarah Johnson',
      content: 'We could study together! I found some great resources.'
    }
  },
  {
    id: 'msg_124',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'How about this weekend? We can meet at the library',
    timestamp: new Date(Date.now() - 1000 * 60 * 40),
    status: 'read',
    attachment: {
      type: 'location',
      url: '#',
      name: 'Central Library'
    }
  },
  {
    id: 'msg_125',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Check out this tutorial I found!',
    timestamp: new Date(Date.now() - 1000 * 60 * 35),
    status: 'read',
    attachment: {
      type: 'link',
      url: 'https://typescript-tutorial.example.com',
      metadata: {
        title: 'Advanced TypeScript Patterns',
        description: 'Learn advanced TypeScript patterns and best practices',
        image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=200&fit=crop'
      }
    }
  },
  {
    id: 'msg_126',
    senderId: '1',
    senderName: 'You',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
    content: 'This is awesome! Thanks for sharing! 🚀',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'delivered',
    reactions: [
      { emoji: '👍', users: ['Sarah Johnson'] },
      { emoji: '❤️', users: ['Sarah Johnson', 'Max Schmidt'] }
    ]
  },
  {
    id: 'msg_127',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Here\'s a quick voice note about the study plan',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    status: 'read',
    attachment: {
      type: 'audio',
      url: '#',
      duration: 45
    }
  },
  {
    id: 'msg_128',
    senderId: '2',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'That sounds great! When can we start?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: 'delivered'
  }
];
