import { useState, useEffect } from 'react';
import loadable from '@loadable/component';

// ✅ IMPORTAR ESTILOS GLOBALES PRIMERO
import '../styles/index.css';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CourseDetail } from './components/CourseDetail';
import { Cart } from './components/Cart';
import { CartNotification } from './components/CartNotification';
import { FloatingCourseButton } from './components/FloatingCourseButton';
import { NotificationsPanel } from './components/NotificationsPanel';
import { WelcomeModal } from './components/WelcomeModal';
import { DevToolsMenu } from './components/DevToolsMenu';
import { LoadingFallback } from './components/LoadingFallback';
import { Course } from './data/courses';
import { CartProvider, useCart } from './context/CartContext';
import { InteractionProvider } from './context/InteractionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnalyticsProvider, useAnalytics } from './context/AnalyticsContext';
import { NotificationsProvider, useNotifications } from './context/NotificationsContext';
import { ThemeProvider } from './context/ThemeContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { AdminProvider } from './context/AdminContext';
import { BlogProvider } from './context/BlogContext';
import { SupabaseDataProvider } from './context/SupabaseDataContext';
import { PageType } from './components/Navigation';
import { initSentry } from './services/sentry';
import { initPostHog } from './services/posthog';

// ✨ Lazy-loaded Pages with @loadable/component
const HomePage = loadable(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })), {
  fallback: <LoadingFallback />
});

const FeedPage = loadable(() => import('./pages/FeedPage').then(m => ({ default: m.FeedPage })), {
  fallback: <LoadingFallback />
});

const ForumPage = loadable(() => import('./pages/ForumPage').then(m => ({ default: m.ForumPage })), {
  fallback: <LoadingFallback />
});

const BlogPage = loadable(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })), {
  fallback: <LoadingFallback />
});

const BlogPostPage = loadable(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })), {
  fallback: <LoadingFallback />
});

const WikiPage = loadable(() => import('./pages/WikiPage').then(m => ({ default: m.WikiPage })), {
  fallback: <LoadingFallback />
});

const ProfilePage = loadable(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })), {
  fallback: <LoadingFallback />
});

const DashboardPage = loadable(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })), {
  fallback: <LoadingFallback />
});

const CoursePlayerPage = loadable(() => import('./pages/CoursePlayerPage').then(m => ({ default: m.CoursePlayerPage })), {
  fallback: <LoadingFallback />
});

const StudyGroupsPage = loadable(() => import('./pages/StudyGroupsPage').then(m => ({ default: m.StudyGroupsPage })), {
  fallback: <LoadingFallback />
});

const AdminPanelPage = loadable(() => import('./pages/admin/AdminPanelPage').then(m => ({ default: m.AdminPanelPage })), {
  fallback: <LoadingFallback />
});

const CertificatesPage = loadable(() => import('./pages/CertificatesPage').then(m => ({ default: m.CertificatesPage })), {
  fallback: <LoadingFallback />
});

const CalendarPage = loadable(() => import('./pages/CalendarPage').then(m => ({ default: m.CalendarPage })), {
  fallback: <LoadingFallback />
});

const LoginPage = loadable(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })), {
  fallback: <LoadingFallback />
});

const CheckoutPage = loadable(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })), {
  fallback: <LoadingFallback />
});

const MessagesPage = loadable(() => import('./pages/MessagesPage').then(m => ({ default: m.MessagesPage })), {
  fallback: <LoadingFallback />
});

const AnalyticsPage = loadable(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })), {
  fallback: <LoadingFallback />
});

const GamificationPage = loadable(() => import('./pages/GamificationPage').then(m => ({ default: m.GamificationPage })), {
  fallback: <LoadingFallback />
});

const PricingPage = loadable(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })), {
  fallback: <LoadingFallback />
});

const VerifyEmailPage = loadable(() => import('./pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })), {
  fallback: <LoadingFallback />
});

const StoriesPage = loadable(() => import('./pages/StoriesPage').then(m => ({ default: m.StoriesPage })), {
  fallback: <LoadingFallback />
});

const ReelsPage = loadable(() => import('./pages/ReelsPage').then(m => ({ default: m.ReelsPage })), {
  fallback: <LoadingFallback />
});

