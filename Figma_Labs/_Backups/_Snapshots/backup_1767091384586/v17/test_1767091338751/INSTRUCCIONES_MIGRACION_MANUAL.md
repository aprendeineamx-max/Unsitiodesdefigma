# 📋 INSTRUCCIONES PRECISAS - MIGRACIÓN MANUAL

**Contexto:** Figma Make no permite ejecutar scripts Node.js ni acceder a la API de GitHub para sincronización automática.

**Solución:** Migración manual cuando exportes el proyecto.

---

## 🎯 ESTRATEGIA DE SINCRONIZACIÓN

### Opción A: Desde Repositorio GitHub (⭐ RECOMENDADO)

Tu repositorio en https://github.com/aprendeineamx-max/Unsitio/tree/main/src/docs YA TIENE la estructura correcta.

**Pasos:**

```bash
# 1. Clonar el repositorio (si no lo tienes)
git clone https://github.com/aprendeineamx-max/Unsitio.git temp-repo

# 2. Copiar TODA la carpeta src/docs/ de temp-repo a tu proyecto de Figma Make exportado
cp -r temp-repo/src/docs/* tu-proyecto-figma/src/docs/

# 3. Eliminar archivos .md de la raíz (excepto README.md)
cd tu-proyecto-figma
find . -maxdepth 1 -name "*.md" ! -name "README.md" -delete

# 4. Eliminar carpeta guidelines de raíz (ya está en src/docs/)
rm -rf guidelines

# 5. Limpiar repo temporal
cd ..
rm -rf temp-repo

# 6. Verificar resultado
cd tu-proyecto-figma
ls -la src/docs/*.md | wc -l    # Debe mostrar ~82 archivos
ls -la *.md                      # Debe mostrar solo README.md
```

---

### Opción B: Mover Archivos Locales

Si los archivos .md ya están en la raíz de tu proyecto exportado:

```bash
cd tu-proyecto-figma

# 1. Crear directorio si no existe
mkdir -p src/docs

# 2. Mover todos los .md excepto README.md
for file in *.md; do
  if [ "$file" != "README.md" ]; then
    mv "$file" src/docs/
    echo "✅ Movido: $file"
  fi
done

# 3. Mover carpeta guidelines
if [ -d "guidelines" ]; then
  mv guidelines/ src/docs/
  echo "✅ Movida: guidelines/"
fi

# 4. Verificar
echo ""
echo "📊 Verificación:"
echo "Archivos en src/docs/: $(ls -1 src/docs/*.md 2>/dev/null | wc -l)"
echo "Archivos en raíz: $(ls -1 *.md 2>/dev/null | wc -l)"
```

---

### Opción C: Script PowerShell (Windows)

```powershell
# Navegar al proyecto
cd C:\ruta\a\tu-proyecto-figma

# Crear directorio
New-Item -ItemType Directory -Path "src\docs" -Force

# Mover archivos .md (excepto README.md)
Get-ChildItem -Path . -Filter *.md | 
  Where-Object { $_.Name -ne "README.md" } | 
  ForEach-Object {
    Move-Item -Path $_.FullName -Destination "src\docs"
    Write-Host "✅ Movido: $($_.Name)"
  }

# Mover carpeta guidelines
if (Test-Path "guidelines") {
  Move-Item -Path "guidelines" -Destination "src\docs"
  Write-Host "✅ Movida: guidelines/"
}

# Verificar
Write-Host ""
Write-Host "📊 Verificación:"
Write-Host "Archivos en src/docs/: $((Get-ChildItem -Path "src\docs" -Filter *.md).Count)"
Write-Host "Archivos en raíz: $((Get-ChildItem -Path . -Filter *.md).Count)"
```

---

## ✅ VERIFICACIÓN POST-MIGRACIÓN

### 1. Verificar archivos migrados:

```bash
# Linux/macOS:
ls -la src/docs/*.md | wc -l    # Esperado: 80-120 archivos

# Windows PowerShell:
(Get-ChildItem -Path "src\docs" -Filter *.md).Count
```

### 2. Verificar raíz limpia:

```bash
# Linux/macOS:
ls -la *.md                      # Debe mostrar solo README.md

# Windows PowerShell:
Get-ChildItem -Path . -Filter *.md  # Debe mostrar solo README.md
```

### 3. Verificar carpeta guidelines:

```bash
# Linux/macOS:
ls -la src/docs/guidelines/      # Debe contener Guidelines.md

# Windows PowerShell:
Get-ChildItem -Path "src\docs\guidelines"
```

---

