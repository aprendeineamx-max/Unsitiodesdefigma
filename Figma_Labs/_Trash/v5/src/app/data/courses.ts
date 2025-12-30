export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorAvatar?: string;
  image: string;
  duration: string;
  rating: number;
  students: number;
  category: string;
  description: string;
  level: string;
  price: number;
  originalPrice?: number;
  bestseller?: boolean;
  new?: boolean;
  progress?: number;
  xpReward?: number;
  subscriptionTier?: 'free' | 'pro' | 'premium';
  features?: string[];
  curriculum: {
    module: string;
    lessons: string[];
  }[];
  whatYouLearn: string[];
  requirements: string[];
}

export const allCourses: Course[] = [
  {
    id: '1',
    title: 'Curso Profesional de Desarrollo Web Full Stack',
    instructor: 'Carlos Fernández',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJsb3MlMjBmZXJuYW5kZXxlbnwxfHx8fDE3NjYyMzUyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjYyMzUyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '45h',
    rating: 4.9,
    students: 15420,
    category: 'Desarrollo Web',
    description: 'Aprende a crear aplicaciones web completas desde el frontend hasta el backend. Domina React, Node.js, bases de datos y despliegue en producción.',
    level: 'Intermedio',
    price: 299,
    originalPrice: 399,
    bestseller: true,
    new: false,
    progress: 0,
    xpReward: 500,
    features: ['Certificado de finalización', 'Acceso a foros de soporte'],
    curriculum: [
      {
        module: 'Fundamentos de Frontend',
        lessons: ['HTML5 y CSS3 moderno', 'JavaScript ES6+', 'Git y GitHub', 'Responsive Design']
      },
      {
        module: 'React y Estado',
        lessons: ['Componentes y Props', 'Hooks avanzados', 'Context API', 'Redux Toolkit']
      },
      {
        module: 'Backend con Node.js',
        lessons: ['Express.js', 'APIs RESTful', 'Autenticación JWT', 'Mongoose y MongoDB']
      },
      {
        module: 'Despliegue y Producción',
        lessons: ['Docker básico', 'Deploy en Vercel/Heroku', 'CI/CD', 'Monitoreo y logs']
      }
    ],
    whatYouLearn: [
      'Crear aplicaciones web completas full stack',
      'Desarrollar interfaces modernas con React',
      'Construir APIs RESTful con Node.js y Express',
      'Trabajar con bases de datos MongoDB',
      'Implementar autenticación y autorización',
      'Desplegar aplicaciones en producción'
    ],
    requirements: [
      'Conocimientos básicos de programación',
      'Computadora con Windows, Mac o Linux',
      'Conexión a internet estable'
    ]
  },
  {
    id: '2',
    title: 'Fundamentos de Diseño UI/UX',
    instructor: 'Ana Martínez',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJsb3MlMjBmZXJuYW5kZXxlbnwxfHx8fDE3NjYyMzUyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ258ZW58MXx8fHwxNzY2Mjc3ODQ0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '32h',
    rating: 4.8,
    students: 12350,
    category: 'Diseño',
    description: 'Domina los principios del diseño de interfaces y experiencia de usuario. Aprende a crear productos digitales centrados en el usuario.',
    level: 'Principiante',
    price: 249,
    originalPrice: 299,
    bestseller: false,
    new: true,
    progress: 0,
    xpReward: 400,
    features: ['Certificado de finalización', 'Acceso a foros de soporte'],
    curriculum: [
      {
        module: 'Principios de Diseño',
        lessons: ['Teoría del color', 'Tipografía', 'Composición y espaciado', 'Jerarquía visual']
      },
      {
        module: 'Investigación UX',
        lessons: ['User research', 'Personas y escenarios', 'Journey maps', 'Testing con usuarios']
      },
      {
        module: 'Herramientas de Diseño',
        lessons: ['Figma desde cero', 'Componentes y variantes', 'Auto Layout', 'Prototipos interactivos']
      },
      {
        module: 'Sistemas de Diseño',
        lessons: ['Design tokens', 'Componentes reutilizables', 'Documentación', 'Handoff a desarrollo']
      }
    ],
    whatYouLearn: [
      'Principios fundamentales de diseño',
      'Investigación y análisis de usuarios',
      'Diseño de interfaces en Figma',
      'Crear prototipos interactivos',
      'Desarrollar sistemas de diseño',
      'Realizar pruebas de usabilidad'
    ],
    requirements: [
      'No se requiere experiencia previa',
      'Ganas de aprender diseño',
      'Computadora para instalar Figma'
    ]
  },
  {
    id: '3',
    title: 'Data Science con Python',
    instructor: 'Roberto González',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJsb3MlMjBmZXJuYW5kZXxlbnwxfHx8fDE3NjYyMzUyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    image: 'https://images.unsplash.com/photo-1662638600476-d563fffbb072?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMHByb2dyYW1taW5nfGVufDF8fHx8MTc2NjI4MjQ2NHww&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '38h',
    rating: 4.9,
    students: 9870,
    category: 'Data Science',
    description: 'Aprende análisis de datos, machine learning y visualización con Python. Conviértete en un científico de datos profesional.',
    level: 'Intermedio',
    price: 349,
    originalPrice: 399,
    bestseller: true,
    new: false,
    progress: 0,
    xpReward: 500,
    features: ['Certificado de finalización', 'Acceso a foros de soporte'],
    curriculum: [
      {
        module: 'Python para Data Science',
        lessons: ['NumPy y arrays', 'Pandas DataFrames', 'Limpieza de datos', 'Manipulación avanzada']
      },
      {
        module: 'Visualización de Datos',
        lessons: ['Matplotlib', 'Seaborn', 'Plotly interactivo', 'Dashboards con Streamlit']
      },
      {
        module: 'Machine Learning',
        lessons: ['Sklearn básico', 'Regresión y clasificación', 'Clustering', 'Evaluación de modelos']
      },
      {
        module: 'Proyectos Reales',
        lessons: ['Análisis exploratorio', 'Predicción de precios', 'Clasificación de imágenes', 'NLP básico']
      }
    ],
    whatYouLearn: [
      'Análisis exploratorio de datos',
      'Limpieza y preparación de datasets',
      'Visualizaciones profesionales',
      'Algoritmos de machine learning',
      'Crear modelos predictivos',
      'Desplegar modelos en producción'
    ],
    requirements: [
      'Conocimientos básicos de Python',
      'Matemáticas básicas (álgebra)',
      'Estadística básica (recomendado)'
    ]
  },
  {
    id: '4',
    title: 'Marketing Digital Estratégico',
    instructor: 'Laura Pérez',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJsb3MlMjBmZXJuYW5kZXxlbnwxfHx8fDE3NjYyMzUyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hcmtldGluZ3xlbnwxfHx8fDE3NjYyMzg4NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '28h',
    rating: 4.7,
    students: 11200,
    category: 'Marketing',
    description: 'Domina las estrategias de marketing digital para hacer crecer tu negocio. Aprende SEO, SEM, redes sociales y analítica web.',
    level: 'Principiante',
    price: 199,
    originalPrice: 249,
    bestseller: false,
    new: false,
    progress: 0,
    xpReward: 300,
    features: ['Certificado de finalización', 'Acceso a foros de soporte'],
    curriculum: [
      {
        module: 'Fundamentos del Marketing Digital',
        lessons: ['Estrategia digital', 'Customer journey', 'Buyer personas', 'Objetivos SMART']
      },
      {
        module: 'SEO y SEM',
        lessons: ['SEO On-page', 'Link building', 'Google Ads', 'Keyword research']
      },
      {
        module: 'Redes Sociales',
        lessons: ['Content marketing', 'Facebook e Instagram Ads', 'LinkedIn marketing', 'Social media analytics']
      },
      {
        module: 'Email y Analítica',
        lessons: ['Email marketing', 'Automatización', 'Google Analytics', 'Conversiones y ROI']
      }
    ],
    whatYouLearn: [
      'Crear estrategias de marketing digital',
      'Optimización SEO y campañas SEM',
      'Publicidad en redes sociales',
      'Email marketing efectivo',
      'Analítica web con Google Analytics',
      'Medir ROI y conversiones'
    ],
    requirements: [
      'No se requiere experiencia previa',
      'Conocimientos básicos de internet',
      'Cuenta de Google (para Analytics)'
    ]
  },
  {
    id: '5',
    title: 'Ilustración Digital Profesional',
    instructor: 'Miguel Ángel Torres',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJsb3MlMjBmZXJuYW5kZXxlbnwxfHx8fDE3NjYyMzUyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    image: 'https://images.unsplash.com/photo-1723447970323-a21e64b20e37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0JTIwZGVzaWdufGVufDF8fHx8MTc2NjI2MDM1MXww&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '35h',
    rating: 4.8,
    students: 7650,
    category: 'Arte',
    description: 'Aprende ilustración digital desde cero. Domina técnicas profesionales y crea un portafolio impresionante.',
    level: 'Intermedio',
    price: 279,
    originalPrice: 329,
    bestseller: false,
    new: false,
    progress: 0,
    xpReward: 400,
    features: ['Certificado de finalización', 'Acceso a foros de soporte'],
    curriculum: [
      {
        module: 'Fundamentos Digitales',
        lessons: ['Introducción a Procreate/Photoshop', 'Pinceles y capas', 'Color digital', 'Composición']
      },
      {
        module: 'Anatomía y Figura',
        lessons: ['Proporciones humanas', 'Expresiones faciales', 'Manos y pies', 'Poses dinámicas']
      },
      {
        module: 'Estilos y Técnicas',
        lessons: ['Estilo cartoon', 'Realismo digital', 'Concept art', 'Ilustración editorial']
      },
      {
        module: 'Portafolio Profesional',
        lessons: ['Proyectos finales', 'Presentación de trabajos', 'Promoción en redes', 'Clientes y tarifas']
      }
    ],
    whatYouLearn: [
      'Técnicas de ilustración digital',
      'Anatomía y figura humana',
      'Teoría del color aplicada',
      'Diferentes estilos de ilustración',
      'Crear un portafolio profesional',
      'Conseguir clientes y proyectos'
    ],
    requirements: [
      'Conocimientos básicos de dibujo',
      'Tableta gráfica o iPad',
      'Software de ilustración (Procreate/Photoshop)'
    ]
  },
  {
    id: '6',
    title: 'Inglés Profesional para Tech',
    instructor: 'Jennifer Smith',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJsb3MlMjBmZXJuYW5kZXxlbnwxfHx8fDE3NjYyMzUyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    image: 'https://images.unsplash.com/photo-1567206163313-9e34c830557a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdsaXNoJTIwbGFuZ3VhZ2UlMjBsZWFybmluZ3xlbnwxfHx8fDE3NjYyODI0NjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '40h',
    rating: 4.9,
    students: 14320,
    category: 'Idiomas',
    description: 'Domina el inglés técnico para destacar en tu carrera tech. Aprende vocabulario específico y practica con situaciones reales.',
    level: 'Intermedio',
    price: 229,
    originalPrice: 279,
    bestseller: false,
    new: false,
    progress: 0,
    xpReward: 400,
    features: ['Certificado de finalización', 'Acceso a foros de soporte'],
    curriculum: [
      {
        module: 'English for Developers',
        lessons: ['Technical vocabulary', 'Code reviews', 'Documentation', 'Git and GitHub in English']
      },
      {
        module: 'Professional Communication',
        lessons: ['Meetings and calls', 'Presentations', 'Email writing', 'Slack and async communication']
      },
      {
        module: 'Job Interviews',
        lessons: ['Resume/CV preparation', 'Technical interviews', 'Behavioral questions', 'Salary negotiation']
      },
      {
        module: 'Advanced Topics',
        lessons: ['Reading technical docs', 'Stack Overflow', 'Podcasts and talks', 'Networking']
      }
    ],
    whatYouLearn: [
      'Vocabulario técnico en inglés',
      'Comunicación profesional efectiva',
      'Escribir documentación técnica',
      'Participar en code reviews',
      'Prepararte para entrevistas',
      'Networking internacional'
    ],
    requirements: [
      'Nivel de inglés intermedio (B1)',
      'Experiencia básica en tecnología',
      'Ganas de practicar'
    ]
  },
  {
    id: '7',
    title: 'React Avanzado y Patrones',
    instructor: 'Carlos Fernández',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJsb3MlMjBmZXJuYW5kZXxlbnwxfHx8fDE3NjYyMzUyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NjYyMzUyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '30h',
    rating: 4.9,
    students: 8500,
    category: 'Desarrollo Web',
    description: 'Lleva tus habilidades de React al siguiente nivel con patrones avanzados y mejores prácticas.',
    level: 'Avanzado',
    price: 329,
    originalPrice: 379,
    bestseller: false,
    new: false,
    progress: 0,
    xpReward: 500,
    features: ['Certificado de finalización', 'Acceso a foros de soporte'],
    curriculum: [
      {
        module: 'Patrones Avanzados',
        lessons: ['Compound Components', 'Render Props', 'HOCs', 'Custom Hooks avanzados']
      },
      {
        module: 'Performance',
        lessons: ['React.memo y useMemo', 'Code splitting', 'Lazy loading', 'Optimización de renders']
      },
      {
        module: 'Estado Global',
        lessons: ['Zustand', 'Jotai', 'Redux Toolkit Query', 'React Query']
      },
      {
        module: 'Testing',
        lessons: ['Jest y React Testing Library', 'E2E con Playwright', 'TDD', 'Integration tests']
      }
    ],
    whatYouLearn: [
      'Patrones avanzados de React',
      'Optimización de performance',
      'Manejo de estado complejo',
      'Testing profesional',
      'Arquitectura escalable',
      'Mejores prácticas de la industria'
    ],
    requirements: [
      'Experiencia sólida con React',
      'Conocimientos de JavaScript ES6+',
      'Hooks de React'
    ]
  },
  {
    id: '8',
    title: 'Diseño de Sistemas y Componentes',
    instructor: 'Ana Martínez',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJsb3MlMjBmZXJuYW5kZXxlbnwxfHx8fDE3NjYyMzUyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ258ZW58MXx8fHwxNzY2Mjc3ODQ0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '25h',
    rating: 4.8,
    students: 6200,
    category: 'Diseño',
    description: 'Aprende a crear y mantener sistemas de diseño escalables para equipos de producto.',
    level: 'Avanzado',
    price: 299,
    originalPrice: 349,
    bestseller: false,
    new: false,
    progress: 0,
    xpReward: 400,
    features: ['Certificado de finalización', 'Acceso a foros de soporte'],
    curriculum: [
      {
        module: 'Fundamentos de Design Systems',
        lessons: ['Qué es un design system', 'Tokens y variables', 'Naming conventions', 'Governance']
      },
      {
        module: 'Componentes',
        lessons: ['Atomic design', 'Component API', 'Variantes y estados', 'Accesibilidad']
      },
      {
        module: 'Documentación',
        lessons: ['Storybook', 'Documentación efectiva', 'Guidelines', 'Onboarding']
      },
      {
        module: 'Colaboración',
        lessons: ['Design-Dev handoff', 'Versionado', 'Feedback loops', 'Mantenimiento']
      }
    ],
    whatYouLearn: [
      'Crear sistemas de diseño desde cero',
      'Design tokens y variables',
      'Componentes reutilizables',
      'Documentación efectiva',
      'Colaboración con desarrollo',
      'Escalabilidad y mantenimiento'
    ],
    requirements: [
      'Experiencia en diseño UI/UX',
      'Conocimientos de Figma',
      'Trabajo en equipo'
    ]
  },
  {
    id: '9',
    title: 'Machine Learning Aplicado',
    instructor: 'Roberto González',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJsb3MlMjBmZXJuYW5kZXxlbnwxfHx8fDE3NjYyMzUyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    image: 'https://images.unsplash.com/photo-1662638600476-d563fffbb072?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMHByb2dyYW1taW5nfGVufDF8fHx8MTc2NjI4MjQ2NHww&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '50h',
    rating: 4.9,
    students: 5800,
    category: 'Data Science',
    description: 'Implementa algoritmos de machine learning en proyectos reales y lleva tus modelos a producción.',
    level: 'Avanzado',
    price: 399,
    originalPrice: 449,
    bestseller: false,
    new: false,
    progress: 0,
    xpReward: 500,
    features: ['Certificado de finalización', 'Acceso a foros de soporte'],
    curriculum: [
      {
        module: 'ML Fundamentals',
        lessons: ['Supervised learning', 'Unsupervised learning', 'Feature engineering', 'Model selection']
      },
      {
        module: 'Deep Learning',
        lessons: ['Neural networks', 'TensorFlow/Keras', 'CNNs', 'Transfer learning']
      },
      {
        module: 'NLP',
        lessons: ['Text processing', 'Word embeddings', 'Transformers', 'BERT y GPT']
      },
      {
        module: 'MLOps',
        lessons: ['Model deployment', 'Docker para ML', 'APIs con FastAPI', 'Monitoring']
      }
    ],
    whatYouLearn: [
      'Algoritmos de ML avanzados',
      'Deep learning con TensorFlow',
      'Procesamiento de lenguaje natural',
      'Deployment de modelos',
      'MLOps y buenas prácticas',
      'Proyectos end-to-end'
    ],
    requirements: [
      'Python intermedio-avanzado',
      'Data Science básico',
      'Matemáticas y estadística'
    ]
  }
];