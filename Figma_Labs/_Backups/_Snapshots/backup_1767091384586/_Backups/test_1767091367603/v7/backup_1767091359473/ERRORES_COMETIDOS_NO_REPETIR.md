# 🚨 ERRORES COMETIDOS - NO REPETIR

Este archivo documenta todos los errores que se han cometido en el desarrollo del proyecto Platzi Clone para **NUNCA REPETIRLOS**.

---

## ❌ ERRORES

## ❌ ERROR #1: Intentar alterar columnas UUID a TEXT sin DROP CONSTRAINT primero
**Archivo:** Scripts SQL de migración
**Error:** `ERROR: cannot alter type of a column used by a view or rule`
**Causa:** Intentar `ALTER COLUMN tipo UUID USING tipo::TEXT` sin eliminar las foreign keys primero
**Solución:** DROP CONSTRAINT de todas las FKs antes, ALTER COLUMN, y luego volver a crear las FKs
**Lección:** PostgreSQL no permite alterar tipos de columnas con dependencias activas

## ❌ ERROR #2: Usar tipo UUID cuando Supabase Auth usa TEXT
**Archivo:** Schema de base de datos
**Error:** `ERROR: insert or update on table violates foreign key constraint`
**Causa:** Definir `user_id UUID REFERENCES auth.users(id)` cuando auth.users.id es TEXT
**Solución:** Cambiar TODO a TEXT (55 columnas en total)
**Lección:** Verificar SIEMPRE el tipo de dato real en Supabase antes de crear FKs

## ❌ ERROR #3: JOIN incorrecto profiles(*) en vez de users(*)
**Archivo:** `/src/lib/supabase.ts`
**Error:** `Error: Could not find the relation 'public.profiles' in the schema cache`
**Causa:** Código tenía `.select('*, profiles(*)')` pero la tabla profiles no existe o no tiene la relación esperada
**Solución:** Cambiar a `.select('*, users(*)')` 
**Lección:** Verificar que las relaciones existan en el schema antes de hacer JOINs

## ❌ ERROR #4: Falta de usuario instructor causa violación de NOT NULL
**Archivo:** Scripts SQL de inserción
**Error:** `ERROR: 23502: null value in column "instructor_id" violates not-null constraint`
**Causa:** Intentar insertar cursos sin tener un usuario instructor creado primero
**Solución:** Crear usuario instructor (id='1') ANTES de insertar cursos
**Lección:** Siempre crear los registros padre (users) antes de los hijos (courses con FK a users)

## ❌ ERROR #5: Asumir que existe la función exec_sql en Supabase
**Archivo:** `/src/app/components/MasterDataSync.tsx`
**Error:** `Could not find the function public.exec_sql(sql) in the schema cache`
**Causa:** Intentar ejecutar `supabase.rpc('exec_sql', { sql: '...' })` sin que la función exista
**Solución:** Eliminar completamente la llamada a exec_sql
**Lección:** NO asumir que existen funciones RPC. Verificar primero o usar métodos nativos de Supabase

## ❌ ERROR #6: Intentar insertar en columnas que no existen (duration en modules)
**Archivo:** `/src/app/components/MasterDataSync.tsx`
**Error:** `ERROR: 42703: column "duration" of relation "modules" does not exist`
**Causa:** El código intentaba insertar `duration` en modules basándose en suposiciones
**Solución:** Eliminar la columna duration del INSERT
**Lección:** SIEMPRE verificar el schema real de la tabla antes de insertar datos. NUNCA asumir columnas.

## ❌ ERROR #7: No incluir instructor_id en MasterDataSync al insertar courses
**Archivo:** `/src/app/components/MasterDataSync.tsx`
**Error:** `ERROR: 23502: null value in column "instructor_id" of relation "courses" violates not-null constraint`
**Causa:** El objeto `course` del archivo de datos solo tiene `instructor` (nombre del instructor), pero la tabla courses requiere `instructor_id` (FK a users.id)
**Solución:** Crear primero un usuario instructor por defecto (id='1') y usar ese ID como `instructor_id` para todos los cursos
**Lección:** Cuando los datos frontend no tienen IDs de relaciones, CREAR primero los registros padre (users, profiles) antes de insertar los hijos (courses)

