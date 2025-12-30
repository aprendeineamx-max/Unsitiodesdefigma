import { useState, useMemo } from 'react';
import { Hero } from '../components/Hero';
import { CourseCard } from '../components/CourseCard';
import { LearningPath } from '../components/LearningPath';
import { CategoryCard } from '../components/CategoryCard';
import { SearchAndFilter } from '../components/SearchAndFilter';
import { CategoryTabs } from '../components/CategoryTabs';
import { SortOptions, SortOption } from '../components/SortOptions';
import { LoadingGrid } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyCoursesState } from '../components/EmptyState';
import { Code, Palette, BarChart3, DollarSign, Globe, Sparkles } from 'lucide-react';
import { Course } from '../data/extendedCourses';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSupabaseData } from '../context/SupabaseDataContext';

const learningPaths = [
  {
    title: 'Desarrollo Web Full Stack',
    description: 'Conviértete en desarrollador full stack y crea aplicaciones web profesionales desde cero',
    courses: 12,
    hours: 180,
    color: '#4a90e2'
  },
  {
    title: 'Data Science e IA',
    description: 'Domina el análisis de datos, machine learning e inteligencia artificial',
    courses: 15,
    hours: 220,
    color: '#9b59b6'
  },
  {
    title: 'Marketing Digital',
    description: 'Aprende las estrategias y herramientas para impulsar tu marca en el mundo digital',
    courses: 10,
    hours: 140,
    color: '#e74c3c'
  },
  {
    title: 'Diseño UX/UI',
    description: 'Crea experiencias de usuario excepcionales y diseños visuales impactantes',
    courses: 11,
    hours: 165,
    color: '#f39c12'
  }
];

const categories = [
  { title: 'Programación', icon: Code, courses: 120, color: '#4a90e2' },
  { title: 'Diseño', icon: Palette, courses: 85, color: '#e91e63' },
  { title: 'Negocios', icon: BarChart3, courses: 95, color: '#ff9800' },
  { title: 'Marketing', icon: DollarSign, courses: 78, color: '#9c27b0' },
  { title: 'Idiomas', icon: Globe, courses: 42, color: '#00bcd4' },
  { title: 'Creatividad', icon: Sparkles, courses: 63, color: '#8bc34a' }
];

interface HomePageProps {
  onCourseSelect: (course: Course) => void;
}

export function HomePage({ onCourseSelect }: HomePageProps) {
  // Use Supabase data instead of Admin context
  const { courses: supabaseCourses, loading, convertToLegacyCourse, errors } = useSupabaseData();
  const [searchQuery, setSearchQuery] = useLocalStorage('platzi-search', '');
  const [selectedCategory, setSelectedCategory] = useLocalStorage('platzi-category', 'Todos');
  const [selectedLevel, setSelectedLevel] = useLocalStorage('platzi-level', 'Todos');
  const [activeTab, setActiveTab] = useLocalStorage('platzi-tab', 'Todos');
  const [sortOption, setSortOption] = useLocalStorage<SortOption>('platzi-sort', 'popular');

  // Convert Supabase courses to legacy format
  const allCourses = useMemo(() => {
    return supabaseCourses.map(convertToLegacyCourse);
  }, [supabaseCourses, convertToLegacyCourse]);

  const courseCategories = useMemo(() => {
    if (!allCourses || allCourses.length === 0) return [];
    return Array.from(new Set(allCourses.map(course => course.category)));
  }, [allCourses]);

  const filteredAndSortedCourses = useMemo(() => {
    if (!allCourses || allCourses.length === 0) return [];
    
    let filtered = allCourses.filter(course => {
      if (!course) return false;
      
      const matchesSearch = searchQuery === '' || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'Todos' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'Todos' || course.level === selectedLevel;
      const matchesTab = activeTab === 'Todos' || course.category === activeTab;
      
      return matchesSearch && matchesCategory && matchesLevel && matchesTab;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'popular':
          return b.students - a.students;
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return parseInt(a.id) - parseInt(b.id);
        default:
          return 0;
      }
    });

    return sorted;
  }, [allCourses, searchQuery, selectedCategory, selectedLevel, activeTab, sortOption]);

  return (
    <>
      <Hero />
      
      {/* Search and Filter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchAndFilter 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          categories={courseCategories}
        />
      </section>

      {/* Category Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryTabs 
          categories={courseCategories}
          activeCategory={activeTab}
          onCategoryChange={setActiveTab}
        />
      </section>

      {/* Filtered Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl mb-2 text-gray-900 dark:text-white">
              {activeTab === 'Todos' ? 'Todos los cursos' : `Cursos de ${activeTab}`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredAndSortedCourses.length} {filteredAndSortedCourses.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
            </p>
          </div>
          
          <SortOptions 
            selectedSort={sortOption}
            onSortChange={setSortOption}
          />
        </div>
        
        {loading ? (
          <LoadingGrid />
        ) : errors ? (
          <ErrorState />
        ) : filteredAndSortedCourses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course}
                onClick={() => onCourseSelect(course)}
              />
            ))}
          </div>
        ) : (
          <EmptyCoursesState />
        )}
      </section>

      {/* Learning Paths */}
      <section className="bg-white dark:bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl mb-2 text-gray-900 dark:text-white">Rutas de aprendizaje</h2>
            <p className="text-gray-600 dark:text-gray-400">Sigue un camino estructurado para alcanzar tus metas profesionales</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningPaths.map((path, index) => (
              <LearningPath key={index} {...path} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl mb-2 text-gray-900 dark:text-white">Explora por categoría</h2>
          <p className="text-gray-600 dark:text-gray-400">Encuentra cursos en las áreas que más te interesan</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <CategoryCard key={index} {...category} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#121f3d] to-[#1a2d5a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl text-white mb-4">
            ¿Listo para impulsar tu carrera?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Únete a millones de estudiantes que están transformando sus vidas con educación de calidad
          </p>
          <button className="bg-[#98ca3f] text-[#121f3d] px-8 py-4 rounded-lg hover:bg-[#87b935] transition-colors text-lg">
            Comienza gratis
          </button>
        </div>
      </section>
    </>
  );
}