import { useState, useEffect } from 'react';
import { supabase, supabaseHelpers } from '../../lib/supabase';
import { Check, X, Loader, Database } from 'lucide-react';

export function SupabaseTest() {
  const [testResults, setTestResults] = useState<{
    connection: 'pending' | 'success' | 'error';
    profiles: 'pending' | 'success' | 'error';
    courses: 'pending' | 'success' | 'error';
    blogPosts: 'pending' | 'success' | 'error';
    posts: 'pending' | 'success' | 'error';
  }>({
    connection: 'pending',
    profiles: 'pending',
    courses: 'pending',
    blogPosts: 'pending',
    posts: 'pending',
  });

  const [data, setData] = useState<{
    profilesCount: number;
    coursesCount: number;
    blogPostsCount: number;
    postsCount: number;
    firstCourse: any;
    firstBlogPost: any;
  } | null>(null);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    try {
      // Test 1: Connection
      setTestResults(prev => ({ ...prev, connection: 'pending' }));
      const { data: connectionTest, error: connectionError } = await supabase
        .from('profiles')
        .select('count');
      
      if (connectionError) {
        setTestResults(prev => ({ ...prev, connection: 'error' }));
        console.error('Connection error:', connectionError);
        return;
      }
      setTestResults(prev => ({ ...prev, connection: 'success' }));

      // Test 2: Profiles
      setTestResults(prev => ({ ...prev, profiles: 'pending' }));
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        setTestResults(prev => ({ ...prev, profiles: 'error' }));
        console.error('Profiles error:', profilesError);
      } else {
        setTestResults(prev => ({ ...prev, profiles: 'success' }));
      }

      // Test 3: Courses with JOIN
      setTestResults(prev => ({ ...prev, courses: 'pending' }));
      const { data: courses, error: coursesError } = await supabaseHelpers.courses.list({ limit: 5 });
      
      if (coursesError) {
        setTestResults(prev => ({ ...prev, courses: 'error' }));
        console.error('Courses error:', coursesError);
      } else {
        setTestResults(prev => ({ ...prev, courses: 'success' }));
      }

      // Test 4: Blog Posts with JOIN
      setTestResults(prev => ({ ...prev, blogPosts: 'pending' }));
      const { data: blogPosts, error: blogError } = await supabaseHelpers.blog.list({ limit: 5 });
      
      if (blogError) {
        setTestResults(prev => ({ ...prev, blogPosts: 'error' }));
        console.error('Blog posts error:', blogError);
      } else {
        setTestResults(prev => ({ ...prev, blogPosts: 'success' }));
      }

      // Test 5: Social Posts with JOIN
      setTestResults(prev => ({ ...prev, posts: 'pending' }));
      const { data: posts, error: postsError } = await supabaseHelpers.posts.list(undefined, { limit: 5 });
      
      if (postsError) {
        setTestResults(prev => ({ ...prev, posts: 'error' }));
        console.error('Posts error:', postsError);
      } else {
        setTestResults(prev => ({ ...prev, posts: 'success' }));
      }

      // Set data
      setData({
        profilesCount: profiles?.length || 0,
        coursesCount: courses?.length || 0,
        blogPostsCount: blogPosts?.length || 0,
        postsCount: posts?.length || 0,
        firstCourse: courses?.[0] || null,
        firstBlogPost: blogPosts?.[0] || null,
      });

      // Log results to console for debugging
      console.log('✅ Supabase Test Results:', {
        profiles: profiles?.length || 0,
        courses: courses?.length || 0,
        blogPosts: blogPosts?.length || 0,
        posts: posts?.length || 0,
      });
      console.log('📦 Sample Course:', courses?.[0]);
      console.log('📝 Sample Blog Post:', blogPosts?.[0]);
      console.log('📱 Sample Post:', posts?.[0]);

    } catch (err) {
      console.error('Test error:', err);
    }
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <Loader className="w-5 h-5 animate-spin text-yellow-500" />;
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
    }
  };

  const allSuccess = Object.values(testResults).every(status => status === 'success');

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-6 max-w-md z-50">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-blue-500" />
        <h3 className="font-bold text-white">Supabase Connection Test</h3>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Database Connection</span>
          {getStatusIcon(testResults.connection)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Profiles ({data?.profilesCount || 0})</span>
          {getStatusIcon(testResults.profiles)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Courses ({data?.coursesCount || 0})</span>
          {getStatusIcon(testResults.courses)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Blog Posts ({data?.blogPostsCount || 0})</span>
          {getStatusIcon(testResults.blogPosts)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Social Posts ({data?.postsCount || 0})</span>
          {getStatusIcon(testResults.posts)}
        </div>
      </div>

      {allSuccess && data && (
        <div className="bg-green-900/20 border border-green-500/30 rounded p-3 mt-4">
          <p className="text-green-400 text-sm font-medium mb-2">✅ All tests passed!</p>
          <div className="text-xs text-gray-400 space-y-1">
            {data.firstCourse && (
              <p>📚 Course: {data.firstCourse.title?.substring(0, 30)}...</p>
            )}
            {data.firstBlogPost && (
              <p>📝 Blog: {data.firstBlogPost.title?.substring(0, 30)}...</p>
            )}
          </div>
        </div>
      )}

      {Object.values(testResults).some(status => status === 'error') && (
        <div className="bg-red-900/20 border border-red-500/30 rounded p-3 mt-4">
          <p className="text-red-400 text-sm font-medium">⚠️ Some tests failed</p>
          <p className="text-xs text-gray-400 mt-1">Check browser console for details</p>
        </div>
      )}

      <button
        onClick={runTests}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded transition-colors"
      >
        Run Tests Again
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Open browser console (F12) for detailed logs
      </p>
    </div>
  );
}
