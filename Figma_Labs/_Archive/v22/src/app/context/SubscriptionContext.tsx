import { createContext, useContext, useState, ReactNode } from 'react';

export type SubscriptionTier = 'free' | 'pro' | 'premium';

interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  hasAccessToCourse: (courseTier: SubscriptionTier) => boolean;
  hasFeatureAccess: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const tierHierarchy: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  premium: 2
};

const tierFeatures: Record<SubscriptionTier, string[]> = {
  free: [
    'community',
    'forums',
    'study-groups',
    'social-network',
    'messaging',
    'ai-tutor-limited',
    'free-certificates',
    'email-support'
  ],
  pro: [
    'community',
    'forums',
    'study-groups',
    'social-network',
    'messaging',
    'ai-tutor-unlimited',
    'offline-downloads',
    'verified-certificates',
    'learning-paths',
    'group-mentoring',
    'priority-support',
    'event-discounts'
  ],
  premium: [
    'community',
    'forums',
    'study-groups',
    'social-network',
    'messaging',
    'ai-tutor-unlimited',
    'ai-tutor-advanced',
    'offline-downloads',
    'verified-certificates',
    'premium-certificates',
    'learning-paths',
    'group-mentoring',
    'one-on-one-mentoring',
    'code-review',
    'early-access',
    'vip-events',
    'networking',
    'interview-prep',
    'portfolio-review',
    'vip-support'
  ]
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free');

  const hasAccessToCourse = (courseTier: SubscriptionTier): boolean => {
    return tierHierarchy[currentTier] >= tierHierarchy[courseTier];
  };

  const hasFeatureAccess = (feature: string): boolean => {
    return tierFeatures[currentTier].includes(feature);
  };

  const setTier = (tier: SubscriptionTier) => {
    setCurrentTier(tier);
    localStorage.setItem('subscription-tier', tier);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        currentTier,
        setTier,
        hasAccessToCourse,
        hasFeatureAccess
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
