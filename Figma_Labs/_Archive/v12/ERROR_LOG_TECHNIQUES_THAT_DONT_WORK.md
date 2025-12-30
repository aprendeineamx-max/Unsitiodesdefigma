# 🚫 REGISTRO DE ERRORES Y TÉCNICAS QUE NO FUNCIONAN

**Propósito:** Este documento registra todos los errores cometidos y técnicas que NO funcionan en el entorno de Supabase/Figma Make para evitar repetirlos en el futuro.

---

## 📋 Índice
1. [Ejecución de SQL](#ejecución-de-sql)
2. [Funciones RPC](#funciones-rpc)
3. [Permisos y Autenticación](#permisos-y-autenticación)
4. [Row Level Security](#row-level-security)

---

## 🚫 Ejecución de SQL

### ❌ ERROR 1: Intentar usar `supabase.rpc('exec_sql')`  sin crear la función primero

**Fecha:** 25 de Diciembre, 2024

**Técnica que no funciona:**
```typescript
const { data, error } = await supabase.rpc('exec_sql', { query: sql });
```

**Por qué falla:**
- La función RPC `exec_sql` NO existe por defecto en Supabase
- Intentar llamarla resulta en error: `function exec_sql does not exist`
- No se puede asumir que funciones custom existen

**Impacto:**
- 🔴 CRÍTICO - El SQL Executor no funciona sin esta función
- ⚙️ Requiere setup manual en Supabase SQL Editor

**Solución aplicada:**
1. Crear la función `exec_sql` manualmente en Supabase:
```sql
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE query INTO result;
  RETURN result;
END;
$$;
```

2. O usar verificación de tablas con SELECT queries directas
```typescript
const { data, error } = await supabase
  .from(tableName)
  .select('*')
  .limit(0);
```

**Lección aprendida:**
- ✅ **SIEMPRE verificar** que funciones RPC existan antes de llamarlas
- ✅ **Proveer instrucciones claras** para crear funciones faltantes
- ✅ **Usar alternativas** como queries SELECT para verificación

---

### ❌ ERROR 2: Ejecutar DDL (CREATE TABLE) sin permisos de SECURITY DEFINER

**Fecha:** 25 de Diciembre, 2024

**Técnica que no funciona:**
```typescript
// Desde el cliente con anon key
await supabase.from(...).insert({ ... }) // ✅ Funciona
await supabase.rpc('exec_sql', {
  query: 'CREATE TABLE ...'
}) // ❌ Falla - insufficient permissions
```

**Por qué falla:**
- La `anon key` NO tiene permisos para crear tablas
- Solo `service_role key` puede ejecutar DDL
- Las funciones RPC deben tener `SECURITY DEFINER` para elevar privilegios

**Impacto:**
- 🔴 CRÍTICO - No se pueden crear tablas desde el frontend
- ⚙️ Requiere acceso al Supabase SQL Editor

**Solución aplicada:**
- Documentar que los scripts deben ejecutarse en **Supabase SQL Editor**
- Proveer botones en DevTools que solo **copian** el SQL
- Crear componente `SQLVerification` que solo **verifica** (SELECT) las tablas

**Lección aprendida:**
- ✅ **NO intentar** ejecutar DDL desde el frontend con anon key
- ✅ **Guiar al usuario** a usar Supabase SQL Editor para DDL
- ✅ **Separar responsabilidades:** Frontend = Queries, Backend = Schema changes

---

## 🚫 Funciones RPC

### ❌ ERROR 3: Asumir que supabase.rpc() puede ejecutar SQL arbitrario

**Fecha:** 25 de Diciembre, 2024

**Técnica que no funciona:**
```typescript
// Intentar ejecutar cualquier SQL directamente
await supabase.rpc('anything', { query: 'DROP TABLE...' })
```

**Por qué falla:**
- `supabase.rpc()` solo llama a **funciones definidas en PostgreSQL**
- No es un ejecutor de SQL arbitrario
- Cada función debe ser creada explícitamente

**Impacto:**
- 🟡 MEDIO - Confusión sobre capacidades del cliente de Supabase

**Solución aplicada:**
- Documentar la necesidad de crear funciones RPC
- Proveer scripts SQL completos para copiar/pegar
- Crear interfaz que muestre el SQL claramente

**Lección aprendida:**
- ✅ **RPC != SQL executor** - Solo llama funciones predefinidas
- ✅ **Cada función RPC** debe ser creada en PostgreSQL primero
- ✅ **Documentar claramente** qué funciones están disponibles

---

## 🚫 Permisos y Autenticación

### ❌ ERROR 4: Intentar verificar tablas sin políticas RLS configuradas

**Fecha:** 25 de Diciembre, 2024

**Técnica que no funciona:**
```typescript
// Sin estar autenticado o sin políticas RLS
const { data, error } = await supabase
  .from('user_progress') // Tabla con RLS activado
  .select('*'); // ❌ Falla si no hay session o políticas
```

**Por qué falla:**
- Si RLS está activado y no hay políticas, **todas las queries fallan**
- Si no hay sesión activa, queries con `auth.uid()` retornan vacío
- Diferentes para tablas públicas vs privadas

**Impacto:**
- 🟡 MEDIO - Dificulta verificación de tablas

**Solución aplicada:**
- Verificar tablas con `limit(0)` que no requiere leer datos
- Documentar que algunas tablas requieren autenticación
- Mostrar mensajes claros cuando falta autenticación

**Lección aprendida:**
- ✅ **RLS puede bloquear** incluso SELECT queries
- ✅ **Usar limit(0)** para verificar estructura sin datos
- ✅ **Verificar sesión** antes de queries que requieren auth

---

## 🚫 Row Level Security

### ❌ ERROR 5: Activar RLS sin crear políticas primero

**Fecha:** 25 de Diciembre, 2024

**Técnica que no funciona:**
```sql
-- Solo activar RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
-- Sin crear políticas -> NADIE puede acceder a la tabla
```

**Por qué falla:**
- RLS sin políticas = **acceso denegado a todos**
- Incluso el owner no puede hacer SELECT
- Las políticas deben crearse **antes o inmediatamente después** de activar RLS

**Impacto:**
- 🔴 CRÍTICO - Bloquea completamente el acceso a la tabla

**Solución aplicada:**
- Crear políticas inmediatamente después de `ENABLE ROW LEVEL SECURITY`
- Agrupar en el mismo script: ALTER TABLE + CREATE POLICY
- Documentar el orden correcto de ejecución

**Lección aprendida:**
- ✅ **Nunca activar RLS** sin crear políticas inmediatamente
- ✅ **Agrupar en un script:** ENABLE RLS + CREATE POLICIES
- ✅ **Probar con usuario test** después de activar RLS

---

## 📊 Resumen de Errores por Categoría

| Categoría | Errores | Impacto |
|-----------|---------|---------|
| Ejecución de SQL | 2 | 🔴 CRÍTICO |
| Funciones RPC | 1 | 🟡 MEDIO |
| Permisos | 1 | 🟡 MEDIO |
| RLS | 1 | 🔴 CRÍTICO |
| **TOTAL** | **5** | - |

---

## 🎯 Principios Generales para EVITAR Errores

### 1. **Verificar antes de asumir**
- ❌ NO asumir que funciones RPC existen
- ✅ Verificar con `supabase.rpc('function_name').then().catch()`

### 2. **Separar frontend y backend**
- ❌ NO ejecutar DDL desde frontend con anon key
- ✅ Usar Supabase SQL Editor para schema changes

### 3. **RLS requiere políticas**
- ❌ NO activar RLS sin políticas
- ✅ Crear políticas en el mismo script

### 4. **Documentar limitaciones**
- ❌ NO ocultar que algunas cosas requieren setup manual
- ✅ Proveer instrucciones claras y completas

### 5. **Proveer alternativas**
- ❌ NO depender de una sola técnica
- ✅ Ofrecer múltiples caminos (RPC, SQL Editor, verificación)

---

## 🔄 Proceso de Actualización

**Este documento debe actualizarse:**
- ✅ Cada vez que un error nuevo ocurre
- ✅ Cuando se descubre una técnica que NO funciona
- ✅ Al encontrar limitaciones de Supabase/PostgreSQL

**Formato para nuevos errores:**
```markdown
### ❌ ERROR X: [Título descriptivo]

**Fecha:** [Fecha]

**Técnica que no funciona:**
[Código de ejemplo]

**Por qué falla:**
- [Razón 1]
- [Razón 2]

**Impacto:**
- 🔴/🟡/🟢 [CRÍTICO/MEDIO/BAJO] - [Descripción]

**Solución aplicada:**
[Solución implementada]

**Lección aprendida:**
- ✅ [Principio 1]
- ✅ [Principio 2]
```

---

**Última actualización:** 25 de Diciembre, 2024  
**Total de errores registrados:** 5  
**Estado:** 🔄 Documento vivo - Se actualiza continuamente
