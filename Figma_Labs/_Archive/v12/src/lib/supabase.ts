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

// Database Types (Auto-generated from Supabase schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          website: string | null;
          twitter: string | null;
          github: string | null;
          linkedin: string | null;
          created_at: string;
          updated_at: string;
          followers_count: number;
          following_count: number;
          posts_count: number;
          verified: boolean;
        };
        Insert: {
          id?: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          twitter?: string | null;
          github?: string | null;
          linkedin?: string | null;
          created_at?: string;
          updated_at?: string;
          followers_count?: number;
          following_count?: number;
          posts_count?: number;
          verified?: boolean;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          twitter?: string | null;
          github?: string | null;
          linkedin?: string | null;
          created_at?: string;
          updated_at?: string;
          followers_count?: number;
          following_count?: number;
          posts_count?: number;
          verified?: boolean;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          image_url: string | null;
          likes_count: number;
          comments_count: number;
          reposts_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          image_url?: string | null;
          likes_count?: number;
          comments_count?: number;
          reposts_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          image_url?: string | null;
          likes_count?: number;
          comments_count?: number;
          reposts_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_url: string | null;
          instructor_id: string;
          category: string;
          level: string;
          price: number;
          duration_hours: number;
          rating: number;
          students_count: number;
          featured: boolean;
          status: string;
          created_at: string;
          updated_at: string;
          what_you_learn: string[] | null;
          requirements: string[] | null;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          image_url?: string | null;
          instructor_id: string;
          category: string;
          level: string;
          price?: number;
          duration_hours?: number;
          rating?: number;
          students_count?: number;
          featured?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
          what_you_learn?: string[] | null;
          requirements?: string[] | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          image_url?: string | null;
          instructor_id?: string;
          category?: string;
          level?: string;
          price?: number;
          duration_hours?: number;
          rating?: number;
          students_count?: number;
          featured?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
          what_you_learn?: string[] | null;
          requirements?: string[] | null;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          excerpt: string;
          content: string;
          author_id: string;
          image_url: string | null;
          category: string;
          tags: string[] | null;
          published: boolean;
          views_count: number;
          read_time_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          excerpt: string;
          content: string;
          author_id: string;
          image_url?: string | null;
          category: string;
          tags?: string[] | null;
          published?: boolean;
          views_count?: number;
          read_time_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          excerpt?: string;
          content?: string;
          author_id?: string;
          image_url?: string | null;
          category?: string;
          tags?: string[] | null;
          published?: boolean;
          views_count?: number;
          read_time_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          icon: string;
          earned_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          icon: string;
          earned_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          icon?: string;
          earned_at?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          read?: boolean;
          link?: string | null;
          created_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          progress: number;
          completed: boolean;
          enrolled_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          progress?: number;
          completed?: boolean;
          enrolled_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          progress?: number;
          completed?: boolean;
          enrolled_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          order: number;
          duration: number;
          is_locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          order: number;
          duration?: number;
          is_locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          order?: number;
          duration?: number;
          is_locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          description: string | null;
          type: string;
          duration: number;
          order: number;
          is_locked: boolean;
          is_completed: boolean;
          resources: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          description?: string | null;
          type: string;
          duration?: number;
          order: number;
          is_locked?: boolean;
          is_completed?: boolean;
          resources?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          description?: string | null;
          type?: string;
          duration?: number;
          order?: number;
          is_locked?: boolean;
          is_completed?: boolean;
          resources?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_manifest: {
        Row: {
          id: string;
          filename: string;
          filepath: string;
          source: string;
          storage_path: string | null;
          size_bytes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          filename: string;
          filepath: string;
          source: string;
          storage_path?: string | null;
          size_bytes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          filename?: string;
          filepath?: string;
          source?: string;
          storage_path?: string | null;
          size_bytes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Supabase Helpers - Wrapper functions for common operations
export const supabaseHelpers = {
  // Direct supabase client access
  supabase,

  // Profiles
  profiles: {
    get: async (userId: string) => {
      return await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    },
    list: async (limit = 100) => {
      return await supabase
        .from('profiles')
        .select('*')
        .limit(limit);
    },
    create: async (profile: Database['public']['Tables']['profiles']['Insert']) => {
      return await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single();
    },
    update: async (userId: string, updates: Database['public']['Tables']['profiles']['Update']) => {
      return await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    }
  },

  // Posts
  posts: {
    list: async (userId?: string, options?: { limit?: number; offset?: number }) => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          user:profiles!posts_user_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      return await query;
    },
    get: async (postId: string) => {
      return await supabase
        .from('posts')
        .select(`
          *,
          user:profiles!posts_user_id_fkey(*)
        `)
        .eq('id', postId)
        .single();
    },
    create: async (post: Database['public']['Tables']['posts']['Insert']) => {
      return await supabase
        .from('posts')
        .insert([post])
        .select()
        .single();
    },
    update: async (postId: string, updates: Database['public']['Tables']['posts']['Update']) => {
      return await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();
    },
    delete: async (postId: string) => {
      return await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
    }
  },

  // Courses
  courses: {
    list: async (options?: { category?: string; level?: string; featured?: boolean; limit?: number }) => {
      let query = supabase
        .from('courses')
        .select(`
          *,
          instructor:users!courses_instructor_id_fkey(*)
        `)
        .eq('status', 'published')
        .order('students_count', { ascending: false });

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.level) {
        query = query.eq('level', options.level);
      }

      if (options?.featured !== undefined) {
        query = query.eq('featured', options.featured);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    },
    get: async (courseId: string) => {
      return await supabase
        .from('courses')
        .select(`
          *,
          instructor:users!courses_instructor_id_fkey(*),
          modules(
            *,
            lessons(*)
          )
        `)
        .eq('id', courseId)
        .single();
    },
    create: async (course: Database['public']['Tables']['courses']['Insert']) => {
      return await supabase
        .from('courses')
        .insert([course])
        .select()
        .single();
    },
    update: async (courseId: string, updates: Database['public']['Tables']['courses']['Update']) => {
      return await supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId)
        .select()
        .single();
    },
    delete: async (courseId: string) => {
      return await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
    }
  },

  // Blog Posts
  blog: {
    list: async (options?: { category?: string; published?: boolean; limit?: number }) => {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          author:users!blog_posts_author_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.published !== undefined) {
        query = query.eq('published', options.published);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    },
    get: async (postId: string) => {
      return await supabase
        .from('blog_posts')
        .select(`
          *,
          author:users!blog_posts_author_id_fkey(*)
        `)
        .eq('id', postId)
        .single();
    },
    create: async (post: Database['public']['Tables']['blog_posts']['Insert']) => {
      return await supabase
        .from('blog_posts')
        .insert([post])
        .select()
        .single();
    },
    update: async (postId: string, updates: Database['public']['Tables']['blog_posts']['Update']) => {
      return await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();
    },
    delete: async (postId: string) => {
      return await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
    }
  },

  // Users
  users: {
    list: async (limit = 100) => {
      return await supabase
        .from('users')
        .select('*')
        .limit(limit);
    },
    get: async (userId: string) => {
      return await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    },
    create: async (user: Database['public']['Tables']['users']['Insert']) => {
      return await supabase
        .from('users')
        .insert([user])
        .select()
        .single();
    },
    update: async (userId: string, updates: Database['public']['Tables']['users']['Update']) => {
      return await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    }
  },

  // Realtime subscriptions
  realtime: {
    subscribeToPosts: (callback: (payload: any) => void) => {
      return supabase
        .channel('posts-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, callback)
        .subscribe();
    },
    subscribeToCourses: (callback: (payload: any) => void) => {
      return supabase
        .channel('courses-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, callback)
        .subscribe();
    },
    subscribeToBlogPosts: (callback: (payload: any) => void) => {
      return supabase
        .channel('blog-posts-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_posts' }, callback)
        .subscribe();
    },
    unsubscribe: (channel: any) => {
      return supabase.removeChannel(channel);
    }
  }
};
