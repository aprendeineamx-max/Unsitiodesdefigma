# 📦 Unified Storage API

Sistema de abstracción unificado para gestionar múltiples proveedores de almacenamiento (GitHub, Supabase, Figma, Local) de forma transparente.

## 🎯 Objetivo

Proporcionar una interfaz común para operaciones de almacenamiento de archivos, independientemente del backend utilizado.

## 📁 Estructura

```
src/lib/storage/
├── types.ts           # Type definitions (interfaces, types)
├── UnifiedStorage.ts  # Main API class (singleton)
├── index.ts           # Public exports
├── README.md          # This file
└── providers/         # (Fase 3) Provider implementations
    ├── GitHubProvider.ts
    ├── SupabaseProvider.ts
    ├── FigmaProvider.ts
    └── LocalProvider.ts
```

## 🚀 Uso Básico

### 1. Importar la instancia singleton

```typescript
import { unifiedStorage } from '@/lib/storage';
```

### 2. Registrar un provider

```typescript
import { GitHubStorageProvider } from '@/lib/storage/providers/GitHubProvider';

const githubProvider = new GitHubStorageProvider({
  name: 'github',
  config: {
    owner: 'aprendeineamx-max',
    repo: 'Unsitiodesdefigma',
    token: 'ghp_xxxxx',
    branch: 'main'
  }
});

unifiedStorage.registerProvider(githubProvider);
```

### 3. Usar operaciones de almacenamiento

#### Listar archivos

```typescript
const result = await unifiedStorage.list('github', '/src/docs', {
  recursive: true,
  extensions: ['.md']
});

if (result.success) {
  console.log('Files:', result.data);
}
```

#### Leer archivo

```typescript
const result = await unifiedStorage.read('supabase', '/docs/README.md');

if (result.success) {
  console.log('Content:', result.data);
}
```

#### Escribir archivo

```typescript
const result = await unifiedStorage.write(
  'github',
  '/docs/new-doc.md',
  '# Hello World\n\nThis is a test',
  { commitMessage: 'Add new documentation' }
);

if (result.success) {
  console.log('File created:', result.data);
}
```

#### Eliminar archivo

```typescript
const result = await unifiedStorage.delete('supabase', '/docs/old-file.md');

if (result.success) {
  console.log('File deleted');
}
```

#### Verificar existencia

```typescript
const result = await unifiedStorage.exists('github', '/docs/README.md');

if (result.success && result.data) {
  console.log('File exists');
}
```

## 📚 API Reference

### `UnifiedStorageAPI`

#### Métodos de Gestión de Providers

- `registerProvider(provider: IStorageProvider): void`
  - Registra un nuevo provider
  
- `getProvider(name: StorageProviderType): IStorageProvider | undefined`
  - Obtiene un provider registrado
  
- `unregisterProvider(name: StorageProviderType): boolean`
  - Desregistra un provider
  
- `getRegisteredProviders(): StorageProviderType[]`
  - Lista todos los providers registrados
  
- `isProviderReady(name: StorageProviderType): boolean`
  - Verifica si un provider está listo

#### Operaciones de Almacenamiento

- `list(provider, path, options?): Promise<StorageOperationResult<FileItem[]>>`
  - Lista archivos en un directorio
  
- `read(provider, path, options?): Promise<StorageOperationResult<string>>`
  - Lee contenido de un archivo
  
- `write(provider, path, content, options?): Promise<StorageOperationResult<FileItem>>`
  - Escribe contenido a un archivo
  
- `delete(provider, path, options?): Promise<StorageOperationResult<void>>`
  - Elimina un archivo o directorio
  
- `exists(provider, path): Promise<StorageOperationResult<boolean>>`
  - Verifica si un archivo existe
  
- `getMetadata(provider, path): Promise<StorageOperationResult<FileItem>>`
  - Obtiene metadata de un archivo

#### Utilidades

