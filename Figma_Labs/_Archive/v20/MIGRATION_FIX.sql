-- ==========================================
-- FIX: Cambiar columnas duration de INTEGER a TEXT
-- ==========================================
-- Ejecuta este SQL en Supabase SQL Editor para solucionar el error

-- Cambiar duration en tabla courses
ALTER TABLE courses 
ALTER COLUMN duration TYPE TEXT 
USING CASE 
  WHEN duration IS NULL THEN NULL
  ELSE duration::TEXT 
END;

-- Cambiar duration en tabla modules (si existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='modules' AND column_name='duration'
  ) THEN
    ALTER TABLE modules 
    ALTER COLUMN duration TYPE TEXT 
    USING CASE 
      WHEN duration IS NULL THEN NULL
      ELSE duration::TEXT 
    END;
  END IF;
END $$;

-- Cambiar duration en tabla lessons (si existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='lessons' AND column_name='duration'
  ) THEN
    ALTER TABLE lessons 
    ALTER COLUMN duration TYPE TEXT 
    USING CASE 
      WHEN duration IS NULL THEN NULL
      ELSE duration::TEXT 
    END;
  END IF;
END $$;

-- ==========================================
-- ✅ ¡Migración completada!
-- ==========================================
-- Ahora puedes ejecutar "Master Data Sync" sin errores
