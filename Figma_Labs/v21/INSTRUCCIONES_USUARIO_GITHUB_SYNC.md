# 🎯 INSTRUCCIONES RÁPIDAS: GitHub Sync (Para el Usuario)

**¿Qué acabamos de implementar?**  
Un sistema que permite sincronizar archivos de GitHub → Supabase → Filesystem local, resolviendo las limitaciones del entorno web.

---

## ⚡ PASOS RÁPIDOS (5 minutos)

### 1️⃣ Crear la Tabla en Supabase (Una sola vez)

1. Abre **DevTools** en tu aplicación
2. Ve a la sección **SQL** (RealSQLExecutor, ProSQLExecutor, o cualquier ejecutor SQL)
3. Abre el archivo `/supabase-github-sync-table.sql` en tu editor
4. Copia TODO el contenido del archivo
5. Pega en el ejecutor SQL
6. Click en **Ejecutar** o **Run**
7. Espera confirmación: ✅ "Tabla creada exitosamente"

**Verificación:**
```sql
SELECT * FROM github_sync_stats;
```
Deberías ver una fila con todas las estadísticas en 0.

---

### 2️⃣ Usar la Herramienta GitHub Sync

1. Abre **DevTools > GitHub Sync** (o busca el componente GitHubSync)

2. **Configurar acceso:**
   - Token ya está guardado: `[REDACTED_TOKEN]`
   - Repo URL: `https://github.com/aprendeineamx-max/Unsitiodesdefigma`

3. **Click en "1️⃣ Listar Archivos de GitHub"**
   - Espera unos segundos
   - Verás lista de archivos .md detectados

4. **Click en "2️⃣ Sincronizar a Supabase"**
   - Observa la barra de progreso
   - Espera el mensaje: "✅ Sincronización completada: X archivos"
   - Las estadísticas se actualizarán automáticamente

5. **Click en "Notificar al Agente"** (botón morado)
   - Se copia un mensaje al portapapeles
   - Pega ese mensaje en el chat con el agente

---

### 3️⃣ Notificar al Agente

**Pega esto en el chat:**

```
🤖 NOTIFICACIÓN AL AGENTE

Los archivos están listos en Supabase para escritura.

Por favor, ejecuta el proceso de lectura desde Supabase y escritura a /src/docs/

Query SQL para ti:
SELECT * FROM github_sync_cache WHERE written_to_disk = false ORDER BY synced_at DESC;
```

---

## 📊 Dashboard de Estado

Una vez sincronizados, verás en la UI:

```
┌─────────────────────────────────────┐
│  Total Archivos: 122                │
│  Pendientes: 122                    │
│  Ya Escritos: 0                     │
└─────────────────────────────────────┘
```

Después de que el agente escriba los archivos:

```
┌─────────────────────────────────────┐
│  Total Archivos: 122                │
│  Pendientes: 0                      │
│  Ya Escritos: 122 ✅                │
└─────────────────────────────────────┘
```

---

## 🔍 Verificación

### Verificar que la tabla existe:
```sql
SELECT COUNT(*) FROM github_sync_cache;
```

### Ver archivos sincronizados:
```sql
SELECT filename, filepath, written_to_disk, synced_at 
FROM github_sync_cache 
ORDER BY synced_at DESC 
LIMIT 10;
```

### Ver estadísticas:
```sql
SELECT * FROM github_sync_stats;
```

---

## ❓ Troubleshooting Rápido

### "Error al listar archivos"
- Verifica que el token sea válido
- Verifica que el repo URL sea correcto
- Regenera el token en GitHub si es necesario

### "Error al sincronizar a Supabase"
- Asegúrate de haber ejecutado `/supabase-github-sync-table.sql`
- Verifica la consola del navegador para errores específicos

### "Estadísticas no se actualizan"
- Click en el botón "Actualizar" (icono de refresh)
- Recarga la página (F5)

---

## 📚 Documentación Completa

Para más detalles, consulta:
- `/MEGA_FASE_GITHUB_SUPABASE_BRIDGE.md` - Documentación técnica completa
- `/supabase-github-sync-table.sql` - Schema de la tabla
- `/src/app/components/admin/GitHubSync.tsx` - Código fuente del componente

---

## ✅ Checklist de Ejecución

- [ ] Tabla `github_sync_cache` creada en Supabase
- [ ] Token de GitHub guardado
- [ ] Archivos listados de GitHub
- [ ] Archivos sincronizados a Supabase
- [ ] Agente notificado
- [ ] Esperando que el agente escriba los archivos

**Una vez completado, tendrás los 122 archivos de GitHub sincronizados en `/src/docs/` 🎉**
