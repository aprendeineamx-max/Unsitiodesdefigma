# 📊 Sistema de Monitoring - Platzi Clone

## 🎯 Descripción

Sistema completo de monitoreo y analytics en tiempo real que integra **Sentry** para error tracking y **PostHog** para product analytics.

## 🚀 Características Implementadas

### ✅ Sentry (Error Tracking & Performance)
- **Error Tracking**: Captura automática de errores y excepciones
- **Performance Monitoring**: Métricas de rendimiento (response time, throughput)
- **Session Replay**: Grabación de sesiones para debugging
- **Release Tracking**: Seguimiento de versiones y deploys
- **Breadcrumbs**: Contexto detallado de eventos antes de errores
- **User Context**: Identificación de usuarios en errores

### ✅ PostHog (Product Analytics & Feature Flags)
- **Product Analytics**: Análisis de comportamiento de usuarios
- **Session Recording**: Grabación de interacciones del usuario
- **Feature Flags**: Control de features con A/B testing
- **Event Tracking**: Captura automática y manual de eventos
- **Funnels**: Análisis de conversión y flujos de usuario
- **Cohorts**: Segmentación avanzada de usuarios

## 📦 Instalación

Los paquetes ya están instalados:

```json
{
  "@sentry/react": "^10.32.1",
  "posthog-js": "^1.310.1"
}
```

## ⚙️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Sentry
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_APP_VERSION=1.0.0

# PostHog
VITE_POSTHOG_KEY=phc_your_project_api_key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### 2. Obtener Credenciales

#### Sentry (https://sentry.io)

1. Crea una cuenta gratuita en [sentry.io](https://sentry.io)
2. Crea un nuevo proyecto (React)
3. Copia el **DSN** desde Project Settings > Client Keys
4. Pégalo en `VITE_SENTRY_DSN`

#### PostHog (https://posthog.com)

1. Crea una cuenta gratuita en [posthog.com](https://posthog.com)
2. Crea un nuevo proyecto
3. Copia el **Project API Key** desde Project Settings
4. Pégalo en `VITE_POSTHOG_KEY`

## 🎨 Uso

### Panel de Administración

El sistema de monitoring está integrado en el **Admin Panel**:

1. Inicia sesión en la aplicación
2. Navega al perfil > Admin Panel
3. Click en "**Monitoring**" en el sidebar
4. Explora las 6 pestañas disponibles:
   - **Vista General**: Dashboard con métricas principales
   - **Errores (Sentry)**: Error tracking y resolución
   - **Analytics (PostHog)**: Métricas de producto
   - **Performance**: Web Vitals y tiempos de respuesta
   - **Feature Flags**: Gestión de funcionalidades
   - **Configuración**: Settings y variables de entorno

### Tracking Manual

#### Capturar Errores (Sentry)

```typescript
import { captureError } from './services/sentry';

try {
  // código que puede fallar
} catch (error) {
  captureError(error as Error, {
    context: 'checkout',
    userId: user.id,
  });
}
```

#### Track Eventos (PostHog)

```typescript
import { trackEvent } from './services/posthog';

// Track custom event
trackEvent('button_clicked', {
  button_name: 'checkout',
  page: 'cart',
  value: 199.99,
});
```

#### Identificar Usuario

```typescript
import { setUser } from './services/sentry';
import { identifyUser } from './services/posthog';

// Cuando el usuario inicia sesión
setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

identifyUser(user.id, {
  email: user.email,
  plan: user.subscription,
  created_at: user.createdAt,
});
```

#### Feature Flags

```typescript
import { isFeatureEnabled } from './services/posthog';

// Check si una feature está habilitada
if (isFeatureEnabled('new-dashboard')) {
  // Mostrar nuevo dashboard
} else {
  // Mostrar dashboard antiguo
}
```

## 📊 Dashboards

### Vista General
- Estado del sistema en tiempo real
- Métricas de errores (24h)
- Performance (response time, success rate)
- Usuarios activos
- Page views y sesiones

### Sentry Dashboard
- Total de errores y críticos
- Tasa de resolución
- Configuración de Sentry
- Errores recientes con stack traces

### PostHog Dashboard
- Page views y sesiones
- Bounce rate
- Comportamiento de usuarios
- Distinct ID y Session ID
- Configuración de PostHog

### Performance
- Average Response Time
- P95 Response Time
- Web Vitals (LCP, FID, CLS)
- Requests per minute

### Feature Flags
- Lista de flags activos/inactivos
- Descripción de cada feature
- Control de experimentos A/B

## 🔧 Servicios

### `/src/app/services/sentry.ts`

```typescript
// Inicialización
initSentry()

// Funciones disponibles
captureError(error, context?)
setUser(user)
clearUser()
addBreadcrumb(message, category, data?)
startTransaction(name, op)
```

### `/src/app/services/posthog.ts`

```typescript
// Inicialización
initPostHog()

// Funciones disponibles
trackEvent(name, properties?)
identifyUser(userId, properties?)
resetUser()
setUserProperties(properties)
trackPageView(path, properties?)
isFeatureEnabled(flagName)
getFeatureFlag(flagName)
getVariant(experimentName)
```

## 📈 Métricas Tracked Automáticamente

### Sentry
- ✅ Errores de JavaScript
- ✅ Errores de React (Error Boundaries)
- ✅ Errores de red (fetch, XHR)
- ✅ Performance de páginas
- ✅ User interactions
- ✅ Navegación entre páginas

### PostHog
- ✅ Page views automáticos
- ✅ Clics en elementos
- ✅ Formularios completados
- ✅ Sesiones de usuario
- ✅ Navegación del sitio
- ✅ Eventos custom

## 🎯 Roadmap Completado

- [x] **Fase 3: Monitoring** ✅
  - [x] Instalar Sentry (@sentry/react)
  - [x] Instalar PostHog (posthog-js)
  - [x] Crear servicios de configuración
  - [x] Integrar en App.tsx
  - [x] Crear página de Monitoring en AdminPanel
  - [x] Dashboard con métricas en tiempo real
  - [x] Auto-refresh cada 5 segundos
  - [x] 6 tabs completas (Overview, Errors, Analytics, Performance, Features, Config)
  - [x] Documentación completa

## 🚀 Próximos Pasos

Continuar con **Fase 4: Security & Compliance**:
- [ ] HTTPS y SSL
- [ ] Rate limiting
- [ ] Input validation
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Security headers
- [ ] GDPR compliance

## 📝 Notas Importantes

- **Modo Desarrollo**: Sentry y PostHog funcionan en modo mock si no hay credenciales
- **Performance**: El auto-refresh se puede pausar para ahorrar recursos
- **Privacy**: PostHog enmascara inputs y datos sensibles automáticamente
- **Costos**: Ambas plataformas tienen planes gratuitos generosos

## 🎓 Recursos

- [Sentry Documentation](https://docs.sentry.io)
- [PostHog Documentation](https://posthog.com/docs)
- [Sentry React SDK](https://docs.sentry.io/platforms/javascript/guides/react/)
- [PostHog JS SDK](https://posthog.com/docs/libraries/js)

## 🤝 Contribución

Este sistema de monitoring es parte del **Platzi Clone Project** y sigue el roadmap de producción establecido.

---

**Estado**: ✅ Completado - Fase 3: Monitoring
**Última actualización**: Diciembre 2024
