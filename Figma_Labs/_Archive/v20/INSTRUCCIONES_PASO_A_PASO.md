# 📋 INSTRUCCIONES PASO A PASO

## 🎯 OBJETIVO
Insertar 33 cursos profesionales en tu base de datos Supabase con imágenes reales.

---

## ⚡ PASO 1: Abrir Supabase Dashboard

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto (el que estás usando)

---

## ⚡ PASO 2: Abrir SQL Editor

1. En el menú lateral izquierdo, busca **"SQL Editor"**
2. Haz clic en **"SQL Editor"**
3. Verás un editor de texto grande

---

## ⚡ PASO 3: Abrir el Script SQL

1. Abre el archivo: `/supabase-insert-all-courses.sql`
2. Selecciona TODO el contenido (Ctrl+A / Cmd+A)
3. Copia el contenido (Ctrl+C / Cmd+C)

---

## ⚡ PASO 4: Pegar en SQL Editor

1. Regresa a Supabase SQL Editor
2. Pega el contenido copiado (Ctrl+V / Cmd+V)
3. Deberías ver un script SQL largo con muchas líneas

---

## ⚡ PASO 5: Ejecutar el Script

1. Busca el botón **"Run"** (esquina inferior derecha)
2. Haz clic en **"Run"**
3. Espera 5-10 segundos

---

## ⚡ PASO 6: Verificar Resultados

Deberías ver un mensaje exitoso como:
```
Success. Rows returned: 33
```

O un listado de los cursos insertados.

---

## ⚡ PASO 7: Verificar en tu Aplicación

1. Regresa a tu aplicación
2. Recarga la página (F5 / Cmd+R)
3. Ve a la HomePage
4. Deberías ver **33 cursos** en lugar de 5

---

## ✅ VERIFICACIÓN COMPLETA

### En Supabase:
1. Ve a **"Table Editor"** en el menú lateral
2. Selecciona la tabla **"courses"**
3. Deberías ver 33 filas (cursos)

### En tu Aplicación:
1. Abre la consola del navegador (F12)
2. Busca los logs del SupabaseTest
3. Deberías ver: `courses: 33`

---

## 🎨 VISTA PREVIA DE LOS CURSOS

Después de ejecutar el script, verás cursos como:

### **Desarrollo Web:**
- ✅ Curso Profesional de Desarrollo Web Full Stack ($299)
- ✅ React Avanzado: Hooks, Context y Performance ($249)
- ✅ Vue.js 3 Composition API Masterclass ($199)
- ✅ Angular 17: Aplicaciones Enterprise ($289)

### **Backend:**
- ✅ Node.js: Arquitectura de Microservicios ($349)
- ✅ GraphQL: API Modernas ($229)
- ✅ Go (Golang): Backend de Alto Rendimiento ($279)

### **Mobile:**
- ✅ React Native: Apps iOS y Android ($299)
- ✅ Flutter & Dart: Desarrollo Multiplataforma ($279)
- ✅ Swift y SwiftUI: Apps iOS Nativas ($289)
- ✅ Kotlin: Desarrollo Android Moderno ($279)

### **Data Science & AI:**
- ✅ Python para Data Science y Machine Learning ($329)
- ✅ SQL Avanzado: Data Analytics ($249)
- ✅ Inteligencia Artificial: Deep Learning ($349)
- ✅ Machine Learning en Producción ($329)
- ✅ Procesamiento de Lenguaje Natural (NLP) ($299)

### **Diseño:**
- ✅ UI/UX Design: Design Systems Profesionales ($279)
- ✅ Figma Avanzado: Prototipado Interactivo ($199)
- ✅ Blender: Modelado 3D y Animación ($249)
- ✅ Adobe After Effects: Motion Graphics Pro ($269)
- ✅ Illustrator: Ilustración Digital Profesional ($199)
- ✅ Photoshop: Retoque y Composición Digital ($229)

### **Game Dev:**
- ✅ Unity: Desarrollo de Videojuegos 3D ($329)
- ✅ Unreal Engine 5: Juegos AAA ($379)

### **DevOps & Cloud:**
- ✅ DevOps: Docker, Kubernetes y CI/CD ($349)
- ✅ AWS Solutions Architect ($379)

### **Marketing:**
- ✅ Marketing Digital: Growth Hacking ($279)
- ✅ SEO Avanzado: Posicionamiento Web ($249)
- ✅ Google Ads: Publicidad Digital ROI ($229)

### **Otros:**
- ✅ TypeScript: De Cero a Experto ($229)
- ✅ Rust: Programación de Sistemas ($299)
- ✅ Ethical Hacking y Seguridad Web ($329)
- ✅ Blockchain y Smart Contracts con Solidity ($299)

---

## 🔍 DETALLES DE CADA CURSO

Cada curso incluye:
- ✅ **Imagen real de Unsplash** relacionada con el tema
- ✅ **Título profesional**
- ✅ **Descripción detallada**
- ✅ **Categoría** (Desarrollo Web, Diseño, Data Science, etc.)
- ✅ **Dificultad** (beginner, intermediate, advanced)
- ✅ **Duración** en minutos (24h - 55h)
- ✅ **Precio** ($199 - $379)
- ✅ **Rating** (4.7 - 4.9)
- ✅ **Estudiantes** (6,800 - 18,900)
- ✅ **Número de lecciones** (72 - 165)

