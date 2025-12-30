import { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader2, AlertCircle, ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getCourseContent } from '../data/professionalCoursesContent';

export function SupabaseDataInserter() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cleaning'>('idle');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [needsRLSDisable, setNeedsRLSDisable] = useState(false);
  const [showCleanOption, setShowCleanOption] = useState(false);

  // 33 cursos base con toda la información
  const coursesData = [
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000001',
      title: 'Curso Profesional de Desarrollo Web Full Stack',
      slug: 'desarrollo-web-full-stack',
      description: 'Domina el desarrollo web moderno desde cero hasta nivel profesional. Aprende HTML5, CSS3, JavaScript, React, Node.js y MongoDB.',
      thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
      category: 'Desarrollo Web',
      difficulty: 'intermediate',
      duration: 2700,
      price: 299,
      rating: 4.9,
      students_count: 15420,
      lessons_count: 135,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000002',
      title: 'React Avanzado: Hooks, Context y Performance',
      slug: 'react-avanzado-hooks-performance',
      description: 'Optimiza tus aplicaciones React con técnicas avanzadas. Domina Hooks, Context API, optimización y patrones profesionales.',
      thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
      category: 'Desarrollo Web',
      difficulty: 'advanced',
      duration: 1920,
      price: 249,
      rating: 4.8,
      students_count: 12340,
      lessons_count: 98,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000003',
      title: 'Node.js: Arquitectura de Microservicios',
      slug: 'nodejs-arquitectura-microservicios',
      description: 'Construye arquitecturas escalables con microservicios. Aprende Docker, Kubernetes, API Gateway y Message Queues.',
      thumbnail_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=600&fit=crop',
      category: 'Backend',
      difficulty: 'advanced',
      duration: 2400,
      price: 349,
      rating: 4.9,
      students_count: 9850,
      lessons_count: 120,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000004',
      title: 'Vue.js 3 Composition API Masterclass',
      slug: 'vuejs-3-composition-api',
      description: 'Domina Vue 3 y su nueva Composition API. Aprende a crear aplicaciones reactivas con Pinia y Vite.',
      thumbnail_url: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=800&h=600&fit=crop',
      category: 'Desarrollo Web',
      difficulty: 'intermediate',
      duration: 1680,
      price: 199,
      rating: 4.7,
      students_count: 7890,
      lessons_count: 85,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000005',
      title: 'TypeScript: De Cero a Experto',
      slug: 'typescript-cero-experto',
      description: 'Aprende TypeScript desde fundamentos hasta patrones avanzados. Generics, Decorators y Advanced Patterns.',
      thumbnail_url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop',
      category: 'Programación',
      difficulty: 'beginner',
      duration: 2100,
      price: 229,
      rating: 4.9,
      students_count: 14200,
      lessons_count: 105,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000006',
      title: 'UI/UX Design: Design Systems Profesionales',
      slug: 'uiux-design-systems',
      description: 'Crea sistemas de diseño escalables y consistentes. Aprende Figma, Design Tokens y Component Libraries.',
      thumbnail_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
      category: 'Diseño',
      difficulty: 'intermediate',
      duration: 1800,
      price: 279,
      rating: 4.8,
      students_count: 10500,
      lessons_count: 90,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000007',
      title: 'Figma Avanzado: Prototipado Interactivo',
      slug: 'figma-avanzado-prototipado',
      description: 'Prototipos interactivos de alta fidelidad con Figma. Auto Layout, Variants y Smart Animate.',
      thumbnail_url: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&h=600&fit=crop',
      category: 'Diseño',
      difficulty: 'advanced',
      duration: 1500,
      price: 199,
      rating: 4.7,
      students_count: 8900,
      lessons_count: 75,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000008',
      title: 'Python para Data Science y Machine Learning',
      slug: 'python-data-science-ml',
      description: 'De Python básico a Machine Learning avanzado. NumPy, Pandas, Scikit-learn, TensorFlow y más.',
      thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      category: 'Data Science',
      difficulty: 'beginner',
      duration: 3000,
      price: 329,
      rating: 4.9,
      students_count: 18900,
      lessons_count: 150,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000009',
      title: 'SQL Avanzado: Data Analytics',
      slug: 'sql-avanzado-analytics',
      description: 'Consultas complejas y optimización de bases de datos. PostgreSQL, MySQL y Query Optimization.',
      thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      category: 'Data Science',
      difficulty: 'intermediate',
      duration: 1680,
      price: 249,
      rating: 4.8,
      students_count: 11200,
      lessons_count: 84,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000010',
      title: 'React Native: Apps iOS y Android',
      slug: 'react-native-ios-android',
      description: 'Desarrolla apps nativas con React Native. Expo, Navigation, State Management y Native Modules.',
      thumbnail_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
      category: 'Mobile',
      difficulty: 'intermediate',
      duration: 2520,
      price: 299,
      rating: 4.7,
      students_count: 13400,
      lessons_count: 126,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000011',
      title: 'Flutter & Dart: Desarrollo Multiplataforma',
      slug: 'flutter-dart-multiplataforma',
      description: 'Apps hermosas con Flutter. Widgets, State Management y Firebase integration.',
      thumbnail_url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop',
      category: 'Mobile',
      difficulty: 'beginner',
      duration: 2280,
      price: 279,
      rating: 4.8,
      students_count: 10800,
      lessons_count: 114,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000012',
      title: 'DevOps: Docker, Kubernetes y CI/CD',
      slug: 'devops-docker-kubernetes',
      description: 'Automatización y despliegue continuo. Docker, Kubernetes, Jenkins, GitLab CI y AWS.',
      thumbnail_url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=600&fit=crop',
      category: 'DevOps',
      difficulty: 'advanced',
      duration: 2700,
      price: 349,
      rating: 4.9,
      students_count: 15600,
      lessons_count: 135,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000013',
      title: 'AWS Solutions Architect',
      slug: 'aws-solutions-architect',
      description: 'Prepárate para la certificación AWS. EC2, S3, RDS, Lambda, VPC y más.',
      thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
      category: 'Cloud',
      difficulty: 'intermediate',
      duration: 3120,
      price: 379,
      rating: 4.8,
      students_count: 12900,
      lessons_count: 156,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000014',
      title: 'Ethical Hacking y Seguridad Web',
      slug: 'ethical-hacking-seguridad',
      description: 'Aprende a proteger aplicaciones web. OWASP Top 10, Pentesting y Bug Bounty.',
      thumbnail_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
      category: 'Seguridad',
      difficulty: 'advanced',
      duration: 2400,
      price: 329,
      rating: 4.9,
      students_count: 9500,
      lessons_count: 120,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000015',
      title: 'Blockchain y Smart Contracts con Solidity',
      slug: 'blockchain-smart-contracts',
      description: 'Desarrolla DApps en Ethereum. Solidity, Web3.js, Truffle, IPFS y NFTs.',
      thumbnail_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
      category: 'Blockchain',
      difficulty: 'intermediate',
      duration: 2160,
      price: 299,
      rating: 4.7,
      students_count: 7800,
      lessons_count: 108,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000016',
      title: 'Angular 17: Aplicaciones Enterprise',
      slug: 'angular-17-enterprise',
      description: 'Aplicaciones empresariales con Angular. Signals, Standalone Components, RxJS y NgRx.',
      thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
      category: 'Desarrollo Web',
      difficulty: 'intermediate',
      duration: 2640,
      price: 289,
      rating: 4.8,
      students_count: 11300,
      lessons_count: 132,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000017',
      title: 'GraphQL: API Modernas',
      slug: 'graphql-api-modernas',
      description: 'APIs escalables con GraphQL. Apollo Server, Schema Design, Resolvers y Subscriptions.',
      thumbnail_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
      category: 'Backend',
      difficulty: 'intermediate',
      duration: 1560,
      price: 229,
      rating: 4.7,
      students_count: 8200,
      lessons_count: 78,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000018',
      title: 'Go (Golang): Backend de Alto Rendimiento',
      slug: 'golang-backend-alto-rendimiento',
      description: 'Servicios de alto rendimiento con Go. Concurrency, Goroutines, Channels y Microservices.',
      thumbnail_url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&h=600&fit=crop',
      category: 'Backend',
      difficulty: 'intermediate',
      duration: 2280,
      price: 279,
      rating: 4.9,
      students_count: 9700,
      lessons_count: 114,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000019',
      title: 'Rust: Programación de Sistemas',
      slug: 'rust-programacion-sistemas',
      description: 'Programación segura y eficiente con Rust. Ownership, Borrowing, Lifetimes y Async.',
      thumbnail_url: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=600&fit=crop',
      category: 'Programación',
      difficulty: 'advanced',
      duration: 2520,
      price: 299,
      rating: 4.8,
      students_count: 6800,
      lessons_count: 126,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000020',
      title: 'Swift y SwiftUI: Apps iOS Nativas',
      slug: 'swift-swiftui-ios',
      description: 'Desarrollo iOS moderno con SwiftUI. Swift, Combine, Core Data y más.',
      thumbnail_url: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=800&h=600&fit=crop',
      category: 'Mobile',
      difficulty: 'beginner',
      duration: 2400,
      price: 289,
      rating: 4.9,
      students_count: 10400,
      lessons_count: 120,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000021',
      title: 'Kotlin: Desarrollo Android Moderno',
      slug: 'kotlin-android-moderno',
      description: 'Apps Android con Jetpack Compose. Kotlin, Room, Coroutines y Architecture Components.',
      thumbnail_url: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&h=600&fit=crop',
      category: 'Mobile',
      difficulty: 'intermediate',
      duration: 2280,
      price: 279,
      rating: 4.7,
      students_count: 9200,
      lessons_count: 114,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000022',
      title: 'Unity: Desarrollo de Videojuegos 3D',
      slug: 'unity-videojuegos-3d',
      description: 'Crea videojuegos profesionales con Unity. C#, 3D Graphics, Physics, AI y Multiplayer.',
      thumbnail_url: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=600&fit=crop',
      category: 'Game Dev',
      difficulty: 'beginner',
      duration: 3000,
      price: 329,
      rating: 4.8,
      students_count: 14500,
      lessons_count: 150,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000023',
      title: 'Unreal Engine 5: Juegos AAA',
      slug: 'unreal-engine-5-juegos-aaa',
      description: 'Gráficos de última generación con UE5. Blueprints, C++, Nanite, Lumen y Metahuman.',
      thumbnail_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop',
      category: 'Game Dev',
      difficulty: 'advanced',
      duration: 3300,
      price: 379,
      rating: 4.9,
      students_count: 11200,
      lessons_count: 165,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000024',
      title: 'Blender: Modelado 3D y Animación',
      slug: 'blender-modelado-3d',
      description: 'Modelado, texturizado y animación 3D profesional con Blender.',
      thumbnail_url: 'https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=800&h=600&fit=crop',
      category: 'Diseño 3D',
      difficulty: 'beginner',
      duration: 2700,
      price: 249,
      rating: 4.8,
      students_count: 13700,
      lessons_count: 135,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000025',
      title: 'Adobe After Effects: Motion Graphics Pro',
      slug: 'after-effects-motion-graphics',
      description: 'Animaciones profesionales y motion graphics. Animation, Compositing, VFX y Typography.',
      thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop',
      category: 'Diseño',
      difficulty: 'intermediate',
      duration: 1920,
      price: 269,
      rating: 4.7,
      students_count: 9800,
      lessons_count: 96,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000026',
      title: 'Illustrator: Ilustración Digital Profesional',
      slug: 'illustrator-ilustracion-digital',
      description: 'Ilustración vectorial desde cero. Vector Art, Logo Design y Character Design.',
      thumbnail_url: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800&h=600&fit=crop',
      category: 'Diseño',
      difficulty: 'beginner',
      duration: 1680,
      price: 199,
      rating: 4.8,
      students_count: 11900,
      lessons_count: 84,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000027',
      title: 'Photoshop: Retoque y Composición Digital',
      slug: 'photoshop-retoque-composicion',
      description: 'Retoque fotográfico profesional. Photo Editing, Compositing y Color Grading.',
      thumbnail_url: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=600&fit=crop',
      category: 'Diseño',
      difficulty: 'intermediate',
      duration: 1800,
      price: 229,
      rating: 4.9,
      students_count: 15800,
      lessons_count: 90,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000028',
      title: 'Marketing Digital: Growth Hacking',
      slug: 'marketing-digital-growth-hacking',
      description: 'Estrategias de crecimiento exponencial. SEO, SEM, Social Media, Analytics y Conversion.',
      thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      category: 'Marketing',
      difficulty: 'intermediate',
      duration: 2100,
      price: 279,
      rating: 4.7,
      students_count: 13400,
      lessons_count: 105,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000029',
      title: 'SEO Avanzado: Posicionamiento Web',
      slug: 'seo-avanzado-posicionamiento',
      description: 'Domina el SEO técnico y on-page. Technical SEO, Link Building y Content Strategy.',
      thumbnail_url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=800&h=600&fit=crop',
      category: 'Marketing',
      difficulty: 'advanced',
      duration: 1440,
      price: 249,
      rating: 4.8,
      students_count: 10200,
      lessons_count: 72,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000030',
      title: 'Google Ads: Publicidad Digital ROI',
      slug: 'google-ads-publicidad-roi',
      description: 'Campañas rentables en Google Ads. Search Ads, Display, Shopping y Analytics.',
      thumbnail_url: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&h=600&fit=crop',
      category: 'Marketing',
      difficulty: 'intermediate',
      duration: 1560,
      price: 229,
      rating: 4.7,
      students_count: 9500,
      lessons_count: 78,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000031',
      title: 'Inteligencia Artificial: Deep Learning',
      slug: 'ia-deep-learning',
      description: 'Redes neuronales y deep learning. TensorFlow, PyTorch, CNNs, RNNs y GANs.',
      thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
      category: 'AI/ML',
      difficulty: 'advanced',
      duration: 2880,
      price: 349,
      rating: 4.9,
      students_count: 16700,
      lessons_count: 144,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000032',
      title: 'Machine Learning en Producción',
      slug: 'ml-produccion',
      description: 'MLOps y deploy de modelos en producción. Docker, Kubernetes, CI/CD para ML.',
      thumbnail_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop',
      category: 'AI/ML',
      difficulty: 'advanced',
      duration: 2400,
      price: 329,
      rating: 4.8,
      students_count: 8900,
      lessons_count: 120,
      status: 'published'
    },
    {
      id: 'a1b2c3d4-0001-4001-8001-000000000033',
      title: 'Procesamiento de Lenguaje Natural (NLP)',
      slug: 'nlp-procesamiento-lenguaje',
      description: 'NLP con transformers y modelos pre-entrenados. BERT, GPT, sentiment analysis.',
      thumbnail_url: 'https://images.unsplash.com/photo-1655720406100-3f1eda0a4519?w=800&h=600&fit=crop',
      category: 'AI/ML',
      difficulty: 'advanced',
      duration: 2160,
      price: 299,
      rating: 4.7,
      students_count: 7500,
      lessons_count: 108,
      status: 'published'
    }
  ];

  const cleanExistingCourses = async () => {
    setStatus('cleaning');
    setShowCleanOption(false);
    setMessage('Preparando limpieza...');
    
    try {
      const { data: existingCourses, error: fetchError } = await supabase
        .from('courses')
        .select('id');
      
      if (fetchError) {
        console.error('Error obteniendo cursos:', fetchError);
        throw new Error('No se pudieron obtener los cursos existentes');
      }

      if (existingCourses && existingCourses.length > 0) {
        const totalToDelete = existingCourses.length;
        
        for (let i = 0; i < existingCourses.length; i++) {
          const course = existingCourses[i];
          setMessage(`🗑️ Eliminando curso ${i + 1}/${totalToDelete}...`);
          setProgress({ current: i + 1, total: totalToDelete + coursesData.length });
          
          const { error: deleteError } = await supabase
            .from('courses')
            .delete()
            .eq('id', course.id);
          
          if (deleteError) {
            console.error('Error eliminando curso:', deleteError);
          }
          
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      setMessage('✅ Cursos antiguos eliminados. Insertando nuevos cursos...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await insertCoursesAfterClean();
      
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Error al limpiar cursos');
      console.error('Error completo:', error);
    }
  };

  const insertCoursesAfterClean = async () => {
    try {
      setStatus('loading');
      const instructorId = '7c127825-7000-4711-ad61-9dfb99336b51';
      let successCount = 0;

      setProgress({ current: 0, total: coursesData.length });

      for (let i = 0; i < coursesData.length; i++) {
        const course = coursesData[i];
        const professionalContent = getCourseContent(course.id);
        
        setProgress({ current: i + 1, total: coursesData.length });
        setMessage(`📚 Insertando curso ${i + 1}/${coursesData.length}: ${course.title.substring(0, 40)}...`);

        // Solo insertar campos básicos que existen en la tabla
        const courseData: any = {
          ...course,
          instructor_id: instructorId
        };

        // NO insertar campos profesionales si no existen en la tabla
        // Comentado para evitar errores PGRST204
        // if (professionalContent) {
        //   courseData.what_you_learn = JSON.stringify(professionalContent.whatYouLearn);
        //   courseData.requirements = JSON.stringify(professionalContent.requirements);
        //   courseData.features = JSON.stringify(professionalContent.features);
        //   courseData.modules = JSON.stringify(professionalContent.modules);
        // }

        const { error } = await supabase
          .from('courses')
          .insert(courseData);

        if (error) {
          console.error(`Error insertando curso ${course.id}:`, error);
        } else {
          successCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setStatus('success');
      setMessage(`¡Éxito! Se insertaron ${successCount} cursos en Supabase.`);
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Error desconocido');
      console.error('Error completo:', error);
    }
  };

  const insertCourses = async () => {
    setStatus('loading');
    setMessage('Verificando cursos existentes...');
    setProgress({ current: 0, total: coursesData.length });
    setNeedsRLSDisable(false);
    setShowCleanOption(false);

    try {
      const instructorId = '7c127825-7000-4711-ad61-9dfb99336b51';
      
      const { data: existingCourses, error: checkError} = await supabase
        .from('courses')
        .select('slug')
        .in('slug', coursesData.map(c => c.slug));

      if (checkError) {
        console.error('Error verificando cursos:', checkError);
      }

      if (existingCourses && existingCourses.length > 0) {
        setShowCleanOption(true);
        setStatus('idle');
        return;
      }

      let successCount = 0;

      for (let i = 0; i < coursesData.length; i++) {
        const course = coursesData[i];
        const professionalContent = getCourseContent(course.id);
        
        setProgress({ current: i + 1, total: coursesData.length });
        setMessage(`Insertando curso ${i + 1}/${coursesData.length}: ${course.title}`);

        // Solo insertar campos básicos que existen en la tabla
        const courseData: any = {
          ...course,
          instructor_id: instructorId
        };

        // NO insertar campos profesionales si no existen en la tabla
        // Comentado para evitar errores PGRST204
        // if (professionalContent) {
        //   courseData.what_you_learn = JSON.stringify(professionalContent.whatYouLearn);
        //   courseData.requirements = JSON.stringify(professionalContent.requirements);
        //   courseData.features = JSON.stringify(professionalContent.features);
        //   courseData.modules = JSON.stringify(professionalContent.modules);
        // }

        const { error } = await supabase
          .from('courses')
          .insert(courseData);

        if (error) {
          console.error(`Error insertando curso ${course.id}:`, error);
          
          if (error.code === '42501') {
            setNeedsRLSDisable(true);
            throw new Error('RLS está activado. Necesitas desactivarlo primero.');
          }
          
          if (error.code === '23505') {
            setShowCleanOption(true);
            throw new Error('Algunos cursos ya existen. Limpia los datos primero.');
          }
        } else {
          successCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setStatus('success');
      setMessage(`¡Éxito! Se insertaron ${successCount} cursos en Supabase.`);
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Error desconocido');
      console.error('Error completo:', error);
    }
  };

  if (needsRLSDisable) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 max-w-md">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
              ⚠️ RLS Está Activado
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Necesitas desactivar Row Level Security primero
            </p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-4">
          <p className="text-sm text-orange-800 dark:text-orange-200 mb-3 font-semibold">
            📝 Pasos para desactivar RLS:
          </p>
          <ol className="text-sm text-orange-700 dark:text-orange-300 space-y-2 list-decimal list-inside">
            <li>Ve a Supabase Dashboard</li>
            <li>Abre <strong>SQL Editor</strong></li>
            <li>Ejecuta el script de desactivación</li>
            <li>Vuelve aquí e intenta de nuevo</li>
          </ol>
        </div>

        <button
          onClick={() => setNeedsRLSDisable(false)}
          className="w-full bg-gray-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors mb-2"
        >
          Entendido
        </button>

        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir Supabase Dashboard
        </a>
      </div>
    );
  }

  if (showCleanOption) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border-2 border-orange-500 p-6 max-w-md">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
              ⚠️ Cursos Duplicados Detectados
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Algunos cursos ya existen en la base de datos
            </p>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mb-4">
          <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
            <strong>Opciones disponibles:</strong>
          </p>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-2 list-disc list-inside">
            <li><strong>Limpiar y Reinsertar:</strong> Elimina todos los cursos e inserta los 33 con contenido profesional</li>
            <li><strong>Cancelar:</strong> Mantener los cursos actuales</li>
          </ul>
        </div>

        <div className="space-y-2">
          <button
            onClick={cleanExistingCourses}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Limpiar y Reinsertar 33 Cursos
          </button>
          
          <button
            onClick={() => {
              setShowCleanOption(false);
              setStatus('idle');
            }}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Esto eliminará TODOS los cursos actuales y los reemplazará con contenido profesional completo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border-2 border-[#98ca3f] p-6 max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-[#98ca3f] rounded-full">
          <Upload className="w-6 h-6 text-[#121f3d]" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            Insertar Cursos en Supabase
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            33 cursos con contenido profesional
          </p>
        </div>
      </div>

      {status === 'idle' && (
        <>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              ✨ <strong>Contenido incluido:</strong> Módulos, lecciones, objetivos de aprendizaje y requisitos completos
            </p>
          </div>
          <button
            onClick={insertCourses}
            className="w-full bg-[#98ca3f] hover:bg-[#87b935] text-[#121f3d] font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Insertar 33 Cursos Profesionales
          </button>
        </>
      )}

      {status === 'cleaning' && (
        <>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-orange-500 animate-pulse" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {message}
              </p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300"
                style={{ width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : '50%' }}
              />
            </div>
            {progress.total > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Progreso: {progress.current} de {progress.total}
              </p>
            )}
          </div>
        </>
      )}

      {status === 'loading' && (
        <>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-5 h-5 text-[#98ca3f] animate-spin" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {message}
              </p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-[#98ca3f] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              {progress.current} de {progress.total} cursos
            </p>
          </div>
        </>
      )}

      {status === 'success' && (
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {message}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Recargando página para mostrar los nuevos cursos...
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {message}
            </p>
          </div>
          <button
            onClick={() => setStatus('idle')}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Tip: Desactiva RLS primero para evitar errores
        </p>
      </div>
    </div>
  );
}