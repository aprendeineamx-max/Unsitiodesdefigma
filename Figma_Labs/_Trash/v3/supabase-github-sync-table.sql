-- =====================================================
-- TABLA GITHUB SYNC CACHE
-- =====================================================
-- Propósito: Bridge entre GitHub API y el filesystem local
-- Permite que GitHubSync.tsx descargue archivos y el agente los escriba
-- =====================================================

CREATE TABLE IF NOT EXISTS github_sync_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  filename text NOT NULL,
  filepath text NOT NULL,
  content text NOT NULL,
  sha text,
  size integer,
  download_url text,
  synced_at timestamp with time zone DEFAULT now(),
  written_to_disk boolean DEFAULT false,
  written_at timestamp with time zone,
  error_message text,
  UNIQUE(filepath)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_github_sync_cache_filepath ON github_sync_cache(filepath);
CREATE INDEX IF NOT EXISTS idx_github_sync_cache_written ON github_sync_cache(written_to_disk);
CREATE INDEX IF NOT EXISTS idx_github_sync_cache_synced_at ON github_sync_cache(synced_at DESC);

-- Comentarios de documentación
COMMENT ON TABLE github_sync_cache IS 'Cache de archivos sincronizados desde GitHub para posterior escritura al filesystem';
COMMENT ON COLUMN github_sync_cache.filename IS 'Nombre del archivo (ej: AGENT.md)';
COMMENT ON COLUMN github_sync_cache.filepath IS 'Ruta completa del archivo (ej: src/docs/AGENT.md)';
COMMENT ON COLUMN github_sync_cache.content IS 'Contenido completo del archivo markdown';
COMMENT ON COLUMN github_sync_cache.sha IS 'SHA hash de GitHub para tracking de cambios';
COMMENT ON COLUMN github_sync_cache.size IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN github_sync_cache.download_url IS 'URL raw de GitHub para re-descarga';
COMMENT ON COLUMN github_sync_cache.synced_at IS 'Timestamp de cuando se descargó desde GitHub';
COMMENT ON COLUMN github_sync_cache.written_to_disk IS 'Flag indicando si el agente ya escribió este archivo';
COMMENT ON COLUMN github_sync_cache.written_at IS 'Timestamp de cuando se escribió al filesystem';
COMMENT ON COLUMN github_sync_cache.error_message IS 'Mensaje de error si hubo fallo al escribir';

-- Políticas RLS (Row Level Security)
ALTER TABLE github_sync_cache ENABLE ROW LEVEL SECURITY;

-- Permitir todas las operaciones (desarrollo)
-- En producción, deberías restringir esto a usuarios autorizados
CREATE POLICY IF NOT EXISTS "Allow all operations on github_sync_cache" 
  ON github_sync_cache 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Vista para estadísticas
CREATE OR REPLACE VIEW github_sync_stats AS
SELECT 
  COUNT(*) as total_files,
  COUNT(*) FILTER (WHERE written_to_disk = true) as written_files,
  COUNT(*) FILTER (WHERE written_to_disk = false) as pending_files,
  COUNT(*) FILTER (WHERE error_message IS NOT NULL) as failed_files,
  SUM(size) as total_size_bytes,
  MAX(synced_at) as last_sync_at,
  MAX(written_at) as last_write_at
FROM github_sync_cache;

