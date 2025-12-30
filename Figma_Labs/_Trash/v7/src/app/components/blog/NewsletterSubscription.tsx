import { useState } from 'react';
import { Mail, Check, Send, Sparkles, Bell, Calendar, Users, TrendingUp, X, Settings } from 'lucide-react';

interface NewsletterSubscriptionProps {
  variant?: 'inline' | 'modal' | 'sidebar' | 'footer' | 'popup';
  onSubscribe?: (email: string, preferences: SubscriptionPreferences) => void;
  currentEmail?: string;
  isSubscribed?: boolean;
  stats?: {
    subscribers: number;
    openRate: number;
    frequency: string;
  };
}

interface SubscriptionPreferences {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  topics: string[];
  digest: boolean;
}

export function NewsletterSubscription({
  variant = 'inline',
  onSubscribe,
  currentEmail,
  isSubscribed = false,
  stats
}: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState(currentEmail || '');
  const [subscribed, setSubscribed] = useState(isSubscribed);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<SubscriptionPreferences>({
    frequency: 'weekly',
    topics: [],
    digest: true
  });
  const [step, setStep] = useState<'email' | 'preferences' | 'success'>('email');

  const topics = [
    { id: 'web-dev', label: 'Desarrollo Web', icon: '💻' },
    { id: 'mobile', label: 'Desarrollo Móvil', icon: '📱' },
    { id: 'backend', label: 'Backend', icon: '⚙️' },
    { id: 'devops', label: 'DevOps', icon: '🚀' },
    { id: 'ai-ml', label: 'IA & ML', icon: '🤖' },
    { id: 'design', label: 'Diseño', icon: '🎨' },
    { id: 'career', label: 'Carrera', icon: '💼' },
    { id: 'tutorials', label: 'Tutoriales', icon: '📚' }
  ];

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && !subscribed) {
      setStep('preferences');
    }
  };

  const handleSubscribe = () => {
    onSubscribe?.(email, preferences);
    setSubscribed(true);
    setStep('success');
  };

  const toggleTopic = (topicId: string) => {
    setPreferences(prev => ({
      ...prev,
      topics: prev.topics.includes(topicId)
        ? prev.topics.filter(t => t !== topicId)
        : [...prev.topics, topicId]
    }));
  };

  // Popup variant
  if (variant === 'popup') {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
          {/* Close button */}
          <button
            onClick={() => {}}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          {step === 'success' ? (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Suscripción Exitosa!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Revisa tu email para confirmar tu suscripción
              </p>
              <button className="px-6 py-3 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium">
                ¡Entendido!
              </button>
            </div>
          ) : step === 'preferences' ? (
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Personaliza tu Newsletter
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Elige qué contenido quieres recibir
              </p>

              {/* Frequency */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Frecuencia
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['daily', 'weekly', 'biweekly', 'monthly'].map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setPreferences(prev => ({ ...prev, frequency: freq as any }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        preferences.frequency === freq
                          ? 'border-[#98CA3F] bg-[#98CA3F]/10 text-[#98CA3F]'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {freq === 'daily' && 'Diario'}
                      {freq === 'weekly' && 'Semanal'}
                      {freq === 'biweekly' && 'Quincenal'}
                      {freq === 'monthly' && 'Mensual'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topics */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Temas de interés
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => toggleTopic(topic.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        preferences.topics.includes(topic.id)
                          ? 'border-[#98CA3F] bg-[#98CA3F]/10'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="text-xl mb-1 block">{topic.icon}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {topic.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Digest option */}
              <label className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.digest}
                  onChange={(e) => setPreferences(prev => ({ ...prev, digest: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-[#98CA3F] focus:ring-[#98CA3F] mt-0.5"
                />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Recibir resumen semanal
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Un email con los mejores artículos de la semana
                  </div>
                </div>
              </label>

              <button
                onClick={handleSubscribe}
                className="w-full px-6 py-3 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Suscribirme
              </button>
            </div>
          ) : (
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#98CA3F] to-[#7fb32f] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Mantente Actualizado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                Recibe los mejores artículos directo en tu inbox
              </p>

              {stats && (
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.subscribers >= 1000 ? `${(stats.subscribers / 1000).toFixed(1)}k` : stats.subscribers}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Suscriptores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.openRate}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Apertura</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.frequency}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Frecuencia</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitEmail}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white mb-3 focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium"
                >
                  Continuar
                </button>
              </form>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                Sin spam. Cancela cuando quieras.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <div className="bg-gradient-to-br from-[#0A2540] to-[#0F3554] rounded-xl p-6 text-white">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold mb-2">Newsletter Semanal</h3>
        <p className="text-white/80 text-sm mb-4">
          Los mejores artículos de la semana en tu inbox
        </p>

        {subscribed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <Check className="w-5 h-5 text-[#98CA3F]" />
              <span className="text-sm">Estás suscrito</span>
            </div>
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              Preferencias
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitEmail}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/60 mb-3 focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium"
            >
              Suscribirme
            </button>
          </form>
        )}

        {stats && (
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="text-white/80">
                {stats.subscribers >= 1000 ? `${(stats.subscribers / 1000).toFixed(1)}k` : stats.subscribers}+
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-white/80">{stats.openRate}% apertura</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Footer variant
  if (variant === 'footer') {
    return (
      <div className="bg-gradient-to-r from-[#0A2540] to-[#0F3554] rounded-2xl p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-[#98CA3F]" />
                <span className="text-sm font-semibold text-[#98CA3F] uppercase tracking-wider">
                  Newsletter
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Aprende algo nuevo cada semana
              </h2>
              <p className="text-white/80 mb-4">
                Únete a {stats?.subscribers.toLocaleString() || '10,000'}+ desarrolladores que reciben contenido de calidad
              </p>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-[#98CA3F]" />
                  <span>Sin spam</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-[#98CA3F]" />
                  <span>Cancela cuando quieras</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-[#98CA3F]" />
                  <span>100% gratis</span>
                </div>
              </div>
            </div>
            <div>
              {subscribed ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <Check className="w-12 h-12 text-[#98CA3F] mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">¡Ya estás suscrito!</h3>
                  <p className="text-white/80 text-sm">
                    Revisa tu email cada {preferences.frequency === 'weekly' ? 'semana' : 'mes'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitEmail} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-[#98CA3F]"
                      required
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      <span className="hidden sm:inline">Suscribirme</span>
                    </button>
                  </div>
                  <p className="text-xs text-white/60 text-center">
                    Usamos tus datos solo para enviarte el newsletter. Lee nuestra{' '}
                    <a href="#" className="underline hover:text-white">política de privacidad</a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-200 dark:border-gray-600 p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-500 rounded-xl flex-shrink-0">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            ¿Te gustó este artículo?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Recibe contenido similar en tu email cada semana
          </p>
          
          {subscribed ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="w-5 h-5" />
              <span className="font-semibold">Ya estás suscrito al newsletter</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitEmail} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#98CA3F] focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#98CA3F] text-white rounded-lg hover:bg-[#7fb32f] transition-colors font-medium text-sm"
              >
                Suscribirme
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
