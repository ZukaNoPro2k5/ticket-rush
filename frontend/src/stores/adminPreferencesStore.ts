'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdminWorkspaceTone = 'stone' | 'paper' | 'sand';
export type AdminDensity = 'comfortable' | 'compact';

interface AdminPreferencesState {
  workspaceTone: AdminWorkspaceTone;
  density: AdminDensity;
  sidebarExpanded: boolean;
  reducedMotion: boolean;
  _hasHydrated: boolean;
  setWorkspaceTone: (tone: AdminWorkspaceTone) => void;
  setDensity: (density: AdminDensity) => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAdminPreferencesStore = create<AdminPreferencesState>()(
  persist(
    (set) => ({
      workspaceTone: 'stone',
      density: 'comfortable',
      sidebarExpanded: false,
      reducedMotion: false,
      _hasHydrated: false,
      setWorkspaceTone: (workspaceTone) => set({ workspaceTone }),
      setDensity: (density) => set({ density }),
      setSidebarExpanded: (sidebarExpanded) => set({ sidebarExpanded }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),
    }),
    {
      name: 'admin-preferences',
      partialize: (state) => ({
        workspaceTone: state.workspaceTone,
        density: state.density,
        sidebarExpanded: state.sidebarExpanded,
        reducedMotion: state.reducedMotion,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
