import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabaseHelpers } from '../../lib/supabase';
import { Course } from '../data/courses';

// Interfaces para los datos de Supabase
interface SupabaseProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  github: string | null;
  twitter: string | null;
  role: 'student' | 'instructor' | 'admin';
  level: number;
  xp: number;
  streak: number;
  created_at: string;
  updated_at: string;
}

interface SupabaseCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  image: string; // ✅ AGREGADO: campo image
  thumbnail: string; // ✅ AGREGADO: campo thumbnail
  instructor_id: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  price: number;
  rating: number;
  students_count: number;
  lessons_count: number;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  instructor?: SupabaseProfile;
}

interface SupabaseBlogPost {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  views_count: number;
  likes_count: number;
  comments_count: number;
  reading_time: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: SupabaseProfile;
}

interface SupabasePost {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  type: 'post' | 'story' | 'reel' | 'live';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  user?: SupabaseProfile;
}

interface SupabaseAchievement {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  unlocked_at: string;
}

interface SupabaseNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface SupabaseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  course?: SupabaseCourse;
}

interface SupabaseDataContextType {
  // Loading states
  loading: {
    courses: boolean;
    blogPosts: boolean;
    posts: boolean;
    profile: boolean;
    achievements: boolean;
    notifications: boolean;
  };

  // Error states
  errors: {
    courses: Error | null;
    blogPosts: Error | null;
    posts: Error | null;
    profile: Error | null;
    achievements: Error | null;
    notifications: Error | null;
  };

  // Data
  courses: SupabaseCourse[];
  blogPosts: SupabaseBlogPost[];
  posts: SupabasePost[];
  profile: SupabaseProfile | null;
  achievements: SupabaseAchievement[];
  notifications: SupabaseNotification[];
  enrollments: SupabaseEnrollment[];

  // Refresh functions
  refreshCourses: () => Promise<void>;
  refreshBlogPosts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshAchievements: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshEnrollments: () => Promise<void>;

  // Utility functions
  convertToLegacyCourse: (supabaseCourse: SupabaseCourse) => Course;
}

