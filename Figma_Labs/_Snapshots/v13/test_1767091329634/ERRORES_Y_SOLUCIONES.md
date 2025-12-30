# 📝 Registro de Errores y Problemas - Activity Tracking Setup

## Fecha: 25 de Diciembre, 2024

---

## 🔴 Error #1: Múltiples instancias de GoTrueClient

### Problema:
```
⚠️ GoTrueClient@sb-bntwyvwavxgspvcvelay-auth-token:2 (2.89.0) Multiple GoTrueClient 
instances detected in the same browser context
```

### Causa:
Estábamos creando nuevas instancias de `createClient()` en cada componente en lugar de usar el cliente singleton compartido.

### Solución:
```typescript
// ❌ INCORRECTO - Crea múltiples instancias
import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ✅ CORRECTO - Usa el cliente singleton
const { supabase } = await import('../../../lib/supabase');
```

### Archivos Afectados:
- `/src/app/components/admin/AutoSetupRunner.tsx`
- Cualquier componente que necesite acceso a Supabase

### Lección Aprendida:
**SIEMPRE usar el cliente singleton de `/src/lib/supabase` en lugar de crear nuevas instancias.**

---

## 🔴 Error #2: ReferenceError - useState no definido

### Problema:
```
ReferenceError: useState is not defined
```

### Causa:
Faltaba el import de React hooks en el componente padre `DevToolsIntegration.tsx`.

### Solución:
```typescript
// ✅ CORRECTO - Importar useState al inicio del archivo
import { useState } from 'react';
```

### Archivos Afectados:
- `/src/app/components/admin/DevToolsIntegration.tsx`

### Lección Aprendida:
**Siempre verificar que todos los hooks de React estén importados antes de usarlos.**

---

## 🔴 Error #3: ReferenceError - Iconos de Lucide no definidos

### Problema:
```
ReferenceError: Settings is not defined
ReferenceError: Eye is not defined
ReferenceError: EyeOff is not defined
```

### Causa:
Los iconos se estaban usando en el código pero no estaban importados desde `lucide-react`.

### Solución:
```typescript
// ✅ CORRECTO - Importar todos los iconos necesarios
import { 
  Database, 
  Code, 
  FileJson, 
  RefreshCw, 
  Trash2, 
  Terminal, 
  CheckCircle, 
  Wand2, 
  Zap, 
  PlayCircle, 
  SearchCheck, 
  FileCode, 
  Settings,    // ← Estos faltaban
  Eye,         // ← 
  EyeOff,      // ← 
  FileText     // ← 
} from 'lucide-react';
```

### Archivos Afectados:
- `/src/app/components/admin/DevToolsIntegration.tsx`

### Lección Aprendida:
**Verificar que TODOS los iconos de lucide-react que se usan en el JSX estén importados.**

---

## 🔴 Error #4: SQL Syntax Error - UNION ALL con múltiples LIMIT

### Problema:
```sql
Error: Failed to run sql query: ERROR: 42601: syntax error at or near "UNION" LINE 176
```

### SQL Problemático:
```sql
-- ❌ INCORRECTO - Múltiples SELECT con LIMIT causan error de sintaxis
INSERT INTO public.activity_logs (user_id, date, study_time, xp_earned)
SELECT id, CURRENT_DATE - INTERVAL '6 days', 150, 150 FROM public.profiles LIMIT 1
UNION ALL
SELECT id, CURRENT_DATE - INTERVAL '5 days', 120, 120 FROM public.profiles LIMIT 1
UNION ALL
SELECT id, CURRENT_DATE - INTERVAL '4 days', 180, 200 FROM public.profiles LIMIT 1;
```

### Causa:
PostgreSQL no maneja bien múltiples `SELECT ... LIMIT 1` con `UNION ALL` en este contexto. Cada SELECT intenta tomar 1 fila de la misma tabla, lo cual causa ambigüedad sintáctica.

### Solución:
```sql
-- ✅ CORRECTO - Usar bloque DO con variables
DO $$
DECLARE
  sample_user_id TEXT;
BEGIN
  -- Obtener el ID del usuario una sola vez
  SELECT id INTO sample_user_id FROM public.profiles LIMIT 1;
  
  IF sample_user_id IS NOT NULL THEN
    -- Insertar múltiples filas usando la variable
    INSERT INTO public.activity_logs (user_id, date, study_time, xp_earned)
    VALUES
      (sample_user_id, CURRENT_DATE - INTERVAL '6 days', 150, 150),
      (sample_user_id, CURRENT_DATE - INTERVAL '5 days', 120, 120),
      (sample_user_id, CURRENT_DATE - INTERVAL '4 days', 180, 200)
    ON CONFLICT (user_id, date) DO UPDATE
    SET 
      study_time = EXCLUDED.study_time,
      xp_earned = EXCLUDED.xp_earned;
  END IF;
END $$;
```

