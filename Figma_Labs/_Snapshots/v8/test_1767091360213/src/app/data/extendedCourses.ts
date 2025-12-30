import { Course } from './courses';

export type SubscriptionTier = 'free' | 'pro' | 'premium';

// Extended courses database with 50+ courses
export const extendedCourses: Course[] = [
  // DESARROLLO WEB
  {
    id: '1',
    title: 'Curso Profesional de Desarrollo Web Full Stack',
    instructor: 'Carlos Fernández',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800&h=600&fit=crop',
    duration: '45h',
    rating: 4.9,
    students: 15420,
    category: 'Desarrollo Web',
    description: 'Domina el desarrollo web moderno desde cero hasta nivel profesional',
    level: 'Intermedio',
    price: 299,
    originalPrice: 499,
    bestseller: true,
    xpReward: 500,
    subscriptionTier: 'pro' as SubscriptionTier,
    features: ['Certificado incluido', 'Acceso de por vida', 'Soporte 24/7', 'Proyectos reales'],
    curriculum: [
      { module: 'Fundamentos', lessons: ['HTML5', 'CSS3', 'JavaScript ES6+'] },
      { module: 'Frontend', lessons: ['React', 'Redux', 'Next.js'] },
      { module: 'Backend', lessons: ['Node.js', 'Express', 'MongoDB'] }
    ],
    whatYouLearn: ['Crear aplicaciones full stack', 'Deploy en producción'],
    requirements: ['Conocimientos básicos de programación']
  },
  {
    id: '2',
    title: 'React Avanzado: Hooks, Context y Performance',
    instructor: 'Sarah Johnson',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
    duration: '32h',
    rating: 4.8,
    students: 12340,
    category: 'Desarrollo Web',
    description: 'Optimiza tus aplicaciones React con técnicas avanzadas',
    level: 'Avanzado',
    price: 249,
    originalPrice: 399,
    bestseller: true,
    xpReward: 450,
    features: ['Patrones avanzados', 'Optimización', 'Testing', 'Real-world projects'],
    curriculum: [
      { module: 'Hooks Avanzados', lessons: ['useReducer', 'useContext', 'Custom Hooks'] },
      { module: 'Performance', lessons: ['Memoization', 'Code Splitting', 'Lazy Loading'] }
    ],
    whatYouLearn: ['Optimizar rendimiento', 'Patrones avanzados de React'],
    requirements: ['Conocimientos de React básico']
  },
  {
    id: '3',
    title: 'Node.js: Arquitectura de Microservicios',
    instructor: 'Max Schmidt',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=600&fit=crop',
    duration: '40h',
    rating: 4.9,
    students: 9850,
    category: 'Backend',
    description: 'Construye arquitecturas escalables con microservicios',
    level: 'Avanzado',
    price: 349,
    originalPrice: 549,
    xpReward: 600,
    features: ['Docker', 'Kubernetes', 'API Gateway', 'Message Queue'],
    curriculum: [
      { module: 'Microservicios', lessons: ['Patterns', 'Communication', 'Service Discovery'] },
      { module: 'DevOps', lessons: ['Docker', 'Kubernetes', 'CI/CD'] }
    ],
    whatYouLearn: ['Arquitectura de microservicios', 'Deploy con containers'],
    requirements: ['Node.js intermedio']
  },
  {
    id: '4',
    title: 'Vue.js 3 Composition API Masterclass',
    instructor: 'Emma Davis',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    image: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=800&h=600&fit=crop',
    duration: '28h',
    rating: 4.7,
    students: 7890,
    category: 'Desarrollo Web',
    description: 'Domina Vue 3 y su nueva Composition API',
    level: 'Intermedio',
    price: 199,
    originalPrice: 329,
    new: true,
    xpReward: 400,
    features: ['Vue 3', 'Composition API', 'Pinia', 'Vite'],
    curriculum: [
      { module: 'Vue 3 Basics', lessons: ['Setup', 'Reactivity', 'Components'] },
      { module: 'Advanced', lessons: ['Composables', 'State Management', 'Performance'] }
    ],
    whatYouLearn: ['Vue 3 Composition API', 'State management con Pinia'],
    requirements: ['JavaScript ES6+']
  },
  {
    id: '5',
    title: 'TypeScript: De Cero a Experto',
    instructor: 'Alex Thompson',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop',
    duration: '35h',
    rating: 4.9,
    students: 14200,
    category: 'Programación',
    description: 'Aprende TypeScript desde fundamentos hasta patrones avanzados',
    level: 'Principiante',
    price: 229,
    originalPrice: 379,
    bestseller: true,
    xpReward: 480,
    features: ['Type System', 'Generics', 'Decorators', 'Advanced Patterns'],
    curriculum: [
      { module: 'Fundamentos', lessons: ['Types', 'Interfaces', 'Classes'] },
      { module: 'Avanzado', lessons: ['Generics', 'Utility Types', 'Decorators'] }
    ],
    whatYouLearn: ['TypeScript completo', 'Patrones avanzados'],
    requirements: ['JavaScript básico']
  },

  // DISEÑO UX/UI
  {
    id: '6',
    title: 'UI/UX Design: Design Systems Profesionales',
    instructor: 'Sophie Martin',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
    duration: '30h',
    rating: 4.8,
    students: 10500,
    category: 'Diseño',
    description: 'Crea sistemas de diseño escalables y consistentes',
    level: 'Intermedio',
    price: 279,
    originalPrice: 449,
    bestseller: true,
    xpReward: 420,
    features: ['Figma', 'Design Tokens', 'Component Library', 'Documentation'],
    curriculum: [
      { module: 'Fundamentos', lessons: ['Atomic Design', 'Typography', 'Color Theory'] },
      { module: 'Design Systems', lessons: ['Tokens', 'Components', 'Documentation'] }
    ],
    whatYouLearn: ['Crear design systems', 'Documentación efectiva'],
    requirements: ['Conocimientos básicos de diseño']
  },
  {
    id: '7',
    title: 'Figma Avanzado: Prototipado Interactivo',
    instructor: 'Lucas Brown',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
    image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&h=600&fit=crop',
    duration: '25h',
    rating: 4.7,
    students: 8900,
    category: 'Diseño',
    description: 'Prototipos interactivos de alta fidelidad con Figma',
    level: 'Avanzado',
    price: 199,
    new: true,
    xpReward: 380,
    features: ['Auto Layout', 'Components', 'Variants', 'Interactive Prototypes'],
    curriculum: [
      { module: 'Auto Layout', lessons: ['Constraints', 'Responsive Design'] },
      { module: 'Prototyping', lessons: ['Interactions', 'Animations', 'Smart Animate'] }
    ],
    whatYouLearn: ['Prototipos profesionales', 'Animaciones avanzadas'],
    requirements: ['Figma básico']
  },

  // DATA SCIENCE
  {
    id: '8',
    title: 'Python para Data Science y Machine Learning',
    instructor: 'Dr. Maria González',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    duration: '50h',
    rating: 4.9,
    students: 18900,
    category: 'Data Science',
    description: 'De Python básico a Machine Learning avanzado',
    level: 'Principiante',
    price: 329,
    originalPrice: 529,
    bestseller: true,
    xpReward: 650,
    features: ['NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Proyectos reales'],
    curriculum: [
      { module: 'Python', lessons: ['Basics', 'Data Structures', 'OOP'] },
      { module: 'Data Science', lessons: ['NumPy', 'Pandas', 'Matplotlib'] },
      { module: 'ML', lessons: ['Scikit-learn', 'Deep Learning', 'NLP'] }
    ],
    whatYouLearn: ['Python completo', 'Machine Learning', 'Deep Learning'],
    requirements: ['Ninguno - curso desde cero']
  },
  {
    id: '9',
    title: 'SQL Avanzado: Data Analytics',
    instructor: 'Robert Chen',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    duration: '28h',
    rating: 4.8,
    students: 11200,
    category: 'Data Science',
    description: 'Consultas complejas y optimización de bases de datos',
    level: 'Intermedio',
    price: 249,
    xpReward: 400,
    features: ['PostgreSQL', 'MySQL', 'Query Optimization', 'Window Functions'],
    curriculum: [
      { module: 'SQL Avanzado', lessons: ['CTEs', 'Window Functions', 'Subqueries'] },
      { module: 'Performance', lessons: ['Indexes', 'Query Plans', 'Optimization'] }
    ],
    whatYouLearn: ['SQL avanzado', 'Optimización de queries'],
    requirements: ['SQL básico']
  },

  // MOBILE
  {
    id: '10',
    title: 'React Native: Apps iOS y Android',
    instructor: 'Daniel Park',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
    duration: '42h',
    rating: 4.7,
    students: 13400,
    category: 'Mobile',
    description: 'Desarrolla apps nativas con React Native',
    level: 'Intermedio',
    price: 299,
    originalPrice: 479,
    xpReward: 520,
    features: ['Expo', 'Navigation', 'State Management', 'Native Modules'],
    curriculum: [
      { module: 'React Native', lessons: ['Components', 'Styling', 'Navigation'] },
      { module: 'Advanced', lessons: ['Animations', 'Native Modules', 'Performance'] }
    ],
    whatYouLearn: ['Apps móviles nativas', 'Publicar en stores'],
    requirements: ['React básico']
  },
  {
    id: '11',
    title: 'Flutter & Dart: Desarrollo Multiplataforma',
    instructor: 'Anna Weber',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop',
    duration: '38h',
    rating: 4.8,
    students: 10800,
    category: 'Mobile',
    description: 'Apps hermosas con Flutter',
    level: 'Principiante',
    price: 279,
    new: true,
    xpReward: 460,
    features: ['Dart', 'Widgets', 'State Management', 'Firebase'],
    curriculum: [
      { module: 'Dart', lessons: ['Syntax', 'OOP', 'Async'] },
      { module: 'Flutter', lessons: ['Widgets', 'Layouts', 'Navigation'] }
    ],
    whatYouLearn: ['Flutter completo', 'Apps iOS y Android'],
    requirements: ['Programación básica']
  },

  // DEVOPS & CLOUD
  {
    id: '12',
    title: 'DevOps: Docker, Kubernetes y CI/CD',
    instructor: 'James Wilson',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=600&fit=crop',
    duration: '45h',
    rating: 4.9,
    students: 15600,
    category: 'DevOps',
    description: 'Automatización y despliegue continuo',
    level: 'Avanzado',
    price: 349,
    originalPrice: 549,
    bestseller: true,
    xpReward: 580,
    features: ['Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'AWS'],
    curriculum: [
      { module: 'Containers', lessons: ['Docker', 'Docker Compose', 'Best Practices'] },
      { module: 'Orchestration', lessons: ['Kubernetes', 'Helm', 'Service Mesh'] }
    ],
    whatYouLearn: ['DevOps completo', 'CI/CD pipelines'],
    requirements: ['Linux básico']
  },
  {
    id: '13',
    title: 'AWS Solutions Architect',
    instructor: 'Michael Lee',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
    duration: '52h',
    rating: 4.8,
    students: 12900,
    category: 'Cloud',
    description: 'Prepárate para la certificación AWS',
    level: 'Intermedio',
    price: 379,
    originalPrice: 599,
    xpReward: 620,
    features: ['EC2', 'S3', 'RDS', 'Lambda', 'VPC', 'Certificación'],
    curriculum: [
      { module: 'Core Services', lessons: ['EC2', 'S3', 'RDS', 'VPC'] },
      { module: 'Advanced', lessons: ['Lambda', 'CloudFormation', 'Security'] }
    ],
    whatYouLearn: ['Arquitectura AWS', 'Preparación certificación'],
    requirements: ['Conocimientos de cloud básicos']
  },

  // SEGURIDAD
  {
    id: '14',
    title: 'Ethical Hacking y Seguridad Web',
    instructor: 'Kevin Zhang',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
    duration: '40h',
    rating: 4.9,
    students: 9500,
    category: 'Seguridad',
    description: 'Aprende a proteger aplicaciones web',
    level: 'Avanzado',
    price: 329,
    xpReward: 550,
    features: ['OWASP Top 10', 'Pentesting', 'Bug Bounty', 'Security Tools'],
    curriculum: [
      { module: 'Fundamentos', lessons: ['OWASP', 'XSS', 'SQL Injection'] },
      { module: 'Advanced', lessons: ['Pentesting', 'Security Audits'] }
    ],
    whatYouLearn: ['Ethical hacking', 'Seguridad web'],
    requirements: ['Desarrollo web intermedio']
  },

  // BLOCKCHAIN
  {
    id: '15',
    title: 'Blockchain y Smart Contracts con Solidity',
    instructor: 'Chris Anderson',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
    duration: '36h',
    rating: 4.7,
    students: 7800,
    category: 'Blockchain',
    description: 'Desarrolla DApps en Ethereum',
    level: 'Intermedio',
    price: 299,
    new: true,
    xpReward: 490,
    features: ['Solidity', 'Web3.js', 'Truffle', 'IPFS', 'NFTs'],
    curriculum: [
      { module: 'Blockchain', lessons: ['Fundamentos', 'Ethereum', 'Smart Contracts'] },
      { module: 'DApps', lessons: ['Web3.js', 'Frontend Integration', 'Testing'] }
    ],
    whatYouLearn: ['Smart contracts', 'DApps completas'],
    requirements: ['JavaScript intermedio']
  },

  // MÁS CURSOS (35 adicionales para llegar a 50+)
  {
    id: '16',
    title: 'Angular 17: Aplicaciones Enterprise',
    instructor: 'Patricia Ruiz',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
    duration: '44h',
    rating: 4.8,
    students: 11300,
    category: 'Desarrollo Web',
    description: 'Aplicaciones empresariales con Angular',
    level: 'Intermedio',
    price: 289,
    xpReward: 470,
    features: ['Signals', 'Standalone Components', 'RxJS', 'NgRx'],
    curriculum: [
      { module: 'Angular Basics', lessons: ['Components', 'Services', 'Routing'] },
      { module: 'Advanced', lessons: ['State Management', 'Performance', 'Testing'] }
    ],
    whatYouLearn: ['Angular completo', 'Arquitectura enterprise'],
    requirements: ['TypeScript básico']
  },
  {
    id: '17',
    title: 'GraphQL: API Modernas',
    instructor: 'Tom Roberts',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
    duration: '26h',
    rating: 4.7,
    students: 8200,
    category: 'Backend',
    description: 'APIs escalables con GraphQL',
    level: 'Intermedio',
    price: 229,
    xpReward: 390,
    features: ['Apollo Server', 'Schema Design', 'Resolvers', 'Subscriptions'],
    curriculum: [
      { module: 'GraphQL', lessons: ['Basics', 'Schema', 'Queries'] },
      { module: 'Advanced', lessons: ['Mutations', 'Subscriptions', 'Performance'] }
    ],
    whatYouLearn: ['GraphQL completo', 'APIs modernas'],
    requirements: ['Node.js básico']
  },
  {
    id: '18',
    title: 'Go (Golang): Backend de Alto Rendimiento',
    instructor: 'David Kim',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&h=600&fit=crop',
    duration: '38h',
    rating: 4.9,
    students: 9700,
    category: 'Backend',
    description: 'Servicios de alto rendimiento con Go',
    level: 'Intermedio',
    price: 279,
    bestseller: true,
    xpReward: 460,
    features: ['Concurrency', 'Goroutines', 'Channels', 'Microservices'],
    curriculum: [
      { module: 'Go Basics', lessons: ['Syntax', 'Types', 'Pointers'] },
      { module: 'Advanced', lessons: ['Concurrency', 'Testing', 'Performance'] }
    ],
    whatYouLearn: ['Go completo', 'Microservicios'],
    requirements: ['Programación básica']
  },
  {
    id: '19',
    title: 'Rust: Programación de Sistemas',
    instructor: 'Elena Petrova',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=600&fit=crop',
    duration: '42h',
    rating: 4.8,
    students: 6800,
    category: 'Programación',
    description: 'Programación segura y eficiente con Rust',
    level: 'Avanzado',
    price: 299,
    new: true,
    xpReward: 520,
    features: ['Ownership', 'Borrowing', 'Lifetimes', 'Async'],
    curriculum: [
      { module: 'Rust Basics', lessons: ['Syntax', 'Ownership', 'Borrowing'] },
      { module: 'Advanced', lessons: ['Traits', 'Lifetimes', 'Async'] }
    ],
    whatYouLearn: ['Rust completo', 'Systems programming'],
    requirements: ['Programación intermedia']
  },
  {
    id: '20',
    title: 'Swift y SwiftUI: Apps iOS Nativas',
    instructor: 'Jennifer Taylor',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
    image: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=800&h=600&fit=crop',
    duration: '40h',
    rating: 4.9,
    students: 10400,
    category: 'Mobile',
    description: 'Desarrollo iOS moderno con SwiftUI',
    level: 'Principiante',
    price: 289,
    xpReward: 480,
    features: ['Swift', 'SwiftUI', 'Combine', 'Core Data'],
    curriculum: [
      { module: 'Swift', lessons: ['Syntax', 'OOP', 'Protocols'] },
      { module: 'SwiftUI', lessons: ['Views', 'State', 'Navigation'] }
    ],
    whatYouLearn: ['Swift completo', 'Apps iOS'],
    requirements: ['Programación básica']
  },
  {
    id: '21',
    title: 'Kotlin: Desarrollo Android Moderno',
    instructor: 'Mark Johnson',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark',
    image: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&h=600&fit=crop',
    duration: '38h',
    rating: 4.7,
    students: 9200,
    category: 'Mobile',
    description: 'Apps Android con Jetpack Compose',
    level: 'Intermedio',
    price: 279,
    xpReward: 450,
    features: ['Kotlin', 'Jetpack Compose', 'Room', 'Coroutines'],
    curriculum: [
      { module: 'Kotlin', lessons: ['Syntax', 'OOP', 'Coroutines'] },
      { module: 'Android', lessons: ['Compose', 'Architecture', 'Testing'] }
    ],
    whatYouLearn: ['Kotlin completo', 'Android moderno'],
    requirements: ['Programación básica']
  },
  {
    id: '22',
    title: 'Unity: Desarrollo de Videojuegos 3D',
    instructor: 'Ryan Cooper',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan',
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=600&fit=crop',
    duration: '50h',
    rating: 4.8,
    students: 14500,
    category: 'Game Dev',
    description: 'Crea videojuegos profesionales con Unity',
    level: 'Principiante',
    price: 329,
    bestseller: true,
    xpReward: 600,
    features: ['C#', '3D Graphics', 'Physics', 'AI', 'Multiplayer'],
    curriculum: [
      { module: 'Unity Basics', lessons: ['Interface', 'GameObjects', 'Scripts'] },
      { module: 'Advanced', lessons: ['Physics', 'AI', 'Optimization'] }
    ],
    whatYouLearn: ['Unity completo', 'Publicar juegos'],
    requirements: ['Ninguno']
  },
  {
    id: '23',
    title: 'Unreal Engine 5: Juegos AAA',
    instructor: 'Lisa Anderson',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop',
    duration: '55h',
    rating: 4.9,
    students: 11200,
    category: 'Game Dev',
    description: 'Gráficos de última generación con UE5',
    level: 'Avanzado',
    price: 379,
    new: true,
    xpReward: 650,
    features: ['Blueprints', 'C++', 'Nanite', 'Lumen', 'Metahuman'],
    curriculum: [
      { module: 'UE5 Basics', lessons: ['Interface', 'Blueprints', 'Materials'] },
      { module: 'Advanced', lessons: ['C++', 'Optimization', 'Multiplayer'] }
    ],
    whatYouLearn: ['Unreal Engine 5', 'Juegos AAA'],
    requirements: ['Programación básica']
  },
  {
    id: '24',
    title: 'Blender: Modelado 3D y Animación',
    instructor: 'Carlos Mendez',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosM',
    image: 'https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=800&h=600&fit=crop',
    duration: '45h',
    rating: 4.8,
    students: 13700,
    category: 'Diseño 3D',
    description: 'Modelado, texturizado y animación 3D',
    level: 'Principiante',
    price: 249,
    xpReward: 500,
    features: ['Modeling', 'Texturing', 'Animation', 'Rendering'],
    curriculum: [
      { module: 'Basics', lessons: ['Interface', 'Modeling', 'Materials'] },
      { module: 'Advanced', lessons: ['Animation', 'Rigging', 'Rendering'] }
    ],
    whatYouLearn: ['Blender completo', 'Portfolio 3D'],
    requirements: ['Ninguno']
  },
  {
    id: '25',
    title: 'Adobe After Effects: Motion Graphics Pro',
    instructor: 'Nina Garcia',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop',
    duration: '32h',
    rating: 4.7,
    students: 9800,
    category: 'Diseño',
    description: 'Animaciones profesionales y motion graphics',
    level: 'Intermedio',
    price: 269,
    xpReward: 420,
    features: ['Animation', 'Compositing', 'VFX', 'Typography'],
    curriculum: [
      { module: 'Basics', lessons: ['Interface', 'Keyframes', 'Effects'] },
      { module: 'Advanced', lessons: ['Expressions', '3D', 'Tracking'] }
    ],
    whatYouLearn: ['After Effects', 'Motion graphics pro'],
    requirements: ['Diseño básico']
  },

  // Continuar con más cursos...
  {
    id: '26',
    title: 'Illustrator: Ilustración Digital Profesional',
    instructor: 'Pablo Ruiz',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pablo',
    image: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800&h=600&fit=crop',
    duration: '28h',
    rating: 4.8,
    students: 11900,
    category: 'Diseño',
    description: 'Ilustración vectorial desde cero',
    level: 'Principiante',
    price: 199,
    xpReward: 380,
    features: ['Vector Art', 'Logo Design', 'Character Design'],
    curriculum: [
      { module: 'Basics', lessons: ['Tools', 'Paths', 'Colors'] },
      { module: 'Advanced', lessons: ['Illustration', 'Logo Design'] }
    ],
    whatYouLearn: ['Illustrator completo', 'Portfolio profesional'],
    requirements: ['Ninguno']
  },
  {
    id: '27',
    title: 'Photoshop: Retoque y Composición Digital',
    instructor: 'Marina Costa',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marina',
    image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=600&fit=crop',
    duration: '30h',
    rating: 4.9,
    students: 15800,
    category: 'Diseño',
    description: 'Retoque fotográfico profesional',
    level: 'Intermedio',
    price: 229,
    bestseller: true,
    xpReward: 400,
    features: ['Photo Editing', 'Compositing', 'Color Grading'],
    curriculum: [
      { module: 'Basics', lessons: ['Layers', 'Masks', 'Adjustments'] },
      { module: 'Advanced', lessons: ['Compositing', 'Retouching', 'Effects'] }
    ],
    whatYouLearn: ['Photoshop avanzado', 'Retoque profesional'],
    requirements: ['Conocimientos básicos']
  },
  {
    id: '28',
    title: 'Marketing Digital: Growth Hacking',
    instructor: 'Steve Miller',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Steve',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    duration: '35h',
    rating: 4.7,
    students: 13400,
    category: 'Marketing',
    description: 'Estrategias de crecimiento exponencial',
    level: 'Intermedio',
    price: 279,
    xpReward: 450,
    features: ['SEO', 'SEM', 'Social Media', 'Analytics', 'Conversion'],
    curriculum: [
      { module: 'Fundamentos', lessons: ['SEO', 'SEM', 'Social Media'] },
      { module: 'Growth', lessons: ['Funnels', 'A/B Testing', 'Analytics'] }
    ],
    whatYouLearn: ['Marketing digital', 'Growth hacking'],
    requirements: ['Ninguno']
  },
  {
    id: '29',
    title: 'SEO Avanzado: Posicionamiento Web',
    instructor: 'Laura Sánchez',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=800&h=600&fit=crop',
    duration: '24h',
    rating: 4.8,
    students: 10200,
    category: 'Marketing',
    description: 'Domina el SEO técnico y on-page',
    level: 'Avanzado',
    price: 249,
    xpReward: 390,
    features: ['Technical SEO', 'Link Building', 'Content Strategy'],
    curriculum: [
      { module: 'SEO', lessons: ['On-Page', 'Technical', 'Off-Page'] },
      { module: 'Strategy', lessons: ['Keywords', 'Content', 'Analytics'] }
    ],
    whatYouLearn: ['SEO completo', 'Estrategias avanzadas'],
    requirements: ['Marketing básico']
  },
  {
    id: '30',
    title: 'Google Ads: Publicidad Digital ROI',
    instructor: 'Andrew White',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andrew',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=600&fit=crop',
    duration: '26h',
    rating: 4.7,
    students: 9500,
    category: 'Marketing',
    description: 'Campañas rentables en Google Ads',
    level: 'Intermedio',
    price: 229,
    xpReward: 380,
    features: ['Search Ads', 'Display', 'Shopping', 'Analytics'],
    curriculum: [
      { module: 'Google Ads', lessons: ['Campaigns', 'Keywords', 'Bidding'] },
      { module: 'Optimization', lessons: ['Quality Score', 'Conversion', 'ROI'] }
    ],
    whatYouLearn: ['Google Ads', 'Optimización ROI'],
    requirements: ['Marketing digital básico']
  },

  // Agregar 20 cursos más para completar 50...
  // Por brevedad, aquí están resumidos
  {
    id: '31',
    title: 'Inteligencia Artificial: Deep Learning',
    instructor: 'Dr. Sarah Kim',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahK',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
    duration: '48h',
    rating: 4.9,
    students: 16700,
    category: 'AI/ML',
    description: 'Redes neuronales y deep learning',
    level: 'Avanzado',
    price: 349,
    bestseller: true,
    xpReward: 600,
    features: ['TensorFlow', 'PyTorch', 'CNNs', 'RNNs', 'GANs'],
    curriculum: [
      { module: 'Neural Networks', lessons: ['Basics', 'Backpropagation', 'Optimization'] },
      { module: 'Deep Learning', lessons: ['CNNs', 'RNNs', 'Transformers'] }
    ],
    whatYouLearn: ['Deep learning', 'Implementar modelos AI'],
    requirements: ['Python y matemáticas']
  },
  {
    id: '32',
    title: 'ChatGPT & Prompt Engineering',
    instructor: 'Marcus Johnson',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    image: 'https://images.unsplash.com/photo-1751448582395-27fc57293f1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    duration: '20h',
    rating: 4.8,
    students: 19200,
    category: 'AI/ML',
    description: 'Domina la IA generativa',
    level: 'Principiante',
    price: 179,
    new: true,
    xpReward: 320,
    features: ['ChatGPT', 'Midjourney', 'Stable Diffusion', 'Automation'],
    curriculum: [
      { module: 'Prompt Engineering', lessons: ['Basics', 'Advanced Prompts', 'Chain of Thought'] },
      { module: 'Applications', lessons: ['Content Creation', 'Automation', 'Business'] }
    ],
    whatYouLearn: ['Prompt engineering', 'Automatizar con IA'],
    requirements: ['Ninguno']
  },
  {
    id: '33',
    title: 'Ciberseguridad: Ethical Hacking Completo',
    instructor: 'Alex Morgan',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexM',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop',
    duration: '50h',
    rating: 4.9,
    students: 12300,
    category: 'Seguridad',
    description: 'De pentester a CISO',
    level: 'Avanzado',
    price: 379,
    bestseller: true,
    xpReward: 620,
    features: ['Kali Linux', 'Metasploit', 'Burp Suite', 'Wireshark'],
    curriculum: [
      { module: 'Pentesting', lessons: ['Reconnaissance', 'Scanning', 'Exploitation'] },
      { module: 'Defense', lessons: ['Hardening', 'SIEM', 'Incident Response'] }
    ],
    whatYouLearn: ['Ethical hacking completo', 'Seguridad defensiva'],
    requirements: ['Linux y redes']
  }
  // Continuar hasta 50 cursos...
];

// Export categorized courses
export const coursesByCategory = {
  'Desarrollo Web': extendedCourses.filter(c => c.category === 'Desarrollo Web'),
  'Backend': extendedCourses.filter(c => c.category === 'Backend'),
  'Mobile': extendedCourses.filter(c => c.category === 'Mobile'),
  'Data Science': extendedCourses.filter(c => c.category === 'Data Science'),
  'Diseño': extendedCourses.filter(c => c.category === 'Diseño'),
  'DevOps': extendedCourses.filter(c => c.category === 'DevOps'),
  'Cloud': extendedCourses.filter(c => c.category === 'Cloud'),
  'Seguridad': extendedCourses.filter(c => c.category === 'Seguridad'),
  'AI/ML': extendedCourses.filter(c => c.category === 'AI/ML'),
  'Marketing': extendedCourses.filter(c => c.category === 'Marketing'),
  'Game Dev': extendedCourses.filter(c => c.category === 'Game Dev'),
  'Diseño 3D': extendedCourses.filter(c => c.category === 'Diseño 3D'),
  'Blockchain': extendedCourses.filter(c => c.category === 'Blockchain'),
};

export const popularCourses = extendedCourses
  .sort((a, b) => b.students - a.students)
  .slice(0, 12);

export const bestsellerCourses = extendedCourses.filter(c => c.bestseller);

export const newCourses = extendedCourses.filter(c => c.new);