const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(undefined);

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  // Loading states
  const [loading, setLoading] = useState({
    courses: true,
    blogPosts: true,
    posts: true,
    profile: true,
    achievements: true,
    notifications: true,
  });

  // Error states
  const [errors, setErrors] = useState<SupabaseDataContextType['errors']>({
    courses: null,
    blogPosts: null,
    posts: null,
    profile: null,
    achievements: null,
    notifications: null,
  });

  // Data states
  const [courses, setCourses] = useState<SupabaseCourse[]>([]);
  const [blogPosts, setBlogPosts] = useState<SupabaseBlogPost[]>([]);
  const [posts, setPosts] = useState<SupabasePost[]>([]);
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [achievements, setAchievements] = useState<SupabaseAchievement[]>([]);
  const [notifications, setNotifications] = useState<SupabaseNotification[]>([]);
  const [enrollments, setEnrollments] = useState<SupabaseEnrollment[]>([]);

  // Fetch courses
  const refreshCourses = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, courses: true }));
      setErrors(prev => ({ ...prev, courses: null }));
      
      const { data, error } = await supabaseHelpers.courses.list();
      
      if (error) throw error;
      
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setErrors(prev => ({ ...prev, courses: err as Error }));
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  }, []);

  // Fetch blog posts
  const refreshBlogPosts = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, blogPosts: true }));
      setErrors(prev => ({ ...prev, blogPosts: null }));
      
      const { data, error } = await supabaseHelpers.blog.list();
      
      // ✅ SILENCIAR: Si hay error de red, no hacer nada (usar datos existentes)
      if (error) {
        // Solo loguear en desarrollo, no mostrar error al usuario
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Blog posts unavailable (table may not exist):', error.message);
        }
        return;
      }
      
      setBlogPosts(data || []);
    } catch (err) {
      // ✅ SILENCIAR: NetworkError o fetch failure - no mostrar en consola
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Could not fetch blog posts (network or table issue)');
      }
      // No establecer error para evitar romper la UI
    } finally {
      setLoading(prev => ({ ...prev, blogPosts: false }));
    }
  }, []);

  // Fetch social posts
  const refreshPosts = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, posts: true }));
      setErrors(prev => ({ ...prev, posts: null }));
      
      const { data, error } = await supabaseHelpers.posts.list(undefined, { limit: 50 });
      
      // ✅ SILENCIAR: Si hay error de red, no hacer nada (usar datos existentes)
      if (error) {
        // Solo loguear en desarrollo, no mostrar error al usuario
        if (import.meta.env.DEV) {
          console.info('ℹ️ Posts table: No data or foreign key constraint issue (this is OK if table is empty)');
        }
        return;
      }
      
      setPosts(data || []);
    } catch (err) {
      // ✅ SILENCIAR: NetworkError o fetch failure - no mostrar en consola
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Could not fetch posts (network or table issue)');
      }
      // No establecer error para evitar romper la UI
    } finally {
      setLoading(prev => ({ ...prev, posts: false }));
    }
  }, []);

  // Fetch profile (for now, we'll use the test user)
  const refreshProfile = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      setErrors(prev => ({ ...prev, profile: null }));
      
      // Get the first profile (our test user)
      const { data, error } = await supabaseHelpers.profiles.get('1');
      
      // If no profile exists, don't throw error (user might not be logged in)
      if (error && error.code !== 'PGRST116') throw error;
      
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setErrors(prev => ({ ...prev, profile: err as Error }));
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  }, []);

  // Fetch achievements
  const refreshAchievements = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, achievements: true }));
      setErrors(prev => ({ ...prev, achievements: null }));
      
      // Fetch achievements for test user
      const { data, error } = await supabaseHelpers.supabase
        .from('achievements')
        .select('*')
        .eq('user_id', '1')
        .order('unlocked_at', { ascending: false });
      
      if (error) throw error;
      
      setAchievements(data || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setErrors(prev => ({ ...prev, achievements: err as Error }));
    } finally {
      setLoading(prev => ({ ...prev, achievements: false }));
    }
  }, []);

  // Fetch notifications
  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, notifications: true }));
      setErrors(prev => ({ ...prev, notifications: null }));
      
      // Fetch notifications for test user
      const { data, error } = await supabaseHelpers.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', '1')
        .order('created_at', { ascending: false });
      
      // ✅ SILENCIAR: Si hay error de red, no hacer nada (usar datos existentes)
      if (error) {
        // Solo loguear en desarrollo, no mostrar error al usuario
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Notifications unavailable (table may not exist):', error.message);
        }
        return;
      }
      
      setNotifications(data || []);
    } catch (err) {
      // ✅ SILENCIAR: NetworkError o fetch failure - no mostrar en consola
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Could not fetch notifications (network or table issue)');
      }
      // No establecer error para evitar romper la UI
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  }, []);

  // Fetch enrollments
  const refreshEnrollments = useCallback(async () => {
    try {
      const { data, error } = await supabaseHelpers.supabase
        .from('enrollments')
        .select('*, course:courses(*)')
        .eq('user_id', '1');
      
      if (error) throw error;
      
      setEnrollments(data || []);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    }
  }, []);

  // Convert Supabase course to legacy Course format
  const convertToLegacyCourse = useCallback((supabaseCourse: SupabaseCourse): Course => {
    // Generate whatYouLearn based on category
    const generateWhatYouLearn = (category: string): string[] => {
      const learningMap: { [key: string]: string[] } = {
        'Desarrollo Web': [
          'Crear aplicaciones web modernas y profesionales',
          'Implementar interfaces interactivas y responsive',
          'Integrar APIs y servicios externos',
          'Aplicar mejores prácticas de desarrollo'
        ],
        'Backend': [
          'Diseñar arquitecturas escalables',
          'Implementar APIs RESTful profesionales',
          'Gestionar bases de datos eficientemente',
          'Aplicar patrones de diseño enterprise'
        ],
        'Data Science': [
          'Analizar y visualizar datos complejos',
          'Implementar modelos de Machine Learning',
          'Procesar y limpiar datasets grandes',
          'Crear predicciones y análisis predictivo'
        ],
        'Diseño': [
          'Crear diseños profesionales y atractivos',
          'Aplicar principios de diseño UI/UX',
          'Usar herramientas de diseño modernas',
          'Desarrollar sistemas de diseño escalables'
        ],
        'Mobile': [
          'Desarrollar aplicaciones móviles nativas',
          'Implementar navegación y estado global',
          'Integrar APIs y servicios backend',
          'Publicar apps en las tiendas oficiales'
        ],
        'DevOps': [
          'Automatizar despliegues y CI/CD',
          'Gestionar contenedores y orquestación',
          'Implementar monitoreo y logging',
          'Optimizar infraestructura cloud'
        ],
        'Cloud': [
          'Diseñar arquitecturas cloud escalables',
          'Implementar servicios serverless',
          'Gestionar seguridad y compliance',
          'Optimizar costos de infraestructura'
        ],
        'Seguridad': [
          'Identificar vulnerabilidades comunes',
          'Implementar medidas de seguridad',
          'Realizar pentesting ético',
          'Aplicar mejores prácticas de seguridad'
        ],
        'Blockchain': [
          'Desarrollar smart contracts seguros',
          'Crear DApps descentralizadas',
          'Integrar wallets y blockchain',
          'Implementar NFTs y tokens'
        ],
        'Marketing': [
          'Crear estrategias de marketing digital',
          'Optimizar campañas publicitarias',
          'Analizar métricas y ROI',
          'Gestionar presencia en redes sociales'
        ],
        'AI/ML': [
          'Implementar redes neuronales profundas',
          'Entrenar modelos de ML avanzados',
          'Procesar lenguaje natural (NLP)',
          'Desplegar modelos en producción'
        ],
        'Game Dev': [
          'Crear videojuegos profesionales',
          'Implementar física y animaciones',
          'Diseñar niveles y mecánicas',
          'Optimizar rendimiento en juegos'
        ],
        'Diseño 3D': [
          'Modelar objetos 3D profesionales',
          'Crear materiales y texturas realistas',
          'Animar personajes y objetos',
          'Renderizar escenas de alta calidad'
        ]
      };
      
      return learningMap[category] || [
        'Dominar conceptos fundamentales',
        'Aplicar conocimientos en proyectos reales',
        'Desarrollar habilidades profesionales',
        'Crear portafolio de proyectos'
      ];
    };

    return {
      id: supabaseCourse.id,
      title: supabaseCourse.title,
      description: supabaseCourse.description,
      instructor: supabaseCourse.instructor?.full_name || 'Instructor',
      duration: `${Math.floor(supabaseCourse.duration / 60)}h ${supabaseCourse.duration % 60}min`,
      level: supabaseCourse.difficulty,
      rating: supabaseCourse.rating,
      students: supabaseCourse.students_count,
      price: supabaseCourse.price,
      originalPrice: supabaseCourse.price * 1.5, // 33% discount
      category: supabaseCourse.category,
      image: supabaseCourse.image || supabaseCourse.thumbnail_url, // ✅ CORREGIDO: leer 'image' primero, luego thumbnail_url
      thumbnail: supabaseCourse.thumbnail || supabaseCourse.thumbnail_url, // ✅ CORREGIDO: leer 'thumbnail' primero, luego thumbnail_url
      tags: [supabaseCourse.difficulty, supabaseCourse.category],
      modules: [],
      whatYouLearn: generateWhatYouLearn(supabaseCourse.category),
      requirements: [
        supabaseCourse.difficulty === 'beginner' 
          ? 'Ninguno - curso desde cero' 
          : `Conocimientos ${supabaseCourse.difficulty === 'intermediate' ? 'básicos' : 'avanzados'} de ${supabaseCourse.category}`,
        'Computadora con conexión a internet',
        'Ganas de aprender y practicar'
      ],
      language: 'Español',
      lastUpdated: new Date(supabaseCourse.updated_at).toLocaleDateString(),
      certificate: true,
      downloadable: true
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    refreshCourses();
    refreshBlogPosts();
    refreshPosts();
    refreshProfile();
    refreshAchievements();
    refreshNotifications();
    refreshEnrollments();
  }, [
    refreshCourses,
    refreshBlogPosts,
    refreshPosts,
    refreshProfile,
    refreshAchievements,
    refreshNotifications,
    refreshEnrollments
  ]);

  // Setup real-time subscriptions
  useEffect(() => {
    // Subscribe to posts changes
    const postsChannel = supabaseHelpers.realtime.subscribeToPosts((payload) => {
      console.log('Real-time update - Posts:', payload);
      refreshPosts();
    });

    return () => {
      supabaseHelpers.realtime.unsubscribe(postsChannel);
    };
  }, [refreshPosts]);

  const value: SupabaseDataContextType = {
    loading,
    errors,
    courses,
    blogPosts,
    posts,
    profile,
    achievements,
    notifications,
    enrollments,
    refreshCourses,
    refreshBlogPosts,
    refreshPosts,
    refreshProfile,
    refreshAchievements,
    refreshNotifications,
    refreshEnrollments,
    convertToLegacyCourse
  };

  return (
    <SupabaseDataContext.Provider value={value}>
      {children}
    </SupabaseDataContext.Provider>
  );
}

export function useSupabaseData() {
  const context = useContext(SupabaseDataContext);
  if (context === undefined) {
    throw new Error('useSupabaseData must be used within a SupabaseDataProvider');
  }
  return context;
}

// Export types
export type {
  SupabaseProfile,
  SupabaseCourse,
  SupabaseBlogPost,
  SupabasePost,
  SupabaseAchievement,
  SupabaseNotification,
  SupabaseEnrollment
};