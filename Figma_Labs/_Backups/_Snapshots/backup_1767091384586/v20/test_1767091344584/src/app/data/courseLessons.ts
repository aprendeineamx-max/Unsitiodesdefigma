// Complete course lessons data with real content

export type LessonType = 'video' | 'quiz' | 'code' | 'project' | 'reading' | 'practice' | 'live';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
  completed?: boolean;
  locked?: boolean;
  description?: string;
  resources?: string[];
  quiz?: {
    questions: number;
    passingScore: number;
  };
  code?: {
    language: string;
    exercises: number;
  };
  project?: {
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: string;
  };
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  duration: string;
  locked?: boolean;
}

// Curso: Full Stack Web Development
export const fullStackModules: Module[] = [
  {
    id: 'module-1',
    title: 'Fundamentos de HTML5 y CSS3',
    description: 'Aprende las bases del desarrollo web moderno',
    duration: '8h 30m',
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Introducción al Desarrollo Web',
        type: 'video',
        duration: '15:30',
        completed: true,
        description: 'Conoce el ecosistema del desarrollo web y las tecnologías que aprenderás',
        resources: ['Slides de presentación', 'Roadmap del desarrollador web']
      },
      {
        id: 'lesson-1-2',
        title: 'Estructura HTML: Elementos y Semántica',
        type: 'video',
        duration: '25:45',
        completed: true,
        description: 'Domina los elementos HTML5 y aprende a crear estructuras semánticas',
        resources: ['Cheatsheet HTML5', 'Ejemplos de código']
      },
      {
        id: 'lesson-1-3',
        title: 'Práctica: Creando tu primera página web',
        type: 'practice',
        duration: '30:00',
        completed: false,
        description: 'Aplica lo aprendido creando una página web desde cero',
        resources: ['Archivos iniciales', 'Solución completa']
      },
      {
        id: 'lesson-1-4',
        title: 'CSS: Selectores y Propiedades',
        type: 'video',
        duration: '35:20',
        completed: false,
        description: 'Aprende a dar estilo a tus páginas con CSS',
        resources: ['CSS Cheatsheet', 'Paleta de colores']
      },
      {
        id: 'lesson-1-5',
        title: 'Flexbox: Layout Moderno',
        type: 'video',
        duration: '28:15',
        description: 'Domina Flexbox para crear layouts responsive',
        resources: ['Flexbox Guide', 'Playground interactivo']
      },
      {
        id: 'lesson-1-6',
        title: 'CSS Grid: Layouts Avanzados',
        type: 'video',
        duration: '32:40',
        description: 'Crea layouts complejos con CSS Grid',
        resources: ['Grid Template Generator', 'Ejemplos prácticos']
      },
      {
        id: 'lesson-1-7',
        title: 'Ejercicios de Flexbox y Grid',
        type: 'code',
        duration: '45:00',
        description: 'Resuelve desafíos de layout con Flexbox y Grid',
        code: {
          language: 'html/css',
          exercises: 8
        },
        resources: ['Starter files', 'Test cases']
      },
      {
        id: 'lesson-1-8',
        title: 'Quiz: Fundamentos HTML y CSS',
        type: 'quiz',
        duration: '15:00',
        quiz: {
          questions: 20,
          passingScore: 80
        },
        description: 'Evalúa tus conocimientos de HTML y CSS'
      },
      {
        id: 'lesson-1-9',
        title: 'Proyecto: Landing Page Responsive',
        type: 'project',
        duration: '4h 00m',
        locked: true,
        project: {
          difficulty: 'medium',
          estimatedTime: '4-6 horas'
        },
        description: 'Crea una landing page profesional y completamente responsive',
        resources: ['Diseño en Figma', 'Assets', 'Rúbrica de evaluación']
      }
    ]
  },
  {
    id: 'module-2',
    title: 'JavaScript ES6+ Moderno',
    description: 'Domina JavaScript desde lo básico hasta características avanzadas',
    duration: '12h 15m',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Fundamentos de JavaScript',
        type: 'video',
        duration: '30:25',
        locked: true,
        description: 'Variables, tipos de datos y operadores',
        resources: ['JS Fundamentals Cheatsheet', 'Ejercicios prácticos']
      },
      {
        id: 'lesson-2-2',
        title: 'Funciones y Scope',
        type: 'video',
        duration: '25:50',
        locked: true,
        description: 'Arrow functions, closures y scope',
        resources: ['Function examples', 'Scope visualizer']
      },
      {
        id: 'lesson-2-3',
        title: 'Arrays y Métodos Modernos',
        type: 'video',
        duration: '35:30',
        locked: true,
        description: 'Map, filter, reduce y más métodos de arrays',
        resources: ['Array methods guide', 'Interactive examples']
      },
      {
        id: 'lesson-2-4',
        title: 'Objetos y Destructuring',
        type: 'video',
        duration: '28:45',
        locked: true,
        description: 'Manipulación de objetos y destructuring avanzado',
        resources: ['Object manipulation guide', 'Code samples']
      },
      {
        id: 'lesson-2-5',
        title: 'Práctica: Algoritmos JavaScript',
        type: 'code',
        duration: '60:00',
        locked: true,
        code: {
          language: 'javascript',
          exercises: 15
        },
        description: 'Resuelve problemas de algoritmos comunes',
        resources: ['Test suite', 'Solutions']
      },
      {
        id: 'lesson-2-6',
        title: 'Asincronía: Promises y Async/Await',
        type: 'video',
        duration: '40:20',
        locked: true,
        description: 'Domina la programación asíncrona en JavaScript',
        resources: ['Async patterns', 'API examples']
      },
      {
        id: 'lesson-2-7',
        title: 'DOM Manipulation',
        type: 'video',
        duration: '32:15',
        locked: true,
        description: 'Interactúa con el DOM de forma eficiente',
        resources: ['DOM API reference', 'Interactive demos']
      },
      {
        id: 'lesson-2-8',
        title: 'Event Handling Avanzado',
        type: 'video',
        duration: '28:35',
        locked: true,
        description: 'Event delegation, bubbling y capturing',
        resources: ['Event handling guide', 'Code examples']
      },
      {
        id: 'lesson-2-9',
        title: 'ES6+ Features: Módulos, Spread, Rest',
        type: 'video',
        duration: '35:40',
        locked: true,
        description: 'Características modernas de JavaScript',
        resources: ['ES6+ cheatsheet', 'Browser compatibility']
      },
      {
        id: 'lesson-2-10',
        title: 'Quiz: JavaScript ES6+',
        type: 'quiz',
        duration: '20:00',
        locked: true,
        quiz: {
          questions: 25,
          passingScore: 75
        },
        description: 'Evalúa tu conocimiento de JavaScript moderno'
      },
      {
        id: 'lesson-2-11',
        title: 'Proyecto: To-Do App Interactiva',
        type: 'project',
        duration: '5h 00m',
        locked: true,
        project: {
          difficulty: 'medium',
          estimatedTime: '5-7 horas'
        },
        description: 'Crea una aplicación de tareas con LocalStorage',
        resources: ['Starter code', 'Design mockup', 'Testing guide']
      }
    ]
  },
  {
    id: 'module-3',
    title: 'React: Fundamentos y Hooks',
    description: 'Aprende React desde cero hasta componentes avanzados',
    duration: '15h 45m',
    locked: true,
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Introducción a React',
        type: 'video',
        duration: '20:30',
        locked: true,
        description: 'Qué es React y por qué usarlo',
        resources: ['React docs', 'Setup guide']
      },
      {
        id: 'lesson-3-2',
        title: 'JSX y Componentes',
        type: 'video',
        duration: '30:15',
        locked: true,
        description: 'Sintaxis JSX y creación de componentes',
        resources: ['JSX syntax guide', 'Component examples']
      },
      {
        id: 'lesson-3-3',
        title: 'Props y State',
        type: 'video',
        duration: '35:40',
        locked: true,
        description: 'Manejo de props y estado en componentes',
        resources: ['Props vs State', 'Best practices']
      },
      {
        id: 'lesson-3-4',
        title: 'Hooks: useState y useEffect',
        type: 'video',
        duration: '42:25',
        locked: true,
        description: 'Los hooks más importantes de React',
        resources: ['Hooks API reference', 'Common patterns']
      },
      {
        id: 'lesson-3-5',
        title: 'Práctica: Componentes Reutilizables',
        type: 'practice',
        duration: '45:00',
        locked: true,
        description: 'Crea componentes reutilizables y escalables',
        resources: ['Component library starter', 'Design system']
      },
      {
        id: 'lesson-3-6',
        title: 'Custom Hooks',
        type: 'video',
        duration: '28:50',
        locked: true,
        description: 'Crea tus propios hooks personalizados',
        resources: ['Custom hooks examples', 'Hooks recipes']
      },
      {
        id: 'lesson-3-7',
        title: 'Context API',
        type: 'video',
        duration: '32:35',
        locked: true,
        description: 'Manejo de estado global con Context',
        resources: ['Context patterns', 'When to use Context']
      },
      {
        id: 'lesson-3-8',
        title: 'React Router',
        type: 'video',
        duration: '38:20',
        locked: true,
        description: 'Navegación en aplicaciones React',
        resources: ['Router documentation', 'Routing patterns']
      },
      {
        id: 'lesson-3-9',
        title: 'Forms y Validación',
        type: 'video',
        duration: '35:45',
        locked: true,
        description: 'Manejo de formularios en React',
        resources: ['Form libraries', 'Validation examples']
      },
      {
        id: 'lesson-3-10',
        title: 'API Calls con Fetch y Axios',
        type: 'video',
        duration: '40:15',
        locked: true,
        description: 'Consumo de APIs en React',
        resources: ['API integration guide', 'Error handling']
      },
      {
        id: 'lesson-3-11',
        title: 'Quiz: React Fundamentals',
        type: 'quiz',
        duration: '25:00',
        locked: true,
        quiz: {
          questions: 30,
          passingScore: 80
        },
        description: 'Evalúa tus conocimientos de React'
      },
      {
        id: 'lesson-3-12',
        title: 'Proyecto Final: App de E-commerce',
        type: 'project',
        duration: '8h 00m',
        locked: true,
        project: {
          difficulty: 'hard',
          estimatedTime: '8-12 horas'
        },
        description: 'Construye una tienda online completa con React',
        resources: ['API documentation', 'Design files', 'Requirements doc']
      }
    ]
  },
  {
    id: 'module-4',
    title: 'Node.js y Express',
    description: 'Backend con Node.js y Express',
    duration: '10h 30m',
    locked: true,
    lessons: [
      {
        id: 'lesson-4-1',
        title: 'Introducción a Node.js',
        type: 'video',
        duration: '25:30',
        locked: true,
        description: 'Event loop, módulos y npm',
        resources: ['Node.js documentation', 'Best practices']
      },
      {
        id: 'lesson-4-2',
        title: 'Express: Setup y Routing',
        type: 'video',
        duration: '30:45',
        locked: true,
        description: 'Crea tu primer servidor con Express',
        resources: ['Express guide', 'Routing examples']
      },
      {
        id: 'lesson-4-3',
        title: 'Middleware y Error Handling',
        type: 'video',
        duration: '35:20',
        locked: true,
        description: 'Middleware personalizado y manejo de errores',
        resources: ['Middleware patterns', 'Error handling guide']
      },
      {
        id: 'lesson-4-4',
        title: 'RESTful APIs',
        type: 'video',
        duration: '40:15',
        locked: true,
        description: 'Diseña y construye APIs RESTful',
        resources: ['REST best practices', 'API design guide']
      },
      {
        id: 'lesson-4-5',
        title: 'MongoDB y Mongoose',
        type: 'video',
        duration: '45:30',
        locked: true,
        description: 'Base de datos NoSQL con MongoDB',
        resources: ['MongoDB atlas setup', 'Schema design']
      },
      {
        id: 'lesson-4-6',
        title: 'Autenticación con JWT',
        type: 'video',
        duration: '38:40',
        locked: true,
        description: 'Implementa autenticación segura',
        resources: ['JWT guide', 'Security best practices']
      },
      {
        id: 'lesson-4-7',
        title: 'File Upload y Storage',
        type: 'video',
        duration: '32:25',
        locked: true,
        description: 'Manejo de archivos y almacenamiento',
        resources: ['Multer documentation', 'Cloud storage options']
      },
      {
        id: 'lesson-4-8',
        title: 'Testing con Jest',
        type: 'video',
        duration: '35:50',
        locked: true,
        description: 'Tests unitarios y de integración',
        resources: ['Jest documentation', 'Testing patterns']
      },
      {
        id: 'lesson-4-9',
        title: 'Deployment y CI/CD',
        type: 'video',
        duration: '28:35',
        locked: true,
        description: 'Despliega tu aplicación a producción',
        resources: ['Deployment guide', 'CI/CD setup']
      },
      {
        id: 'lesson-4-10',
        title: 'Proyecto: API de Blog',
        type: 'project',
        duration: '6h 00m',
        locked: true,
        project: {
          difficulty: 'hard',
          estimatedTime: '6-9 horas'
        },
        description: 'Crea una API completa para un blog',
        resources: ['API spec', 'Database schema', 'Postman collection']
      }
    ]
  }
];

