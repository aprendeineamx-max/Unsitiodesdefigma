import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// ==========================================
// CUSTOM HOOKS FOR SUPABASE DATA FETCHING
// ==========================================

// Courses Hook
export function useCourses(options?: { category?: string; difficulty?: string; limit?: number; featured?: boolean }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
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

        if (options?.difficulty) {
          query = query.eq('difficulty', options.difficulty);
        }

        if (options?.featured) {
          query = query.eq('featured', true);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setCourses(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [options?.category, options?.difficulty, options?.limit, options?.featured]);

  return { courses, loading, error };
}

// Single Course Hook
export function useCourse(courseId: string | undefined) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    async function fetchCourse() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
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

        if (fetchError) throw fetchError;
        setCourse(data);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId]);

  return { course, loading, error };
}

// Blog Posts Hook
export function useBlogPosts(options?: { limit?: number; category?: string; featured?: boolean }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        let query = supabase
          .from('blog_posts')
          .select(`
            *,
            author:users!blog_posts_author_id_fkey(*)
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (options?.category) {
          query = query.eq('category', options.category);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setPosts(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [options?.limit, options?.category, options?.featured]);

  return { posts, loading, error };
}

// Single Blog Post Hook
export function useBlogPost(slug: string | undefined) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    async function fetchPost() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('blog_posts')
          .select(`
            *,
            author:users!blog_posts_author_id_fkey(*)
          `)
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (fetchError) throw fetchError;

        // Increment view count
        if (data) {
          await supabase
            .from('blog_posts')
            .update({ views_count: (data.views_count || 0) + 1 })
            .eq('id', data.id);
        }

        setPost(data);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  return { post, loading, error };
}

// Social Posts Hook
export function useSocialPosts(options?: { type?: 'post' | 'story' | 'reel' | 'live'; limit?: number }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        let query = supabase
          .from('posts')
          .select(`
            *,
            user:users!posts_user_id_fkey(*)
          `)
          .order('created_at', { ascending: false });

        if (options?.type) {
          query = query.eq('type', options.type);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setPosts(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching social posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [options?.type, options?.limit]);

  return { posts, loading, error };
}

// Study Groups Hook
export function useStudyGroups(options?: { limit?: number; category?: string }) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchGroups() {
      try {
        setLoading(true);
        let query = supabase
          .from('study_groups')
          .select('*')
          .eq('is_private', false)
          .order('members_count', { ascending: false });

        if (options?.category) {
          query = query.eq('category', options.category);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setGroups(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching study groups:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, [options?.limit, options?.category]);

  return { groups, loading, error };
}

// User Progress Hook
export function useUserProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchProgress() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('user_progress')
          .select(`
            *,
            course:courses(*),
            lesson:lessons(*)
          `)
          .eq('user_id', userId)
          .order('last_accessed', { ascending: false });

        if (fetchError) throw fetchError;
        setProgress(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching user progress:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [userId]);

  return { progress, loading, error };
}

// User Enrollments Hook
export function useEnrollments(userId: string | undefined) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchEnrollments() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('enrollments')
          .select(`
            *,
            course:courses(*)
          `)
          .eq('user_id', userId)
          .order('last_accessed_at', { ascending: false });

        if (fetchError) throw fetchError;
        setEnrollments(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching enrollments:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEnrollments();
  }, [userId]);

  return { enrollments, loading, error };
}

// Badges Hook
export function useBadges(userId?: string) {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBadges() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('badges')
          .select('*')
          .order('rarity', { ascending: false });

        if (fetchError) throw fetchError;
        setBadges(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching badges:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
  }, [userId]);

  return { badges, loading, error };
}

// Challenges Hook
export function useChallenges(options?: { active?: boolean }) {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchChallenges() {
      try {
        setLoading(true);
        let query = supabase
          .from('challenges')
          .select('*')
          .order('created_at', { ascending: false });

        if (options?.active) {
          query = query.gte('expires_at', new Date().toISOString());
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setChallenges(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching challenges:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchChallenges();
  }, [options?.active]);

  return { challenges, loading, error };
}

// Forum Posts Hook
export function useForumPosts(options?: { courseId?: string; limit?: number }) {
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchForumPosts() {
      try {
        setLoading(true);
        let query = supabase
          .from('forum_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (options?.courseId) {
          query = query.eq('course_id', options.courseId);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setForumPosts(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching forum posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchForumPosts();
  }, [options?.courseId, options?.limit]);

  return { forumPosts, loading, error };
}

// ==========================================
// ACTIVITY TRACKING HOOKS
// ==========================================

// Activity Logs Hook - Get user's activity for a date range
export function useActivityLogs(userId: string | undefined, days: number = 7) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchActivities() {
      try {
        setLoading(true);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error: fetchError } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startDate.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (fetchError) throw fetchError;
        setActivities(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching activity logs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, [userId, days]);

  return { activities, loading, error };
}

// Deadlines Hook - Get user's upcoming deadlines
export function useDeadlines(userId: string | undefined, options?: { status?: string; limit?: number }) {
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchDeadlines() {
      try {
        setLoading(true);
        let query = supabase
          .from('deadlines')
          .select(`
            *,
            course:courses(*)
          `)
          .eq('user_id', userId)
          .order('due_date', { ascending: true });

        if (options?.status) {
          query = query.eq('status', options.status);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setDeadlines(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching deadlines:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDeadlines();
  }, [userId, options?.status, options?.limit]);

  return { deadlines, loading, error };
}

// Detailed User Progress Hook (lesson-level)
export function useDetailedProgress(userId: string | undefined, courseId?: string) {
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchProgress() {
      try {
        setLoading(true);
        let query = supabase
          .from('user_progress')
          .select(`
            *,
            course:courses(*),
            lesson:lessons(*),
            module:modules(*)
          `)
          .eq('user_id', userId)
          .order('last_accessed', { ascending: false });

        if (courseId) {
          query = query.eq('course_id', courseId);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setProgress(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching detailed progress:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [userId, courseId]);

  return { progress, loading, error };
}

// Study Sessions Hook
export function useStudySessions(userId: string | undefined, options?: { courseId?: string; limit?: number }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchSessions() {
      try {
        setLoading(true);
        let query = supabase
          .from('study_sessions')
          .select(`
            *,
            course:courses(*),
            lesson:lessons(*)
          `)
          .eq('user_id', userId)
          .order('started_at', { ascending: false });

        if (options?.courseId) {
          query = query.eq('course_id', options.courseId);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setSessions(data || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching study sessions:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [userId, options?.courseId, options?.limit]);

  return { sessions, loading, error };
}

// ==========================================
// ACTIVITY TRACKING UTILITIES
// ==========================================

// Update lesson progress
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  courseId: string,
  moduleId: string,
  data: {
    status?: 'not_started' | 'in_progress' | 'completed';
    progressPercentage?: number;
    timeSpent?: number;
  }
) {
  try {
    const updateData: any = {
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
      module_id: moduleId,
      last_accessed: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'in_progress' && !updateData.started_at) {
        updateData.started_at = new Date().toISOString();
      }
      if (data.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.progress_percentage = 100;
      }
    }

    if (data.progressPercentage !== undefined) {
      updateData.progress_percentage = data.progressPercentage;
    }

    if (data.timeSpent !== undefined) {
      updateData.time_spent = data.timeSpent;
    }

    const { data: result, error } = await supabase
      .from('user_progress')
      .upsert(updateData, { onConflict: 'user_id,lesson_id' })
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (err) {
    console.error('Error updating lesson progress:', err);
    return { data: null, error: err as Error };
  }
}

// Start a study session
export async function startStudySession(userId: string, courseId: string, lessonId?: string) {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error starting study session:', err);
    return { data: null, error: err as Error };
  }
}

// End a study session
export async function endStudySession(sessionId: string) {
  try {
    const endTime = new Date();
    
    // First get the session to calculate duration
    const { data: session, error: fetchError } = await supabase
      .from('study_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .single();

    if (fetchError) throw fetchError;

    const startTime = new Date(session.started_at);
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // in seconds

    const { data, error } = await supabase
      .from('study_sessions')
      .update({
        ended_at: endTime.toISOString(),
        duration
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error ending study session:', err);
    return { data: null, error: err as Error };
  }
}

// Create a deadline
export async function createDeadline(
  userId: string,
  data: {
    title: string;
    description?: string;
    type: 'assignment' | 'project' | 'quiz' | 'exam' | 'milestone';
    dueDate: Date;
    courseId?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }
) {
  try {
    const { data: result, error } = await supabase
      .from('deadlines')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description,
        type: data.type,
        due_date: data.dueDate.toISOString(),
        course_id: data.courseId,
        priority: data.priority || 'medium',
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (err) {
    console.error('Error creating deadline:', err);
    return { data: null, error: err as Error };
  }
}

// Update deadline status
export async function updateDeadlineStatus(
  deadlineId: string,
  status: 'pending' | 'submitted' | 'completed' | 'overdue'
) {
  try {
    const updateData: any = { status };
    
    if (status === 'completed' || status === 'submitted') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('deadlines')
      .update(updateData)
      .eq('id', deadlineId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error updating deadline status:', err);
    return { data: null, error: err as Error };
  }
}