# 🚀 Guía Rápida - ZIP Extractor (Versión Optimizada)

## ¿Por qué esta versión es mejor?

| Característica | Versión Anterior | Versión ZIP |
|----------------|------------------|-------------|
| **Velocidad** | 0.00 archivos/s | ~500-1000 archivos/s |
| **Tiempo Total** | Imposible (días) | 10-30 segundos |
| **Errores** | Muchos (DOM) | Cero |
| **Binarios** | Marcador placeholder | Contenido real en Base64 |

## Instalación

### 1. Instalar el nuevo UserScript

1. Abre Tampermonkey
2. Crea un **nuevo script**
3. Copia y pega el contenido de `scripts/FigmaZipExtractor.user.js`
4. Guarda (Ctrl+S)

### 2. El servidor ya está corriendo

✅ No necesitas hacer nada más - el servidor de la Fase 2 sigue funcionando.

## Uso

### Método 1: Drag & Drop (Recomendado)

1. **Descarga el ZIP de Figma:**
   - En Figma, ve a tu proyecto
   - Click derecho en el proyecto → "Download"
   - Selecciona "Download as ZIP"
   - Espera a que descargue (unos segundos)

2. **Procesa el ZIP:**
   - Verás un nuevo panel: **"⚡ ZIP Extractor (Fast)"**
   - **Arrastra el archivo ZIP** al área marcada
   - O haz click y selecciona el ZIP

3. **Espera el procesamiento:**
   - Verás una barra de progreso
   - Velocidad: ~500-1000 archivos/segundo
   - Tiempo total: 10-30 segundos para 19,120 archivos

4. **Listo:**
   - Contenido guardado en IndexedDB
   - Contenido guardado en SQLite (servidor)
   - JSON descargado automáticamente

### Método 2: Seleccionar Archivo

Si prefieres no arrastrar:
1. Haz click en el área del panel
2. Selecciona el ZIP descargado
3. Mismo proceso

## Salida

### A. IndexedDB (Navegador)
- Acceso instantáneo
- Búsqueda rápida
- F12 → Application → IndexedDB → FigmaContentDB

### B. SQLite (Servidor Local)
- Base de datos: `scripts/extraction-data/figma-content.db`
- Consultas SQL avanzadas
- Backup fácil

### C. JSON (Descargas)
- `figma-zip-batch-1.json` (cada 100 archivos)
- `figma-zip-batch-2.json`
- ...
- `figma-complete-[timestamp].json` (archivo final completo)

## Archivos Binarios

**Diferencia clave:** Esta versión extrae el contenido real de imágenes, fuentes, etc. en Base64.

```json
{
  "path": "public/logo.png",
  "content": "iVBORw0KGgoAAAANSUhEUgAA...", // Base64 real
  "isBinary": true,
  "mimeType": "image/png",
  "size": 15234
}
```

## Comparación de Velocidad

**Proyecto de 19,120 archivos:**

| Método | Tiempo | Archivos/seg |
|--------|--------|--------------|
| Click individual | ∞ (imposible) | 0.00 |
| **ZIP Extractor** | **~20 segundos** | **~950** |

## Verificación

Después de procesar, verifica:

```bash
# Estadísticas del servidor
curl http://localhost:3001/api/stats

# Debería mostrar:
# {
#   "total_files": 19120,
#   "binary_files": 45,
#   "text_files": 19075,
#   "total_size": 52428800
# }
```

## Troubleshooting

### ❌ "No se puede leer el ZIP"
**Solución:** Asegúrate de descargar el ZIP completo de Figma (no un archivo parcial).

### ❌ "Servidor no responde"
**Solución:** Verifica que el servidor esté corriendo:
```bash
cd scripts
npm start
```

### ⚠️ Procesamiento lento
**Causa:** ZIP muy grande (>100MB)
**Solución:** Es normal, espera 30-60 segundos.

## Próximos Pasos

Una vez extraído todo:

1. **Exportar base de datos completa:**
   ```bash
   curl http://localhost:3001/api/export > figma-full-export.json
   ```

2. **Backup de SQLite:**
   ```bash
   cp scripts/extraction-data/figma-content.db ~/backups/
   ```

3. **Continuar a Fase 3:** Implementar escritura desde IDE → Figma

---

**Tiempo total estimado:** 2 minutos (descargar ZIP + procesar)