// Curso: TypeScript Advanced
export const typeScriptModules: Module[] = [
  {
    id: 'ts-module-1',
    title: 'TypeScript Fundamentals',
    description: 'Aprende los fundamentos del sistema de tipos',
    duration: '6h 20m',
    lessons: [
      {
        id: 'ts-lesson-1-1',
        title: 'Why TypeScript?',
        type: 'video',
        duration: '18:30',
        completed: true,
        description: 'Ventajas de TypeScript sobre JavaScript',
        resources: ['TypeScript handbook', 'Migration guide']
      },
      {
        id: 'ts-lesson-1-2',
        title: 'Type Annotations y Inference',
        type: 'video',
        duration: '25:45',
        completed: false,
        description: 'Anotaciones de tipo e inferencia',
        resources: ['Type system guide', 'Examples']
      },
      {
        id: 'ts-lesson-1-3',
        title: 'Interfaces vs Types',
        type: 'video',
        duration: '22:30',
        description: 'Cuándo usar cada uno',
        resources: ['Best practices', 'Comparison table']
      },
      {
        id: 'ts-lesson-1-4',
        title: 'Práctica: Type Safety',
        type: 'code',
        duration: '45:00',
        code: {
          language: 'typescript',
          exercises: 12
        },
        description: 'Ejercicios de tipado seguro',
        resources: ['Starter code', 'Test suite']
      },
      {
        id: 'ts-lesson-1-5',
        title: 'Quiz: TypeScript Basics',
        type: 'quiz',
        duration: '15:00',
        quiz: {
          questions: 15,
          passingScore: 80
        },
        description: 'Evalúa tus conocimientos básicos'
      }
    ]
  },
  {
    id: 'ts-module-2',
    title: 'Advanced Types',
    description: 'Tipos avanzados y patrones',
    duration: '8h 45m',
    locked: true,
    lessons: [
      {
        id: 'ts-lesson-2-1',
        title: 'Generics',
        type: 'video',
        duration: '35:20',
        locked: true,
        description: 'Tipos genéricos y constraints',
        resources: ['Generics guide', 'Real-world examples']
      },
      {
        id: 'ts-lesson-2-2',
        title: 'Utility Types',
        type: 'video',
        duration: '30:15',
        locked: true,
        description: 'Partial, Pick, Omit, Record y más',
        resources: ['Utility types reference', 'Use cases']
      },
      {
        id: 'ts-lesson-2-3',
        title: 'Conditional Types',
        type: 'video',
        duration: '28:40',
        locked: true,
        description: 'Tipos condicionales avanzados',
        resources: ['Advanced patterns', 'Type challenges']
      },
      {
        id: 'ts-lesson-2-4',
        title: 'Mapped Types',
        type: 'video',
        duration: '32:25',
        locked: true,
        description: 'Transforma tipos dinámicamente',
        resources: ['Mapped types guide', 'Examples']
      },
      {
        id: 'ts-lesson-2-5',
        title: 'Template Literal Types',
        type: 'video',
        duration: '25:50',
        locked: true,
        description: 'Tipos de string avanzados',
        resources: ['Template literals docs', 'Patterns']
      },
      {
        id: 'ts-lesson-2-6',
        title: 'Proyecto: Type-Safe API Client',
        type: 'project',
        duration: '4h 00m',
        locked: true,
        project: {
          difficulty: 'hard',
          estimatedTime: '4-6 horas'
        },
        description: 'Crea un cliente API completamente tipado',
        resources: ['Starter template', 'API specification']
      }
    ]
  }
];