## ❌ ERROR #8: No incluir columna 'instructor' en INSERT de courses
**Archivo:** `/INSERTAR_DATOS_FINAL.sql`
**Error:** `ERROR: 23502: null value in column "instructor" of relation "courses" violates not-null constraint`
**Causa:** La tabla courses tiene DOS columnas: `instructor_id` (FK a users) Y `instructor` (TEXT, NOT NULL) con el nombre del instructor. Solo incluí instructor_id.
**Lección:** La tabla courses almacena TANTO la relación (instructor_id) COMO el nombre denormalizado (instructor) para performance. AMBAS son NOT NULL y deben incluirse en el INSERT.

## ❌ ERROR #9: "Ignorar" datos en vez de arreglar el problema de raíz
**Archivo:** `/src/app/components/MasterDataSync.tsx`
**Error:** Foreign key constraint violation porque `professionalCoursesContent` tiene datos para curso '10' pero `allCourses` no lo tiene
**Mala Solución:** Hacer `if (!existingCourseIds.includes(courseId)) { skip... }`
**Problema:** Esto oculta el problema real: inconsistencia entre archivos de datos
**Lección:** NUNCA "ignorar" datos silenciosamente. Arreglar la raíz del problema o fallar explícitamente con error claro.

## ❌ ERROR #10: Usar allCourses (9 cursos) en vez de extendedCourses (33 cursos)
**Archivo:** `/src/app/components/MasterDataSync.tsx`
**Error:** Solo se sincronizaron 9 cursos en vez de los 33 esperados
**Causa:** El import usaba `import { allCourses } from '../data/courses'` que solo tiene 9 cursos básicos, cuando debería usar `import { extendedCourses } from '../data/extendedCourses'` que tiene los 33 cursos completos
**Solución:** Cambiar a `extendedCourses` que es el array completo de 33 cursos
**Lección:** Verificar SIEMPRE qué archivo de datos contiene la información completa antes de importar

## ❌ ERROR #11: No verificar el schema de las tablas antes de insertar datos
**Archivo:** `/src/app/components/MasterDataSync.tsx`
**Error:** 0 posts, 0 comments, 0 blog_posts sincronizados (silently failed)
**Causa:** Los campos en el código probablemente no coinciden con las columnas reales de las tablas en Supabase
**Pendiente:** Ejecutar `/VERIFICAR_SCHEMA_POSTS.sql` para ver las columnas reales y ajustar el código
**Lección:** SIEMPRE verificar el schema de la tabla antes de insertar. Si hay 0 items sincronizados sin error visible, revisar columnas en el código vs DB

## ❌ ERROR #12: Mismatch entre estructura de datos TypeScript y schema SQL
**Archivos afectados:** 
- `/src/app/data/socialFeed.ts` - FeedPost interface
- `/src/app/data/comments.ts` - Comment interface  
- `/src/app/data/blogPosts.ts` - BlogPost interface
**Problema detectado:**

**POSTS:** Estructura en código tiene:
- `type`, `author{name, avatar, title}`, `content`, `image`, `achievement`, `course`, `createdAt`, `likes`, `comments`, `shares`, `isLiked`

**POSTS:** Schema SQL tiene:
- `id`, `user_id`, `content`, `image_url`, `video_url`, `type`, `likes_count`, `comments_count`, `shares_count`, `views_count`, `created_at`, `updated_at`

**BLOG_POSTS:** Estructura en código tiene:
- `id`, `title`, `excerpt`, `content`, `author{name, avatar, role}`, `category`, `image`, `publishedAt`, `readTime`, `tags`, `likes`, `comments`

**BLOG_POSTS:** Schema SQL tiene (verificado):
- `id`, `author_id`, `title`, `slug`, `excerpt`, `content`, `cover_image_url`, `category`, `tags`, `status`, `views_count`, `likes_count`, `comments_count`, `reading_time`, `published_at`, `created_at`, `updated_at`

