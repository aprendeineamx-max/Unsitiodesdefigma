import * as Sentry from '@sentry/react';

export const initSentry = () => {
  // Solo inicializar en producción o cuando hay un DSN configurado
  const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
  
  if (!SENTRY_DSN) {
    console.log('Sentry: DSN no configurado. Modo desarrollo.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      // Performance Monitoring
      Sentry.browserTracingIntegration({
        // Configurar rutas de la aplicación
        tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
      }),
      // Session Replay
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capturar 100% de las transacciones en desarrollo
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% de sesiones normales
    replaysOnErrorSampleRate: 1.0, // 100% de sesiones con errores
    
    // Entorno
    environment: import.meta.env.MODE || 'development',
    
    // Release tracking
    release: `platzi-clone@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
    
    // Configuraciones adicionales
    beforeSend(event, hint) {
      // Filtrar errores conocidos o de terceros
      if (event.exception) {
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'message' in error) {
          // No enviar errores de extensiones del navegador
          if (String(error.message).includes('chrome-extension://')) {
            return null;
          }
        }
      }
      return event;
    },
    
    // Ignor errors de red que son esperados
    ignoreErrors: [
      'Network request failed',
      'NetworkError',
      'Failed to fetch',
    ],
  });
};

// Función helper para capturar errores manualmente
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Función helper para agregar contexto del usuario
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

// Función helper para limpiar el contexto del usuario (logout)
export const clearUser = () => {
  Sentry.setUser(null);
};

// Función helper para agregar breadcrumbs personalizados
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
};

// Performance monitoring helpers
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({
    name,
    op,
  });
};
