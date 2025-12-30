# 🤖 AGENT.md - Principios Fundamentales del Agente IA

## ⚠️ REGLAS CRÍTICAS - NUNCA IGNORAR

### 🚫 PROHIBIDO: Soluciones Parciales o "Parches"

**NUNCA hagas esto:**

❌ Limitar funcionalidad para "arreglar" un problema
❌ Agregar validaciones arbitrarias (ej: mínimo 3 caracteres)
❌ Poner límites artificiales (ej: máximo 300 resultados)
❌ Deshabilitar features para evitar bugs
❌ "Optimizar" removiendo capacidades
❌ Agregar delays/debouncing como primera solución
❌ Decir "funciona parcialmente" como si fuera éxito

**ESTO ES INACEPTABLE porque:**
- Crea nuevos problemas en lugar de resolver los existentes
- Limita casos de uso válidos del usuario
- Oculta el problema real en lugar de solucionarlo
- Genera deuda técnica
- Demuestra falta de análisis profundo

---

## ✅ METODOLOGÍA CORRECTA: Soluciones de Raíz

### 1. **Analizar el Problema REAL**

Cuando algo falla, pregúntate:

1. ¿Cuál es la CAUSA RAÍZ del problema?
2. ¿Estoy usando la herramienta/librería/enfoque correcto?
3. ¿Existe una solución profesional/estándar de la industria?
4. ¿Qué hacen las aplicaciones enterprise para esto?

**Ejemplo del problema de búsqueda:**
- ❌ Problema aparente: "Muchos resultados bloquean el navegador"
- ✅ Problema real: "Manipulación del DOM ineficiente creando miles de elementos dinámicamente"

### 2. **Buscar Soluciones Profesionales**

**SIEMPRE investiga:**
- ¿Existe una librería especializada para esto? (ej: mark.js para highlighting)
- ¿Qué soluciones usan Google Docs, VS Code, Notion, etc.?
- ¿Hay APIs nativas del navegador optimizadas para esto?
- ¿Existen patrones de diseño específicos para este caso?

**Jerarquía de soluciones:**
1. 🥇 Librería especializada, probada en producción, mantenida activamente
2. 🥈 API nativa del navegador/framework optimizada
3. 🥉 Implementación custom pero siguiendo best practices
4. 🚫 NUNCA: Parche limitando funcionalidad

### 3. **Implementar la Solución Correcta**

**Características de una solución REAL:**
- ✅ Funciona en TODOS los casos de uso válidos
- ✅ Es escalable (funciona con 1 resultado o con 10,000)
- ✅ Tiene performance optimizada
- ✅ No introduce nuevas limitaciones
- ✅ Es mantenible y sigue estándares
- ✅ Tiene fallbacks y manejo de errores robusto

---

## 🎯 Ejemplos de Soluciones Correctas vs Incorrectas

### Caso 1: Sistema de Búsqueda

**❌ Solución Incorrecta (Parche):**
```typescript
// Limitar a 3 caracteres mínimo
if (searchTerm.length < 3) return;

// Limitar a 300 resultados
if (results.length > 300) results = results.slice(0, 300);

// Agregar debouncing de 500ms
setTimeout(() => search(), 500);
```

**Problemas:**
- Usuario no puede buscar "UI", "DB", "AI" (términos válidos de 2 letras)
- Si hay 500 resultados, 200 quedan ocultos
- 500ms de latencia artificial molesta al usuario

**✅ Solución Correcta:**
```typescript
// Usar librería especializada optimizada
import Mark from 'mark.js';

const markInstance = new Mark(containerRef.current);
markInstance.mark(searchTerm, {
  // Sin límites artificiales
  // Performance optimizada internamente
  // Maneja miles de resultados sin bloquear
});
```

### Caso 2: Performance en Listas Grandes

**❌ Solución Incorrecta:**
```typescript
// Limitar a 50 items
const limitedItems = items.slice(0, 50);
```

**✅ Solución Correcta:**
```typescript
// Virtual scrolling con react-window
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length} // TODOS los items
  itemSize={50}
>
  {Row}
</FixedSizeList>
```

### Caso 3: Carga de Imágenes Pesadas

**❌ Solución Incorrecta:**
```typescript
// Limitar calidad a 50%
const lowQuality = compressImage(image, 0.5);
```

**✅ Solución Correcta:**
```typescript
// Lazy loading + responsive images + formatos modernos
<img
  src={image.webp}
  srcSet={`${image.small} 480w, ${image.medium} 800w, ${image.large} 1200w`}
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy"
  alt={alt}
/>
```

---

## 🔧 Checklist Pre-Implementación

Antes de implementar CUALQUIER solución, verifica:

- [ ] ¿Identifiqué la causa RAÍZ del problema?
- [ ] ¿Investigué cómo lo resuelven aplicaciones enterprise?
- [ ] ¿Busqué librerías especializadas para esto?
- [ ] ¿Esta solución funciona en TODOS los casos de uso?
- [ ] ¿Estoy agregando limitaciones artificiales?
- [ ] ¿Hay una forma estándar de la industria para esto?
- [ ] ¿Esta solución es escalable?
- [ ] ¿He considerado edge cases?

