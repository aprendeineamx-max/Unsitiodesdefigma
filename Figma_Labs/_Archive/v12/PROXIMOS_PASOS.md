# 🎯 PRÓXIMOS PASOS - Master Data Sync

## ✅ LO QUE YA ESTÁ HECHO

1. ✅ **SchemaInspector creado** (`/src/app/components/SchemaInspector.tsx`)
2. ✅ **Función SQL lista** (`/CREAR_FUNCION_EXECUTE_SQL.sql`)
3. ✅ **SchemaInspector agregado al DevTools** (5to botón con icono 👁️)
4. ✅ **Documentación completa** (`/GUIA_SCHEMA_INSPECTOR.md`)
5. ✅ **MasterDataSync usa extendedCourses** (33 cursos en vez de 9)

---

## ⚠️ LO QUE FALTA (EN ORDEN)

### Paso 1: CREAR LA FUNCIÓN RPC EN SUPABASE (SOLO UNA VEZ)

**USUARIO DEBE HACER:**
1. Ir a Supabase SQL Editor
2. Copiar y pegar el contenido de `/CREAR_FUNCION_EXECUTE_SQL.sql`
3. Ejecutar (RUN ▶️)
4. Verificar que dice "Success. No rows returned"

**Código a ejecutar:**
```sql
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || query || ') t' INTO result;
  RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon;
```

---

### Paso 2: USAR SCHEMA INSPECTOR PARA VER POSTS Y COMMENTS

**USUARIO DEBE HACER:**
1. Abrir Dev Tools (🛠️) en la app
2. Click en **"Schema Inspector"** (botón verde con ojo 👁️)
3. Click en botón **"posts"**
4. Click en botón **"comments"**
5. Click en **"Copiar JSON"** en cada tabla
6. Enviarme los 2 JSON completos

**Formato esperado:**
```json
// posts
[
  {
    "column_name": "id",
    "data_type": "text",
    "is_nullable": "NO"
  },
  {
    "column_name": "user_id",
    "data_type": "text",
    "is_nullable": "NO"
  },
  ...
]

// comments
[
  {
    "column_name": "id",
    "data_type": "text",
    "is_nullable": "NO"
  },
  ...
]
```

---

### Paso 3: ARREGLAR MASTERDATASYNC CON LOS SCHEMAS REALES

**YO HARÉ (cuando tenga los schemas):**

1. Corregir la sección de POSTS en MasterDataSync:
   - Mapear `author{name,avatar}` a `user_id` (crear usuario primero)
   - Cambiar `image` a `image_url`
   - Cambiar `createdAt` a `created_at`
   - Cambiar `likes/comments/shares` a `likes_count/comments_count/shares_count`
   - Eliminar campos que no existen en DB (achievement_badge, course_title, etc.)

2. Corregir la sección de COMMENTS en MasterDataSync:
   - Mapear `author{name,avatar}` a `user_id` (crear usuario primero)
   - Cambiar `postId` a `post_id`
   - Cambiar `createdAt` a `created_at`
   - Manejar `replies` como registros con `parent_id`

3. Corregir la sección de BLOG_POSTS en MasterDataSync:
   - Mapear `author{name,avatar,role}` a `author_id` (crear usuario primero)
   - Cambiar `image` a `cover_image_url`
   - Generar `slug` desde `title`
   - Cambiar `readTime` a `reading_time`
   - Cambiar `publishedAt` a `published_at`
   - Cambiar `likes` a `likes_count`
   - Cambiar `comments` a `comments_count`

---

### Paso 4: EJECUTAR RESET Y MASTER DATA SYNC

**USUARIO HARÁ:**
1. Ejecutar `/RESET_COMPLETO.sql` en Supabase para limpiar DB
2. Abrir Dev Tools → Master Data Sync
3. Click en "Sincronizar todos los datos"
4. Verificar que se sincronizan:
   - ✅ 33 cursos (no 9)
   - ✅ Posts del feed social
   - ✅ Comentarios
   - ✅ Blog posts
   - ✅ Todos los demás datos

**Resultado esperado:**
```
✅ 33 cursos sincronizados
✅ 105 módulos sincronizados
✅ 630 lecciones sincronizadas
✅ X posts sincronizados
✅ Y comentarios sincronizados
✅ Z blog posts sincronizados
✅ 2 grupos de estudio
✅ 3 forum posts
✅ 8 badges
✅ 3 challenges
━━━━━━━━━━━━━━━━━━━━━
Total: ~800+ items sincronizados
```

---

## 🚨 RECUERDA

1. **La función RPC solo se crea UNA VEZ** en Supabase
2. **Schema Inspector necesita esa función** para funcionar
3. **Sin los schemas de posts/comments** no puedo arreglar MasterDataSync
4. **Ya arreglé extendedCourses** (de 9 a 33 cursos)

---

## 📝 ESTADO ACTUAL

- ⏳ **Esperando:** Schemas de `posts` y `comments` del Schema Inspector
- ✅ **Listo:** Todo el código del Schema Inspector
- ✅ **Listo:** Documentación completa
- ✅ **Listo:** extendedCourses import corregido

---

**Creado:** 2025-12-24
**Próxima acción:** USUARIO ejecuta función SQL y usa Schema Inspector
