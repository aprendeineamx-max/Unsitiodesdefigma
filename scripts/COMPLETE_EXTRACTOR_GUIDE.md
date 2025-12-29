# 📘 Guía de Uso - Complete File Extractor v1.0

**Fecha:** 29 de Diciembre, 2025  
**Script:** `FigmaCompleteExtractor.user.js`  
**Propósito:** Extraer TODOS los archivos necesarios de Figma para crear proyecto local funcional

---

## 🎯 Objetivo

Descargar ~3,735 archivos de código fuente desde Figma para tener un proyecto completamente funcional en tu IDE local con:
- ✅ Hot reload
- ✅ Consola F12
- ✅ Edición en tiempo real
- ✅ 100% funcional

---

## 📋 Requisitos Previos

1. ✅ **Tampermonkey** instalado
2. ✅ **Servidor SQLite** corriendo (`npm start` en `/scripts`)
3. ✅ **Archivo de mapa** (`Figma_FileSystem_2025-12-29T06-42-31-999Z.json`)

---

## 🚀 Instalación

### Paso 1: Instalar Script en Tampermonkey

1. Abre Tampermonkey
2. Click en "Create a new script"
3. Copia todo el contenido de `FigmaCompleteExtractor.user.js`
4. Guarda (Ctrl+S)

### Paso 2: Verificar Servidor

```bash
cd scripts
npm start
# Debe mostrar: Server running on http://localhost:3001
```

---

## 📖 Uso Paso a Paso

### Paso 1: Abrir Figma Dev Mode

1. Abre tu proyecto en Figma
2. Activa Dev Mode (Shift+D)
3. Verás el panel "⚡ Complete File Extractor" en la esquina superior derecha

### Paso 2: Cargar Mapa de Archivos

1. Click en "Choose File" en el panel
2. Selecciona `Figma_FileSystem_2025-12-29T06-42-31-999Z.json`
3. Espera a que cargue

Verás:
```
📊 Archivos a extraer: 3,735
📁 Total en mapa: 19,120
```

### Paso 3: Iniciar Extracción

1. Click en "🚀 Iniciar Extracción"
2. El script comenzará a procesar archivos
3. Verás el progreso en tiempo real

---

## 📊 Qué Esperar

### Durante la Extracción

**Panel mostrará:**
```
📘 Progreso: 150 / 3,735
⏱️ 2m 30s | ⚡ 1.0 f/s
```

**Logs en tiempo real:**
```
[01:05:23] Extrayendo: src/app/App.tsx
[01:05:24] Progreso: 50 / 3,735
[01:05:25] Guardando batch 1 (50 archivos)...
[01:05:26] Batch 1 guardado en SQLite
```

### Archivos Generados

**JSON Exports (Descargas automáticas):**
- `figma-extract-batch-1.json` (50 archivos)
- `figma-extract-batch-2.json` (50 archivos)
- ... hasta completar todos

**SQLite:**
- Base de datos: `scripts/extraction-data/figma-content.db`
- Todos los archivos almacenados

---

## ⏱️ Tiempo Estimado

| Archivos | Tiempo Estimado | Velocidad |
|----------|-----------------|-----------|
| 3,735 | ~10-12 horas | ~0.1-0.3 f/s |

**Nota:** La extracción es lenta porque necesita:
1. Navegar a cada archivo en Figma
2. Esperar a que cargue
3. Copiar el contenido
4. Guardar

---

## 🔧 Configuración Avanzada

### Cambiar Modo de Extracción

Edita el script en Tampermonkey:

```javascript
const CONFIG = {
    extractionMode: 'smart', // Cambiar a 'all' para extraer TODO
    
    smartMode: {
        include: [
            'src/**/*',      // Código fuente
            'public/**/*',   // Assets
            // Agregar más patrones aquí
        ],
        exclude: [
            'node_modules/**/*',  // Excluir
            // Agregar más exclusiones aquí
        ]
    },
};
```

### Ajustar Velocidad

```javascript
const CONFIG = {
    parallelDownloads: 3,  // Aumentar para más velocidad (máx 5)
    saveInterval: 50,      // Guardar cada N archivos
};
```

---

## ❌ Solución de Problemas

### Problema: "Primero carga el mapa de archivos"

**Solución:**
1. Verifica que seleccionaste el archivo JSON correcto
2. Debe ser `Figma_FileSystem_2025-12-29T06-42-31-999Z.json`
3. Espera a que aparezca el contador de archivos

### Problema: "SQLite no disponible"

**Solución:**
```bash
cd scripts
npm start
# Verificar que muestre: Server running on http://localhost:3001
```

### Problema: Extracción muy lenta

**Causas:**
- ✅ **Normal** - Figma tiene rate limiting
- ✅ **Esperado** - ~0.1-0.3 archivos/segundo

**Optimizaciones:**
1. Aumentar `parallelDownloads` a 5
2. Dejar corriendo durante la noche
3. Usar modo `source-only` para menos archivos

### Problema: Archivos fallidos

**Logs mostrarán:**
```
❌ Error en src/app/Component.tsx: Timeout
```

**Solución:**
- El script reintentará automáticamente (3 intentos)
- Archivos fallidos se listan al final
- Puedes re-ejecutar solo los fallidos

---

## 📂 Estructura de Salida

Después de la extracción completa:

```
📁 Downloads/
├── figma-extract-batch-1.json
├── figma-extract-batch-2.json
├── figma-extract-batch-3.json
└── ... hasta batch-75.json

📁 scripts/extraction-data/
└── figma-content.db (SQLite con todos los archivos)
```

---

## 🎯 Próximos Pasos

### Después de Extraer Todos los Archivos

1. **Recrear Proyecto Local:**
   ```bash
   # Crear directorio del proyecto
   mkdir figma-project-local
   cd figma-project-local
   
   # Copiar archivos desde JSON/SQLite
   # (Script de reconstrucción pendiente)
   ```

2. **Instalar Dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar Proyecto:**
   ```bash
   npm run dev
   # Sitio corriendo en http://localhost:5173
   ```

4. **Verificar Funcionalidad:**
   - ✅ Hot reload funciona
   - ✅ Consola F12 accesible
   - ✅ Edición en tiempo real
   - ✅ 100% funcional

---

## 📊 Estadísticas Esperadas

Al finalizar:

```
✅ Extracción completada en 10h 23m
📊 Archivos exitosos: 3,720 / 3,735
⚠️ Archivos fallidos: 15
⏱️ Velocidad promedio: 0.1 f/s
💾 Tamaño total: ~50 MB
```

---

## 🆘 Soporte

Si encuentras problemas:

1. **Revisar logs** en el panel del extractor
2. **Verificar consola F12** para errores
3. **Verificar servidor** está corriendo
4. **Reintentar** archivos fallidos

---

## ⚡ Optimizaciones Futuras

Planeadas para v2.0:

- [ ] Extracción paralela real (5-10 archivos simultáneos)
- [ ] Resumir desde checkpoint si se interrumpe
- [ ] Detectar cambios y solo actualizar modificados
- [ ] Integración directa con Figma API
- [ ] Reconstrucción automática del proyecto

---

**Versión:** 1.0  
**Última actualización:** 29 de Diciembre, 2025  
**Estado:** ✅ Listo para Uso
