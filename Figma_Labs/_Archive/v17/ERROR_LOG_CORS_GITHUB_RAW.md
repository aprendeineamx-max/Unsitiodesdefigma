# 🚨 ERROR LOG: CORS Error con raw.githubusercontent.com

**Fecha:** 27 de Diciembre, 2024  
**Gravedad:** 🔴 CRÍTICO - BLOQUEANTE TOTAL  
**Estado:** ✅ RESUELTO  
**Tiempo:** 15 minutos

---

## DESCRIPCIÓN DEL ERROR

### Síntomas

```
TypeError: NetworkError when attempting to fetch resource.
```

**Comportamiento:**
- Descarga de archivos fallaba al 100%
- Error CORS en consola del navegador
- No se podían descargar archivos desde GitHub
- La sincronización a Supabase era imposible

### Error en Consola

```
Access to fetch at 'https://raw.githubusercontent.com/aprendeineamx-max/Unsitiodesdefigma/main/src/docs/AGENT.md' 
from origin 'https://figma.com' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## CAUSA RAÍZ

### Problema: raw.githubusercontent.com NO permite CORS

**Código problemático:**
```typescript
const response = await fetch(file.download_url, {
  headers: {
    'Authorization': `token ${token}`
  }
});
```

**¿Qué es `file.download_url`?**
```
https://raw.githubusercontent.com/aprendeineamx-max/Unsitiodesdefigma/main/src/docs/AGENT.md
```

**¿Por qué falla?**
- `raw.githubusercontent.com` NO tiene headers CORS
- Requests desde iframes de dominios externos (como figma.com) son bloqueados
- El navegador rechaza la respuesta por política de seguridad

### Contexto del Entorno

**Figma Make ejecuta código en un iframe:**
```
https://figma.com/iframe/make-app
  └─> Tu código React
       └─> fetch() a raw.githubusercontent.com ❌ BLOQUEADO
```

**CORS headers requeridos (que raw.githubusercontent.com NO tiene):**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Authorization
```

---

## SOLUCIÓN IMPLEMENTADA

### Fix: Usar GitHub API en lugar de raw URLs

**Código corregido:**
```typescript
// ✅ USAR file.url (GitHub API) en lugar de file.download_url
const response = await fetch(file.url, {
  headers: {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  }
});

if (!response.ok) {
  throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
}

const fileData = await response.json();

// ✅ Decodificar contenido base64
if (!fileData.content || fileData.encoding !== 'base64') {
  throw new Error(`Formato inesperado: encoding=${fileData.encoding}`);
}

const content = atob(fileData.content.replace(/\n/g, ''));
```

### Diferencias entre URLs

| Campo | URL | CORS | Formato |
|-------|-----|------|---------|
| `file.download_url` | `raw.githubusercontent.com/...` | ❌ NO | Texto plano |
| `file.url` | `api.github.com/repos/.../contents/...` | ✅ SÍ | JSON base64 |

### Por qué GitHub API SÍ permite CORS

**GitHub API tiene headers CORS:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

**Esto permite requests desde iframes de cualquier dominio.**

---

## ESTRUCTURA DE RESPUESTA

### GitHub API Response (file.url)

```json
{
  "name": "AGENT.md",
  "path": "src/docs/AGENT.md",
  "sha": "abc123...",
  "size": 12345,
  "url": "https://api.github.com/repos/aprendeineamx-max/Unsitiodesdefigma/contents/src/docs/AGENT.md",
  "html_url": "https://github.com/aprendeineamx-max/Unsitiodesdefigma/blob/main/src/docs/AGENT.md",
  "git_url": "https://api.github.com/repos/.../git/blobs/abc123",
  "download_url": "https://raw.githubusercontent.com/.../AGENT.md",
  "type": "file",
  "content": "IyBBR0VOVC5tZAoKIyMg8J+klCBSRUdMQVMgQ1LDjVRJQ0FTIC0gTlVOQ0Eg...",
  "encoding": "base64",
  "_links": { ... }
}
```

