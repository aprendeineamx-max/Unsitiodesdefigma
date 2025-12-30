export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'quiz' | 'audio' | 'exercise' | 'infographic';
  duration: number; // in minutes
  completed: boolean;
  locked: boolean;
  url?: string;
  description?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
  progress: number;
}

export interface CourseUnit {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
}

export const courseModules: CourseModule[] = [
  {
    id: '1',
    title: 'Introducción a React',
    progress: 75,
    lessons: [
      {
        id: '1-1',
        title: 'Bienvenida al curso de React',
        type: 'video',
        duration: 5,
        completed: true,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Conoce qué aprenderás en este curso y cómo aprovechar al máximo el contenido.'
      },
      {
        id: '1-2',
        title: 'Historia y evolución de React',
        type: 'pdf',
        duration: 8,
        completed: true,
        locked: false,
        description: 'Descubre cómo React revolucionó el desarrollo web y por qué es tan popular.'
      },
      {
        id: '1-3',
        title: 'Infografía: Ecosistema React',
        type: 'infographic',
        duration: 5,
        completed: true,
        locked: false,
        description: 'Visualiza las herramientas y librerías más importantes del ecosistema React.'
      },
      {
        id: '1-4',
        title: 'Configuración del entorno de desarrollo',
        type: 'pdf',
        duration: 10,
        completed: true,
        locked: false,
        description: 'Guía paso a paso para instalar Node.js, VS Code y crear tu primer proyecto.'
      },
      {
        id: '1-5',
        title: 'Video: Tu primer proyecto React',
        type: 'video',
        duration: 15,
        completed: true,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Crea tu primera aplicación React desde cero usando Create React App.'
      },
      {
        id: '1-6',
        title: 'Audioclase: Pensando en React',
        type: 'audio',
        duration: 12,
        completed: true,
        locked: false,
        description: 'Aprende a pensar en componentes y estructura de aplicaciones React.'
      },
      {
        id: '1-7',
        title: 'Quiz: Fundamentos de React',
        type: 'quiz',
        duration: 15,
        completed: true,
        locked: false,
        description: 'Evalúa tus conocimientos sobre los conceptos básicos de React.'
      }
    ]
  },
  {
    id: '2',
    title: 'JSX y Componentes',
    progress: 60,
    lessons: [
      {
        id: '2-1',
        title: 'Introducción a JSX',
        type: 'video',
        duration: 20,
        completed: true,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende qué es JSX y cómo escribir código declarativo en React.'
      },
      {
        id: '2-2',
        title: 'Lectura: Sintaxis JSX avanzada',
        type: 'pdf',
        duration: 12,
        completed: true,
        locked: false,
        description: 'Explora expresiones, fragmentos y renderizado condicional en JSX.'
      },
      {
        id: '2-3',
        title: 'Tu primer componente funcional',
        type: 'video',
        duration: 18,
        completed: true,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Crea tu primer componente funcional y aprende las mejores prácticas.'
      },
      {
        id: '2-4',
        title: 'Infografía: Anatomía de un componente',
        type: 'infographic',
        duration: 6,
        completed: false,
        locked: false,
        description: 'Visualiza las partes que componen un componente React moderno.'
      },
      {
        id: '2-5',
        title: 'Composición de componentes',
        type: 'video',
        duration: 25,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a combinar componentes para crear interfaces complejas.'
      },
      {
        id: '2-6',
        title: 'Audioclase: Componentización efectiva',
        type: 'audio',
        duration: 15,
        completed: false,
        locked: false,
        description: 'Escucha estrategias para dividir tu aplicación en componentes reutilizables.'
      },
      {
        id: '2-7',
        title: 'Ejercicio: Componente de tarjeta',
        type: 'exercise',
        duration: 30,
        completed: false,
        locked: false,
        description: 'Construye un componente de tarjeta reutilizable con diferentes variantes.'
      },
      {
        id: '2-8',
        title: 'Quiz: JSX y Componentes',
        type: 'quiz',
        duration: 10,
        completed: false,
        locked: false,
        description: 'Demuestra tu comprensión de JSX y la composición de componentes.'
      }
    ]
  },
  {
    id: '3',
    title: 'Props y Comunicación',
    progress: 40,
    lessons: [
      {
        id: '3-1',
        title: 'Entendiendo las Props',
        type: 'video',
        duration: 22,
        completed: true,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende cómo pasar datos entre componentes usando props.'
      },
      {
        id: '3-2',
        title: 'Lectura: Props vs State',
        type: 'pdf',
        duration: 10,
        completed: true,
        locked: false,
        description: 'Entiende las diferencias fundamentales entre props y state.'
      },
      {
        id: '3-3',
        title: 'Infografía: Flujo de datos en React',
        type: 'infographic',
        duration: 7,
        completed: false,
        locked: false,
        description: 'Visualiza cómo fluyen los datos de padres a hijos en React.'
      },
      {
        id: '3-4',
        title: 'PropTypes y validación',
        type: 'video',
        duration: 16,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a validar las props para evitar errores en tiempo de ejecución.'
      },
      {
        id: '3-5',
        title: 'Audioclase: Mejores prácticas con Props',
        type: 'audio',
        duration: 14,
        completed: false,
        locked: false,
        description: 'Escucha consejos sobre nomenclatura y estructuración de props.'
      },
      {
        id: '3-6',
        title: 'Comunicación padre-hijo',
        type: 'video',
        duration: 20,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende patrones para comunicar componentes padres con hijos.'
      },
      {
        id: '3-7',
        title: 'Ejercicio: Sistema de filtros',
        type: 'exercise',
        duration: 35,
        completed: false,
        locked: false,
        description: 'Crea un sistema de filtros usando props y callbacks.'
      },
      {
        id: '3-8',
        title: 'Quiz: Props y comunicación',
        type: 'quiz',
        duration: 12,
        completed: false,
        locked: false,
        description: 'Evalúa tu conocimiento sobre props y comunicación entre componentes.'
      }
    ]
  },
  {
    id: '4',
    title: 'Estado con useState',
    progress: 25,
    lessons: [
      {
        id: '4-1',
        title: 'Introducción al estado',
        type: 'video',
        duration: 18,
        completed: true,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Descubre qué es el estado y por qué es fundamental en React.'
      },
      {
        id: '4-2',
        title: 'Hook useState en profundidad',
        type: 'video',
        duration: 25,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a usar useState para manejar el estado de tus componentes.'
      },
      {
        id: '4-3',
        title: 'Lectura: Estado inmutable',
        type: 'pdf',
        duration: 12,
        completed: false,
        locked: false,
        description: 'Entiende por qué es importante no mutar el estado directamente.'
      },
      {
        id: '4-4',
        title: 'Infografía: Ciclo de actualización del estado',
        type: 'infographic',
        duration: 8,
        completed: false,
        locked: false,
        description: 'Visualiza cómo React actualiza el estado y re-renderiza componentes.'
      },
      {
        id: '4-5',
        title: 'Estado con objetos y arrays',
        type: 'video',
        duration: 28,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Maneja estructuras de datos complejas en el estado.'
      },
      {
        id: '4-6',
        title: 'Audioclase: Patrones de estado',
        type: 'audio',
        duration: 16,
        completed: false,
        locked: false,
        description: 'Escucha sobre patrones comunes para organizar el estado.'
      },
      {
        id: '4-7',
        title: 'Estado derivado',
        type: 'video',
        duration: 15,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende cuándo calcular valores en lugar de guardarlos en el estado.'
      },
      {
        id: '4-8',
        title: 'Ejercicio: Contador avanzado',
        type: 'exercise',
        duration: 25,
        completed: false,
        locked: false,
        description: 'Crea un contador con múltiples funcionalidades usando useState.'
      },
      {
        id: '4-9',
        title: 'Ejercicio: Lista de tareas',
        type: 'exercise',
        duration: 40,
        completed: false,
        locked: false,
        description: 'Construye una aplicación de lista de tareas completa.'
      },
      {
        id: '4-10',
        title: 'Quiz: Estado y useState',
        type: 'quiz',
        duration: 15,
        completed: false,
        locked: false,
        description: 'Demuestra tu dominio del manejo de estado en React.'
      }
    ]
  },
  {
    id: '5',
    title: 'Efectos y useEffect',
    progress: 0,
    lessons: [
      {
        id: '5-1',
        title: 'Introducción a los efectos',
        type: 'video',
        duration: 20,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende qué son los efectos secundarios en React.'
      },
      {
        id: '5-2',
        title: 'Lectura: Ciclo de vida de componentes',
        type: 'pdf',
        duration: 14,
        completed: false,
        locked: false,
        description: 'Comprende el ciclo de vida y cómo useEffect se relaciona con él.'
      },
      {
        id: '5-3',
        title: 'useEffect básico',
        type: 'video',
        duration: 25,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a ejecutar código después del renderizado.'
      },
      {
        id: '5-4',
        title: 'Infografía: Anatomía de useEffect',
        type: 'infographic',
        duration: 6,
        completed: false,
        locked: false,
        description: 'Visualiza las partes de useEffect: efecto, dependencias y cleanup.'
      },
      {
        id: '5-5',
        title: 'Array de dependencias',
        type: 'video',
        duration: 22,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Controla cuándo se ejecutan tus efectos con dependencias.'
      },
      {
        id: '5-6',
        title: 'Cleanup de efectos',
        type: 'video',
        duration: 18,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a limpiar efectos para evitar memory leaks.'
      },
      {
        id: '5-7',
        title: 'Audioclase: Errores comunes con useEffect',
        type: 'audio',
        duration: 17,
        completed: false,
        locked: false,
        description: 'Escucha sobre los errores más frecuentes y cómo evitarlos.'
      },
      {
        id: '5-8',
        title: 'Fetching de datos con useEffect',
        type: 'video',
        duration: 30,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a cargar datos de APIs usando useEffect.'
      },
      {
        id: '5-9',
        title: 'Ejercicio: Buscador en tiempo real',
        type: 'exercise',
        duration: 35,
        completed: false,
        locked: false,
        description: 'Crea un buscador que consulte una API mientras el usuario escribe.'
      },
      {
        id: '5-10',
        title: 'Quiz: useEffect',
        type: 'quiz',
        duration: 12,
        completed: false,
        locked: false,
        description: 'Evalúa tu comprensión de efectos y useEffect.'
      }
    ]
  },
  {
    id: '6',
    title: 'Hooks Avanzados',
    progress: 0,
    lessons: [
      {
        id: '6-1',
        title: 'Introducción a hooks avanzados',
        type: 'video',
        duration: 15,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Conoce los hooks más allá de useState y useEffect.'
      },
      {
        id: '6-2',
        title: 'useContext para estado global',
        type: 'video',
        duration: 28,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Maneja estado compartido entre componentes con Context API.'
      },
      {
        id: '6-3',
        title: 'Lectura: Context API en profundidad',
        type: 'pdf',
        duration: 16,
        completed: false,
        locked: false,
        description: 'Entiende cuándo y cómo usar Context API correctamente.'
      },
      {
        id: '6-4',
        title: 'useReducer para estado complejo',
        type: 'video',
        duration: 32,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a manejar lógica de estado compleja con useReducer.'
      },
      {
        id: '6-5',
        title: 'Infografía: useState vs useReducer',
        type: 'infographic',
        duration: 8,
        completed: false,
        locked: false,
        description: 'Compara cuándo usar cada hook para manejar estado.'
      },
      {
        id: '6-6',
        title: 'useRef y referencias',
        type: 'video',
        duration: 20,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Accede a elementos del DOM y guarda valores mutables.'
      },
      {
        id: '6-7',
        title: 'useMemo y useCallback',
        type: 'video',
        duration: 26,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Optimiza el rendimiento memorizando valores y funciones.'
      },
      {
        id: '6-8',
        title: 'Audioclase: Optimización de rendimiento',
        type: 'audio',
        duration: 18,
        completed: false,
        locked: false,
        description: 'Escucha sobre técnicas avanzadas de optimización en React.'
      },
      {
        id: '6-9',
        title: 'Custom Hooks',
        type: 'video',
        duration: 30,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Crea tus propios hooks para reutilizar lógica.'
      },
      {
        id: '6-10',
        title: 'Ejercicio: Hook de formulario',
        type: 'exercise',
        duration: 40,
        completed: false,
        locked: false,
        description: 'Construye un custom hook para manejar formularios.'
      },
      {
        id: '6-11',
        title: 'Ejercicio: Hook de fetch',
        type: 'exercise',
        duration: 35,
        completed: false,
        locked: false,
        description: 'Crea un hook reutilizable para cargar datos de APIs.'
      },
      {
        id: '6-12',
        title: 'Quiz: Hooks avanzados',
        type: 'quiz',
        duration: 15,
        completed: false,
        locked: false,
        description: 'Demuestra tu dominio de los hooks avanzados de React.'
      }
    ]
  },
  {
    id: '7',
    title: 'Formularios y Validación',
    progress: 0,
    lessons: [
      {
        id: '7-1',
        title: 'Formularios controlados',
        type: 'video',
        duration: 22,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a manejar inputs con componentes controlados.'
      },
      {
        id: '7-2',
        title: 'Lectura: Componentes controlados vs no controlados',
        type: 'pdf',
        duration: 10,
        completed: false,
        locked: false,
        description: 'Comprende las diferencias y cuándo usar cada enfoque.'
      },
      {
        id: '7-3',
        title: 'Múltiples inputs',
        type: 'video',
        duration: 18,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Maneja formularios con múltiples campos de forma eficiente.'
      },
      {
        id: '7-4',
        title: 'Validación de formularios',
        type: 'video',
        duration: 25,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Implementa validación personalizada en tus formularios.'
      },
      {
        id: '7-5',
        title: 'Infografía: Estrategias de validación',
        type: 'infographic',
        duration: 7,
        completed: false,
        locked: false,
        description: 'Visualiza diferentes enfoques para validar formularios.'
      },
      {
        id: '7-6',
        title: 'Audioclase: UX en formularios',
        type: 'audio',
        duration: 14,
        completed: false,
        locked: false,
        description: 'Escucha sobre mejores prácticas de experiencia de usuario.'
      },
      {
        id: '7-7',
        title: 'React Hook Form',
        type: 'video',
        duration: 30,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a usar React Hook Form para formularios complejos.'
      },
      {
        id: '7-8',
        title: 'Ejercicio: Formulario de registro',
        type: 'exercise',
        duration: 40,
        completed: false,
        locked: false,
        description: 'Crea un formulario de registro completo con validación.'
      },
      {
        id: '7-9',
        title: 'Quiz: Formularios',
        type: 'quiz',
        duration: 10,
        completed: false,
        locked: false,
        description: 'Evalúa tu conocimiento sobre formularios en React.'
      }
    ]
  },
  {
    id: '8',
    title: 'Routing con React Router',
    progress: 0,
    lessons: [
      {
        id: '8-1',
        title: 'Introducción al routing',
        type: 'video',
        duration: 18,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende qué es el routing y por qué es importante en SPAs.'
      },
      {
        id: '8-2',
        title: 'Instalación de React Router',
        type: 'pdf',
        duration: 8,
        completed: false,
        locked: false,
        description: 'Guía para instalar y configurar React Router en tu proyecto.'
      },
      {
        id: '8-3',
        title: 'Rutas básicas',
        type: 'video',
        duration: 25,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Crea tus primeras rutas con BrowserRouter y Routes.'
      },
      {
        id: '8-4',
        title: 'Navegación con Link',
        type: 'video',
        duration: 15,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a navegar entre páginas sin recargar.'
      },
      {
        id: '8-5',
        title: 'Infografía: Estructura de routing',
        type: 'infographic',
        duration: 6,
        completed: false,
        locked: false,
        description: 'Visualiza cómo organizar las rutas de tu aplicación.'
      },
      {
        id: '8-6',
        title: 'Rutas dinámicas',
        type: 'video',
        duration: 22,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Maneja parámetros en las URLs con rutas dinámicas.'
      },
      {
        id: '8-7',
        title: 'Rutas anidadas',
        type: 'video',
        duration: 20,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Crea estructuras de navegación complejas con rutas anidadas.'
      },
      {
        id: '8-8',
        title: 'Audioclase: Arquitectura de navegación',
        type: 'audio',
        duration: 16,
        completed: false,
        locked: false,
        description: 'Escucha sobre patrones de organización de rutas.'
      },
      {
        id: '8-9',
        title: 'Protección de rutas',
        type: 'video',
        duration: 28,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Implementa rutas privadas que requieren autenticación.'
      },
      {
        id: '8-10',
        title: 'Ejercicio: Aplicación multi-página',
        type: 'exercise',
        duration: 45,
        completed: false,
        locked: false,
        description: 'Construye una aplicación completa con múltiples rutas.'
      },
      {
        id: '8-11',
        title: 'Quiz: React Router',
        type: 'quiz',
        duration: 12,
        completed: false,
        locked: false,
        description: 'Demuestra tu comprensión del routing en React.'
      }
    ]
  },
  {
    id: '9',
    title: 'Manejo de Estado Global',
    progress: 0,
    lessons: [
      {
        id: '9-1',
        title: 'Introducción al estado global',
        type: 'video',
        duration: 20,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Entiende cuándo necesitas estado global en tu aplicación.'
      },
      {
        id: '9-2',
        title: 'Lectura: Patrones de estado global',
        type: 'pdf',
        duration: 14,
        completed: false,
        locked: false,
        description: 'Explora diferentes soluciones para manejar estado global.'
      },
      {
        id: '9-3',
        title: 'Context API avanzado',
        type: 'video',
        duration: 30,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Usa Context API para crear un store de estado global.'
      },
      {
        id: '9-4',
        title: 'Introducción a Redux',
        type: 'video',
        duration: 25,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Conoce Redux, la librería más popular para estado global.'
      },
      {
        id: '9-5',
        title: 'Infografía: Flujo de datos en Redux',
        type: 'infographic',
        duration: 8,
        completed: false,
        locked: false,
        description: 'Visualiza el flujo unidireccional de datos en Redux.'
      },
      {
        id: '9-6',
        title: 'Redux Toolkit',
        type: 'video',
        duration: 35,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende la forma moderna de usar Redux con Redux Toolkit.'
      },
      {
        id: '9-7',
        title: 'Audioclase: Zustand y alternativas',
        type: 'audio',
        duration: 18,
        completed: false,
        locked: false,
        description: 'Descubre librerías alternativas para estado global.'
      },
      {
        id: '9-8',
        title: 'Middleware en Redux',
        type: 'video',
        duration: 22,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Extiende Redux con middleware para lógica asíncrona.'
      },
      {
        id: '9-9',
        title: 'Ejercicio: Carrito de compras global',
        type: 'exercise',
        duration: 50,
        completed: false,
        locked: false,
        description: 'Implementa un carrito de compras con estado global.'
      },
      {
        id: '9-10',
        title: 'Quiz: Estado global',
        type: 'quiz',
        duration: 15,
        completed: false,
        locked: false,
        description: 'Evalúa tu conocimiento sobre manejo de estado global.'
      }
    ]
  },
  {
    id: '10',
    title: 'Estilización en React',
    progress: 0,
    lessons: [
      {
        id: '10-1',
        title: 'Opciones de estilización',
        type: 'video',
        duration: 18,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Conoce las diferentes formas de estilizar componentes React.'
      },
      {
        id: '10-2',
        title: 'CSS Modules',
        type: 'video',
        duration: 20,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a usar CSS Modules para estilos con scope local.'
      },
      {
        id: '10-3',
        title: 'Styled Components',
        type: 'video',
        duration: 28,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Escribe CSS en JavaScript con styled-components.'
      },
      {
        id: '10-4',
        title: 'Lectura: CSS-in-JS en profundidad',
        type: 'pdf',
        duration: 12,
        completed: false,
        locked: false,
        description: 'Comprende los pros y contras de CSS-in-JS.'
      },
      {
        id: '10-5',
        title: 'Tailwind CSS con React',
        type: 'video',
        duration: 25,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a usar Tailwind CSS en proyectos React.'
      },
      {
        id: '10-6',
        title: 'Infografía: Comparación de estilos',
        type: 'infographic',
        duration: 7,
        completed: false,
        locked: false,
        description: 'Compara diferentes métodos de estilización en React.'
      },
      {
        id: '10-7',
        title: 'Audioclase: Design Systems',
        type: 'audio',
        duration: 16,
        completed: false,
        locked: false,
        description: 'Escucha sobre cómo crear sistemas de diseño escalables.'
      },
      {
        id: '10-8',
        title: 'Temas y modo oscuro',
        type: 'video',
        duration: 22,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Implementa temas dinámicos y modo oscuro en tu aplicación.'
      },
      {
        id: '10-9',
        title: 'Ejercicio: Sistema de componentes',
        type: 'exercise',
        duration: 45,
        completed: false,
        locked: false,
        description: 'Crea un sistema de componentes UI reutilizables estilizados.'
      },
      {
        id: '10-10',
        title: 'Quiz: Estilización',
        type: 'quiz',
        duration: 10,
        completed: false,
        locked: false,
        description: 'Demuestra tu conocimiento sobre estilización en React.'
      }
    ]
  },
  {
    id: '11',
    title: 'Testing en React',
    progress: 0,
    lessons: [
      {
        id: '11-1',
        title: 'Introducción al testing',
        type: 'video',
        duration: 20,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende por qué el testing es crucial en aplicaciones React.'
      },
      {
        id: '11-2',
        title: 'Lectura: Tipos de tests',
        type: 'pdf',
        duration: 12,
        completed: false,
        locked: false,
        description: 'Conoce unit tests, integration tests y e2e tests.'
      },
      {
        id: '11-3',
        title: 'Jest básico',
        type: 'video',
        duration: 25,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende los fundamentos de Jest, el framework de testing.'
      },
      {
        id: '11-4',
        title: 'React Testing Library',
        type: 'video',
        duration: 30,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Testea componentes React de forma efectiva.'
      },
      {
        id: '11-5',
        title: 'Infografía: Anatomía de un test',
        type: 'infographic',
        duration: 6,
        completed: false,
        locked: false,
        description: 'Visualiza la estructura de un test bien escrito.'
      },
      {
        id: '11-6',
        title: 'Testing de hooks',
        type: 'video',
        duration: 22,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a testear custom hooks.'
      },
      {
        id: '11-7',
        title: 'Audioclase: TDD con React',
        type: 'audio',
        duration: 18,
        completed: false,
        locked: false,
        description: 'Escucha sobre desarrollo guiado por tests.'
      },
      {
        id: '11-8',
        title: 'Mocking y spies',
        type: 'video',
        duration: 26,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a simular dependencias en tus tests.'
      },
      {
        id: '11-9',
        title: 'Ejercicio: Testear formulario',
        type: 'exercise',
        duration: 40,
        completed: false,
        locked: false,
        description: 'Escribe tests completos para un formulario de registro.'
      },
      {
        id: '11-10',
        title: 'Quiz: Testing',
        type: 'quiz',
        duration: 12,
        completed: false,
        locked: false,
        description: 'Evalúa tu comprensión del testing en React.'
      }
    ]
  },
  {
    id: '12',
    title: 'Optimización y Performance',
    progress: 0,
    lessons: [
      {
        id: '12-1',
        title: 'Introducción a la optimización',
        type: 'video',
        duration: 18,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a identificar problemas de rendimiento.'
      },
      {
        id: '12-2',
        title: 'Lectura: Profiler y DevTools',
        type: 'pdf',
        duration: 10,
        completed: false,
        locked: false,
        description: 'Usa las herramientas de React para medir performance.'
      },
      {
        id: '12-3',
        title: 'React.memo',
        type: 'video',
        duration: 20,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Previene re-renders innecesarios con React.memo.'
      },
      {
        id: '12-4',
        title: 'useMemo en profundidad',
        type: 'video',
        duration: 22,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Memoriza cálculos costosos con useMemo.'
      },
      {
        id: '12-5',
        title: 'useCallback en profundidad',
        type: 'video',
        duration: 20,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Memoriza funciones para evitar re-renders.'
      },
      {
        id: '12-6',
        title: 'Infografía: Técnicas de optimización',
        type: 'infographic',
        duration: 8,
        completed: false,
        locked: false,
        description: 'Visualiza las mejores prácticas de optimización.'
      },
      {
        id: '12-7',
        title: 'Lazy loading y Code splitting',
        type: 'video',
        duration: 25,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Carga componentes bajo demanda para mejorar el tiempo inicial.'
      },
      {
        id: '12-8',
        title: 'Audioclase: Patrones de optimización',
        type: 'audio',
        duration: 17,
        completed: false,
        locked: false,
        description: 'Escucha sobre patrones avanzados de optimización.'
      },
      {
        id: '12-9',
        title: 'Virtualización de listas',
        type: 'video',
        duration: 28,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Renderiza listas grandes eficientemente con react-window.'
      },
      {
        id: '12-10',
        title: 'Ejercicio: Optimizar app grande',
        type: 'exercise',
        duration: 45,
        completed: false,
        locked: false,
        description: 'Aplica técnicas de optimización a una aplicación compleja.'
      },
      {
        id: '12-11',
        title: 'Quiz: Performance',
        type: 'quiz',
        duration: 15,
        completed: false,
        locked: false,
        description: 'Demuestra tu dominio de optimización en React.'
      }
    ]
  },
  {
    id: '13',
    title: 'Proyecto Final',
    progress: 0,
    lessons: [
      {
        id: '13-1',
        title: 'Introducción al proyecto',
        type: 'video',
        duration: 15,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Conoce el proyecto final que construirás.'
      },
      {
        id: '13-2',
        title: 'Planificación y arquitectura',
        type: 'pdf',
        duration: 20,
        completed: false,
        locked: false,
        description: 'Aprende a planificar una aplicación React desde cero.'
      },
      {
        id: '13-3',
        title: 'Infografía: Arquitectura de la app',
        type: 'infographic',
        duration: 10,
        completed: false,
        locked: false,
        description: 'Visualiza la estructura completa del proyecto.'
      },
      {
        id: '13-4',
        title: 'Configuración inicial',
        type: 'video',
        duration: 25,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Configura el proyecto con todas las herramientas necesarias.'
      },
      {
        id: '13-5',
        title: 'Audioclase: Mejores prácticas finales',
        type: 'audio',
        duration: 20,
        completed: false,
        locked: false,
        description: 'Repasa todas las mejores prácticas aprendidas.'
      },
      {
        id: '13-6',
        title: 'Desarrollo Parte 1: UI',
        type: 'video',
        duration: 45,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Construye la interfaz de usuario del proyecto.'
      },
      {
        id: '13-7',
        title: 'Desarrollo Parte 2: Estado',
        type: 'video',
        duration: 40,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Implementa el manejo de estado de la aplicación.'
      },
      {
        id: '13-8',
        title: 'Desarrollo Parte 3: APIs',
        type: 'video',
        duration: 35,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Integra la aplicación con APIs externas.'
      },
      {
        id: '13-9',
        title: 'Desarrollo Parte 4: Testing',
        type: 'video',
        duration: 30,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Agrega tests completos a tu proyecto.'
      },
      {
        id: '13-10',
        title: 'Desarrollo Parte 5: Optimización',
        type: 'video',
        duration: 25,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Optimiza el rendimiento del proyecto final.'
      },
      {
        id: '13-11',
        title: 'Despliegue',
        type: 'video',
        duration: 20,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Aprende a desplegar tu aplicación en producción.'
      },
      {
        id: '13-12',
        title: 'Ejercicio: Proyecto completo',
        type: 'exercise',
        duration: 180,
        completed: false,
        locked: false,
        description: 'Completa el proyecto final aplicando todo lo aprendido.'
      },
      {
        id: '13-13',
        title: 'Quiz final del curso',
        type: 'quiz',
        duration: 30,
        completed: false,
        locked: false,
        description: 'Evaluación final que cubre todos los conceptos del curso.'
      },
      {
        id: '13-14',
        title: 'Cierre y próximos pasos',
        type: 'video',
        duration: 15,
        completed: false,
        locked: false,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Celebra tu logro y descubre cómo seguir aprendiendo.'
      }
    ]
  }
];

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: '¿Qué es JSX?',
    options: [
      'Un lenguaje de programación',
      'Una extensión de sintaxis para JavaScript',
      'Una librería de React',
      'Un framework'
    ],
    correctAnswer: 1,
    explanation: 'JSX es una extensión de sintaxis para JavaScript que permite escribir código similar a HTML en archivos JavaScript.'
  },
  {
    id: '2',
    question: '¿Cuál Hook se usa para manejar estado?',
    options: [
      'useEffect',
      'useState',
      'useContext',
      'useReducer'
    ],
    correctAnswer: 1,
    explanation: 'useState es el Hook básico para agregar estado a componentes funcionales.'
  },
  {
    id: '3',
    question: '¿Para qué sirve useEffect?',
    options: [
      'Para manejar estado',
      'Para ejecutar efectos secundarios',
      'Para crear componentes',
      'Para navegar entre páginas'
    ],
    correctAnswer: 1,
    explanation: 'useEffect se utiliza para ejecutar efectos secundarios como fetching de datos, suscripciones, o manipulación del DOM después del renderizado.'
  },
  {
    id: '4',
    question: '¿Qué son las props en React?',
    options: [
      'Variables globales',
      'Propiedades que se pasan de padres a hijos',
      'Funciones internas de React',
      'Métodos de clase'
    ],
    correctAnswer: 1,
    explanation: 'Las props son propiedades que se pasan de componentes padres a componentes hijos, permitiendo la comunicación y el flujo de datos.'
  },
  {
    id: '5',
    question: '¿Cuál es la diferencia entre state y props?',
    options: [
      'No hay diferencia',
      'State es inmutable, props es mutable',
      'State es interno y mutable, props son externas e inmutables',
      'Props se usan solo en clases'
    ],
    correctAnswer: 2,
    explanation: 'El estado es interno al componente y puede cambiar, mientras que las props vienen del exterior y son inmutables desde la perspectiva del componente hijo.'
  },
  {
    id: '6',
    question: '¿Qué hace React.memo?',
    options: [
      'Guarda datos en memoria',
      'Previene re-renders innecesarios',
      'Memoriza el estado',
      'Crea componentes nuevos'
    ],
    correctAnswer: 1,
    explanation: 'React.memo es un Higher Order Component que memoriza un componente, evitando que se re-renderice si sus props no han cambiado.'
  }
];

