-- ==========================================
-- INVESTIGACIÓN COMPLETA EN UN SOLO RESULTADO
-- ==========================================

-- Ver TODAS las columnas de tipo UUID (LO MÁS IMPORTANTE)
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND data_type = 'uuid'
ORDER BY table_name, column_name;
