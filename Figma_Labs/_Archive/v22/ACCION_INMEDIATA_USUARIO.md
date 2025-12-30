# ⚡ ACCIÓN INMEDIATA - COMPLETAR MIGRACIÓN

**Tiempo estimado:** 2-5 minutos  
**Dificultad:** Baja (copiar/pegar 1 comando)

---

## 🎯 TU MISIÓN

Completar la migración de 115 archivos .md desde la raíz a `/src/docs/`.

---

## ✅ LO QUE YA ESTÁ HECHO

- ✅ Código actualizado a v8.2.1 (`documentScanner.ts`)
- ✅ Directorio `/src/docs/` creado
- ✅ 2 archivos ya migrados (demostración)
- ✅ Sistema listo para recibir archivos

---

## 🚀 LO QUE DEBES HACER

### PASO 1: Exportar proyecto de Figma Make

1. Click en **Export** o **Download** en Figma Make
2. Guarda el .zip en tu máquina
3. Descomprime en una carpeta

### PASO 2: Abrir terminal en el proyecto

```bash
cd /ruta/a/tu-proyecto-figma-make
```

### PASO 3: Ejecutar 1 DE ESTOS COMANDOS

#### ⭐ Opción A: Sincronizar desde GitHub (RECOMENDADO)

```bash
git clone https://github.com/aprendeineamx-max/Unsitio.git temp && \
cp -r temp/src/docs/* src/docs/ && \
rm -rf temp && \
find . -maxdepth 1 -name "*.md" ! -name "README.md" -delete && \
rm -rf guidelines && \
echo "" && \
echo "✅ Migración completada desde GitHub" && \
echo "📊 Archivos en src/docs/: $(ls -1 src/docs/*.md 2>/dev/null | wc -l)" && \
echo "📊 Archivos en raíz: $(ls -1 *.md 2>/dev/null | wc -l)"
```

**¿Por qué esta opción?**
- ✅ Más rápido (archivos ya organizados)
- ✅ Versión más actualizada
- ✅ Un solo comando

---

#### Opción B: Mover archivos locales

```bash
mkdir -p src/docs && \
for file in *.md; do [ "$file" != "README.md" ] && mv "$file" src/docs/; done && \
[ -d "guidelines" ] && mv guidelines/ src/docs/ && \
echo "" && \
echo "✅ Migración completada desde archivos locales" && \
echo "📊 Archivos en src/docs/: $(ls -1 src/docs/*.md 2>/dev/null | wc -l)" && \
echo "📊 Archivos en raíz: $(ls -1 *.md 2>/dev/null | wc -l)"
```

---

#### Opción C: PowerShell (Windows)

```powershell
# Crear directorio
New-Item -ItemType Directory -Path "src\docs" -Force | Out-Null

# Mover archivos .md
Get-ChildItem -Path . -Filter *.md | Where-Object { $_.Name -ne "README.md" } | ForEach-Object {
    Move-Item -Path $_.FullName -Destination "src\docs" -Force
    Write-Host "✅ Movido: $($_.Name)"
}

# Mover guidelines
if (Test-Path "guidelines") {
    Move-Item -Path "guidelines" -Destination "src\docs" -Force
    Write-Host "✅ Movida: guidelines/"
}

# Reporte
Write-Host ""
Write-Host "✅ Migración completada"
Write-Host "📊 Archivos en src/docs/: $((Get-ChildItem -Path 'src\docs' -Filter *.md -Recurse).Count)"
Write-Host "📊 Archivos en raíz: $((Get-ChildItem -Path . -Filter *.md).Count)"
```

---

### PASO 4: Verificar resultado

```bash
# Debe mostrar ~80-120 archivos
ls -la src/docs/*.md | wc -l

# Debe mostrar solo README.md
ls -la *.md

# Debe existir
ls -la src/docs/guidelines/
```

---

### PASO 5: Probar aplicación

```bash
# Instalar dependencias (si es primera vez)
npm install

# Iniciar servidor
npm run dev

# Abrir navegador en: http://localhost:5173
# Navegar a: Admin > Documentación
# Verificar que todos los documentos se cargan
```

---

### PASO 6: Commit cambios

```bash
git add .
git commit -m "feat: migrate documentation to /src/docs/ (v8.2.1)"
git push
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

Después de ejecutar el comando:

- [ ] `src/docs/` tiene 80-120 archivos .md ✅
- [ ] Raíz solo tiene `README.md` ✅
- [ ] `src/docs/guidelines/` existe ✅
- [ ] `npm run dev` corre sin errores ✅
- [ ] Admin > Documentación muestra todos los docs ✅
- [ ] Búsqueda global funciona ✅
- [ ] Graph View renderiza ✅
- [ ] Cambios commiteados ✅

---

## 🎉 RESULTADO ESPERADO

### Terminal mostrará:

```
✅ Migración completada desde GitHub
📊 Archivos en src/docs/: 82
📊 Archivos en raíz: 1
```

### Estructura final:

```
/
├── README.md                    ← ÚNICO .md en raíz ✅
├── package.json
├── vite.config.ts
└── src/
    ├── app/
    │   └── services/
    │       └── documentScanner.ts    ← Apunta a /src/docs/ ✅
    └── docs/
        ├── AGENT.md
        ├── ROADMAP_DOCUMENTATION_CENTER.md
        ├── SUCCESS_LOG_DOCUMENTATION_CENTER.md
        ├── ... (80-120 archivos)
        └── guidelines/
            └── Guidelines.md
```

---

## ❓ ¿PROBLEMAS?

### Error: "command not found"

**Windows PowerShell:**
- Usa la Opción C (script PowerShell)

**Git Bash en Windows:**
- Usa la Opción A o B (deben funcionar)

### Error: "Permission denied"

```bash
# Linux/macOS - agregar sudo si es necesario
sudo chown -R $USER:$USER src/docs/
```

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Documentos no se cargan

1. Verificar que `/src/docs/` tiene archivos:
   ```bash
   ls -la src/docs/*.md | wc -l
   ```

2. Verificar `documentScanner.ts`:
   ```bash
   grep "import.meta.glob" src/app/services/documentScanner.ts
   # Debe mostrar: '/src/docs/**/*.md'
   ```

3. Reiniciar servidor:
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

4. Limpiar caché del navegador:
   - Ctrl+Shift+R (Chrome/Firefox)
   - Cmd+Shift+R (Safari)

---

## 📞 SOPORTE

Si tienes problemas, revisa estos documentos:

1. `/INSTRUCCIONES_MIGRACION_MANUAL.md` - Guía completa
2. `/INSTRUCCIONES_FINALES_MIGRACION.md` - Alternativas
3. `/ESTADO_FINAL_MIGRACION.md` - Estado del sistema

---

## 🎯 TL;DR

**1 comando para completar todo:**

```bash
# Linux/macOS/Git Bash:
git clone https://github.com/aprendeineamx-max/Unsitio.git temp && cp -r temp/src/docs/* src/docs/ && rm -rf temp && find . -maxdepth 1 -name "*.md" ! -name "README.md" -delete && rm -rf guidelines && echo "✅ LISTO - Ejecutar: npm run dev"
```

**Luego:**

```bash
npm run dev
# Abrir http://localhost:5173
# Navegar a Admin > Documentación
# ¡Listo!
```

---

**Tiempo total:** 2-5 minutos  
**Dificultad:** Baja  
**Resultado:** Sistema 100% funcional con toda la documentación organizada

🚀 **¡Adelante!**
