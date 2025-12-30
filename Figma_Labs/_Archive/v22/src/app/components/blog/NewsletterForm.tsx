import { useState } from 'react';
import { Mail, Rocket, Check, X, Bell, Calendar } from 'lucide-react';
import { useBlog } from '../../context/BlogContext';
import { BlogNewsletterSubscription } from '../../types/blog.types';

interface NewsletterFormProps {
  variant?: 'sidebar' | 'inline' | 'modal' | 'footer';
  onSuccess?: () => void;
}

export function NewsletterForm({ variant = 'sidebar', onSuccess }: NewsletterFormProps) {
  const { newsletterSubscription, subscribeNewsletter, unsubscribeNewsletter, categories } = useBlog();
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<BlogNewsletterSubscription['frequency']>('weekly');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const isSubscribed = !!newsletterSubscription;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setIsSubmitting(true);

    try {
      await subscribeNewsletter(email, frequency, selectedCategories);
      setIsSuccess(true);
      setEmail('');
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess?.();
      }, 3000);
    } catch (err) {
      setError('Hubo un error. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!confirm('¿Estás seguro de que quieres cancelar tu suscripción?')) return;
    
    try {
      await unsubscribeNewsletter();
    } catch (err) {
      setError('Hubo un error al cancelar la suscripción.');
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (isSuccess) {
    return (
      <div className={getContainerClass(variant)}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Suscripción exitosa!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Revisa tu email para confirmar tu suscripción
          </p>
        </div>
      </div>
    );
  }

  if (isSubscribed) {
    return (
      <div className={getContainerClass(variant)}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Estás suscrito
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {newsletterSubscription.email}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
              <Bell className="w-3.5 h-3.5" />
              Frecuencia: {getFrequencyLabel(newsletterSubscription.frequency)}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleUnsubscribe}
          className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-semibold text-sm"
        >
          Cancelar suscripción
        </button>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enviando...' : 'Suscribirse'}
        </button>
      </form>
    );
  }

  return (
    <div className={getContainerClass(variant)}>
      <div className="relative z-10">
        {variant === 'sidebar' && (
          <Rocket className="w-12 h-12 mb-4 text-white" />
        )}
        
        <h3 className={`font-black mb-2 ${variant === 'sidebar' ? 'text-2xl text-white' : 'text-xl text-gray-900 dark:text-white'}`}>
          Newsletter
        </h3>
        
        <p className={`mb-4 text-sm ${variant === 'sidebar' ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
          Recibe los mejores artículos y tutoriales directamente en tu inbox
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className={`w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 ${
                variant === 'sidebar'
                  ? 'bg-white/20 border border-white/30 text-white placeholder-white/70 focus:ring-white/50'
                  : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 dark:text-white focus:ring-purple-500'
              }`}
            />
            {error && (
              <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                <X className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          {/* Frequency Selection */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${variant === 'sidebar' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
              Frecuencia
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    frequency === freq
                      ? variant === 'sidebar'
                        ? 'bg-white text-purple-600'
                        : 'bg-purple-600 text-white'
                      : variant === 'sidebar'
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {getFrequencyLabel(freq)}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection (optional) */}
          {categories.length > 0 && (
            <div>
              <label className={`block text-sm font-semibold mb-2 ${variant === 'sidebar' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                Categorías de interés (opcional)
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 5).map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedCategories.includes(category.id)
                        ? variant === 'sidebar'
                          ? 'bg-white text-purple-600'
                          : 'bg-purple-600 text-white'
                        : variant === 'sidebar'
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              variant === 'sidebar'
                ? 'bg-white text-purple-600 hover:bg-gray-100'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
            }`}
          >
            {isSubmitting ? 'Suscribiendo...' : 'Suscribirse'}
          </button>

          <p className={`text-xs text-center ${variant === 'sidebar' ? 'text-white/70' : 'text-gray-500 dark:text-gray-500'}`}>
            Sin spam. Cancela cuando quieras.
          </p>
        </form>
      </div>

      {variant === 'sidebar' && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </>
      )}
    </div>
  );
}

// Helper functions
function getContainerClass(variant: 'sidebar' | 'inline' | 'modal' | 'footer'): string {
  switch (variant) {
    case 'sidebar':
      return 'bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 rounded-2xl p-6 shadow-2xl text-white relative overflow-hidden';
    case 'modal':
      return 'bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl border-2 border-gray-200 dark:border-gray-800';
    case 'footer':
      return 'bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700';
    default:
      return '';
  }
}

function getFrequencyLabel(frequency: BlogNewsletterSubscription['frequency']): string {
  switch (frequency) {
    case 'daily':
      return 'Diario';
    case 'weekly':
      return 'Semanal';
    case 'monthly':
      return 'Mensual';
  }
}

// Newsletter CTA Banner (for article bottom)
export function NewsletterCTA() {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <Mail className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-3xl font-black mb-3">
          ¿Te gustó este artículo?
        </h2>
        <p className="text-xl text-white/90 mb-6">
          Suscríbete para recibir más contenido como este cada semana
        </p>
        <NewsletterForm variant="inline" />
        <p className="text-sm text-white/70 mt-4">
          Únete a más de <strong>50,000</strong> desarrolladores que ya reciben nuestro newsletter
        </p>
      </div>
    </div>
  );
}
