import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Job {
  id: string
  title: string
  location: string
  jobType: string
  status: string
  createdAt: string
  publishedAt: string | null
  viewCount: number
  _count?: {
    applications: number
  }
}

interface JobsState {
  // Data
  jobs: Job[]
  selectedJob: Job | null
  isLoading: boolean
  error: string | null

  // Filters
  statusFilter: 'ALL' | 'DRAFT' | 'PUBLISHED' | 'CLOSED'
  searchQuery: string

  // Actions
  setJobs: (jobs: Job[]) => void
  addJob: (job: Job) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  deleteJob: (id: string) => void
  setSelectedJob: (job: Job | null) => void

  // Loading state
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Filters
  setStatusFilter: (status: JobsState['statusFilter']) => void
  setSearchQuery: (query: string) => void

  // Computed
  getFilteredJobs: () => Job[]
  getJobById: (id: string) => Job | undefined
}

export const useJobsStore = create<JobsState>()(
  devtools(
    (set, get) => ({
      // Data
      jobs: [],
      selectedJob: null,
      isLoading: false,
      error: null,

      // Filters
      statusFilter: 'ALL',
      searchQuery: '',

      // Actions
      setJobs: (jobs) => set({ jobs, error: null }),

      addJob: (job) => set((state) => ({
        jobs: [job, ...state.jobs]
      })),

      updateJob: (id, updates) => set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === id ? { ...job, ...updates } : job
        ),
        selectedJob: state.selectedJob?.id === id
          ? { ...state.selectedJob, ...updates }
          : state.selectedJob
      })),

      deleteJob: (id) => set((state) => ({
        jobs: state.jobs.filter((job) => job.id !== id),
        selectedJob: state.selectedJob?.id === id ? null : state.selectedJob
      })),

      setSelectedJob: (job) => set({ selectedJob: job }),

      // Loading state
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),

      // Filters
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      // Computed
      getFilteredJobs: () => {
        const { jobs, statusFilter, searchQuery } = get()
        let filtered = jobs

        // Filter by status
        if (statusFilter !== 'ALL') {
          filtered = filtered.filter((job) => job.status === statusFilter)
        }

        // Filter by search
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          filtered = filtered.filter((job) =>
            job.title.toLowerCase().includes(query) ||
            job.location?.toLowerCase().includes(query)
          )
        }

        return filtered
      },

      getJobById: (id) => {
        return get().jobs.find((job) => job.id === id)
      },
    }),
    { name: 'jobs-store' }
  )
)