// Curso: Python Data Science
export const pythonDataScienceModules: Module[] = [
  {
    id: 'py-module-1',
    title: 'Python Essentials',
    description: 'Fundamentos de Python para Data Science',
    duration: '7h 30m',
    lessons: [
      {
        id: 'py-lesson-1-1',
        title: 'Python Basics',
        type: 'video',
        duration: '22:30',
        completed: true,
        description: 'Sintaxis, variables y tipos de datos',
        resources: ['Python cheatsheet', 'Official docs']
      },
      {
        id: 'py-lesson-1-2',
        title: 'Data Structures',
        type: 'video',
        duration: '28:45',
        completed: false,
        description: 'Listas, tuplas, sets y diccionarios',
        resources: ['Data structures guide', 'Performance comparison']
      },
      {
        id: 'py-lesson-1-3',
        title: 'Functions and Lambdas',
        type: 'video',
        duration: '25:20',
        description: 'Funciones, lambdas y comprehensions',
        resources: ['Function examples', 'Best practices']
      },
      {
        id: 'py-lesson-1-4',
        title: 'OOP in Python',
        type: 'video',
        duration: '35:40',
        description: 'Programación orientada a objetos',
        resources: ['OOP patterns', 'Class examples']
      },
      {
        id: 'py-lesson-1-5',
        title: 'Práctica: Python Fundamentals',
        type: 'code',
        duration: '60:00',
        code: {
          language: 'python',
          exercises: 20
        },
        description: 'Ejercicios de Python básico',
        resources: ['Jupyter notebooks', 'Solutions']
      },
      {
        id: 'py-lesson-1-6',
        title: 'Quiz: Python Essentials',
        type: 'quiz',
        duration: '18:00',
        quiz: {
          questions: 20,
          passingScore: 75
        },
        description: 'Evalúa tus conocimientos de Python'
      }
    ]
  },
  {
    id: 'py-module-2',
    title: 'NumPy y Pandas',
    description: 'Manipulación de datos con NumPy y Pandas',
    duration: '10h 15m',
    locked: true,
    lessons: [
      {
        id: 'py-lesson-2-1',
        title: 'NumPy Arrays',
        type: 'video',
        duration: '30:25',
        locked: true,
        description: 'Arrays multidimensionales y operaciones',
        resources: ['NumPy documentation', 'Array operations guide']
      },
      {
        id: 'py-lesson-2-2',
        title: 'Broadcasting y Vectorización',
        type: 'video',
        duration: '28:35',
        locked: true,
        description: 'Operaciones eficientes con NumPy',
        resources: ['Broadcasting tutorial', 'Performance tips']
      },
      {
        id: 'py-lesson-2-3',
        title: 'Pandas DataFrames',
        type: 'video',
        duration: '35:50',
        locked: true,
        description: 'Manipulación de datos tabulares',
        resources: ['Pandas cheatsheet', 'DataFrame operations']
      },
      {
        id: 'py-lesson-2-4',
        title: 'Data Cleaning',
        type: 'video',
        duration: '40:20',
        locked: true,
        description: 'Limpieza y preparación de datos',
        resources: ['Cleaning techniques', 'Real datasets']
      },
      {
        id: 'py-lesson-2-5',
        title: 'GroupBy y Aggregation',
        type: 'video',
        duration: '32:45',
        locked: true,
        description: 'Agrupación y agregación de datos',
        resources: ['GroupBy examples', 'Aggregation functions']
      },
      {
        id: 'py-lesson-2-6',
        title: 'Merge, Join y Concat',
        type: 'video',
        duration: '28:30',
        locked: true,
        description: 'Combinación de datasets',
        resources: ['Merge guide', 'SQL comparison']
      },
      {
        id: 'py-lesson-2-7',
        title: 'Práctica: Data Wrangling',
        type: 'practice',
        duration: '90:00',
        locked: true,
        description: 'Análisis exploratorio de datos reales',
        resources: ['Dataset', 'Jupyter notebook', 'Solution']
      },
      {
        id: 'py-lesson-2-8',
        title: 'Proyecto: Análisis de Ventas',
        type: 'project',
        duration: '5h 00m',
        locked: true,
        project: {
          difficulty: 'medium',
          estimatedTime: '5-7 horas'
        },
        description: 'Análisis completo de datos de ventas',
        resources: ['Sales dataset', 'Analysis template', 'Rubric']
      }
    ]
  },
  {
    id: 'py-module-3',
    title: 'Machine Learning',
    description: 'Introducción al Machine Learning con scikit-learn',
    duration: '12h 45m',
    locked: true,
    lessons: [
      {
        id: 'py-lesson-3-1',
        title: 'ML Fundamentals',
        type: 'video',
        duration: '25:30',
        locked: true,
        description: 'Tipos de ML y conceptos básicos',
        resources: ['ML glossary', 'Algorithm cheatsheet']
      },
      {
        id: 'py-lesson-3-2',
        title: 'Linear Regression',
        type: 'video',
        duration: '35:45',
        locked: true,
        description: 'Regresión lineal simple y múltiple',
        resources: ['Math behind regression', 'Implementation guide']
      },
      {
        id: 'py-lesson-3-3',
        title: 'Classification Algorithms',
        type: 'video',
        duration: '40:20',
        locked: true,
        description: 'Logistic regression, Decision Trees, Random Forest',
        resources: ['Algorithm comparison', 'Use cases']
      },
      {
        id: 'py-lesson-3-4',
        title: 'Model Evaluation',
        type: 'video',
        duration: '32:15',
        locked: true,
        description: 'Métricas y validación de modelos',
        resources: ['Metrics guide', 'Cross-validation tutorial']
      },
      {
        id: 'py-lesson-3-5',
        title: 'Feature Engineering',
        type: 'video',
        duration: '38:40',
        locked: true,
        description: 'Creación y selección de features',
        resources: ['Feature engineering techniques', 'Best practices']
      },
      {
        id: 'py-lesson-3-6',
        title: 'Proyecto Final: Predictor de Precios',
        type: 'project',
        duration: '8h 00m',
        locked: true,
        project: {
          difficulty: 'hard',
          estimatedTime: '8-12 horas'
        },
        description: 'Crea un modelo predictor de precios de viviendas',
        resources: ['Housing dataset', 'Feature dictionary', 'Evaluation criteria']
      }
    ]
  }
];

