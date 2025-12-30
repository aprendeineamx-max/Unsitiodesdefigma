-- =====================================================
-- SISTEMA DE COLABORACIÓN EN TIEMPO REAL
-- Documentos Markdown con Colaboración Estilo Google Docs
-- =====================================================
-- Fecha: 25 de Diciembre, 2024
-- Versión: 1.0.0
-- Características: Realtime, Comentarios, Versiones, Permisos
-- =====================================================

-- Enable necesarias extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. DOCUMENTS TABLE
-- Almacena todos los documentos markdown del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Metadata básica
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  file_path TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('roadmap', 'guide', 'api', 'tutorial', 'best-practices', 'other')) DEFAULT 'other',
  
  -- Contenido
  content TEXT NOT NULL DEFAULT '',
  frontmatter JSONB DEFAULT '{}'::jsonb,
  
  -- Ownership y permisos
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  visibility TEXT CHECK (visibility IN ('private', 'team', 'public')) DEFAULT 'private',
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'review', 'published', 'archived')) DEFAULT 'draft',
  
  -- Estadísticas
  version INTEGER DEFAULT 1,
  views_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  collaborators_count INTEGER DEFAULT 0,
  
  -- Metadata de edición
  last_edited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Índices para performance
CREATE INDEX idx_documents_owner ON public.documents(owner_id);
CREATE INDEX idx_documents_category ON public.documents(category);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_visibility ON public.documents(visibility);
CREATE INDEX idx_documents_slug ON public.documents(slug);
CREATE INDEX idx_documents_file_path ON public.documents(file_path);
CREATE INDEX idx_documents_last_edited ON public.documents(last_edited_at DESC);

-- Full text search index
CREATE INDEX idx_documents_title_search ON public.documents USING gin(to_tsvector('english', title));
CREATE INDEX idx_documents_content_search ON public.documents USING gin(to_tsvector('english', content));

-- =====================================================
-- 2. DOCUMENT_VERSIONS TABLE
-- Historial completo de versiones (Git-like)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  
  -- Version data
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  frontmatter JSONB DEFAULT '{}'::jsonb,
  
  -- Diff information
  diff_from_previous TEXT, -- Diff en formato unified diff
  changes_summary JSONB DEFAULT '{}'::jsonb, -- { lines_added, lines_removed, chars_changed }
  
  -- Author info
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  commit_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  
  -- Constraints
  UNIQUE(document_id, version_number)
);

-- Índices
CREATE INDEX idx_versions_document ON public.document_versions(document_id, version_number DESC);
CREATE INDEX idx_versions_author ON public.document_versions(created_by);
CREATE INDEX idx_versions_created ON public.document_versions(created_at DESC);

-- =====================================================
-- 3. DOCUMENT_COLLABORATORS TABLE
-- Sistema de permisos y roles por documento
-- =====================================================
CREATE TABLE IF NOT EXISTS public.document_collaborators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Role-based permissions
  role TEXT CHECK (role IN ('owner', 'editor', 'commenter', 'viewer')) DEFAULT 'viewer',
  
  -- Timestamps
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(document_id, user_id)
);

-- Índices
CREATE INDEX idx_collaborators_document ON public.document_collaborators(document_id);
CREATE INDEX idx_collaborators_user ON public.document_collaborators(user_id);
CREATE INDEX idx_collaborators_role ON public.document_collaborators(role);

-- =====================================================
-- 4. DOCUMENT_COMMENTS TABLE
-- Comentarios inline en documentos (Google Docs style)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.document_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  
  -- Comment data
  content TEXT NOT NULL,
  
  -- Position in document
  anchor_type TEXT CHECK (anchor_type IN ('selection', 'line', 'general')) DEFAULT 'general',
  anchor_start INTEGER, -- Line number or character position
  anchor_end INTEGER,
  anchor_text TEXT, -- Selected text when comment was created
  
  -- Thread support
  parent_id UUID REFERENCES public.document_comments(id) ON DELETE CASCADE,
  thread_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Author
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Índices
CREATE INDEX idx_comments_document ON public.document_comments(document_id, created_at DESC);
CREATE INDEX idx_comments_author ON public.document_comments(author_id);
CREATE INDEX idx_comments_parent ON public.document_comments(parent_id);
CREATE INDEX idx_comments_thread_resolved ON public.document_comments(thread_resolved);
CREATE INDEX idx_comments_anchor ON public.document_comments(document_id, anchor_start, anchor_end);

