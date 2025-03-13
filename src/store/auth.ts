import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      isAuthenticated: false,
      setAccessToken: (token) => {
        set({ 
          accessToken: token,
          isAuthenticated: !!token 
        });
      },
      logout: () => {
        set({ 
          accessToken: null,
          isAuthenticated: false 
        });
      },
      checkAuth: () => {
        const state = get();
        return !!state.accessToken;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);