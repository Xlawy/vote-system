import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'expert' | 'admin' | 'superAdmin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
      },
      initialize: async () => {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const user = await authApi.getCurrentUser();
            set({ user: user.user, isAuthenticated: true });
          }
        } catch (error) {
          console.error('Failed to initialize auth state:', error);
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