### Archivos Afectados:
- `/src/app/components/admin/CompleteSetupScript.tsx`

### Lección Aprendida:
**Cuando necesites insertar múltiples filas basadas en datos de otras tablas:**
1. ✅ Usa bloques `DO $$ ... END $$;` con variables `DECLARE`
2. ✅ Obtén los IDs necesarios una sola vez con `SELECT ... INTO variable`
3. ✅ Usa `VALUES (...), (...), (...)` para insertar múltiples filas
4. ❌ NUNCA uses `UNION ALL` con múltiples `SELECT ... LIMIT` para inserciones

---

## 📚 Mejores Prácticas Identificadas

### 1. **Manejo de Cliente Supabase**
- ✅ Usar siempre el cliente singleton de `/src/lib/supabase`
- ❌ Nunca crear nuevas instancias con `createClient()` en componentes

### 2. **Imports en React**
- ✅ Verificar que todos los hooks estén importados (`useState`, `useEffect`, etc.)
- ✅ Verificar que todos los iconos de lucide-react estén importados
- ✅ Mantener los imports organizados al inicio del archivo

### 3. **SQL en PostgreSQL**
- ✅ Usar bloques `DO $$ ... END $$;` para lógica compleja
- ✅ Declarar variables con `DECLARE` para reutilizar valores
- ✅ Usar `VALUES` para insertar múltiples filas
- ❌ Evitar `UNION ALL` con múltiples `SELECT ... LIMIT` en inserciones

### 4. **Verificación de Setup**
- ✅ Crear verificadores automáticos para confirmar que todo funciona
- ✅ Proporcionar mensajes de error claros y específicos
- ✅ Incluir instrucciones paso a paso para el usuario

---

## 🎯 Checklist Pre-Deploy

Antes de enviar cualquier script SQL o componente, verificar:

- [ ] Todos los imports de React hooks están presentes
- [ ] Todos los iconos de lucide-react están importados
- [ ] Se usa el cliente Supabase singleton (no `createClient()`)
- [ ] Los scripts SQL usan bloques `DO $$` para insertar datos
- [ ] Las variables se declaran con `DECLARE` antes de usarse
- [ ] Los scripts SQL se prueban en el SQL Editor antes de automatizar
- [ ] Hay manejo de errores apropiado (`try/catch`)
- [ ] Los mensajes de error son claros y accionables

---

## 📊 Resumen de Errores

| Error | Tipo | Severidad | Tiempo de Resolución | Estado |
|-------|------|-----------|---------------------|--------|
| Múltiples GoTrueClient | Runtime | Media | ~5 min | ✅ Resuelto |
| useState no definido | Syntax | Alta | ~2 min | ✅ Resuelto |
| Iconos no definidos | Syntax | Alta | ~3 min | ✅ Resuelto |
| SQL UNION ALL | SQL Syntax | Alta | ~10 min | ✅ Resuelto |

**Total de errores encontrados:** 4  
**Total de errores resueltos:** 4 ✅  
**Tasa de éxito:** 100%

---

## 🔮 Prevención Futura

Para evitar estos errores en el futuro:

1. **Template de Componente React**
```typescript
import { useState, useEffect } from 'react';
import { IconName1, IconName2 } from 'lucide-react';

export function ComponentName() {
  // Component logic here
}
```

2. **Template de SQL para Insertar Datos**
```sql
DO $$
DECLARE
  variable_name TYPE;
BEGIN
  SELECT column INTO variable_name FROM table LIMIT 1;
  
  IF variable_name IS NOT NULL THEN
    INSERT INTO target_table (columns)
    VALUES
      (value1, value2),
      (value3, value4)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
```

3. **Template de Acceso a Supabase**
```typescript
// En componentes
const { supabase } = await import('../../../lib/supabase');

// Nunca hacer esto:
// const supabase = createClient(url, key); ❌
```

---

**Documento creado:** 25 de Diciembre, 2024  
**Última actualización:** 25 de Diciembre, 2024  
**Mantenido por:** Sistema de Activity Tracking - Clon de Platzi
