import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  courses: number;
  color: string;
}

export function CategoryCard({ title, icon: Icon, courses, color }: CategoryCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 hover:shadow-lg dark:hover:shadow-2xl transition-shadow cursor-pointer group border border-gray-100 dark:border-gray-700">
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h3 className="text-lg mb-1 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{courses} cursos</p>
    </div>
  );
}
