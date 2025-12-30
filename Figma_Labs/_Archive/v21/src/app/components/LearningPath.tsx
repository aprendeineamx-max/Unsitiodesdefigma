import { ArrowRight } from 'lucide-react';

interface LearningPathProps {
  title: string;
  description: string;
  courses: number;
  hours: number;
  color: string;
}

export function LearningPath({ title, description, courses, hours, color }: LearningPathProps) {
  return (
    <div 
      className="rounded-xl p-6 text-white relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
      style={{ backgroundColor: color }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
      
      <div className="relative z-10">
        <h3 className="text-2xl mb-2">{title}</h3>
        <p className="text-white/90 mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center gap-4 mb-4 text-sm">
          <span>{courses} cursos</span>
          <span>•</span>
          <span>{hours} horas</span>
        </div>
        <button className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-white/90 transition-colors">
          Ver ruta
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
