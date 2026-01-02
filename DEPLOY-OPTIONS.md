# 🌐 Lab Dashboard - Opciones de Despliegue

## Opción 1: Paquete Portable COMPLETO (Recomendado para empezar)

### Crear el Paquete
```batch
DevTools\create-complete-package.bat
```

Esto crea un ZIP con:
- ✅ Todo el código
- ✅ Credenciales Vultr (archivo .env)
- ✅ Scripts de inicio automático

### En la Nueva PC
1. Copia el ZIP
2. Extrae
3. Ejecuta `START-LAB.bat`
4. ¡Listo! Todo se configura automáticamente

---

## Opción 2: Deploy en la Nube (Acceso Remoto)

### A. Usando Vultr VPS (Más Control)

1. **Crea un VPS en Vultr** (~$6/mes)
   - Cloud Compute
   - Windows Server o Ubuntu
   - 1 vCPU, 1GB RAM

2. **En el VPS, ejecuta:**
```bash
# Clona o sube el proyecto
git clone <tu-repo> lab-dashboard
cd lab-dashboard

# Opción con Docker
docker-compose up -d

# O sin Docker (Windows)
START-LAB.bat
```

3. **Accede desde cualquier PC:**
   - `http://TU-IP-VPS:5175`

### B. Usando Railway.app (Sin Servidor)

1. Conecta tu repo a [Railway](https://railway.app)
2. Variables de entorno:
   ```
   VULTR_ACCESS_KEY=tu_access_key
   VULTR_SECRET_KEY=tu_secret_key
   VULTR_BUCKET_NAME=lab-backups
   VULTR_ENDPOINT=ewr1.vultrobjects.com
   ```
3. Deploy automático

### C. Usando Render.com (Gratis Tier)

1. Conecta repo a [Render](https://render.com)
2. Tipo: Web Service
3. Configura variables de entorno
4. Deploy

---

## 🔐 Seguridad para Deploy en Nube

Si expones a internet, DEBES agregar:

1. **Autenticación** - Login requerido
2. **HTTPS** - Certificado SSL
3. **Firewall** - Solo puertos necesarios

### Configurar Autenticación Básica

Edita `server/server.js` para agregar:
```javascript
// Al inicio del archivo
const basicAuth = require('express-basic-auth');

// Antes de las rutas
app.use(basicAuth({
    users: { 'admin': 'tu-password-seguro' },
    challenge: true
}));
```

---

## Comparación de Opciones

| Opción | Costo | Dificultad | Acceso Remoto |
|--------|-------|------------|---------------|
| Paquete ZIP | Gratis | Fácil | No |
| Vultr VPS | ~$6/mes | Medio | Sí |
| Railway | Gratis-$5 | Fácil | Sí |
| Render | Gratis | Fácil | Sí |

---

## Recomendación

Para tu caso (backup de otra PC):

1. **Primero**: Usa el **Paquete Portable Completo**
   - Ejecuta `DevTools\create-complete-package.bat`
   - Lleva el ZIP a la otra PC
   - Funciona inmediatamente

2. **Después** (si necesitas acceso remoto):
   - Despliega en Vultr VPS
   - Accede desde cualquier lugar
