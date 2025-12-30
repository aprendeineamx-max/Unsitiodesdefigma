import { useState } from 'react';
import { Upload, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { extendedCourses } from '../data/extendedCourses'; // ✅ USAR extendedCourses (33 cursos) en vez de allCourses (9)
import { professionalCoursesContent } from '../data/professionalCoursesContent';
import { feedPosts } from '../data/socialFeed';
import { initialComments } from '../data/comments';
import { blogPosts } from '../data/blogPosts';
import { studyGroups } from '../data/studyGroups';
import { forumPosts } from '../data/forumPosts';
import { getCourseImage } from '../data/courseImages'; // ✅ NUEVO: Importar mapeo de imágenes

interface SyncLog {
  step: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  count?: number;
  error?: string;
}

// Helper para generar UUID v4
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper para convertir un string a UUID consistente
const stringToUUID = (str: string): string => {
  // Pad string to at least 32 chars
  const paddedStr = str.padEnd(32, '0');
  // Take first 32 characters and format as UUID
  return `${paddedStr.substr(0, 8)}-${paddedStr.substr(8, 4)}-4${paddedStr.substr(12, 3)}-${paddedStr.substr(15, 4)}-${paddedStr.substr(19, 12)}`;
};

export function MasterDataSync() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSynced, setTotalSynced] = useState(0);

  const addLog = (step: string, status: SyncLog['status'], message?: string, count?: number, error?: string) => {
    setLogs(prev => {
      const existing = prev.findIndex(l => l.step === step);
      if (existing >= 0) {
        const newLogs = [...prev];
        newLogs[existing] = { step, status, message, count, error };
        return newLogs;
      }
      return [...prev, { step, status, message, count, error }];
    });
  };

  const syncAllData = async () => {
    if (!supabase) return;
    
    setIsRunning(true);
    setLogs([]);
    setTotalSynced(0);
    let totalItems = 0;

    try {
      // 1. SYNC COURSES con contenido profesional completo
      addLog('courses', 'running', 'Sincronizando cursos...');
      
      // Primero, asegurar que existe un usuario instructor por defecto
      const defaultInstructorId = '1'; // ID del instructor por defecto
      
      // Intentar crear el usuario instructor si no existe
      const { error: userError } = await supabase
        .from('users')
        .upsert({ 
          id: defaultInstructorId, 
          email: 'instructor@platzi.com',
          username: 'instructor_platzi',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (!userError) {
        // También crear el perfil del instructor
        await supabase
          .from('profiles')
          .upsert({ 
            id: defaultInstructorId,
            email: 'instructor@platzi.com',
            full_name: 'Instructor Platzi',
            avatar_url: 'https://i.pravatar.cc/150?img=1',
            role: 'instructor',
            level: 10,
            xp: 10000,
            streak: 100,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
      }
      
      for (const course of extendedCourses) {
        const professionalContent = professionalCoursesContent[course.id];
        
        // Generar slug desde el título
        const slug = course.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
          .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
          .trim()
          .replace(/\s+/g, '-'); // Reemplazar espacios con guiones
        
        // ✅ DEBUG: Obtener y verificar la imagen
        const courseImage = getCourseImage(course.category);
        console.log(`📸 Curso "${course.title}" (${course.category}) -> Imagen: ${courseImage.substring(0, 80)}...`);
        
        const courseData = {
          id: course.id,
          title: course.title,
          slug: slug,
          subtitle: course.description,
          description: course.description,
          instructor_id: defaultInstructorId, // ✅ AGREGADO: instructor_id obligatorio
          instructor: course.instructor,
          instructor_avatar: course.instructorAvatar,
          instructor_title: 'Instructor',
          category: course.category,
          level: course.level,
          price: course.price,
          original_price: course.originalPrice,
          rating: course.rating,
          students: course.students,
          duration: course.duration,
          lessons_count: course.curriculum?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0,
          image: courseImage, // ✅ FORZAR imagen de Unsplash (sin fallback)
          thumbnail: courseImage, // ✅ FORZAR imagen de Unsplash (sin fallback)
          certificate: true,
          featured: false,
          bestseller: course.bestseller || false,
          new_course: course.new || false,
          // DATOS PROFESIONALES COMPLETOS
          features: professionalContent?.features || course.features || [],
          what_you_learn: professionalContent?.whatYouLearn || course.whatYouLearn || [],
          requirements: professionalContent?.requirements || course.requirements || [],
          modules: professionalContent?.modules || course.curriculum || [],
          tags: [course.category, course.level],
        };

        const { error } = await supabase
          .from('courses')
          .upsert(courseData, { onConflict: 'id' });

        if (error) {
          console.error(`Error syncing course ${course.id}:`, error);
          addLog('courses', 'error', `Error en curso ${course.id}: ${error.message}`, 0, JSON.stringify(error));
          return; // Stop on error
        } else {
          totalItems++;
        }
      }
      
      addLog('courses', 'success', `${extendedCourses.length} cursos sincronizados con contenido profesional`, extendedCourses.length);
      setTotalSynced(prev => prev + extendedCourses.length);

      // 2. SYNC MODULES & LESSONS desde professionalCoursesContent
      addLog('modules_lessons', 'running', 'Sincronizando módulos y lecciones...');
      
      let modulesCount = 0;
      let lessonsCount = 0;

      try {
        // SOLO sincronizar módulos para cursos que existen en allCourses
        const existingCourseIds = extendedCourses.map(c => c.id);
        
        for (const [courseId, content] of Object.entries(professionalCoursesContent)) {
          // Skip si el curso no existe
          if (!existingCourseIds.includes(courseId)) {
            console.log(`Skipping modules for non-existent course: ${courseId}`);
            continue;
          }
          
          if (content.modules) {
            for (let i = 0; i < content.modules.length; i++) {
              const module = content.modules[i];
              
              const moduleData = {
                id: `${courseId}-module-${i}`,
                course_id: courseId,
                title: module.title,
                description: module.title,
                order_index: i,
              };

              const { error: moduleError } = await supabase
                .from('modules')
                .upsert(moduleData, { onConflict: 'id' });

              if (moduleError) {
                console.error(`Error syncing module for course ${courseId}:`, moduleError);
                addLog('modules_lessons', 'error', `Error en módulo: ${moduleError.message}`, modulesCount, JSON.stringify(moduleError));
                return; // Stop on error
              }
              
              modulesCount++;

              // Insert lessons for this module
              if (module.lessons) {
                for (let j = 0; j < module.lessons.length; j++) {
                  const lesson = module.lessons[j];
                  
                  const lessonData = {
                    id: `${courseId}-module-${i}-lesson-${j}`,
                    module_id: moduleData.id,
                    course_id: courseId,
                    title: lesson.title,
                    description: lesson.title,
                    duration: lesson.duration,
                    type: lesson.type,
                    order_index: j,
                    is_free: j === 0, // Primera lección gratis
                  };

                  const { error: lessonError } = await supabase
                    .from('lessons')
                    .upsert(lessonData, { onConflict: 'id' });

                  if (lessonError) {
                    console.error(`Error syncing lesson for course ${courseId}:`, lessonError);
                    addLog('modules_lessons', 'error', `Error en lección: ${lessonError.message}`, lessonsCount, JSON.stringify(lessonError));
                    return; // Stop on error
                  }
                  
                  lessonsCount++;
                }
              }
            }
          }
        }

        addLog('modules_lessons', 'success', `${modulesCount} módulos y ${lessonsCount} lecciones sincronizadas`, modulesCount + lessonsCount);
        setTotalSynced(prev => prev + modulesCount + lessonsCount);
      } catch (error: any) {
        console.error('Error in modules/lessons sync:', error);
        addLog('modules_lessons', 'error', error.message, modulesCount + lessonsCount, JSON.stringify(error));
        return; // Stop on error
      }

      // 3. SYNC SOCIAL FEED POSTS
      addLog('posts', 'running', 'Sincronizando posts del feed social...');
      
      // Primero crear un usuario demo si no existe
      const { data: demoUser } = await supabase
        .from('users')
        .upsert({
          id: 'demo-user-001',
          email: 'demo@platzi.com',
          username: 'platzi_demo',
          full_name: 'Platzi Demo User',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Platzi',
        }, { onConflict: 'id' })
        .select()
        .single();

      let postsCount = 0;
      for (const post of feedPosts) {
        const postData = {
          id: post.id,
          user_id: demoUser?.id || 'demo-user-001',
          type: post.type,
          content: post.content,
          image_url: post.image, // ✅ CORREGIDO: image -> image_url
          // ✅ ELIMINADOS: achievement_badge, achievement_title, course_title, course_image (no existen en DB)
          likes_count: post.likes || 0, // ✅ CORREGIDO: likes -> likes_count
          comments_count: post.comments || 0, // ✅ CORREGIDO: comments -> comments_count
          shares_count: post.shares || 0, // ✅ CORREGIDO: shares -> shares_count
          views_count: 0,
          created_at: post.createdAt,
          updated_at: post.createdAt,
        };

        const { error } = await supabase
          .from('posts')
          .upsert(postData, { onConflict: 'id' });

        if (error) {
          console.error(`Error syncing post ${post.id}:`, error);
          addLog('posts', 'error', `Error en post ${post.id}: ${error.message}`, postsCount, JSON.stringify(error));
        } else {
          postsCount++;
        }
      }

      addLog('posts', 'success', `${postsCount} posts sincronizados`, postsCount);
      setTotalSynced(prev => prev + postsCount);

      // 4. SYNC COMMENTS
      addLog('comments', 'running', 'Sincronizando comentarios...');
      
      let commentsCount = 0;
      for (const [postId, comments] of Object.entries(initialComments)) {
        for (const comment of comments) {
          const commentData = {
            id: comment.id,
            post_id: postId,
            blog_post_id: null,
            user_id: demoUser?.id || 'demo-user-001',
            parent_id: null,
            content: comment.content,
            likes_count: comment.likes || 0, // ✅ CORREGIDO: likes -> likes_count
            created_at: comment.createdAt,
            updated_at: comment.createdAt,
          };

          const { error } = await supabase
            .from('comments')
            .upsert(commentData, { onConflict: 'id' });

          if (error) {
            console.error(`Error syncing comment ${comment.id}:`, error);
          } else {
            commentsCount++;
          }

          // Sync replies
          if (comment.replies) {
            for (const reply of comment.replies) {
              const replyData = {
                id: reply.id,
                post_id: postId,
                blog_post_id: null,
                user_id: demoUser?.id || 'demo-user-001',
                parent_id: comment.id, // ✅ CORREGIDO: parent_comment_id -> parent_id
                content: reply.content,
                likes_count: reply.likes || 0, // ✅ CORREGIDO: likes -> likes_count
                created_at: reply.createdAt,
                updated_at: reply.createdAt,
              };

              const { error: replyError } = await supabase
                .from('comments')
                .upsert(replyData, { onConflict: 'id' });

              if (!replyError) commentsCount++;
            }
          }
        }
      }

      addLog('comments', 'success', `${commentsCount} comentarios sincronizados`, commentsCount);
      setTotalSynced(prev => prev + commentsCount);

      // 5. SYNC BLOG POSTS
      addLog('blog_posts', 'running', 'Sincronizando posts del blog...');
      
      let blogPostsCount = 0;
      for (const blogPost of blogPosts) {
        // Generar slug desde el título
        const slug = blogPost.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\\u0300-\\u036f]/g, '') // Eliminar acentos
          .replace(/[^a-z0-9\\s-]/g, '') // Solo letras, números, espacios y guiones
          .trim()
          .replace(/\\s+/g, '-'); // Reemplazar espacios con guiones

        const blogData = {
          id: blogPost.id,
          author_id: demoUser?.id || 'demo-user-001',
          title: blogPost.title,
          slug: slug, // ✅ AGREGADO: generar slug
          excerpt: blogPost.excerpt,
          content: blogPost.content,
          cover_image_url: blogPost.image, // ✅ CORREGIDO: image -> cover_image_url
          category: blogPost.category,
          tags: blogPost.tags,
          status: 'published',
          views_count: 0,
          likes_count: blogPost.likes || 0, // ✅ CORREGIDO: likes -> likes_count
          comments_count: blogPost.comments || 0, // ✅ CORREGIDO: comments -> comments_count
          reading_time: blogPost.readTime || 5, // ✅ CORREGIDO: readTime -> reading_time
          published_at: blogPost.publishedAt,
          created_at: blogPost.publishedAt,
          updated_at: blogPost.publishedAt,
        };

        const { error } = await supabase
          .from('blog_posts')
          .upsert(blogData, { onConflict: 'id' });

        if (error) {
          console.error(`Error syncing blog post ${blogPost.id}:`, error);
        } else {
          blogPostsCount++;
        }
      }

      addLog('blog_posts', 'success', `${blogPostsCount} blog posts sincronizados`, blogPostsCount);
      setTotalSynced(prev => prev + blogPostsCount);

      // 6. SYNC STUDY GROUPS
      addLog('study_groups', 'running', 'Sincronizando grupos de estudio...');
      
      let studyGroupsCount = 0;
      for (const group of studyGroups) {
        const groupData = {
          id: group.id,
          name: group.name,
          description: group.description,
          image: group.image,
          category: group.category,
          members_count: group.members.length,
          max_members: group.maxMembers,
          is_private: group.isPrivate,
          created_by: demoUser?.id || 'demo-user-001',
          created_at: group.createdAt,
        };

        const { error } = await supabase
          .from('study_groups')
          .upsert(groupData, { onConflict: 'id' });

        if (!error) studyGroupsCount++;
      }

      addLog('study_groups', 'success', `${studyGroupsCount} grupos de estudio sincronizados`, studyGroupsCount);
      setTotalSynced(prev => prev + studyGroupsCount);

      // 7. SYNC FORUM POSTS
      addLog('forum_posts', 'running', 'Sincronizando posts del foro...');
      
      let forumPostsCount = 0;
      for (const forumPost of forumPosts) {
        const forumData = {
          id: forumPost.id,
          user_id: demoUser?.id || 'demo-user-001',
          title: forumPost.title,
          content: forumPost.content,
          category: forumPost.category,
          tags: forumPost.tags,
          views: forumPost.views,
          likes: forumPost.likes,
          replies_count: forumPost.replies,
          is_solved: forumPost.solved,
          created_at: forumPost.createdAt,
        };

        const { error } = await supabase
          .from('forum_posts')
          .upsert(forumData, { onConflict: 'id' });

        if (!error) forumPostsCount++;
      }

      addLog('forum_posts', 'success', `${forumPostsCount} forum posts sincronizados`, forumPostsCount);
      setTotalSynced(prev => prev + forumPostsCount);

      // 8. SYNC BADGES
      addLog('badges', 'running', 'Sincronizando badges de gamificación...');
      
      const badges = [
        { id: 'badge-001', name: 'Primera Lección', description: 'Completa tu primera lección', icon: '🎓', rarity: 'common', category: 'learning', requirement: 1 },
        { id: 'badge-002', name: 'Aprendiz Dedicado', description: 'Completa 10 lecciones', icon: '📚', rarity: 'common', category: 'learning', requirement: 10 },
        { id: 'badge-003', name: 'Estudiante Estrella', description: 'Completa 50 lecciones', icon: '⭐', rarity: 'rare', category: 'learning', requirement: 50 },
        { id: 'badge-004', name: 'Maestro del Conocimiento', description: 'Completa 100 lecciones', icon: '🏆', rarity: 'epic', category: 'learning', requirement: 100 },
        { id: 'badge-005', name: 'Racha de Fuego', description: 'Mantén una racha de 7 días', icon: '🔥', rarity: 'rare', category: 'achievement', requirement: 7 },
        { id: 'badge-006', name: 'Maratonista', description: 'Mantén una racha de 30 días', icon: '💪', rarity: 'epic', category: 'achievement', requirement: 30 },
        { id: 'badge-007', name: 'Leyenda', description: 'Mantén una racha de 100 días', icon: '👑', rarity: 'legendary', category: 'achievement', requirement: 100 },
        { id: 'badge-008', name: 'Social Butterfly', description: 'Haz 50 comentarios', icon: '💬', rarity: 'rare', category: 'social', requirement: 50 },
      ];

      let badgesCount = 0;
      for (const badge of badges) {
        const { error } = await supabase
          .from('badges')
          .upsert(badge, { onConflict: 'id' });

        if (!error) badgesCount++;
      }

      addLog('badges', 'success', `${badgesCount} badges sincronizados`, badgesCount);
      setTotalSynced(prev => prev + badgesCount);

      // 9. SYNC CHALLENGES
      addLog('challenges', 'running', 'Sincronizando challenges...');
      
      const challenges = [
        {
          id: 'challenge-001',
          title: 'Estudiante del Día',
          description: 'Completa 3 lecciones hoy',
          type: 'daily',
          reward_xp: 50,
          reward_coins: 10,
          goal: 3,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'challenge-002',
          title: 'Semana Productiva',
          description: 'Completa 15 lecciones esta semana',
          type: 'weekly',
          reward_xp: 200,
          reward_coins: 50,
          goal: 15,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'challenge-003',
          title: 'Maestro del Mes',
          description: 'Completa 50 lecciones este mes',
          type: 'monthly',
          reward_xp: 1000,
          reward_coins: 200,
          reward_badge: 'badge-004',
          goal: 50,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      let challengesCount = 0;
      for (const challenge of challenges) {
        const { error } = await supabase
          .from('challenges')
          .upsert(challenge, { onConflict: 'id' });

        if (!error) challengesCount++;
      }

      addLog('challenges', 'success', `${challengesCount} challenges sincronizados`, challengesCount);
      setTotalSynced(prev => prev + challengesCount);

      addLog('complete', 'success', `🎉 ¡Sincronización completa! Total: ${totalItems + modulesCount + lessonsCount + postsCount + commentsCount + blogPostsCount + studyGroupsCount + forumPostsCount + badgesCount + challengesCount} items`);

    } catch (error: any) {
      console.error('Error syncing data:', error);
      addLog('error', 'error', error.message || 'Error desconocido');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: SyncLog['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-blue-500 p-6 max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
          <Upload className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Master Data Sync
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sincronizar todos los datos a Supabase
          </p>
        </div>
        {totalSynced > 0 && (
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalSynced}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Items sincronizados
            </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      {logs.length === 0 && (
        <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            🚀 Sincronización Maestra de Datos
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Este script sincronizará TODOS los datos desde tu aplicación a Supabase:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4 ml-4">
            <li>✅ 33 cursos con contenido profesional completo</li>
            <li>✅ Módulos y lecciones detalladas de cada curso</li>
            <li>✅ Posts del feed social</li>
            <li>✅ Comentarios y respuestas</li>
            <li>✅ Posts del blog profesional</li>
            <li>✅ Sistema completo de badges</li>
            <li>✅ Challenges diarios, semanales y mensuales</li>
            <li>✅ Grupos de estudio</li>
            <li>✅ Posts del foro</li>
          </ul>
          <button
            onClick={syncAllData}
            disabled={isRunning}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sincronizando Datos...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Iniciar Sincronización Completa
              </>
            )}
          </button>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
              >
                <div className="mt-0.5">
                  {getStatusIcon(log.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-gray-900 dark:text-white flex items-center justify-between">
                    <span>{log.step}</span>
                    {log.count !== undefined && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                        {log.count}
                      </span>
                    )}
                  </p>
                  {log.message && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {log.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {logs.some(log => log.step === 'complete' && log.status === 'success') && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg">
          <p className="text-green-800 dark:text-green-300 font-bold text-center">
            ✅ Todos los datos sincronizados exitosamente
          </p>
          <p className="text-sm text-green-700 dark:text-green-400 text-center mt-1">
            Tu aplicación ahora está completamente respaldada en Supabase
          </p>
        </div>
      )}
    </div>
  );
}