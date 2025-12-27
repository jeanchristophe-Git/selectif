import { create } from 'zustand'

interface LoadingTask {
  id: string
  message?: string
  startTime: number
}

interface LoadingState {
  tasks: Map<string, LoadingTask>
  globalLoading: boolean

  // Actions
  startLoading: (taskId: string, message?: string) => void
  stopLoading: (taskId: string) => void
  isTaskLoading: (taskId: string) => boolean
  clearAll: () => void

  // Global loading helpers
  setGlobalLoading: (loading: boolean) => void
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  tasks: new Map(),
  globalLoading: false,

  startLoading: (taskId, message) => {
    const tasks = new Map(get().tasks)
    tasks.set(taskId, {
      id: taskId,
      message,
      startTime: Date.now(),
    })
    set({ tasks })
  },

  stopLoading: (taskId) => {
    const tasks = new Map(get().tasks)
    tasks.delete(taskId)
    set({ tasks })
  },

  isTaskLoading: (taskId) => {
    return get().tasks.has(taskId)
  },

  clearAll: () => {
    set({ tasks: new Map(), globalLoading: false })
  },

  setGlobalLoading: (globalLoading) => set({ globalLoading }),
}))

// Hook helper pour gérer automatiquement le minimum loading
export function useMinimumLoadingStore(taskId: string, minDuration: number = 800) {
  const { startLoading, stopLoading, isTaskLoading } = useLoadingStore()

  const start = (message?: string) => {
    startLoading(taskId, message)
  }

  const stop = () => {
    const task = useLoadingStore.getState().tasks.get(taskId)
    if (task) {
      const elapsed = Date.now() - task.startTime
      const remaining = Math.max(0, minDuration - elapsed)

      setTimeout(() => {
        stopLoading(taskId)
      }, remaining)
    }
  }

  return {
    start,
    stop,
    isLoading: isTaskLoading(taskId),
  }
}
