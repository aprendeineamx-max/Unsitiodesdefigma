// Markdown Documents Content
// Este archivo contiene el contenido de los documentos principales del proyecto

export const MARKDOWN_DOCS: Record<string, string> = {
  'roadmap-gestion-cursos': `# 🎓 ROADMAP COMPLETO - GESTIÓN DE CURSOS
## Sistema Profesional de Administración de Contenido Educativo

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General](#visión-general)
2. [Roles y Permisos](#roles-y-permisos)
3. [Fase 1: Fundamentos del Sistema](#fase-1-fundamentos-del-sistema)
4. [Fase 2: Creación y Edición Avanzada](#fase-2-creación-y-edición-avanzada)
5. [Fase 3: Gestión de Contenido Multimedia](#fase-3-gestión-de-contenido-multimedia)
6. [Fase 4: Estructura Curricular Avanzada](#fase-4-estructura-curricular-avanzada)
7. [Fase 5: Evaluaciones y Certificaciones](#fase-5-evaluaciones-y-certificaciones)
8. [Fase 6: Interacción y Comunidad](#fase-6-interacción-y-comunidad)
9. [Fase 7: Monetización y Marketing](#fase-7-monetización-y-marketing)
10. [Fase 8: Analytics y Métricas](#fase-8-analytics-y-métricas)
11. [Fase 9: Administración Avanzada](#fase-9-administración-avanzada)
12. [Fase 10: Optimización y Escalabilidad](#fase-10-optimización-y-escalabilidad)

---

## 🎯 VISIÓN GENERAL

### Objetivo Principal
Crear un sistema de gestión de cursos de clase mundial que permita a administradores y tutores:
- Crear cursos profesionales desde cero
- Gestionar contenido multimedia de forma eficiente
- Estructurar currículums complejos
- Evaluar y certificar estudiantes
- Monetizar contenido educativo
- Analizar métricas de aprendizaje
- Interactuar con la comunidad

### Inspiración de Plataformas Líderes
- **Udemy**: Sistema de creación de cursos, precios dinámicos, cupones
- **Coursera**: Certificaciones profesionales, rutas de aprendizaje
- **Platzi**: Cursos prácticos, proyectos, comunidad activa
- **edX**: Cursos universitarios, microcredenciales
- **LinkedIn Learning**: Integración profesional, skill paths
- **Skillshare**: Proyectos creativos, comunidad de makers
- **Domestika**: Diseño visual impecable, proyectos profesionales
- **MasterClass**: Producción premium, personalidades reconocidas

---

## 👥 ROLES Y PERMISOS

### 1. Super Admin (Root)
- ✅ Acceso total al sistema
- ✅ Gestión de todos los usuarios y roles
- ✅ Configuración global del sistema
- ✅ Acceso a todas las funciones premium

### 2. Admin
- ✅ Gestión de cursos completa
- ✅ Gestión de instructores y estudiantes
- ✅ Configuración de categorías y etiquetas
- ✅ Acceso a analytics avanzados
- ❌ Cambios en configuración crítica del sistema

### 3. Instructor/Tutor
- ✅ Crear y editar sus propios cursos
- ✅ Gestionar contenido de sus cursos
- ✅ Ver analytics de sus cursos
- ✅ Interactuar con estudiantes
- ❌ Ver o editar cursos de otros instructores
- ❌ Cambiar configuración del sistema

### 4. Content Manager
- ✅ Subir y organizar multimedia
- ✅ Editar descripciones y metadata
- ✅ Gestionar biblioteca de recursos
- ❌ Publicar/despublicar cursos
- ❌ Cambiar precios

### 5. Estudiante (Usuario Final)
- ✅ Acceder a cursos inscritos
- ✅ Ver progreso y certificados
- ✅ Interactuar en foros
- ❌ Crear cursos
- ❌ Acceder a panel admin

---

## 📍 FASE 1: FUNDAMENTOS DEL SISTEMA

### 1.1 Dashboard de Gestión
**Prioridad**: 🔴 CRÍTICA

#### Features Principales:
- **Vista General de Cursos**
  - Grid/Lista de todos los cursos
  - Filtros: estado, categoría, instructor, fecha
  - Búsqueda avanzada con autocompletado
  - Ordenamiento múltiple (popularidad, fecha, rating)

- **Métricas Clave (KPIs)**
  - Total de cursos (publicados/borradores/archivados)
  - Estudiantes activos
  - Ingresos totales
  - Rating promedio
  - Cursos más populares
  - Tasa de completitud

- **Acciones Rápidas**
  - Botón "Crear Curso Nuevo"
  - Duplicar curso existente
  - Importar desde plantilla
  - Vista previa rápida

**Tecnologías Sugeridas**:
\`\`\`typescript
- React + TypeScript
- Recharts para gráficas
- TanStack Table para tablas
- React Query para data fetching
\`\`\`

### 1.2 Wizard de Creación de Curso
**Prioridad**: 🔴 CRÍTICA

#### Paso 1: Información Básica
- **Campos Requeridos**:
  - Título del curso (max 100 caracteres)
  - Subtítulo descriptivo (max 150 caracteres)
  - Categoría principal
  - Subcategorías (hasta 3)
  - Nivel (Principiante/Intermedio/Avanzado/Todos)
  - Idioma principal
  - Idiomas adicionales disponibles

- **Campos Opcionales**:
  - Tags/Etiquetas (autocompletado)
  - Curso relacionado (prerequisito)
  - Duración estimada
  - Certificación incluida (sí/no)

#### Paso 2: Descripción y Objetivos
- **Editor Rico de Texto** (Markdown/WYSIWYG):
  - Descripción corta (SEO, 160 caracteres)
  - Descripción larga (sin límite)
  - Lo que aprenderás (bullet points)
  - Requisitos previos
  - Para quién es este curso

- **Templates Pre-configurados**:
  - Template de programación
  - Template de diseño
  - Template de negocios
  - Template de idiomas
  - Plantilla en blanco

#### Paso 3: Media y Visualización
- **Imagen de Portada**:
  - Recomendación: 1280x720px
  - Formatos: JPG, PNG, WEBP
  - Editor integrado (crop, filtros)
  - Generador de thumbnails automático
  - Banco de imágenes stock integrado

- **Video Promocional**:
  - Video de introducción (max 2 min)
  - Soporte para YouTube/Vimeo embed
  - Upload directo
  - Generador automático de thumbnails

**Ejemplo de Implementación**:
\`\`\`typescript
interface CourseBasicInfo {
  title: string;
  subtitle: string;
  category: string;
  subcategories: string[];
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  language: string;
  additionalLanguages?: string[];
  tags: string[];
  prerequisiteCourseId?: string;
  estimatedDuration?: number; // en horas
  hasCertificate: boolean;
}

interface CourseDescription {
  shortDescription: string; // SEO
  longDescription: string; // HTML/Markdown
  learningObjectives: string[]; // bullet points
  requirements: string[];
  targetAudience: string;
}

interface CourseMedia {
  coverImage: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  promoVideo?: {
    url: string;
    provider: 'youtube' | 'vimeo' | 'self-hosted';
    duration: number;
  };
}
\`\`\`

### 1.3 Sistema de Estados
**Estados Posibles**:
1. **Borrador (Draft)** 🟡
   - Curso en creación
   - No visible para estudiantes
   - Editable completamente
   
2. **En Revisión (Under Review)** 🟠
   - Enviado para aprobación
   - No editable por instructor
   - Admin puede aprobar/rechazar

3. **Publicado (Published)** 🟢
   - Visible para estudiantes
   - Abierto para inscripciones
   - Ediciones requieren aprobación

4. **Archivado (Archived)** ⚫
   - No visible en búsquedas
   - Estudiantes inscritos pueden seguir accediendo
   - No acepta nuevas inscripciones

5. **Suspendido (Suspended)** 🔴
   - Violación de políticas
   - No accesible ni para inscritos
   - Requiere intervención admin

**Transiciones de Estado**:
\`\`\`
Borrador → En Revisión → Publicado
          ↓
     Archivado ← Publicado
                   ↓
              Suspendido
\`\`\`

---

## 📍 FASE 2: CREACIÓN Y EDICIÓN AVANZADA

### 2.1 Constructor de Curriculum
**Prioridad**: 🔴 CRÍTICA

#### Estructura Jerárquica:
\`\`\`
Curso
├── Sección 1
│   ├── Lección 1.1 (Video)
│   ├── Lección 1.2 (Artículo)
│   ├── Quiz 1
│   └── Lección 1.3 (Práctica)
├── Sección 2
│   ├── Lección 2.1 (Video)
│   └── Proyecto 1
└── Sección 3
    └── Examen Final
\`\`\`

#### Features del Constructor:
- **Drag & Drop Intuitivo**
  - Reordenar secciones
  - Reordenar lecciones dentro de secciones
  - Mover lecciones entre secciones
  - Indicador visual de jerarquía

- **Tipos de Contenido**:
  1. **Lección de Video** 📹
  2. **Artículo/Texto** 📝
  3. **Quiz/Evaluación** ✅
  4. **Ejercicio Práctico** 💻
  5. **Proyecto** 🎯
  6. **Recurso Descargable** 📥
  7. **Enlace Externo** 🔗
  8. **Examen** 📊
  9. **Webinar en Vivo** 🎥
  10. **Tarea para Entregar** 📤

- **Configuración por Sección**:
  - Título de la sección
  - Descripción breve
  - Objetivos de aprendizaje
  - Duración estimada
  - Prerequisitos de sección
  - Bloqueo secuencial (sí/no)

### 2.2 Editor de Lecciones
**Prioridad**: 🔴 CRÍTICA

#### Editor de Video:
- **Upload de Video**:
  - Drag & drop
  - URL de YouTube/Vimeo
  - Grabación directa (webcam)
  - Límites: tamaño, duración, formato

- **Configuración de Video**:
  - Título y descripción
  - Timestamps/Capítulos
  - Subtítulos (SRT, VTT)
  - Velocidad de reproducción
  - Calidad (auto, 1080p, 720p, 480p)
  - Descarga permitida (sí/no)
  - Marca de agua
  - Prevención de piratería (DRM)

- **Features Interactivos**:
  - Notas en timestamps
  - Preguntas en video
  - Call-to-action en puntos clave
  - Recursos relacionados en sidebar

#### Editor de Artículos:
- **Editor Rico (WYSIWYG)**:
  - Formato de texto completo
  - Imágenes inline
  - Code syntax highlighting
  - Tablas
  - Listas
  - Citas
  - Callouts/Alertas
  - Embeds (YouTube, CodePen, etc.)

- **Markdown Support**:
  - Live preview
  - Shortcuts de teclado
  - Export/Import

- **Templates de Artículo**:
  - Tutorial paso a paso
  - Guía de referencia
  - Case study
  - Teoría conceptual

### 2.3 Versionado y Historial
**Prioridad**: 🟠 ALTA

- **Control de Versiones**:
  - Guardar versiones automáticamente
  - Comparar versiones
  - Restaurar versiones anteriores
  - Notas de cambio
  - Quién hizo qué cambio

- **Colaboración**:
  - Múltiples editores
  - Comentarios en línea
  - Sugerencias de cambios
  - Modo revisión

---

## 📍 FASE 3: GESTIÓN DE CONTENIDO MULTIMEDIA

### 3.1 Biblioteca de Medios
**Prioridad**: 🟠 ALTA

#### Características:
- **Tipos de Archivo Soportados**:
  - Imágenes: JPG, PNG, GIF, WEBP, SVG
  - Videos: MP4, WebM, MOV
  - Audio: MP3, WAV, OGG
  - Documentos: PDF, DOCX, PPTX, XLSX
  - Código: ZIP, RAR, 7Z
  - Otros: TXT, CSV, JSON

- **Organización**:
  - Carpetas y subcarpetas
  - Tags múltiples
  - Búsqueda por nombre, tipo, fecha
  - Filtros avanzados
  - Favoritos

- **Metadata**:
  - Título y descripción
  - Alt text (accesibilidad)
  - Licencia de uso
  - Fuente original
  - Usado en X cursos
  - Última modificación

#### Features Avanzados:
- **Procesamiento Automático**:
  - Compresión de imágenes
  - Conversión de formatos
  - Generación de thumbnails
  - Extracción de metadata
  - Detección de duplicados

- **CDN Integration**:
  - Upload a CloudFlare/AWS/Azure
  - URLs optimizadas
  - Caching inteligente
  - Distribución geográfica

### 3.2 Video Hosting
**Prioridad**: 🟠 ALTA

#### Opciones de Almacenamiento:
1. **Self-Hosted**
   - Control total
   - Costos predecibles
   - Requiere más infraestructura

2. **Vimeo**
   - Profesional
   - Sin anuncios
   - Analytics incluidos

3. **Wistia**
   - Marketing-focused
   - Lead generation
   - Costoso

4. **Bunny.net / Mux**
   - Económico
   - APIs excelentes
   - Fácil integración

#### Features de Video:
- **Adaptive Streaming**:
  - HLS/DASH
  - Múltiples calidades
  - Ajuste automático según conexión

- **Seguridad**:
  - Signed URLs
  - Geo-restriction
  - Hotlink protection
  - DRM (Widevine/FairPlay)

- **Analytics de Video**:
  - % de completitud
  - Puntos de abandono
  - Re-watches
  - Velocidad promedio
  - Dispositivos usados

---

## 📍 FASE 4: ESTRUCTURA CURRICULAR AVANZADA

### 4.1 Learning Paths (Rutas de Aprendizaje)
**Prioridad**: 🟡 MEDIA

#### Concepto:
Agrupar múltiples cursos en una ruta estructurada para alcanzar un objetivo profesional específico.

#### Ejemplos:
- **Full-Stack Developer Path**:
  1. HTML & CSS Fundamentals
  2. JavaScript Mastery
  3. React.js Complete Guide
  4. Node.js & Express
  5. Databases & SQL
  6. Proyecto Final: App Completa

- **Digital Marketing Expert Path**:
  1. Marketing Fundamentals
  2. SEO Mastery
  3. Social Media Marketing
  4. Google Ads
  5. Email Marketing
  6. Analytics & Reporting

#### Features:
- **Configuración de Path**:
  - Nombre y descripción
  - Orden de cursos
  - Cursos obligatorios vs opcionales
  - Prerequisitos
  - Duración total estimada
  - Certificado al completar path

- **Progreso del Path**:
  - Dashboard visual de progreso
  - Milestones y logros
  - Siguiente curso sugerido
  - Tiempo para completar

### 4.2 Prerequisites y Dependencies
**Prioridad**: 🟡 MEDIA

- **Bloqueo de Cursos**:
  - Curso A debe completarse antes de Curso B
  - Porcentaje mínimo requerido
  - Evaluación mínima aprobada

- **Recomendaciones Inteligentes**:
  - "Te recomendamos tomar X antes de Y"
  - "Los que tomaron A también tomaron B"
  - Skill gaps detection

### 4.3 Microcredentials y Badges
**Prioridad**: 🟡 MEDIA

- **Sistema de Badges**:
  - Badges por completar curso
  - Badges por skills específicos
  - Badges de comunidad
  - Badges de velocidad/racha

- **Display de Badges**:
  - Perfil público del estudiante
  - LinkedIn integration
  - Shareable en redes sociales
  - NFT badges (Web3)

---

## 📍 FASE 5: EVALUACIONES Y CERTIFICACIONES

### 5.1 Sistema de Quizzes
**Prioridad**: 🔴 CRÍTICA

#### Tipos de Preguntas:
1. **Múltiple Opción**
   - Una respuesta correcta
   - Múltiples respuestas correctas
   - Imágenes en opciones
   - Feedback por opción

2. **Verdadero/Falso**
   - Simple
   - Con explicación

3. **Respuesta Corta**
   - Texto libre
   - Revisión manual/automática

4. **Matching/Emparejamiento**
   - Conectar conceptos
   - Drag & drop

5. **Fill in the Blanks**
   - Completar espacios
   - Code completion

6. **Code Challenges**
   - Editor de código integrado
   - Tests automáticos
   - Múltiples lenguajes

7. **Ensayo**
   - Texto largo
   - Revisión por instructor

#### Configuración de Quiz:
- **Opciones Generales**:
  - Tiempo límite
  - Intentos permitidos
  - Orden aleatorio de preguntas
  - Mostrar respuestas después
  - Puntaje mínimo para aprobar

- **Banco de Preguntas**:
  - Crear pools de preguntas
  - Selección aleatoria
  - Dificultad balanceada
  - Reutilizar en múltiples quizzes

### 5.2 Exámenes Finales
**Prioridad**: 🟠 ALTA

#### Features Anti-Cheating:
- **Proctoring**:
  - Webcam monitoring
  - Screen recording
  - Detección de múltiples ventanas
  - Lock browser mode

- **Randomización**:
  - Orden de preguntas aleatorio
  - Pool de preguntas diferente por estudiante
  - Tiempo único por pregunta

- **Análisis de Patrones**:
  - Tiempo sospechosamente rápido
  - Respuestas idénticas entre estudiantes
  - Uso de AI detection

### 5.3 Certificados
**Prioridad**: 🟠 ALTA

#### Diseño de Certificados:
- **Templates Profesionales**:
  - Varios diseños predefinidos
  - Editor visual de certificados
  - Personalización de colores/logos
  - Campos dinámicos

- **Información del Certificado**:
  - Nombre del estudiante
  - Nombre del curso
  - Fecha de completitud
  - Score obtenido
  - Instructor que lo emitió
  - Código de verificación único
  - QR code

#### Emisión y Verificación:
- **Generación Automática**:
  - Al completar curso
  - Al aprobar examen final
  - Manual por instructor

- **Verificación Pública**:
  - Portal de verificación
  - API de verificación
  - Blockchain verification (opcional)

- **Compartir Certificados**:
  - LinkedIn direct integration
  - Twitter/Facebook share
  - Descarga PDF
  - Embed en portfolio

---

## 📍 FASE 6: INTERACCIÓN Y COMUNIDAD

### 6.1 Sistema de Q&A
**Prioridad**: 🟠 ALTA

#### Features Principales:
- **Preguntar**:
  - Por lección
  - Tags de la pregunta
  - Marcar como urgente
  - Adjuntar imágenes/código

- **Responder**:
  - Instructor puede responder
  - Estudiantes pueden responder
  - Marcar respuesta como correcta
  - Upvotes/Downvotes

- **Organización**:
  - Filtrar por respondida/no respondida
  - Buscar en Q&A
  - Seguir pregunta (notificaciones)
  - Preguntas populares

### 6.2 Foros de Discusión
**Prioridad**: 🟡 MEDIA

- **Categorías**:
  - General
  - Por módulo/sección
  - Off-topic
  - Anuncios

- **Features**:
  - Crear hilos
  - Responder
  - Reacciones
  - Moderación
  - Pin de posts importantes
  - Reportar spam/abuse

### 6.3 Live Sessions
**Prioridad**: 🟡 MEDIA

- **Webinars en Vivo**:
  - Zoom/Google Meet integration
  - Chat en vivo
  - Q&A session
  - Polls durante sesión
  - Grabación automática

- **Office Hours**:
  - Calendario de disponibilidad
  - Reservar slots
  - Sesiones 1-a-1
  - Sesiones grupales

---

## 📍 FASE 7: MONETIZACIÓN Y MARKETING

### 7.1 Estrategias de Precio
**Prioridad**: 🟠 ALTA

#### Modelos de Pricing:
1. **Gratis**
   - Curso completamente gratuito
   - Marketing/Lead magnet

2. **Pago Único**
   - Precio fijo
   - Acceso de por vida

3. **Suscripción**
   - Mensual/Anual
   - Acceso a todos los cursos
   - Netflix del aprendizaje

4. **Freemium**
   - Contenido básico gratis
   - Premium paga
   - Certificado paga

5. **Pay What You Want**
   - Estudiante decide precio
   - Mínimo sugerido

#### Configuración de Precios:
- **Precio Base**:
  - En múltiples monedas
  - Precio regional (PPP - Purchasing Power Parity)
  - Precio para empresas vs individuos

- **Descuentos**:
  - Cupones de descuento
  - Early bird pricing
  - Bulk discounts
  - Student discounts
  - Seasonal sales

### 7.2 Sistema de Cupones
**Prioridad**: 🟠 ALTA

#### Tipos de Cupones:
- **Por Porcentaje**: 10%, 25%, 50%, 100% OFF
- **Por Cantidad Fija**: $10 OFF, $50 OFF
- **Por Bundle**: 2x1, 3x2

#### Configuración:
- **Uso**:
  - Límite de usos totales
  - Límite por usuario
  - Fecha de expiración
  - Válido para cursos específicos
  - Válido para categorías

- **Tracking**:
  - ¿Cuántas veces usado?
  - ¿Cuánto revenue generado?
  - ¿De dónde vienen?
  - Mejores cupones

### 7.3 Programa de Afiliados
**Prioridad**: 🟡 MEDIA

- **Para Instructores**:
  - Link de afiliado único
  - Comisión por venta
  - Dashboard de afiliados
  - Payout automático

- **Para Estudiantes**:
  - Refiere a un amigo
  - Ambos reciben descuento
  - Gamificación de referidos

---

## 📍 FASE 8: ANALYTICS Y MÉTRICAS

### 8.1 Analytics para Instructores
**Prioridad**: 🟠 ALTA

#### Métricas de Engagement:
- **Estudiantes**:
  - Total inscritos
  - Activos en el mes
  - Tasa de completitud
  - Promedio de progreso
  - Tiempo promedio en curso

- **Contenido**:
  - Lecciones más vistas
  - Lecciones más abandonadas
  - Videos más rewatcheados
  - Quizzes con menor score
  - Preguntas más frecuentes

- **Revenue**:
  - Ingresos totales
  - Ingresos por mes
  - Proyección de ingresos
  - Tasa de conversión
  - Valor de vida del estudiante (LTV)

### 8.2 Learning Analytics
**Prioridad**: 🟡 MEDIA

- **Para Estudiantes**:
  - Tiempo dedicado
  - Cursos completados
  - Skills adquiridos
  - Racha de aprendizaje
  - Comparación con peers

- **Para Administradores**:
  - Patrones de aprendizaje
  - Cursos más efectivos
  - Instructores top
  - Tendencias de categorías
  - Predicción de churn

### 8.3 Reportes Automáticos
**Prioridad**: 🟡 MEDIA

- **Reportes Semanales/Mensuales**:
  - Email automático
  - PDF descargable
  - Dashboard interactivo
  - Comparación con periodo anterior

- **Alertas Inteligentes**:
  - Caída en engagement
  - Pico de inscripciones
  - Review negativo
  - Nuevo estudiante

---

## 📍 FASE 9: ADMINISTRACIÓN AVANZADA

### 9.1 Gestión de Usuarios
**Prioridad**: 🔴 CRÍTICA

#### Funcionalidades:
- **Búsqueda y Filtrado**:
  - Por rol
  - Por fecha de registro
  - Por status (activo/inactivo)
  - Por cursos tomados

- **Acciones en Masa**:
  - Enviar email a grupo
  - Cambiar rol
  - Suspender/Activar
  - Export CSV/Excel

- **Perfil de Usuario**:
  - Información personal
  - Cursos inscritos
  - Progreso
  - Certificados
  - Historial de compras
  - Notas del admin

### 9.2 Content Moderation
**Prioridad**: 🟠 ALTA

- **Queue de Revisión**:
  - Nuevos cursos
  - Cursos editados
  - Comentarios reportados
  - Reviews reportadas

- **Herramientas de Moderación**:
  - Aprobar/Rechazar
  - Solicitar cambios
  - Comentarios internos
  - Ban de usuarios

### 9.3 Sistema de Notificaciones
**Prioridad**: 🟡 MEDIA

#### Canales:
- Email
- In-app notifications
- Push notifications
- SMS (crítico)
- Slack/Discord webhook

#### Tipos de Notificaciones:
- **Para Estudiantes**:
  - Nuevo contenido en curso
  - Respuesta a pregunta
  - Certificado listo
  - Curso pronto a expirar

- **Para Instructores**:
  - Nueva pregunta
  - Nueva review
  - Nueva venta
  - Milestone alcanzado

- **Para Admins**:
  - Nuevo curso para revisar
  - Contenido reportado
  - Sistema alerts

---

## 📍 FASE 10: OPTIMIZACIÓN Y ESCALABILIDAD

### 10.1 Performance Optimization
**Prioridad**: 🟠 ALTA

- **Frontend**:
  - Lazy loading
  - Code splitting
  - Image optimization
  - Caching estratégico
  - CDN para assets

- **Backend**:
  - Database indexing
  - Query optimization
  - Caching (Redis)
  - Load balancing
  - Rate limiting

### 10.2 SEO y Discoverability
**Prioridad**: 🟠 ALTA

- **On-Page SEO**:
  - Meta tags dinámicos
  - Schema.org markup
  - Sitemap automático
  - URL amigables
  - Alt text en imágenes

- **Content Marketing**:
  - Blog integrado
  - Landing pages por categoría
  - Testimonios
  - Case studies

### 10.3 Accesibilidad (a11y)
**Prioridad**: 🟡 MEDIA

- **WCAG 2.1 AA Compliance**:
  - Navegación por teclado
  - Screen reader support
  - Contraste de colores
  - Subtítulos en videos
  - Transcripciones

- **Internacionalización (i18n)**:
  - Múltiples idiomas
  - RTL support
  - Timezone handling
  - Currency localization

---

## 🎯 MÉTRICAS DE ÉXITO

### KPIs del Sistema:
- ✅ Tiempo promedio de creación de curso: < 2 horas
- ✅ Tasa de aprobación de cursos: > 80%
- ✅ Satisfacción de instructores: > 4.5/5
- ✅ Uptime del sistema: > 99.9%
- ✅ Tiempo de carga de página: < 2 segundos
- ✅ Mobile usage: > 40%

### Roadmap Timeline:
- **Fase 1-2**: 2-3 meses (MVP)
- **Fase 3-4**: 2 meses
- **Fase 5-6**: 2-3 meses
- **Fase 7-8**: 1-2 meses
- **Fase 9-10**: Continuo

---

## 📚 RECURSOS Y REFERENCIAS

### Plataformas para Estudiar:
- Udemy Creator Platform
- Teachable
- Thinkific
- Kajabi
- Podia
- LearnDash (WordPress)

### Tecnologías Recomendadas:
- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, PostgreSQL, Redis
- **Video**: Mux, Bunny.net, Cloudflare Stream
- **Storage**: AWS S3, Cloudflare R2
- **Email**: SendGrid, Postmark
- **Analytics**: Mixpanel, Amplitude

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Pre-Launch:
- [ ] Dashboard básico funcionando
- [ ] Wizard de creación completo
- [ ] Sistema de estados implementado
- [ ] Editor de currículo funcional
- [ ] Upload de video funcionando
- [ ] Sistema de quizzes básico

### Post-Launch v1.0:
- [ ] Analytics básicos
- [ ] Sistema de pagos
- [ ] Certificados automáticos
- [ ] Q&A funcional

### Post-Launch v2.0:
- [ ] Learning Paths
- [ ] Live sessions
- [ ] Programa de afiliados
- [ ] Advanced analytics

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0
**Autor**: Platzi Clone Team
`,

  'roadmap-editor-documentos': `# 📝 ROADMAP COMPLETO - EDITOR DE DOCUMENTOS PROFESIONAL

## Sistema de Nivel Empresarial para Competir con Notion, Obsidian, Google Docs y GitHub Docs

---

## 🎯 VISIÓN GENERAL

### Objetivo Principal
Crear un **sistema de gestión y edición de documentos** que combine lo mejor de:
- **Notion**: Bloques modulares, colaboración en tiempo real, bases de datos
- **Obsidian**: Enlaces bidireccionales, gráfico de conocimiento, Markdown puro
- **Google Docs**: Colaboración simultánea, comentarios, historial de versiones
- **GitHub Docs**: Control de versiones, Markdown avanzado, syntax highlighting

### Principios Fundamentales
1. **Markdown-First**: Todo debe ser Markdown puro exportable
2. **Offline-First**: Funcionar sin internet (sync cuando haya conexión)
3. **Performance**: Renderizar 100k+ líneas sin lag
4. **Extensible**: Sistema de plugins como VSCode
5. **Privacidad**: Datos encriptados, auto-hosted option

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General](#-visión-general)
2. [Fase 1: Editor Markdown Avanzado](#-fase-1-editor-markdown-avanzado)
3. [Fase 2: Colaboración en Tiempo Real](#-fase-2-colaboración-en-tiempo-real)
4. [Fase 3: Sistema de Bloques (Notion-like)](#-fase-3-sistema-de-bloques-notion-like)
5. [Fase 4: Graph View y Enlaces Bidireccionales](#-fase-4-graph-view-y-enlaces-bidireccionales)
6. [Fase 5: Bases de Datos y Vistas](#-fase-5-bases-de-datos-y-vistas)
7. [Fase 6: Sincronización y Offline](#-fase-6-sincronización-y-offline)
8. [Fase 7: Plugins y Extensibilidad](#-fase-7-plugins-y-extensibilidad)
9. [Fase 8: Herramientas de Productividad](#-fase-8-herramientas-de-productividad)
10. [Fase 9: Integraciones Externas](#-fase-9-integraciones-externas)
11. [Fase 10: Enterprise Features](#-fase-10-enterprise-features)
12. [Métricas de Éxito](#-métricas-de-éxito)

---

## 📍 FASE 1: EDITOR MARKDOWN AVANZADO

**Prioridad**: 🔴 CRÍTICA  
**Duración**: 2-3 semanas  
**Estado Actual**: ✅ 70% Completado (Viewer + Búsqueda Profesional implementados)

### 1.1 Búsqueda y Navegación (✅ COMPLETADO)

**Features**:
- ✅ **Búsqueda profesional con mark.js SIN límites artificiales**
- ✅ **Búsqueda con highlights persistentes**
- ✅ **Búsqueda con regex (toggle activable)**
- ✅ **Búsqueda case-sensitive toggle (tipo VS Code)**
- ✅ **Búsqueda de palabras completas toggle (tipo VS Code)**
- ✅ **Find and Replace con UI tipo VS Code**
- ✅ **Replace seleccionado**
- ✅ **Replace All**
- ✅ **Contador de resultados (N/Total)**
- ✅ **Navegación con flechas Arriba/Abajo**
- ✅ **Keyboard shortcuts (Enter, Shift+Enter, Esc)**
- ✅ **Resaltado visual del resultado actual**
- ✅ **Scroll automático centrado al resultado**
- ❌ Búsqueda en múltiples documentos
- ❌ Búsqueda difusa (fuzzy search)
- ❌ Keyboard shortcuts completos (Ctrl+F, Ctrl+H)

**Tecnología Implementada**:
- **mark.js**: Librería profesional para highlighting
- **Opciones de búsqueda**: Case sensitive, Whole word, Regex
- **UI inspirada en**: Visual Studio Code
- **Sin límites artificiales**: Eliminado mínimo de 3 caracteres, máximo de 300 resultados, debouncing

### 1.2 Editor WYSIWYG/Markdown Hybrid

**Inspiración**: Typora, Obsidian Live Preview

**Features**:
- Modo WYSIWYG (como Notion)
- Modo Markdown puro (como Obsidian)
- Modo Híbrido (como Typora) - **RECOMENDADO**
- Split view (código | preview)
- Vim mode (para power users)
- Emacs mode
- Zen mode (distraction-free)

**Tecnologías**:
- **Editor de Código**: CodeMirror 6 o Monaco Editor
- **Markdown Parser**: Unified.js (remark + rehype)
- **Syntax Highlighting**: Shiki (mejor que Prism/Highlight.js)

### 1.3 Markdown Extensions

**GFM (GitHub Flavored Markdown)**:
- ✅ Tables
- ✅ Task lists
- ✅ Strikethrough
- ❌ Auto-linking
- ❌ Footnotes
- ❌ Definition lists

**Extended**:
- ❌ Math (KaTeX/MathJax)
- ❌ Mermaid diagrams
- ❌ PlantUML diagrams
- ❌ Excalidraw embeds
- ❌ Code execution (runnable code blocks)
- ❌ Interactive widgets

### 1.4 Syntax Highlighting Avanzado

**Features**:
- 100+ lenguajes soportados
- Temas personalizables
- Line numbers
- Line highlighting
- Diff highlighting
- Code folding
- Copy button
- Run button (para lenguajes soportados)

---

## 📍 FASE 2: COLABORACIÓN EN TIEMPO REAL

**Prioridad**: 🔴 CRÍTICA  
**Duración**: 4-6 semanas

### 2.1 Collaborative Editing

**Inspiración**: Google Docs, Notion

**Tecnología**: Operational Transform (OT) o CRDT

**Opciones**:
1. **Yjs** (CRDT) - RECOMENDADO
   - Offline-first
   - Conflict-free
   - Peer-to-peer capable
2. **ShareDB** (OT)
   - Más maduro
   - Requiere servidor central
3. **Automerge** (CRDT)
   - Más nuevo
   - JSON-based

### 2.2 Presence Awareness

**Features**:
- Ver cursores de otros usuarios
- Ver selecciones de otros usuarios
- Ver quién está online
- Ver qué están editando
- Colores únicos por usuario
- Avatares en el cursor

### 2.3 Comentarios y Annotations

**Features**:
- Comentar cualquier texto seleccionado
- Hilos de comentarios (replies)
- Resolver/reabrir comentarios
- @ menciones
- Notificaciones de comentarios
- Comentarios privados vs públicos
- Exportar comentarios

### 2.4 Historial de Versiones

**Inspiración**: Google Docs, Notion History

**Features**:
- Auto-save cada 30 segundos
- Snapshot cada hora
- Ver cambios línea por línea (diff view)
- Restaurar versión anterior
- Nombrar versiones importantes
- Comparar dos versiones
- Ver quién hizo cada cambio

---

## 📍 FASE 3: SISTEMA DE BLOQUES (NOTION-LIKE)

**Prioridad**: 🟠 ALTA  
**Duración**: 6-8 semanas

### 3.1 Tipos de Bloques

**Texto**:
- Paragraph
- Heading 1-6
- Quote
- Callout (info, warning, error, success)
- Code block
- Math block

**Listas**:
- Bulleted list
- Numbered list
- Toggle list
- Task list (checkboxes)

**Media**:
- Image
- Video
- Audio
- File
- Embed (YouTube, Twitter, etc)

**Avanzados**:
- Table
- Database view
- Linked page
- Synced block
- Template
- Button

### 3.2 Drag & Drop

**Features**:
- Reordenar bloques
- Arrastrar desde sidebar
- Arrastrar archivos desde OS
- Indicadores visuales de drop zone
- Animaciones suaves

### 3.3 Slash Commands

**Inspiración**: Notion \`/\` command menu

**Features**:
- \`/\` para abrir menu
- Búsqueda fuzzy de comandos
- Keyboard navigation
- Categorías: Basic, Advanced, Media, Database
- Comandos recientes
- Comandos favoritos

### 3.4 Block Properties

**Features**:
- Color de fondo
- Color de texto
- Ancho (full, page, inline)
- Alineación (left, center, right)
- Toggle collapsed/expanded
- Copy block link
- Duplicate block
- Delete block

---

## 📍 FASE 4: GRAPH VIEW Y ENLACES BIDIRECCIONALES

**Prioridad**: 🟠 ALTA  
**Duración**: 3-4 semanas

### 4.1 Wikilinks y Backlinks

**Syntax**:
\`\`\`markdown
[[Documento Vinculado]]
[[Documento|Alias Personalizado]]
[[Carpeta/Documento]]
\`\`\`

**Features**:
- Autocompletar al escribir \`[[\`
- Ver backlinks en sidebar
- Click para navegar
- Hover preview (popup con contenido)
- Detectar links rotos
- Sugerir links basado en contenido

### 4.2 Graph Visualization

**Inspiración**: Obsidian Graph View

**Features**:
- Vista 2D y 3D
- Zoom y pan
- Filtrar por tags
- Colorear por categoría
- Tamaño de nodo por # de backlinks
- Buscar nodo
- Centrar en nodo actual
- Modo cluster
- Modo timeline

### 4.3 Tags Sistema

**Features**:
- Tags inline con \`#tag\`
- Tags en frontmatter YAML
- Tags hierarchical \`#proyecto/frontend\`
- Vista de todos los tags
- Renombrar tags globalmente
- Combinar tags
- Tag autocomplete

---

## 📍 FASE 5: BASES DE DATOS Y VISTAS

**Prioridad**: 🟡 MEDIA  
**Duración**: 8-10 semanas

### 5.1 Database Block

**Inspiración**: Notion Databases

**Properties Types**:
- Text
- Number
- Select (single)
- Multi-select
- Date
- Person
- Files & media
- Checkbox
- URL
- Email
- Phone
- Formula
- Relation
- Rollup

### 5.2 Vistas de Database

**Tipos de Vista**:
1. **Table** - Vista de tabla tradicional
2. **Board** - Vista Kanban
3. **Gallery** - Vista de tarjetas
4. **List** - Vista de lista compacta
5. **Calendar** - Vista de calendario
6. **Timeline** - Vista Gantt

**Features Comunes**:
- Filtros avanzados
- Sorting múltiple
- Grouping
- Búsqueda
- Exportar a CSV/JSON
- Propiedades ocultas/visibles

### 5.3 Fórmulas y Rollups

**Funciones de Fórmula**:
\`\`\`
// Matemáticas
add(), subtract(), multiply(), divide(), pow(), sqrt()

// Texto
concat(), upper(), lower(), replace(), length()

// Fechas
now(), today(), dateAdd(), dateBetween(), formatDate()

// Lógica
if(), and(), or(), not(), empty()

// Agregación
sum(), average(), min(), max(), count()
\`\`\`

---

## 📍 FASE 6: SINCRONIZACIÓN Y OFFLINE

**Prioridad**: 🔴 CRÍTICA  
**Duración**: 4-5 semanas

### 6.1 Offline Mode

**Estrategia**: IndexedDB + Service Workers

**Features**:
- Editar sin conexión
- Queue de cambios pendientes
- Sync automático al reconectar
- Indicador visual de sync status
- Resolver conflictos inteligentemente

### 6.2 Conflict Resolution

**Estrategias**:
1. **Last Write Wins** - Simple pero puede perder datos
2. **Manual Merge** - Mostrar UI para resolver
3. **CRDT** - Automático sin conflictos (RECOMENDADO)

### 6.3 File Uploads

**Features**:
- Drag & drop archivos
- Paste imágenes desde clipboard
- Optimizar imágenes automáticamente
- Progressive upload con preview
- Límite de tamaño por plan
- Almacenar en Supabase Storage

---

## 📍 FASE 7: PLUGINS Y EXTENSIBILIDAD

**Prioridad**: 🟡 MEDIA  
**Duración**: 6-8 semanas

### 7.1 Plugin API

**Inspiración**: VSCode Extensions, Obsidian Plugins

**Tipos de Plugins**:
1. **Editor Extensions** - Nuevos bloques, syntax
2. **UI Extensions** - Sidebar panels, modals
3. **Commands** - Slash commands, keyboard shortcuts
4. **Themes** - CSS customization
5. **Integrations** - APIs externas

### 7.2 Marketplace

**Features**:
- Browse plugins
- Search y filtros
- Ratings y reviews
- Instalación con 1 click
- Auto-updates
- Featured plugins
- Trending plugins

### 7.3 Theme Engine

**Features**:
- Light/Dark modes
- Accent colors personalizables
- Fuentes personalizables
- CSS variables
- Importar/Exportar themes
- Theme marketplace

---

## 📍 FASE 8: HERRAMIENTAS DE PRODUCTIVIDAD

**Prioridad**: 🟡 MEDIA  
**Duración**: 4-5 semanas

### 8.1 Templates

**Features**:
- Templates de documentos
- Variables en templates \`{{title}}\`
- Templates con bloques de database
- Gallery de templates
- Compartir templates
- Template del día

**Ejemplos de Templates**:
- Meeting Notes
- Project Plan
- Weekly Review
- Bug Report
- Feature Request
- Research Paper

### 8.2 Quick Capture

**Inspiración**: Obsidian Quick Switcher, Notion Quick Add

**Features**:
- \`Cmd+K\` para abrir
- Crear documento rápido
- Buscar documentos
- Ejecutar comandos
- Navegar a página
- Fuzzy search

### 8.3 AI Integration

**Features**:
- AI writing assistant
- Auto-complete sugerencias
- Resumir documento
- Traducir
- Mejorar escritura
- Generar ideas
- Responder preguntas sobre el documento

**Tecnología**: OpenAI API o Anthropic Claude

---

## 📍 FASE 9: INTEGRACIONES EXTERNAS

**Prioridad**: 🟢 BAJA  
**Duración**: 3-4 semanas

### 9.1 Import/Export

**Import Formats**:
- Markdown (.md)
- Notion export
- Obsidian vault
- Google Docs
- Word (.docx)
- HTML
- PDF (OCR)

**Export Formats**:
- Markdown
- PDF
- HTML
- Word
- JSON

### 9.2 Third-Party Integrations

**Popular Integrations**:
- GitHub (sync repos)
- Slack (notifications)
- Discord (notifications)
- Zapier (automation)
- IFTTT
- Google Calendar
- Google Drive
- Dropbox
- OneDrive

### 9.3 API Pública

**Endpoints**:
\`\`\`
GET    /api/documents
POST   /api/documents
GET    /api/documents/:id
PATCH  /api/documents/:id
DELETE /api/documents/:id

GET    /api/search?q=query
POST   /api/upload

GET    /api/tags
GET    /api/backlinks/:id
\`\`\`

**Auth**: API Keys + OAuth

---

## 📍 FASE 10: ENTERPRISE FEATURES

**Prioridad**: 🟢 BAJA  
**Duración**: 8-10 semanas

### 10.1 Workspaces

**Features**:
- Múltiples workspaces por usuario
- Workspace admin
- Invitar miembros
- Roles y permisos granulares
- Billing por workspace

### 10.2 Permisos Avanzados

**Niveles de Acceso**:
- Owner - Control total
- Admin - Gestión de usuarios
- Editor - Editar documentos
- Commenter - Solo comentar
- Viewer - Solo ver

**Features**:
- Permisos por documento
- Permisos por carpeta
- Permisos heredados
- Link compartido con contraseña
- Expiración de links
- Watermarks

### 10.3 Analytics y Audit Logs

**Métricas**:
- Documentos creados
- Documentos editados
- Usuarios activos
- Tiempo de edición
- Palabras escritas
- Gráfico de actividad

**Audit Logs**:
- Quién hizo qué y cuándo
- IP address
- Dispositivo
- Exportar logs
- Retención configurable

### 10.4 Compliance

**Features**:
- GDPR compliance
- SOC 2 Type II
- HIPAA compliance (medical)
- Data encryption at rest
- Data encryption in transit
- 2FA obligatorio
- SSO (SAML, OAuth)

---

## 🎯 MÉTRICAS DE ÉXITO

### KPIs Técnicos
- ✅ **Render Performance**: < 100ms para documentos de 10k líneas
- ✅ **Search Latency**: < 50ms para búsqueda en documento
- ✅ **Sync Latency**: < 1s para sincronizar cambios
- ✅ **Offline Capable**: 100% features offline
- ✅ **Uptime**: > 99.9%
- ✅ **Bundle Size**: < 500KB initial

### KPIs de Producto
- **DAU/MAU Ratio**: > 40% (engagement)
- **Retention D1**: > 60%
- **Retention D7**: > 40%
- **Retention D30**: > 25%
- **Time to First Document**: < 30 segundos
- **Documents per User**: > 10
- **Collaborative Sessions**: > 20% of edits

### KPIs de Negocio
- **Free to Paid Conversion**: > 5%
- **Monthly Churn**: < 3%
- **NPS Score**: > 50
- **Customer Support Tickets**: < 2% of users

---

## 📚 TECNOLOGÍAS RECOMENDADAS

### Frontend
- **Framework**: React 18+ (ya en uso)
- **Editor**: CodeMirror 6 o Monaco Editor
- **Markdown**: Unified.js (remark + rehype)
- **Syntax Highlighting**: Shiki
- **Collaboration**: Yjs + y-websocket
- **Offline Storage**: Dexie (IndexedDB)
- **State Management**: Zustand o Jotai
- **Forms**: React Hook Form (ya instalado)
- **Drag & Drop**: @dnd-kit (ya instalado)

### Backend (Supabase)
- **Database**: PostgreSQL
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime
- **Edge Functions**: Deno

### DevOps
- **Hosting**: Vercel o Cloudflare Pages
- **CDN**: Cloudflare
- **Monitoring**: Sentry (ya configurado)
- **Analytics**: PostHog (ya configurado)
- **CI/CD**: GitHub Actions

---

## ✅ ROADMAP TIMELINE

### Q1 2025 (Enero - Marzo)
- ✅ Fase 1: Editor Markdown Avanzado (URGENTE: Fix búsqueda)
- 🔄 Fase 2: Colaboración en Tiempo Real
- 🔄 Fase 6: Sincronización Offline (core features)

### Q2 2025 (Abril - Junio)
- Fase 3: Sistema de Bloques
- Fase 4: Graph View
- Fase 8: Herramientas de Productividad (parte 1)

### Q3 2025 (Julio - Septiembre)
- Fase 5: Bases de Datos y Vistas
- Fase 7: Plugins (MVP)
- Fase 8: Herramientas de Productividad (parte 2)

### Q4 2025 (Octubre - Diciembre)
- Fase 9: Integraciones Externas
- Fase 10: Enterprise Features
- Polish y optimizaciones

---

## 🚀 QUICK WINS (Próximos 7 Días)

### CRÍTICO - Búsqueda Profesional con mark.js
1. **Problema Resuelto**: Eliminados límites artificiales
2. **Solución**: Usar mark.js profesionalmente sin restricciones
3. **Tiempo**: Completado ✅
4. **Prioridad**: 🔴 MÁXIMA

### Features Rápidas (1-2 días cada una)
- ✅ Copiar contenido del documento
- [ ] Exportar a PDF
- [ ] Dark mode para el viewer
- [ ] Keyboard shortcuts (Ctrl+F, Esc)
- [ ] Breadcrumbs navigation
- [ ] Document stats (palabras, caracteres, tiempo de lectura)

---

## 📝 NOTAS FINALES

Este roadmap es **ambicioso pero alcanzable**. La clave es:

1. **Priorizar IMPLACABLEMENTE** - Hacer features que importan
2. **Iterar RÁPIDO** - Ship fast, learn fast
3. **Escuchar USUARIOS** - Build what they need, not what we think
4. **Medir TODO** - Data-driven decisions

**Próximo Paso**: Continuar implementando features profesionales sin límites artificiales.

---

**Última actualización**: Diciembre 25, 2025  
**Autor**: Platzi Clone Team  
**Versión**: 1.0.0
`,

  'quick-setup': `# ⚡ Guía de Setup Rápido - Platzi Clone

## 🎯 Objetivo
Configurar el proyecto Platzi Clone en menos de 10 minutos.

## 📋 Prerequisitos
- Node.js 18+ instalado
- npm o pnpm instalado
- Cuenta de Supabase (gratis)
- Editor de código (VS Code recomendado)

## 🚀 Pasos Rápidos

### 1. Clonar e Instalar
\`\`\`bash
# Instalar dependencias
npm install
# o
pnpm install
\`\`\`

### 2. Configurar Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia las credenciales (URL + Anon Key)

### 3. Variables de Entorno
Crear archivo \`.env.local\`:
\`\`\`env
VITE_SUPABASE_URL=tu_url_aqui
VITE_SUPABASE_ANON_KEY=tu_key_aqui
\`\`\`

### 4. Ejecutar Migraciones
Ve al Admin Panel → Dev Tools → Setup Wizard y ejecuta el setup automático.

### 5. Iniciar Desarrollo
\`\`\`bash
npm run dev
\`\`\`

¡Listo! La aplicación estará en http://localhost:5173

## 🎨 Próximos Pasos
- Explora el Dashboard
- Crea tu primer curso
- Configura tu perfil
- Invita a otros usuarios

## 🆘 Ayuda
Si tienes problemas, revisa la documentación completa en el Admin Panel → Documentación.
`,
};

// Función helper para obtener el contenido de un documento
export function getDocumentContent(docId: string): string | null {
  return MARKDOWN_DOCS[docId] || null;
}