**Problemas:**
1. Posts: `author{name,avatar}` debe mapearse a `user_id` (FK)
2. Posts: `image` debe ser `image_url`
3. Posts: `createdAt` debe ser `created_at`
4. Posts: `likes/comments/shares` deben ser `likes_count/comments_count/shares_count`
5. Blog: `author{name,avatar,role}` debe mapearse a `author_id` (FK)
6. Blog: `image` debe ser `cover_image_url`
7. Blog: Falta campo `slug` (debe generarse desde title)
8. Blog: `readTime` debe ser `reading_time`
9. Blog: `publishedAt` debe ser `published_at`
10. Comments: Estructura pendiente de verificar

**Lección:** Los datos TypeScript NO pueden insertarse directamente en SQL. SIEMPRE crear una transformación que mapee:
- Objetos anidados (`author`) a FKs (`author_id`) creando primero el usuario
- Nombres camelCase a snake_case
- Campos que no existen en DB (omitirlos o crearlos en DB primero)

---

## ✅ LO QUE SÍ FUNCIONÓ

### ✅ ÉXITO #1: Script `/ESTO_SI_FUNCIONA.sql`
**Resultado:** Convirtió correctamente las 55 columnas UUID a TEXT sin errores
**Qué hizo bien:** DROP constraints, ALTER columns, re-CREATE constraints en orden correcto
**Fecha:** 2025-12-24

### ✅ ÉXITO #2: Correcciones en `/src/lib/supabase.ts`
**Resultado:** Cambiar `profiles(*)` a `users(*)` eliminó errores de schema cache
**Qué hizo bien:** Usar la relación correcta según el schema real

### ✅ ÉXITO #3: MasterDataSync - Generación automática de slugs
**Resultado:** Todos los slugs se generan correctamente desde títulos con acentos
**Qué hizo bien:** Normalizar, eliminar acentos, convertir a minúsculas, reemplazar espacios

### ✅ ÉXITO #4: MasterDataSync - Crear usuario instructor automáticamente
**Resultado:** Crear usuario instructor (id='1') antes de insertar cursos funciona perfectamente
**Qué hizo bien:** Usar `upsert` con `onConflict: 'id'` para evitar duplicados
**Datos sincronizados:**
- 1 usuario instructor creado automáticamente
- 9 cursos sincronizados exitosamente (⚠️ PROBLEMA: deberían ser 33)
- 35 módulos sincronizados
- 205 lecciones sincronizadas
- 2 grupos de estudio
- 3 posts del foro
- 8 badges
- 3 challenges
- **Total: 265 items sincronizados**
**Fecha:** 2025-12-24

### ✅ ÉXITO #5: Schema Inspector - Sistema interno para ver schemas SQL
**Resultado:** Creado sistema completo para inspeccionar tablas desde la app
**Qué hizo bien:** 
- Componente React completo con UI profesional
- Función RPC SQL para ejecutar queries dinámicas
- Integración en DevTools menu (5to botón)
- Documentación completa en `/GUIA_SCHEMA_INSPECTOR.md`
- Copiar JSON al clipboard
- Inspección individual o todas las tablas
**Componentes creados:**
- `/src/app/components/SchemaInspector.tsx`
- `/CREAR_FUNCION_EXECUTE_SQL.sql`
- `/GUIA_SCHEMA_INSPECTOR.md`
- `/PROXIMOS_PASOS.md`
**Fecha:** 2025-12-24

### ✅ ÉXITO #6: Corrección de extendedCourses en MasterDataSync
**Resultado:** MasterDataSync ahora sincronizará 33 cursos en vez de 9
**Qué hizo bien:** Cambiar import de `allCourses` a `extendedCourses`
**Fecha:** 2025-12-24

