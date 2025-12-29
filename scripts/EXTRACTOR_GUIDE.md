# 📥 Guía de Uso - Figma Content Extractor

## Instalación y Configuración

### Paso 1: Instalar Dependencias del Servidor

```bash
cd scripts
npm install
```

Esto instalará:
- `express` - Servidor HTTP
- `better-sqlite3` - Base de datos SQLite
- `cors` - Seguridad CORS

### Paso 2: Iniciar el Servidor Local

```bash
npm start
```

Deberías ver:
```
╔════════════════════════════════════════════════════════╗
║   🚀 Figma Extraction Server                          ║
║   📡 Puerto: 3001                                      ║
║   💾 Base de datos: figma-content.db                  ║
╚════════════════════════════════════════════════════════╝
```

**Importante:** Deja esta terminal abierta mientras extraes contenido.

### Paso 3: Instalar el UserScript

1. Abre Tampermonkey en tu navegador
2. Crea un nuevo script
3. Copia y pega el contenido de `scripts/FigmaContentExtractor.user.js`
4. Guarda (Ctrl+S)

### Paso 4: Preparar el Mapa de Archivos

Necesitas el archivo JSON generado en la Fase 1:
- `Figma_FileSystem_2025-12-29T06-40-15-149Z.json`

Asegúrate de tenerlo accesible en tu computadora.

---

## Uso

### 1. Abrir Figma

Ve a tu proyecto de Figma en modo Dev → Código.

### 2. Iniciar Extracción

1. Verás un panel flotante en la esquina superior derecha: **"📥 Content Extractor"**
2. Haz click en **"Iniciar"**
3. Se abrirá un diálogo para seleccionar el archivo JSON del mapa
4. Selecciona `Figma_FileSystem_*.json`
5. La extracción comenzará automáticamente

### 3. Monitorear Progreso

El panel muestra:
- **Barra de progreso** visual
- **Archivos procesados** (ej: 150 / 19120)
- **Tiempo transcurrido**
- **Velocidad** (archivos por segundo)
- **Tiempo restante** estimado
- **Errores** encontrados

### 4. Controles

- **Pausar/Reanudar**: Detiene temporalmente la extracción
- **⏹ Detener**: Cancela la extracción completamente

---

## Almacenamiento

El contenido se guarda en **3 lugares simultáneamente**:

### A. Archivos JSON (Descargas)

**Ubicación:** Carpeta de descargas del navegador

**Formato:**
- `figma-content-batch-1.json` (cada 10 archivos)
- `figma-content-batch-2.json`
- ...
- `figma-content-complete-[timestamp].json` (al finalizar)

**Estructura:**
```json
[
  {
    "path": "src/app/App.tsx",
    "content": "import React from 'react'...",
    "isBinary": false,
    "mimeType": "text/typescript",
    "size": 1024,
    "hash": "a3f2b1c",
    "extractedAt": "2025-12-29T06:40:15Z"
  }
]
```

### B. IndexedDB (Navegador)

**Ubicación:** Almacenamiento local del navegador

**Acceso:**
1. Abre DevTools (F12)
2. Ve a "Application" → "IndexedDB" → "FigmaContentDB"

**Ventajas:**
- Acceso rápido sin descargar
- Búsqueda instantánea
- Persistente entre sesiones

**Limitación:** ~50MB máximo

### C. SQLite (Servidor Local)

**Ubicación:** `scripts/extraction-data/figma-content.db`

**Acceso vía API:**

```bash
# Obtener estadísticas
curl http://localhost:3001/api/stats

# Obtener archivo específico
curl http://localhost:3001/api/file/src/app/App.tsx

# Exportar toda la base de datos
curl http://localhost:3001/api/export > full-export.json
```

**Ventajas:**
- Sin límite de tamaño
- Consultas SQL avanzadas
- Backup fácil (copiar el archivo .db)

---

## Consultas SQL Útiles

Puedes usar cualquier cliente SQLite (DB Browser, DBeaver, etc.) para consultar la base de datos:

```sql
-- Ver todos los archivos TypeScript
SELECT path, size FROM files WHERE mime_type = 'text/typescript';

-- Archivos más grandes
SELECT path, size FROM files ORDER BY size DESC LIMIT 10;

-- Archivos extraídos hoy
SELECT COUNT(*) FROM files WHERE DATE(extracted_at) = DATE('now');

-- Total de archivos binarios vs texto
SELECT is_binary, COUNT(*) FROM files GROUP BY is_binary;
```

---

## Solución de Problemas

### ❌ "No se encontró el elemento para: [archivo]"

**Causa:** El archivo no está visible en el árbol de Figma.

**Solución:**
1. Pausa la extracción
2. Expande manualmente las carpetas en Figma
3. Reanuda

### ❌ "Editor no cargó a tiempo"

**Causa:** Figma está lento o el archivo es muy grande.

**Solución:**
- El script reintentará automáticamente 3 veces
- Si persiste, ese archivo se saltará (se registrará en errores)

### ❌ "Server error: 500" (SQLite)

**Causa:** El servidor local no está corriendo.

**Solución:**
```bash
cd scripts
npm start
```

**Nota:** Si el servidor falla, la extracción continúa usando JSON e IndexedDB.

### ⚠️ Extracción muy lenta

**Optimizaciones:**
1. Cierra otras pestañas de Figma
2. Aumenta el delay en `CONFIG.delayBetweenFiles` si hay errores
3. Reduce `CONFIG.batchSize` para descargas más frecuentes

---

## Archivos Binarios

Los archivos binarios (imágenes, fuentes) se marcan como:
```json
{
  "path": "public/logo.png",
  "content": "[BINARY_FILE_PREVIEW_NOT_AVAILABLE]",
  "isBinary": true,
  "mimeType": "image/png"
}
```

**Nota:** Figma no permite extraer el contenido binario real vía DOM. Solo se registra su existencia.

---

## Estimación de Tiempo

Para **19,120 archivos** con configuración por defecto:

- **Velocidad promedio:** ~1.2 archivos/segundo
- **Tiempo total:** ~4.5 horas
- **Pausas recomendadas:** Cada 2 horas para evitar sobrecarga

**Tip:** Puedes dejar la extracción corriendo durante la noche.

---

## Próximos Pasos

Una vez completada la extracción:

1. **Verificar integridad:**
   ```bash
   curl http://localhost:3001/api/stats
   ```

2. **Exportar todo:**
   ```bash
   curl http://localhost:3001/api/export > figma-complete.json
   ```

3. **Backup de SQLite:**
   ```bash
   cp scripts/extraction-data/figma-content.db ~/backups/
   ```

4. **Continuar a Fase 3:** Implementar escritura desde IDE → Figma

---

## Soporte

Si encuentras problemas, revisa:
- Consola del navegador (F12) para errores del UserScript
- Terminal del servidor para errores de SQLite
- `state.errors` en la consola para ver archivos fallidos

**Comando de debug:**
```javascript
// En la consola del navegador
console.log(state.errors);
```
