import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SessionUser } from '@/lib/auth-utils'

interface UserState {
  user: SessionUser | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  setUser: (user: SessionUser | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  updateUser: (updates: Partial<SessionUser>) => void

  // Helpers
  isCompany: () => boolean
  isCandidate: () => boolean
  isAdmin: () => boolean
  hasSubscription: (plan: string) => boolean
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false
      }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),

      // Helper methods
      isCompany: () => get().user?.userType === 'COMPANY',
      isCandidate: () => get().user?.userType === 'CANDIDATE',
      isAdmin: () => get().user?.role === 'ADMIN',
      hasSubscription: (plan) => get().user?.subscription?.plan === plan,
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