### ⚠️ PROBLEMAS PENDIENTES (Esperando schemas de posts/comments):
1. ~~**Solo 9 cursos sincronizados en vez de 33**~~ ✅ RESUELTO - Cambió a extendedCourses
2. **0 posts del feed social sincronizados** - Pendiente: obtener schema de `posts` con Schema Inspector
3. **0 comentarios sincronizados** - Pendiente: obtener schema de `comments` con Schema Inspector
4. **0 blog posts sincronizados** - Pendiente: mapear campos correctamente (ya tengo schema)
5. ~~**Inconsistencia entre `allCourses` y `professionalCoursesContent`**~~ ✅ RESUELTO - Usa extendedCourses ahora

---

## ❌ ERROR #13: Múltiples instancias de GoTrueClient
**Archivo:** `/src/app/components/admin/AutoSetupRunner.tsx`
**Error:** `⚠️ GoTrueClient@sb-bntwyvwavxgspvcvelay-auth-token:2 (2.89.0) Multiple GoTrueClient instances detected`
**Causa:** Crear nuevas instancias de `createClient()` en cada componente
**Solución:** 
```typescript
// ❌ INCORRECTO
import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ✅ CORRECTO
const { supabase } = await import('../../../lib/supabase');
```
**Lección:** SIEMPRE usar el cliente singleton de `/src/lib/supabase`
**Fecha:** 2025-12-25

## ❌ ERROR #14: ReferenceError - useState no definido
**Archivo:** `/src/app/components/admin/DevToolsIntegration.tsx`
**Error:** `ReferenceError: useState is not defined`
**Causa:** Usar hooks sin importarlos
**Solución:**
```typescript
// ✅ Siempre importar hooks al inicio
import { useState, useEffect } from 'react';
```
**Lección:** Verificar que TODOS los hooks de React estén importados
**Fecha:** 2025-12-25

## ❌ ERROR #15: Iconos de lucide-react no importados
**Archivo:** `/src/app/components/admin/DevToolsIntegration.tsx`
**Error:** `ReferenceError: Settings is not defined`, `Eye is not defined`
**Causa:** Usar iconos en JSX sin importarlos
**Solución:**
```typescript
// ✅ Importar todos los iconos usados
import { Settings, Eye, EyeOff, FileText } from 'lucide-react';
```
**Lección:** Verificar que TODOS los iconos usados estén importados
**Fecha:** 2025-12-25

## ❌ ERROR #16: SQL UNION ALL con múltiples SELECT LIMIT
**Archivo:** `/src/app/components/admin/CompleteSetupScript.tsx`
**Error:** `ERROR: 42601: syntax error at or near "UNION" LINE 176`
**SQL Problemático:**
```sql
-- ❌ INCORRECTO - Causa error de sintaxis
INSERT INTO activity_logs (user_id, date, study_time)
SELECT id, CURRENT_DATE - INTERVAL '6 days', 150 FROM profiles LIMIT 1
UNION ALL
SELECT id, CURRENT_DATE - INTERVAL '5 days', 120 FROM profiles LIMIT 1;
```
**Solución:**
```sql
-- ✅ CORRECTO - Usar bloque DO con variables
DO $$
DECLARE
  sample_user_id TEXT;
BEGIN
  SELECT id INTO sample_user_id FROM public.profiles LIMIT 1;
  
  IF sample_user_id IS NOT NULL THEN
    INSERT INTO activity_logs (user_id, date, study_time)
    VALUES
      (sample_user_id, CURRENT_DATE - INTERVAL '6 days', 150),
      (sample_user_id, CURRENT_DATE - INTERVAL '5 days', 120)
    ON CONFLICT (user_id, date) DO UPDATE ...
  END IF;
END $$;
```
**Lección:** Para insertar múltiples filas basadas en datos de otras tablas:
- ✅ Usar bloques `DO $$ ... END $$;` con variables `DECLARE`
- ✅ Obtener IDs una sola vez con `SELECT ... INTO variable`
- ✅ Usar `VALUES (...), (...), (...)` para múltiples filas
- ❌ NUNCA usar `UNION ALL` con múltiples `SELECT ... LIMIT`
**Fecha:** 2025-12-25

