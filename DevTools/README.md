# Lab Manager DevTools

Herramientas de desarrollo para facilitar el trabajo con Lab Manager.

## Scripts Disponibles

### 🔄 `restart-backend.bat`
Reinicia solo el servidor backend (puerto 3000).

**Uso:**
```bash
# Doble clic o desde terminal
DevTools\restart-backend.bat
```

### 🎨 `restart-frontend.bat`
Reinicia solo el servidor frontend (puerto 5175).

**Uso:**
```bash
DevTools\restart-frontend.bat
```

### ⚡ `restart-all.bat`
Reinicia todo el sistema (backend + frontend) en un solo comando.

**Uso:**
```bash
DevTools\restart-all.bat
```

## Cuándo Usar

- **Después de editar `server.js`**: Usa `restart-backend.bat`
- **Después de editar componentes React**: Generalmente auto-reload, pero puedes usar `restart-frontend.bat`
- **Para un restart limpio completo**: Usa `restart-all.bat`

## Notas

- Los scripts matan procesos existentes antes de iniciar nuevos
- Cada script abre una nueva ventana de terminal para monitorear logs
- Esperan unos segundos entre pasos para evitar conflictos de puerto