const LivePage = loadable(() => import('./pages/LivePage').then(m => ({ default: m.LivePage })), {
  fallback: <LoadingFallback />
});

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCoursePlayer, setShowCoursePlayer] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const { lastAddedCourse } = useCart();
  const { isAuthenticated, user, pendingVerificationEmail } = useAuth();
  const { trackPageView } = useAnalytics();
  const { requestPermission } = useNotifications();

  // Check if user needs onboarding (ONLY after email verification)
  useEffect(() => {
    if (user?.needsOnboarding === true) {
      setShowWelcome(true);
    }
  }, [user?.needsOnboarding]); // ← Solo escucha cambios en needsOnboarding

  // Track page views
  useEffect(() => {
    trackPageView(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Request notification permission on mount
  useEffect(() => {
    setTimeout(() => {
      requestPermission();
    }, 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Register service worker (with proper error handling for iframe/insecure contexts)
  useEffect(() => {
    // Skip service worker registration in insecure contexts (iframes, non-HTTPS)
    if ('serviceWorker' in navigator && window.location.protocol === 'https:' && window === window.parent) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          // Only log if it's not a security error (expected in development/iframe)
          if (error.name !== 'SecurityError') {
            console.warn('⚠️ SW registration failed:', error.message);
          }
        });
    } else {
      console.log('ℹ️ Service Worker skipped (insecure context or iframe)');
    }
  }, []);

  // Listen for navigation events from DevToolsMenu
  useEffect(() => {
    const handleNavigateToAdmin = () => {
      setCurrentPage('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('navigate-to-admin', handleNavigateToAdmin);

    return () => {
      window.removeEventListener('navigate-to-admin', handleNavigateToAdmin);
    };
  }, []);

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
    setSelectedCourse(null);
    setShowCoursePlayer(false);
    setShowCheckout(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Would show login first in production
      alert('Por favor inicia sesión para continuar');
      return;
    }
    setShowCheckout(true);
  };

  const renderPage = () => {
    // Show checkout if active
    if (showCheckout) {
      return (
        <CheckoutPage 
          onSuccess={() => {
            setShowCheckout(false);
            handleNavigate('learning');
          }}
          onBack={() => setShowCheckout(false)}
        />
      );
    }

    // Show course player if active
    if (showCoursePlayer) {
      return <CoursePlayerPage />;
    }

    // If a course is selected, show detail view
    if (selectedCourse) {
      return <CourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
    }

    // Otherwise render the current page
    switch (currentPage) {
      case 'home':
      case 'courses':
      case 'shop':
        return <HomePage onCourseSelect={handleCourseSelect} />;
      case 'feed':
        return <FeedPage />;
      case 'stories':
        return <StoriesPage onNavigate={handleNavigate} />;
      case 'reels':
        return <ReelsPage onNavigate={handleNavigate} />;
      case 'live':
        return <LivePage onNavigate={handleNavigate} />;
      case 'forum':
        return <ForumPage />;
      case 'wiki':
        return <WikiPage />;
      case 'blog':
        return <BlogPage onNavigate={handleNavigate} />;
      case 'blogPost':
        return <BlogPostPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'learning':
        return <DashboardPage />;
      case 'groups':
        return <StudyGroupsPage />;
      case 'admin':
        return <AdminPanelPage onExitAdmin={() => handleNavigate('profile')} />;
      case 'certificates':
        return <CertificatesPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'messages':
        return <MessagesPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'gamification':
        return <GamificationPage />;
      case 'pricing':
        return <PricingPage />;
      default:
        return <HomePage onCourseSelect={handleCourseSelect} />;
    }
  };

  // Show verify email page if needed
  if (showVerifyEmail && pendingVerificationEmail) {
    return (
      <VerifyEmailPage
        onBack={() => setShowVerifyEmail(false)}
        onSuccess={() => {
          setShowVerifyEmail(false);
          setShowWelcome(true);
        }}
      />
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginPage
        onSuccess={() => {}}
        onNeedsVerification={() => setShowVerifyEmail(true)}
      />
    );
  }

  const showFooter = currentPage !== 'admin' && currentPage !== 'messages' && currentPage !== 'stories' && currentPage !== 'reels' && currentPage !== 'live' && !showCheckout && !showCoursePlayer;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {currentPage !== 'admin' && currentPage !== 'stories' && currentPage !== 'reels' && currentPage !== 'live' && !showCheckout && (
        <Header 
          onSearchChange={setSearchQuery}
          onCartClick={() => setIsCartOpen(true)}
          onNotificationsClick={() => setIsNotificationsOpen(true)}
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />
      )}
      
      {renderPage()}

      {/* Cart Sidebar */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Cart Notification */}
      <CartNotification 
        message={`"${lastAddedCourse?.title}" agregado al carrito`}
        isVisible={!!lastAddedCourse}
        onClose={() => {}}
      />

      {/* Floating Course Button */}
      {!showCoursePlayer && !showCheckout && currentPage === 'home' && (
        <FloatingCourseButton onOpenPlayer={() => setShowCoursePlayer(true)} />
      )}

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
      />

      {/* DevTools Menu - Only when authenticated */}
      {isAuthenticated && <DevToolsMenu />}

      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  // Initialize monitoring services
  useEffect(() => {
    // Initialize Sentry for error tracking
    initSentry();
    
    // Initialize PostHog for analytics
    initPostHog();
    
    console.log('🚀 Monitoring systems initialized');
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <CartProvider>
            <InteractionProvider>
              <AnalyticsProvider>
                <NotificationsProvider>
                  <SubscriptionProvider>
                    <BlogProvider>
                      <SupabaseDataProvider>
                        <AppContent />
                      </SupabaseDataProvider>
                    </BlogProvider>
                  </SubscriptionProvider>
                </NotificationsProvider>
              </AnalyticsProvider>
            </InteractionProvider>
          </CartProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}