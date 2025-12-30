import { Clock, Users, Star, TrendingUp, Bookmark, Play, Award, Zap, ShoppingCart } from 'lucide-react';
import { Course } from '../data/courses';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  const { addToCart, items } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Defensive check
  if (!course) {
    return null;
  }
  
  const isInCart = items.some(item => item.id === course.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInCart) {
      addToCart(course);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'principiante': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'intermedio': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'avanzado': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-card border border-primary rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-tertiary">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute bottom-4 left-4 right-4">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="w-full py-3 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white transition-colors"
            >
              <Play className="w-5 h-5" />
              Vista Previa
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {course.bestseller && (
            <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
              <TrendingUp className="w-3 h-3" />
              Bestseller
            </span>
          )}
          {course.new && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
              Nuevo
            </span>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110 shadow-lg"
        >
          <Bookmark 
            className={`w-4 h-4 transition-colors ${
              isSaved ? 'fill-[#98ca3f] text-[#98ca3f]' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Progress Bar (if enrolled) */}
        {course.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
            <div 
              className="h-full bg-[#98ca3f] transition-all duration-500"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category & Level */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-brand px-3 py-1 bg-brand/10 rounded-full">
            {course.category}
          </span>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${getDifficultyColor(course.level)}`}>
            {course.level}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-primary group-hover:text-brand transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-4">
          <img
            src={course.instructorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`}
            alt={course.instructor}
            className="w-7 h-7 rounded-full border-2 border-border-primary"
          />
          <p className="text-sm text-secondary">{course.instructor}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-secondary">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-primary">{course.rating}</span>
            <span className="text-tertiary">({course.students.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.students > 1000 ? `${(course.students / 1000).toFixed(1)}k` : course.students}</span>
          </div>
        </div>

        {/* Features */}
        {course.features && course.features.length > 0 && (
          <div className="mb-4 space-y-1">
            {course.features.slice(0, 2).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-secondary">
                <Award className="w-3 h-3 text-brand flex-shrink-0" />
                <span className="line-clamp-1">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-primary">
          <div>
            {course.price === 0 ? (
              <span className="text-2xl font-bold text-brand">Gratis</span>
            ) : (
              <div className="flex items-baseline gap-2">
                {course.originalPrice && (
                  <span className="text-sm text-tertiary line-through">${course.originalPrice}</span>
                )}
                <span className="text-2xl font-bold text-primary">${course.price}</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              isInCart
                ? 'bg-tertiary text-secondary cursor-not-allowed'
                : 'bg-brand text-[#121f3d] hover:bg-[#87b935] hover:scale-105 shadow-md hover:shadow-lg'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isInCart ? 'En carrito' : 'Agregar'}
          </button>
        </div>

        {/* XP Badge (if gamification enabled) */}
        {course.xpReward && (
          <div className="mt-3 flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
              +{course.xpReward} XP al completar
            </span>
          </div>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-[#98ca3f] to-[#7ab32f] rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 -z-10`} />
    </div>
  );
}