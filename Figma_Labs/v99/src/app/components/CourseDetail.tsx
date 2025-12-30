import { ArrowLeft, Clock, Users, Star, BookOpen, Award, CheckCircle2, PlayCircle, ShoppingCart } from 'lucide-react';
import { Course } from '../data/courses';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { CourseModules } from './CourseModules';
import { courseModulesMap, Module, Lesson, LessonType } from '../data/courseLessons';
import { useCourse } from '../hooks/useSupabaseData';
import { useEffect, useState } from 'react';

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
}

export function CourseDetail({ course, onBack }: CourseDetailProps) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(course.id);
  
  // Use Supabase hook to fetch full course details including modules
  const { course: fullCourse, loading } = useCourse(course.id);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    if (fullCourse && fullCourse.modules) {
      // Map Supabase modules to Legacy format
      const mappedModules: Module[] = fullCourse.modules.map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description || '',
        duration: m.duration ? `${Math.floor(m.duration / 60)}h ${m.duration % 60}m` : '0h 0m',
        locked: m.is_locked,
        lessons: m.lessons ? m.lessons.map((l: any) => ({
          id: l.id,
          title: l.title,
          type: (l.type as LessonType) || 'video',
          duration: l.duration ? `${Math.floor(l.duration / 60)}:${(l.duration % 60).toString().padStart(2, '0')}` : '0:00',
          completed: l.is_completed || false,
          locked: l.is_locked || false,
          description: l.description || '',
          resources: l.resources || []
        })) : []
      }));
      setModules(mappedModules);
    } else if (!loading) {
      // Fallback to mock data if no Supabase data found (or during migration)
      // Only if we haven't loaded anything yet
      const mockModules = courseModulesMap[course.id] || [];
      if (mockModules.length > 0) {
        setModules(mockModules);
      }
    }
  }, [fullCourse, course.id, loading]);

  return (
    <div className="min-h-screen bg-[rgb(249,250,251)]">
      {/* Header with Back Button */}
      <div className="bg-[#121f3d] text-white py-4 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm hover:text-[#98ca3f] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a cursos
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#121f3d] via-[#1a2d5a] to-[#0d1628] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="inline-block bg-[#98ca3f]/20 text-[#98ca3f] px-3 py-1 rounded-full text-sm mb-4">
                {course.category}
              </div>
              <h1 className="text-4xl md:text-5xl mb-4">{course.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg">{course.rating}</span>
                  <span className="text-gray-300">({course.students.toLocaleString()} estudiantes)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration} de contenido</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>{course.level}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`}
                  alt={course.instructor}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-sm text-gray-400">Instructor</p>
                  <p className="text-lg">{course.instructor}</p>
                </div>
              </div>
            </div>

            {/* Course Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl overflow-hidden shadow-xl sticky top-32">
                <div className="relative aspect-video">
                  <ImageWithFallback 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <PlayCircle className="w-8 h-8 text-[#121f3d]" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl text-[#121f3d] mb-2">
                      ${course.price}
                    </div>
                    <p className="text-sm text-gray-600">Pago único - Acceso de por vida</p>
                  </div>
                  <button className="w-full bg-[#98ca3f] text-[#121f3d] py-3 rounded-lg hover:bg-[#87b935] transition-colors mb-3">
                    Comprar ahora
                  </button>
                  <button 
                    onClick={() => addToCart(course)}
                    disabled={inCart}
                    className={`w-full border-2 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      inCart 
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                        : 'border-[#121f3d] text-[#121f3d] hover:bg-gray-50'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {inCart ? 'En el carrito' : 'Agregar al carrito'}
                  </button>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#98ca3f]" />
                      <span>Acceso de por vida</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#98ca3f]" />
                      <span>Certificado de finalización</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#98ca3f]" />
                      <span>Proyecto final</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#98ca3f]" />
                      <span>Soporte del instructor</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl mb-4">Lo que aprenderás</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {course.whatYouLearn?.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#98ca3f] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-6 h-6 text-[#121f3d]" />
                <h2 className="text-2xl">Contenido del curso</h2>
              </div>
              {loading && modules.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <div className="animate-spin w-8 h-8 border-4 border-[#98ca3f] border-t-transparent rounded-full mx-auto mb-2"></div>
                  Cargando contenido...
                </div>
              ) : (
                <CourseModules modules={modules} />
              )}
            </section>

            {/* Requirements */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl mb-4">Requisitos</h2>
              <ul className="space-y-2">
                {course.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-[#98ca3f] mt-1">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h3 className="text-xl mb-4">Sobre el instructor</h3>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`}
                  alt={course.instructor}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <p className="text-lg">{course.instructor}</p>
                  <p className="text-sm text-gray-600">Instructor profesional</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span>Estudiantes:</span>
                  <span>{course.students.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Calificación:</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {course.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#121f3d] to-[#1a2d5a] rounded-xl p-6 text-white">
              <h3 className="text-xl mb-3">Comparte con tus amigos</h3>
              <p className="text-sm text-gray-300 mb-4">
                ¡Ayúdalos a impulsar su carrera!
              </p>
              <div className="flex gap-2">
                <button className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg transition-colors">
                  Copiar link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export for better compatibility with dynamic imports
export default CourseDetail;