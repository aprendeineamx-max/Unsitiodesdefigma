# 📖 GUÍA DE USO - Schema Inspector

## ⚠️ CONFIGURACIÓN INICIAL (SOLO UNA VEZ)

Antes de usar el **Schema Inspector**, debes crear la función RPC en Supabase. Esto solo se hace UNA VEZ.

### Paso 1: Ejecutar función en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Abre el **SQL Editor** (icono de base de datos en el menú izquierdo)
3. Copia y pega el contenido del archivo `/CREAR_FUNCION_EXECUTE_SQL.sql`
4. Haz clic en **RUN** (▶️)
5. Deberías ver: **Success. No rows returned**

### Código de la función (ya está en `/CREAR_FUNCION_EXECUTE_SQL.sql`):

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

-- Dar permisos
GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon;
```

---

## ✅ USO DEL SCHEMA INSPECTOR

### Paso 1: Abrir la herramienta

1. En la aplicación, haz clic en el botón **🛠️ Dev Tools** (abajo izquierda)
2. Selecciona **"Schema Inspector"** (icono 👁️ verde)

### Paso 2: Inspeccionar tablas

Tienes dos opciones:

#### Opción A: Inspeccionar todas las tablas
- Haz clic en **"Inspeccionar Todas las Tablas"**
- Espera a que se carguen todas (puede tardar ~5-10 segundos)
- Verás 14 tablas con sus columnas

#### Opción B: Inspeccionar tablas individuales
- Haz clic en el botón de la tabla específica que necesitas
- Por ejemplo: `posts`, `comments`, `blog_posts`
- Se cargará solo esa tabla

### Paso 3: Ver los resultados

Para cada tabla verás:
- **Nombre de la columna** (column_name)
- **Tipo de dato** (data_type)
- **Si acepta NULL** (is_nullable)

### Paso 4: Copiar datos

Cada tabla tiene un botón **"Copiar JSON"**:
- Copia el schema completo en formato JSON
- Úsalo para documentar o debuggear

---

## 🎯 EJEMPLO DE USO: Ver schema de posts y comments

```
1. Abrir Dev Tools (🛠️)
2. Click en "Schema Inspector"
3. Click en botón "posts"
4. Click en botón "comments"
5. Copiar JSON de ambas tablas
6. Usar esa info para arreglar MasterDataSync
```

---

## 🚨 ERRORES COMUNES

### Error: "Could not find the function public.execute_sql"

**Causa:** No ejecutaste el script `/CREAR_FUNCION_EXECUTE_SQL.sql` en Supabase

**Solución:**
1. Ve a Supabase SQL Editor
2. Ejecuta el script completo
3. Verifica que dice "Success"
4. Recarga la página de tu app
5. Intenta de nuevo

### Error: "permission denied for function execute_sql"

**Causa:** Falta ejecutar los permisos GRANT

**Solución:**
```sql
GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon;
```

---

## 📋 TABLAS DISPONIBLES

El Schema Inspector puede inspeccionar estas 14 tablas:

1. **posts** - Posts del feed social
2. **comments** - Comentarios en posts/blog
3. **blog_posts** - Artículos del blog
4. **users** - Usuarios del sistema
5. **courses** - Cursos disponibles
6. **modules** - Módulos de los cursos
7. **lessons** - Lecciones de los módulos
8. **badges** - Insignias de gamificación
9. **challenges** - Retos del sistema
10. **study_groups** - Grupos de estudio
11. **forum_posts** - Posts del foro
12. **enrollments** - Inscripciones a cursos
13. **user_progress** - Progreso de usuarios
14. **profiles** - Perfiles de usuario (si existe)

---

## 💡 VENTAJAS

✅ **No necesitas salir de la app** - Todo desde el Dev Tools
✅ **Ver schemas en tiempo real** - Siempre actualizado con tu DB
✅ **Copiar JSON fácilmente** - Para documentar o debuggear
✅ **Inspección selectiva** - Solo las tablas que necesitas
✅ **Visual y claro** - Tabla formateada con colores

---

**Fecha de creación:** 2025-12-24
**Última actualización:** 2025-12-24
