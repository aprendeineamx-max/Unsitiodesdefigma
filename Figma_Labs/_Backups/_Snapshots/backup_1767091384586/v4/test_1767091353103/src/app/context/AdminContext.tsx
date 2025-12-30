import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Course } from '../data/courses';
import { extendedCourses } from '../data/extendedCourses';

interface BlogPost {
  id: string;
  title: string;
  author: string;
  views: number;
  likes: number;
  comments: number;
  status: 'published' | 'draft';
  date: string;
  category: string;
  content?: string;
  image?: string;
}

interface ForumTopic {
  id: string;
  title: string;
  author: string;
  replies: number;
  views: number;
  lastActivity: string;
  category: string;
  status: 'active' | 'closed';
}

interface StudyGroup {
  id: string;
  name: string;
  members: number;
  posts: number;
  status: 'active' | 'inactive';
  category: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'suspended';
  registeredAt: string;
  lastActive: string;
}

interface AdminSettings {
  siteName: string;
  contactEmail: string;
  timezone: string;
  security: {
    twoFactorRequired: boolean;
    sslEnabled: boolean;
    autoBackup: boolean;
    rateLimit: boolean;
  };
  email: {
    welcomeEmails: boolean;
    newsletter: boolean;
    systemNotifications: boolean;
  };
  performance: {
    cdnCache: boolean;
    gzipCompression: boolean;
    lazyLoading: boolean;
  };
  forum: {
    anonymousPosts: boolean;
    autoModeration: boolean;
    pushNotifications: boolean;
  };
  social: {
    publicPosts: boolean;
    contentModeration: boolean;
    profanityFilter: boolean;
  };
  messaging: {
    e2eEncryption: boolean;
    audioRecording: boolean;
    videoCalls: boolean;
    fileAttachments: boolean;
  };
}

interface AdminContextType {
  // Courses
  courses: Course[];
  addCourse: (course: Course) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  // Blog
  blogPosts: BlogPost[];
  addBlogPost: (post: BlogPost) => void;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  
  // Forum
  forumTopics: ForumTopic[];
  addForumTopic: (topic: ForumTopic) => void;
  deleteForumTopic: (id: string) => void;
  
  // Groups
  studyGroups: StudyGroup[];
  addStudyGroup: (group: StudyGroup) => void;
  updateStudyGroup: (id: string, group: Partial<StudyGroup>) => void;
  deleteStudyGroup: (id: string) => void;
  
  // Users
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  suspendUser: (id: string) => void;
  
  // Settings
  settings: AdminSettings;
  updateSettings: (settings: Partial<AdminSettings>) => void;
  
  // Stats
  stats: {
    totalUsers: number;
    activeCourses: number;
    monthlyRevenue: number;
    activePosts: number;
    activeDiscussions: number;
    studyGroups: number;
  };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Initial data
const initialBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Tips para Aprender JavaScript Rápidamente',
    author: 'Carlos Fernández',
    views: 15420,
    likes: 892,
    comments: 234,
    status: 'published',
    date: '2025-01-15',
    category: 'Tutoriales',
    content: 'JavaScript es uno de los lenguajes más populares...',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800'
  },
  {
    id: '2',
    title: 'El Futuro del Desarrollo Web en 2025',
    author: 'María García',
    views: 23400,
    likes: 1234,
    comments: 456,
    status: 'published',
    date: '2025-01-14',
    category: 'Tendencias',
    content: 'El desarrollo web continúa evolucionando...',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'
  },
  {
    id: '3',
    title: 'Cómo Prepararte para una Entrevista Técnica',
    author: 'Ana Martínez',
    views: 18900,
    likes: 945,
    comments: 321,
    status: 'published',
    date: '2025-01-13',
    category: 'Carrera',
    content: 'Las entrevistas técnicas pueden ser desafiantes...',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800'
  }
];

const initialForumTopics: ForumTopic[] = [
  {
    id: '1',
    title: '¿Cómo empezar con React?',
    author: 'Juan López',
    replies: 45,
    views: 1230,
    lastActivity: '2025-01-15',
    category: 'Frontend',
    status: 'active'
  },
  {
    id: '2',
    title: 'Mejores prácticas en Node.js',
    author: 'María Sánchez',
    replies: 67,
    views: 2340,
    lastActivity: '2025-01-14',
    category: 'Backend',
    status: 'active'
  }
];

const initialStudyGroups: StudyGroup[] = [
  {
    id: '1',
    name: 'React Developers',
    members: 1234,
    posts: 456,
    status: 'active',
    category: 'Frontend'
  },
  {
    id: '2',
    name: 'Python para Data Science',
    members: 890,
    posts: 234,
    status: 'active',
    category: 'Data Science'
  },
  {
    id: '3',
    name: 'JavaScript Avanzado',
    members: 567,
    posts: 123,
    status: 'active',
    category: 'Frontend'
  }
];

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    plan: 'premium',
    status: 'active',
    registeredAt: '2025-01-10',
    lastActive: '2025-01-15'
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@example.com',
    plan: 'pro',
    status: 'active',
    registeredAt: '2025-01-12',
    lastActive: '2025-01-15'
  },
  {
    id: '3',
    name: 'Carlos López',
    email: 'carlos@example.com',
    plan: 'free',
    status: 'active',
    registeredAt: '2025-01-14',
    lastActive: '2025-01-15'
  }
];

