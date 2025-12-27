"use client"

import { useEffect } from "react"
import { useJobsStore } from "@/stores/use-jobs-store"
import { toast } from "sonner"

/**
 * Hook pour intégrer le store jobs avec l'API
 */
export function useJobsAPI() {
  const {
    jobs,
    setJobs,
    addJob,
    updateJob,
    deleteJob: deleteJobStore,
    setLoading,
    filters,
  } = useJobsStore()

  // Fetch jobs on mount and when filters change
  useEffect(() => {
    fetchJobs()
  }, [filters.status, filters.search])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.status !== "ALL") params.append("status", filters.status)
      if (filters.search) params.append("search", filters.search)

      const response = await fetch(`/api/jobs?${params}`)
      if (!response.ok) throw new Error("Failed to fetch jobs")

      const data = await response.json()
      setJobs(data.jobs)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Erreur lors du chargement des offres")
    } finally {
      setLoading(false)
    }
  }

  const createJob = async (jobData: any) => {
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) throw new Error("Failed to create job")

      const data = await response.json()
      addJob(data.job)
      toast.success("Offre créée avec succès")
      return data.job
    } catch (error) {
      console.error("Error creating job:", error)
      toast.error("Erreur lors de la création de l'offre")
      throw error
    }
  }

  const updateJobAPI = async (jobId: string, jobData: any) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) throw new Error("Failed to update job")

      const data = await response.json()
      updateJob(jobId, data.job)
      toast.success("Offre mise à jour")
      return data.job
    } catch (error) {
      console.error("Error updating job:", error)
      toast.error("Erreur lors de la mise à jour")
      throw error
    }
  }

  const deleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete job")

      deleteJobStore(jobId)
      toast.success("Offre supprimée")
    } catch (error) {
      console.error("Error deleting job:", error)
      toast.error("Erreur lors de la suppression")
      throw error
    }
  }

  const publishJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/publish`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to publish job")

      const data = await response.json()
      updateJob(jobId, data.job)
      toast.success("Offre publiée avec succès")
      return data.job
    } catch (error) {
      console.error("Error publishing job:", error)
      toast.error("Erreur lors de la publication")
      throw error
    }
  }

  const closeJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/close`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to close job")

      const data = await response.json()
      updateJob(jobId, data.job)
      toast.success("Offre fermée avec succès")
      return data.job
    } catch (error) {
      console.error("Error closing job:", error)
      toast.error("Erreur lors de la fermeture")
      throw error
    }
  }

  return {
    jobs,
    fetchJobs,
    createJob,
    updateJob: updateJobAPI,
    deleteJob,
    publishJob,
    closeJob,
  }
}
