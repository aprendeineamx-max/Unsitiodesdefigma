import { useState } from 'react';
import {
  Check,
  X,
  Zap,
  Crown,
  Sparkles,
  Users,
  MessageSquare,
  BookOpen,
  Video,
  Award,
  TrendingUp,
  Target,
  Brain,
  Headphones,
  Download,
  Globe,
  Shield,
  Star
} from 'lucide-react';

type BillingCycle = 'monthly' | 'annual';

interface PlanFeature {
  name: string;
  included: boolean;
  tooltip?: string;
}

interface Plan {
  id: string;
  name: string;
  icon: any;
  iconColor: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  discount?: number;
  popular?: boolean;
  features: PlanFeature[];
  coursesAccess: string;
  coursesCount: string;
  cta: string;
  color: string;
  bgGradient: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    icon: BookOpen,
    iconColor: 'text-gray-600',
    tagline: 'Comienza tu viaje de aprendizaje',
    monthlyPrice: 0,
    annualPrice: 0,
    coursesAccess: 'Cursos Gratis',
    coursesCount: '10+ cursos gratuitos',
    cta: 'Comenzar Gratis',
    color: 'border-gray-300 dark:border-gray-600',
    bgGradient: 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
    features: [
      { name: '10+ cursos gratuitos', included: true },
      { name: 'Acceso a comunidad', included: true },
      { name: 'Foros y discusiones', included: true },
      { name: 'Grupos de estudio', included: true },
      { name: 'Red social de estudiantes', included: true },
      { name: 'Mensajería entre estudiantes', included: true },
      { name: 'Certificados de cursos gratis', included: true },
      { name: 'Calidad de video 720p', included: true },
      { name: 'Chat con IA Tutor (5 msgs/día)', included: true, tooltip: '5 mensajes diarios con el tutor de IA' },
      { name: 'Soporte por email', included: true },
      { name: 'Acceso a cursos Pro', included: false },
      { name: 'Acceso a cursos Premium', included: false },
      { name: 'Descargas offline', included: false },
      { name: 'Proyectos premium', included: false },
      { name: 'Certificados verificados', included: false }
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Zap,
    iconColor: 'text-[#98ca3f]',
    tagline: 'Acelera tu carrera profesional',
    monthlyPrice: 29,
    annualPrice: 290,
    discount: 17,
    popular: true,
    coursesAccess: 'Cursos Free + Pro',
    coursesCount: '200+ cursos incluidos',
    cta: 'Comenzar Prueba Gratis',
    color: 'border-[#98ca3f]',
    bgGradient: 'from-[#98ca3f]/5 to-[#87b935]/5 dark:from-[#98ca3f]/10 dark:to-[#87b935]/10',
    features: [
      { name: 'TODO lo del plan Free', included: true },
      { name: '200+ cursos Pro', included: true },
      { name: 'Calidad de video 1080p', included: true },
      { name: 'Chat con IA Tutor ilimitado', included: true, tooltip: 'Mensajes ilimitados con el tutor de IA' },
      { name: 'Descargas offline', included: true },
      { name: 'Acceso a ejercicios prácticos', included: true },
      { name: 'Proyectos intermedios', included: true },
      { name: 'Certificados verificados', included: true },
      { name: 'Rutas de aprendizaje guiadas', included: true },
      { name: 'Mentorías grupales mensuales', included: true },
      { name: 'Soporte prioritario 24/7', included: true },
      { name: 'Descuentos en eventos', included: true },
      { name: 'Acceso a cursos Premium', included: false },
      { name: 'Mentoría 1-on-1', included: false },
      { name: 'Revisión de código personalizada', included: false }
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Crown,
    iconColor: 'text-yellow-500',
    tagline: 'La experiencia definitiva',
    monthlyPrice: 59,
    annualPrice: 590,
    discount: 17,
    coursesAccess: 'Todos los Cursos',
    coursesCount: '500+ cursos incluidos',
    cta: 'Comenzar Prueba Gratis',
    color: 'border-yellow-500',
    bgGradient: 'from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10',
    features: [
      { name: 'TODO lo del plan Pro', included: true },
      { name: '500+ cursos Premium', included: true },
      { name: 'Cursos exclusivos Premium', included: true },
      { name: 'Calidad de video 4K', included: true },
      { name: 'IA Tutor avanzado con memoria', included: true, tooltip: 'IA que recuerda tu progreso y se adapta' },
      { name: 'Proyectos avanzados reales', included: true },
      { name: 'Mentoría 1-on-1 mensual', included: true },
      { name: 'Revisión de código personalizada', included: true },
      { name: 'Acceso anticipado a cursos nuevos', included: true },
      { name: 'Eventos VIP exclusivos', included: true },
      { name: 'Networking con expertos', included: true },
      { name: 'Preparación para entrevistas', included: true },
      { name: 'Portfolio review profesional', included: true },
      { name: 'Certificados Premium verificados', included: true },
      { name: 'Soporte VIP prioritario', included: true }
    ]
  }
];

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');

