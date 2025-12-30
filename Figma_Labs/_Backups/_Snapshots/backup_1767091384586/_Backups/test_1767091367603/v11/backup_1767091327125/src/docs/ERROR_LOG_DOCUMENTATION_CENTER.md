# ❌ ERROR LOG - Técnicas que NO Funcionan

**Propósito:** Documentar errores comunes, anti-patterns y técnicas que fallaron para evitar repetirlos.

**Última actualización:** 27 de Diciembre, 2024

---

## 📋 ÍNDICE

1. [Dynamic Imports sin Default Export](#dynamic-imports-sin-default-export)
2. [Supabase Keys](#supabase-keys)

---

## ❌ Dynamic Imports sin Default Export

### ❌ ERROR: TypeError al cargar módulos dinámicamente

**Fecha:** 27 de Diciembre, 2024  
**Componente:** CourseDetail.tsx, CourseModules.tsx  
**Severidad:** 🔴 CRÍTICO - App no carga

**Error exacto:**
```
TypeError: error loading dynamically imported module: 
https://app-...figma.site/src/app/components/CourseDetail.tsx?t=1766830172791
```

**Código que causó el error:**

```typescript
// ❌ INCORRECTO - Solo named export
export function CourseDetail({ course, onBack }: CourseDetailProps) {
  return <div>...</div>;
}

// En App.tsx con import dinámico
const module = await import('./components/CourseDetail.tsx?t=123');
const Component = module.CourseDetail; // ⚠️ Puede ser undefined
```

**Por qué falló:**

1. Figma Make usa **dynamic imports** con cache-busting timestamps
2. Módulos con solo **named exports** pueden fallar en algunos bundlers
3. `module.CourseDetail` puede ser undefined dependiendo del bundler
4. El parámetro de query `?t=timestamp` complica la resolución del módulo

**Solución correcta:**

```typescript
// ✅ CORRECTO - Named + Default export
export function CourseDetail({ course, onBack }: CourseDetailProps) {
  return <div>...</div>;
}

export default CourseDetail;

// Ahora el import dinámico siempre funciona
const module = await import('./components/CourseDetail.tsx?t=123');
const Component = module.default; // ✅ Siempre definido
```

**Lección aprendida:**

- ✅ Siempre agregar **default export** a componentes React
- ✅ Mantener **named export** para compatibilidad
- ✅ Dual exports (named + default) = máxima compatibilidad
- ❌ NUNCA confiar solo en named exports para componentes

**Aplicar a:**
- Todos los componentes React del proyecto
- Especialmente componentes usados en rutas dinámicas
- Componentes que pueden ser lazy-loaded

**Ver documentación completa:** `/src/docs/FIX_DYNAMIC_IMPORT_ERROR.md`

---

## ❌ Supabase Keys - Usar Anon Key para Admin Operations

### ❌ ERROR: Permission denied en Storage operations

**Fecha:** 27 de Diciembre, 2024  
**Componente:** FileManager.tsx  
**Severidad:** 🔴 CRÍTICO - Funcionalidad no disponible

**Error exacto:**
```
Error: new row violates row-level security policy for table "document_manifest"
Error: permission denied for storage bucket "documentation"
Error: You do not have permission to delete this object
```

**Código que causó el error:**

```typescript
// ❌ INCORRECTO - Usando anon key para admin operations
import { supabase } from '../../../lib/supabase'; // anon key

await supabase.storage
  .from('documentation')
  .upload(filePath, file); // ❌ FALLA por RLS

await supabase.from('document_manifest').upsert({...}); // ❌ FALLA por RLS
```

**Por qué falló:**

1. **Anon key** tiene permisos limitados por RLS (Row Level Security)
2. Storage operations de admin requieren **bypass de RLS**
3. FileManager es una herramienta administrativa, no una feature de usuario
4. Policies de RLS bloquean operaciones sin autenticación

**Solución correcta:**

```typescript
// ✅ CORRECTO - Usar service_role_key para admin
import { supabaseAdmin } from '../../../lib/supabase'; // service_role key

await supabaseAdmin.storage
  .from('documentation')
  .upload(filePath, file); // ✅ FUNCIONA con bypass RLS

await supabaseAdmin.from('document_manifest').upsert({...}); // ✅ FUNCIONA
```

**Diferencias:**

| Operación | Anon Key | Service Role Key |
|-----------|----------|------------------|
| User auth | ✅ | ❌ |
| RLS policies | ✅ Respeta | ⚠️ Bypass |
| Storage admin | ❌ | ✅ |
| Delete any data | ❌ | ✅ |
| Batch operations | ❌ | ✅ |

**Lección aprendida:**

- ✅ **Admin tools** DEBEN usar service_role_key
- ✅ **User features** DEBEN usar anon key
- ⚠️ Service role key bypass RLS - usar solo en contextos seguros
- ❌ NUNCA mezclar las keys

**Cuándo usar cada una:**

**Anon key:**
- Login/signup de usuarios
- Operaciones del usuario actual
- Features públicas
- Client-side operations

**Service role key:**
- DevTools components
- Admin panels
- Batch migrations
- Storage management
- Bypass RLS cuando necesario

**Ver documentación completa:** `/src/docs/SUPABASE_KEYS_FIX.md`

---

## 🎓 PRINCIPIOS PARA EVITAR ERRORES

### 1. **Siempre documentar errores**
- ✅ Capturar error exacto
- ✅ Explicar causa raíz
- ✅ Mostrar solución correcta
- ✅ Agregar al ERROR_LOG

### 2. **No asumir, verificar**
- ❌ Asumir que named exports funcionan en dynamic imports
- ❌ Asumir que anon key es suficiente
- ❌ Asumir que "funciona en mi máquina" = funciona en producción

### 3. **Testear edge cases**
- ✅ Dynamic imports
- ✅ Lazy loading
- ✅ Admin operations vs user operations
- ✅ RLS policies

### 4. **Consultar documentación**
- ✅ Antes de implementar, leer SUCCESS_LOG
- ✅ Antes de repetir error, leer ERROR_LOG
- ✅ Documentar TODO después

---

## 🔄 PROCESO DE ACTUALIZACIÓN

**Este documento debe actualizarse:**
- ✅ Cada vez que se encuentra un error crítico
- ✅ Cuando se pierde tiempo depurando algo que ya falló antes
- ✅ Cuando se descubre un anti-pattern
- ✅ Cuando alguien repite un error ya documentado

**Formato para nuevos errores:**

```markdown
## ❌ [Título del Error]

### ❌ ERROR: [Descripción breve]

**Fecha:** [Fecha]  
**Componente:** [Archivo(s) afectado(s)]  
**Severidad:** 🔴 CRÍTICO / 🟡 IMPORTANTE / 🔵 MENOR

**Error exacto:**
\`\`\`
[Mensaje de error completo]
\`\`\`

**Código que causó el error:**
\`\`\`typescript
// ❌ INCORRECTO
[Código problemático]
\`\`\`

**Por qué falló:**
1. [Razón 1]
2. [Razón 2]

**Solución correcta:**
\`\`\`typescript
// ✅ CORRECTO
[Código correcto]
\`\`\`

**Lección aprendida:**
- ✅ [Lección 1]
- ❌ [Anti-pattern a evitar]

**Ver documentación completa:** [Link a doc detallada]
```

---

**Total de errores documentados:** 2  
**Tiempo ahorrado:** ~60 minutos (evitando repetir estos errores)  
**Estado:** 🔄 Documento vivo - Se actualiza continuamente
