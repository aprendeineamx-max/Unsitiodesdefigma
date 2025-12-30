import { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Users,
  MessageSquare,
  Trophy,
  Zap,
  ArrowRight,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const onboardingSteps = [
  {
    id: 1,
    title: '¡Bienvenido a tu Plataforma de Aprendizaje!',
    description: 'Estás a punto de comenzar un viaje increíble de aprendizaje. Déjanos mostrarte cómo aprovechar al máximo nuestra plataforma.',
    icon: Sparkles,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop'
  },
  {
    id: 2,
    title: 'Explora +500 Cursos',
    description: 'Accede a una biblioteca completa de cursos de tecnología, diseño, negocios y más. Aprende a tu propio ritmo con contenido de alta calidad.',
    icon: BookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    features: [
      'Cursos desde básico hasta avanzado',
      'Videos en HD, ejercicios y proyectos',
      'Certificados al completar',
      'Contenido actualizado constantemente'
    ]
  },
  {
    id: 3,
    title: 'Únete a la Comunidad',
    description: 'Conecta con miles de estudiantes, participa en discusiones, únete a grupos de estudio y haz networking.',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    features: [
      'Foros de discusión activos',
      'Grupos de estudio por tema',
      'Red social de estudiantes',
      'Eventos y webinars en vivo'
    ]
  },
  {
    id: 4,
    title: 'Obtén Ayuda con IA',
    description: 'Nuestro tutor con IA está disponible 24/7 para responder tus preguntas, explicar conceptos y ayudarte a resolver ejercicios.',
    icon: Zap,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    features: [
      'Respuestas instantáneas',
      'Explicaciones personalizadas',
      'Ayuda con código y ejercicios',
      'Disponible en todos los cursos'
    ]
  },
  {
    id: 5,
    title: 'Gana Puntos y Logros',
    description: 'Completa cursos, participa en la comunidad y alcanza nuevos niveles. ¡Compite en el ranking global!',
    icon: Trophy,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    features: [
      'Sistema de puntos XP',
      'Badges y logros desbloqueables',
      'Ranking global de estudiantes',
      'Recompensas por consistencia'
    ]
  }
];

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { user, completeOnboarding } = useAuth();
  const step = onboardingSteps[currentStep];
  const Icon = step.icon;

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    completeOnboarding();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`${step.bgColor} p-2 rounded-lg`}>
              <Icon className={`w-6 h-6 ${step.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Configuración Inicial
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paso {currentStep + 1} de {onboardingSteps.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-[#98ca3f] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="space-y-6">
            {/* Icon and Title */}
            <div className="text-center">
              <div className={`inline-flex ${step.bgColor} p-4 rounded-2xl mb-4`}>
                <Icon className={`w-12 h-12 ${step.color}`} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {step.description}
              </p>
            </div>

            {/* Image (first step only) */}
            {step.image && (
              <div className="rounded-xl overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Features List */}
            {step.features && (
              <div className="space-y-3">
                {step.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Welcome Message (first step) */}
            {currentStep === 0 && user && (
              <div className="bg-gradient-to-r from-[#98ca3f]/10 to-[#87b935]/10 dark:from-[#98ca3f]/20 dark:to-[#87b935]/20 rounded-xl p-6 border border-[#98ca3f]/20">
                <p className="text-lg text-gray-900 dark:text-white">
                  ¡Hola <span className="font-bold">{user.name}</span>! 👋
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Tu cuenta ha sido verificada exitosamente. Estamos emocionados de tenerte aquí.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Skip/Previous */}
            <button
              onClick={currentStep === 0 ? handleSkip : handlePrevious}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              {currentStep === 0 ? 'Saltar tutorial' : 'Anterior'}
            </button>

            {/* Step Indicators */}
            <div className="flex items-center gap-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-[#98ca3f]'
                      : index < currentStep
                      ? 'bg-[#98ca3f]/50'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Next/Finish Button */}
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-[#98ca3f] hover:bg-[#87b935] text-white font-semibold rounded-lg transition-colors"
            >
              {currentStep === onboardingSteps.length - 1 ? (
                <>
                  <Check className="w-5 h-5" />
                  Comenzar
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