**Si la respuesta a cualquier pregunta es NO → DETENTE y repiensa**

---

## 📚 Librerías Profesionales por Categoría

### Text Highlighting & Search
- **mark.js** - Text highlighting optimizado
- **fuse.js** - Fuzzy search
- **lunr.js** - Full-text search

### Performance & Virtualization
- **react-window** / **react-virtualized** - Virtual scrolling
- **react-intersection-observer** - Lazy loading
- **react-query** - Data fetching & caching

### Forms & Validation
- **react-hook-form** - Forms performantes
- **zod** - Schema validation
- **yup** - Validation

### State Management
- **zustand** - Simple state
- **jotai** - Atomic state
- **redux-toolkit** - Complex state

### UI Components
- **radix-ui** - Accessible primitives
- **headless-ui** - Unstyled components
- **shadcn/ui** - Component library

### Data Visualization
- **recharts** - Charts
- **d3** - Advanced viz
- **react-flow** - Diagramas

### Rich Text
- **lexical** - Facebook's editor
- **tiptap** - ProseMirror wrapper
- **slate** - Customizable editor

---

## 🎓 Principios de Ingeniería de Software

### 1. **KISS (Keep It Simple, Stupid)**
- Usa la solución más simple que funcione COMPLETAMENTE
- No la más simple que funcione PARCIALMENTE

### 2. **YAGNI (You Aren't Gonna Need It)**
- No agregues limitaciones "por si acaso"
- Si no hay un problema confirmado, no lo "arregles"

### 3. **DRY (Don't Repeat Yourself)**
- Si alguien ya resolvió esto (librería), úsala
- No reinventes la rueda mal

### 4. **Separation of Concerns**
- Performance es un concern separado de funcionalidad
- No sacrifiques uno por el otro
- Resuelve ambos correctamente

### 5. **Progressive Enhancement**
- Funcionalidad completa primero
- Optimizaciones después
- NUNCA al revés

---

## 🚨 Señales de Alerta (Red Flags)

Si te encuentras haciendo esto, **DETENTE**:

- ⛔ "Funciona si el usuario no hace X"
- ⛔ "Limité Y para que no se rompa"
- ⛔ "Solo soporta hasta N elementos"
- ⛔ "No puede buscar menos de M caracteres"
- ⛔ "Agregué un delay para que no falle"
- ⛔ "Deshabilitando esta feature arregla el bug"
- ⛔ "Es una solución temporal" (que se vuelve permanente)

**Cuando veas estos patterns → Busca la solución REAL**

---

## 💡 Proceso de Debugging Correcto

1. **Reproducir el problema** consistentemente
2. **Identificar la causa raíz** (no síntomas)
3. **Investigar soluciones estándar** de la industria
4. **Evaluar trade-offs** de cada solución
5. **Implementar la solución completa** sin limitaciones
6. **Testear edge cases** exhaustivamente
7. **Documentar** decisiones y razones

**NUNCA:**
1. ~~Ver el síntoma~~
2. ~~Agregar validación para evitarlo~~
3. ~~Decir "listo"~~

---

## 🎯 Objetivo Final

**Cada solución debe:**
- ✅ Resolver el problema COMPLETAMENTE
- ✅ Ser escalable y performante
- ✅ Seguir best practices
- ✅ No introducir limitaciones artificiales
- ✅ Ser mantenible a largo plazo
- ✅ Funcionar para TODOS los casos de uso válidos

**Si no cumple TODO lo anterior → No es una solución, es un parche**

---

## 📝 Notas Finales

> "Cualquiera puede escribir código que una computadora entienda. Buenos programadores escriben código que humanos puedan entender y que escale sin límites artificiales."
> - Adaptado de Martin Fowler

**Recuerda:**
- El usuario confía en que implementes soluciones REALES
- Los parches crean deuda técnica exponencial
- Una solución correcta toma más tiempo inicial pero ahorra MUCHO más después
- La calidad no es negociable

---

## 🔄 Actualización de este Documento

Este documento debe actualizarse cuando:
- Se descubran nuevos anti-patterns
- Se identifiquen nuevas librerías profesionales
- Se aprendan nuevas best practices
- El usuario reporte más casos de "soluciones parciales"

**Última actualización:** 2024-12-25

**Versión:** 1.0.0

---

## 📚 DOCUMENTOS DE CONTROL Y ROADMAPS

**⚠️ REGLA CRÍTICA:** Antes de cada implementación, SIEMPRE consulta estos documentos:

### Documentos de Proyecto Activo

1. **ROADMAP_DOCUMENTATION_CENTER.md** - Roadmap del Centro de Documentación
   - Estado de fases completadas y pendientes
   - Próximos pasos planificados
   - Métricas de éxito

2. **SUCCESS_LOG_DOCUMENTATION_CENTER.md** - Técnicas que SÍ FUNCIONAN
   - Soluciones validadas con métricas
   - Código de ejemplo que funciona
   - Best practices probadas en producción