-- =====================================================
-- 5. DOCUMENT_PRESENCE TABLE
-- Presencia en tiempo real (quién está editando/viendo)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.document_presence (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Presence data
  status TEXT CHECK (status IN ('viewing', 'editing', 'idle')) DEFAULT 'viewing',
  cursor_position JSONB, -- { line, column, selection }
  
  -- Connection info
  connection_id TEXT NOT NULL, -- Unique per tab/window
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  
  -- Timestamps
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Índices
CREATE INDEX idx_presence_document ON public.document_presence(document_id);
CREATE INDEX idx_presence_user ON public.document_presence(user_id);
CREATE INDEX idx_presence_last_seen ON public.document_presence(last_seen_at DESC);
CREATE INDEX idx_presence_connection ON public.document_presence(connection_id);

-- =====================================================
-- 6. DOCUMENT_ACTIVITIES TABLE
-- Activity log completo (audit trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.document_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  
  -- Activity data
  activity_type TEXT CHECK (activity_type IN (
    'created', 'edited', 'viewed', 'commented', 'shared', 
    'permission_changed', 'version_created', 'restored', 
    'renamed', 'moved', 'published', 'archived'
  )) NOT NULL,
  
  -- Actor
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  
  -- Activity metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Índices
CREATE INDEX idx_activities_document ON public.document_activities(document_id, created_at DESC);
CREATE INDEX idx_activities_user ON public.document_activities(user_id);
CREATE INDEX idx_activities_type ON public.document_activities(activity_type);
CREATE INDEX idx_activities_created ON public.document_activities(created_at DESC);

-- =====================================================
-- 7. DOCUMENT_SHARES TABLE
-- Links compartidos con tokens únicos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.document_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  
  -- Share data
  share_token TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- Optional password protection
  
  -- Permissions
  allow_download BOOLEAN DEFAULT false,
  allow_comment BOOLEAN DEFAULT true,
  allow_edit BOOLEAN DEFAULT false,
  
  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Statistics
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  
  -- Creator
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Índices
CREATE INDEX idx_shares_document ON public.document_shares(document_id);
CREATE INDEX idx_shares_token ON public.document_shares(share_token);
CREATE INDEX idx_shares_expires ON public.document_shares(expires_at);

-- =====================================================
-- FUNCTIONS Y TRIGGERS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para auto-update de timestamps
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.document_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Increment document version
CREATE OR REPLACE FUNCTION increment_document_version()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content != NEW.content THEN
    NEW.version = OLD.version + 1;
    NEW.last_edited_at = TIMEZONE('utc'::TEXT, NOW());
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_version_on_content_change BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION increment_document_version();

-- Function: Auto-create version on document update
CREATE OR REPLACE FUNCTION auto_create_document_version()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.content != NEW.content THEN
    INSERT INTO public.document_versions (
      document_id,
      version_number,
      content,
      frontmatter,
      created_by,
      commit_message
    ) VALUES (
      NEW.id,
      NEW.version,
      NEW.content,
      NEW.frontmatter,
      NEW.last_edited_by,
      'Auto-saved version'
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_version_on_update AFTER UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION auto_create_document_version();

-- Function: Update comment counts
CREATE OR REPLACE FUNCTION update_document_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.documents 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.document_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.documents 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.document_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comment_count AFTER INSERT OR DELETE ON public.document_comments
  FOR EACH ROW EXECUTE FUNCTION update_document_comment_count();

-- Function: Cleanup old presence records (heartbeat timeout)
CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS void AS $$
BEGIN
  DELETE FROM public.document_presence
  WHERE last_seen_at < (NOW() - INTERVAL '2 minutes');
END;
$$ language 'plpgsql';

-- Function: Log document activity
CREATE OR REPLACE FUNCTION log_document_activity(
  p_document_id UUID,
  p_user_id UUID,
  p_activity_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.document_activities (
    document_id,
    user_id,
    activity_type,
    metadata,
    description
  ) VALUES (
    p_document_id,
    p_user_id,
    p_activity_type,
    p_metadata,
    p_description
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ language 'plpgsql';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (
    auth.uid() = owner_id 
    OR visibility = 'public'
    OR EXISTS (
      SELECT 1 FROM public.document_collaborators 
      WHERE document_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE USING (
    auth.uid() = owner_id 
    OR EXISTS (
      SELECT 1 FROM public.document_collaborators 
      WHERE document_id = id AND user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING (auth.uid() = owner_id);

-- Versions policies
CREATE POLICY "Users can view versions of accessible documents" ON public.document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE id = document_id 
      AND (owner_id = auth.uid() OR visibility = 'public')
    )
  );

-- Collaborators policies
CREATE POLICY "Users can view collaborators of their documents" ON public.document_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE id = document_id AND owner_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Owners can manage collaborators" ON public.document_collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE id = document_id AND owner_id = auth.uid()
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments on accessible documents" ON public.document_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE id = document_id 
      AND (
        owner_id = auth.uid() 
        OR visibility = 'public'
        OR EXISTS (
          SELECT 1 FROM public.document_collaborators 
          WHERE document_id = id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create comments" ON public.document_comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.documents 
      WHERE id = document_id 
      AND (
        owner_id = auth.uid()
        OR visibility = 'public'
        OR EXISTS (
          SELECT 1 FROM public.document_collaborators 
          WHERE document_id = id 
          AND user_id = auth.uid() 
          AND role IN ('owner', 'editor', 'commenter')
        )
      )
    )
  );

CREATE POLICY "Users can update their own comments" ON public.document_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON public.document_comments
  FOR DELETE USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM public.documents 
      WHERE id = document_id AND owner_id = auth.uid()
    )
  );

-- Presence policies
CREATE POLICY "Users can view presence on accessible documents" ON public.document_presence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE id = document_id 
      AND (
        owner_id = auth.uid()
        OR visibility = 'public'
        OR EXISTS (
          SELECT 1 FROM public.document_collaborators 
          WHERE document_id = id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage their own presence" ON public.document_presence
  FOR ALL USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users can view activities of accessible documents" ON public.document_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE id = document_id 
      AND (
        owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.document_collaborators 
          WHERE document_id = id AND user_id = auth.uid()
        )
      )
    )
  );

-- Shares policies
CREATE POLICY "Users can view shares of their documents" ON public.document_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE id = document_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shares for their documents" ON public.document_shares
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.documents 
      WHERE id = document_id AND owner_id = auth.uid()
    )
  );

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_collaborators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_activities;

-- =====================================================
-- INITIAL DATA / SEED
-- =====================================================

-- Esta sección se puede usar para migrar documentos existentes
-- desde el sistema de auto-discovery al nuevo sistema de BD

COMMENT ON TABLE public.documents IS 'Documentos markdown con soporte de colaboración en tiempo real';
COMMENT ON TABLE public.document_versions IS 'Historial completo de versiones tipo Git';
COMMENT ON TABLE public.document_collaborators IS 'Sistema de permisos y roles por documento';
COMMENT ON TABLE public.document_comments IS 'Comentarios inline estilo Google Docs';
COMMENT ON TABLE public.document_presence IS 'Presencia en tiempo real de usuarios';
COMMENT ON TABLE public.document_activities IS 'Log de actividades completo (audit trail)';
COMMENT ON TABLE public.document_shares IS 'Links compartidos con tokens únicos';

-- =====================================================
-- PERFORMANCE & MONITORING
-- =====================================================

-- Estadísticas útiles
CREATE OR REPLACE VIEW document_stats AS
SELECT 
  d.id,
  d.title,
  d.owner_id,
  d.version,
  d.views_count,
  d.comments_count,
  COUNT(DISTINCT dv.id) as versions_count,
  COUNT(DISTINCT dc.id) as collaborators_count,
  COUNT(DISTINCT dp.id) as active_users_count,
  MAX(da.created_at) as last_activity_at
FROM public.documents d
LEFT JOIN public.document_versions dv ON dv.document_id = d.id
LEFT JOIN public.document_collaborators dc ON dc.document_id = d.id
LEFT JOIN public.document_presence dp ON dp.document_id = d.id 
  AND dp.last_seen_at > (NOW() - INTERVAL '5 minutes')
LEFT JOIN public.document_activities da ON da.document_id = d.id
GROUP BY d.id;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$ 
BEGIN 
  RAISE NOTICE '✅ Sistema de Colaboración creado exitosamente';
  RAISE NOTICE '📊 Tablas: documents, document_versions, document_collaborators';
  RAISE NOTICE '💬 Tablas: document_comments, document_presence, document_activities';
  RAISE NOTICE '🔗 Tablas: document_shares';
  RAISE NOTICE '🔐 RLS habilitado en todas las tablas';
  RAISE NOTICE '⚡ Realtime habilitado para sincronización en vivo';
  RAISE NOTICE '🎉 Sistema listo para colaboración estilo Google Docs';
END $$;
