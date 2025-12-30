import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bntwyvwavxgspvcvelay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHd5dndhdnhnc3B2Y3ZlbGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MjAyNTksImV4cCI6MjA4MjA5NjI1OX0.oK5z3UnEybSVl7Hj4V7UwG4AQvSdzijJEV1ztNRJboQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSQLExecution() {
  console.log('🚀 Starting SQL Execution Tests...\n');

  // Test 1: Create user_progress table
  console.log('📊 Test 1: Creating user_progress table...');
  const { data: test1, error: error1 } = await supabase.rpc('exec_sql', {
    query: `CREATE TABLE IF NOT EXISTS public.user_progress (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
      lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
      module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
      status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
      progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
      time_spent INTEGER DEFAULT 0,
      started_at TIMESTAMP WITH TIME ZONE,
      completed_at TIMESTAMP WITH TIME ZONE,
      last_accessed TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
      UNIQUE(user_id, lesson_id)
    );`
  });
  
  if (error1) {
    console.error('❌ Error creating user_progress:', error1.message);
  } else {
    console.log('✅ user_progress table created successfully');
  }

  // Test 2: Create activity_logs table
  console.log('\n📊 Test 2: Creating activity_logs table...');
  const { data: test2, error: error2 } = await supabase.rpc('exec_sql', {
    query: `CREATE TABLE IF NOT EXISTS public.activity_logs (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      date DATE NOT NULL,
      study_time INTEGER DEFAULT 0,
      xp_earned INTEGER DEFAULT 0,
      lessons_completed INTEGER DEFAULT 0,
      exercises_completed INTEGER DEFAULT 0,
      course_activities JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
      UNIQUE(user_id, date)
    );`
  });
  
  if (error2) {
    console.error('❌ Error creating activity_logs:', error2.message);
  } else {
    console.log('✅ activity_logs table created successfully');
  }

  // Verify tables were created
  console.log('\n🔍 Verifying tables...');
  const { data: tables, error: tableError } = await supabase
    .from('user_progress')
    .select('*')
    .limit(1);
    
  if (tableError) {
    console.error('❌ Error verifying tables:', tableError.message);
  } else {
    console.log('✅ Tables verified successfully');
  }

  console.log('\n✅ All tests completed!');
}

testSQLExecution();