// Nueva estructura de 3 niveles: Unidades → Temas → Lecciones
export const courseUnits: CourseUnit[] = [
  {
    id: 'unit-1',
    title: 'Fundamentos de React',
    description: 'Domina los conceptos básicos y la sintaxis fundamental de React',
    modules: [
      courseModules[0], // Introducción a React
      courseModules[1], // JSX y Componentes
      courseModules[2], // Props y Comunicación
      courseModules[3]  // Estado con useState
    ]
  },
  {
    id: 'unit-2',
    title: 'Desarrollo Intermedio',
    description: 'Aprende hooks avanzados, formularios y navegación en React',
    modules: [
      courseModules[4], // Efectos y useEffect
      courseModules[5], // Hooks Avanzados
      courseModules[6], // Formularios y Validación
      courseModules[7]  // Routing con React Router
    ]
  },
  {
    id: 'unit-3',
    title: 'Desarrollo Avanzado',
    description: 'Gestión de estado global, estilos y testing profesional',
    modules: [
      courseModules[8],  // Manejo de Estado Global
      courseModules[9],  // Estilización en React
      courseModules[10]  // Testing en React
    ]
  },
  {
    id: 'unit-4',
    title: 'Producción y Proyecto Final',
    description: 'Optimización, mejores prácticas y proyecto completo de React',
    modules: [
      courseModules[11], // Optimización y Performance
      courseModules[12]  // Proyecto Final
    ]
  }
];