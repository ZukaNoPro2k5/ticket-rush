'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  token: string | null;
  user: Pick<User, 'id' | 'email' | 'full_name' | 'role'> & { avatar_url?: string | null } | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  setAuth: (token: string, user: AuthState['user']) => void;
  clearAuth: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setAuth: (token, user) => {
        set({ token, user, isAuthenticated: true });
      },

      clearAuth: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },

      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'auth-storage',
      // Chỉ persist token và user, không persist isAuthenticated
      partialize: (state) => ({ token: state.token, user: state.user }),
      // Rehydrate isAuthenticated dựa trên token
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token;
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