3. **ERROR_LOG_DOCUMENTATION_CENTER.md** - Técnicas que NO FUNCIONAN
   - Anti-patterns identificados
   - Errores comunes a evitar
   - Tiempo perdido en soluciones fallidas

4. **DOCUMENTATION_CENTER_BEST_PRACTICES.md** - Mejores prácticas del sistema
   - Convenciones de código
   - Estándares de documentación
   - Patrones de diseño aprobados

### ¿Cuándo Consultar estos Documentos?

**ANTES de implementar:**
- ✅ Revisar ROADMAP para ver si ya está planificado
- ✅ Consultar SUCCESS_LOG para usar técnicas validadas
- ✅ Leer ERROR_LOG para evitar errores conocidos
- ✅ Verificar BEST_PRACTICES para seguir estándares

**DURANTE implementación:**
- ✅ Referirse a SUCCESS_LOG para código de ejemplo
- ✅ Validar contra BEST_PRACTICES
- ✅ Evitar anti-patterns del ERROR_LOG

**DESPUÉS de implementar:**
- ✅ Actualizar ROADMAP con progreso
- ✅ Documentar éxitos en SUCCESS_LOG
- ✅ Documentar fracasos en ERROR_LOG
- ✅ Actualizar BEST_PRACTICES si se encontró mejor forma

### Flujo de Trabajo Completo

```
┌─────────────────────────────────────────────────┐
│  1. PLANIFICACIÓN                               │
│     - Leer ROADMAP: ¿Ya está planificado?       │
│     - Consultar AGENT.md: ¿Qué principios       │
│       seguir?                                   │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  2. INVESTIGACIÓN                               │
│     - Leer SUCCESS_LOG: ¿Hay solución validada? │
│     - Leer ERROR_LOG: ¿Qué NO hacer?            │
│     - Consultar BEST_PRACTICES: ¿Qué estándares │
│       seguir?                                   │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  3. IMPLEMENTACIÓN                              │
│     - Seguir principios de AGENT.md             │
│     - Usar técnicas de SUCCESS_LOG              │
│     - Evitar anti-patterns de ERROR_LOG         │
│     - Aplicar BEST_PRACTICES                    │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  4. VALIDACIÓN                                  │
│     - Verificar métricas del ROADMAP            │
│     - Testear casos de éxito y fracaso          │
│     - Revisar que cumple BEST_PRACTICES         │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  5. DOCUMENTACIÓN                               │
│     - Actualizar ROADMAP con progreso           │
│     - Agregar técnicas exitosas a SUCCESS_LOG   │
│     - Documentar fracasos en ERROR_LOG          │
│     - Actualizar BEST_PRACTICES si aplica       │
└─────────────────────────────────────────────────┘
```

### Ejemplo de Consulta Pre-Implementación

**Tarea:** Implementar búsqueda global en documentos

**Paso 1:** Consultar ROADMAP
```
✅ Encontrado en "Fase 3: Global Search"
✅ Estado: Pendiente
✅ Features planificados listados
```

**Paso 2:** Consultar SUCCESS_LOG
```
✅ Técnica validada: usar `searchDocuments()` function
✅ Performance: O(n) aceptable para <1000 docs
✅ No requiere librería externa para búsqueda básica
```

**Paso 3:** Consultar ERROR_LOG
```
❌ No usar: Regex complejos sin optimización
❌ No usar: Búsqueda síncrona que bloquea UI
❌ Evitar: Cargar todo el contenido de docs en memoria
```

**Paso 4:** Consultar BEST_PRACTICES
```
✅ Usar case-insensitive search
✅ Buscar en múltiples campos (título, descripción, tags)
✅ Implementar debouncing para input de búsqueda
```

**Paso 5:** Implementar siguiendo guías

**Paso 6:** Documentar resultado
```
Si funciona → SUCCESS_LOG
Si falla → ERROR_LOG
Progreso → ROADMAP
Nuevo patrón → BEST_PRACTICES
```

---

## 🎯 PRINCIPIO FUNDAMENTAL

**Toda implementación debe:**
1. ✅ Consultar documentos de control PRIMERO
2. ✅ Seguir técnicas validadas en SUCCESS_LOG
3. ✅ Evitar anti-patterns en ERROR_LOG
4. ✅ Cumplir estándares de BEST_PRACTICES
5. ✅ Alinearse con ROADMAP del proyecto
6. ✅ Actualizar documentación DESPUÉS

**Si no consultas estos documentos:**
- ⚠️ Riesgo de repetir errores ya resueltos
- ⚠️ Perder tiempo en soluciones que ya fallaron
- ⚠️ Crear inconsistencias con estándares del proyecto
- ⚠️ Desincronizar roadmap de la realidad

---

**TL;DR:** 
# NUNCA limites funcionalidad para "arreglar" problemas. SIEMPRE busca la solución REAL que funcione en TODOS los casos sin restricciones artificiales. Y SIEMPRE consulta los documentos de control antes de implementar.