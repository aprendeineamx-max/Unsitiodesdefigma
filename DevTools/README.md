# Lab Manager DevTools

Herramientas de desarrollo para controlar y monitorear Lab Manager desde la terminal.

## 🚀 Instalación

```bash
cd DevTools
npm install
```

## 📦 Herramientas Disponibles

### 1. CLI Interactivo (`lab-cli.js`)

Cliente de línea de comandos interactivo para controlar Lab Manager.

**Iniciar:**
```bash
npm run cli
# o
node lab-cli.js
```

**Comandos disponibles:**
- `list` - Listar todos los ZIPs
- `start <version> [port]` - Iniciar un ZIP (puerto opcional, 0 para auto)
- `stop <version>` - Detener un ZIP
- `archive <version>` - Archivar un ZIP
- `trash <version>` - Mover ZIP a papelera
- `delete <version>` - Borrar permanentemente
- `info` - Mostrar información del sistema
- `docs` - Mostrar documentación de API
- `help` - Mostrar ayuda
- `exit` - Salir

**Ejemplo:**
```bash
lab> list
📦 Available ZIPs:

🟢 v22 - running (port 5200)
⚫ v1 - stopped
🟡 v3 - starting

lab> start v1 5300
⏳ Starting v1...
✅ Start command sent
```

### 2. Event Monitor (`event-monitor.js`)

Dashboard TUI (Text User Interface) en tiempo real.

**Iniciar:**
```bash
npm run monitor
# o
node event-monitor.js
```

**Características:**
- ✅ Estado de todos los ZIPs en tiempo real
- ✅ Estadísticas del sistema (uptime, memoria, etc)
- ✅ Logs en tiempo real de todos los eventos
- ✅ Interfaz dividida en 3 paneles

**Controles:**
- `Tab` - Cambiar foco entre paneles
- `c` - Limpiar logs
- `q` o `Esc` - Salir

### 3. Test Suite (`test-api.js`)

Suite automatizada de tests para todas las APIs.

**Ejecutar:**
```bash
npm test
# o
node test-api.js
```

**Tests incluidos:**
- ✅ GET /api/docs
- ✅ GET /api/system/info
- ✅ GET /api/versions
- ✅ POST /api/start
- ✅ POST /api/stop
- ✅ GET /api/files
- ✅ GET /api/files/read
- ✅ GET /api/git/status

## 🌐 API Endpoints

### Version Management

**Listar ZIPs:**
```bash
curl http://localhost:3000/api/versions
```

**Iniciar ZIP:**
```bash
curl -X POST http://localhost:3000/api/start \
  -H "Content-Type: application/json" \
  -d '{"version":"v22","port":5200}'
```

**Detener ZIP:**
```bash
curl -X POST http://localhost:3000/api/stop \
  -H "Content-Type: application/json" \
  -d '{"version":"v22"}'
```

**Archivar:**
```bash
curl -X POST http://localhost:3000/api/archive \
  -H "Content-Type: application/json" \
  -d '{"version":"v1"}'
```

### System Info

**Información del sistema:**
```bash
curl http://localhost:3000/api/system/info
```

**Documentación completa:**
```bash
curl http://localhost:3000/api/docs
```

### WebSocket Events

**Conectar y escuchar eventos (Node.js):**
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('log', (log) => {
    console.log(`[${log.versionId}] ${log.text}`);
});

socket.on('state-update', (versions) => {
    console.log('State updated:', versions');
});

socket.on('stats-update', (stats) => {
    console.log('Stats:', stats);
});
```

## 📝 Ejemplos de Uso

### Workflow Completo

```bash
# 1. Ver estado actual
npm run cli
lab> list

# 2. Iniciar un ZIP
lab> start v22 5200

# 3. En otra terminal, monitorear eventos
npm run monitor

# 4. Hacer cambios en GUI o API

# 5. Ver logs en tiempo real en monitor

# 6. Detener cuando termine
lab> stop v22
lab> exit
```

### Testing Automatizado

```bash
# Ejecutar todos los tests
npm test

# Ver resultados
✅ Passed: 11
❌ Failed: 0
📝 Total:  11

🎉 All tests passed!
```

### Scripting

```javascript
// script.js
const axios = require('axios');

async function deployAll() {
    const { data: zips } = await axios.get('http://localhost:3000/api/versions');
    
    let port = 5200;
    for (const zip of zips) {
        if (zip.status === 'stopped') {
            await axios.post('http://localhost:3000/api/start', {
                version: zip.id,
                port: port++
            });
            console.log(`Started ${zip.id} on port ${port - 1}`);
        }
    }
}

deployAll();
```

## 🔧 Scripts Disponibles

- `npm run cli` - Iniciar CLI interactivo
- `npm run monitor` - Iniciar event monitor
- `npm test` - Ejecutar suite de tests

## 📚 Documentación Completa

Para ver la documentación completa de la API:

```bash
curl http://localhost:3000/api/docs | jq
```

O visita en el navegador:
- http://localhost:3000/api/docs
- http://localhost:3000/api/system/info

## 🐛 Troubleshooting

**Error: Cannot connect to Lab Manager**
- Verifica que el backend esté corriendo: `http://localhost:3000`
- Revisa `scripts/lab_dashboard/server` y ejecuta `node server.js`

**Error: Module not found**
- Ejecuta `npm install` en el directorio DevTools

**Logs no aparecen en Event Monitor**
- Verifica conexión WebSocket
- Refresca con `q` y vuelve a iniciar

## 📄 Licencia

MIT
