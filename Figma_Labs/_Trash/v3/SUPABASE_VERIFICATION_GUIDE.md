# ✅ Guía de Verificación de Supabase - Paso a Paso

## 🎯 Estado Actual

Según tu captura de pantalla:
- ✅ El esquema SQL se ejecutó exitosamente ("Success. No rows returned")
- ✅ Las tablas se crearon (se ven en el Table Editor)
- ⚠️ Las tablas están vacías (necesitan datos de prueba)

---

## 📝 VERIFICACIÓN PASO A PASO

### ✅ **Paso 1: Verificar Tablas Creadas**

1. Ve a **SQL Editor** en Supabase
2. Ejecuta:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**✅ Deberías ver 10 tablas:**
- achievements
- blog_posts
- comments
- courses
- enrollments
- followers
- likes
- notifications
- posts
- profiles

---

### ✅ **Paso 2: Verificar RLS (Row Level Security)**

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**✅ Todas deben mostrar `rowsecurity = true`**

---

### ✅ **Paso 3: Verificar Políticas de Seguridad**

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

**✅ Deberías ver múltiples políticas, por ejemplo:**
- `Public profiles are viewable by everyone`
- `Users can insert their own profile`
- `Courses are viewable by everyone`
- etc.

---

### ✅ **Paso 4: Verificar Triggers**

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

**✅ Deberías ver:**
- `update_profiles_updated_at` en profiles
- `update_courses_updated_at` en courses
- `update_posts_updated_at` en posts
- etc.

---

### ✅ **Paso 5: Verificar Funciones**

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

**✅ Deberías ver:**
- `handle_new_user`
- `increment_course_students`
- `update_updated_at_column`

---

## 📊 **INSERTAR DATOS DE PRUEBA**

### **Paso 1: Crear tu primer usuario**

1. Ve a **Authentication** > **Users**
2. Haz clic en **Add user** > **Create new user**
3. Configura:
   - Email: `tu-email@ejemplo.com`
   - Password: `Password123!`
   - ✅ Auto Confirm User (marca esto)
4. Haz clic en **Create user**

### **Paso 2: Obtener tu User ID**

Ejecuta en SQL Editor:

```sql
SELECT id, email FROM auth.users;
```

