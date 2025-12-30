# 🚀 Guía Completa de Configuración de Supabase

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Configurar el Esquema de Base de Datos](#configurar-el-esquema-de-base-de-datos)
3. [Habilitar Autenticación](#habilitar-autenticación)
4. [Configurar Storage (Opcional)](#configurar-storage-opcional)
5. [Configurar Variables de Entorno](#configurar-variables-de-entorno)
6. [Usar Supabase en tu Aplicación](#usar-supabase-en-tu-aplicación)
7. [Integraciones Adicionales](#integraciones-adicionales)
8. [Testing y Debugging](#testing-y-debugging)

---

## 🎯 Configuración Inicial

### Credenciales de tu Proyecto Supabase

**Ya configuradas automáticamente en el código:**

```
Proyecto: bundle-faster-open@duck.com's Project
URL: https://bntwyvwavxgspvcvelay.supabase.co
Plan: Free - $0/month
Región: Americas
Email: bundle-faster-open@duck.com
```

### Credenciales de API

✅ **Anon/Public Key** (Ya configurada en `/src/lib/supabase.ts`):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHd5dndhdnhnc3B2Y3ZlbGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MjAyNTksImV4cCI6MjA4MjA5NjI1OX0.oK5z3UnEybSVl7Hj4V7UwG4AQvSdzijJEV1ztNRJboQ
```

⚠️ **Service Role Key** (Solo para servidor - NO exponerla al cliente):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHd5dndhdnhnc3B2Y3ZlbGF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUyMDI1OSwiZXhwIjoyMDgyMDk2MjU5fQ.h7UOc0Kd0ofFJz6YQYs4hgSvLkxl0-grfJS1VuzSPoo
```

---

## 🗄️ Configurar el Esquema de Base de Datos

### Paso 1: Acceder al SQL Editor

1. Ve a tu Dashboard de Supabase: https://supabase.com/dashboard/project/bntwyvwavxgspvcvelay
2. En el menú lateral, haz clic en **"SQL Editor"**
3. Haz clic en **"New Query"**

### Paso 2: Ejecutar el Esquema

1. Abre el archivo `supabase-schema.sql` en la raíz de tu proyecto
2. **Copia TODO el contenido** del archivo
3. **Pega** el contenido en el editor SQL de Supabase
4. Haz clic en **"Run"** (o presiona Cmd/Ctrl + Enter)
5. Espera a que se complete (debería ver "Success" en verde)

### Tablas Creadas

✅ **Tablas principales:**
- `profiles` - Perfiles de usuarios
- `courses` - Cursos educativos
- `posts` - Posts sociales (feed, stories, reels, live)
- `blog_posts` - Artículos del blog
- `comments` - Comentarios
- `likes` - Me gusta/Reacciones
- `enrollments` - Inscripciones a cursos
- `achievements` - Logros/Badges
- `notifications` - Notificaciones
- `followers` - Seguidores

✅ **Características implementadas:**
- Row Level Security (RLS) en todas las tablas
- Índices para optimización de consultas
- Triggers automáticos para timestamps
- Políticas de seguridad configuradas
- Función automática para crear perfiles

---

## 🔐 Habilitar Autenticación

### Configuración de Email/Password (Ya habilitado por defecto)

1. Ve a **Authentication** > **Providers** en Supabase
2. Asegúrate que **Email** esté habilitado
3. Configura las opciones:
   - ✅ Enable sign ups
   - ✅ Confirm email (recomendado)

### Configurar OAuth Providers (Opcional pero recomendado)

#### Google OAuth

1. Ve a https://console.cloud.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** > **Credentials**
4. Crea **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs: 
     ```
     https://bntwyvwavxgspvcvelay.supabase.co/auth/v1/callback
     ```
5. Copia el Client ID y Client Secret
6. En Supabase Dashboard:
   - Ve a **Authentication** > **Providers**
   - Habilita **Google**
   - Pega Client ID y Client Secret

#### GitHub OAuth

1. Ve a https://github.com/settings/developers
2. Haz clic en **"New OAuth App"**
3. Configura:
   - Application name: `Platzi Clone`
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL:
     ```
     https://bntwyvwavxgspvcvelay.supabase.co/auth/v1/callback
     ```
4. Copia Client ID y Client Secret
5. En Supabase Dashboard:
   - Ve a **Authentication** > **Providers**
   - Habilita **GitHub**
   - Pega Client ID y Client Secret

---

## 📦 Configurar Storage (Opcional)

### Para imágenes de perfiles, posts, cursos, etc.

1. Ve a **Storage** en Supabase Dashboard
2. Crea los siguientes buckets:

#### Bucket: `avatars`
```sql
-- Políticas de acceso público
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Bucket: `posts`
```sql
-- Para imágenes y videos de posts
CREATE POLICY "Post media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

CREATE POLICY "Authenticated users can upload post media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts' AND 
  auth.role() = 'authenticated'
);
```

#### Bucket: `course-content`
```sql
-- Para thumbnails y contenido de cursos
CREATE POLICY "Course content is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-content');

CREATE POLICY "Instructors can upload course content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-content' AND 
  auth.role() = 'authenticated'
);
```

---

## 🔧 Configurar Variables de Entorno

### Paso 1: Crear archivo .env.local

```bash
# En la raíz de tu proyecto
cp .env.example .env.local
```

### Paso 2: Verificar configuración

El archivo `.env.local` debe contener (ya pre-configurado):

```env
VITE_SUPABASE_URL=https://bntwyvwavxgspvcvelay.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHd5dndhdnhnc3B2Y3ZlbGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MjAyNTksImV4cCI6MjA4MjA5NjI1OX0.oK5z3UnEybSVl7Hj4V7UwG4AQvSdzijJEV1ztNRJboQ
```

---

## 💻 Usar Supabase en tu Aplicación

### El cliente ya está configurado en `/src/lib/supabase.ts`

### Ejemplos de Uso:

#### 1. Registrar un usuario

```typescript
import { supabaseHelpers } from '@/lib/supabase';

const { data, error } = await supabaseHelpers.auth.signUp(
  'user@example.com',
  'password123',
  'John Doe'
);
```

#### 2. Iniciar sesión

```typescript
const { data, error } = await supabaseHelpers.auth.signIn(
  'user@example.com',
  'password123'
);
```

#### 3. Obtener perfil del usuario

```typescript
const { data: profile, error } = await supabaseHelpers.profiles.get(userId);
```

#### 4. Crear un post

```typescript
const { data, error } = await supabaseHelpers.posts.create({
  user_id: userId,
  content: '¡Mi primer post!',
  type: 'post',
  likes_count: 0,
  comments_count: 0,
  shares_count: 0,
  views_count: 0
});
```

#### 5. Listar posts del feed

```typescript
const { data: posts, error } = await supabaseHelpers.posts.list('post', {
  limit: 20,
  offset: 0
});
```

#### 6. Dar like a un post

```typescript
const { data, error } = await supabaseHelpers.likes.toggle(
  userId,
  postId,
  'post'
);
```

#### 7. Crear artículo de blog

```typescript
const { data, error } = await supabaseHelpers.blog.create({
  author_id: userId,
  title: 'Mi primer artículo',
  slug: 'mi-primer-articulo',
  excerpt: 'Descripción corta',
  content: 'Contenido completo del artículo...',
  cover_image_url: 'https://...',
  category: 'Desarrollo',
  tags: ['React', 'TypeScript'],
  status: 'published',
  reading_time: 5,
  published_at: new Date().toISOString()
});
```

#### 8. Suscribirse a cambios en tiempo real

```typescript
// Suscribirse a nuevos posts
const channel = supabaseHelpers.realtime.subscribeToPosts((payload) => {
  console.log('Nuevo post:', payload);
  // Actualizar UI
});

// Desuscribirse
supabaseHelpers.realtime.unsubscribe(channel);
```

---

## 🔌 Integraciones Adicionales

### 1. Modelos de IA

#### SambaNova
```env
VITE_SAMBANOVA_API_KEY=your_key_here
```
Usa para: Generación de contenido, chatbots educativos

#### Groq (Fast AI)
```env
VITE_GROQ_API_KEY=your_key_here
```
Usa para: Inferencia rápida de modelos, respuestas instantáneas

#### OpenRouter
```env
VITE_OPENROUTER_API_KEY=your_key_here
```
Usa para: Acceso a múltiples modelos (GPT-4, Claude, Llama, etc.)

### 2. Pagos con Stripe

1. Ve a https://dashboard.stripe.com/
2. Obtén tus keys en **Developers** > **API keys**
3. Configura webhook endpoint:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```
4. Añade a `.env.local`:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 3. Almacenamiento de Imágenes (Cloudinary)

1. Ve a https://cloudinary.com/
2. Crea una cuenta gratuita
3. Obtén credenciales en **Dashboard**
4. Añade a `.env.local`:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_API_KEY=your_api_key
   VITE_CLOUDINARY_API_SECRET=your_api_secret
   ```

---

## 🧪 Testing y Debugging

### 1. Verificar conexión a Supabase

```typescript
import { supabase } from '@/lib/supabase';

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase.from('profiles').select('count');
  console.log('Connection test:', error ? 'Failed' : 'Success');
};
```

### 2. Ver logs en Supabase

1. Ve a **Logs** en Supabase Dashboard
2. Selecciona el tipo de log (API, Auth, etc.)
3. Filtra por errores o búsqueda específica

### 3. Debugging de RLS (Row Level Security)

Si tienes problemas con permisos:

```sql
-- Ver políticas activas
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Desactivar RLS temporalmente (solo para debugging)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- IMPORTANTE: Volver a activar después
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### 4. Reset de Base de Datos (Cuidado!)

```sql
-- Eliminar todas las tablas y empezar de cero
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Luego volver a ejecutar supabase-schema.sql
```

---

## 📚 Recursos Útiles

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Dashboard**: https://supabase.com/dashboard/project/bntwyvwavxgspvcvelay
- **TypeScript Types**: Ya incluidos en `/src/lib/supabase.ts`
- **RLS Examples**: https://supabase.com/docs/guides/auth/row-level-security

---

## ✅ Checklist de Configuración

- [ ] ✅ Cliente de Supabase instalado (`@supabase/supabase-js`)
- [ ] Ejecutar `supabase-schema.sql` en SQL Editor
- [ ] Verificar que todas las tablas se crearon correctamente
- [ ] Habilitar autenticación por Email/Password
- [ ] (Opcional) Configurar OAuth con Google/GitHub
- [ ] (Opcional) Crear buckets de Storage
- [ ] Crear archivo `.env.local` con las credenciales
- [ ] Probar registro e inicio de sesión
- [ ] Probar crear un post o artículo
- [ ] Configurar integraciones adicionales si es necesario

---

## 🎉 ¡Listo!

Tu aplicación ahora está completamente conectada a Supabase con:

✅ Base de datos PostgreSQL configurada
✅ Autenticación de usuarios
✅ Row Level Security (RLS)
✅ Real-time subscriptions
✅ Storage para archivos (opcional)
✅ Helper functions para operaciones comunes

**Próximos pasos recomendados:**

1. Crear algunos usuarios de prueba
2. Agregar contenido de ejemplo (posts, cursos, blog posts)
3. Probar todas las funcionalidades sociales
4. Configurar OAuth para mejor UX
5. Añadir integraciones de IA si lo deseas

---

**¿Necesitas ayuda?** 

Revisa la documentación oficial de Supabase o los ejemplos de código en `/src/lib/supabase.ts`
