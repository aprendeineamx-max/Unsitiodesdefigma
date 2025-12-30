export interface Comment {
  id: string;
  postId: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

export interface CommentsState {
  [postId: string]: Comment[];
}

export const initialComments: CommentsState = {
  '1': [
    {
      id: 'c1',
      postId: '1',
      author: {
        name: 'Carlos Méndez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosM'
      },
      content: '¡Felicidades Sofía! 🎉 Yo voy por la mitad de la ruta. ¿Algún consejo?',
      createdAt: '2025-12-21T14:45:00',
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: 'c1-r1',
          postId: '1',
          author: {
            name: 'Sofía Ramírez',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia'
          },
          content: 'Gracias! Mi consejo: práctica todos los días aunque sea 1 hora. La consistencia es clave 💪',
          createdAt: '2025-12-21T15:00:00',
          likes: 8,
          isLiked: true
        }
      ]
    },
    {
      id: 'c2',
      postId: '1',
      author: {
        name: 'Ana López',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnaL'
      },
      content: 'Inspirador! Justo lo que necesitaba ver hoy 🚀',
      createdAt: '2025-12-21T14:50:00',
      likes: 5,
      isLiked: false
    }
  ],
  '2': [
    {
      id: 'c3',
      postId: '2',
      author: {
        name: 'Miguel Torres',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel'
      },
      content: '¡Súper emocionado por este curso! ¿Ya está disponible?',
      createdAt: '2025-12-21T12:30:00',
      likes: 23,
      isLiked: true
    }
  ]
};