- `setDebugMode(enabled: boolean): void`
  - Habilita/deshabilita logging detallado
  
- `getStats(): { ... }`
  - Obtiene estadísticas del sistema

## 🔌 Implementar un Provider

Todos los providers deben implementar la interfaz `IStorageProvider`:

```typescript
import { IStorageProvider, StorageOperationResult, FileItem } from '@/lib/storage/types';

export class MyCustomProvider implements IStorageProvider {
  readonly name = 'custom';
  readonly isReady = true;
  
  async list(path: string, options?) {
    // Implementation
  }
  
  async read(path: string, options?) {
    // Implementation
  }
  
  async write(path: string, content: string, options?) {
    // Implementation
  }
  
  async delete(path: string, options?) {
    // Implementation
  }
  
  // Optional methods
  async exists?(path: string) {
    // Implementation
  }
  
  async getMetadata?(path: string) {
    // Implementation
  }
}
```

## 🎨 Ejemplos Avanzados

### Multi-provider sync

```typescript
// Leer de GitHub y escribir a Supabase
const githubResult = await unifiedStorage.read('github', '/docs/README.md');

if (githubResult.success) {
  await unifiedStorage.write('supabase', '/docs/README.md', githubResult.data);
}
```

### Migración de archivos

```typescript
const githubFiles = await unifiedStorage.list('github', '/docs', { recursive: true });

if (githubFiles.success) {
  for (const file of githubFiles.data) {
    if (file.type === 'file') {
      const content = await unifiedStorage.read('github', file.path);
      
      if (content.success) {
        await unifiedStorage.write('supabase', file.path, content.data);
      }
    }
  }
}
```

### Error handling

```typescript
const result = await unifiedStorage.read('github', '/docs/missing.md');

if (!result.success) {
  console.error('Error:', result.error);
  console.error('Details:', result.errorDetails);
  
  // Handle error
}
```

## 🏗️ Roadmap

### ✅ Fase 1: Arquitectura Base (COMPLETADO)
- [x] Definir tipos y interfaces
- [x] Implementar clase UnifiedStorageAPI
- [x] Sistema de registro de providers
- [x] Operaciones básicas (list, read, write, delete)

### 🚧 Fase 2: Implementación de Providers (EN PROGRESO)
- [ ] GitHubStorageProvider
- [ ] SupabaseStorageProvider
- [ ] FigmaStorageProvider (futuro)
- [ ] LocalStorageProvider (IndexedDB)

### 📋 Fase 3: Features Avanzados (PENDIENTE)
- [ ] Cache layer
- [ ] Batch operations
- [ ] Streaming para archivos grandes
- [ ] Conflict resolution
- [ ] Event system (onChange, onDelete, etc.)
- [ ] Offline support

### 🔮 Fase 4: Optimizaciones (FUTURO)
- [ ] Lazy loading de providers
- [ ] Provider pooling
- [ ] Metrics y analytics
- [ ] Retry logic con backoff exponencial

## 📝 Notas Técnicas

### TypeScript Strict Mode
Todos los archivos usan TypeScript estricto con validación completa de tipos.

### Singleton Pattern
`UnifiedStorageAPI` usa el patrón Singleton para garantizar una única instancia global.

### Error Handling
Todos los métodos retornan `StorageOperationResult<T>` para manejo consistente de errores.

### Debug Mode
En modo desarrollo (`import.meta.env.DEV`), el debug está habilitado automáticamente.

## 🤝 Contribuir

Al agregar nuevos providers o features:

1. Mantener la interfaz `IStorageProvider` actualizada
2. Documentar todos los métodos públicos con JSDoc
3. Agregar tests unitarios (cuando se implemente testing)
4. Actualizar este README con ejemplos

## 📄 License

Part of Platzi Clone Project - Internal use only

---

**Version:** 1.0.0  
**Last Updated:** December 29, 2024  
**Author:** AI Agent following AGENT.md principles
