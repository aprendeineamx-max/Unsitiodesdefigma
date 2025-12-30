# 📦 INSTRUCCIONES DE MIGRACIÓN - v8.2.1

## 🎯 OBJETIVO

Migrar todos los archivos `.md` de la raíz del proyecto a `/src/docs/` para cumplir con los estándares de seguridad de Vite en producción.

---

## ⚡ EJECUCIÓN RÁPIDA (1 COMANDO)

```bash
node scripts/migrate-docs-to-src.cjs
```

**Eso es todo.** El script hace todo automáticamente.

---

## 📋 QUÉ HACE EL SCRIPT

### Paso 1: Creación de Directorio
- ✅ Crea `/src/docs/` si no existe
- ✅ Creación recursiva (incluye subdirectorios)

### Paso 2: Escaneo de Archivos
- ✅ Escanea todos los archivos `.md` en la raíz
- ✅ Excluye `README.md` (mantiene en raíz para GitHub)
- ✅ Filtra solo archivos (no directorios)

### Paso 3: Migración de Archivos
- ✅ Copia cada archivo `.md` a `/src/docs/`
- ✅ Preserva nombres originales
- ✅ Mantiene codificación UTF-8

### Paso 4: Limpieza
- ✅ Elimina archivos `.md` de la raíz (solo los migrados)
- ✅ Solo elimina si la copia fue exitosa

### Paso 5: Carpeta Guidelines
- ✅ Mueve `/guidelines/` a `/src/docs/guidelines/`
- ✅ Copia recursivamente todo el contenido
- ✅ Elimina carpeta original

### Paso 6: Reporte Final
- ✅ Imprime estadísticas completas
- ✅ Lista archivos migrados
- ✅ Indica errores si los hubo

---

## 📊 REPORTE ESPERADO

```
═══════════════════════════════════════════════════════════
  📦 MIGRACIÓN DE DOCUMENTACIÓN A /src/docs/
═══════════════════════════════════════════════════════════

📁 Creando directorio /src/docs/...
   ✅ Directorio creado

🔍 Escaneando archivos .md en raíz...
   ⏭️  Excluyendo: README.md
   ✅ Encontrados 113 archivos .md

📦 Iniciando migración de archivos...

   ✅ Copiado: ROADMAP_DOCUMENTATION_CENTER.md
   🗑️  Eliminado: ROADMAP_DOCUMENTATION_CENTER.md
   ✅ Copiado: SUCCESS_LOG_DOCUMENTATION_CENTER.md
   🗑️  Eliminado: SUCCESS_LOG_DOCUMENTATION_CENTER.md
   ✅ Copiado: ERROR_LOG_DOCUMENTATION_CENTER.md
   🗑️  Eliminado: ERROR_LOG_DOCUMENTATION_CENTER.md
   ... (110 archivos más)

✅ Migración de archivos completada

📁 Moviendo carpeta /guidelines/...
   ✅ Carpeta /guidelines/ movida exitosamente

═══════════════════════════════════════════════════════════
  📊 REPORTE DE MIGRACIÓN
═══════════════════════════════════════════════════════════

  ✅ Archivos encontrados:  113
  ✅ Archivos copiados:     113
  ✅ Archivos eliminados:   113
  ✅ Carpeta guidelines:    MOVIDA

  🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE

═══════════════════════════════════════════════════════════
```

---

## 🔍 VERIFICACIÓN POST-MIGRACIÓN

### 1. Verificar Archivos Migrados

```bash
# Ver archivos en src/docs/
ls -la src/docs/*.md

# Debería mostrar 113 archivos
```

### 2. Verificar Raíz Limpia

```bash
# Ver archivos .md en raíz
ls -la *.md

# Solo debería mostrar README.md (si existe)
```

### 3. Verificar Guidelines

```bash
# Ver carpeta guidelines
ls -la src/docs/guidelines/

# Debería mostrar Guidelines.md
```

### 4. Probar la Aplicación

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir navegador en http://localhost:5173
# Navegar a Admin Panel > Documentación
# Verificar que todos los documentos se cargan correctamente
```

---

## ✅ RESULTADOS ESPERADOS

### Antes de la Migración:
```
/
├── ROADMAP_DOCUMENTATION_CENTER.md
├── SUCCESS_LOG_DOCUMENTATION_CENTER.md
├── ERROR_LOG_DOCUMENTATION_CENTER.md
├── ... (110 archivos .md más)
├── guidelines/
│   └── Guidelines.md
└── src/
    └── docs/ (NO EXISTE)
```

### Después de la Migración:
```
/
├── README.md (si existía, se mantiene)
└── src/
    └── docs/
        ├── ROADMAP_DOCUMENTATION_CENTER.md
        ├── SUCCESS_LOG_DOCUMENTATION_CENTER.md
        ├── ERROR_LOG_DOCUMENTATION_CENTER.md
        ├── ... (110 archivos .md más)
        └── guidelines/
            └── Guidelines.md
