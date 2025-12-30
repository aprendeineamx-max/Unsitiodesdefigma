import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'student' | 'instructor' | 'admin';
  provider?: 'google' | 'github' | 'email';
  emailVerified?: boolean;
  needsOnboarding?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingVerificationEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<{ needsVerification: boolean }>;
  verifyEmail: (code: string) => Promise<boolean>;
  resendVerificationCode: () => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    const pendingEmail = localStorage.getItem('pending-verification-email');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (pendingEmail) {
      setPendingVerificationEmail(pendingEmail);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);
      const userData = response.data.user;
      
      if (!userData.emailVerified) {
        setPendingVerificationEmail(email);
        localStorage.setItem('pending-verification-email', email);
        throw new Error('Email no verificado. Por favor verifica tu correo.');
      }
      
      // NO activar onboarding en login normal
      // El usuario ya completó el onboarding anteriormente
      userData.needsOnboarding = false;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Track login event
      api.trackEvent('user_login', { userId: userData.id, method: 'email' });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      // Simulate OAuth popup
      const response = await api.loginWithOAuth(provider);
      const userData = response.data.user;
      
      // OAuth providers verify email automatically
      userData.emailVerified = true;
      userData.needsOnboarding = true;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Track OAuth login
      api.trackEvent('user_login', { userId: userData.id, method: provider });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ needsVerification: boolean }> => {
    setIsLoading(true);
    try {
      const response = await api.register(email, password, name);
      
      // Store email for verification
      setPendingVerificationEmail(email);
      localStorage.setItem('pending-verification-email', email);
      
      // Track registration
      api.trackEvent('user_register', { email });
      
      // Send verification email
      await api.sendVerificationEmail(email);
      
      return { needsVerification: true };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (code: string): Promise<boolean> => {
    if (!pendingVerificationEmail) {
      throw new Error('No hay email pendiente de verificación');
    }
    
    setIsLoading(true);
    try {
      const response = await api.verifyEmail(pendingVerificationEmail, code);
      
      if (response.data.success) {
        const userData = response.data.user;
        userData.emailVerified = true;
        userData.needsOnboarding = true; // ← Activar onboarding SOLO aquí
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.removeItem('pending-verification-email');
        setPendingVerificationEmail(null);
        
        // Track verification
        api.trackEvent('email_verified', { userId: userData.id });
        
        return true;
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    if (!pendingVerificationEmail) {
      throw new Error('No hay email pendiente de verificación');
    }
    
    await api.sendVerificationEmail(pendingVerificationEmail);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    localStorage.removeItem('user');
    
    // Track logout
    api.trackEvent('user_logout', {});
  };

  const completeOnboarding = () => {
    if (user) {
      const updatedUser = { ...user, needsOnboarding: false };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        pendingVerificationEmail,
        login,
        loginWithOAuth,
        register,
        verifyEmail,
        resendVerificationCode,
        logout,
        completeOnboarding
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}