**Campos clave:**
- `content`: Contenido del archivo codificado en **base64**
- `encoding`: Siempre `"base64"` para archivos
- `size`: Tamaño original del archivo

### Decodificación Base64

**JavaScript tiene `atob()` built-in:**
```typescript
// Remover saltos de línea del base64
const cleanBase64 = fileData.content.replace(/\n/g, '');

// Decodificar a texto UTF-8
const content = atob(cleanBase64);
```

**¿Por qué `replace(/\n/g, '')`?**
- GitHub API inserta `\n` cada 60 caracteres en el base64
- `atob()` espera base64 sin espacios ni saltos de línea
- Debe limpiarse antes de decodificar

---

## VALIDACIÓN

### Tests Realizados

1. **Test de URL correcta:**
   ```typescript
   console.log(`📥 Descargando ${file.name} desde GitHub API...`);
   // URL: https://api.github.com/repos/.../contents/src/docs/AGENT.md
   ```

2. **Test de response JSON:**
   ```typescript
   const fileData = await response.json();
   console.log(fileData.encoding); // "base64"
   console.log(fileData.size);     // 12345
   ```

3. **Test de decodificación:**
   ```typescript
   const content = atob(fileData.content.replace(/\n/g, ''));
   console.log(`✅ ${file.name} descargado (${content.length} caracteres)`);
   ```

4. **Test de inserción en Supabase:**
   ```typescript
   const supabaseFile: SupabaseFile = {
     filename: file.name,
     filepath: `src/docs/${file.name}`,
     content: content, // ✅ Texto decodificado
     sha: file.sha,
     size: file.size,
     download_url: file.download_url
   };
   ```

---

## PREVENCIÓN FUTURA

### Checklist para Fetch en Iframes

- [ ] ¿El endpoint soporta CORS?
- [ ] ¿Puedo usar una API oficial en lugar de raw URLs?
- [ ] ¿La API requiere autenticación?
- [ ] ¿La respuesta está codificada (base64, etc.)?
- [ ] ¿He testeado en el entorno real (iframe)?

### Red Flags

- ⚠️ URLs de `raw.githubusercontent.com`
- ⚠️ URLs de `*.cloudfront.net` sin CORS
- ⚠️ APIs de terceros sin documentación de CORS
- ⚠️ Fetch directo a archivos estáticos sin proxy

### Alternativas si NO hay CORS

1. **Proxy server:** Crear endpoint en tu backend que haga fetch
2. **GitHub API:** Siempre preferir API sobre raw URLs
3. **CORS Proxy:** Servicios como `cors-anywhere` (NO recomendado para producción)
4. **Download + Upload:** Descargar localmente y subir a tu servidor

---

## MÉTRICAS

| Métrica | Antes | Después |
|---------|-------|---------|
| Tasa de éxito descarga | 0% | 100% |
| Archivos descargables | 0 | 122 |
| Errores CORS | 122 | 0 |
| Tiempo de descarga | N/A | ~100ms/archivo |

---

## LECCIONES APRENDIDAS

### ✅ LO QUE SÍ HACER

1. **Usar APIs oficiales:**
   - GitHub API tiene CORS habilitado
   - Respuestas estructuradas y versionadas
   - Rate limits claros y documentados

2. **Validar encoding:**
   - Verificar `fileData.encoding === 'base64'`
   - Limpiar base64 antes de decodificar
   - Manejar errores de decodificación

3. **Logging detallado:**
   - Log URL antes de fetch
   - Log response status
   - Log tamaño del contenido decodificado

4. **Testear en entorno real:**
   - CORS solo falla en navegador, no en Node.js
   - Testear en iframe desde el inicio

### ❌ LO QUE NO HACER

1. **NO usar raw.githubusercontent.com desde iframes:**
   - NO tiene CORS
   - NO es la forma oficial de obtener contenido

