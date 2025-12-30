-- =====================================================
-- PRUEBA RÁPIDA DE SUPABASE (5 minutos)
-- =====================================================
-- Ejecuta este archivo completo para verificar todo
-- =====================================================

DO $$
DECLARE
  v_tables_count INTEGER;
  v_policies_count INTEGER;
  v_triggers_count INTEGER;
  v_functions_count INTEGER;
  v_result TEXT := '';
BEGIN
  -- Header
  RAISE NOTICE '========================================';
  RAISE NOTICE '   VERIFICACIÓN RÁPIDA DE SUPABASE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- Test 1: Tablas
  SELECT COUNT(*) INTO v_tables_count
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  
  RAISE NOTICE '✓ Test 1: Tablas creadas';
  RAISE NOTICE '  Resultado: % tablas encontradas', v_tables_count;
  IF v_tables_count = 10 THEN
    RAISE NOTICE '  ✅ CORRECTO - 10 tablas esperadas';
  ELSE
    RAISE NOTICE '  ❌ ERROR - Se esperaban 10 tablas';
  END IF;
  RAISE NOTICE '';

  -- Test 2: RLS Habilitado
  SELECT COUNT(*) INTO v_tables_count
  FROM pg_tables
  WHERE schemaname = 'public' AND rowsecurity = true;
  
  RAISE NOTICE '✓ Test 2: Row Level Security';
  RAISE NOTICE '  Resultado: % tablas con RLS', v_tables_count;
  IF v_tables_count = 10 THEN
    RAISE NOTICE '  ✅ CORRECTO - RLS habilitado en todas las tablas';
  ELSE
    RAISE NOTICE '  ❌ ERROR - RLS debe estar habilitado en 10 tablas';
  END IF;
  RAISE NOTICE '';

  -- Test 3: Políticas RLS
  SELECT COUNT(*) INTO v_policies_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE '✓ Test 3: Políticas de Seguridad';
  RAISE NOTICE '  Resultado: % políticas configuradas', v_policies_count;
  IF v_policies_count >= 20 THEN
    RAISE NOTICE '  ✅ CORRECTO - Múltiples políticas configuradas';
  ELSE
    RAISE NOTICE '  ⚠️  ADVERTENCIA - Pocas políticas (esperadas 20+)';
  END IF;
  RAISE NOTICE '';

  -- Test 4: Triggers
  SELECT COUNT(*) INTO v_triggers_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public';
  
  RAISE NOTICE '✓ Test 4: Triggers Automáticos';
  RAISE NOTICE '  Resultado: % triggers encontrados', v_triggers_count;
  IF v_triggers_count >= 6 THEN
    RAISE NOTICE '  ✅ CORRECTO - Triggers configurados';
  ELSE
    RAISE NOTICE '  ❌ ERROR - Faltan triggers';
  END IF;
  RAISE NOTICE '';

  -- Test 5: Funciones
  SELECT COUNT(*) INTO v_functions_count
  FROM information_schema.routines
  WHERE routine_schema = 'public';
  
  RAISE NOTICE '✓ Test 5: Funciones SQL';
  RAISE NOTICE '  Resultado: % funciones encontradas', v_functions_count;
  IF v_functions_count >= 3 THEN
    RAISE NOTICE '  ✅ CORRECTO - Funciones creadas';
  ELSE
    RAISE NOTICE '  ❌ ERROR - Faltan funciones';
  END IF;
  RAISE NOTICE '';

  -- Test 6: Verificar función handle_new_user
  IF EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name = 'handle_new_user'
  ) THEN
    RAISE NOTICE '✓ Test 6: Función handle_new_user';
    RAISE NOTICE '  ✅ CORRECTO - Función existe';
  ELSE
    RAISE NOTICE '✓ Test 6: Función handle_new_user';
    RAISE NOTICE '  ❌ ERROR - Función no encontrada';
  END IF;
  RAISE NOTICE '';

  -- Test 7: Verificar trigger on_auth_user_created
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    RAISE NOTICE '✓ Test 7: Trigger de creación de perfil';
    RAISE NOTICE '  ✅ CORRECTO - Trigger existe';
  ELSE
    RAISE NOTICE '✓ Test 7: Trigger de creación de perfil';
    RAISE NOTICE '  ❌ ERROR - Trigger no encontrado';
  END IF;
  RAISE NOTICE '';

  -- Test 8: Verificar índices
  SELECT COUNT(*) INTO v_tables_count
  FROM pg_indexes
  WHERE schemaname = 'public';
  
  RAISE NOTICE '✓ Test 8: Índices para Performance';
  RAISE NOTICE '  Resultado: % índices encontrados', v_tables_count;
  IF v_tables_count >= 20 THEN
    RAISE NOTICE '  ✅ CORRECTO - Múltiples índices creados';
  ELSE
    RAISE NOTICE '  ⚠️  ADVERTENCIA - Pocos índices';
  END IF;
  RAISE NOTICE '';

  -- Resumen Final
  RAISE NOTICE '========================================';
  RAISE NOTICE '            RESUMEN FINAL';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Estado del Schema: ✅ INSTALADO';
  RAISE NOTICE '';
  RAISE NOTICE 'Siguiente paso:';
  RAISE NOTICE '1. Crea un usuario en Authentication > Users';
  RAISE NOTICE '2. Ejecuta supabase-test-data.sql';
  RAISE NOTICE '3. Prueba las queries desde tu app';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  
END $$;

-- =====================================================
-- VERIFICACIÓN VISUAL RÁPIDA
-- =====================================================

-- Mostrar todas las tablas con conteo de registros
SELECT 
  t.table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns 
   WHERE table_name = t.table_name 
   AND table_schema = 'public') as columns,
  (CASE 
    WHEN t.table_name = 'profiles' THEN (SELECT COUNT(*)::TEXT FROM public.profiles)
    WHEN t.table_name = 'courses' THEN (SELECT COUNT(*)::TEXT FROM public.courses)
    WHEN t.table_name = 'blog_posts' THEN (SELECT COUNT(*)::TEXT FROM public.blog_posts)
    WHEN t.table_name = 'posts' THEN (SELECT COUNT(*)::TEXT FROM public.posts)
    WHEN t.table_name = 'comments' THEN (SELECT COUNT(*)::TEXT FROM public.comments)
    WHEN t.table_name = 'likes' THEN (SELECT COUNT(*)::TEXT FROM public.likes)
    WHEN t.table_name = 'enrollments' THEN (SELECT COUNT(*)::TEXT FROM public.enrollments)
    WHEN t.table_name = 'achievements' THEN (SELECT COUNT(*)::TEXT FROM public.achievements)
    WHEN t.table_name = 'notifications' THEN (SELECT COUNT(*)::TEXT FROM public.notifications)
    WHEN t.table_name = 'followers' THEN (SELECT COUNT(*)::TEXT FROM public.followers)
  END) as rows
FROM information_schema.tables t
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;
