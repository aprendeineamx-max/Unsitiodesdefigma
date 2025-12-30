import { useState } from 'react';
import { Database, Copy, CheckCircle, ExternalLink, Shield } from 'lucide-react';

const DATABASE_SQL_SAFE = `-- ==========================================
-- PLATZI CLONE - SAFE MIGRATION SCRIPT  
-- ==========================================
-- ✅ MIGRACIÓN SEGURA - NO ELIMINA DATOS
-- Este script agrega las columnas y tablas faltantes sin eliminar nada

-- ==========================================
-- PASO 1: Crear tablas nuevas que no existen  
-- ==========================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0,
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  instructor TEXT NOT NULL,
  instructor_avatar TEXT,
  instructor_title TEXT,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  original_price DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0,
  students INTEGER DEFAULT 0,
  duration TEXT,
  lessons_count INTEGER DEFAULT 0,
  image TEXT,
  thumbnail TEXT,
  video_url TEXT,
  certificate BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  bestseller BOOLEAN DEFAULT false,
  new_course BOOLEAN DEFAULT false,
  features JSONB,
  what_you_learn JSONB,
  requirements JSONB,
  modules JSONB,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agregar columnas a COURSES si no existen
DO $$ 
BEGIN
  -- Primero, eliminar constraints y cambiar tipos si es necesario
  BEGIN
    -- Cambiar duration de INTEGER a TEXT si existe
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='courses' AND column_name='duration' AND data_type='integer'
    ) THEN
      ALTER TABLE courses ALTER COLUMN duration TYPE TEXT;
    END IF;
  EXCEPTION WHEN others THEN
    NULL; -- Ignorar errores si la columna no existe
  END;

  -- Agregar columnas básicas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='instructor') THEN
    ALTER TABLE courses ADD COLUMN instructor TEXT;
    UPDATE courses SET instructor = 'Instructor' WHERE instructor IS NULL;
    ALTER TABLE courses ALTER COLUMN instructor SET NOT NULL;
  END IF;
  
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS subtitle TEXT;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS description TEXT;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_avatar TEXT;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_title TEXT;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='level') THEN
    ALTER TABLE courses ADD COLUMN level TEXT;
    UPDATE courses SET level = 'Intermedio' WHERE level IS NULL;
    ALTER TABLE courses ALTER COLUMN level SET NOT NULL;
  END IF;
  
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS students INTEGER DEFAULT 0;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration TEXT;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS lessons_count INTEGER DEFAULT 0;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS image TEXT;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail TEXT;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS video_url TEXT;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate BOOLEAN DEFAULT false;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS bestseller BOOLEAN DEFAULT false;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS new_course BOOLEAN DEFAULT false;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS features JSONB;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS what_you_learn JSONB;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS requirements JSONB;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS modules JSONB;
  ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT[];
END $$;

-- 3. MODULES TABLE
CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. LESSONS TABLE
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES modules(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  type TEXT NOT NULL,
  video_url TEXT,
  content TEXT,
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. POSTS TABLE (Feed Social)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  achievement_badge TEXT,
  achievement_title TEXT,
  course_title TEXT,
  course_image TEXT,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. LIKES TABLE
CREATE TABLE IF NOT EXISTS likes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  comment_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agregar constraints únicos si no existen
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'likes_user_id_post_id_key') THEN
    ALTER TABLE likes ADD CONSTRAINT likes_user_id_post_id_key UNIQUE(user_id, post_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'likes_user_id_comment_id_key') THEN
    ALTER TABLE likes ADD CONSTRAINT likes_user_id_comment_id_key UNIQUE(user_id, comment_id);
  END IF;
END $$;

-- 8. BLOG_POSTS TABLE
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  author_role TEXT,
  category TEXT NOT NULL,
  image TEXT,
  published_at TIMESTAMP DEFAULT NOW(),
  read_time INTEGER,
  tags TEXT[],
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. BADGES TABLE
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. USER_BADGES TABLE
CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT REFERENCES badges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  earned_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 11. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  badge_id TEXT REFERENCES badges(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 12. CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  reward_xp INTEGER DEFAULT 0,
  reward_coins INTEGER DEFAULT 0,
  reward_badge TEXT,
  goal INTEGER NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 13. USER_CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS user_challenges (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  challenge_id TEXT REFERENCES challenges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- 14. STUDY_GROUPS TABLE
CREATE TABLE IF NOT EXISTS study_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  course_id TEXT REFERENCES courses(id),
  category TEXT,
  members_count INTEGER DEFAULT 0,
  max_members INTEGER,
  is_private BOOLEAN DEFAULT false,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 15. FORUM_POSTS TABLE
CREATE TABLE IF NOT EXISTS forum_posts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_solved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 16. USER_PROGRESS TABLE
CREATE TABLE IF NOT EXISTS user_progress (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  progress DECIMAL(5,2) DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  last_accessed TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id, lesson_id)
);

-- 17. ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  progress DECIMAL(5,2) DEFAULT 0,
  certificate_issued BOOLEAN DEFAULT false,
  UNIQUE(user_id, course_id)
);

-- ==========================================
-- PASO 2: Crear índices para mejor performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);

-- ==========================================
-- PASO 3: Configurar RLS (Row Level Security)
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Crear políticas solo si no existen
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON users FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'courses' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON courses FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'modules' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON modules FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lessons' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON lessons FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON posts FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON comments FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON likes FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON blog_posts FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON badges FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_badges' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON user_badges FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON achievements FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'challenges' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON challenges FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_challenges' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON user_challenges FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'study_groups' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON study_groups FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forum_posts' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON forum_posts FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON user_progress FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'enrollments' AND policyname = 'Allow all for development') THEN
    CREATE POLICY "Allow all for development" ON enrollments FOR ALL USING (true);
  END IF;
END $$;

-- ==========================================
-- ✅ ¡MIGRACIÓN COMPLETADA! 
-- ==========================================
-- Tus datos existentes se han preservado
-- Ahora ejecuta "Master Data Sync" para insertar nuevos datos
`;

