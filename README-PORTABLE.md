# 🖥️ Lab Dashboard - Sistema Portable

## Inicio Rápido

### En cualquier PC Windows:

1. **Copia esta carpeta completa** a la nueva PC
2. **Ejecuta `START-LAB.bat`** (doble click)
3. ¡Listo! El navegador se abrirá automáticamente

---

## Contenido del Paquete

```
📁 Unsitio-Figma-Clean/
├── 🚀 START-LAB.bat           ← EJECUTAR ESTO
├── 📁 DevTools/
│   ├── configure-storage.bat  ← Configurar Vultr S3
│   ├── install-node.bat       ← Instala Node.js auto
│   └── dev-start.bat          ← Script de desarrollo
└── 📁 scripts/lab_dashboard/
    ├── 📁 server/             ← Backend Node.js
    └── 📁 client/             ← Frontend React
```

---

## Primera Vez en Nueva PC

### Requisitos Automáticos
- **Node.js**: Se instala automáticamente si no existe
- **Dependencias npm**: Se instalan automáticamente

### Configurar Object Storage (Opcional)
Para habilitar Cloud Backup:
1. Ejecuta `DevTools\configure-storage.bat`
2. Ingresa tus credenciales de Vultr S3
3. Reinicia START-LAB.bat

---

## Características

| Función | Descripción |
|---------|-------------|
| **Cloud Backup** | Respalda archivos a Vultr Object Storage |
| **Mirror Folders** | Sube carpetas completas con estructura |
| **Resume System** | Las subidas interrumpidas se pueden reanudar |
| **Real-time Progress** | Ve el progreso en tiempo real |
| **Folder Navigation** | Navega carpetas como Google Drive |

---

## Credenciales de Vultr S3

Para obtener credenciales:
1. Crea cuenta en [Vultr](https://www.vultr.com)
2. Ve a Products → Object Storage
3. Crea un nuevo bucket
4. Copia Access Key, Secret Key y Endpoint

---

## Solución de Problemas

### "Node.js no detectado"
- Ejecuta `DevTools\install-node.bat`
- O descarga de https://nodejs.org

### "Puerto en uso"
- Cierra otras instancias del servidor
- O cambia el puerto en `dev-start.bat`

### "Error de conexión a S3"
- Verifica credenciales en `DevTools\configure-storage.bat`
- Asegúrate que el bucket exista

---

## Soporte

Este es un sistema portable. Simplemente copia la carpeta completa para usarlo en otra PC.