## 🔧 ACTUALIZAR CÓDIGO (si es necesario)

El código YA ESTÁ ACTUALIZADO a v8.2.1, pero verifica:

### Archivo: `/src/app/services/documentScanner.ts`

```typescript
// Debe tener esta línea:
const markdownModules = import.meta.glob<string>('/src/docs/**/*.md', { 
  query: '?raw',
  eager: false
});

// NO debe tener:
// const markdownModules = import.meta.glob<string>('/**.md', ...
```

Si necesitas actualizarlo:

```typescript
// BUSCAR esta línea (aprox. línea 20-30):
const markdownModules = import.meta.glob<string>('/**.md', { 

// REEMPLAZAR con:
const markdownModules = import.meta.glob<string>('/src/docs/**/*.md', { 
```

---

## 🚀 PROBAR LA APLICACIÓN

```bash
# 1. Instalar dependencias (si es primera vez)
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir navegador
# http://localhost:5173

# 4. Navegar a: Admin > Documentación

# 5. Verificar que:
#    ✅ Todos los documentos se cargan
#    ✅ Categorías correctas
#    ✅ Búsqueda funciona
#    ✅ Sin errores en consola
```

---

## 📝 COMMIT DE CAMBIOS

```bash
git add .
git commit -m "feat: migrate documentation to /src/docs/ (v8.2.1)

- Move all .md files from root to /src/docs/
- Keep README.md in root for GitHub
- Move guidelines/ folder to /src/docs/guidelines/
- Update documentScanner.ts to point to /src/docs/**/*.md
- Clean root directory of documentation files"

git push
```

---

## ❓ TROUBLESHOOTING

### Problema: "No se encuentran documentos"

**Solución:**
1. Verificar que `/src/docs/` contiene archivos .md
2. Verificar que `documentScanner.ts` tiene el glob pattern correcto
3. Reiniciar servidor: `npm run dev`
4. Limpiar caché: Ctrl+Shift+R en navegador

### Problema: "Algunos documentos no cargan"

**Solución:**
1. Verificar que todos los .md tienen contenido válido
2. Verificar frontmatter YAML (debe estar entre `---`)
3. Buscar errores en consola del navegador (F12)
4. Revisar `documentScanner.ts` para errores de parsing

### Problema: "Raíz sigue con archivos .md"

**Solución:**
```bash
# Verificar qué archivos quedaron:
ls -la *.md

# Si hay archivos que no deben estar:
rm -i ARCHIVO.md  # Eliminar con confirmación

# O mover a src/docs/:
mv ARCHIVO.md src/docs/
```

---

## 🎯 CHECKLIST FINAL

Después de completar la migración:

- [ ] Archivos en `/src/docs/`: 80-120 archivos ✅
- [ ] Archivos en raíz: Solo README.md ✅
- [ ] Carpeta `/src/docs/guidelines/` existe ✅
- [ ] `documentScanner.ts` apunta a `/src/docs/**/*.md` ✅
- [ ] `npm run dev` corre sin errores ✅
- [ ] Admin > Documentación muestra todos los docs ✅
- [ ] Búsqueda global funciona ✅
- [ ] Graph View renderiza correctamente ✅
- [ ] Cambios commiteados a Git ✅

---

## 📊 ESTADO ESPERADO FINAL

```
/
├── README.md                    ← ÚNICO .md en raíz
├── package.json
├── vite.config.ts
├── scripts/
│   └── migrate-docs-to-src.cjs
└── src/
    ├── app/
    │   └── services/
    │       └── documentScanner.ts    ← Apunta a /src/docs/**/*.md
    └── docs/
        ├── AGENT.md                   ← Ya migrado
        ├── ROADMAP_DOCUMENTATION_CENTER.md  ← Ya migrado
        ├── SUCCESS_LOG_DOCUMENTATION_CENTER.md
        ├── ERROR_LOG_DOCUMENTATION_CENTER.md
        ├── ... (80-120 archivos más)
        └── guidelines/
            └── Guidelines.md
```

---

**IMPORTANTE:** Los archivos `AGENT.md` y `ROADMAP_DOCUMENTATION_CENTER.md` YA ESTÁN en `/src/docs/` desde Figma Make. Solo faltan los ~115 restantes.

**RECOMENDACIÓN:** Usa la **Opción A** (sincronizar desde GitHub) ya que tu repositorio tiene la estructura correcta y actualizada. Es más rápido y confiable que mover archivos manualmente.

🎯 **¡Con estas instrucciones la migración tomará ~2 minutos!**