// Export all modules by course
export const courseModulesMap: Record<string, Module[]> = {
  '1': fullStackModules,
  '2': fullStackModules, // React course - usar módulos similares
  '3': fullStackModules, // Node.js - usar módulos similares
  '4': fullStackModules, // Vue.js - usar módulos similares
  '5': typeScriptModules,
  '6': fullStackModules, // UI/UX - usar módulos similares por ahora
  '7': fullStackModules, // Figma
  '8': pythonDataScienceModules,
  '9': pythonDataScienceModules, // SQL - usar módulos similares
  '10': fullStackModules, // React Native
  '11': fullStackModules, // Flutter
  '12': fullStackModules, // DevOps
  '13': fullStackModules, // AWS
  '14': fullStackModules, // Security
  '15': fullStackModules, // Blockchain
  '16': fullStackModules, // Angular
  '17': fullStackModules, // GraphQL
  '18': fullStackModules, // Go
  '19': fullStackModules, // Rust
  '20': fullStackModules, // Swift
  '21': fullStackModules, // Kotlin
  '22': fullStackModules, // Unity
  '23': fullStackModules, // Unreal Engine
  '24': fullStackModules, // Blender
  '25': fullStackModules, // After Effects
  '26': fullStackModules, // Illustrator
  '27': fullStackModules, // Photoshop
  '28': fullStackModules, // Marketing
  '29': fullStackModules, // SEO
  '30': fullStackModules, // Google Ads
  '31': pythonDataScienceModules, // AI/ML
  '32': pythonDataScienceModules, // ChatGPT
  '33': fullStackModules, // Cybersecurity
  // Add more course mappings as needed
};