---

## 📊 ESTRUCTURA DE DATOS

Cada curso se ve así en la base de datos:

```sql
INSERT INTO courses (
  id,                -- '10000001'
  title,             -- 'Curso Profesional de...'
  slug,              -- 'desarrollo-web-full-stack'
  description,       -- 'Domina el desarrollo...'
  thumbnail_url,     -- 'https://images.unsplash.com/...'
  instructor_id,     -- '7c127825-...' (tu usuario)
  category,          -- 'Desarrollo Web'
  difficulty,        -- 'intermediate'
  duration,          -- 2700 (minutos)
  price,             -- 299
  rating,            -- 4.9
  students_count,    -- 15420
  lessons_count,     -- 135
  status             -- 'published'
)
```

---

## 🎨 EJEMPLOS DE IMÁGENES

Las imágenes son reales y relevantes:

### **Desarrollo Web:**
```
https://images.unsplash.com/photo-1498050108023-c5249f4df085
(Laptop con código)
```

### **Python & Data Science:**
```
https://images.unsplash.com/photo-1551288049-bebda4e38f71
(Gráficos y datos)
```

### **Diseño:**
```
https://images.unsplash.com/photo-1561070791-2526d30994b5
(Mockups de diseño)
```

### **Unity:**
```
https://images.unsplash.com/photo-1552820728-8b83bb6b773f
(Gaming setup)
```

---

## ❓ SOLUCIÓN DE PROBLEMAS

### **Error: "relation courses does not exist"**
**Causa:** La tabla no existe
**Solución:** Ejecuta primero el script de creación de tablas

### **Error: "duplicate key value"**
**Causa:** Ya ejecutaste el script antes
**Solución:** Normal, los cursos ya están insertados. Verifica en Table Editor.

### **Error: "foreign key constraint"**
**Causa:** El instructor_id no existe
**Solución:** Ejecuta primero el script de datos de prueba para crear el perfil

### **No veo los cursos en la app**
**Causa:** Cache del navegador
**Solución:** 
1. Abre la consola (F12)
2. Recarga con cache limpio (Ctrl+Shift+R / Cmd+Shift+R)
3. Verifica los logs

---

## 🎉 RESULTADO ESPERADO

### **Antes:**
```
HomePage muestra: 5 cursos
```

### **Después:**
```
HomePage muestra: 33 cursos profesionales
Organizados en 14 categorías
Con imágenes reales
Con datos completos
```

---

## 📱 CÓMO SE VE EN LA APP

1. **Hero Section:** Igual que antes
2. **Filtros:** Ahora con más categorías
3. **Cursos:** Grid con 33 tarjetas
4. **Cada tarjeta muestra:**
   - Imagen real del curso
   - Título del curso
   - Instructor
   - Rating (estrellas)
   - Número de estudiantes
   - Precio
   - Categoría
   - Nivel (beginner/intermediate/advanced)

---

## 🚀 SIGUIENTES PASOS

Después de tener los 33 cursos:

1. **Explorar categorías** - Prueba los filtros
2. **Buscar cursos** - Usa la barra de búsqueda
3. **Ver detalles** - Haz clic en un curso
4. **Agregar al carrito** - Prueba el sistema de compras
5. **Inscribirte** - Simula una inscripción

---

## 💾 BACKUP

Si quieres hacer backup de tus cursos:

```sql
-- En Supabase SQL Editor
SELECT * FROM courses WHERE id LIKE '1000%';
```

Copia el resultado y guárdalo en un archivo `.sql`

---

## 🔄 ACTUALIZAR CURSOS

Si quieres cambiar algo:

```sql
-- Actualizar precio de un curso
UPDATE courses 
SET price = 399 
WHERE id = '10000001';

-- Actualizar rating
UPDATE courses 
SET rating = 5.0 
WHERE id = '10000001';

-- Actualizar imagen
UPDATE courses 
SET thumbnail_url = 'https://nueva-imagen.jpg' 
WHERE id = '10000001';
```

---

## ✨ TIPS PRO

### **Agregar más cursos:**
Copia una de las inserciones existentes y cambia:
- ID (incrementa el número)
- Título
- Slug (sin espacios, minúsculas)
- Descripción
- Imagen de Unsplash
- Categoría
- Datos

### **Cambiar instructor:**
```sql
UPDATE courses 
SET instructor_id = 'nuevo-id-de-usuario'
WHERE id LIKE '1000%';
```

### **Ver estadísticas:**
```sql
-- Cursos por categoría
SELECT category, COUNT(*) 
FROM courses 
GROUP BY category 
ORDER BY COUNT(*) DESC;

-- Promedio de precio por categoría
SELECT category, AVG(price) as avg_price
FROM courses 
GROUP BY category;
```

---

## 🎊 ¡FELICIDADES!

Ahora tienes **33 cursos profesionales** en tu base de datos.

**Tu aplicación ahora:**
- ✅ Parece una plataforma real
- ✅ Tiene contenido profesional
- ✅ Está lista para demos
- ✅ Impresionará a cualquiera

**Siguiente nivel:**
- Agregar más artículos de blog
- Crear más posts sociales
- Implementar el sistema de inscripciones
- Agregar más achievements

---

**¡Disfruta tu clon profesional de Platzi!** 🚀🎉✨
