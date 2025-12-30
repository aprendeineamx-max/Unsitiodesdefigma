import { useState } from 'react';
import {
  PlayCircle,
  FileText,
  Code,
  CheckCircle,
  Lock,
  Clock,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Target,
  Zap,
  Radio
} from 'lucide-react';
import { Module, Lesson, LessonType } from '../data/courseLessons';

interface CourseModulesProps {
  modules: Module[];
}

const lessonTypeConfig: Record<LessonType, { icon: any; color: string; bgColor: string; label: string }> = {
  video: {
    icon: PlayCircle,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    label: 'Video'
  },
  quiz: {
    icon: Target,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    label: 'Quiz'
  },
  code: {
    icon: Code,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    label: 'Código'
  },
  project: {
    icon: Zap,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    label: 'Proyecto'
  },
  reading: {
    icon: BookOpen,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    label: 'Lectura'
  },
  practice: {
    icon: FileText,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    label: 'Práctica'
  },
  live: {
    icon: Radio,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    label: 'En vivo'
  }
};

export function CourseModules({ modules }: CourseModulesProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set([modules[0]?.id]));

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedLessons = modules.reduce(
    (acc, module) => acc + module.lessons.filter(l => l.completed).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-[#121f3d] to-[#1a2d5a] dark:from-gray-900 dark:to-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Contenido del Curso</h2>
          <div className="text-white/80 text-sm">
            {completedLessons} de {totalLessons} lecciones completadas
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-white/70 text-sm mb-1">Módulos</div>
            <div className="text-2xl font-bold text-white">{modules.length}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-white/70 text-sm mb-1">Lecciones</div>
            <div className="text-2xl font-bold text-white">{totalLessons}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-white/70 text-sm mb-1">Progreso</div>
            <div className="text-2xl font-bold text-white">
              {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-white/70 text-sm mb-1">Duración Total</div>
            <div className="text-2xl font-bold text-white">
              {modules.reduce((acc, m) => {
                const hours = parseInt(m.duration.split('h')[0]) || 0;
                return acc + hours;
              }, 0)}h+
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#98ca3f] transition-all duration-500"
              style={{
                width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Módulos */}
      <div className="space-y-4">
        {modules.map((module, moduleIndex) => {
          const isExpanded = expandedModules.has(module.id);
          const completedCount = module.lessons.filter(l => l.completed).length;
          const totalCount = module.lessons.length;
          const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          return (
            <div
              key={module.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Module Header */}
              <button
                onClick={() => !module.locked && toggleModule(module.id)}
                disabled={module.locked}
                className={`w-full p-6 text-left transition-colors ${
                  module.locked
                    ? 'cursor-not-allowed opacity-60'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Module Number */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      module.locked
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                        : 'bg-[#121f3d] dark:bg-[#98ca3f] text-white dark:text-[#121f3d]'
                    }`}>
                      {module.locked ? <Lock className="w-5 h-5" /> : moduleIndex + 1}
                    </div>

                    {/* Module Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {module.title}
                        </h3>
                        {module.locked && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            Bloqueado
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {module.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <PlayCircle className="w-4 h-4" />
                          <span>{totalCount} lecciones</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{module.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span>{completedCount}/{totalCount} completadas</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {!module.locked && (
                        <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#98ca3f] transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expand Icon */}
                  {!module.locked && (
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              </button>

              {/* Lessons List */}
              {isExpanded && !module.locked && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const config = lessonTypeConfig[lesson.type];
                    const Icon = config.icon;

                    return (
                      <div
                        key={lesson.id}
                        className={`p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors ${
                          lesson.locked
                            ? 'opacity-60 cursor-not-allowed'
                            : lesson.completed
                            ? 'bg-green-50/50 dark:bg-green-900/10'
                            : 'hover:bg-white dark:hover:bg-gray-800 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Lesson Icon */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                            {lesson.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : lesson.locked ? (
                              <Lock className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Icon className={`w-5 h-5 ${config.color}`} />
                            )}
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`font-medium ${
                                    lesson.completed
                                      ? 'text-green-700 dark:text-green-400'
                                      : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {lesson.title}
                                  </h4>
                                  {lesson.locked && (
                                    <Lock className="w-3 h-3 text-gray-400" />
                                  )}
                                </div>

                                {lesson.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {lesson.description}
                                  </p>
                                )}

                                {/* Lesson metadata */}
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                  <span className={`px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} font-medium`}>
                                    {config.label}
                                  </span>
                                  
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{lesson.duration}</span>
                                  </div>

                                  {lesson.quiz && (
                                    <span className="text-purple-600 dark:text-purple-400">
                                      {lesson.quiz.questions} preguntas • {lesson.quiz.passingScore}% para aprobar
                                    </span>
                                  )}

                                  {lesson.code && (
                                    <span className="text-green-600 dark:text-green-400">
                                      {lesson.code.exercises} ejercicios • {lesson.code.language}
                                    </span>
                                  )}

                                  {lesson.project && (
                                    <span className="text-orange-600 dark:text-orange-400">
                                      Dificultad: {lesson.project.difficulty} • {lesson.project.estimatedTime}
                                    </span>
                                  )}
                                </div>

                                {/* Resources */}
                                {lesson.resources && lesson.resources.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {lesson.resources.map((resource, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-600 dark:text-gray-400"
                                      >
                                        <FileText className="w-3 h-3" />
                                        {resource}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Action Button */}
                              {!lesson.locked && (
                                <button
                                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    lesson.completed
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                      : 'bg-[#98ca3f] hover:bg-[#87b935] text-white'
                                  }`}
                                >
                                  {lesson.completed ? 'Revisar' : 'Comenzar'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA for locked modules */}
      {modules.some(m => m.locked) && (
        <div className="bg-gradient-to-r from-[#98ca3f] to-[#87b935] rounded-xl p-6 text-center">
          <div className="max-w-md mx-auto">
            <Lock className="w-12 h-12 text-white mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">
              Desbloquea todo el contenido
            </h3>
            <p className="text-white/90 mb-4">
              Completa las lecciones anteriores para acceder a módulos avanzados
            </p>
            <button className="bg-white text-[#121f3d] px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Continuar aprendiendo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