## ❌ ERROR #17: Script SQL dice "Success" pero no crea índices/triggers
**Archivo:** Complete Setup Script ejecutado en SQL Editor
**Error:** Script ejecuta sin error ("Success. No rows returned") pero los índices y triggers no se crean
**Causa:** Los comandos `CREATE INDEX IF NOT EXISTS` y `CREATE TRIGGER` devuelven "Success" AUNQUE no tengan efecto, y "No rows returned" es el resultado CORRECTO porque son DDL statements (no devuelven filas)
**Problema:** Imposible saber si funcionó solo mirando "Success" - necesitas verificar con queries separadas
**Solución:**
```sql
-- Para verificar índices:
SELECT tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('activity_logs', 'deadlines', 'study_sessions')
  AND schemaname = 'public';

-- Para verificar triggers:
SELECT tgname as trigger_name, tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgname IN ('trigger_update_activity_log', 'trigger_update_user_xp', 'trigger_update_deadline_status');
```
**Lección:** 
- ✅ "Success. No rows returned" en DDL es NORMAL y esperado
- ✅ Crear siempre un script de verificación separado
- ✅ Usar queries a pg_indexes, pg_trigger, pg_policies para confirmar
- ❌ NO asumir que "Success" significa que se creó correctamente
**Fecha:** 2025-12-25

---

## ❌ ERROR #18: SQL Executor que NO ejecuta queries realmente
**Archivo:** `/src/app/components/admin/AdvancedSQLExecutor.tsx`
**Error:** El executor dice "Success" pero devuelve `{"success":true, "message":"Query executed successfully"}` en vez de los resultados reales
**Causa:** La función `exec_sql` por defecto NO devuelve resultados de SELECT - solo devuelve un mensaje genérico
**SQL Problemático:**
```typescript
// ❌ INCORRECTO - Esta función solo ejecuta pero no devuelve datos
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS json AS $$
BEGIN
  EXECUTE query;
  RETURN json_build_object('success', true, 'message', 'Query executed successfully');
END;
$$;
```
**Solución:**
```sql
-- ✅ CORRECTO - Devuelve resultados reales de SELECT
CREATE OR REPLACE FUNCTION public.exec_sql(query_text text)
RETURNS json AS $$
DECLARE
  rec record;
  result_array json[] := '{}';
BEGIN
  -- Para SELECT, devolver filas como JSON array
  IF TRIM(UPPER(query_text)) LIKE 'SELECT%' THEN
    FOR rec IN EXECUTE query_text LOOP
      result_array := array_append(result_array, row_to_json(rec));
    END LOOP;
    RETURN array_to_json(result_array);
  ELSE
    -- Para DDL/DML solo ejecutar y devolver éxito
    EXECUTE query_text;
    RETURN json_build_object('success', true, 'message', 'Query ejecutado correctamente');
  END IF;
END;
$$;
```
**Lección:** 
- ✅ Para ejecutar SQL desde la app necesitas crear una función custom en Supabase
- ✅ La función debe detectar tipo de query (SELECT vs DDL/DML)
- ✅ Para SELECT usar EXECUTE con LOOP y row_to_json() para devolver datos
- ✅ Para DDL/DML solo ejecutar y devolver mensaje de éxito
- ✅ SIEMPRE probar con query simple primero para verificar que devuelve datos reales
- ❌ NO asumir que exec_sql existe o funciona correctamente
**Fecha:** 2025-12-25

---

## 📋 REGLAS DE ORO

1. ✅ **SIEMPRE verificar el schema real antes de escribir SQL**
2. ✅ **SIEMPRE crear registros padre antes de hijos (respeto a FKs)**
3. ✅ **SIEMPRE usar UPSERT en vez de INSERT para evitar duplicados**
4. ✅ **NUNCA asumir que columnas/funciones/relaciones existen**
5. ✅ **DOCUMENTAR TODO: éxitos y errores**
6. ✅ **NUNCA "ignorar" datos silenciosamente - arreglar la raíz del problema**
7. ✅ **Fallar explícitamente con mensajes claros en vez de skip silencioso**

---

**Fecha de creación:** 2025-12-24
**Última actualización:** 2025-12-25
**Propósito:** Evitar repetir los mismos errores estúpidos una y otra vez