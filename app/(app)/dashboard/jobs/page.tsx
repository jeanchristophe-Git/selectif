"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, FileEdit, Plus, Trash2, Upload, XCircle, Edit } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { JobsListSkeleton } from "@/components/ui/skeletons"
import { useMinimumLoading } from "@/lib/use-minimum-loading"

interface JobOffer {
  id: string
  title: string
  location: string
  jobType: string
  status: string
  createdAt: string
  publishedAt: string | null
  viewCount: number
  _count: {
    applications: number
  }
}

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<JobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const showLoading = useMinimumLoading(loading, 800)
  const [filter, setFilter] = useState<string>("ALL")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs")
      if (!response.ok) {
        throw new Error("Failed to fetch jobs")
      }
      const data = await response.json()
      setJobs(data.jobs)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Erreur lors du chargement des offres")
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/publish`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to publish job")
      }

      toast.success("Offre publiée avec succès")
      fetchJobs()
    } catch (error) {
      console.error("Error publishing job:", error)
      toast.error("Erreur lors de la publication")
    }
  }

  const handleClose = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/close`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de la fermeture")
      }

      toast.success("Offre fermée avec succès")
      fetchJobs()
    } catch (error) {
      console.error("Error closing job:", error)
      toast.error(error instanceof Error ? error.message : "Erreur lors de la fermeture")
    }
  }

  const confirmDelete = (jobId: string) => {
    setJobToDelete(jobId)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!jobToDelete) return

    try {
      const response = await fetch(`/api/jobs/${jobToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de la suppression")
      }

      toast.success("Offre supprimée avec succès")
      fetchJobs()
    } catch (error) {
      console.error("Error deleting job:", error)
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression")
    } finally {
      setDeleteDialogOpen(false)
      setJobToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="secondary">Brouillon</Badge>
      case "PUBLISHED":
        return <Badge className="bg-green-600 hover:bg-green-700">Publiée</Badge>
      case "CLOSED":
        return <Badge variant="destructive">Fermée</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredJobs = jobs.filter((job) => {
    if (filter === "ALL") return true
    return job.status === filter
  })

  if (showLoading) {
    return <JobsListSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes offres d'emploi</h1>
          <p className="text-muted-foreground">
            Gérez vos offres d'emploi et suivez leur performance
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle offre
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="ALL">Toutes ({jobs.length})</TabsTrigger>
          <TabsTrigger value="DRAFT">
            Brouillons ({jobs.filter((j) => j.status === "DRAFT").length})
          </TabsTrigger>
          <TabsTrigger value="PUBLISHED">
            Publiées ({jobs.filter((j) => j.status === "PUBLISHED").length})
          </TabsTrigger>
          <TabsTrigger value="CLOSED">
            Fermées ({jobs.filter((j) => j.status === "CLOSED").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
                <FileEdit className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Aucune offre</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  {filter === "ALL"
                    ? "Vous n'avez pas encore créé d'offre d'emploi."
                    : `Aucune offre avec le statut "${filter}".`}
                </p>
                {filter === "ALL" && (
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/jobs/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer votre première offre
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription>
                          {job.location} • {job.jobType}
                        </CardDescription>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{job.viewCount} vues</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileEdit className="h-4 w-4" />
                          <span>{job._count.applications} candidatures</span>
                        </div>
                        <div>
                          Créée le{" "}
                          {format(new Date(job.createdAt), "dd MMM yyyy", {
                            locale: fr,
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {job.status === "DRAFT" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/dashboard/jobs/${job.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handlePublish(job.id)}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Publier
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => confirmDelete(job.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </Button>
                          </>
                        )}
                        {job.status === "PUBLISHED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClose(job.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Fermer
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Voir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette offre d'emploi ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setJobToDelete(null)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
