import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DashboardView } from '../types'

interface UIState {
  theme: 'dark' | 'light'
  sidebarOpen: boolean
  activeView: DashboardView
  editingCredentialId: string | null
  toggleTheme: () => void
  setView: (view: DashboardView, credentialId?: string) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      activeView: 'vault',
      editingCredentialId: null,

      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setView: (view, credentialId) => set({ activeView: view, editingCredentialId: credentialId ?? null }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'fae-ui-prefs', partialize: (s) => ({ theme: s.theme }) }
  )
)
