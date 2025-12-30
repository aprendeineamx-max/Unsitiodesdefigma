import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
// Project: bundle-faster-open@duck.com's Project
// Region: Americas
// Environment: Production

const supabaseUrl = 'https://bntwyvwavxgspvcvelay.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudHd5dndhdnhnc3B2Y3ZlbGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MjAyNTksImV4cCI6MjA4MjA5NjI1OX0.oK5z3UnEybSVl7Hj4V7UwG4AQvSdzijJEV1ztNRJboQ';

// Create Supabase client
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

// Database Types (Auto-generated from Supabase schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'student' | 'instructor' | 'admin';
          level: number;
          xp: number;
          streak: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          thumbnail_url: string;
          instructor_id: string;
          category: string;
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          duration: number;
          price: number;
          rating: number;
          students_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['courses']['Insert']>;
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          image_url: string | null;
          video_url: string | null;
          type: 'post' | 'story' | 'reel' | 'live';
          likes_count: number;
          comments_count: number;
          views_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
      };
      blog_posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          cover_image_url: string;
          category: string;
          tags: string[];
          status: 'draft' | 'published';
          views_count: number;
          likes_count: number;
          comments_count: number;
          reading_time: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blog_posts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>;
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          blog_post_id: string | null;
          parent_id: string | null;
          content: string;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          blog_post_id: string | null;
          comment_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['likes']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          progress: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['enrollments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['enrollments']['Insert']>;
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          description: string;
          icon: string;
          xp_reward: number;
          unlocked_at: string;
        };
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id' | 'unlocked_at'>;
        Update: never;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          action_url: string | null;
          read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      // =====================================================
      // COLLABORATION SYSTEM TABLES
      // =====================================================
      documents: {
        Row: {
          id: string;
          title: string;
          slug: string;
          file_path: string;
          category: 'roadmap' | 'guide' | 'api' | 'tutorial' | 'best-practices' | 'other';
          content: string;
          frontmatter: Record<string, any>;
          owner_id: string;
          visibility: 'private' | 'team' | 'public';
          status: 'draft' | 'review' | 'published' | 'archived';
          version: number;
          views_count: number;
          comments_count: number;
          collaborators_count: number;
          last_edited_by: string | null;
          last_edited_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'version' | 'views_count' | 'comments_count' | 'collaborators_count' | 'last_edited_at' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
      document_versions: {
        Row: {
          id: string;
          document_id: string;
          version_number: number;
          content: string;
          frontmatter: Record<string, any>;
          diff_from_previous: string | null;
          changes_summary: Record<string, any>;
          created_by: string;
          commit_message: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['document_versions']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      document_collaborators: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          role: 'owner' | 'editor' | 'commenter' | 'viewer';
          invited_by: string | null;
          invited_at: string;
          last_accessed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['document_collaborators']['Row'], 'id' | 'invited_at'>;
        Update: Partial<Omit<Database['public']['Tables']['document_collaborators']['Row'], 'id' | 'document_id' | 'user_id' | 'invited_by' | 'invited_at'>>;
      };
      document_comments: {
        Row: {
          id: string;
          document_id: string;
          content: string;
          anchor_type: 'selection' | 'line' | 'general';
          anchor_start: number | null;
          anchor_end: number | null;
          anchor_text: string | null;
          parent_id: string | null;
          thread_resolved: boolean;
          resolved_by: string | null;
          resolved_at: string | null;
          author_id: string;
          likes_count: number;
          replies_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['document_comments']['Row'], 'id' | 'likes_count' | 'replies_count' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['document_comments']['Insert']>;
      };
      document_presence: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          status: 'viewing' | 'editing' | 'idle';
          cursor_position: Record<string, any> | null;
          connection_id: string;
          last_seen_at: string;
          joined_at: string;
        };
        Insert: Omit<Database['public']['Tables']['document_presence']['Row'], 'id' | 'joined_at'>;
        Update: Partial<Omit<Database['public']['Tables']['document_presence']['Row'], 'id' | 'document_id' | 'user_id' | 'connection_id' | 'joined_at'>>;
      };
      document_activities: {
        Row: {
          id: string;
          document_id: string;
          activity_type: string;
          user_id: string;
          metadata: Record<string, any>;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['document_activities']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      document_shares: {
        Row: {
          id: string;
          document_id: string;
          share_token: string;
          password_hash: string | null;
          allow_download: boolean;
          allow_comment: boolean;
          allow_edit: boolean;
          expires_at: string | null;
          access_count: number;
          last_accessed_at: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['document_shares']['Row'], 'id' | 'access_count' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['document_shares']['Row'], 'id' | 'document_id' | 'share_token' | 'created_by' | 'created_at'>>;
      };
    };
    Views: {};
    Functions: {};
  };
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Direct supabase access
  supabase,
  
  // Auth helpers
  auth: {
    signUp: async (email: string, password: string, fullName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      return { data, error };
    },

    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      return { error };
    },

    getSession: async () => {
      const { data, error } = await supabase.auth.getSession();
      return { data, error };
    },

    getUser: async () => {
      const { data, error } = await supabase.auth.getUser();
      return { data, error };
    }
  },

  // Profile helpers
  profiles: {
    get: async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    },

    update: async (userId: string, updates: Database['public']['Tables']['profiles']['Update']) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    },

    addXP: async (userId: string, xp: number) => {
      // Get current profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', userId)
        .single();

      if (fetchError) return { data: null, error: fetchError };

      const newXP = (profile.xp || 0) + xp;
      const newLevel = Math.floor(newXP / 100) + 1; // 100 XP per level

      const { data, error } = await supabase
        .from('profiles')
        .update({ xp: newXP, level: newLevel })
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    }
  },

  // Blog helpers
  blog: {
    list: async (options?: { limit?: number; offset?: number; category?: string }) => {
      let query = supabase
        .from('blog_posts')
        .select('*, author:users(*)')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;
      return { data, error };
    },

    get: async (slug: string) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, author:users(*)')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      // Increment view count
      if (data) {
        await supabase
          .from('blog_posts')
          .update({ views_count: data.views_count + 1 })
          .eq('id', data.id);
      }

      return { data, error };
    },

    create: async (post: Database['public']['Tables']['blog_posts']['Insert']) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(post)
        .select()
        .single();
      return { data, error };
    },

    update: async (postId: string, updates: Database['public']['Tables']['blog_posts']['Update']) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();
      return { data, error };
    },

    delete: async (postId: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
      return { error };
    }
  },

  // Social posts helpers
  posts: {
    list: async (type?: 'post' | 'story' | 'reel' | 'live', options?: { limit?: number; offset?: number }) => {
      let query = supabase
        .from('posts')
        .select('*, user:users(*)')
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options?.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;
      return { data, error };
    },

    get: async (postId: string) => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, user:users(*)')
        .eq('id', postId)
        .single();

      // Increment view count
      if (data) {
        await supabase
          .from('posts')
          .update({ views_count: data.views_count + 1 })
          .eq('id', data.id);
      }

      return { data, error };
    },

    create: async (post: Database['public']['Tables']['posts']['Insert']) => {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single();
      return { data, error };
    },

    delete: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      return { error };
    }
  },

  // Comments helpers
  comments: {
    list: async (postId: string, blogPostId?: string) => {
      let query = supabase
        .from('comments')
        .select('*, user:users(*)')
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (blogPostId) {
        query = query.eq('blog_post_id', blogPostId);
      } else {
        query = query.eq('post_id', postId);
      }

      const { data, error } = await query;
      return { data, error };
    },

    create: async (comment: Database['public']['Tables']['comments']['Insert']) => {
      const { data, error } = await supabase
        .from('comments')
        .insert(comment)
        .select()
        .single();
      return { data, error };
    },

    delete: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      return { error };
    }
  },

  // Likes helpers
  likes: {
    toggle: async (userId: string, targetId: string, targetType: 'post' | 'blog_post' | 'comment') => {
      // Check if already liked
      const field = targetType === 'post' ? 'post_id' : targetType === 'blog_post' ? 'blog_post_id' : 'comment_id';
      
      const { data: existing, error: fetchError } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq(field, targetId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        return { data: null, error: fetchError };
      }

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existing.id);
        return { data: { liked: false }, error };
      } else {
        // Like
        const { data, error } = await supabase
          .from('likes')
          .insert({
            user_id: userId,
            [field]: targetId
          });
        return { data: { liked: true }, error };
      }
    },

    count: async (targetId: string, targetType: 'post' | 'blog_post' | 'comment') => {
      const field = targetType === 'post' ? 'post_id' : targetType === 'blog_post' ? 'blog_post_id' : 'comment_id';
      
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq(field, targetId);

      return { count: count || 0, error };
    }
  },

  // Courses helpers
  courses: {
    list: async (options?: { category?: string; difficulty?: string; limit?: number }) => {
      let query = supabase
        .from('courses')
        .select('*, instructor:users(*)')
        .order('students_count', { ascending: false });

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.difficulty) {
        query = query.eq('difficulty', options.difficulty);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      return { data, error };
    },

    get: async (courseId: string) => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, instructor:users(*)')
        .eq('id', courseId)
        .single();
      return { data, error };
    },

    enroll: async (userId: string, courseId: string) => {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          progress: 0
        })
        .select()
        .single();

      // Update course students count
      if (data) {
        await supabase.rpc('increment_course_students', { course_id: courseId });
      }

      return { data, error };
    },

    updateProgress: async (enrollmentId: string, progress: number) => {
      const { data, error } = await supabase
        .from('enrollments')
        .update({ 
          progress,
          ...(progress === 100 && { completed_at: new Date().toISOString() })
        })
        .eq('id', enrollmentId)
        .select()
        .single();
      return { data, error };
    }
  },

  // Real-time subscriptions
  realtime: {
    subscribeToPosts: (callback: (payload: any) => void) => {
      return supabase
        .channel('posts')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'posts' },
          callback
        )
        .subscribe();
    },

    subscribeToComments: (postId: string, callback: (payload: any) => void) => {
      return supabase
        .channel(`comments:${postId}`)
        .on('postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'comments',
            filter: `post_id=eq.${postId}`
          },
          callback
        )
        .subscribe();
    },

    unsubscribe: (channel: any) => {
      return supabase.removeChannel(channel);
    }
  }
};

export type { Database };