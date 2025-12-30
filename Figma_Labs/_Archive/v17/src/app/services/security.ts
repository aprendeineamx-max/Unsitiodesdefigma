/**
 * Security Service
 * Sistema completo de seguridad para la aplicación
 */

// ==================== Input Validation & Sanitization ====================

/**
 * Sanitiza un string eliminando caracteres peligrosos
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';
  
  // Eliminar tags HTML
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Escapar caracteres especiales
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized.trim();
};

/**
 * Valida un email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Valida una URL
 */
export const validateURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Valida un número de teléfono
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Valida una contraseña segura
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 * - Al menos un carácter especial
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Debe contener al menos un carácter especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitiza un objeto completo recursivamente
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized: any = {};
  
  for (const key in obj) {
    const value = obj[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) :
        typeof item === 'object' ? sanitizeObject(item) :
        item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
};

// ==================== XSS Protection ====================

/**
 * Detecta posibles ataques XSS
 */
export const detectXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Elimina código JavaScript malicioso
 */
export const removeXSS = (input: string): string => {
  let cleaned = input;
  
  // Eliminar scripts
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Eliminar event handlers
  cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Eliminar javascript: protocol
  cleaned = cleaned.replace(/javascript:/gi, '');
  
  // Eliminar iframes, embeds, objects
  cleaned = cleaned.replace(/<(iframe|embed|object)[^>]*>/gi, '');
  
  return cleaned;
};

// ==================== CSRF Protection ====================

/**
 * Genera un token CSRF
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Almacena el token CSRF en sessionStorage
 */
export const setCSRFToken = (): string => {
  const token = generateCSRFToken();
  sessionStorage.setItem('csrf_token', token);
  return token;
};

/**
 * Obtiene el token CSRF actual
 */
export const getCSRFToken = (): string | null => {
  return sessionStorage.getItem('csrf_token');
};

/**
 * Valida un token CSRF
 */
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  return storedToken !== null && storedToken === token;
};

/**
 * Limpia el token CSRF
 */
export const clearCSRFToken = (): void => {
  sessionStorage.removeItem('csrf_token');
};

// ==================== Rate Limiting ====================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Verifica si una acción está limitada por rate limiting
 */
export const checkRateLimit = (
  key: string,
  config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetIn: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  // Si no hay registro o el tiempo expiró, crear uno nuevo
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }
  
  // Si ya alcanzó el límite
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    };
  }
  
  // Incrementar contador
  record.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetIn: record.resetTime - now,
  };
};

/**
 * Limpia los registros de rate limit expirados
 */
export const cleanupRateLimits = (): void => {
  const now = Date.now();
  
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

// Limpiar cada 5 minutos
setInterval(cleanupRateLimits, 5 * 60 * 1000);

// ==================== Content Security ====================

/**
 * Valida que el contenido no contenga elementos peligrosos
 */
export const validateContent = (content: string): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  if (detectXSS(content)) {
    issues.push('Contenido contiene posible código XSS');
  }
  
  // Verificar longitud máxima
  if (content.length > 100000) {
    issues.push('Contenido excede el tamaño máximo permitido');
  }
  
  // Verificar caracteres sospechosos
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(content)) {
    issues.push('Contenido contiene caracteres de control no permitidos');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
};

// ==================== Secure Headers ====================

/**
 * Headers de seguridad recomendados
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.unsplash.com https://*.supabase.co wss://*.supabase.co https://sentry.io https://app.posthog.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

/**
 * Aplica headers de seguridad a un fetch request
 */
export const applySecurityHeaders = (headers: HeadersInit = {}): HeadersInit => {
  return {
    ...headers,
    ...securityHeaders,
  };
};

// ==================== Encryption & Hashing ====================

/**
 * Hash simple de una string (NO usar para passwords en producción)
 */
export const simpleHash = async (input: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Genera un ID único y seguro
 */
export const generateSecureId = (): string => {
  return crypto.randomUUID();
};

// ==================== Session Security ====================

interface SessionData {
  userId: string;
  timestamp: number;
  fingerprint: string;
}

/**
 * Genera un fingerprint del navegador
 */
export const generateBrowserFingerprint = (): string => {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ].join('|');
  
  // Hash simple del fingerprint
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return hash.toString(36);
};

/**
 * Valida la sesión del usuario
 */
