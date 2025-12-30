// API Service Layer - Ready for real backend integration
// ✅ v8.2.0: Actualizado para usar import.meta.env (Vite Standards)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.platzi.com/v1';

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 300));

      // In production, this would be a real fetch call
      // const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      //   ...options,
      //   headers,
      // });

      // For now, return mock data based on endpoint
      return this.getMockResponse<T>(endpoint, options.method || 'GET');
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  private getMockResponse<T>(endpoint: string, method: string): ApiResponse<T> {
    // Mock responses - replace with real API calls
    return {
      data: {} as T,
      status: 200,
      message: 'Success',
    };
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async loginWithOAuth(provider: 'google' | 'github') {
    // Simulate OAuth flow
    const mockToken = `mock_token_${provider}_${Date.now()}`;
    this.token = mockToken;
    localStorage.setItem('auth_token', mockToken);
    
    return {
      data: {
        token: mockToken,
        user: {
          id: '1',
          name: 'Usuario OAuth',
          email: `user@${provider}.com`,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=OAuth',
          provider,
        },
      },
      status: 200,
    };
  }

  async register(email: string, password: string, name: string) {
    // Simulate registration
    const userId = `user_${Date.now()}`;
    return {
      data: {
        success: true,
        userId,
        email
      },
      status: 200
    };
  }

  async sendVerificationEmail(email: string) {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code in localStorage (in production, this would be server-side)
    localStorage.setItem(`verification_code_${email}`, code);
    localStorage.setItem(`verification_code_timestamp_${email}`, Date.now().toString());
    
    // Simulate email sending
    console.log('📧 Código de verificación enviado a:', email);
    console.log('🔐 Código:', code);
    
    // Show alert with code (for demo purposes)
    alert(`✅ Código de verificación enviado a ${email}\n\n🔐 Tu código es: ${code}\n\n(En producción, este código llegaría por email)`);
    
    return {
      data: { success: true },
      status: 200
    };
  }

  async verifyEmail(email: string, code: string) {
    const storedCode = localStorage.getItem(`verification_code_${email}`);
    const timestamp = localStorage.getItem(`verification_code_timestamp_${email}`);
    
    if (!storedCode) {
      throw new Error('No hay código de verificación para este email');
    }
    
    // Check if code expired (10 minutes)
    if (timestamp) {
      const elapsed = Date.now() - parseInt(timestamp);
      if (elapsed > 10 * 60 * 1000) {
        localStorage.removeItem(`verification_code_${email}`);
        localStorage.removeItem(`verification_code_timestamp_${email}`);
        throw new Error('El código ha expirado. Solicita uno nuevo.');
      }
    }
    
    if (storedCode === code) {
      // Clear verification code
      localStorage.removeItem(`verification_code_${email}`);
      localStorage.removeItem(`verification_code_timestamp_${email}`);
      
      const mockToken = `verified_token_${Date.now()}`;
      this.token = mockToken;
      localStorage.setItem('auth_token', mockToken);
      
      return {
        data: {
          success: true,
          user: {
            id: `user_${Date.now()}`,
            name: email.split('@')[0],
            email: email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            role: 'student' as const,
            provider: 'email' as const,
            emailVerified: true,
            needsOnboarding: true
          }
        },
        status: 200
      };
    }
    
    throw new Error('Código de verificación incorrecto');
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Courses
  async getCourses(filters?: any) {
    return this.request<any[]>('/courses', {
      method: 'GET',
    });
  }

  async getCourse(id: string) {
    return this.request<any>(`/courses/${id}`, {
      method: 'GET',
    });
  }

  async enrollCourse(courseId: string) {
    return this.request<any>(`/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  }

  // Progress
  async updateProgress(courseId: string, lessonId: string, completed: boolean) {
    return this.request<any>(`/progress`, {
      method: 'POST',
      body: JSON.stringify({ courseId, lessonId, completed }),
    });
  }

  // Payments
  async createPaymentIntent(items: any[]) {
    return this.request<{ clientSecret: string }>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  // Analytics
  async trackEvent(event: string, data: any) {
    return this.request<void>('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ event, data, timestamp: Date.now() }),
    });
  }

  // Notifications
  async getNotifications() {
    return this.request<any[]>('/notifications', {
      method: 'GET',
    });
  }

  async markNotificationRead(id: string) {
    return this.request<void>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  // Messages
  async getConversations() {
    return this.request<any[]>('/messages/conversations', {
      method: 'GET',
    });
  }

  async sendMessage(recipientId: string, content: string) {
    return this.request<any>('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content }),
    });
  }
}

export const api = new ApiService();