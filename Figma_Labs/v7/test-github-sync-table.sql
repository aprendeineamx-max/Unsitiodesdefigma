-- =====================================================
-- TEST RÁPIDO: Verificar GitHub Sync Table
-- =====================================================
-- Ejecuta este script para verificar que todo funciona
-- =====================================================

-- 1. Verificar que la tabla existe
SELECT 
  'github_sync_cache' as table_name,
  COUNT(*) as record_count,
  pg_size_pretty(pg_total_relation_size('github_sync_cache')) as table_size
FROM github_sync_cache;

-- 2. Verificar que la vista existe
SELECT * FROM github_sync_stats;

-- 3. Listar todas las políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'github_sync_cache';

-- 4. Listar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'github_sync_cache'
ORDER BY indexname;

-- 5. Verificar funciones
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_name IN ('mark_file_written', 'mark_file_error', 'cleanup_old_cache')
ORDER BY routine_name;

-- 6. Test de INSERT (archivo de prueba)
INSERT INTO github_sync_cache (filename, filepath, content, sha, size)
VALUES (
  'TEST.md',
  'src/docs/TEST.md',
  '# Test Document\n\nThis is a test.',
  'test123',
  50
)
ON CONFLICT (filepath) DO NOTHING
RETURNING *;

-- 7. Test de SELECT con filtro
SELECT filename, filepath, written_to_disk, synced_at
FROM github_sync_cache
WHERE written_to_disk = false
ORDER BY synced_at DESC;

-- 8. Test de función mark_file_written
SELECT mark_file_written('src/docs/TEST.md');

-- 9. Verificar que se marcó como escrito
SELECT filename, filepath, written_to_disk, written_at
FROM github_sync_cache
WHERE filepath = 'src/docs/TEST.md';

-- 10. Ver estadísticas actualizadas
SELECT * FROM github_sync_stats;

-- 11. Limpiar datos de prueba
DELETE FROM github_sync_cache WHERE filename = 'TEST.md';

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Si todo funciona correctamente, verás:
-- ✅ Tabla existe con 0 o más registros
-- ✅ Vista github_sync_stats muestra estadísticas
-- ✅ Políticas RLS están activas
-- ✅ Índices existen
-- ✅ Funciones existen
-- ✅ INSERT funciona
-- ✅ SELECT funciona
-- ✅ mark_file_written funciona
-- ✅ DELETE funciona
-- =====================================================
