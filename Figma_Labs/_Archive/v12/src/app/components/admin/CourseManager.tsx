import { useState } from 'react';
import { 
  Plus, 
  Upload, 
  Download, 
  Database,
  Settings,
  Trash2,
  Edit,
  Eye,
  FileJson,
  FileSpreadsheet,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  Copy,
  RefreshCw
} from 'lucide-react';
import { supabaseHelpers } from '../../../lib/supabase';
import { extendedCourses } from '../../data/extendedCourses';
import { getCourseImage } from '../../data/courseImages';

type ViewMode = 'list' | 'create' | 'import' | 'export' | 'backup';

interface CourseFormData {
  title: string;
  subtitle: string;
  description: string;
  instructor: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  duration: string;
  lessons_count: number;
  image: string;
  thumbnail: string;
  rating: number;
  students: number;
  features: string[];
  what_you_learn: string[];
  requirements: string[];
}

export function CourseManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    subtitle: '',
    description: '',
    instructor: '',
    category: 'Desarrollo Web',
    level: 'beginner',
    price: 0,
    duration: '',
    lessons_count: 0,
    image: '',
    thumbnail: '',
    rating: 4.5,
    students: 0,
    features: [],
    what_you_learn: [],
    requirements: []
  });

  // Show message helper
  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Load courses from database
  const loadCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseHelpers.courses.list();
      if (error) throw error;
      setCourses(data || []);
      showMessage('success', `✅ ${data?.length || 0} cursos cargados`);
    } catch (error: any) {
      showMessage('error', `❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create single course
  const createCourse = async () => {
    setLoading(true);
    try {
      // Generate slug
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      const courseData = {
        title: formData.title,
        slug: slug,
        subtitle: formData.subtitle,
        description: formData.description,
        instructor: formData.instructor,
        category: formData.category,
        level: formData.level,
        price: formData.price,
        original_price: formData.price * 1.5,
        duration: formData.duration,
        lessons_count: formData.lessons_count,
        image: formData.image || getCourseImage(formData.category),
        thumbnail: formData.thumbnail || getCourseImage(formData.category),
        rating: formData.rating,
        students: formData.students,
        features: formData.features.filter(f => f.trim()),
        what_you_learn: formData.what_you_learn.filter(w => w.trim()),
        requirements: formData.requirements.filter(r => r.trim()),
        certificate: true,
        featured: false,
        bestseller: false,
        new_course: true,
        status: 'published' as const,
        instructor_id: '1', // Default instructor
      };

      const { error } = await supabaseHelpers.supabase
        .from('courses')
        .insert([courseData]);

      if (error) throw error;

      showMessage('success', '✅ Curso creado exitosamente');
      setViewMode('list');
      loadCourses();
      
      // Reset form
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        instructor: '',
        category: 'Desarrollo Web',
        level: 'beginner',
        price: 0,
        duration: '',
        lessons_count: 0,
        image: '',
        thumbnail: '',
        rating: 4.5,
        students: 0,
        features: [],
        what_you_learn: [],
        requirements: []
      });
    } catch (error: any) {
      showMessage('error', `❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Import courses from extendedCourses
  const importFromExtendedCourses = async () => {
    setLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const course of extendedCourses) {
        try {
          const slug = course.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');

          const courseData = {
            id: course.id,
            title: course.title,
            slug: slug,
            subtitle: course.description,
            description: course.description,
            instructor: course.instructor,
            instructor_avatar: course.instructorAvatar,
            category: course.category,
            level: course.level.toLowerCase(),
            price: course.price || 0,
            original_price: course.originalPrice || course.price * 1.5,
            duration: course.duration,
            lessons_count: course.curriculum?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0,
            image: getCourseImage(course.category),
            thumbnail: getCourseImage(course.category),
            rating: course.rating,
            students: course.students,
            certificate: true,
            featured: course.bestseller || false,
            bestseller: course.bestseller || false,
            new_course: false,
            features: course.features || [],
            what_you_learn: course.whatYouLearn || [],
            requirements: course.requirements || [],
            modules: course.curriculum || [],
            tags: course.tags || [],
            status: 'published' as const,
            instructor_id: '1',
          };

          const { error } = await supabaseHelpers.supabase
            .from('courses')
            .upsert([courseData], { onConflict: 'id' });

          if (error) {
            console.error(`Error importing course ${course.title}:`, error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`Error processing course ${course.title}:`, err);
          errorCount++;
        }
      }

      showMessage('success', `✅ ${successCount} cursos importados, ${errorCount} errores`);
      loadCourses();
    } catch (error: any) {
      showMessage('error', `❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Import from JSON file
  const importFromJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const coursesToImport = Array.isArray(data) ? data : [data];

      let successCount = 0;
      let errorCount = 0;

      for (const course of coursesToImport) {
        try {
          const { error } = await supabaseHelpers.supabase
            .from('courses')
            .upsert([course], { onConflict: 'id' });

          if (error) {
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      showMessage('success', `✅ ${successCount} cursos importados desde JSON, ${errorCount} errores`);
      loadCourses();
    } catch (error: any) {
      showMessage('error', `❌ Error al leer JSON: ${error.message}`);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  // Export courses to JSON
  const exportToJSON = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseHelpers.courses.list();
      if (error) throw error;

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `courses-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      showMessage('success', `✅ ${data?.length || 0} cursos exportados a JSON`);
    } catch (error: any) {
      showMessage('error', `❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Full database backup
  const createFullBackup = async () => {
    setLoading(true);
    try {
      // Get all data
      const [coursesRes, postsRes, blogPostsRes, usersRes] = await Promise.all([
        supabaseHelpers.courses.list(),
        supabaseHelpers.posts.list(undefined, { limit: 1000 }),
        supabaseHelpers.blog.list(),
        supabaseHelpers.supabase.from('users').select('*')
      ]);

      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          courses: coursesRes.data || [],
          posts: postsRes.data || [],
          blog_posts: blogPostsRes.data || [],
          users: usersRes.data || []
        },
        stats: {
          courses: coursesRes.data?.length || 0,
          posts: postsRes.data?.length || 0,
          blog_posts: blogPostsRes.data?.length || 0,
          users: usersRes.data?.length || 0
        }
      };

      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `platzi-clone-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      showMessage('success', `✅ Backup completo creado (${backup.stats.courses} cursos, ${backup.stats.posts} posts, ${backup.stats.blog_posts} blog posts, ${backup.stats.users} usuarios)`);
    } catch (error: any) {
      showMessage('error', `❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const deleteCourse = async (courseId: string) => {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return;

    setLoading(true);
    try {
      const { error } = await supabaseHelpers.supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      showMessage('success', '✅ Curso eliminado');
      loadCourses();
    } catch (error: any) {
      showMessage('error', `❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Gestión de Cursos</h1>
        <p className="text-blue-100">Sistema completo de administración, importación y backup de cursos</p>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`p-4 rounded-xl border-2 ${
          message.type === 'success' ? 'bg-green-900/20 border-green-500 text-green-300' :
          message.type === 'error' ? 'bg-red-900/20 border-red-500 text-red-300' :
          'bg-blue-900/20 border-blue-500 text-blue-300'
        } flex items-center gap-3`}>
          {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {message.type === 'info' && <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <button
          onClick={() => { setViewMode('list'); loadCourses(); }}
          className={`p-4 rounded-xl border-2 transition-all ${
            viewMode === 'list'
              ? 'bg-blue-900/30 border-blue-500 text-blue-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500'
          }`}
        >
          <Eye className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm font-semibold">Ver Cursos</p>
        </button>

        <button
          onClick={() => setViewMode('create')}
          className={`p-4 rounded-xl border-2 transition-all ${
            viewMode === 'create'
              ? 'bg-green-900/30 border-green-500 text-green-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-green-500'
          }`}
        >
          <Plus className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm font-semibold">Crear Curso</p>
        </button>

        <button
          onClick={() => setViewMode('import')}
          className={`p-4 rounded-xl border-2 transition-all ${
            viewMode === 'import'
              ? 'bg-purple-900/30 border-purple-500 text-purple-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-purple-500'
          }`}
        >
          <Upload className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm font-semibold">Importar</p>
        </button>

        <button
          onClick={() => setViewMode('export')}
          className={`p-4 rounded-xl border-2 transition-all ${
            viewMode === 'export'
              ? 'bg-orange-900/30 border-orange-500 text-orange-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-orange-500'
          }`}
        >
          <Download className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm font-semibold">Exportar</p>
        </button>

        <button
          onClick={() => setViewMode('backup')}
          className={`p-4 rounded-xl border-2 transition-all ${
            viewMode === 'backup'
              ? 'bg-red-900/30 border-red-500 text-red-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-red-500'
          }`}
        >
          <Database className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm font-semibold">Backup</p>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-slate-800 rounded-2xl border-2 border-slate-700 p-6">
        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Cursos en Base de Datos</h2>
              <button
                onClick={loadCourses}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                Recargar
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No hay cursos cargados. Haz clic en "Recargar" para obtener los cursos.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center gap-4 p-4 border-2 border-slate-700 rounded-xl hover:border-blue-500 transition-colors">
                    <img 
                      src={course.image || course.thumbnail} 
                      alt={course.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{course.title}</h3>
                      <p className="text-sm text-slate-400">{course.category} • {course.level}</p>
                      <p className="text-sm text-slate-300">{course.students} estudiantes • {course.rating}⭐</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-white">${course.price}</p>
                      <p className="text-xs text-slate-400">{course.lessons_count} lecciones</p>
                    </div>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      disabled={loading}
                      className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CREATE VIEW */}
        {viewMode === 'create' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Crear Nuevo Curso</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Curso Profesional de..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Instructor *</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Nombre del instructor"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Descripción *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="Descripción del curso..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option>Desarrollo Web</option>
                    <option>Backend</option>
                    <option>Mobile</option>
                    <option>Data Science</option>
                    <option>AI/ML</option>
                    <option>DevOps</option>
                    <option>Cloud</option>
                    <option>Diseño</option>
                    <option>Marketing</option>
                    <option>Game Dev</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Nivel *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Precio ($) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Duración</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="24h 30min"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Número de Lecciones</label>
                  <input
                    type="number"
                    value={formData.lessons_count}
                    onChange={(e) => setFormData({ ...formData, lessons_count: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={createCourse}
                  disabled={loading || !formData.title || !formData.instructor}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Crear Curso
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className="px-6 py-3 bg-slate-700 text-slate-200 rounded-xl font-semibold hover:bg-slate-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IMPORT VIEW */}
        {viewMode === 'import' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Importar Cursos</h2>
            <div className="space-y-4">
              <button
                onClick={importFromExtendedCourses}
                disabled={loading}
                className="w-full flex items-center justify-between p-6 border-2 border-purple-700 rounded-xl hover:bg-purple-900/20 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-900/30 rounded-lg">
                    <Database className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-white">Importar desde extendedCourses.ts</h3>
                    <p className="text-sm text-slate-300">Importa todos los {extendedCourses.length} cursos del archivo local</p>
                  </div>
                </div>
                {loading && <Loader className="w-6 h-6 animate-spin text-purple-400" />}
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importFromJSON}
                  disabled={loading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  id="json-upload"
                />
                <label
                  htmlFor="json-upload"
                  className="flex items-center justify-between p-6 border-2 border-blue-700 rounded-xl hover:bg-blue-900/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-900/30 rounded-lg">
                      <FileJson className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg text-white">Importar desde archivo JSON</h3>
                      <p className="text-sm text-slate-300">Selecciona un archivo JSON con cursos</p>
                    </div>
                  </div>
                  <Upload className="w-6 h-6 text-blue-400" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* EXPORT VIEW */}
        {viewMode === 'export' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Exportar Cursos</h2>
            <div className="space-y-4">
              <button
                onClick={exportToJSON}
                disabled={loading}
                className="w-full flex items-center justify-between p-6 border-2 border-green-700 rounded-xl hover:bg-green-900/20 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-900/30 rounded-lg">
                    <FileJson className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-white">Exportar todos los cursos a JSON</h3>
                    <p className="text-sm text-slate-300">Descarga todos los cursos de la base de datos</p>
                  </div>
                </div>
                {loading ? <Loader className="w-6 h-6 animate-spin text-green-400" /> : <Download className="w-6 h-6 text-green-400" />}
              </button>
            </div>
          </div>
        )}

        {/* BACKUP VIEW */}
        {viewMode === 'backup' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Backup Completo</h2>
            <div className="bg-yellow-900/20 border-2 border-yellow-700 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-300">Backup de Base de Datos Completa</p>
                  <p className="text-sm text-yellow-200">Esto exportará TODOS los datos: cursos, posts, blog posts y usuarios.</p>
                </div>
              </div>
            </div>

            <button
              onClick={createFullBackup}
              disabled={loading}
              className="w-full flex items-center justify-between p-6 border-2 border-red-700 rounded-xl hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-900/30 rounded-lg">
                  <Database className="w-8 h-8 text-red-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg text-white">Crear Backup Completo</h3>
                  <p className="text-sm text-slate-300">Exporta toda la base de datos a un archivo JSON</p>
                </div>
              </div>
              {loading ? <Loader className="w-6 h-6 animate-spin text-red-400" /> : <Download className="w-6 h-6 text-red-400" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}