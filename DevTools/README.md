# Lab Manager DevTools

Herramientas de desarrollo para facilitar el trabajo con Lab Manager.

## Scripts Disponibles

### ⚡ Scripts PowerShell (Recomendados - Se ejecutan en el IDE)

#### `restart-backend.ps1`
Reinicia solo el servidor backend (puerto 3000) en la terminal del IDE.

**Uso en VS Code:**
```powershell
# Clic derecho en el archivo → Run in Integrated Terminal
# O desde terminal integrada:
.\DevTools\restart-backend.ps1
```

#### `restart-frontend.ps1`
Reinicia solo el servidor frontend (puerto 5175) en la terminal del IDE.

**Uso:**
```powershell
.\DevTools\restart-frontend.ps1
```

### 🪟 Scripts BAT (Para uso desde explorador)

También disponibles si prefieres doble clic desde explorador de archivos:
- `restart-backend.bat` - Abre ventana nueva para backend
- `restart-frontend.bat` - Abre ventana nueva para frontend  
- `restart-all.bat` - Reinicia ambos en ventanas nuevas

## Cuándo Usar

- **Después de editar `server.js`**: Usa `restart-backend.ps1`
- **Después de editar componentes React**: Generalmente auto-reload, pero puedes usar `restart-frontend.ps1`
- **Para un restart limpio completo**: Ejecuta ambos scripts

## Notas

- Los scripts PowerShell (.ps1) **NO abren ventanas emergentes** - se ejecutan en la terminal del IDE
- Los scripts BAT (.bat) abren ventanas nuevas - útiles si ejecutas desde explorador
- Todos matan procesos existentes antes de iniciar nuevos para evitar EADDRINUSE

