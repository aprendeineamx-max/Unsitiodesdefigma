// ============================================================================
// BLOG TYPES - Ready for Supabase Integration
// ============================================================================

export interface BlogAuthor {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  role: string;
  bio: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  followers_count: number;
  posts_count: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color: string;
  posts_count: number;
  order: number;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  posts_count: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_id: string;
  author?: BlogAuthor;
  category_id: string;
  category?: BlogCategory;
  tags: BlogTag[];
  featured_image: string;
  published_at: string;
  updated_at: string;
  read_time: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  bookmarks_count: number;
  shares_count: number;
  featured: boolean;
  trending: boolean;
  status: 'draft' | 'published' | 'archived';
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  user?: {
    id: string;
    name: string;
    avatar: string;
    role?: string;
    verified: boolean;
  };
  parent_id?: string; // For nested replies
  content: string;
  likes_count: number;
  replies_count: number;
  replies?: BlogComment[];
  created_at: string;
  updated_at: string;
  edited: boolean;
  deleted: boolean;
}

export interface BlogLike {
  id: string;
  post_id?: string;
  comment_id?: string;
  user_id: string;
  created_at: string;
}

export interface BlogBookmark {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface BlogShare {
  id: string;
  post_id: string;
  user_id: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'whatsapp' | 'email' | 'copy';
  created_at: string;
}

export interface BlogFollow {
  id: string;
  follower_id: string;
  following_id: string; // Author being followed
  created_at: string;
}

export interface BlogReaction {
  id: string;
  post_id?: string;
  comment_id?: string;
  user_id: string;
  type: 'like' | 'love' | 'clap' | 'fire' | 'rocket' | 'brain';
  created_at: string;
}

export interface BlogNewsletterSubscription {
  id: string;
  email: string;
  user_id?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  categories: string[]; // Category IDs
  active: boolean;
  confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogReadingHistory {
  id: string;
  user_id: string;
  post_id: string;
  progress: number; // 0-100
  scroll_position: number;
  time_spent: number; // seconds
  completed: boolean;
  last_read_at: string;
  created_at: string;
}

// ============================================================================
// PHASE 3: ADVANCED SEARCH & DISCOVERY TYPES
// ============================================================================

export interface SearchFilters {
  categories: string[];
  tags: string[];
  authors: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'latest' | 'popular' | 'trending' | 'mostViewed' | 'mostLiked';
  readTime: 'all' | 'short' | 'medium' | 'long'; // short: <5min, medium: 5-15min, long: >15min
}

export interface SearchResult {
  id: string;
  type: 'post' | 'author' | 'tag';
  title: string;
  excerpt?: string;
  author?: {
    name: string;
    avatar: string;
  };
  image?: string;
  category?: string;
  tags?: string[];
  readTime?: number;
  views?: number;
  likes?: number;
  matchScore: number; // relevance score 0-100
  highlightedText?: string; // text snippet with search term highlighted
}

export interface SearchSuggestion {
  id: string;
  type: 'post' | 'tag' | 'author' | 'category';
  title: string;
  subtitle?: string;
  icon?: string;
  trending?: boolean;
}

// ============================================================================
// SUPABASE SCHEMAS (for reference when creating tables)
// ============================================================================

/*

-- Authors (extends users table)
CREATE TABLE blog_authors (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  avatar TEXT,
  role TEXT,
  bio TEXT,
  social JSONB DEFAULT '{}'::jsonb,
  followers_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  posts_count INTEGER DEFAULT 0,
  order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags
CREATE TABLE blog_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_id UUID REFERENCES blog_authors(id),
  category_id UUID REFERENCES blog_categories(id),
  featured_image TEXT,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  read_time INTEGER DEFAULT 5,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  trending BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Tags (many-to-many)
CREATE TABLE blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Comments
CREATE TABLE blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  edited BOOLEAN DEFAULT false,
  deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes
CREATE TABLE blog_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT like_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- Bookmarks
CREATE TABLE blog_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Shares
CREATE TABLE blog_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows
CREATE TABLE blog_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES auth.users(id),
  following_id UUID REFERENCES blog_authors(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Reactions
CREATE TABLE blog_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('like', 'love', 'clap', 'fire', 'rocket', 'brain')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT reaction_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE(user_id, post_id, type),
  UNIQUE(user_id, comment_id, type)
);

-- Newsletter Subscriptions
CREATE TABLE blog_newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  active BOOLEAN DEFAULT true,
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading History
CREATE TABLE blog_reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  scroll_position INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Indexes for performance
CREATE INDEX idx_posts_author ON blog_posts(author_id);
CREATE INDEX idx_posts_category ON blog_posts(category_id);
CREATE INDEX idx_posts_published ON blog_posts(published_at);
CREATE INDEX idx_posts_status ON blog_posts(status);
CREATE INDEX idx_posts_featured ON blog_posts(featured);
CREATE INDEX idx_comments_post ON blog_comments(post_id);
CREATE INDEX idx_comments_parent ON blog_comments(parent_id);
CREATE INDEX idx_likes_post ON blog_likes(post_id);
CREATE INDEX idx_likes_user ON blog_likes(user_id);
CREATE INDEX idx_bookmarks_user ON blog_bookmarks(user_id);
CREATE INDEX idx_follows_follower ON blog_follows(follower_id);
CREATE INDEX idx_follows_following ON blog_follows(following_id);

-- Row Level Security (RLS) Policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_bookmarks ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Published posts are viewable by everyone"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- Authors can manage their own posts
CREATE POLICY "Authors can manage their own posts"
  ON blog_posts FOR ALL
  USING (auth.uid() = author_id);

-- Anyone can read comments
CREATE POLICY "Comments are viewable by everyone"
  ON blog_comments FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON blog_comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update/delete their own comments
CREATE POLICY "Users can manage their own comments"
  ON blog_comments FOR ALL
  USING (auth.uid() = user_id);

*/