export function DatabaseSetup() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(DATABASE_SQL_SAFE);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl shadow-2xl border-2 border-emerald-600 p-6 w-full max-w-6xl mx-auto max-h-[90vh] overflow-hidden flex flex-col relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">
            Database Setup (Con TEXT IDs)
          </h2>
          <p className="text-sm text-slate-300">
            ✅ Compatible con tus IDs existentes ('1', '2', etc.)
          </p>
        </div>
      </div>

      {/* Safe Mode Badge */}
      <div className="mb-4 p-4 bg-emerald-900/30 rounded-xl border-2 border-emerald-600">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-emerald-300 mb-1">
              Esquema Actualizado
            </h3>
            <p className="text-sm text-emerald-200">
              Todas las tablas usan TEXT para IDs en lugar de UUID. Esto permite usar IDs simples como '1', '2', 'demo-user-001', etc.
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-4 p-4 bg-blue-900/30 rounded-xl border border-blue-700">
        <h3 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Instrucciones
        </h3>
        <ol className="text-sm text-blue-200 space-y-1 ml-4 list-decimal">
          <li>Copia el SQL con el botón de abajo</li>
          <li>Ve a tu Dashboard de Supabase → SQL Editor</li>
          <li>Pega y ejecuta el SQL</li>
          <li>Una vez completado, usa "Master Data Sync" para insertar los datos</li>
        </ol>
      </div>

      {/* Copy Button */}
      <div className="mb-4">
        <button
          onClick={copyToClipboard}
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <CheckCircle className="w-5 h-5" />
              ¡Copiado al Clipboard!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copiar SQL
            </>
          )}
        </button>
      </div>

      {/* SQL Preview */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h3 className="font-bold text-slate-200 mb-2 text-sm">Vista Previa del SQL:</h3>
        <div className="flex-1 overflow-auto bg-slate-900 rounded-lg border border-slate-700">
          <pre className="p-4 text-xs font-mono text-green-300 whitespace-pre-wrap break-words">
            {DATABASE_SQL_SAFE}
          </pre>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Database className="w-4 h-4" />
          <span>Este script es seguro y no eliminará tus datos existentes</span>
        </div>
      </div>
    </div>
  );
}