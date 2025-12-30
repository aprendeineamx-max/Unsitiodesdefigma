# 🚀 Instrucciones para Configurar Activity Tracking

## ⚠️ PASO CRÍTICO PRIMERO

Antes de usar cualquier herramienta automática, **DEBES ejecutar esto en el SQL Editor de Supabase**:

### 1. Ve al Dashboard de Supabase
- URL: https://supabase.com/dashboard/project/bntwyvwavxgspvcvelay/sql/new
- O desde tu dashboard: **SQL Editor** → **New Query**

### 2. Copia y pega este SQL:

```sql
-- =====================================================
-- CREAR FUNCIÓN EXEC_SQL (REQUERIDA)
-- =====================================================
-- Esta función permite ejecutar SQL arbitrario desde la aplicación
-- NOTA: Solo funciona con Service Role Key

CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE query;
  RETURN json_build_object('success', true, 'message', 'Query executed successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Dar permisos a la función
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;
```

### 3. Click en **RUN** o presiona `Ctrl+Enter`

### 4. Verifica que veas: "Success. No rows returned"

---

## 🎯 Ahora Sí - Usa el One-Click Setup

Una vez que hayas creado la función `exec_sql`:

1. Ve a **Admin Panel** (menú de perfil)
2. Click en **Dev Tools**
3. Click en **"One-Click Setup"** (tarjeta verde con ícono ▶️)
4. Click en **"🚀 Ejecutar Setup Completo"**
5. ¡Espera y observa la magia! ✨

---

## ✅ ¿Qué hace el One-Click Setup?

1. ✅ **Detecta automáticamente** el tipo de datos de `profiles.id` (TEXT o UUID)
2. ✅ **Crea las 3 tablas** ajustando los tipos dinámicamente:
   - `activity_logs` - Tracking diario de actividad
   - `deadlines` - Plazos y tareas
   - `study_sessions` - Sesiones de estudio
3. ✅ **Crea índices** para mejor performance
4. ✅ **Crea triggers automáticos** para actualizar XP y actividad
5. ✅ **Configura RLS** (Row Level Security) con políticas correctas
6. ✅ **Inserta datos de ejemplo** para testing inmediato

---

## 🔧 Alternativa Manual (Si prefieres hacerlo paso a paso)

### Opción A: Usando el SQL Executor en la app

1. Ve a **Admin Panel** → **Dev Tools** → **SQL Executor**
2. Click en la tab **"Configuración"**
3. Ejecuta los scripts en este orden:
   - ✅ "📊 Activity Tracking Schema"
   - "🔍 Create Indexes"
   - "⚡ Create Triggers"
   - "🔒 Enable RLS"
   - "📝 Sample Activity Data"
   - "⏰ Sample Deadlines"

### Opción B: Directo en Supabase SQL Editor

Ve al SQL Editor y ejecuta todos los scripts de `/sql_scripts/` en orden.

---

## 💡 Notas Importantes

- El sistema usa **Service Role Key** para tener permisos totales
- Auto-detecta si `profiles.id` es TEXT o UUID y ajusta todo automáticamente
- Los datos de ejemplo cubren los últimos 7 días de actividad
- Se crean 5 deadlines de prueba con diferentes prioridades

---

## 🆘 ¿Problemas?

Si algo falla:
1. Verifica que la función `exec_sql` esté creada
2. Revisa los mensajes de error en el One-Click Setup
3. Cada paso muestra detalles del error si algo sale mal
4. Puedes re-ejecutar el setup sin problemas (usa `CREATE IF NOT EXISTS`)

---

¡Listo! Una vez completado el setup, tu sistema de Activity Tracking estará 100% funcional. 🎉
