# 🎓 Platzi Clone - Plataforma de Educación Online

> Clon completo de Platzi con funcionalidades enterprise: cursos, documentación, colaboración en tiempo real, y herramientas de admin avanzadas.

---

## ⚠️ ACCIÓN REQUERIDA - MIGRACIÓN PENDIENTE

**Estado:** v8.2.1 - **Requiere migración de documentación**

### 🚀 Pasos para completar setup:

```bash
# 1. Clonar y sincronizar documentación desde GitHub
git clone https://github.com/aprendeineamx-max/Unsitio.git temp
cp -r temp/src/docs/* src/docs/
rm -rf temp
find . -maxdepth 1 -name "*.md" ! -name "README.md" -delete

# 2. Instalar dependencias
npm install

# 3. Configurar Supabase
# Crear archivo .env con:
# VITE_SUPABASE_URL=tu-url
# VITE_SUPABASE_ANON_KEY=tu-key

# 4. Iniciar aplicación
npm run dev
```

**Documentación detallada:** Lee `/ACCION_INMEDIATA_USUARIO.md`

---

## ✨ Características Principales

### 🎯 Plataforma de Cursos
- Catálogo completo de cursos
- Player de video integrado
- Sistema de progreso y seguimiento
- Certificados de finalización
- Rutas de aprendizaje personalizadas

### 📚 Centro de Documentación Enterprise
- **Auto-discovery** de archivos Markdown
- **Graph View** para visualizar relaciones entre documentos
- **Backlinks Panel** bidireccional
- **Búsqueda global** con fuzzy matching (Fuse.js)
- **Command Palette** (Cmd+K)
- **Metadata Management** con versionado
- **Collaborative Editor** en tiempo real

### 👥 Colaboración en Tiempo Real
- Editor colaborativo estilo Google Docs
- Presencia de usuarios en tiempo real
- Comentarios y menciones
- Historial de cambios
- Conflictos resueltos automáticamente

### 🛠️ Admin Panel Avanzado
- **Schema Inspector** para base de datos
- **SQL Executor** con validación
- **Script Runner** para migraciones
- **Performance Monitor**
- **Security Dashboard**
- **Database Resetter**

### 🎨 Experiencia de Usuario
- Dark/Light mode
- Diseño responsive
- Animaciones suaves
- Accesibilidad (WCAG compliant)
- Performance optimizado

---

## 🏗️ Stack Tecnológico

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4.0** - Styling
- **Lucide React** - Icons

### Backend & Database
- **Supabase** - Backend as a Service
- PostgreSQL - Base de datos
- Row Level Security - Seguridad
- Realtime Subscriptions - Updates en vivo

### Librerías Clave
- `react-force-graph-2d` - Visualización de grafos
- `fuse.js` - Búsqueda fuzzy
- `gray-matter` - Frontmatter parsing
- `marked` - Markdown rendering
- `cmdk` - Command palette
- `lru-cache` - Caché optimizado
- `react-hotkeys-hook` - Keyboard shortcuts

---

## 📂 Estructura del Proyecto

```
/
├── src/
│   ├── app/
│   │   ├── components/       # Componentes React
│   │   │   ├── admin/        # Admin panel
│   │   │   ├── blog/         # Blog features
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── context/          # React Context providers
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # Business logic
│   │   └── types/            # TypeScript types
│   ├── docs/                 # Documentación Markdown ⚠️
│   │   └── guidelines/       # Guías del proyecto
│   ├── lib/                  # Configuración Supabase
│   └── styles/               # CSS global
├── scripts/                  # Scripts de utilidad
├── vite-plugins/             # Plugins Vite custom
└── supabase/                 # Migraciones y funciones
```

---

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+
- npm/yarn/pnpm
- Cuenta de Supabase (gratis)

### Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/aprendeineamx-max/Unsitio.git
cd Unsitio

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 4. Iniciar desarrollo
npm run dev
```

### Configuración de Supabase

1. Crear proyecto en https://supabase.com
2. Copiar URL y Anon Key
3. Ejecutar migraciones desde Admin Panel:
   - Ir a `http://localhost:5173/admin`
   - Dev Tools > Database Setup
   - Click "Auto Setup" o ejecutar scripts SQL

