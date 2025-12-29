# 🚀 Guía de Uso - Figma Extractor v2.0 (DOM Scraper)

**Propósito:** Extraer los 441 archivos de código fuente faltantes simulando navegación en Figma.

---

## 📋 Pasos para Ejecutar

### 1. Actualizar Script
1. Copia el nuevo código de `FigmaCompleteExtractor.user.js` en Tampermonkey.
2. Guarda los cambios.

### 2. Preparar Lista de Archivos
1. Descarga el archivo: `temp_figma_v23/clean_file_map.json`
2. Si no puedes descargarlo directamente, copia su contenido y guárdalo como `clean_map.json` en tu escritorio.

### 3. Ejecutar en Figma
1. Recarga la página de Figma (Dev Mode).
2. Verás el nuevo panel **"⚡ Figma Extractor v2.0 (DOM Scraper)"**.
3. Carga el archivo `clean_map.json` en el input.
4. Presiona **"🚀 Iniciar Extracción Automática"**.

---

## 👁️ Qué hará el script

1. Leerá la lista de 441 archivos.
2. Buscará el primer archivo (ej: `App.tsx`) en el árbol izquierdo de Figma.
3. Hará clic automáticamente.
4. Esperará 1.5 segundos a que cargue el código.
5. Copiará el texto del editor.
6. Guardará y pasará al siguiente.
7. Descargará JSONs automáticamente cada 20 archivos.

---

## ⚠️ Si algo falla

- **No encuentra el archivo:** El script lo registrará como "Fallido" y continuará.
- **No lee el código:** Verificaremos si los selectores del editor de Figma han cambiado.

¡Es la forma más rápida de obtener tu código fuente YA!
