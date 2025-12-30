import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
// Project: bundle-faster-open@duck.com's Project
// Region: Americas
// Environment: Production

const supabaseUrl = 'https://bntwyvwavxgspvcvelay.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHd5dndhdnhnc3B2Y3ZlbGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MjAyNTksImV4cCI6MjA4MjA5NjI1OX0.oK5z3UnEybSVl7Hj4V7UwG4AQvSdzijJEV1ztNRJboQ';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHd5dndhdnhnc3B2Y3ZlbGF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUyMDI1OSwiZXhwIjoyMDgyMDk2MjU5fQ.h7UOc0Kd0ofFJz6YQYs4hgSvLkxl0-grfJS1VuzSPoo';

// Create Supabase client (anon key - for client-side operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'figma-make-platzi-clone'
    }
  }
});

// Create Supabase Admin client (service_role key - for server-side operations)
// ⚠️ WARNING: Service role key bypasses RLS. Use only in secure contexts.
// Use cases: Admin operations, Storage management, Bypass RLS when needed
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'figma-make-platzi-clone-admin'
    }
  }
});