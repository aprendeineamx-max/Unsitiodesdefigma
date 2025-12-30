# 🚀 Guía Completa de Configuración de Supabase

## 📋 Índice

1. [Resumen](#resumen)
2. [Proceso Paso a Paso](#proceso-paso-a-paso)
3. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
4. [Datos que se Sincronizarán](#datos-que-se-sincronizarán)

---

## 🎯 Resumen

Tu aplicación ahora tiene un sistema COMPLETO de sincronización con Supabase que incluye:

### 🛠️ Herramientas Disponibles (DevTools Menu)

1. **Connection Test** - Verificar conexión a Supabase
2. **Database Setup** - Generar SQL para crear 17 tablas
3. **Master Data Sync** - Sincronizar TODOS los datos
4. **Insert Data (Legacy)** - Solo para cursos básicos (deprecado)

---

## 📝 Proceso Paso a Paso

### Paso 1: Abrir DevTools Menu

1. Busca el botón flotante morado en la esquina inferior izquierda
2. Tiene un icono de llave inglesa (Wrench) con un badge "4"
3. Click para abrir el menú

### Paso 2: Verificar Conexión

1. Click en "Connection Test"
2. Verifica que la conexión a Supabase esté funcionando
3. Debes ver "✅ Conexión exitosa"

### Paso 3: Crear Tablas en Supabase

1. Click en "Database Setup"
2. Click en "Copiar SQL Completo"
3. Ve a tu Dashboard de Supabase:
   - URL: https://supabase.com/dashboard
   - Selecciona tu proyecto
   - Ve a "SQL Editor" (menú lateral)
   - Click en "New Query"
4. Pega el SQL copiado
5. Click en "Run" (▶️)
6. Espera a que termine (puede tomar 10-30 segundos)
7. Verás un mensaje de éxito

### Paso 4: Sincronizar Todos los Datos

1. Regresa a tu aplicación
2. Abre DevTools Menu nuevamente
3. Click en "Master Data Sync"
4. Click en "Iniciar Sincronización Completa"
5. Observa el progreso en tiempo real:
   - ✅ Cursos (33 items con contenido profesional)
   - ✅ Módulos y Lecciones (135+ lecciones)
   - ✅ Posts del Feed Social
   - ✅ Comentarios
   - ✅ Blog Posts
   - ✅ Badges
   - ✅ Challenges

### Paso 5: Verificar en Supabase

1. Ve a tu Dashboard de Supabase
2. Click en "Table Editor"
3. Verifica que veas todas las tablas:
   - users
   - courses (con 33 registros)
   - modules
   - lessons (135+ registros)
   - posts
   - comments
   - blog_posts
   - badges
   - challenges
   - etc.

---

## 🗄️ Estructura de la Base de Datos

### 17 Tablas Creadas

#### 1. **users** - Sistema de Usuarios con Gamificación
- Perfil completo
- Level, XP, Coins
- Streaks (rachas)
- Estadísticas de aprendizaje

#### 2. **courses** - Cursos Completos
- Información básica (título, instructor, etc.)
- **features** (JSONB) - Características del curso
- **what_you_learn** (JSONB) - Lo que aprenderás
- **requirements** (JSONB) - Requisitos previos
- **modules** (JSONB) - Módulos del curso

#### 3. **modules** - Módulos de Cursos
- Relación con courses
- Orden de módulos

#### 4. **lessons** - Lecciones Individuales
- Relación con modules y courses
- Tipo (video, reading, quiz, project)
- Contenido y duración

#### 5. **posts** - Feed Social
- Posts de usuarios
- Achievements
- Completions
- Anuncios

#### 6. **comments** - Sistema de Comentarios
- Comentarios en posts
- Respuestas anidadas
- Likes en comentarios

#### 7. **likes** - Sistema de Likes
- Likes en posts
- Likes en comentarios

#### 8. **blog_posts** - Blog Profesional
- Artículos completos
- Autor, categoría, tags
- Estadísticas (views, likes)

#### 9. **badges** - Insignias de Gamificación
- Diferentes raridades
- Categorías
- Requisitos

#### 10. **user_badges** - Badges de Usuarios
- Progreso hacia badges
- Fecha de obtención

#### 11. **achievements** - Logros
- Logros del sistema
- Recompensas XP

#### 12. **challenges** - Desafíos
- Daily, Weekly, Monthly
- Recompensas (XP, coins, badges)

#### 13. **user_challenges** - Progreso de Desafíos
- Progreso individual
- Fecha de completación

#### 14. **study_groups** - Grupos de Estudio
- Grupos públicos/privados
- Miembros
- Cursos asociados

#### 15. **forum_posts** - Foros de Discusión
- Preguntas y respuestas
- Estado (resuelto/no resuelto)

#### 16. **user_progress** - Progreso de Usuarios
- Progreso por lección
- Tiempo dedicado

#### 17. **enrollments** - Inscripciones
- Cursos inscritos
- Progreso del curso
- Certificados

---

## 📊 Datos que se Sincronizarán

### Cursos (33)
- **Desarrollo Web Full Stack** (13 módulos, 45+ lecciones)
- **Python para Data Science**
- **Marketing Digital Avanzado**
- **UI/UX Design Profesional**
- **DevOps y Cloud Computing**
- **Blockchain y Web3**
- **Machine Learning Fundamentos**
- Y 26 cursos más...

### Módulos y Lecciones
- **135+ lecciones** distribuidas en **13 módulos**
- Tipos variados: video, reading, quiz, project
- Duraciones detalladas

### Posts del Feed Social
- Achievements
- Completions de cursos
- Anuncios
- Clases en vivo
- Discusiones

### Comentarios
- Comentarios en posts
- Respuestas anidadas
- Sistema de likes

### Blog Posts
- Artículos profesionales
- Categorías: Desarrollo Web, Data Science, Marketing, etc.
- Autores con perfiles completos

### Badges
- **Primera Lección** (common)
- **Aprendiz Dedicado** (common)
- **Estudiante Estrella** (rare)
- **Maestro del Conocimiento** (epic)
- **Racha de Fuego** (rare)
- **Maratonista** (epic)
- **Leyenda** (legendary)
- **Social Butterfly** (rare)

### Challenges
- **Estudiante del Día** (daily) - 3 lecciones
- **Semana Productiva** (weekly) - 15 lecciones
- **Maestro del Mes** (monthly) - 50 lecciones

---

## 🎉 ¡Todo Listo!

Después de completar estos pasos, tu aplicación estará completamente respaldada en Supabase con:

- ✅ 17 tablas con estructura profesional
- ✅ 33 cursos con contenido completo
- ✅ 135+ lecciones detalladas
- ✅ Sistema de gamificación completo
- ✅ Red social funcional
- ✅ Blog profesional
- ✅ Índices para performance
- ✅ Row Level Security configurado

---

## 🔄 Futuras Sincronizaciones

Para agregar más datos en el futuro:

1. Agrega los datos a los archivos en `/src/app/data/`
2. Abre "Master Data Sync"
3. Ejecuta la sincronización nuevamente
4. Los datos nuevos se insertarán (upsert)

---

## 🆘 Solución de Problemas

### "Error: relation does not exist"
- Ejecuta el SQL del "Database Setup" primero

### "Error: column does not exist"
- Verifica que ejecutaste TODO el SQL completo
- Revisa que no haya errores en el SQL Editor

### "Error: permission denied"
- Verifica que las políticas RLS estén configuradas
- El SQL incluye políticas permisivas para desarrollo

### Los datos no aparecen
- Verifica en Supabase Table Editor
- Revisa la consola del navegador para errores
- Verifica tu conexión a internet

---

## 📱 Contacto

Si tienes problemas, verifica:
1. La conexión a Supabase (Connection Test)
2. Que las tablas existan (Supabase Dashboard)
3. La consola del navegador para errores

¡Disfruta de tu plataforma completamente sincronizada! 🚀
