import { create } from 'zustand';

export type AuthModalMode = 'login' | 'register';

interface UIState {
  loginModalOpen: boolean;
  loginModalMode: AuthModalMode;
  openLoginModal: (mode?: AuthModalMode) => void;
  closeLoginModal: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  loginModalOpen: false,
  loginModalMode: 'login',
  openLoginModal:  (mode = 'login') => set({ loginModalOpen: true, loginModalMode: mode }),
  closeLoginModal: () => set({ loginModalOpen: false, loginModalMode: 'login' }),
}));