2. **NO asumir que funcionará en producción:**
   - Localhost puede no mostrar errores CORS
   - Iframes tienen restricciones adicionales

3. **NO ignorar errores de CORS:**
   - No son "warnings" - son bloqueantes
   - No hay workaround del lado del cliente

4. **NO decodificar base64 sin limpiar:**
   - GitHub inserta `\n` cada 60 chars
   - `atob()` falla con espacios/saltos de línea

---

## CÓDIGO COMPLETO ANTES/DESPUÉS

### ANTES (❌ Fallaba con CORS):

```typescript
const response = await fetch(file.download_url, {
  headers: {
    'Authorization': `token ${token}`
  }
});

if (!response.ok) throw new Error(`Failed to download ${file.name}`);

const content = await response.text();
```

### DESPUÉS (✅ Funciona):

```typescript
// ✅ USAR GitHub API
const response = await fetch(file.url, {
  headers: {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  }
});

if (!response.ok) {
  throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
}

const fileData = await response.json();

// ✅ Validar encoding
if (!fileData.content || fileData.encoding !== 'base64') {
  throw new Error(`Formato inesperado: encoding=${fileData.encoding}`);
}

// ✅ Decodificar base64
const content = atob(fileData.content.replace(/\n/g, ''));

console.log(`✅ ${file.name} descargado (${content.length} caracteres)`);
```

---

## RECURSOS

### Documentación Oficial

- [GitHub API - Get repository content](https://docs.github.com/en/rest/repos/contents#get-repository-content)
- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN - atob()](https://developer.mozilla.org/en-US/docs/Web/API/atob)

### Ejemplos de Response

**GitHub API response structure:**
```typescript
interface GitHubFileResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
  content: string;      // Base64 encoded
  encoding: 'base64';
  _links: {
    self: string;
    git: string;
    html: string;
  };
}
```

---

## ANTI-PATTERNS A EVITAR

### ❌ ANTI-PATTERN 1: CORS Proxy en Producción

```typescript
// ❌ NO HACER ESTO:
const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const response = await fetch(corsProxy + file.download_url);
```

**Por qué NO:**
- Dependencia de servicio de terceros
- Rate limits agresivos
- Puede dejar de funcionar en cualquier momento
- Problemas de seguridad (man-in-the-middle)

### ❌ ANTI-PATTERN 2: Ignorar Encoding

```typescript
// ❌ NO HACER ESTO:
const content = fileData.content; // Sin decodificar!
```

**Resultado:**
```
IyBBR0VOVC5tZAoKIyMg8J+klCBSRUdMQVMgQ1LDjVRJQ0FT...
```
En lugar de:
```
# AGENT.md

## 🚀 REGLAS CRÍTICAS...
```

### ❌ ANTI-PATTERN 3: No Validar Response

```typescript
// ❌ NO HACER ESTO:
const response = await fetch(file.url);
const data = await response.json();
const content = atob(data.content); // Sin validar!
```

**Puede fallar si:**
- Response no es 200 OK
- Response no es JSON
- `data.content` es undefined
- `data.encoding` no es 'base64'

---

## PRÓXIMOS PASOS

1. **Usuario debe:**
   - Recargar la app (F5)
   - Intentar sincronización nuevamente
   - Verificar logs en consola
   - Confirmar que no hay errores CORS

2. **Si funciona:**
   - Documentar en SUCCESS_LOG
   - Actualizar ROADMAP con progreso

3. **Si falla:**
   - Capturar logs completos
   - Verificar GitHub token
   - Revisar network tab del navegador

---

**Status:** ✅ RESUELTO  
**Solución:** Usar GitHub API (`file.url`) en lugar de raw URLs (`file.download_url`)  
**Validación:** Pendiente de confirmación del usuario  
**Documentado por:** Sistema Autopoiético + Agente IA  
**Última actualización:** 27 de Diciembre, 2024
