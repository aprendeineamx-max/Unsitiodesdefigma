export interface WikiArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  lastUpdated: string;
  contributors: number;
  views: number;
  sections: {
    id: string;
    title: string;
    content: string;
  }[];
}

export const wikiArticles: WikiArticle[] = [
  {
    id: '1',
    title: 'React Hooks',
    category: 'Desarrollo Web',
    content: 'Guía completa sobre React Hooks y su uso en aplicaciones modernas.',
    lastUpdated: '2024-12-20',
    contributors: 15,
    views: 5420,
    sections: [
      {
        id: '1',
        title: '¿Qué son los Hooks?',
        content: 'Los Hooks son funciones especiales que te permiten "enganchar" estado y otras características de React en componentes funcionales.'
      },
      {
        id: '2',
        title: 'useState',
        content: 'El Hook useState te permite agregar estado a componentes funcionales. Retorna un par: el valor del estado actual y una función para actualizarlo.'
      },
      {
        id: '3',
        title: 'useEffect',
        content: 'useEffect te permite realizar efectos secundarios en componentes funcionales. Es similar a componentDidMount, componentDidUpdate y componentWillUnmount combinados.'
      }
    ]
  },
  {
    id: '2',
    title: 'Machine Learning Básico',
    category: 'Data Science',
    content: 'Fundamentos de machine learning: conceptos, algoritmos y aplicaciones.',
    lastUpdated: '2024-12-19',
    contributors: 23,
    views: 8920,
    sections: [
      {
        id: '1',
        title: 'Introducción',
        content: 'Machine Learning es una rama de la IA que permite a las computadoras aprender de datos sin ser programadas explícitamente.'
      },
      {
        id: '2',
        title: 'Tipos de Aprendizaje',
        content: 'Existen tres tipos principales: supervisado, no supervisado y por refuerzo.'
      }
    ]
  }
];