---

## 📖 Documentación

### Documentos Clave

- **`/ACCION_INMEDIATA_USUARIO.md`** - Setup inicial (LEER PRIMERO)
- **`/src/docs/AGENT.md`** - Principios del asistente IA
- **`/src/docs/ROADMAP_DOCUMENTATION_CENTER.md`** - Roadmap de features
- **`/src/docs/SUCCESS_LOG_DOCUMENTATION_CENTER.md`** - Técnicas que funcionan
- **`/src/docs/ERROR_LOG_DOCUMENTATION_CENTER.md`** - Errores a evitar
- **`/src/docs/DOCUMENTATION_CENTER_BEST_PRACTICES.md`** - Mejores prácticas

### Guías

- **Admin Panel:** `/ADMIN_PANEL_DOCUMENTATION.md`
- **Supabase Setup:** `/SUPABASE_SETUP_GUIDE.md`
- **Collaboration System:** `/COLLABORATION_SYSTEM_README.md`
- **Markdown Editor:** `/MARKDOWN_EDITOR_README.md`

---

## 🎯 Roadmap

### ✅ Completado

- [x] Plataforma de cursos base
- [x] Sistema de documentación con auto-discovery
- [x] Graph View y Backlinks
- [x] Búsqueda global (Cmd+K)
- [x] Metadata Management
- [x] Collaborative Editor
- [x] Admin Panel completo
- [x] Dark mode
- [x] Integración con Supabase

### 🚧 En Progreso

- [ ] Migración de documentación a `/src/docs/` (v8.2.1) ⚠️
- [ ] 3D Graph Mode (v8.3.0)
- [ ] Advanced Backlinks Analytics (v8.4.0)

### 📅 Planeado

- [ ] Real-time Collaboration on Graph (v8.5.0)
- [ ] AI-powered Search (v9.0.0)
- [ ] Mobile app (v10.0.0)

Ver roadmap completo en: `/src/docs/ROADMAP_DOCUMENTATION_CENTER.md`

---

## 🤝 Contribuir

### Principios de Desarrollo

1. **NO PARCHES** - Soluciones completas, no temporales
2. **COMPLETEZ** - Features 100% funcionales
3. **AUTOPOIESIS** - Sistema auto-documentado
4. **MEGA EJECUCIÓN** - Sin atajos, sin excusas

Lee `/src/docs/AGENT.md` para entender los principios completos.

### Proceso

1. Fork el repositorio
2. Crear branch feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m "feat: descripción"`
4. Push branch: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

---

## 📊 Estado del Proyecto

```
Versión:                v8.2.1
Estado:                 ⚠️ Migración pendiente
Código:                 ✅ 100% funcional
Documentación:          ✅ Completa
Tests:                  ⏳ En progreso
Producción ready:       ✅ Sí (después de migración)
```

---

## 📝 Licencia

MIT License - Ver LICENSE para más detalles

---

## 🙏 Agradecimientos

- Platzi por la inspiración
- Notion/Obsidian por ideas de documentación
- Google Docs por referencias de colaboración
- Comunidad open source

---

## 📞 Soporte

- **Issues:** https://github.com/aprendeineamx-max/Unsitio/issues
- **Docs:** Ver `/src/docs/`
- **Email:** (agregar email de contacto)

---

**🎉 ¡Disfruta construyendo tu plataforma de educación!**

---

## ⚠️ IMPORTANTE - PRIMEROS PASOS

**Antes de usar la aplicación:**

1. Lee `/ACCION_INMEDIATA_USUARIO.md`
2. Ejecuta la migración de documentación
3. Configura Supabase
4. Ejecuta `npm run dev`

**La aplicación NO funcionará correctamente hasta completar la migración de documentación.**

```bash
# Comando rápido para completar setup:
git clone https://github.com/aprendeineamx-max/Unsitio.git temp && \
cp -r temp/src/docs/* src/docs/ && \
rm -rf temp && \
npm install && \
npm run dev
```

**Listo en 2 minutos! 🚀**
