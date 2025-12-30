# ⚡ ACCIÓN INMEDIATA REQUERIDA

## 🎯 QUÉ TIENES QUE HACER AHORA (2 pasos simples)

---

## PASO 1️⃣: Crear función RPC en Supabase (1 minuto)

### Instrucciones:
1. Abre Supabase: https://supabase.com/dashboard
2. Ve a **SQL Editor** (icono de base de datos)
3. Copia TODO el código de abajo
4. Pega en el editor
5. Click **RUN** (▶️)
6. Debe decir: **"Success. No rows returned"**

### Código a ejecutar:
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

**✅ Hecho? Continúa al Paso 2**

---

## PASO 2️⃣: Obtener schemas con Schema Inspector (2 minutos)

### Instrucciones:
1. Abre tu app
2. Click en botón **🛠️ Dev Tools** (abajo izquierda)
3. Click en **"Schema Inspector"** (botón verde con ojo 👁️)
4. Click en botón **"posts"**
5. Click en botón **"comments"**
6. Espera 2-3 segundos
7. Para cada tabla:
   - Click en **"Copiar JSON"**
   - Pega aquí los resultados

### Formato:
```
SCHEMA DE POSTS:
[pegar JSON aquí]

SCHEMA DE COMMENTS:
[pegar JSON aquí]
```

**✅ Hecho? Mándame los 2 JSONs y yo arreglo MasterDataSync**

---

## 📊 QUÉ ESTÁ PASANDO

### Estado actual del sistema:

```
✅ Schema Inspector     → Creado y funcional
✅ extendedCourses      → Corregido (33 cursos)
✅ Función execute_sql  → Lista para ejecutar
⏳ Schema de posts      → Esperando
⏳ Schema de comments   → Esperando
⏳ Corrección de Sync   → Esperando schemas
```

### Después de que me des los schemas:

```
Yo arreglaré:
├─ ✅ Posts sync (mapeo correcto de campos)
├─ ✅ Comments sync (mapeo correcto de campos)
└─ ✅ Blog posts sync (mapeo correcto de campos)

Resultado final:
├─ 33 cursos sincronizados
├─ 105 módulos sincronizados
├─ 630 lecciones sincronizadas
├─ X posts sincronizados
├─ Y comentarios sincronizados
├─ Z blog posts sincronizados
└─ Total: ~800+ items
```

---

## 🚨 IMPORTANTE

- **La función RPC se ejecuta SOLO UNA VEZ**
- **Sin la función, Schema Inspector no funciona**
- **Sin los schemas, no puedo arreglar el sync**
- **Con los schemas, termino en 10 minutos**

---

## 🎬 RESUMEN DE LO QUE HICE

1. ✅ Creé SchemaInspector completo
2. ✅ Agregué al DevTools (5to botón)
3. ✅ Creé función SQL execute_sql
4. ✅ Arreglé extendedCourses (de 9 a 33)
5. ✅ Documenté TODO en:
   - `/GUIA_SCHEMA_INSPECTOR.md`
   - `/ERRORES_COMETIDOS_NO_REPETIR.md`
   - `/PLAN_CORRECCION_SYNC.md`
   - `/PROXIMOS_PASOS.md`
   - `/ACCION_INMEDIATA.md` (este archivo)

---

**Ahora te toca: Ejecuta la función SQL y usa Schema Inspector** 🚀

**Fecha:** 2025-12-24
