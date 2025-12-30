/**
 * Script de Verificación y Ejecución de SQL para Activity Tracking
 * Este script ejecuta todos los SQL necesarios y registra resultados
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bntwyvwavxgspvcvelay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHd5dndhdnhnc3B2Y3ZlbGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MjAyNTksImV4cCI6MjA4MjA5NjI1OX0.oK5z3UnEybSVl7Hj4V7UwG4AQvSdzijJEV1ztNRJboQ';

const supabase = createClient(supabaseUrl, supabaseKey);

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

async function logResult(name: string, success: boolean, error?: string, details?: any) {
  results.push({ name, success, error, details });
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (error) console.error(`   Error: ${error}`);
  if (details) console.log(`   Details:`, details);
}

async function verifyTable(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);
    
    return !error;
  } catch (err) {
    return false;
  }
}

async function main() {
  console.log('🚀 INICIANDO VERIFICACIÓN DE SQL SCRIPTS\n');
  console.log('=' .repeat(60));

  // NOTA IMPORTANTE: Como no tenemos acceso a exec_sql RPC,
  // vamos a verificar si las tablas existen mediante queries SELECT

  console.log('\n📋 PASO 1: Verificando tablas existentes...\n');

  // Verificar user_progress
  const hasUserProgress = await verifyTable('user_progress');
  await logResult(
    'Tabla user_progress',
    hasUserProgress,
    hasUserProgress ? undefined : 'Tabla no existe - necesita ser creada manualmente'
  );

  // Verificar activity_logs
  const hasActivityLogs = await verifyTable('activity_logs');
  await logResult(
    'Tabla activity_logs',
    hasActivityLogs,
    hasActivityLogs ? undefined : 'Tabla no existe - necesita ser creada manualmente'
  );

  // Verificar deadlines
  const hasDeadlines = await verifyTable('deadlines');
  await logResult(
    'Tabla deadlines',
    hasDeadlines,
    hasDeadlines ? undefined : 'Tabla no existe - necesita ser creada manualmente'
  );

  // Verificar study_sessions
  const hasStudySessions = await verifyTable('study_sessions');
  await logResult(
    'Tabla study_sessions',
    hasStudySessions,
    hasStudySessions ? undefined : 'Tabla no existe - necesita ser creada manualmente'
  );

  // Verificar tablas base
  console.log('\n📋 PASO 2: Verificando tablas base...\n');
  
  const hasProfiles = await verifyTable('profiles');
  await logResult('Tabla profiles', hasProfiles);

  const hasCourses = await verifyTable('courses');
  await logResult('Tabla courses', hasCourses);

  const hasLessons = await verifyTable('lessons');
  await logResult('Tabla lessons', hasLessons);

  const hasModules = await verifyTable('modules');
  await logResult('Tabla modules', hasModules);

  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE VERIFICACIÓN\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Exitosos: ${successful}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log(`📊 Total: ${results.length}\n`);

  if (failed > 0) {
    console.log('⚠️  ACCIÓN REQUERIDA:');
    console.log('Las tablas de Activity Tracking necesitan ser creadas.');
    console.log('Usar el SQL Executor en DevTools para ejecutar los scripts.\n');
  } else {
    console.log('🎉 ¡Todas las tablas están creadas correctamente!\n');
  }

  return results;
}

main().catch(console.error);

export { main as verifySQL };