**Copia el ID que aparece (será algo como `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)**

### **Paso 3: Verificar que se creó tu perfil automáticamente**

```sql
SELECT * FROM public.profiles;
```

**✅ Deberías ver tu perfil creado automáticamente por el trigger!**

Si no aparece, el trigger no funcionó. Verifica:

```sql
-- Ver si el trigger existe
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### **Paso 4: Insertar datos de prueba**

1. Abre el archivo `/supabase-test-data.sql`
2. **IMPORTANTE**: En la línea que dice:
   ```sql
   WHERE email = 'bundle-faster-open@duck.com'; -- Reemplaza con tu email
   ```
   Cambia por tu email real

3. Copia TODO el contenido del archivo
4. Pégalo en SQL Editor
5. Haz clic en **Run**

### **Paso 5: Verificar datos insertados**

```sql
-- Ver resumen
SELECT 'profiles' as tabla, COUNT(*) as total FROM public.profiles
UNION ALL
SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'blog_posts', COUNT(*) FROM public.blog_posts
UNION ALL
SELECT 'posts', COUNT(*) FROM public.posts
UNION ALL
SELECT 'comments', COUNT(*) FROM public.comments
UNION ALL
SELECT 'likes', COUNT(*) FROM public.likes;
```

**✅ Deberías ver:**
- profiles: 5-6 registros
- courses: 3 registros
- blog_posts: 3 registros
- posts: 4 registros
- comments: 3 registros
- likes: 6+ registros

---

## 🧪 **PROBAR FUNCIONALIDAD**

### **Test 1: Query con JOIN**

```sql
-- Blog posts con autor
SELECT 
  bp.title,
  p.full_name as author,
  bp.views_count,
  bp.published_at
FROM public.blog_posts bp
JOIN public.profiles p ON bp.author_id = p.id
WHERE bp.status = 'published'
ORDER BY bp.published_at DESC;
```

**✅ Debería mostrar los 3 blog posts con nombres de autores**

### **Test 2: Insertar un nuevo post**

```sql
-- Primero obtén tu user ID
SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com';

-- Luego inserta (reemplaza YOUR_USER_ID)
INSERT INTO public.posts (user_id, content, type)
VALUES (
  'YOUR_USER_ID',
  'Mi primer post de prueba! 🚀',
  'post'
)
RETURNING *;
```

**✅ Debería insertarse exitosamente y devolver el registro**

### **Test 3: Dar like a un post**

```sql
-- Obtener ID del primer post
SELECT id FROM public.posts LIMIT 1;

-- Dar like (reemplaza los IDs)
INSERT INTO public.likes (user_id, post_id)
VALUES ('YOUR_USER_ID', 'POST_ID')
RETURNING *;
```

**✅ Debería insertarse el like**

### **Test 4: Crear un comentario**

```sql
-- Obtener ID del primer blog post
SELECT id FROM public.blog_posts LIMIT 1;

-- Crear comentario (reemplaza los IDs)
INSERT INTO public.comments (user_id, blog_post_id, content)
VALUES (
  'YOUR_USER_ID',
  'BLOG_POST_ID',
  'Excelente artículo! Muy útil 👍'
)
RETURNING *;
```

**✅ Debería crear el comentario**

---

## 🔒 **PROBAR SEGURIDAD RLS**

### **Test 1: Acceso público a perfiles**

```sql
-- Simular usuario no autenticado
SET ROLE anon;

-- Intentar ver perfiles (debería funcionar)
SELECT id, full_name, email FROM public.profiles;

-- Volver a rol normal
RESET ROLE;
```

**✅ Debería mostrar los perfiles (datos públicos)**

### **Test 2: Intentar modificar perfil de otro usuario**

```sql
-- Simular usuario no autenticado
SET ROLE anon;

-- Intentar actualizar un perfil (debería FALLAR)
UPDATE public.profiles 
SET full_name = 'Hacker' 
WHERE email = 'otro-usuario@ejemplo.com';

-- Volver a rol normal
RESET ROLE;
```

**✅ Debería dar error o no afectar ninguna fila (RLS bloqueando)**

---

## 📈 **VERIFICAR EN LA APLICACIÓN**

### **Test en tu App React**

1. **Abre tu aplicación** en el navegador
2. **Abre DevTools Console** (F12)
3. **Ejecuta estos tests en la consola:**

```javascript
// Test 1: Obtener perfiles
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(5);
console.log('Profiles:', data, error);

// Test 2: Obtener cursos
const { data: courses, error: coursesError } = await supabase
  .from('courses')
  .select('*')
  .limit(5);
console.log('Courses:', courses, coursesError);

// Test 3: Obtener blog posts con autores
const { data: posts, error: postsError } = await supabase
  .from('blog_posts')
  .select(`
    *,
    author:profiles(*)
  `)
  .eq('status', 'published')
  .limit(5);
console.log('Blog Posts:', posts, postsError);
```

**✅ Deberías ver los datos en la consola sin errores**

---

## 🎯 **CHECKLIST FINAL**

Marca cada item cuando lo completes:

### Esquema y Estructura
- [ ] ✅ 10 tablas creadas
- [ ] ✅ RLS habilitado en todas las tablas
- [ ] ✅ Políticas de seguridad configuradas
- [ ] ✅ Triggers de updated_at funcionando
- [ ] ✅ Función handle_new_user configurada
- [ ] ✅ Índices creados para performance

### Datos de Prueba
- [ ] ✅ Usuario de prueba creado en Auth
- [ ] ✅ Perfil creado automáticamente
- [ ] ✅ 5+ perfiles de prueba
- [ ] ✅ 3+ cursos de prueba
- [ ] ✅ 3+ blog posts de prueba
- [ ] ✅ 4+ posts sociales
- [ ] ✅ Comentarios y likes funcionando

### Funcionalidad
- [ ] ✅ Queries con JOIN funcionan
- [ ] ✅ INSERT funciona
- [ ] ✅ UPDATE funciona (solo tu propio perfil)
- [ ] ✅ RLS bloquea accesos no autorizados
- [ ] ✅ Triggers actualizan updated_at

### Integración con App
- [ ] ✅ App puede leer datos
- [ ] ✅ App puede crear posts
- [ ] ✅ App puede dar likes
- [ ] ✅ App puede comentar
- [ ] ✅ Autenticación funciona

---

## 🚨 **PROBLEMAS COMUNES**

### ❌ "Perfil no se crea automáticamente"

**Solución:**
```sql
-- Verificar trigger
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Si no existe, recrearlo
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### ❌ "No puedo insertar datos - RLS error"

**Solución:**
```sql
-- Verificar que estás autenticado
SELECT auth.uid();

-- Si es NULL, necesitas autenticarte primero
-- O temporalmente desactivar RLS para testing:
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
-- IMPORTANTE: Volver a activar después
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
```

### ❌ "Foreign key constraint violation"

**Solución:**
Asegúrate de usar IDs que existan:

```sql
-- Ver IDs disponibles
SELECT id, email FROM auth.users;
SELECT id, full_name FROM public.profiles;
SELECT id, title FROM public.courses;
```

### ❌ "App no puede leer datos"

**Solución:**
1. Verifica las credenciales en `/src/lib/supabase.ts`
2. Verifica que RLS tenga política de SELECT pública
3. Revisa la consola del navegador para errores

---

## 📞 **SIGUIENTE PASO**

Una vez que todo funcione:

1. **Prueba la autenticación** en tu app
2. **Crea un nuevo post** desde la UI
3. **Dale like a un post** desde la UI
4. **Comenta en un blog post** desde la UI
5. **Verifica que los datos aparezcan en tiempo real**

---

## 🎉 **¡ÉXITO!**

Si todos los tests pasan, tu Supabase está:
- ✅ Correctamente configurado
- ✅ Con datos de prueba
- ✅ Seguro con RLS
- ✅ Listo para producción
- ✅ Integrado con tu app

**¡Felicidades! Tu backend está funcionando perfectamente** 🚀