-- Función para marcar archivo como escrito
CREATE OR REPLACE FUNCTION mark_file_written(file_path text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE github_sync_cache
  SET 
    written_to_disk = true,
    written_at = now()
  WHERE filepath = file_path;
END;
$$;

-- Función para registrar error de escritura
CREATE OR REPLACE FUNCTION mark_file_error(file_path text, error_msg text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE github_sync_cache
  SET 
    error_message = error_msg,
    written_to_disk = false
  WHERE filepath = file_path;
END;
$$;

-- Función para limpiar cache antiguo
CREATE OR REPLACE FUNCTION cleanup_old_cache(days_old integer DEFAULT 7)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM github_sync_cache
  WHERE written_to_disk = true 
    AND written_at < now() - (days_old || ' days')::interval;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- =====================================================
-- TRIGGER PARA AUTO-CLEANUP
-- =====================================================

-- Función trigger para auto-cleanup
CREATE OR REPLACE FUNCTION auto_cleanup_old_files()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Cada vez que se escribe un archivo, limpiamos archivos viejos
  -- (solo si hay más de 200 archivos en cache)
  IF (SELECT COUNT(*) FROM github_sync_cache WHERE written_to_disk = true) > 200 THEN
    PERFORM cleanup_old_cache(30); -- Limpiar archivos escritos hace más de 30 días
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger que se ejecuta después de marcar como escrito
CREATE TRIGGER trigger_auto_cleanup
  AFTER UPDATE OF written_to_disk ON github_sync_cache
  FOR EACH ROW
  WHEN (NEW.written_to_disk = true)
  EXECUTE FUNCTION auto_cleanup_old_files();

-- =====================================================
-- GRANTS (Permisos)
-- =====================================================

-- Grant acceso a roles anónimos (para desarrollo)
GRANT ALL ON github_sync_cache TO anon;
GRANT ALL ON github_sync_cache TO authenticated;
GRANT SELECT ON github_sync_stats TO anon;
GRANT SELECT ON github_sync_stats TO authenticated;

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

-- Insertar archivo de ejemplo para testing
INSERT INTO github_sync_cache (filename, filepath, content, sha, size, download_url)
VALUES (
  'EXAMPLE.md',
  'src/docs/EXAMPLE.md',
  '# Example Document\n\nThis is a test file for the GitHub Sync system.\n\n## Features\n\n- Sync from GitHub\n- Store in Supabase\n- Write to filesystem via agent\n',
  'abc123example',
  150,
  'https://raw.githubusercontent.com/example/repo/main/EXAMPLE.md'
)
ON CONFLICT (filepath) DO NOTHING;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que la tabla se creó correctamente
SELECT 
  'github_sync_cache' as table_name,
  COUNT(*) as record_count,
  pg_size_pretty(pg_total_relation_size('github_sync_cache')) as table_size
FROM github_sync_cache;

-- Ver estadísticas
SELECT * FROM github_sync_stats;

-- =====================================================
-- DOCUMENTACIÓN DE USO
-- =====================================================

/*
FLUJO DE USO:

1. FRONTEND (GitHubSync.tsx):
   - Descarga archivos de GitHub usando fetch()
   - Inserta en github_sync_cache usando supabase.from('github_sync_cache').insert()
   - Muestra progreso al usuario

2. AGENTE IA:
   - Consulta archivos pendientes: 
     SELECT * FROM github_sync_cache WHERE written_to_disk = false
   - Para cada archivo:
     - Usa write_tool para escribir a src/docs/{filename}
     - Marca como escrito: SELECT mark_file_written('src/docs/AGENT.md')
   - Reporta éxito/errores al usuario

3. MANTENIMIENTO:
   - Ver estadísticas: SELECT * FROM github_sync_stats
   - Limpiar cache viejo: SELECT cleanup_old_cache(30)
   - Ver archivos pendientes: 
     SELECT filename, filepath, synced_at 
     FROM github_sync_cache 
     WHERE written_to_disk = false 
     ORDER BY synced_at DESC

EJEMPLO DE INSERCIÓN DESDE FRONTEND:

const { data, error } = await supabase
  .from('github_sync_cache')
  .insert({
    filename: 'AGENT.md',
    filepath: 'src/docs/AGENT.md',
    content: '# Agent Documentation\n...',
    sha: 'abc123',
    size: 12345,
    download_url: 'https://raw.githubusercontent.com/...'
  });

EJEMPLO DE LECTURA DESDE AGENTE:

const { data: pendingFiles, error } = await supabase
  .from('github_sync_cache')
  .select('*')
  .eq('written_to_disk', false)
  .order('synced_at', { ascending: false });

*/
