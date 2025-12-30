import posthog from 'posthog-js';

export const initPostHog = () => {
  const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';
  const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

  if (!POSTHOG_KEY) {
    console.log('PostHog: API Key no configurada. Modo desarrollo.');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    
    // Configuración de captura
    autocapture: true, // Captura automática de clics y eventos
    capture_pageview: true, // Captura automática de page views
    capture_pageleave: true, // Captura cuando el usuario sale de la página
    
    // Session Recording
    session_recording: {
      recordCrossOriginIframes: false,
      maskAllInputs: true, // Ocultar todos los inputs por seguridad
      maskTextSelector: '[data-private]', // Selector para ocultar texto
    },
    
    // Feature Flags
    bootstrap: {
      featureFlags: {}, // Flags iniciales si los tienes
    },
    
    // Performance
    loaded: (posthog) => {
      if (import.meta.env.MODE === 'development') {
        posthog.debug(); // Modo debug en desarrollo
      }
    },
    
    // Privacy
    opt_out_capturing_by_default: false,
    respect_dnt: true, // Respetar Do Not Track del navegador
    
    // Advanced config
    persistence: 'localStorage+cookie',
    cross_subdomain_cookie: false,
  });
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  posthog.capture(eventName, properties);
};

// Identify user
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  posthog.identify(userId, properties);
};

// Reset user (logout)
export const resetUser = () => {
  posthog.reset();
};

// Set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  posthog.people.set(properties);
};

// Track page view
export const trackPageView = (path: string, properties?: Record<string, any>) => {
  posthog.capture('$pageview', {
    $current_url: window.location.href,
    path,
    ...properties,
  });
};

// Feature flags
export const isFeatureEnabled = (flagName: string): boolean => {
  return posthog.isFeatureEnabled(flagName) || false;
};

export const getFeatureFlag = (flagName: string): string | boolean | undefined => {
  return posthog.getFeatureFlag(flagName);
};

// A/B Testing helper
export const getVariant = (experimentName: string): string | undefined => {
  const variant = posthog.getFeatureFlag(experimentName);
  return typeof variant === 'string' ? variant : undefined;
};

// Group analytics (para organizaciones, equipos, etc.)
export const identifyGroup = (groupType: string, groupKey: string, groupProperties?: Record<string, any>) => {
  posthog.group(groupType, groupKey, groupProperties);
};

// Opt out/in
export const optOut = () => {
  posthog.opt_out_capturing();
};

export const optIn = () => {
  posthog.opt_in_capturing();
};

// Get distinct ID
export const getDistinctId = (): string => {
  return posthog.get_distinct_id();
};

// Session ID
export const getSessionId = (): string | undefined => {
  return posthog.get_session_id();
};

export { posthog };
