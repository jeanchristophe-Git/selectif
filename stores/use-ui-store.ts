import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  description?: string
  duration?: number
}

interface Modal {
  id: string
  isOpen: boolean
  data?: any
}

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void

  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Toasts (géré en interne, sonner est utilisé en externe)
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void

  // Modals
  modals: Map<string, Modal>
  openModal: (id: string, data?: any) => void
  closeModal: (id: string) => void
  isModalOpen: (id: string) => boolean

  // Search
  globalSearchQuery: string
  setGlobalSearchQuery: (query: string) => void

  // Notifications
  notificationCount: number
  setNotificationCount: (count: number) => void
  incrementNotifications: () => void
  decrementNotifications: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Toasts
      toasts: [],
      addToast: (toast) => {
        const id = Math.random().toString(36).substr(2, 9)
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }]
        }))

        // Auto-remove après duration
        if (toast.duration !== 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, toast.duration || 5000)
        }
      },
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      })),

      // Modals
      modals: new Map(),
      openModal: (id, data) => {
        const modals = new Map(get().modals)
        modals.set(id, { id, isOpen: true, data })
        set({ modals })
      },
      closeModal: (id) => {
        const modals = new Map(get().modals)
        const modal = modals.get(id)
        if (modal) {
          modals.set(id, { ...modal, isOpen: false })
          set({ modals })
        }
      },
      isModalOpen: (id) => {
        return get().modals.get(id)?.isOpen || false
      },

      // Search
      globalSearchQuery: '',
      setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),

      // Notifications
      notificationCount: 0,
      setNotificationCount: (count) => set({ notificationCount: count }),
      incrementNotifications: () => set((state) => ({
        notificationCount: state.notificationCount + 1
      })),
      decrementNotifications: () => set((state) => ({
        notificationCount: Math.max(0, state.notificationCount - 1)
      })),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