export const validateSession = (sessionData: SessionData): boolean => {
  const currentFingerprint = generateBrowserFingerprint();
  
  // Verificar que el fingerprint coincida
  if (sessionData.fingerprint !== currentFingerprint) {
    console.warn('Session fingerprint mismatch');
    return false;
  }
  
  // Verificar que la sesión no haya expirado (24 horas)
  const maxAge = 24 * 60 * 60 * 1000; // 24 horas
  if (Date.now() - sessionData.timestamp > maxAge) {
    console.warn('Session expired');
    return false;
  }
  
  return true;
};

// ==================== SQL Injection Prevention ====================

/**
 * Escapa caracteres peligrosos para SQL
 * NOTA: En producción usar prepared statements
 */
export const escapeSQLString = (input: string): string => {
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
};

/**
 * Detecta posibles ataques de SQL Injection
 */
export const detectSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/gi,
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(--|;|\/\*|\*\/)/gi,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

// ==================== File Upload Security ====================

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'text/csv',
];

const maxFileSize = 10 * 1024 * 1024; // 10 MB

/**
 * Valida un archivo antes de subirlo
 */
export const validateFile = (file: File): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Verificar tipo de archivo
  if (!allowedMimeTypes.includes(file.type)) {
    errors.push(`Tipo de archivo no permitido: ${file.type}`);
  }
  
  // Verificar tamaño
  if (file.size > maxFileSize) {
    errors.push(`Archivo demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (máximo 10MB)`);
  }
  
  // Verificar extensión
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'txt', 'csv'];
  if (!extension || !allowedExtensions.includes(extension)) {
    errors.push(`Extensión no permitida: ${extension}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ==================== Logging & Monitoring ====================

export interface SecurityEvent {
  type: 'xss_attempt' | 'sql_injection' | 'rate_limit' | 'invalid_session' | 'csrf_fail' | 'file_upload_fail';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  userAgent?: string;
  ip?: string;
  details?: any;
}

const securityEvents: SecurityEvent[] = [];

/**
 * Registra un evento de seguridad
 */
export const logSecurityEvent = (event: Omit<SecurityEvent, 'timestamp'>): void => {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  };
  
  securityEvents.push(fullEvent);
  
  // Mantener solo los últimos 1000 eventos
  if (securityEvents.length > 1000) {
    securityEvents.shift();
  }
  
  // Log en consola según severidad
  const logMessage = `[SECURITY ${event.severity.toUpperCase()}] ${event.type}: ${event.message}`;
  
  switch (event.severity) {
    case 'critical':
    case 'high':
      console.error(logMessage, event.details);
      break;
    case 'medium':
      console.warn(logMessage, event.details);
      break;
    case 'low':
      console.info(logMessage, event.details);
      break;
  }
};

/**
 * Obtiene eventos de seguridad
 */
export const getSecurityEvents = (
  filter?: {
    type?: SecurityEvent['type'];
    severity?: SecurityEvent['severity'];
    since?: number;
  }
): SecurityEvent[] => {
  let events = [...securityEvents];
  
  if (filter?.type) {
    events = events.filter(e => e.type === filter.type);
  }
  
  if (filter?.severity) {
    events = events.filter(e => e.severity === filter.severity);
  }
  
  if (filter?.since) {
    events = events.filter(e => e.timestamp >= filter.since);
  }
  
  return events.sort((a, b) => b.timestamp - a.timestamp);
};

/**
 * Limpia eventos de seguridad antiguos
 */
export const cleanupSecurityEvents = (olderThanMs: number = 24 * 60 * 60 * 1000): void => {
  const cutoff = Date.now() - olderThanMs;
  const index = securityEvents.findIndex(e => e.timestamp < cutoff);
  
  if (index !== -1) {
    securityEvents.splice(0, index);
  }
};

// ==================== Export Summary ====================

export const securityService = {
  // Validation
  sanitizeString,
  sanitizeObject,
  validateEmail,
  validateURL,
  validatePhone,
  validatePassword,
  validateContent,
  validateFile,
  
  // XSS Protection
  detectXSS,
  removeXSS,
  
  // CSRF Protection
  generateCSRFToken,
  setCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  clearCSRFToken,
  
  // Rate Limiting
  checkRateLimit,
  cleanupRateLimits,
  
  // Security Headers
  securityHeaders,
  applySecurityHeaders,
  
  // Encryption
  simpleHash,
  generateSecureId,
  
  // Session
  generateBrowserFingerprint,
  validateSession,
  
  // SQL Injection Prevention
  escapeSQLString,
  detectSQLInjection,
  
  // Logging
  logSecurityEvent,
  getSecurityEvents,
  cleanupSecurityEvents,
};

export default securityService;
