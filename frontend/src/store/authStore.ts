import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  authProvider?: string;
  profilePicture?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Login failed');
        }
        
        const data = await response.json();
        set({
          user: data.user,
          tokens: data.tokens,
          isAuthenticated: true
        });
      },
      
      register: async (email: string, password: string, username: string) => {
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, username })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Registration failed');
        }
        
        const data = await response.json();
        set({
          user: data.user,
          tokens: data.tokens,
          isAuthenticated: true
        });
      },
      
      googleLogin: async (credential: string) => {
        const response = await fetch(`${API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Google login failed');
        }
        
        const data = await response.json();
        set({
          user: data.user,
          tokens: data.tokens,
          isAuthenticated: true
        });
      },
      
      logout: async () => {
        const { tokens } = get();
        
        if (tokens) {
          await fetch(`${API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokens.accessToken}`
            },
            body: JSON.stringify({ refreshToken: tokens.refreshToken })
          });
        }
        
        set({
          user: null,
          tokens: null,
          isAuthenticated: false
        });
      },
      
      refreshTokens: async () => {
        const { tokens } = get();
        
        if (!tokens) {
          throw new Error('No refresh token available');
        }
        
        const response = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokens.refreshToken })
        });
        
        if (!response.ok) {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false
          });
          throw new Error('Token refresh failed');
        }
        
        const data = await response.json();
        set({
          user: data.user,
          tokens: data.tokens,
          isAuthenticated: true
        });
      },
      
      checkAuth: async () => {
        const { tokens } = get();
        
        if (!tokens) {
          return;
        }
        
        try {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${tokens.accessToken}`
            }
          });
          
          if (!response.ok) {
            // Try to refresh tokens
            await get().refreshTokens();
          }
        } catch (error) {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);