  const getPrice = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return 0;
    return billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.annualPrice / 12);
  };

  const getTotalPrice = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return 0;
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#98ca3f]/10 dark:bg-[#98ca3f]/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#98ca3f]" />
            <span className="text-sm font-medium text-[#98ca3f]">Planes y Precios</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Invierte en tu{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#98ca3f] to-[#87b935]">
              futuro
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Elige el plan perfecto para tus objetivos de aprendizaje. Todos los planes incluyen acceso a la comunidad, foros y grupos de estudio.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#121f3d] dark:bg-[#98ca3f] text-white dark:text-[#121f3d]'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-[#121f3d] dark:bg-[#98ca3f] text-white dark:text-[#121f3d]'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Anual
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = getPrice(plan);
            const totalPrice = getTotalPrice(plan);

            return (
              <div
                key={plan.id}
                className={`relative bg-gradient-to-br ${plan.bgGradient} rounded-2xl p-8 border-2 ${plan.color} ${
                  plan.popular
                    ? 'shadow-2xl scale-105 lg:scale-110'
                    : 'shadow-lg hover:shadow-xl'
                } transition-all duration-300 hover:-translate-y-1`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#98ca3f] to-[#87b935] text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                      <Star className="w-4 h-4 fill-white" />
                      Más Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${
                    plan.id === 'free' ? 'bg-gray-200 dark:bg-gray-700' :
                    plan.id === 'pro' ? 'bg-[#98ca3f]/20 dark:bg-[#98ca3f]/30' :
                    'bg-yellow-100 dark:bg-yellow-900/30'
                  } mb-4`}>
                    <Icon className={`w-8 h-8 ${plan.iconColor}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-gray-900 dark:text-white">
                        ${price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        /mes
                      </span>
                    </div>
                    
                    {billingCycle === 'annual' && plan.monthlyPrice > 0 && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        ${totalPrice}/año • Ahorras ${(plan.monthlyPrice * 12) - plan.annualPrice}
                      </div>
                    )}
                  </div>

                  {/* Courses Access */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                    <Video className="w-4 h-4 text-[#98ca3f]" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {plan.coursesAccess}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {plan.coursesCount}
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-base mb-6 transition-all ${
                    plan.id === 'free'
                      ? 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600'
                      : plan.id === 'pro'
                      ? 'bg-gradient-to-r from-[#98ca3f] to-[#87b935] text-white hover:shadow-lg hover:scale-105'
                      : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features List */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Incluye:
                  </div>
                  {plan.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 group"
                      title={feature.tooltip}
                    >
                      {feature.included ? (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mt-0.5">
                          <X className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-600'
                        } ${feature.tooltip ? 'cursor-help' : ''}`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Comparison Table (Mobile Friendly) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-12">
          <div className="p-6 md:p-8 bg-gradient-to-r from-[#121f3d] to-[#1a2d5a] dark:from-gray-900 dark:to-gray-800">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Comparación Detallada
            </h2>
            <p className="text-white/80">
              Compara todas las características de cada plan
            </p>
          </div>

          {/* Mobile: Card View */}
          <div className="block lg:hidden p-4 space-y-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${getPrice(plan)}/mes
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {plan.features.slice(0, 8).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={feature.included ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-6 text-gray-900 dark:text-white font-semibold">
                    Características
                  </th>
                  {plans.map((plan) => {
                    const Icon = plan.icon;
                    return (
                      <th key={plan.id} className="p-6 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                          <span className="font-bold text-gray-900 dark:text-white">
                            {plan.name}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(...plans.map(p => p.features.length)) }).map((_, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      {plans[0].features[idx]?.name}
                    </td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="p-4 text-center">
                        {plan.features[idx]?.included ? (
                          <div className="inline-flex w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="inline-flex w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
                            <X className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 text-center border border-gray-200 dark:border-gray-700">
            <Users className="w-8 h-8 md:w-10 md:h-10 text-[#98ca3f] mx-auto mb-2" />
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">500K+</div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Estudiantes activos</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 text-center border border-gray-200 dark:border-gray-700">
            <Video className="w-8 h-8 md:w-10 md:h-10 text-[#98ca3f] mx-auto mb-2" />
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">500+</div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Cursos disponibles</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 text-center border border-gray-200 dark:border-gray-700">
            <Award className="w-8 h-8 md:w-10 md:h-10 text-[#98ca3f] mx-auto mb-2" />
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">4.9/5</div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Satisfacción</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 text-center border border-gray-200 dark:border-gray-700">
            <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-[#98ca3f] mx-auto mb-2" />
            <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">95%</div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Tasa de éxito</div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                Sí, puedes actualizar o cambiar tu plan en cualquier momento. Los cambios se aplicarán inmediatamente.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                ¿Qué incluye el plan Free?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                El plan Free incluye acceso completo a todos los cursos gratuitos, comunidad, foros, grupos de estudio, red social y 5 mensajes diarios con el tutor de IA.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                ¿Ofrecen garantía de reembolso?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                Sí, ofrecemos 30 días de garantía de reembolso en todos los planes de pago. Sin preguntas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                ¿Los certificados tienen validez oficial?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                Los certificados verificados (Pro y Premium) incluyen blockchain verification y son reconocidos por empresas líderes.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-[#121f3d] to-[#1a2d5a] dark:from-[#98ca3f] dark:to-[#87b935] rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white dark:text-[#121f3d] mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-lg md:text-xl text-white/90 dark:text-[#121f3d]/90 mb-6 md:mb-8 max-w-2xl mx-auto">
            Únete a más de 500,000 estudiantes que ya están transformando sus carreras
          </p>
          <button className="bg-white dark:bg-[#121f3d] text-[#121f3d] dark:text-white px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-transform shadow-xl">
            Comenzar Ahora Gratis
          </button>
        </div>
      </div>
    </div>
  );
}