const initialSettings: AdminSettings = {
  siteName: 'Platzi Clone',
  contactEmail: 'contact@platzi-clone.com',
  timezone: 'UTC-5',
  security: {
    twoFactorRequired: false,
    sslEnabled: true,
    autoBackup: true,
    rateLimit: true
  },
  email: {
    welcomeEmails: true,
    newsletter: true,
    systemNotifications: true
  },
  performance: {
    cdnCache: true,
    gzipCompression: true,
    lazyLoading: true
  },
  forum: {
    anonymousPosts: false,
    autoModeration: true,
    pushNotifications: true
  },
  social: {
    publicPosts: true,
    contentModeration: true,
    profanityFilter: true
  },
  messaging: {
    e2eEncryption: true,
    audioRecording: true,
    videoCalls: true,
    fileAttachments: true
  }
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(extendedCourses);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>(initialForumTopics);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(initialStudyGroups);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [settings, setSettings] = useState<AdminSettings>(initialSettings);

  // Load from localStorage
  useEffect(() => {
    const savedCourses = localStorage.getItem('admin-courses');
    const savedBlogPosts = localStorage.getItem('admin-blog-posts');
    const savedForumTopics = localStorage.getItem('admin-forum-topics');
    const savedStudyGroups = localStorage.getItem('admin-study-groups');
    const savedUsers = localStorage.getItem('admin-users');
    const savedSettings = localStorage.getItem('admin-settings');

    if (savedCourses) setCourses(JSON.parse(savedCourses));
    if (savedBlogPosts) setBlogPosts(JSON.parse(savedBlogPosts));
    if (savedForumTopics) setForumTopics(JSON.parse(savedForumTopics));
    if (savedStudyGroups) setStudyGroups(JSON.parse(savedStudyGroups));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('admin-courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('admin-blog-posts', JSON.stringify(blogPosts));
  }, [blogPosts]);

  useEffect(() => {
    localStorage.setItem('admin-forum-topics', JSON.stringify(forumTopics));
  }, [forumTopics]);

  useEffect(() => {
    localStorage.setItem('admin-study-groups', JSON.stringify(studyGroups));
  }, [studyGroups]);

  useEffect(() => {
    localStorage.setItem('admin-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('admin-settings', JSON.stringify(settings));
  }, [settings]);

  // Course methods
  const addCourse = (course: Course) => {
    setCourses([...courses, course]);
  };

  const updateCourse = (id: string, updatedCourse: Partial<Course>) => {
    setCourses(courses.map(c => c.id === id ? { ...c, ...updatedCourse } : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  // Blog methods
  const addBlogPost = (post: BlogPost) => {
    setBlogPosts([...blogPosts, post]);
  };

  const updateBlogPost = (id: string, updatedPost: Partial<BlogPost>) => {
    setBlogPosts(blogPosts.map(p => p.id === id ? { ...p, ...updatedPost } : p));
  };

  const deleteBlogPost = (id: string) => {
    setBlogPosts(blogPosts.filter(p => p.id !== id));
  };

  // Forum methods
  const addForumTopic = (topic: ForumTopic) => {
    setForumTopics([...forumTopics, topic]);
  };

  const deleteForumTopic = (id: string) => {
    setForumTopics(forumTopics.filter(t => t.id !== id));
  };

  // Group methods
  const addStudyGroup = (group: StudyGroup) => {
    setStudyGroups([...studyGroups, group]);
  };

  const updateStudyGroup = (id: string, updatedGroup: Partial<StudyGroup>) => {
    setStudyGroups(studyGroups.map(g => g.id === id ? { ...g, ...updatedGroup } : g));
  };

  const deleteStudyGroup = (id: string) => {
    setStudyGroups(studyGroups.filter(g => g.id !== id));
  };

  // User methods
  const addUser = (user: User) => {
    setUsers([...users, user]);
  };

  const updateUser = (id: string, updatedUser: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updatedUser } : u));
  };

  const suspendUser = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'suspended' as const } : u));
  };

  // Settings methods
  const updateSettings = (updatedSettings: Partial<AdminSettings>) => {
    setSettings({ ...settings, ...updatedSettings });
  };

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    activeCourses: courses.filter(c => !c.new).length,
    monthlyRevenue: 127543,
    activePosts: blogPosts.filter(p => p.status === 'published').length,
    activeDiscussions: forumTopics.filter(t => t.status === 'active').length,
    studyGroups: studyGroups.filter(g => g.status === 'active').length
  };

  return (
    <AdminContext.Provider
      value={{
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        blogPosts,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        forumTopics,
        addForumTopic,
        deleteForumTopic,
        studyGroups,
        addStudyGroup,
        updateStudyGroup,
        deleteStudyGroup,
        users,
        addUser,
        updateUser,
        suspendUser,
        settings,
        updateSettings,
        stats
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}