```

---

## 🚨 MANEJO DE ERRORES

### Si un Archivo Falla al Copiar:
- ✅ El script continúa con el siguiente
- ✅ El archivo original NO se elimina
- ✅ El error se reporta al final
- ✅ Exit code 1 (para CI/CD)

### Si el Directorio Ya Existe:
- ✅ El script lo detecta y continúa
- ✅ No hay errores, solo un mensaje informativo

### Si No Hay Archivos .md:
- ✅ El script termina exitosamente
- ✅ Mensaje: "No se encontraron archivos .md para migrar"

---

## 🔧 TROUBLESHOOTING

### Problema: "Error: Cannot find module"

**Solución:**
```bash
# Verificar que Node.js está instalado
node --version

# Debe mostrar v16+ o superior
```

### Problema: "Permission denied"

**Solución:**
```bash
# Dar permisos de ejecución al script
chmod +x scripts/migrate-docs-to-src.cjs

# Ejecutar con permisos de usuario
node scripts/migrate-docs-to-src.cjs
```

### Problema: "ENOENT: no such file or directory"

**Solución:**
```bash
# Verificar que estás en la raíz del proyecto
pwd

# Debe mostrar la ruta del proyecto Platzi Clone
# Si no, navega a la raíz:
cd /ruta/al/proyecto
```

### Problema: "Los documentos no aparecen en la aplicación"

**Solución:**
```bash
# 1. Reiniciar el servidor de desarrollo
# Ctrl+C para detener
npm run dev

# 2. Limpiar cache de Vite
rm -rf node_modules/.vite

# 3. Reiniciar servidor
npm run dev

# 4. Recargar página con Ctrl+Shift+R (hard reload)
```

---

## 🔄 ROLLBACK (Si es necesario)

Si algo sale mal y necesitas revertir la migración:

```bash
# 1. Mover archivos de vuelta a la raíz
cp src/docs/*.md .

# 2. Restaurar carpeta guidelines
cp -r src/docs/guidelines ./

# 3. Eliminar carpeta src/docs (opcional)
rm -rf src/docs/

# 4. Revertir documentScanner.ts
# Cambia la línea 36 de:
#   '/src/docs/**/*.md'
# A:
#   '/**.md'
```

**IMPORTANTE:** Solo haz rollback si realmente lo necesitas. El script está diseñado para ser seguro.

---

## 📝 CAMBIOS EN EL CÓDIGO

### Archivo: `src/app/services/documentScanner.ts`

**Línea 36 (ANTES):**
```typescript
const markdownModules = import.meta.glob<string>('/**.md', { 
```

**Línea 36 (DESPUÉS):**
```typescript
const markdownModules = import.meta.glob<string>('/src/docs/**/*.md', { 
```

**Eso es TODO.** No se requieren más cambios en el código.

---

## ✨ BENEFICIOS DE LA MIGRACIÓN

### Seguridad:
- ✅ No escanea `node_modules/` por error
- ✅ No escanea archivos del sistema
- ✅ Solo archivos en `/src/docs/`

### Compatibilidad:
- ✅ Funciona en Linux
- ✅ Funciona en Windows
- ✅ Funciona en macOS
- ✅ Compatible con Vite 4.0+

### Organización:
- ✅ Documentación centralizada
- ✅ Raíz del proyecto limpia
- ✅ Estructura profesional

### Performance:
- ✅ Escaneo más rápido (menos archivos)
- ✅ Build más rápido (glob pattern específico)
- ✅ Menor consumo de memoria

---

## 🎯 PRÓXIMOS PASOS

Después de ejecutar la migración exitosamente:

1. ✅ **Commit de cambios:**
   ```bash
   git add .
   git commit -m "feat: migrate docs to /src/docs/ for production safety"
   ```

2. ✅ **Verificar en CI/CD:**
   - El script no debe ejecutarse en CI/CD
   - Solo se ejecuta una vez localmente
   - Los archivos migrados se commitean

3. ✅ **Actualizar README.md:**
   - Documentar nueva ubicación de docs
   - Agregar instrucciones para contribuidores

4. ✅ **Continuar con Fase 11:**
   - 3D Graph Mode
   - Sistema listo para producción

---

## 📚 DOCUMENTOS DE REFERENCIA

- **Script de migración:** `/scripts/migrate-docs-to-src.cjs`
- **Documentación actualizada:** Todos los archivos en `/src/docs/`
- **Logs del protocolo:** `/src/docs/V82_EXECUTION_STATUS.md`

---

## ✅ CHECKLIST DE MIGRACIÓN

Antes de ejecutar:
- [ ] Estoy en la raíz del proyecto
- [ ] Node.js está instalado (v16+)
- [ ] He leído estas instrucciones
- [ ] He hecho backup (opcional pero recomendado)

Ejecutar:
- [ ] `node scripts/migrate-docs-to-src.cjs`
- [ ] Verificar reporte de éxito

Después de ejecutar:
- [ ] Verificar archivos en `/src/docs/`
- [ ] Verificar raíz limpia
- [ ] Probar aplicación (Admin > Documentación)
- [ ] Commit de cambios

---

**¡LISTO! El script está preparado para ejecutarse.**

Simplemente ejecuta:
```bash
node scripts/migrate-docs-to-src.cjs
```

Y espera el reporte de éxito. 🚀

---

**Fecha:** 25 de Diciembre, 2024  
**Versión:** v8.2.1  
**Estado:** ✅ LISTO PARA EJECUCIÓN
