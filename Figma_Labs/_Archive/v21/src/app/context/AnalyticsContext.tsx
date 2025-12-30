import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../services/api';

interface AnalyticsEvent {
  event: string;
  data: any;
  timestamp: number;
}

interface AnalyticsContextType {
  trackPageView: (page: string) => void;
  trackEvent: (event: string, data?: any) => void;
  trackCourseView: (courseId: string, courseName: string) => void;
  trackCourseEnroll: (courseId: string, courseName: string) => void;
  trackVideoPlay: (courseId: string, lessonId: string) => void;
  trackSearch: (query: string, results: number) => void;
  getAnalytics: () => AnalyticsEvent[];
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => {
    const stored = localStorage.getItem('analytics_events');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('analytics_events', JSON.stringify(events));
  }, [events]);

  const trackEvent = useCallback((event: string, data: any = {}) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      data: {
        ...data,
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      timestamp: Date.now(),
    };

    setEvents(prev => [...prev, analyticsEvent]);
    
    // Send to API (in production)
    api.trackEvent(event, data);

    // Log to console in development
    console.log('📊 Analytics Event:', analyticsEvent);
  }, []);

  const trackPageView = useCallback((page: string) => {
    trackEvent('page_view', { page });
  }, [trackEvent]);

  const trackCourseView = useCallback((courseId: string, courseName: string) => {
    trackEvent('course_view', { courseId, courseName });
  }, [trackEvent]);

  const trackCourseEnroll = useCallback((courseId: string, courseName: string) => {
    trackEvent('course_enroll', { courseId, courseName });
  }, [trackEvent]);

  const trackVideoPlay = useCallback((courseId: string, lessonId: string) => {
    trackEvent('video_play', { courseId, lessonId });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, results: number) => {
    trackEvent('search', { query, results });
  }, [trackEvent]);

  const getAnalytics = useCallback(() => events, [events]);

  return (
    <AnalyticsContext.Provider
      value={{
        trackPageView,
        trackEvent,
        trackCourseView,
        trackCourseEnroll,
        trackVideoPlay,
        trackSearch,
        getAnalytics,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}